//#region constants
import {
    type State,
    type TemplateSource,
    type Settings,
    VimeoConfigResponse,
} from "./types.js"

const PLATFORM = "Template" as const
//const URL_BASE = "https://www.dropout.tv";
const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0" as const

const HARDCODED_ZERO = 0 as const
const HARDCODED_EMPTY_STRING = "" as const
const EMPTY_AUTHOR = new PlatformAuthorLink(new PlatformID(PLATFORM, "", plugin.config.id), "", "")

//const local_http = http
// const local_utility = utility

// set missing constants
Type.Order.Chronological = "Latest releases"
Type.Order.Views = "Most played"
Type.Order.Favorites = "Most favorited"

Type.Feed.Playlists = "PLAYLISTS"
Type.Feed.Albums = "ALBUMS"

let local_settings: Settings
/** State */
let local_state: State
//#endregion

//#region source methods
const local_source: TemplateSource = {
    enable,
    disable,
    saveState,
    getHome,
    isContentDetailsUrl,
    getContentDetails,
}
init_source(local_source)
function init_source<
    T extends { readonly [key: string]: string },
    S extends string,
    ChannelTypes extends FeedType,
    SearchTypes extends FeedType,
    ChannelSearchTypes extends FeedType
>(local_source: Source<T, S, ChannelTypes, SearchTypes, ChannelSearchTypes, Settings>) {
    for (const method_key of Object.keys(local_source)) {
        // @ts-expect-error assign to readonly constant source object
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
    local_settings = settings
    if (saved_state !== null && saved_state !== undefined) {
        const state: State = JSON.parse(saved_state)
        local_state = state
    } else {
        local_state = {
            example_property: "a template",
            setting_value: local_settings.exampleSetting
        }
    }

    log(USER_AGENT, HARDCODED_EMPTY_STRING, EMPTY_AUTHOR)
}
//#endregion

function disable() {
    log("Template log: disabling")
}

function saveState() {
    return JSON.stringify(local_state)
}

//#region home
function getHome(): ContentPager {

    const url = "https://example.com"

    return new ContentPager(
        [new PlatformVideo({
            id: new PlatformID(PLATFORM, "a video id", plugin.config.id),
            name: "a video title",
            author: new PlatformAuthorLink(
                new PlatformID(PLATFORM, "a creator id", plugin.config.id),
                "a creator name",
                "a creator page url",
                "a creator thumbnail url",
                HARDCODED_ZERO
            ),
            datetime: HARDCODED_ZERO,
            url,
            thumbnails: new Thumbnails([]),
            duration: HARDCODED_ZERO,
            viewCount: HARDCODED_ZERO,
            isLive: false,
            shareUrl: url,
        })],
        false
    )
}
//#endregion

//#region content
function isContentDetailsUrl(_url: string): boolean {
    return true;
}
function getContentDetails(url: string): PlatformContentDetails {
    if(!bridge.isLoggedIn()) {
        throw new LoginRequiredException("Please log into Dropout.");
    }
    const tokenHTML = http.GET("https://www.dropout.tv/browse",{},true);
    const token = tokenHTML.body.match(/token:\s*"(.*)"/)?.[1];
    if(token === undefined) {
        throw new ScriptException("Couldn't login. Please restart your computer1.");
    }

    const embedVideoURL = http.GET(url,{"Referer": "https://www.dropout.tv/"},true).body.match(/embed_url:\s*"(.*?)"/)?.[1];
    
    if(embedVideoURL === undefined) {
        throw new ScriptException("Couldn't login. Please restart your computer2.");
    }

    const configResponse = JSON.parse(http.GET(embedVideoURL.replace(/&amp;/g, '&'),{"Referer": "https://www.dropout.tv/"},false).body.match(/"config_url":(".*?")/)?.[1]!);
    if(configResponse === undefined) {
        throw new ScriptException("Couldn't login. Please restart your computer3.");
    }

    const configURL: VimeoConfigResponse = JSON.parse(http.GET(configResponse,{},false).body);
    console.log(configURL);

    return new PlatformVideoDetails({
        description: "",
        video: new VideoSourceDescriptor([new DashSource({url: configURL.request.files.dash.cdns.akfire_interconnect_quic.url})]),
        rating: new RatingLikes(10),
        subtitles: [],
        getContentRecommendations: () => {return new ContentPager([], false)},
        thumbnails: new Thumbnails([]),
        duration: 10,
        viewCount: 10,
        isLive: false,
        shareUrl: "share.com",
        /** unix time */
        datetime: 10,
        id: new PlatformID(PLATFORM,"VIDEO_ID",plugin.config.id),
        name: "POOPYPOOP",
        /** the array of Thumbnails is for posts */
        author: new PlatformAuthorLink(
            new PlatformID(PLATFORM,"CREATOR_ID",plugin.config.id),
            "DROPOUT",
            "dropout.tv",
        ),
        url,
    });
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
        throw new ScriptException(`Request failed [${response.code}] for ${response.url}`)
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
