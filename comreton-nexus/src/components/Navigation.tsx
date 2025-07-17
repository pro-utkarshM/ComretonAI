'use client'

import { useState, useEffect } from 'react'
import { useWallet, WalletName } from '@aptos-labs/wallet-adapter-react'
import { Brain, Menu, X, Zap, Shield, Code, Cpu } from 'lucide-react'
import Link from 'next/link'

export function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const { connect, disconnect, account, connected, wallets } = useWallet()

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleConnect = (walletName: WalletName) => {
        try {
            connect(walletName)
        } catch (error) { console.error('Wallet connection failed:', error) }
    }

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="flex items-center group">
                        <Brain className="h-8 w-8 text-brand-blue transition-all duration-300 group-hover:text-white group-hover:animate-pulse" />
                        <span className="ml-2 text-xl font-bold gradient-text">COMRETONAI</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/marketplace" className="nav-link">Marketplace</Link>
                        {connected && (
                            <>
                                <Link href="/deploy" className="nav-link">Deploy</Link>
                                <Link href="/audit" className="nav-link">Audit</Link>
                                <Link href="/compute" className="nav-link">Compute</Link>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {connected && account ? (
                            <button onClick={() => disconnect()} className="outline-btn text-sm">
                                {String(account.address).slice(0, 6)}...{String(account.address).slice(-4)}
                            </button>
                        ) : (
                            <div className="relative group hidden md:block">
                                <button className="cybernetic-btn">Connect Wallet</button>
                                <div className="absolute right-0 mt-2 w-48 p-2 glass-card rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                    {wallets?.map((wallet) => (
                                        <button
                                            key={wallet.name}
                                            onClick={() => handleConnect(wallet.name)}
                                            className="block w-full text-left px-3 py-2 text-text-secondary hover:bg-surface-2 rounded-md transition-colors"
                                        >
                                            {wallet.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="md:hidden p-2 text-text-secondary">
                            {isMobileOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileOpen && (
                <div className="md:hidden bg-background/95 backdrop-blur-lg pb-4">
                    {/* Mobile menu content goes here */}
                </div>
            )}
        </nav>
    )
}