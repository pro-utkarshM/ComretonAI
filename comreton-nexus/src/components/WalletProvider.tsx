/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
//@ts-nocheck
'use client'
import { useMemo } from 'react'
import { AptosWalletAdapterProvider, NetworkName } from '@aptos-labs/wallet-adapter-react'
import { PetraWallet } from "petra-plugin-wallet-adapter"
import { PontemWallet } from "@pontem/wallet-adapter-plugin"
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter"
import { PropsWithChildren } from 'react'



export function WalletProvider({ children }: PropsWithChildren) {
    const wallets = useMemo(() => {
        const walletList = []

        try {
            walletList.push(new PetraWallet())
        } catch (error) {
            console.warn('Failed to initialize Petra wallet:', error)
        }

        try {
            walletList.push(new PontemWallet())
        } catch (error) {
            console.warn('Failed to initialize Pontem wallet:', error)
        }

        try {
            walletList.push(new MartianWallet())
        } catch (error) {
            console.warn('Failed to initialize Martian wallet:', error)
        }

        return walletList
    }, [])

    return (
        <AptosWalletAdapterProvider
            plugins={wallets}
            autoConnect={true} // Change to true
            network={NetworkName.Testnet}
            onError={(error) => {
                console.warn('Wallet adapter error:', error)
            }}
            dappConfig={{
                network: NetworkName.Testnet,
                aptosConnectDappId: "comreton-ai"
            }}
        >
            {children}
        </AptosWalletAdapterProvider>
    )
}