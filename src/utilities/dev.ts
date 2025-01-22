import { execFileSync } from "node:child_process"
import { assert_exhaustive, get_runtime, type Runtime } from "./lib.js"

const env: Runtime = get_runtime()

debug_build(env)
start_server(env)

function debug_build(env: Runtime) {
    switch (env) {
        case "deno":
            execFileSync("deno", ["task", "debug-build:deno"], { stdio: 'inherit' })
            break
        case "bun":
            execFileSync("bun", ["run", "debug-build:bun"], { stdio: 'inherit' })
            break
        case "node":
            execFileSync("npm", ["run", "debug-build:node"], { shell: true, encoding: 'utf-8', stdio: 'inherit' })
            break
        case "unknown":
            throw new Error("unknown environment")
        default:
            assert_exhaustive(env)
            break
    }
}
function start_server(env: Runtime) {
    switch (env) {
        case "deno":
            execFileSync("deno", ["run", "--allow-read", "--allow-net", "--allow-sys", "src/utilities/server.js"], { stdio: 'inherit' })
            break
        case "bun":
            execFileSync("bun", ["run", "src/utilities/server.js"], { stdio: 'inherit' })
            break
        case "node":
            execFileSync("node", ["src/utilities/server.js"], { stdio: 'inherit' })
            break
        case "unknown":
            throw new Error("unknown environment")
        default:
            assert_exhaustive(env)
            break
    }
}
