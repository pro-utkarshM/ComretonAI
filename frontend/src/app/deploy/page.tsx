'use client'

import { useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Navbar } from '@/components/Navbar'
import { Upload, FileText, Tag, DollarSign } from 'lucide-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

const config = new AptosConfig({ network: Network.TESTNET })
const aptos = new Aptos(config)

export default function DeployModel() {
    const { account, signAndSubmitTransaction } = useWallet()
    const [isDeploying, setIsDeploying] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Computer Vision',
        price: '0.01',
        modelFile: null as File | null,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!account || !formData.modelFile) return

        setIsDeploying(true)
        try {
            // In a real implementation, upload to IPFS first
            const ipfsHash = 'QmExampleHash123' // Mock IPFS hash

            const payload = {
                type: "entry_function_payload",
                function: `${process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS}::marketplace::register_model`,
                type_arguments: [],
                arguments: [
                    process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS,
                    Array.from(new TextEncoder().encode(formData.name)),
                    Array.from(new TextEncoder().encode(formData.description)),
                    Array.from(new TextEncoder().encode(ipfsHash)),
                    Array.from(new TextEncoder().encode(formData.category)),
                    Math.floor(parseFloat(formData.price) * 100000000).toString() // Convert to Octas
                ]
            }

            const response = await signAndSubmitTransaction(payload)
            await aptos.waitForTransaction({ transactionHash: response.hash })

            alert('Model deployed successfully!')
            // Reset form
            setFormData({
                name: '',
                description: '',
                category: 'Computer Vision',
                price: '0.01',
                modelFile: null,
            })
        } catch (error) {
            console.error('Error deploying model:', error)
            alert('Error deploying model')
        } finally {
            setIsDeploying(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold mb-8">Deploy AI Model</h1>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="inline h-4 w-4 mr-1" />
                            Model Name
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., GPT-2 Fine-tuned for Code"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Describe your model's capabilities and use cases..."
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Tag className="inline h-4 w-4 mr-1" />
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>Computer Vision</option>
                            <option>Natural Language Processing</option>
                            <option>Audio Processing</option>
                            <option>Generative AI</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <DollarSign className="inline h-4 w-4 mr-1" />
                            Price per Inference (APT)
                        </label>
                        <input
                            type="number"
                            required
                            step="0.001"
                            min="0.001"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Upload className="inline h-4 w-4 mr-1" />
                            Model File
                        </label>
                        <input
                            type="file"
                            required
                            accept=".onnx,.pt,.h5,.pb"
                            onChange={(e) => setFormData({ ...formData, modelFile: e.target.files?.[0] || null })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Supported formats: ONNX, PyTorch, TensorFlow, Keras
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={!account || isDeploying}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeploying ? 'Deploying...' : 'Deploy Model'}
                    </button>
                </form>
            </main>
        </div>
    )
}