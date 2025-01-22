import process from "node:process"

function assert_exhaustive(value: never): void
function assert_exhaustive(value: never, exception_message: string): ScriptException
function assert_exhaustive(value: never, exception_message?: string): ScriptException | undefined {
    log(["Vimeo log:", value])
    if (exception_message !== undefined) {
        return new ScriptException(exception_message)
    }
    return
}
type Runtime = "deno" | "bun" | "node" | "unknown"
function get_runtime (): Runtime {
    // @ts-expect-error Deno types not isntalled
    if (typeof Deno !== "undefined") {
        return "deno"
        // @ts-expect-error Bun types not isntalled
    } else if (typeof Bun !== "undefined") {
        return "bun"
    } else if (process.versions?.node !== undefined) {
        return "node"
    } else {
        return "unknown"
    }
}

export {
    assert_exhaustive,
    get_runtime,
    type Runtime
}