const PLATFORM = "Tempalte";
const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0";
const HARDCODED_ZERO = 0;
const HARDCODED_EMPTY_STRING = "";
const EMPTY_AUTHOR = new PlatformAuthorLink(new PlatformID(PLATFORM, "", plugin.config.id), "", "");
const local_http = http;
// const local_utility = utility
// set missing constants
Type.Order.Chronological = "Latest releases";
Type.Order.Views = "Most played";
Type.Order.Favorites = "Most favorited";
Type.Feed.Playlists = "PLAYLISTS";
Type.Feed.Albums = "ALBUMS";
let local_settings;
/** State */
let local_state;
//#endregion
//#region source methods
const local_source = {
    enable,
    disable,
    saveState,
    getHome,
};
init_source(local_source);
function init_source(local_source) {
    for (const method_key of Object.keys(local_source)) {
        // @ts-expect-error assign to readonly constant source object
        source[method_key] = local_source[method_key];
    }
}
//#endregion
//#region enable
function enable(conf, settings, savedState) {
    if (IS_TESTING) {
        log("IS_TESTING true");
        log("logging configuration");
        log(conf);
        log("logging settings");
        log(settings);
        log("logging savedState");
        log(savedState);
    }
    local_settings = settings;
    if (savedState !== null && savedState !== undefined) {
        const state = JSON.parse(savedState);
        local_state = state;
    }
    else {
        local_state = {
            example_property: "a template",
            setting_value: local_settings.exampleSetting
        };
    }
    log(USER_AGENT, HARDCODED_ZERO, HARDCODED_EMPTY_STRING, EMPTY_AUTHOR);
}
//#endregion
function disable() {
    log("Spotify log: disabling");
}
function saveState() {
    return JSON.stringify(local_state);
}
//#region home
function getHome() {
    log(local_http.GET("https://www.google.com", {}, false));
    return new ContentPager([], false);
}
//#endregion
//#region utilities
/**
 * Converts seconds to the timestamp format used in WebVTT
 * @param seconds
 * @returns
 */
function milliseconds_to_WebVTT_timestamp(milliseconds) {
    return new Date(milliseconds).toISOString().substring(11, 23);
}
function assert_never(value) {
    log(value);
}
function log_passthrough(value) {
    log(value);
    return value;
}
function throw_if_not_ok(response) {
    if (!response.isOk) {
        throw new ScriptException(`Request failed [${response.code}] for ${response.url}`);
    }
    return response;
}
function assert_exhaustive(value, exception_message) {
    log(["Spotify log:", value]);
    if (exception_message !== undefined) {
        return new ScriptException(exception_message);
    }
    return;
}
function string_to_bytes(str) {
    const result = [];
    for (let i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i));
    }
    return new Uint8Array(result);
}
//#endregion
console.log(assert_never, log_passthrough, string_to_bytes, assert_exhaustive, throw_if_not_ok, milliseconds_to_WebVTT_timestamp);
// export statements are removed during build step
// used for unit testing in SpotifyScript.test.ts
// export { milliseconds_to_WebVTT_timestamp };
//# sourceMappingURL=http://localhost:8080/build/TemplateScript.js.map
