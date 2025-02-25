import {createAddress, ethSign, importEthWallet, signTransaction, verifyAddress} from "../wallet";
import { generateMnemonic, mnemonicToSeed } from "../wallet/bip/bip"


describe("eth wallet test", () => {
    test("create address", () => {
        const mnemonic = "immense insane round judge visit yard person fat twist elephant agree fiscal";
        // const mnemonic = "attend control tragic rough possible you coral jelly earn fringe bullet loop";
        const seed = mnemonicToSeed( { mnemonic: mnemonic, password: '' });
        const addressInfo = createAddress(seed.toString('hex'), "2")
        // {"privateKey":"0xc30e09a462d429803c0592db0c52a9cb0bdcbf80fb6cfe3ea351c9fd67e103c1","publicKey":"0x0332950879b045701d360b60272cd98de440f269f73c5d29d23302d89cfbd3a1a5","address":"0xee2E207D30383430a815390431298EBa3c1C8c2d"}
        console.log(addressInfo)
    })

    test("import eth wallet", () => {
        const privateKey = "c30e09a462d429803c0592db0c52a9cb0bdcbf80fb6cfe3ea351c9fd67e103c1";
        const addressInfo = importEthWallet(privateKey)
        // {"privateKey":"c30e09a462d429803c0592db0c52a9cb0bdcbf80fb6cfe3ea351c9fd67e103c1","address":"0xee2E207D30383430a815390431298EBa3c1C8c2d"}
        console.log(addressInfo)
    })

    test("verify address", () => {
        const isOk = verifyAddress("0xee2F207D30383430a815390431298EBa3c1C8c2d")
        console.log(isOk)
    })

    test("sign transaction", async () => {
        const rawHex =  await signTransaction({
            "privateKey": "84c8091e012ebd34c39de4f5f38405d02b84b12d47150d88828247d211b02b1d",
            "nonce": 0,
            "from": "0xebC13fe224620754A30825B8547883B6F8DA8575",
            "to": "0x421beE0C7C0e9f035863028bCC6E8a3535D1A062",
            "gasLimit": 91000,
            "amount": "0.01",
            "gasPrice": 195000000000,
            "decimal": 18,
            "chainId": 11155111,
            "tokenAddress": "0x00"
        })
        console.log(rawHex)
    })

    test("sign eip1559 transaction", async () => {
        // privateKey, nonce, from, to, gasLimit, gasPrice, amount, data, chainId, decimal, maxFeePerGas, maxPriorityFeePerGas, tokenAddress
        const rawHex =  ethSign({
            "privateKey": "84c8091e012ebd34c39de4f5f38405d02b84b12d47150d88828247d211b02b1d",
            "nonce": 3,
            "from": "0xebC13fe224620754A30825B8547883B6F8DA8575",
            "to": "0x421beE0C7C0e9f035863028bCC6E8a3535D1A062",
            "amount": "0.1",
            "gasLimit": 21000,
            "maxFeePerGas": 29000000000,
            "maxPriorityFeePerGas": 26000000000,
            "decimal": 18,
            "chainId": 11155111,
            "tokenAddress": "0x00"
        })
        console.log(rawHex)
    })


})

