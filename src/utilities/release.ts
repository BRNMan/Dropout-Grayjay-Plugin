import { execFileSync } from "node:child_process"
import { assert_exhaustive, get_runtime, type Runtime } from "./lib.js"

const env: Runtime = get_runtime()

update_packages(env)
build(env)
lint(env)
test(env)

function update_packages(env: Runtime) {
    switch (env) {
        case "deno":
            console.log("package installation not currently supported in Deno because of dependency on git repo package")
            break
        case "bun":
            execFileSync("bun", ["install"], { stdio: 'inherit' })
            break
        case "node":
            execFileSync("npm", ["update"], { shell: true, encoding: 'utf-8', stdio: 'inherit' })
            break
        case "unknown":
            throw new Error("unknown environment")
        default:
            assert_exhaustive(env)
            break
    }
}
function build(env: Runtime){
    switch (env) {
        case "deno":
            execFileSync("deno", ["task", "build:deno"], { stdio: 'inherit' })
            break
        case "bun":
            execFileSync("bun", ["run", "build:bun"], { stdio: 'inherit' })
            break
        case "node":
            execFileSync("npm", ["run", "build:node"], { shell: true, encoding: 'utf-8', stdio: 'inherit' })
            break
        case "unknown":
            throw new Error("unknown environment")
        default:
            assert_exhaustive(env)
            break
    }
}
function lint(env: Runtime){
    switch (env) {
        case "deno":
            execFileSync("deno", ["task", "lint:deno"], { stdio: 'inherit' })
            break
        case "bun":
            execFileSync("bun", ["run", "lint:bun"], { stdio: 'inherit' })
            break
        case "node":
            execFileSync("npm", ["run", "lint:node"], { shell: true, encoding: 'utf-8', stdio: 'inherit' })
            break
        case "unknown":
            throw new Error("unknown environment")
        default:
            assert_exhaustive(env)
            break
    }
}
function test(env: Runtime){
    switch (env) {
        case "deno":
            console.log("tests not currently supported in Deno")
            break
        case "bun":
            console.log("tests not currently supported in Bun")
            break
        case "node":
            execFileSync("npm", ["test"], { shell: true, encoding: 'utf-8', stdio: 'inherit' })
            break
        case "unknown":
            throw new Error("unknown environment")
        default:
            assert_exhaustive(env)
            break
    }
}
