'use client'

import { useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Navigation } from '@/components/Navigation'
import { Upload, FileText, Tag, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

// This should be in your .env.local file
const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0x..."

const config = new AptosConfig({ network: Network.TESTNET })
const aptos = new Aptos(config)

// A styled input component to keep the form DRY
const FormInput = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">{label}</label>
        <input
            {...props}
            className="w-full px-4 py-2 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-foreground/50 transition-colors"
        />
    </div>
);

const FormTextarea = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">{label}</label>
        <textarea
            {...props}
            className="w-full min-h-[120px] px-4 py-2 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-foreground/50 transition-colors"
        />
    </div>
);

const FormSelect = ({ label, children, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">{label}</label>
        <select {...props} className="w-full px-4 py-2 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-foreground/50 transition-colors appearance-none">
            {children}
        </select>
    </div>
);


export default function DeployModel() {
    const { account, signAndSubmitTransaction } = useWallet()
    const [isDeploying, setIsDeploying] = useState(false)
    const [feedback, setFeedback] = useState({ type: '', text: '' })
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Computer Vision',
        price: '0.01',
        modelFile: null as File | null,
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, modelFile: e.target.files?.[0] || null })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!account || !formData.modelFile) {
            setFeedback({ type: 'error', text: 'Please connect your wallet and select a model file.' })
            return
        }

        setIsDeploying(true)
        setFeedback({ type: '', text: '' })

        try {
            // In a real app, upload the file to IPFS and get the real hash
            // For this demo, we'll continue to use a mock hash.
            const ipfsHash = 'Qm' + Array(44).fill(0).map(() => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 62))).join('')

            setFeedback({ type: 'info', text: `Uploading to IPFS... (mocked) Hash: ${ipfsHash.slice(0, 12)}...` })

            // The v2 SDK prefers building a simple transaction object like this.
            // It automatically handles encoding arguments correctly.
            const transaction = await aptos.transaction.build.simple({
                sender: account.address,
                data: {
                    function: `${MODULE_ADDRESS}::model_registry::register_model`,
                    functionArguments: [
                        formData.name,
                        formData.description,
                        ipfsHash,
                        // Note: Our simplified contract may not have category/price on register
                        // Adjust arguments based on your final `register_model` function signature
                    ]
                }
            })

            setFeedback({ type: 'info', text: 'Please approve the transaction in your wallet...' })

            const response = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({ transactionHash: response.hash });

            setFeedback({ type: 'success', text: `Model deployed successfully! Tx: ${response.hash.slice(0, 10)}...` })

            // Reset form
            setFormData({
                name: '',
                description: '',
                category: 'Computer Vision',
                price: '0.01',
                modelFile: null,
            })

        } catch (error: any) {
            console.error('Error deploying model:', error)
            setFeedback({ type: 'error', text: `Deployment failed: ${error.message}` })
        } finally {
            setIsDeploying(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />

            <main className="max-w-3xl mx-auto px-4 py-24 sm:py-32">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">Deploy your Intelligence</h1>
                    <p className="text-lg text-foreground/70 mt-4">Package your AI model as a Verifiable Model Artifact and register it on-chain.</p>
                </div>

                <div className="p-8 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormInput
                            label="Model Name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Vision Transformer v2"
                        />
                        <FormTextarea
                            label="Description"
                            required
                            value={formData.description}
                            onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your model's capabilities and use cases..."
                        />
                        {/* File Input - Custom Styled */}
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2">Model File</label>
                            <label htmlFor="file-upload" className="relative cursor-pointer w-full flex flex-col items-center justify-center h-32 px-4 py-6 border-2 border-dashed border-foreground/20 rounded-lg bg-foreground/5 hover:border-foreground/30 transition-colors">
                                <Upload className="w-8 h-8 text-foreground/50 mb-2" />
                                <span className="text-sm text-foreground/80 font-semibold">Click to upload or drag and drop</span>
                                <span className="text-xs text-foreground/60">ONNX, PT, H5, or other model formats</span>
                            </label>
                            <input id="file-upload" type="file" required accept=".onnx,.pt,.h5,.pb" onChange={handleFileChange} className="hidden" />
                            {formData.modelFile && (
                                <p className="text-sm text-lime-400 mt-2">Selected: {formData.modelFile.name}</p>
                            )}
                        </div>

                        {/* Feedback Message */}
                        {feedback.text && (
                            <div className={`flex items-start gap-3 p-3 rounded-lg text-sm border ${feedback.type === 'success' ? 'bg-success/10 border-success/20 text-success' :
                                    feedback.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                        'bg-foreground/10 border-foreground/20 text-foreground/80'
                                }`}>
                                {feedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : feedback.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                                <span className="flex-1">{feedback.text}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!account || isDeploying}
                            className="w-full flex items-center justify-center px-6 py-3 font-semibold bg-foreground text-background rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeploying ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Deploying...</> : 'Deploy Model to Marketplace'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}