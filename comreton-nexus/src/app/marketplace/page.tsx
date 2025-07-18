'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Navigation } from '@/components/Navigation'
import { ChatInterface } from '@/components/ChatInterface'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import {
    AlertTriangle,
    CheckCircle,
    Search,
    X,
    Loader2,
    Users,
    FileText,
    Cpu,
    Bot,
    ExternalLink,
    Code,
    Zap,
    Globe,
    Star,
    ArrowRight
} from 'lucide-react'

const CONTRACT_ADDRESS = "0xf591f7c41e589c38de5846182bb801e67b356abb54645f53b67c48fdc4d57023" // Where contract is deployed
const MARKETPLACE_ADDRESS = "0x280d9a767606b8e5f68d91d8f1e3901e8189bdb5224f6cb5fb56679a358d4a68" // Where marketplace is initialized
const MODULE_NAME = "marketplace_v2"

const config = new AptosConfig({ network: Network.TESTNET })
const aptos = new Aptos(config)

// Demo models data
const DEMO_MODELS = [
    {
        id: 1,
        creator: "0x1234...abcd",
        name: "ChatBot Pro Demo",
        description: "A verified conversational AI model for customer support and general chat interactions",
        ipfs_hash: "QmX7Y8Z...",
        category: "NLP",
        price_per_inference: 100000, // 0.001 APT
        status: 1, // VERIFIED
        auditor_count: 3,
        total_inferences: 1250,
        created_at: Date.now() - 86400000
    },
    {
        id: 2,
        creator: "0x5678...efgh",
        name: "ImageGen AI",
        description: "Text-to-image generation model for creating artwork and graphics",
        ipfs_hash: "QmA1B2C...",
        category: "Computer Vision",
        price_per_inference: 500000, // 0.005 APT
        status: 0, // PENDING
        auditor_count: 1,
        total_inferences: 0,
        created_at: Date.now() - 3600000
    }
]

// API Support Banner Component
const APIBanner = () => (
    <div className="relative mb-12 p-6 border border-blue-500/20 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        🚀 Developer API Access Coming Soon
                        <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                    </h3>
                    <p className="text-foreground/70 mb-3">
                        Direct REST API endpoints for seamless integration into your applications
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Zap className="w-4 h-4" />
                            <span>RESTful APIs</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-400">
                            <Globe className="w-4 h-4" />
                            <span>Global CDN</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-400">
                            <Code className="w-4 h-4" />
                            <span>SDK Support</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-2xl font-bold text-white mb-1">Q4 2025</div>
                <p className="text-sm text-foreground/60 mb-3">Expected Launch</p>


                <Link href="/waitlist" className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all">
                    Join Waitlist
                </Link>

                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />

            </div>
        </div>

        {/* Feature Preview */}
        <div className="mt-6 pt-6 border-t border-foreground/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-foreground/5 rounded-lg">
                    <div className="font-semibold text-white mb-1">Easy Integration</div>
                    <div className="text-foreground/60">Simple REST calls to run any verified model</div>
                </div>
                <div className="p-3 bg-foreground/5 rounded-lg">
                    <div className="font-semibold text-white mb-1">Pay-per-Use</div>
                    <div className="text-foreground/60">Transparent blockchain-based billing</div>
                </div>
                <div className="p-3 bg-foreground/5 rounded-lg">
                    <div className="font-semibold text-white mb-1">High Availability</div>
                    <div className="text-foreground/60">99.9% uptime with global distribution</div>
                </div>
            </div>
        </div>
    </div>
)

const ModelCard = ({ model, onSelect }: { model: any, onSelect: () => void }) => {
    const status = {
        0: { text: 'Pending Audit', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10', icon: <AlertTriangle className="w-4 h-4" /> },
        1: { text: 'Verified', color: 'text-lime-400 border-lime-400/30 bg-lime-400/10', icon: <CheckCircle className="w-4 h-4" /> },
        2: { text: 'Rejected', color: 'text-red-400 border-red-400/30 bg-red-400/10', icon: <X className="w-4 h-4" /> }
    }[model.status] || {}

    return (
        <button onClick={onSelect} className="text-left w-full p-6 border border-foreground/10 rounded-xl bg-background/50 transition-all hover:border-foreground/20 hover:bg-foreground/[0.04] hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">{model.name}</h3>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                    {status.icon} {status.text}
                </div>
            </div>
            <p className="text-sm text-foreground/60 mb-4 h-10 line-clamp-2">{model.description}</p>
            <div className="flex justify-between items-center text-sm">
                <span className="text-foreground/50">{model.category}</span>
                <span className="font-semibold text-white">{(model.price_per_inference / 10 ** 8).toFixed(4)} APT</span>
            </div>
        </button>
    )
}

const ModelDetailModal = ({ model, onClose, onRunInference }: { model: any, onClose: () => void, onRunInference: (modelId: string, input: string) => Promise<any> }) => {
    const [input, setInput] = useState('')
    const [isInferring, setIsInferring] = useState(false)
    const [output, setOutput] = useState('')
    const [error, setError] = useState('')
    const [txHash, setTxHash] = useState('')

    const handleSubmit = async () => {
        setIsInferring(true)
        setOutput('')
        setError('')
        setTxHash('')
        try {
            const result = await onRunInference(model.id, input)
            setOutput(`Inference successful! Processing: "${input}"`)
            setTxHash(result.hash)
        } catch (err: any) {
            setError(`Inference failed: ${err.message}`)
        }
        setIsInferring(false)
    }

    const handleChatMessage = async (message: string): Promise<string> => {
        // Simulate AI response with some processing time
        await new Promise(resolve => setTimeout(resolve, 1500))

        const responses = [
            "That's a great question! Based on my analysis, I think...",
            "I understand what you're asking. Here's my perspective:",
            "Thank you for the query. Let me process that for you:",
            "Interesting point! Here's what I can tell you:",
            "I'd be happy to help with that. My analysis suggests:"
        ]

        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        return `${randomResponse} ${message.split(' ').reverse().slice(0, 3).join(' ')}.`
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-4xl max-h-[90vh] p-8 border border-foreground/10 rounded-xl bg-foreground/[0.02] relative overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-foreground/60 hover:text-white transition-colors">
                    <X />
                </button>

                <h2 className="text-3xl font-bold text-white mb-2">{model.name}</h2>
                <p className="text-sm text-foreground/50 mb-6">Creator: <span className="font-mono">{model.creator}</span></p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Details & Inference */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-white mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Details
                            </h3>
                            <p className="text-sm text-foreground/60">{model.description}</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-white mb-2 flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                Audit Trail
                            </h3>
                            <div className="text-sm text-lime-400 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verified by {model.auditor_count} auditor(s).
                            </div>
                        </div>

                        {/* Single Inference */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-white flex items-center">
                                <Cpu className="w-4 h-4 mr-2" />
                                Single Inference
                            </h3>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full h-24 p-3 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-foreground/50"
                                placeholder="Enter your input data here..."
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={isInferring || model.status !== 1}
                                className="w-full flex items-center justify-center px-6 py-3 font-semibold bg-foreground text-background rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                {isInferring ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    `Run for ${(model.price_per_inference / 10 ** 8).toFixed(4)} APT`
                                )}
                            </button>

                            {(output || error) && (
                                <div className={`p-3 rounded-lg text-xs font-mono border ${error ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-lime-500/10 text-lime-300 border-lime-500/20'
                                    }`}>
                                    {output || error}
                                    {txHash && (
                                        <div className="mt-2">

                                            href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-lime-400 hover:text-lime-300"
                                            <a>
                                                View Transaction <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Chat Interface */}
                    <div className="space-y-6">
                        {model.status === 1 && (
                            <div>
                                <h3 className="font-semibold text-white mb-4 flex items-center">
                                    <Bot className="w-4 h-4 mr-2" />
                                    Chat with {model.name}
                                </h3>
                                <ChatInterface
                                    modelName={model.name}
                                    onSendMessage={handleChatMessage}
                                />
                            </div>
                        )}

                        {model.status !== 1 && (
                            <div className="flex items-center justify-center h-96 border border-dashed border-foreground/20 rounded-xl">
                                <div className="text-center">
                                    <AlertTriangle className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                                    <p className="text-foreground/60">Model must be verified to enable chat</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}

export default function MarketplacePage() {
    const { account, signAndSubmitTransaction } = useWallet()
    const [models, setModels] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedModel, setSelectedModel] = useState<any>(null)
    const [filter, setFilter] = useState<'All' | 'Verified' | 'Pending'>('All')

    useEffect(() => {
        fetchModels()
    }, [])

    const fetchModels = async () => {
        setIsLoading(true)
        // Simulate API delay then load demo data
        setTimeout(() => {
            setModels(DEMO_MODELS)
            setIsLoading(false)
        }, 1000)
    }

    const runInference = async (modelId: string, input: string) => {
        if (!account) throw new Error("Wallet not connected")

        console.log('Running inference for model:', modelId)
        console.log('Contract address:', CONTRACT_ADDRESS)
        console.log('Marketplace address:', MARKETPLACE_ADDRESS)

        const result = await signAndSubmitTransaction({
            sender: account.address,
            data: {
                function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::run_inference`,
                functionArguments: [MARKETPLACE_ADDRESS, parseInt(modelId)], // Make sure modelId is a number
            },
        })

        return result
    }

    const filteredModels = useMemo(() => {
        if (filter === 'All') return models
        if (filter === 'Verified') return models.filter(m => m.status === 1)
        if (filter === 'Pending') return models.filter(m => m.status === 0)
        return []
    }, [models, filter])

    const FilterButton = ({ value }: { value: 'All' | 'Verified' | 'Pending' }) => (
        <button
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${filter === value ? 'bg-foreground text-background' : 'text-foreground/60 hover:bg-foreground/10'
                }`}
        >
            {value}
        </button>
    )

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 py-24 sm:py-32">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">AI Model Marketplace</h1>
                    <p className="text-lg text-foreground/70 mt-4 max-w-2xl mx-auto">
                        Discover, audit, and utilize a new generation of provably safe AI models.
                    </p>
                </header>

                {/* API Support Banner */}
                <APIBanner />

                {/* Filters */}
                <div className="flex justify-center items-center gap-2 mb-12 p-1 border border-foreground/10 rounded-full bg-foreground/[0.02] w-fit mx-auto">
                    <FilterButton value="All" />
                    <FilterButton value="Verified" />
                    <FilterButton value="Pending" />
                </div>

                {/* Models Grid */}
                {isLoading ? (
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                    </div>
                ) : filteredModels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredModels.map((model) => (
                            <ModelCard
                                key={model.id}
                                model={model}
                                onSelect={() => setSelectedModel(model)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-foreground/20 rounded-xl">
                        <p className="text-foreground/60">No models found for the selected filter.</p>
                    </div>
                )}
            </main>

            {selectedModel && (
                <ModelDetailModal
                    model={selectedModel}
                    onClose={() => setSelectedModel(null)}
                    onRunInference={runInference}
                />
            )}
        </div>
    )
}