//#region imports
import { describe, test } from "node:test"
import assert from "node:assert"
// initializes global state
import "@kaidelorenzo/grayjay-polyfill"

// initializes source object
import "../src/script.js"
//#endregion

await Promise.allSettled([describe("script module integration", { skip: false }, () => {
    return test("test disable", { skip: false }, () => {
        if (source.disable === undefined) {
            throw new Error("Missing disable method")
        }
        source.disable()
        assert.strictEqual("11", (11).toString())
    })
})])
