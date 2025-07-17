// src/components/WalletProvider.tsx
'use client'

import { AptosWalletAdapterProvider, NetworkName } from '@aptos-labs/wallet-adapter-react'
import { PetraWallet } from "petra-plugin-wallet-adapter"
import { PontemWallet } from "@pontem/wallet-adapter-plugin"
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter"
import { PropsWithChildren } from 'react'

const wallets = [new PetraWallet(), new PontemWallet(), new MartianWallet()]

export function WalletProvider({ children }: PropsWithChildren) {
    return (
        <AptosWalletAdapterProvider
            plugins={wallets}
            autoConnect={true}
            network={NetworkName.Testnet}
            onError={(error) => {
                console.error('Wallet error:', error)
            }}
        >
            {children}
        </AptosWalletAdapterProvider>
    )
}