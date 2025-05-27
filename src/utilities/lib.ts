import process from "node:process"

function assert_exhaustive(value: never): void
function assert_exhaustive(value: never, exception_message: string): Error
function assert_exhaustive(value: never, exception_message?: string): Error | undefined {
    console.log(["Dropout log:", value])
    if (exception_message !== undefined) {
        return new Error(exception_message)
    }
    return
}
type Runtime = "deno" | "bun" | "node" | "unknown"
function get_runtime(): Runtime {
    // @ts-expect-error Deno types not isntalled
    if (typeof Deno !== "undefined") {
        return "deno"

    }
    // @ts-expect-error Bun types not isntalled
    else if (typeof Bun !== "undefined") {
        return "bun"
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    else if (process.versions?.node !== undefined) {
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
