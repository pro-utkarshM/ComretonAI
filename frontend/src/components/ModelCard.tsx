'use client'

import { useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Brain, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

const config = new AptosConfig({ network: Network.TESTNET })
const aptos = new Aptos(config)

interface ModelProps {
    model: {
        id: number
        name: string
        description: string
        category: string
        price_per_inference: number
        status: number
        total_inferences: number
        creator: string
    }
}

export function ModelCard({ model }: ModelProps) {
    const { account, signAndSubmitTransaction } = useWallet()
    const [isRunning, setIsRunning] = useState(false)

    const getStatusBadge = () => {
        switch (model.status) {
            case 0:
                return (
                    <span className="flex items-center text-yellow-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Pending Audit
                    </span>
                )
            case 1:
                return (
                    <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                    </span>
                )
            default:
                return null
        }
    }

    const runInference = async () => {
        if (!account) return

        setIsRunning(true)
        try {
            const payload = {
                type: "entry_function_payload",
                function: `${process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS}::marketplace::run_inference`,
                type_arguments: [],
                arguments: [
                    process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS,
                    model.id.toString()
                ]
            }

            const response = await signAndSubmitTransaction(payload)
            await aptos.waitForTransaction({ transactionHash: response.hash })

            alert('Inference completed successfully!')
        } catch (error) {
            console.error('Error running inference:', error)
            alert('Error running inference')
        } finally {
            setIsRunning(false)
        }
    }

    const formatPrice = (price: number) => {
        return (price / 100000000).toFixed(4) // Convert from Octas to APT
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <Brain className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                        <h3 className="text-lg font-semibold">{model.name}</h3>
                        <p className="text-sm text-gray-500">{model.category}</p>
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">{model.description}</p>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-500">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="text-sm">{formatPrice(model.price_per_inference)} APT/inference</span>
                </div>
                <span className="text-sm text-gray-500">
                    {model.total_inferences} runs
                </span>
            </div>

            <div className="text-xs text-gray-400 mb-4">
                Creator: {model.creator.slice(0, 6)}...{model.creator.slice(-4)}
            </div>

            {model.status === 1 && account && (
                <button
                    onClick={runInference}
                    disabled={isRunning}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRunning ? 'Running...' : 'Run Inference'}
                </button>
            )}
        </div>
    )
}