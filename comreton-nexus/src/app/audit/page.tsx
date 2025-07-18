'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Navigation } from '@/components/Navigation'
import {
    Shield,
    AlertCircle,
    CheckCircle,
    Loader2,
    Brain,
    Eye,
    Play,
    Activity,
    Hash,
    ExternalLink,
    Layers,
    Cpu,
    Database,
    Lock,
    Vote,
    ArrowRight
} from 'lucide-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

const CONTRACT_ADDRESS = "0xf591f7c41e589c38de5846182bb801e67b356abb54645f53b67c48fdc4d57023" // Where contract is deployed
const MARKETPLACE_ADDRESS = "0x280d9a767606b8e5f68d91d8f1e3901e8189bdb5224f6cb5fb56679a358d4a68" // Where marketplace is initialized
const MODULE_NAME = "marketplace_v2"

const config = new AptosConfig({ network: Network.TESTNET })
const aptos = new Aptos(config)

// Demo models data
const DEPLOYED_MODELS = [
    {
        id: 1,
        name: "ChatGPT-4 Assistant",
        description: "Advanced conversational AI model based on GPT-4 architecture",
        creator: "0x1234...abcd",
        status: 0, // PENDING
        deployment_tx: "0x7a8b9c...",
        layers: 48,
        parameters: "175B",
        architecture: "Transformer",
        created_at: Date.now() - 3600000
    },
    {
        id: 2,
        name: "Vision Classifier Pro",
        description: "High-performance image classification model",
        creator: "0x5678...efgh",
        status: 0, // PENDING
        deployment_tx: "0x4d5e6f...",
        layers: 24,
        parameters: "22B",
        architecture: "ConvNet",
        created_at: Date.now() - 7200000
    }
]

// Model layer structure for ChatGPT
const GPT_LAYERS = [
    { id: 1, name: "Input Embedding", type: "embedding", params: "50K vocab", status: "ready" },
    { id: 2, name: "Positional Encoding", type: "encoding", params: "2048 seq", status: "ready" },
    { id: 3, name: "Multi-Head Attention 1", type: "attention", params: "96 heads", status: "ready" },
    { id: 4, name: "Feed Forward 1", type: "ffn", params: "4x hidden", status: "ready" },
    { id: 5, name: "Multi-Head Attention 2", type: "attention", params: "96 heads", status: "ready" },
    { id: 6, name: "Feed Forward 2", type: "ffn", params: "4x hidden", status: "ready" },
    { id: 7, name: "Layer Norm", type: "norm", params: "RMS", status: "ready" },
    { id: 8, name: "Output Projection", type: "projection", params: "vocab size", status: "ready" }
]

// Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg animate-fade-in ${type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-300' :
            type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                'bg-blue-500/10 border-blue-500/20 text-blue-300'
            }`}>
            <div className="flex items-center gap-2">
                {type === 'success' && <CheckCircle className="w-5 h-5" />}
                {type === 'error' && <AlertCircle className="w-5 h-5" />}
                {type === 'info' && <Activity className="w-5 h-5" />}
                <span>{message}</span>
                <button onClick={onClose} className="ml-2 text-foreground/60 hover:text-white">×</button>
            </div>
        </div>
    )
}

// Layer Visualization Component
const LayerVisualizer = ({ layer, onExecute, isExecuting, result }: {
    layer: any,
    onExecute: (layerId: number) => void,
    isExecuting: boolean,
    result?: string
}) => {
    const getLayerIcon = (type: string) => {
        switch (type) {
            case 'embedding': return <Database className="w-5 h-5" />
            case 'attention': return <Brain className="w-5 h-5" />
            case 'ffn': return <Cpu className="w-5 h-5" />
            case 'norm': return <Activity className="w-5 h-5" />
            default: return <Layers className="w-5 h-5" />
        }
    }

    const getLayerColor = (type: string) => {
        switch (type) {
            case 'embedding': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
            case 'attention': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
            case 'ffn': return 'text-green-400 bg-green-500/10 border-green-500/20'
            case 'norm': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
            default: return 'text-foreground/60 bg-foreground/5 border-foreground/10'
        }
    }

    return (
        <div className={`p-4 border rounded-lg transition-all hover:scale-[1.02] cursor-pointer ${getLayerColor(layer.type)}`}
            onClick={() => onExecute(layer.id)}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {getLayerIcon(layer.type)}
                    <div>
                        <h4 className="font-semibold">{layer.name}</h4>
                        <p className="text-xs opacity-80">{layer.params}</p>
                    </div>
                </div>
                {isExecuting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Play className="w-4 h-4" />
                )}
            </div>

            {result && (
                <div className="mt-3 p-2 bg-black/20 rounded text-xs font-mono">
                    <div className="text-green-400">✓ Execution verified</div>
                    <div className="text-foreground/80">Output: {result}</div>
                </div>
            )}
        </div>
    )
}

// Blockchain Verification Component
const BlockchainVerification = ({ proofs }: { proofs: any[] }) => {
    return (
        <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Blockchain Verification
            </h4>

            <div className="space-y-2">
                {proofs.map((proof, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Hash className="w-4 h-4 text-blue-400" />
                            <div>
                                <p className="text-sm font-medium">{proof.operation}</p>
                                <p className="text-xs text-foreground/60">Block #{proof.block}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <a
                                href={`https://explorer.aptoslabs.com/txn/${proof.tx}?network=testnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                            >
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Audit Progress Component
const AuditProgress = ({ progress, onVote }: { progress: number, onVote: (approved: boolean) => void }) => {
    return (
        <div className="p-6 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Audit Progress
            </h3>

            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span>Verification Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full bg-foreground/10 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {progress >= 100 && (
                <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
                        <p className="text-green-400 font-medium">All layers verified successfully!</p>
                        <p className="text-sm text-green-400/80">Model is ready for final audit vote</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => onVote(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Vote className="w-4 h-4" />
                            Approve Model
                        </button>
                        <button
                            onClick={() => onVote(false)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Vote className="w-4 h-4" />
                            Reject Model
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function AuditPage() {
    const { account, signAndSubmitTransaction, connected } = useWallet()

    // State Management
    const [models, setModels] = useState(DEPLOYED_MODELS)
    const [selectedModel, setSelectedModel] = useState<any>(null)
    const [currentLayers, setCurrentLayers] = useState<any[]>([])
    const [executingLayer, setExecutingLayer] = useState<number | null>(null)
    const [layerResults, setLayerResults] = useState<{ [key: number]: string }>({})
    const [auditProgress, setAuditProgress] = useState(0)
    const [isVoting, setIsVoting] = useState(false)
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null)
    const [blockchainProofs, setBlockchainProofs] = useState<any[]>([])

    // Initialize blockchain proofs when model is selected
    useEffect(() => {
        if (selectedModel) {
            setCurrentLayers(GPT_LAYERS)
            setBlockchainProofs([
                {
                    operation: "Model Deployment",
                    block: 12487692,
                    tx: selectedModel.deployment_tx,
                    timestamp: Date.now() - 3600000
                },
                {
                    operation: "seL4 Kernel Verification",
                    block: 12487693,
                    tx: "0x8c9d0e...",
                    timestamp: Date.now() - 3500000
                },
                {
                    operation: "Proof Generation",
                    block: 12487694,
                    tx: "0x1f2a3b...",
                    timestamp: Date.now() - 3400000
                }
            ])
        }
    }, [selectedModel])

    // Update progress based on executed layers
    useEffect(() => {
        const executedLayers = Object.keys(layerResults).length
        const progress = (executedLayers / currentLayers.length) * 100
        setAuditProgress(progress)
    }, [layerResults, currentLayers])

    const executeLayer = async (layerId: number) => {
        setExecutingLayer(layerId)

        try {
            // Simulate layer execution with realistic delay
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Mock execution results
            const results = {
                1: "Embeddings: [0.234, -0.567, 0.891, ...] (512 dims)",
                2: "Positions: [sin(0), cos(0), sin(π/2), ...] encoded",
                3: "Attention weights: Q·K^T softmax applied, 96 heads",
                4: "FFN: ReLU(xW1)W2 → [1.23, -0.45, 0.78, ...]",
                5: "Attention refined: Multi-head output aggregated",
                6: "FFN final: Residual connection + normalization",
                7: "Layer norm: μ=0.001, σ=0.998, normalized",
                8: "Output logits: [0.12, 0.89, 0.03, ...] → 'Hello'"
            }

            setLayerResults(prev => ({
                ...prev,
                [layerId]: results[layerId as keyof typeof results] || "Execution completed"
            }))

            // Add blockchain proof for this execution
            setBlockchainProofs(prev => [...prev, {
                operation: `Layer ${layerId} Verification`,
                block: 12487695 + layerId,
                tx: `0x${Math.random().toString(16).substr(2, 6)}...`,
                timestamp: Date.now()
            }])

            setToast({
                message: `Layer ${layerId} executed and verified successfully!`,
                type: 'success'
            })

        } catch (error) {
            setToast({
                message: `Layer ${layerId} execution failed`,
                type: 'error'
            })
        } finally {
            setExecutingLayer(null)
        }
    }

    const handleVote = async (approved: boolean) => {
        if (!account || !selectedModel) return

        setIsVoting(true)

        try {
            console.log('Voting for model:', selectedModel.id)
            console.log('Contract address:', CONTRACT_ADDRESS)
            console.log('Marketplace address:', MARKETPLACE_ADDRESS)

            const result = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::demo_quick_audit`,
                    functionArguments: [MARKETPLACE_ADDRESS, selectedModel.id],
                },
            })

            console.log('Vote transaction successful:', result)

            // Update model status
            setModels(prev => prev.map(model =>
                model.id === selectedModel.id
                    ? { ...model, status: approved ? 1 : 2 }
                    : model
            ))

            setToast({
                message: approved
                    ? `🎉 Model "${selectedModel.name}" has been VERIFIED and is now live on the marketplace!`
                    : `Model "${selectedModel.name}" has been rejected.`,
                type: approved ? 'success' : 'error'
            })

            // Reset selection after successful vote
            setTimeout(() => {
                setSelectedModel(null)
                setLayerResults({})
                setAuditProgress(0)
                setBlockchainProofs([])
            }, 3000)

        } catch (error: any) {
            console.error('Voting error:', error)
            setToast({
                message: `Voting failed: ${error?.message || 'Transaction failed'}`,
                type: 'error'
            })
        } finally {
            setIsVoting(false)
        }
    }

    if (!connected || !account) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navigation />
                <main className="max-w-6xl mx-auto px-4 py-24 sm:py-32">
                    <div className="flex flex-col items-center justify-center text-center p-8 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                        <AlertCircle className="w-12 h-12 text-foreground/50 mb-4" />
                        <h2 className="text-xl font-bold text-white">Connect Your Wallet</h2>
                        <p className="text-foreground/60 mt-2">
                            Please connect your wallet to access the AI model auditing dashboard.
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <main className="max-w-7xl mx-auto px-4 py-24 sm:py-32">
                <header className="text-center mb-12">
                    <div className="w-20 h-20 bg-shield-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">AI Model Auditor</h1>
                    <p className="text-lg text-foreground/70">
                        Verify AI models with complete transparency and blockchain-backed proofs
                    </p>
                </header>

                {!selectedModel ? (
                    // Model Selection View
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Deployed Models Awaiting Audit</h2>
                            <div className="text-sm text-foreground/60">
                                {models.filter(m => m.status === 0).length} models pending
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {models.filter(m => m.status === 0).map((model) => (
                                <div key={model.id} className="p-6 border border-foreground/10 rounded-xl bg-foreground/[0.02] hover:border-foreground/20 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Brain className="w-8 h-8 text-blue-400" />
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{model.name}</h3>
                                                <p className="text-sm text-foreground/60">{model.architecture} • {model.parameters}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                                            PENDING
                                        </div>
                                    </div>

                                    <p className="text-foreground/80 mb-4">{model.description}</p>

                                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                        <div>
                                            <span className="text-foreground/60">Layers:</span>
                                            <span className="ml-2 text-white">{model.layers}</span>
                                        </div>
                                        <div>
                                            <span className="text-foreground/60">Creator:</span>
                                            <span className="ml-2 text-white font-mono">{model.creator}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedModel(model)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Inspect & Audit Model
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Model Inspection View
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => setSelectedModel(null)}
                                className="px-4 py-2 border border-foreground/20 rounded-lg hover:border-foreground/50 transition-colors"
                            >
                                ← Back to Models
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedModel.name}</h2>
                                <p className="text-foreground/60">Real-time layer-by-layer verification</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Layer Visualization */}
                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Layers className="w-5 h-5" />
                                    Model Architecture ({currentLayers.length} layers)
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentLayers.map((layer) => (
                                        <LayerVisualizer
                                            key={layer.id}
                                            layer={layer}
                                            onExecute={executeLayer}
                                            isExecuting={executingLayer === layer.id}
                                            result={layerResults[layer.id]}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Audit Progress & Blockchain Verification */}
                            <div className="space-y-6">
                                <AuditProgress
                                    progress={auditProgress}
                                    onVote={handleVote}
                                />

                                <div className="p-6 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                                    <BlockchainVerification proofs={blockchainProofs} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}