'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { WalletSelector } from './WalletSelector'
import { Brain, Home, Upload, Shield, User } from 'lucide-react'
import Link from 'next/link'

export function Navbar() {
    const { connected, account } = useWallet()

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <Brain className="h-8 w-8 text-blue-600 mr-2" />
                            <span className="font-bold text-xl">ComretonAI</span>
                        </Link>

                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                <Home className="h-4 w-4 mr-1" />
                                Marketplace
                            </Link>

                            {connected && (
                                <>
                                    <Link href="/deploy" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                        <Upload className="h-4 w-4 mr-1" />
                                        Deploy Model
                                    </Link>

                                    <Link href="/audit" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                        <Shield className="h-4 w-4 mr-1" />
                                        Audit
                                    </Link>

                                    <Link href="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        Profile
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <WalletSelector />
                    </div>
                </div>
            </div>
        </nav>
    )
}