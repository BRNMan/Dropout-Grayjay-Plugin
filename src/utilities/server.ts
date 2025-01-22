import { createServer } from "node:http"
import { networkInterfaces } from "node:os"
import { readFile } from "node:fs/promises"

const PORT = 8080

// Define a map of files to serve
const files = {
    "/build/script.js": {
        content: await readFile("build/script.js"),
        type: "application/javascript",
    },
    "/build/script.ts": {
        content: await readFile("build/script.ts"),
        type: "application/x-typescript",
    },
    "/build/script.js.map": {
        content: await readFile("build/script.js.map"),
        type: "application/json",
    },
    "/build/config.json": {
        content: await readFile("build/config.json"),
        type: "application/json",
    },
    "/build/icon.png": {
        content: await readFile("build/icon.png"),
        type: "image/png",
    },
} as const

function getLocalIPAddress(): string {
    const br = networkInterfaces()
    const network_devices = Object.values(br)
    if (network_devices !== undefined) {
        for (const network_interface of network_devices) {
            if (network_interface === undefined) {
                continue
            }
            for (const { address, family } of network_interface) {
                if (family === "IPv4" && address !== "127.0.0.1") {
                    return address
                }
            }

        }
    }
    throw new Error("panic")
}

createServer((req, res) => {
    const file = (() => {
        switch (req.url) {
            case "/build/script.js":
                return files[req.url]
            case "/build/script.ts":
                return files[req.url]
            case "/build/script.js.map":
                return files[req.url]
            case "/build/config.json":
                return files[req.url]
            case "/build/icon.png":
                return files[req.url]
            default:
                return undefined
        }
    })()

    if (file !== undefined) {
        res.writeHead(200, { "Content-Type": file.type })
        res.end(file.content)
        return
    }

    res.writeHead(404)
    res.end("File not found")
    return
}).listen(PORT, () => {
    console.log(`Server running at http://${getLocalIPAddress()}:${PORT}/build/config.json`)
})