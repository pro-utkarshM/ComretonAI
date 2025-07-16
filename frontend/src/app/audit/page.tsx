'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Navbar } from '@/components/Navbar'
import { Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

const config = new AptosConfig({ network: Network.TESTNET })
const aptos = new Aptos(config)

export default function AuditPage() {
    const { account, signAndSubmitTransaction } = useWallet()
    const [models, setModels] = useState<any[]>([])
    const [isAuditor, setIsAuditor] = useState(false)
    const [stakeAmount, setStakeAmount] = useState('0.01')
    const [selectedModel, setSelectedModel] = useState<any>(null)
    const [feedback, setFeedback] = useState('')

    useEffect(() => {
        if (account) {
            checkAuditorStatus()
            fetchPendingModels()
        }
    }, [account])

    const checkAuditorStatus = async () => {
        try {
            const result = await aptos.view({
                payload: {
                    function: `${process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS}::marketplace::get_user_profile`,
                    typeArguments: [],
                    functionArguments: [account!.address]
                }
            })

            setIsAuditor(result[2] as boolean)
        } catch (error) {
            console.error('Error checking auditor status:', error)
        }
    }

    const fetchPendingModels = async () => {
        try {
            const result = await aptos.view({
                payload: {
                    function: `${process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS}::marketplace::get_all_models`,
                    typeArguments: [],
                    functionArguments: [process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS]
                }
            })

            const allModels = result[0] as any[]
            const pending = allModels.filter(m => m.status === 0)
            setModels(pending)
        } catch (error) {
            console.error('Error fetching models:', error)
        }
    }

    const becomeAuditor = async () => {
        try {
            const payload = {
                type: "entry_function_payload",
                function: `${process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS}::marketplace::become_auditor`,
                type_arguments: [],
                arguments: [
                    process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS,
                    Math.floor(parseFloat(stakeAmount) * 100000000).toString()
                ]
            }

            const response = await signAndSubmitTransaction(payload)
            await aptos.waitForTransaction({ transactionHash: response.hash })

            setIsAuditor(true)
            alert('Successfully became an auditor!')
        } catch (error) {
            console.error('Error becoming auditor:', error)
            alert('Error becoming auditor')
        }
    }

    const submitAudit = async (approved: boolean) => {
        if (!selectedModel) return

        try {
            const payload = {
                type: "entry_function_payload",
                function: `${process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS}::marketplace::audit_model`,
                type_arguments: [],
                arguments: [
                    process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS,
                    selectedModel.id.toString(),
                    approved,
                    Array.from(new TextEncoder().encode(feedback))
                ]
            }

            const response = await signAndSubmitTransaction(payload)
            await aptos.waitForTransaction({ transactionHash: response.hash })

            alert('Audit submitted successfully!')
            setSelectedModel(null)
            setFeedback('')
            fetchPendingModels()
        } catch (error) {
            console.error('Error submitting audit:', error)
            alert('Error submitting audit')
        }
    }

    if (!account) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">Please connect your wallet to access auditing features</p>
                    </div>
                </main>
            </div>
        )
    }

    if (!isAuditor) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-8">Become an Auditor</h1>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start mb-4">
                            <Shield className="h-8 w-8 text-blue-600 mr-3 flex-shrink-0" />
                            <div>
                                <h2 className="text-xl font-semibold mb-2">Join the Auditor Network</h2>
                                <p className="text-gray-600">
                                    As an auditor, you'll help ensure the safety and quality of AI models on the platform.
                                    Stake APT tokens to become an auditor and earn rewards for your contributions.
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stake Amount (APT)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum stake: 0.01 APT</p>
                        </div>

                        <button
                            onClick={becomeAuditor}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                        >
                            Stake & Become Auditor
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Audit Models</h1>

                {selectedModel ? (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4">Auditing: {selectedModel.name}</h2>

                        <div className="mb-4">
                            <p className="text-gray-600 mb-2">{selectedModel.description}</p>
                            <p className="text-sm text-gray-500">Category: {selectedModel.category}</p>
                            <p className="text-sm text-gray-500">Price: {(selectedModel.price_per_inference / 100000000).toFixed(4)} APT</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Audit Feedback
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Provide detailed feedback about the model..."
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => submitAudit(true)}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                            >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Approve
                            </button>

                            <button
                                onClick={() => submitAudit(false)}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                            >
                                <XCircle className="h-5 w-5 mr-2" />
                                Reject
                            </button>

                            <button
                                onClick={() => setSelectedModel(null)}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                                <p className="text-blue-800">
                                    You are an active auditor. Review pending models below to earn rewards.
                                </p>
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold mb-4">Pending Models</h2>

                        {models.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                <p className="text-gray-500">No models pending audit</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {models.map((model) => (
                                    <div key={model.id} className="bg-white rounded-lg shadow-md p-4">
                                        <h3 className="text-lg font-semibold mb-2">{model.name}</h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{model.description}</p>

                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm text-gray-500">{model.category}</span>
                                            <span className="text-sm text-gray-500">
                                                {(model.price_per_inference / 100000000).toFixed(4)} APT
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => setSelectedModel(model)}
                                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Review Model
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}