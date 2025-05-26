//#region imports
import { describe, test } from "node:test"
import assert from "node:assert"
// initializes global state
import "@kaidelorenzo/grayjay-polyfill"

import { milliseconds_to_WebVTT_timestamp } from "./script.js"
//#endregion

await Promise.allSettled([describe("script module unit", { skip: false }, async () => {
    await Promise.allSettled([
        test("test conversion", { skip: false }, () => {
            const milliseconds = 123499
            const timestamp = milliseconds_to_WebVTT_timestamp(milliseconds)
            assert.strictEqual(timestamp, "00:02:03.499")
        })
    ])
})])
