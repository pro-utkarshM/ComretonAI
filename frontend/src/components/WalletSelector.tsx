'use client'

import { useWallet, WalletName } from '@aptos-labs/wallet-adapter-react'
import { useState } from 'react'
import { ChevronDown, Wallet } from 'lucide-react'

export function WalletSelector() {
    const { connect, disconnect, account, connected, wallets } = useWallet()
    const [isOpen, setIsOpen] = useState(false)

    const handleConnect = async (walletName: WalletName) => {
        try {
            await connect(walletName)
            setIsOpen(false)
        } catch (error) {
            console.error('Failed to connect wallet:', error)
        }
    }

    if (connected && account) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Wallet className="h-4 w-4" />
                    <span>{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
                    <ChevronDown className="h-4 w-4" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                        <button
                            onClick={() => {
                                disconnect()
                                setIsOpen(false)
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Disconnect
                        </button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    {wallets?.map((wallet) => (
                        <button
                            key={wallet.name}
                            onClick={() => handleConnect(wallet.name)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            {wallet.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}