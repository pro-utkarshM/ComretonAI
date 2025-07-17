'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Navigation } from '@/components/Navigation'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import { AlertTriangle, CheckCircle, Search, X, Loader2, Users, FileText, Cpu } from 'lucide-react'

// --- CONFIGURATION ---
const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0x..."
const config = new AptosConfig({ network: Network.TESTNET })
const aptos = new Aptos(config)

// --- HELPER COMPONENTS ---

const ModelCard = ({ model, onSelect }: { model: any, onSelect: () => void }) => {
    const status = {
        0: { text: 'Pending Audit', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10', icon: <AlertTriangle className="w-4 h-4" /> },
        1: { text: 'Verified', color: 'text-lime-400 border-lime-400/30 bg-lime-400/10', icon: <CheckCircle className="w-4 h-4" /> },
        2: { text: 'Rejected', color: 'text-red-400 border-red-400/30 bg-red-400/10', icon: <X className="w-4 h-4" /> }
    }[model.status] || {};

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
    );
};

const ModelDetailModal = ({ model, onClose, onRunInference }: { model: any, onClose: () => void, onRunInference: (modelId: string, input: string) => Promise<any> }) => {
    const [input, setInput] = useState('');
    const [isInferring, setIsInferring] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setIsInferring(true);
        setOutput('');
        setError('');
        try {
            const result = await onRunInference(model.id, input);
            setOutput(`Inference successful! (Mock Output) \nTransaction: ${result.hash.slice(0, 10)}...`);
        } catch (err: any) {
            setError(`Inference failed: ${err.message}`);
        }
        setIsInferring(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-2xl p-8 border border-foreground/10 rounded-xl bg-foreground/[0.02] relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-foreground/60 hover:text-white transition-colors"><X /></button>

                <h2 className="text-3xl font-bold text-white mb-2">{model.name}</h2>
                <p className="text-sm text-foreground/50 mb-6">Creator: <span className="font-mono">{model.creator}</span></p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Details & Audit */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-white mb-2 flex items-center"><FileText className="w-4 h-4 mr-2" />Details</h3>
                            <p className="text-sm text-foreground/60">{model.description}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-2 flex items-center"><Users className="w-4 h-4 mr-2" />Audit Trail</h3>
                            <div className="text-sm text-lime-400 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" /> Verified by {model.auditor_count} auditor(s).
                            </div>
                            {/* In a real app, you'd list the actual auditors here */}
                        </div>
                    </div>
                    {/* Right Column: Inference */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-white flex items-center"><Cpu className="w-4 h-4 mr-2" />Run Inference</h3>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full h-24 p-2 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-foreground/50"
                            placeholder="Enter your input data here..."
                        />
                        <button onClick={handleSubmit} disabled={isInferring} className="w-full flex items-center justify-center px-6 py-3 font-semibold bg-foreground text-background rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50">
                            {isInferring ? <Loader2 className="animate-spin" /> : `Run for ${(model.price_per_inference / 10 ** 8).toFixed(4)} APT`}
                        </button>
                        {(output || error) && (
                            <div className={`p-3 rounded-lg text-xs font-mono border ${error ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-lime-500/10 text-lime-300 border-lime-500/20'}`}>
                                {output || error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

export default function MarketplacePage() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [models, setModels] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedModel, setSelectedModel] = useState<any>(null);
    const [filter, setFilter] = useState<'All' | 'Verified' | 'Pending'>('All');

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        setIsLoading(true);
        try {
            const result: any = await aptos.view({
                payload: { function: `${MODULE_ADDRESS}::marketplace::get_all_models`, functionArguments: [MODULE_ADDRESS] }
            });
            setModels(result[0] as any[]);
        } catch (error) {
            console.error('Error fetching models:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const runInference = async (modelId: string, input: string) => {
        if (!account) throw new Error("Wallet not connected");

        // The transaction payload for `run_inference`
        const transaction = {
            function: `${MODULE_ADDRESS}::marketplace::run_inference`,
            functionArguments: [MODULE_ADDRESS, modelId],
        };

        return await signAndSubmitTransaction(transaction);
    };

    const filteredModels = useMemo(() => {
        if (filter === 'All') return models;
        if (filter === 'Verified') return models.filter(m => m.status === 1);
        if (filter === 'Pending') return models.filter(m => m.status === 0);
        return [];
    }, [models, filter]);

    const FilterButton = ({ value }: { value: 'All' | 'Verified' | 'Pending' }) => (
        <button onClick={() => setFilter(value)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${filter === value ? 'bg-foreground text-background' : 'text-foreground/60 hover:bg-foreground/10'}`}>
            {value}
        </button>
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 py-24 sm:py-32">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">Model Marketplace</h1>
                    <p className="text-lg text-foreground/70 mt-4 max-w-2xl mx-auto">Discover, audit, and utilize a new generation of provably safe AI models.</p>
                </header>

                {/* Filters */}
                <div className="flex justify-center items-center gap-2 mb-12 p-1 border border-foreground/10 rounded-full bg-foreground/[0.02] w-fit mx-auto">
                    <FilterButton value="All" />
                    <FilterButton value="Verified" />
                    <FilterButton value="Pending" />
                </div>

                {/* Models Grid */}
                {isLoading ? (
                    <div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
                ) : filteredModels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredModels.map((model) => (
                            <ModelCard key={model.id} model={model} onSelect={() => setSelectedModel(model)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-foreground/20 rounded-xl">
                        <p className="text-foreground/60">No models found for the selected filter.</p>
                    </div>
                )}
            </main>

            {selectedModel && <ModelDetailModal model={selectedModel} onClose={() => setSelectedModel(null)} onRunInference={runInference} />}
        </div>
    )
}