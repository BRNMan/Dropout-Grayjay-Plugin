//#region custom types
export type Settings = {
    exampleSetting: boolean
}

export type TemplateSource = Required<Omit<Source<
    { readonly [key: string]: string },
    string,
    FeedType,
    FeedType,
    FeedType,
    Settings
>,
    "searchSuggestions"
    | "getComments"
    | "getSubComments"
    | "getSearchChannelContentsCapabilities"
    | "getLiveChatWindow"
    | "searchChannelContents"
    | "getContentRecommendations"
    | "search"
    | "getSearchCapabilities"
    | "isChannelUrl"
    | "getChannel"
    | "getChannelContents"
    | "getChannelCapabilities"
    | "searchChannels"
    | "isPlaylistUrl"
    | "getPlaylist"
    | "searchPlaylists"
    | "getChannelPlaylists"
    | "getPlaybackTracker"
    | "getUserPlaylists"
    | "getUserSubscriptions"
>>

export type State = {
    readonly example_property: string
    readonly setting_value: boolean
}
//#endregion

//#region JSON types
//#endregion
