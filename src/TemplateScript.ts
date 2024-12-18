//#region constants
import {
    type State,
    type TemplateSource,
    type Settings,
} from "./types.js"

const PLATFORM = "Tempalte" as const
const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0" as const

const HARDCODED_ZERO = 0 as const
const HARDCODED_EMPTY_STRING = "" as const
const EMPTY_AUTHOR = new PlatformAuthorLink(new PlatformID(PLATFORM, "", plugin.config.id), "", "")

const local_http = http
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
function enable(conf: SourceConfig, settings: Settings, savedState?: string | null) {
    if (IS_TESTING) {
        log("IS_TESTING true")
        log("logging configuration")
        log(conf)
        log("logging settings")
        log(settings)
        log("logging savedState")
        log(savedState)
    }
    local_settings = settings
    if (savedState !== null && savedState !== undefined) {
        const state: State = JSON.parse(savedState)
        local_state = state
    } else {
        local_state = {
            example_property: "a template",
            setting_value: local_settings.exampleSetting
        }
    }

    log(USER_AGENT, HARDCODED_ZERO, HARDCODED_EMPTY_STRING, EMPTY_AUTHOR)
}
//#endregion

function disable() {
    log("Spotify log: disabling")
}

function saveState() {
    return JSON.stringify(local_state)
}

//#region home
function getHome(): ContentPager {
    log(local_http.GET("https://www.google.com", {}, false))
    return new ContentPager([], false)
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
    log(["Spotify log:", value])
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
// used for unit testing in SpotifyScript.test.ts
export { milliseconds_to_WebVTT_timestamp }
