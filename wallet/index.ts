const ethers = require("ethers" )
import { Interface } from '@ethersproject/abi';
const BigNumber = require('BigNumber.js');
import {FeeMarketEIP1559Transaction, Transaction} from '@ethereumjs/tx'
import Common from '@ethereumjs/common'


// ETH SDK 支持的 EVM链
const SUPPORT_CHAIN_NETWORK = {
    1: 'Ethereum',
    324: 'ZksyncEra',
    42161: 'Arbitrum',
    42170: 'ArbitrumNova',
    5000: 'Mantle',
    56: 'BscChain',
    128: 'Heco',
    137: 'Polygon',
    10001: 'EthereumPow',
    61: 'EthereumClassic',
    8217: 'klay',
    1101: 'PolygonZk',
    66: 'OkexChain',
    9001: 'Evmos',
    10: 'Optimism',
    59144: 'Linea',
    8453: 'Base',
    17000: 'Holesky',
    11155111: 'Sepolia'
};

export function numberToHex(value: any) {
    const number = BigNumber(value);
    const result = number.toString(16);
    return '0x' + result;
}

export function createAddress(seedHex: string, addressIndex: string)  {
   const rootNode = ethers.utils.HDNode.fromSeed(Buffer.from(seedHex, "hex"))
    const {
        privateKey,
        publicKey,
        address
    } = rootNode.derivePath("m/44'/60'/0'/0/" + addressIndex + '')
    return JSON.stringify({
        privateKey,
        publicKey,
        address
    })
}

export function importEthWallet(privateKey: string) {
    const wallet = new ethers.Wallet(Buffer.from(privateKey, "hex"))
    return JSON.stringify({
        privateKey,
        address: wallet.address
    })
}

export function publicKeyToAddress(publicKey: string) {
    return ethers.utils.computeAddress(publicKey)
}

export function verifyAddress(address: string) {
    return ethers.utils.isAddress(address)
}

export async function signTransaction(params: any) {
    const { privateKey, nonce, from, to, gasLimit, gasPrice, amount, data, chainId, decimal, maxFeePerGas, maxPriorityFeePerGas, tokenAddress } = params;
    // @ts-ignore
    if (!SUPPORT_CHAIN_NETWORK[chainId]) {
        throw new Error(`chain id ${chainId} is not support.`);
    }
    const wallet = new ethers.Wallet(Buffer.from(privateKey, 'hex'));
    const txData: any = {
        nonce: ethers.utils.hexlify(nonce),
        from,
        to,
        gasLimit: ethers.utils.hexlify(gasLimit),
        value: ethers.utils.hexlify(ethers.utils.parseUnits(amount, decimal)),
        chainId
    };
    if (maxFeePerGas && maxPriorityFeePerGas) {
        txData.maxFeePerGas = numberToHex(maxFeePerGas);
        txData.maxPriorityFeePerGas = numberToHex(maxPriorityFeePerGas);
    } else {
        txData.gasPrice = ethers.utils.hexlify(gasPrice);
    }
    if (tokenAddress && tokenAddress !== '0x00') {
        const ABI = [
            'function transfer(address to, uint amount)'
        ];
        const iface = new Interface(ABI);
        txData.data = iface.encodeFunctionData('transfer', [to, ethers.utils.hexlify(ethers.utils.parseUnits(amount, decimal))]);
        txData.to = tokenAddress;
        txData.value = 0;
    }
    if (data) {
        txData.data = data;
    }
    return wallet.signTransaction(txData);
}


export function ethSign(params:any) {
    let { privateKey, nonce, from, to, gasPrice, gasLimit, amount, tokenAddress, decimal, maxPriorityFeePerGas, maxFeePerGas, chainId, data } = params;
    const transactionNonce = numberToHex(nonce);
    const gasLimits = numberToHex(gasLimit);
    const chainIdHex = numberToHex(chainId);
    let newAmount = BigNumber(amount).times((BigNumber(10).pow(decimal)));
    const numBalanceHex = numberToHex(newAmount);
    let txData: any = {
        nonce: transactionNonce,
        gasLimit: gasLimits,
        to,
        from,
        chainId: chainIdHex,
        value: numBalanceHex
    }
    if (maxFeePerGas && maxPriorityFeePerGas) {
        txData.maxFeePerGas = numberToHex(maxFeePerGas);
        txData.maxPriorityFeePerGas = numberToHex(maxPriorityFeePerGas);
    } else {
        txData.gasPrice = numberToHex(gasPrice);
    }
    if (tokenAddress && tokenAddress !== "0x00") {
        const ABI = [
            "function transfer(address to, uint amount)"
        ];
        const iface = new Interface(ABI);
        txData.data = iface.encodeFunctionData("transfer", [to, numBalanceHex]);
        txData.to = tokenAddress;
        txData.value = 0;
    }
    if (data) {
        txData.data = data;
    }
    let common: any, tx: any;
    if (txData.maxFeePerGas && txData.maxPriorityFeePerGas) {
        common = (Common as any).custom({
            chainId: chainId,
            defaultHardfork: "london"
        });
        // tx中包含交易的所有参数（但vrs为空，因为未签名）
        tx = FeeMarketEIP1559Transaction.fromTxData(txData, {
            common
        });
    } else {
        common = (Common as any).custom({ chainId: chainId })
        tx = Transaction.fromTxData(txData, {
            common
        });
    }
    const privateKeyBuffer = Buffer.from(privateKey, "hex");
    // signedTx签名之后给vrs赋值
    const signedTx = tx.sign(privateKeyBuffer);
    const serializedTx = signedTx.serialize();
    if (!serializedTx) {
        throw new Error("sign is null or undefined");
    }
    return `0x${serializedTx.toString('hex')}`;
}
