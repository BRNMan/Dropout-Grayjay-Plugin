import { createReadStream, createWriteStream } from "node:fs"
import { copyFile, rename, } from "node:fs/promises"
import * as readline from "node:readline"
import { EOL } from "node:os"
import { execFileSync } from "node:child_process"
import { argv } from "node:process"

async function modifyFile(filePath: string, offset: number) {
    const tempFilePath = `${filePath}.tmp`

    const readStream = createReadStream(filePath, 'utf-8')
    const writeStream = createWriteStream(tempFilePath, 'utf-8')
    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity
    })

    const lines: string[] = []

    for await (const line of rl) {
        lines.push(line)
    }

    rl.close();
    readStream.close()

    if (lines[lines.length - (1 + offset)]?.slice(0, 6) === "export") {
        const line = lines[lines.length - (1 + offset)]
        if (line === undefined) {
            throw new Error("panic")
        }
        // Comment out export line
        lines[lines.length - (1 + offset)] = `// ${line}`
    }

    for (const line of lines) {
        writeStream.write(line + EOL)
    }

    writeStream.end()

    writeStream.on('finish', () => {
        // Rename the temporary file to overwrite the original file
        console.log(rename(tempFilePath, filePath))
    })

    writeStream.on('error', (error) => {
        console.error('Error writing to file:', error)
    })
}
if (argv[2] !== undefined) {
    execFileSync("tsc", ["--mapRoot", argv[2], "--sourceRoot", argv[2]], { shell: true, encoding: 'utf-8', stdio: 'inherit' })
} else {
    execFileSync("tsc", { shell: true, encoding: 'utf-8', stdio: 'inherit' })
}
const promise1 = copyFile("src/script.ts", "deploy/script.ts")
const promise2 = copyFile("_dist/src/script.js", "deploy/script.js")
const promise3 = copyFile("_dist/src/script.js.map", "deploy/script.js.map")
await Promise.all([promise1, promise2, promise3])
await Promise.all([
    modifyFile("deploy/script.ts", 0),
    modifyFile("deploy/script.js", 1)
])