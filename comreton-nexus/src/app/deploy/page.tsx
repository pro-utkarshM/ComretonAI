/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
//@ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Navigation } from '@/components/Navigation'
import {
    Upload,
    FileText,
    Loader2,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    Server,
    Cpu,
    Shield,
    Zap,
    ExternalLink,
    Brain,
    Code,
    Globe
} from 'lucide-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS
const MODULE_NAME = "marketplace_v2";

const config = new AptosConfig({ network: Network.TESTNET })
const aptos = new Aptos(config)

// Provider data
const LOCAL_PROVIDER = {
    id: 'local_gpu_1',
    name: 'Local GPU Provider',
    specs: 'NVIDIA RTX 4090, 32GB RAM',
    location: 'Local Machine',
    pricePerHour: 0.5,
    availability: 'Available',
    reputation: 4.9
}

// Deployment Process Animation Component
const DeploymentAnimation = () => {
    const [currentStep, setCurrentStep] = useState(0)

    const steps = [
        { icon: <Upload className="w-6 h-6" />, title: 'Upload Model', desc: 'Secure storage' },
        { icon: <Server className="w-6 h-6" />, title: 'Provider Match', desc: 'Optimal compute selection' },
        { icon: <Shield className="w-6 h-6" />, title: 'Audit Process', desc: 'Community verification' },
        { icon: <Globe className="w-6 h-6" />, title: 'Live on Network', desc: 'Ready for inference' }
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % steps.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative mb-12 p-8 border border-foreground/10 rounded-xl bg-gradient-to-br from-foreground/[0.02] to-foreground/[0.05]">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Deployment Process</h2>
                <p className="text-foreground/60">Your AI model&apos;s journey to the decentralized network</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                    <div key={index} className="relative">
                        <div className={`flex flex-col items-center p-6 rounded-lg transition-all duration-500 ${currentStep === index
                            ? 'bg-blue-500/10 border border-blue-500/20 scale-105'
                            : 'bg-foreground/5 border border-foreground/10'
                            }`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${currentStep === index ? 'bg-blue-500 text-white' : 'bg-foreground/10 text-foreground/60'
                                }`}>
                                {step.icon}
                            </div>
                            <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                            <p className="text-xs text-foreground/60 text-center">{step.desc}</p>
                        </div>

                        {index < steps.length - 1 && (
                            <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-foreground/20">
                                <div className={`h-full bg-blue-500 transition-all duration-500 ${currentStep > index ? 'w-full' : 'w-0'
                                    }`} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Form Components
const FormInput = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">{label}</label>
        <input
            {...props}
            className="w-full px-4 py-3 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
        />
    </div>
)

const FormTextarea = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">{label}</label>
        <textarea
            {...props}
            className="w-full min-h-[120px] px-4 py-3 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none"
        />
    </div>
)

// Provider Selection Component
const ProviderSelection = ({ onSelect, selected }: { onSelect: (provider: any) => void, selected: any }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Select Compute Provider</h3>
            <div
                onClick={() => onSelect(LOCAL_PROVIDER)}
                className={`p-6 border rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${selected?.id === LOCAL_PROVIDER.id
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-foreground/10 bg-foreground/[0.02] hover:border-foreground/20'
                    }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <Server className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">{LOCAL_PROVIDER.name}</h4>
                            <p className="text-sm text-foreground/60">{LOCAL_PROVIDER.location}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-green-400">{LOCAL_PROVIDER.availability}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-foreground/60">Specs:</span>
                        <p className="text-white">{LOCAL_PROVIDER.specs}</p>
                    </div>
                    <div>
                        <span className="text-foreground/60">Rate:</span>
                        <p className="text-white">${LOCAL_PROVIDER.pricePerHour} APT/hour</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Deployment Progress Component
const DeploymentProgress = ({ stage }: { stage: number }) => {
    const stages = [
        { title: 'Uploading to Compute Server', desc: 'Securing your model on decentralized storage' },
        { title: 'Provider Allocation', desc: 'Assigning compute resources' },
        { title: 'Model Deployment', desc: 'Installing and configuring your model' },
        { title: 'Initialization', desc: 'Running initial tests and setup' },
        { title: 'Audit Queue', desc: 'Adding to community audit queue' }
    ]

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Deploying Your Model</h3>
                <p className="text-foreground/60">Please wait while we deploy your ChatGPT model...</p>
            </div>

            <div className="space-y-4">
                {stages.map((stageInfo, index) => (
                    <div key={index} className="flex items-center gap-4">
                        {stage > index ? (
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : stage === index ? (
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
                        ) : (
                            <div className="w-5 h-5 rounded-full border border-foreground/30 flex-shrink-0" />
                        )}

                        <div className={`flex-1 ${stage >= index ? 'text-white' : 'text-foreground/40'}`}>
                            <h4 className="font-semibold">{stageInfo.title}</h4>
                            <p className="text-sm text-foreground/60">{stageInfo.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Audit Process Component
const AuditProcess = () => {
    const [auditStage, setAuditStage] = useState(0)

    const auditSteps = [
        'Model Architecture Analysis',
        'Bias Detection Testing',
        'Safety Protocol Verification',
        'Performance Benchmarking',
        'Community Review'
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setAuditStage(prev => {
                if (prev < auditSteps.length - 1) {
                    return prev + 1
                }
                return prev
            })
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Model Audit in Progress</h3>
                <p className="text-foreground/60">Community auditors are verifying your model&apos;s safety and performance</p>
            </div>

            <div className="space-y-3">
                {auditSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                        {auditStage > index ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : auditStage === index ? (
                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        ) : (
                            <div className="w-4 h-4 rounded-full border border-foreground/30" />
                        )}
                        <span className={auditStage >= index ? 'text-white' : 'text-foreground/40'}>
                            {step}
                        </span>
                    </div>
                ))}
            </div>

            {auditStage >= auditSteps.length - 1 && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h4 className="font-bold text-green-400">Audit Complete!</h4>
                    <p className="text-sm text-green-400/80">Your model is now live on the marketplace</p>
                </div>
            )}
        </div>
    )
}

export default function DeployModel() {
    const { account, signAndSubmitTransaction } = useWallet()
    const [currentStep, setCurrentStep] = useState(1) // 1: Form, 2: Provider, 3: Deploy, 4: Audit
    const [isProcessing, setIsProcessing] = useState(false)
    const [feedback, setFeedback] = useState({ type: '', text: '', txHash: '' })
    const [deploymentStage, setDeploymentStage] = useState(0)
    const [selectedProvider, setSelectedProvider] = useState<any>(null)

    const [formData, setFormData] = useState({
        name: 'ChatGPT-4 Assistant',
        description: 'Advanced conversational AI model based on GPT-4 architecture for intelligent dialogue and task assistance',
        category: 'Natural Language Processing',
        pricePerInference: '0.001',
        capabilities: 'Text generation, conversation, question answering, creative writing, code assistance',
        modelSize: '175B parameters',
        version: '4.0'
    })

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentStep(2)
    }

    const handleProviderSelect = (provider: any) => {
        setSelectedProvider(provider)
    }

    const handleDeploy = async () => {
        if (!account || !selectedProvider) {
            setFeedback({ type: 'error', text: 'Please connect wallet and select a provider', txHash: '' })
            return
        }

        // Check if wallet is actually connected
        if (!account.address) {
            setFeedback({ type: 'error', text: 'Wallet not properly connected. Please reconnect.', txHash: '' })
            return
        }

        setIsProcessing(true)
        setCurrentStep(3)
        setFeedback({ type: '', text: '', txHash: '' })

        try {
            // First, show deployment progress
            for (let i = 0; i <= 4; i++) {
                setDeploymentStage(i)
                await new Promise(resolve => setTimeout(resolve, 1500))
            }

            setFeedback({ type: 'info', text: 'Please approve the transaction in your wallet...', txHash: '' })

            // Add a small delay to ensure UI is ready
            await new Promise(resolve => setTimeout(resolve, 500))

            console.log('Attempting transaction with account:', account.address)
            console.log('Contract address:', CONTRACT_ADDRESS)

            // Use the exact format from Aptos documentation
            const result = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::demo_register_model`,
                    functionArguments: ["0x280d9a767606b8e5f68d91d8f1e3901e8189bdb5224f6cb5fb56679a358d4a68"],
                },
            })

            console.log('Transaction successful:', result)

            setFeedback({
                type: 'success',
                text: 'Model deployed successfully! Starting audit process...',
                txHash: result.hash
            })

            setTimeout(() => {
                setCurrentStep(4)
            }, 2000)

        } catch (error: any) {
            console.error('Full deployment error:', error)

            // Better error handling for common wallet issues
            let errorMessage = 'Transaction failed'
            if (error.message?.includes('popup')) {
                errorMessage = 'Wallet popup blocked. Please allow popups and try again.'
            } else if (error.message?.includes('rejected')) {
                errorMessage = 'Transaction rejected by user'
            } else if (error.message?.includes('network')) {
                errorMessage = 'Network error. Please check your connection.'
            } else {
                errorMessage = error.message || 'Unknown error occurred'
            }

            setFeedback({
                type: 'error',
                text: `Deployment failed: ${errorMessage}`,
                txHash: ''
            })
        } finally {
            setIsProcessing(false)
        }
    }
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />

            <main className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Brain className="w-10 h-10 text-blue-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Deploy Your AI Model</h1>
                    <p className="text-lg text-foreground/70">
                        Bring your ChatGPT model to the decentralized ComretonAI network
                    </p>
                </div>

                {/* Process Animation */}
                <DeploymentAnimation />

                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-4">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= step
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-foreground/10 text-foreground/40'
                                    }`}>
                                    {step}
                                </div>
                                {step < 4 && (
                                    <div className={`w-12 h-0.5 ${currentStep > step ? 'bg-blue-500' : 'bg-foreground/20'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback */}
                {feedback.text && (
                    <div className={`p-4 mb-6 rounded-lg text-sm border ${feedback.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-300' :
                        feedback.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-300'
                        }`}>
                        {feedback.text}
                        {feedback.txHash && (
                            <div className="mt-2">
                                <a
                                    href={`https://explorer.aptoslabs.com/txn/${feedback.txHash}?network=testnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-green-400 hover:text-green-300"
                                >
                                    View Transaction <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* Step Content */}
                <div className="p-8 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                    {currentStep === 1 && (
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">Model Configuration</h2>
                                <p className="text-foreground/60">Configure your ChatGPT model for deployment</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="Model Name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <FormInput
                                    label="Version"
                                    type="text"
                                    required
                                    value={formData.version}
                                    onChange={(e: any) => setFormData({ ...formData, version: e.target.value })}
                                />
                            </div>

                            <FormTextarea
                                label="Description"
                                required
                                value={formData.description}
                                onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="Model Size"
                                    type="text"
                                    value={formData.modelSize}
                                    onChange={(e: any) => setFormData({ ...formData, modelSize: e.target.value })}
                                />
                                <FormInput
                                    label="Price per Inference (APT)"
                                    type="number"
                                    step="0.001"
                                    value={formData.pricePerInference}
                                    onChange={(e: any) => setFormData({ ...formData, pricePerInference: e.target.value })}
                                />
                            </div>

                            <FormTextarea
                                label="Capabilities"
                                value={formData.capabilities}
                                onChange={(e: any) => setFormData({ ...formData, capabilities: e.target.value })}
                                placeholder="List the key capabilities of your model..."
                            />

                            <button
                                type="submit"
                                disabled={!account}
                                className="w-full flex items-center justify-center px-6 py-3 font-semibold bg-foreground text-background rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                            >
                                Next: Select Provider <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </form>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <ProviderSelection onSelect={handleProviderSelect} selected={selectedProvider} />

                            {selectedProvider && (
                                <div className="text-center pt-4">
                                    <button
                                        onClick={handleDeploy}
                                        disabled={isProcessing}
                                        className="px-8 py-3 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        Deploy to {selectedProvider.name}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <DeploymentProgress stage={deploymentStage} />
                    )}

                    {currentStep === 4 && (
                        <AuditProcess />
                    )}
                </div>
            </main>
        </div>
    )
}