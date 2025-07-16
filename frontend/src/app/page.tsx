'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { ModelCard } from '@/components/ModelCard'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

const config = new AptosConfig({ network: Network.TESTNET })
const aptos = new Aptos(config)

// Replace with your deployed contract address
const MARKETPLACE_ADDRESS = "0x..."

export default function Home() {
  const { connected } = useWallet()
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const result = await aptos.view({
        payload: {
          function: `${MARKETPLACE_ADDRESS}::marketplace::get_all_models`,
          typeArguments: [],
          functionArguments: [MARKETPLACE_ADDRESS]
        }
      })

      setModels(result[0] as any[])
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Decentralized AI Marketplace
          </h1>
          <p className="text-xl text-gray-600">
            Deploy, audit, and use AI models with blockchain verification
          </p>
        </div>

        {!connected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              Please connect your wallet to interact with the marketplace
            </p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Available Models</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No models available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}