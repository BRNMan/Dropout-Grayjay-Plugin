import {
    createPrivateKey,
    createSign,
    createPublicKey
} from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { argv } from "node:process"

function sign(config_path: string, script_path: string, private_key_path: string, private_key_passphrase: string): void {
    const private_key_pem = readFileSync(private_key_path)

    // Create private key with passphrase
    const private_key = createPrivateKey({
        key: private_key_pem,
        format: 'pem',
        passphrase: private_key_passphrase
    })

    const script_contents = readFileSync(script_path)

    const sign = createSign('SHA512')
    sign.update(script_contents)
    const signature = sign.sign(private_key, "base64")

    const der_buffer = createPublicKey(private_key)
        .export({
            type: 'spki',
            format: 'der'
        })

    const config: {
        scriptSignature?: string
        scriptPublicKey?: string
    } = JSON.parse(readFileSync(config_path).toString("utf8"))
    config.scriptSignature = signature
    config.scriptPublicKey = der_buffer.toString('base64')

    writeFileSync(config_path, JSON.stringify(config, null, 4))
}

if (argv[2] === undefined || argv[3] === undefined || argv[4] === undefined || argv[5] === undefined) {
    console.error("missing arguments")
    process.exit(1)
} else {
    sign(argv[2], argv[3], argv[4], argv[5])
}
