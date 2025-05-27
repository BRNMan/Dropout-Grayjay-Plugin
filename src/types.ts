//#region custom types
export type Settings = unknown

export type DropoutSource = Required<Omit<Source<
    never,
    never,
    never,
    never,
    FeedType,
    FeedType,
    FeedType,
    Settings
>,
    "getHome"
    | "searchSuggestions"
    | "getComments"
    | "getSubComments"
    | "getSearchChannelContentsCapabilities"
    | "getLiveChatWindow"
    | "searchChannelContents"
    | "getContentRecommendations"
    | "search"
    | "getSearchCapabilities"
    | "getChannelCapabilities"
    | "searchChannels"
    | "searchPlaylists"
    | "getPlaybackTracker"
    | "getUserPlaylists"
    | "getUserSubscriptions"
    | "getShorts"
>>

export type State = {
    readonly is_subscribed: boolean
}
//#endregion

//#region JSON types
export type ShowSeasonsResponse = {
    readonly _embedded: {
        readonly items: Season[]
    }
}
export type Season = {
    readonly title: string
    readonly episodes_count: number
    readonly thumbnail: {
        readonly source: string
    }
    readonly season_number: number
    readonly id: number
    readonly slug: string
    readonly _links: {
        readonly episodes: {
            readonly href: string
        }
    }
    readonly updated_at: string
}
export type ShowResponse = {
    readonly title: string
    readonly description: string
    readonly thumbnail: {
        readonly source: string
    }
    readonly slug: string
}
export type SeasonEpisodesResponse = {
    readonly _embedded: {
        readonly items: LimitedVideo[]
    }
    readonly _links: {
        readonly next: {
            readonly href: null | string
        }
    }
}
export type CustomerResponse = {
    readonly subscribed_to_site: boolean
}
export interface VideoResponse extends LimitedVideo {
    readonly canonical_collection: {
        readonly id: number
        readonly parent: {
            readonly title: string
            readonly slug: string
            readonly thumbnail: {
                readonly source: string
            }
        }
    } | null
}
export interface LimitedVideo {
    readonly description: string
    readonly duration: {
        readonly seconds: number
    }
    readonly title: string
    readonly thumbnail: {
        readonly source: string
    }
    readonly time_available: string
    /** the url slug part after videos/ */
    readonly url: string
    readonly is_free: boolean
    readonly tracks: {
        readonly subtitles: {
            readonly label: string
            readonly _links: {
                readonly vtt: {
                    readonly href: string
                }
            }
        }[]
    }
    readonly episode_number: number
    readonly id: number
}
export type FilesResponse = [{
    readonly codec: "h264"
    readonly mime_type: "application/dash+xml"
    readonly _links: {
        readonly source: {
            readonly href: string
        }
    }
}]
//#endregion
