//#region constants
import {
    type State,
    type DropoutSource,
    type Settings,
    type CustomerResponse,
    type VideoResponse,
    type FilesResponse,
    type SeasonEpisodesResponse,
    type LimitedVideo,
    type ShowResponse,
    type ShowSeasonsResponse,
    type Season,
} from "./types.js"

// https://dev.vhx.tv/docs/api/

const PLATFORM = "Dropout" as const
const URL_BASE = "https://www.dropout.tv"
const API_BASE = "https://api.vhx.com"

const CONTENT_REGEX = /^https:\/\/www\.dropout\.tv\/(|[0-9a-z-]+(|\/season:[0-9]+)\/)videos\/[0-9a-z-]+$/
const CHANNEL_REGEX = /^https:\/\/www\.dropout\.tv\/([0-9a-z-]+)($|\/)/
const NOT_CHANNEL_REGEX = /^https:\/\/www\.dropout\.tv\/(browse|series)$/
const PLAYLIST_REGEX = /^https:\/\/www\.dropout\.tv\/[[0-9a-z-]+\/season:([0-9]+)($|\/)/

const BEARER_TOKEN_REGEX = /token: "([-._0-9a-zA-Z]+?)",/
const VIDEO_ID_REGEX = /id: "([0-9]+)",/
const CURRENT_USER_REGEX = /window\._current_user = ({[\s\S]+?});/
const COLLECTION_ID_REGEX = /,"COLLECTION_ID":([0-9]+),/

const HARDCODED_THUMBNAIL_QUALITY = 1080 as const
const EMPTY_AUTHOR = new PlatformAuthorLink(new PlatformID(PLATFORM, "", plugin.config.id), "Dropout", "")

const local_http = http
// const local_utility = utility

// let local_settings: Settings 
/** State */
let local_state: State
//#endregion

//#region source methods
const local_source: DropoutSource = {
    enable,
    disable,
    saveState,
    isContentDetailsUrl,
    getContentDetails,
    isChannelUrl,
    getChannel,
    getChannelContents,
    getChannelPlaylists,
    isPlaylistUrl,
    getPlaylist
}
init_source(local_source)
function init_source<
    ChannelTypes extends FeedType,
    SearchTypes extends FeedType,
    ChannelSearchTypes extends FeedType
>(local_source: Source<never, never, never, never, ChannelTypes, SearchTypes, ChannelSearchTypes, Settings>) {
    for (const method_key of Object.keys(local_source)) {
        // @ts-expect-error assign to readonly constant source object
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        source[method_key] = local_source[method_key]
    }
}
//#endregion

//#region enable
function enable(conf: SourceConfig, settings: Settings, saved_state?: string | null) {
    if (IS_TESTING) {
        log("IS_TESTING true")
        log("logging configuration")
        log(conf)
        log("logging settings")
        log(settings)
        log("logging savedState")
        log(saved_state)
    }
    // local_settings = settings
    if (saved_state !== null && saved_state !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const state: State = JSON.parse(saved_state)
        local_state = state
    } else {
        const is_subscribed = (() => {
            if (bridge.isLoggedIn()) {
                const html = local_http.GET("https://www.dropout.tv/browse", {}, true).body
                const match_result = html.match(CURRENT_USER_REGEX)

                if (match_result?.[1] === undefined) {
                    throw new ScriptException("unable to load user id")
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const current_user: { id: number } = JSON.parse(match_result[1])

                const token_match_result = html.match(BEARER_TOKEN_REGEX)

                if (token_match_result?.[1] === undefined) {
                    throw new ScriptException("unable to load auth token")
                }

                const bearer_token = token_match_result[1]

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const customer_response: CustomerResponse = JSON.parse(local_http.GET(
                    `${API_BASE}/customers/${current_user.id.toString()}`,
                    { Authorization: `Bearer ${bearer_token}` },
                    false
                ).body)

                return customer_response.subscribed_to_site
            } else {
                return false
            }
        })()

        local_state = {
            is_subscribed
        }
    }
}
//#endregion

function disable() {
    log("Dropout log: disabling")
}

function saveState() {
    return JSON.stringify(local_state)
}

//#region content
function isContentDetailsUrl(url: string): boolean {
    return CONTENT_REGEX.test(url)
}
function getContentDetails(url: string): PlatformContentDetails {
    const html = local_http.GET(url, {}, true).body

    const video_id = html.match(VIDEO_ID_REGEX)?.[1]
    const bearer_token = html.match(BEARER_TOKEN_REGEX)?.[1]

    if (video_id === undefined || bearer_token === undefined) {
        throw new ScriptException("unable to aquire video id")
    }

    const responses = local_http
        .batch()
        .GET(
            `${API_BASE}/videos/${video_id}`,
            { Authorization: `Bearer ${bearer_token}` },
            false
        )
        .GET(
            `${API_BASE}/videos/${video_id}/files?format=mpd&quality=adaptive`,
            { Authorization: `Bearer ${bearer_token}` },
            false
        )
        .execute()

    if (responses[0] === undefined || responses[1] === undefined) {
        throw new ScriptException("unreachable")
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const video_response: VideoResponse = JSON.parse(responses[0].body)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const files_response: FilesResponse = JSON.parse(responses[1].body)

    if (!local_state.is_subscribed && !video_response.is_free) {
        if (bridge.isLoggedIn()) {
            throw new ScriptException("subscribe to watch this episode")
        } else {
            throw new LoginRequiredException("login to watch this episode")
        }
    }

    const video_slug = video_response.url
    const simple_url = `${URL_BASE}/videos/${video_slug}`

    const series = video_response.canonical_collection === null ? EMPTY_AUTHOR : new PlatformAuthorLink(
        new PlatformID(PLATFORM, video_response.canonical_collection.parent.slug, plugin.config.id),
        video_response.canonical_collection.parent.title,
        `${URL_BASE}/${video_response.canonical_collection.parent.slug}`,
        video_response.canonical_collection.parent.thumbnail.source
    )

    return new PlatformVideoDetails({
        description: video_response.description,
        video: new VideoSourceDescriptor([new DashSource({
            url: files_response[0]._links.source.href
        })]),
        rating: new RatingLikes(0),
        subtitles: video_response.tracks.subtitles.map(subtitle => ({
            name: subtitle.label,
            url: subtitle._links.vtt.href,
            format: "text/vtt"
        })),
        getContentRecommendations: () => {
            if (video_response.canonical_collection === null) {
                return new ContentPager([], false)
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const season_items_response: SeasonEpisodesResponse = JSON.parse(local_http.GET(
                `${API_BASE}/collections/${video_response.canonical_collection.id.toString()}/items`,
                { Authorization: `Bearer ${bearer_token}` },
                false
            ).body)

            const video_index = season_items_response._embedded.items.findIndex(video => video.id === video_response.id)

            if (video_index === -1) {
                return new ContentPager([], false)
            }

            const elements_after_index = season_items_response._embedded.items.slice(video_index + 1)

            return new ContentPager(
                elements_after_index.map(video => format_video(video, series)),
                false
            )
        },
        thumbnails: new Thumbnails([new Thumbnail(video_response.thumbnail.source, HARDCODED_THUMBNAIL_QUALITY)]),
        duration: video_response.duration.seconds,
        isLive: false,
        shareUrl: simple_url,
        datetime: new Date(video_response.time_available).getTime() / 1000,
        id: new PlatformID(PLATFORM, video_slug, plugin.config.id),
        name: video_response.title,
        author: series,
        url: simple_url
    })
}
function format_video(video: LimitedVideo, show: PlatformAuthorLink): PlatformVideo {
    const slug = video.url
    const simple_url = `${URL_BASE}/videos/${slug}`

    return new PlatformVideo({
        thumbnails: new Thumbnails([new Thumbnail(video.thumbnail.source, HARDCODED_THUMBNAIL_QUALITY)]),
        duration: video.duration.seconds,
        isLive: false,
        shareUrl: simple_url,
        datetime: new Date(video.time_available).getTime() / 1000,
        id: new PlatformID(PLATFORM, slug, plugin.config.id),
        name: video.title,
        author: show,
        url: simple_url
    })
}
//#endregion

//#region channel
function isChannelUrl(url: string) {
    return CHANNEL_REGEX.test(url) && !NOT_CHANNEL_REGEX.test(url) && !CONTENT_REGEX.test(url) && !PLAYLIST_REGEX.test(url)
}
function getChannel(url: string) {
    const html = local_http.GET(url, {}, false).body
    const show_id = html.match(COLLECTION_ID_REGEX)?.[1]
    const bearer_token = html.match(BEARER_TOKEN_REGEX)?.[1]

    if (show_id === undefined || bearer_token === undefined) {
        throw new ScriptException("unable to aquire show id")
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const show_response: ShowResponse = JSON.parse(local_http.GET(
        `${API_BASE}/collections/${show_id}`,
        { Authorization: `Bearer ${bearer_token}` },
        false
    ).body)

    return new PlatformChannel({
        id: new PlatformID(PLATFORM, show_response.slug, plugin.config.id),
        name: show_response.title,
        thumbnail: show_response.thumbnail.source,
        description: show_response.description,
        url: `${URL_BASE}/${show_response.slug}`
    })
}
function getChannelContents(url: string): SeriesContentPager {
    const html = local_http.GET(url, {}, false).body
    const show_id = html.match(COLLECTION_ID_REGEX)?.[1]
    const bearer_token = html.match(BEARER_TOKEN_REGEX)?.[1]

    if (show_id === undefined || bearer_token === undefined) {
        throw new ScriptException("unable to aquire show id")
    }

    const responses = local_http
        .batch()
        .GET(
            `${API_BASE}/collections/${show_id}/items`,
            { Authorization: `Bearer ${bearer_token}` },
            false
        )
        .GET(
            `${API_BASE}/collections/${show_id}`,
            { Authorization: `Bearer ${bearer_token}` },
            false
        )
        .execute()

    if (responses[0] === undefined || responses[1] === undefined) {
        throw new ScriptException("unreachable")
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const show_seasons_response: ShowSeasonsResponse = JSON.parse(responses[0].body)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const show: ShowResponse = JSON.parse(responses[1].body)

    const author = new PlatformAuthorLink(
        new PlatformID(PLATFORM, show.slug, plugin.config.id),
        show.title,
        `${URL_BASE}/${show.slug}`,
        show.thumbnail.source
    )

    return new SeriesContentPager(show_seasons_response._embedded.items.reverse(), bearer_token, author)
}
class SeriesContentPager extends ContentPager {
    constructor(private readonly seasons: Season[], private readonly bearer_token: string, private readonly show: PlatformAuthorLink) {
        const season = seasons.shift()
        if (season === undefined) {
            throw new ScriptException("no episodes")
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const season_episodes_response: SeasonEpisodesResponse = JSON.parse(local_http.GET(
            season._links.episodes.href,
            { Authorization: `Bearer ${bearer_token}` },
            false
        ).body)

        super(season_episodes_response._embedded.items.map(episode => format_video(episode, show)).reverse(), seasons.length !== 0)
    }
    override nextPage(this: SeriesContentPager): SeriesContentPager {
        const season = this.seasons.shift()
        if (season === undefined) {
            this.results = []
            this.hasMore = false
            return this
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const season_episodes_response: SeasonEpisodesResponse = JSON.parse(local_http.GET(
            season._links.episodes.href,
            { Authorization: `Bearer ${this.bearer_token}` },
            false
        ).body)

        this.results = season_episodes_response._embedded.items.map(episode => format_video(episode, this.show)).reverse()
        this.hasMore = this.seasons.length !== 0

        return this
    }
    override hasMorePagers(this: SeriesContentPager): boolean {
        return this.hasMore
    }
}
function getChannelPlaylists(url: string): PlaylistPager {
    const html = local_http.GET(url, {}, false).body
    const show_id = html.match(COLLECTION_ID_REGEX)?.[1]
    const bearer_token = html.match(BEARER_TOKEN_REGEX)?.[1]

    if (show_id === undefined || bearer_token === undefined) {
        throw new ScriptException("unable to aquire show id")
    }

    const responses = local_http
        .batch()
        .GET(
            `${API_BASE}/collections/${show_id}/items`,
            { Authorization: `Bearer ${bearer_token}` },
            false
        )
        .GET(
            `${API_BASE}/collections/${show_id}`,
            { Authorization: `Bearer ${bearer_token}` },
            false
        )
        .execute()

    if (responses[0] === undefined || responses[1] === undefined) {
        throw new ScriptException("unreachable")
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const show_seasons_response: ShowSeasonsResponse = JSON.parse(responses[0].body)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const show: ShowResponse = JSON.parse(responses[1].body)

    const author = new PlatformAuthorLink(
        new PlatformID(PLATFORM, show.slug, plugin.config.id),
        show.title,
        `${URL_BASE}/${show.slug}`,
        show.thumbnail.source
    )

    return new PlaylistPager(
        show_seasons_response._embedded.items.map(
            season => new PlatformPlaylist(format_season(season, author, `${URL_BASE}/${show.slug}/season:${season.season_number.toString()}`))
        ),
        false
    )
}
//#endregion

//#region playlists
function isPlaylistUrl(url: string) {
    return PLAYLIST_REGEX.test(url)
}
function getPlaylist(url: string) {
    const html = local_http.GET(url, {}, false).body
    const show_id = html.match(COLLECTION_ID_REGEX)?.[1]
    const bearer_token = html.match(BEARER_TOKEN_REGEX)?.[1]

    if (show_id === undefined || bearer_token === undefined) {
        throw new ScriptException("unable to aquire show id")
    }

    const season_number = url.match(PLAYLIST_REGEX)?.[1]

    if (season_number === undefined) {
        throw new ScriptException("unreachable")
    }

    const responses = local_http
        .batch()
        .GET(
            `${API_BASE}/collections/${show_id}/items`,
            { Authorization: `Bearer ${bearer_token}` },
            false
        )
        .GET(
            `${API_BASE}/collections/${show_id}`,
            { Authorization: `Bearer ${bearer_token}` },
            false
        )
        .execute()

    if (responses[0] === undefined || responses[1] === undefined) {
        throw new ScriptException("unreachable")
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const show_seasons_response: ShowSeasonsResponse = JSON.parse(responses[0].body)

    const season = show_seasons_response._embedded.items.find(season => season.season_number.toString() === season_number)

    if (season === undefined) {
        throw new ScriptException("error loading season")
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const show: ShowResponse = JSON.parse(responses[1].body)

    const simple_url = `${URL_BASE}/${show.slug}/season:${season_number}`

    const author = new PlatformAuthorLink(
        new PlatformID(PLATFORM, show.slug, plugin.config.id),
        show.title,
        `${URL_BASE}/${show.slug}`,
        show.thumbnail.source
    )

    return new PlatformPlaylistDetails({
        ...format_season(season, author, simple_url),
        contents: new SeasonEpisodesPager(season.id, bearer_token, author)
    })
}
function format_season(season: Season, show: PlatformAuthorLink, url: string) {
    return {
        id: new PlatformID(PLATFORM, season.slug, plugin.config.id),
        name: season.title,
        thumbnails: new Thumbnails([new Thumbnail(season.thumbnail.source, HARDCODED_THUMBNAIL_QUALITY)]),
        author: show,
        datetime: new Date(season.updated_at).getTime() / 1000,
        url,
        videoCount: season.episodes_count,
        thumbnail: season.thumbnail.source
    }
}
class SeasonEpisodesPager extends VideoPager {
    private next_url: string | null
    constructor(season_id: number, private readonly bearer_token: string, private readonly show: PlatformAuthorLink) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const season_episodes_response: SeasonEpisodesResponse = JSON.parse(local_http.GET(
            `${API_BASE}/collections/${season_id.toString()}/items`,
            { Authorization: `Bearer ${bearer_token}` },
            false
        ).body)

        super(season_episodes_response._embedded.items.map(episode => format_video(episode, show)), season_episodes_response._links.next.href !== null)

        this.next_url = season_episodes_response._links.next.href
    }
    override nextPage(this: SeasonEpisodesPager): SeasonEpisodesPager {
        if (this.next_url === null) {
            throw new ScriptException("unreachable")
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const season_episodes_response: SeasonEpisodesResponse = JSON.parse(local_http.GET(
            this.next_url,
            { Authorization: `Bearer ${this.bearer_token}` },
            false
        ).body)

        this.results = season_episodes_response._embedded.items.map(episode => format_video(episode, this.show))
        this.hasMore = season_episodes_response._links.next.href !== null

        this.next_url = season_episodes_response._links.next.href

        return this
    }
    override hasMorePagers(this: SeasonEpisodesPager): boolean {
        return this.hasMore
    }
}
//#endregion

//#region utilities
/**
 * Converts seconds to the timestamp format used in WebVTT
 * @param seconds 
 * @returns 
 */
function milliseconds_to_WebVTT_timestamp(milliseconds: number) {
    return new Date(milliseconds).toISOString().substring(11, 23)
}
function assert_never(value: never) {
    log(value)
}
function log_passthrough<T>(value: T): T {
    log(value)
    return value
}
function throw_if_not_ok<T>(response: BridgeHttpResponse<T>): BridgeHttpResponse<T> {
    if (!response.isOk) {
        throw new ScriptException(`Request failed [${response.code.toString()}] for ${response.url}`)
    }
    return response
}
function assert_exhaustive(value: never): void
function assert_exhaustive(value: never, exception_message: string): ScriptException
function assert_exhaustive(value: never, exception_message?: string): ScriptException | undefined {
    log(["Template log:", value])
    if (exception_message !== undefined) {
        return new ScriptException(exception_message)
    }
    return
}
function string_to_bytes(str: string): Uint8Array {
    const result = []
    for (let i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i))
    }
    return new Uint8Array(result)
}
//#endregion

console.log(assert_never, log_passthrough, string_to_bytes, assert_exhaustive, throw_if_not_ok, milliseconds_to_WebVTT_timestamp)
// export statements are removed during build step
// used for unit testing in TemplateScript.test.ts
export { milliseconds_to_WebVTT_timestamp }
