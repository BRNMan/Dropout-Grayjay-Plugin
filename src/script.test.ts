//#region imports
import { describe, test } from "node:test"
import assert from "node:assert"
// initializes global state
import "@kaidelorenzo/grayjay-polyfill"

import { milliseconds_to_WebVTT_timestamp } from "./script.js"
//#endregion

describe("script module", { skip: false }, () => {
    test("test disable", { skip: false }, () => {
        if (source.disable === undefined) {
            throw new Error("Missing disable method")
        }
        source.disable()
        assert.strictEqual("11", (11).toString())
    })
    test("test conversion", { skip: false }, () => {
        const milliseconds = 123499
        const timestamp = milliseconds_to_WebVTT_timestamp(milliseconds)
        assert.strictEqual(timestamp, "00:02:03.499")
    })
})
