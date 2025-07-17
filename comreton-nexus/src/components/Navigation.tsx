'use client'

import { useState, useEffect, useRef } from 'react'
import { useWallet, WalletName } from '@aptos-labs/wallet-adapter-react'
import { Brain, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// The links are now defined outside for easier management
const navLinks = [
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/deploy', label: 'Deploy', connected: true },
    { href: '/audit', label: 'Audit', connected: true },
    { href: '/compute', label: 'Compute', connected: true },
    { href: '/docs', label: 'docs' },
]

// A simple SVG for our sleek navigation shuttle
const NavigationShuttle = () => (
    <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0L20 12H0L10 0Z" fill="currentColor" />
    </svg>
);


export function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [shipStyle, setShipStyle] = useState({ left: 0, width: 0, opacity: 0 })

    const { connect, disconnect, account, connected, wallets } = useWallet()
    const pathname = usePathname()

    // We use refs to get the position of each navigation link
    const linksRef = useRef<(HTMLAnchorElement | null)[]>([])

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // This effect runs when the page changes to move the shuttle
    useEffect(() => {
        const activeLinkIndex = navLinks.findIndex(link => link.href === pathname)
        const activeLinkElement = linksRef.current[activeLinkIndex]

        if (activeLinkElement) {
            setShipStyle({
                left: activeLinkElement.offsetLeft,
                width: activeLinkElement.offsetWidth,
                opacity: 1,
            })
        } else {
            // Hide the shuttle if no link is active (e.g., on homepage)
            setShipStyle({ ...shipStyle, opacity: 0 })
        }
    }, [pathname]) // Rerun whenever the path changes

    const handleConnect = (walletName: WalletName) => {
        try {
            connect(walletName)
        } catch (error) { console.error('Wallet connection failed:', error) }
    }

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-foreground/10' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="flex items-center group">
                        <Brain className="h-8 w-8 text-foreground/80 transition-colors group-hover:text-white" />
                        <span className="ml-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60">
                            ComretonAI
                        </span>
                    </Link>

                    {/* Desktop Navigation with Spaceship */}
                    <div className="hidden md:flex items-center space-x-8 relative">
                        {navLinks.map((link, index) => {
                            if (link.connected && !connected) return null
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    ref={(el) => (linksRef.current[index] = el)}
                                    className={`font-medium transition-colors ${pathname === link.href ? 'text-white' : 'text-foreground/60 hover:text-white'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            )
                        })}

                        {/* The Flying Spaceship Animation! */}
                        <div
                            className="absolute -bottom-5 text-white transition-all duration-500 ease-in-out"
                            style={{
                                left: shipStyle.left,
                                width: shipStyle.width,
                                opacity: shipStyle.opacity,
                                transform: 'translateX( calc(-50% + 50%) )' // This keeps the ship centered
                            }}
                        >
                            <div className="w-full flex justify-center">
                                <NavigationShuttle />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {connected && account ? (
                            <button onClick={() => disconnect()} className="px-4 py-2 text-sm font-semibold border border-foreground/20 rounded-lg transition-colors hover:border-foreground/50 hover:text-white">
                                {String(account.address).slice(0, 6)}...{String(account.address).slice(-4)}
                            </button>
                        ) : (
                            <div className="relative group hidden md:block">
                                <button className="px-5 py-2 text-sm font-semibold bg-foreground text-background rounded-lg transition-transform hover:scale-105">
                                    Connect Wallet
                                </button>
                                <div className="absolute right-0 mt-2 w-48 p-2 bg-background border border-foreground/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                    {wallets?.map((wallet) => (
                                        <button
                                            key={wallet.name}
                                            onClick={() => handleConnect(wallet.name)}
                                            className="block w-full text-left px-3 py-2 text-foreground/80 hover:bg-foreground/5 rounded-md transition-colors"
                                        >
                                            {wallet.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="md:hidden p-2 text-foreground/80">
                            {isMobileOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileOpen && (
                <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-foreground/10 pb-4">
                    <div className="flex flex-col space-y-2 px-4 pt-2">
                        {navLinks.map((link) => {
                            if (link.connected && !connected) return null
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-md font-medium ${pathname === link.href ? 'bg-foreground/10 text-white' : 'text-foreground/60'}`}
                                >
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </nav>
    )
}