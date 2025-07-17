'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Navigation } from '@/components/Navigation'
import { Shield, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

// This should be in your .env.local file
const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0x..."

const config = new AptosConfig({ network: Network.TESTNET })
const aptos = new Aptos(config)

// --- Helper Components for different states ---

const ConnectWalletPrompt = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
        <AlertCircle className="w-12 h-12 text-foreground/50 mb-4" />
        <h2 className="text-xl font-bold text-white">Connect Your Wallet</h2>
        <p className="text-foreground/60 mt-2">Please connect your wallet to access the auditing features of ComretonAI.</p>
    </div>
);

const LoadingSpinner = () => <Loader2 className="w-5 h-5 animate-spin" />;

// --- Main Audit Page Component ---

export default function AuditPage() {
    const { account, signAndSubmitTransaction, connected } = useWallet()

    // State Management
    const [models, setModels] = useState<any[]>([])
    const [isAuditor, setIsAuditor] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' })

    // Form States
    const [stakeAmount, setStakeAmount] = useState('1000') // Example stake
    const [selectedModel, setSelectedModel] = useState<any>(null)
    const [auditFeedback, setAuditFeedback] = useState('')

    // --- Data Fetching ---
    useEffect(() => {
        if (connected && account?.address) {
            initializeAuditorState();
        } else {
            setIsLoading(false);
        }
    }, [account, connected])

    const initializeAuditorState = async () => {
        setIsLoading(true);
        setFeedbackMessage({ type: '', text: '' });
        await checkAuditorStatus();
        await fetchPendingModels();
        setIsLoading(false);
    }

    const checkAuditorStatus = async () => {
        if (!account?.address) return;
        try {
            // NOTE: Replace with your actual contract function if it exists
            // This is a placeholder as `get_user_profile` wasn't defined in our previous contracts.
            // For now, we'll assume a user who stakes becomes an auditor.
            // You would typically check if they have a stake record.
            setIsAuditor(true); // Placeholder
        } catch (error) {
            console.error('Error checking auditor status:', error)
            setIsAuditor(false); // Assume not an auditor on error
        }
    }

    const fetchPendingModels = async () => {
        try {
            const result: any = await aptos.view({
                payload: {
                    function: `${MODULE_ADDRESS}::model_registry::get_all_models`,
                    functionArguments: []
                }
            })
            // Assuming the status enum is 0 for Pending
            const pending = (result[0] as any[]).filter(m => m.status === 0)
            setModels(pending)
        } catch (error) {
            console.error('Error fetching models:', error)
        }
    }

    // --- Transaction Functions ---

    const becomeAuditor = async () => {
        // This function would be where you stake to become an auditor.
        // The UI for this is shown below if `isAuditor` is false.
        // Logic would be similar to `submitAudit`.
        alert("Stake functionality to be implemented based on your contract.");
    }

    const submitAudit = async (approved: boolean) => {
        if (!selectedModel || isSubmitting) return;

        setIsSubmitting(true);
        setFeedbackMessage({ type: '', text: '' });

        try {
            const payload = {
                function: `${MODULE_ADDRESS}::audit_staking::attest`,
                functionArguments: [
                    selectedModel.model_id,
                    (parseFloat(stakeAmount) * 1_000_000_00).toString(), // Example stake amount
                    // We'll approve/reject based on the button clicked
                    // Your contract may need different arguments here
                ]
            }

            const response = await signAndSubmitTransaction(payload)
            await aptos.waitForTransaction({ transactionHash: response.hash })

            setFeedbackMessage({ type: 'success', text: 'Audit submitted successfully!' });
            setSelectedModel(null);
            setAuditFeedback('');
            fetchPendingModels(); // Refresh the list
        } catch (error: any) {
            console.error('Error submitting audit:', error);
            setFeedbackMessage({ type: 'error', text: `Audit submission failed: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    }

    // --- Render Logic ---

    const renderContent = () => {
        if (!connected) return <ConnectWalletPrompt />;
        if (isLoading) return <div className="text-center p-12"><LoadingSpinner /></div>;

        // --- This is the main view for an active auditor ---
        if (isAuditor) {
            if (selectedModel) {
                // --- Audit Form View ---
                return (
                    <div className="p-8 border border-foreground/10 rounded-xl bg-foreground/[0.02] animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-1">Auditing Model: <span className="text-teal-400">{selectedModel.name}</span></h2>
                        <p className="text-foreground/60 mb-6">Model ID: {selectedModel.model_id}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1">Audit Feedback</label>
                                <textarea
                                    value={auditFeedback}
                                    onChange={(e) => setAuditFeedback(e.target.value)}
                                    className="w-full min-h-[120px] px-3 py-2 border border-foreground/20 rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-teal-400"
                                    placeholder="Provide detailed feedback on the model's safety, bias, and performance..."
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={() => submitAudit(true)} disabled={isSubmitting} className="flex-1 flex items-center justify-center px-6 py-3 font-semibold bg-lime-400 text-background rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <LoadingSpinner /> : <><CheckCircle className="h-5 w-5 mr-2" />Approve</>}
                                </button>
                                <button onClick={() => submitAudit(false)} disabled={isSubmitting} className="flex-1 flex items-center justify-center px-6 py-3 font-semibold bg-red-500/80 text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <LoadingSpinner /> : <><XCircle className="h-5 w-5 mr-2" />Reject</>}
                                </button>
                                <button onClick={() => setSelectedModel(null)} disabled={isSubmitting} className="px-6 py-3 font-semibold border border-foreground/20 rounded-lg transition-colors hover:border-foreground/50 hover:text-white">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                );
            } else {
                // --- Model List View ---
                return (
                    <div>
                        <div className="flex items-center p-4 mb-8 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                            <Shield className="h-6 w-6 text-lime-400 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-white">Auditor Status: Active</h3>
                                <p className="text-sm text-foreground/60">Review pending models below to help secure the network and earn rewards.</p>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Pending Models for Audit</h2>
                        {models.length === 0 ? (
                            <div className="text-center p-12 border border-dashed border-foreground/20 rounded-xl">
                                <p className="text-foreground/60">No models are currently awaiting audit. Great work!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {models.map((model) => (
                                    <div key={model.model_id} className="p-6 border border-foreground/10 rounded-xl bg-background/50 flex flex-col">
                                        <h3 className="text-lg font-bold text-white mb-2">{model.name}</h3>
                                        <p className="text-foreground/60 text-sm mb-4 flex-grow line-clamp-2">{model.description}</p>
                                        <div className="text-xs text-foreground/50 mb-4">ID: {model.model_id}</div>
                                        <button onClick={() => setSelectedModel(model)} className="w-full mt-auto px-4 py-2 font-semibold bg-foreground/10 border border-transparent rounded-lg transition-colors hover:bg-foreground/20 hover:border-foreground/30">
                                            Review Model
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }
        }

        // --- View for users who are NOT auditors ---
        // You can build out a "Become an Auditor" form here if needed.
        return <div className="text-center p-12 border border-dashed border-foreground/20 rounded-xl"><p className="text-foreground/60">Auditor-only area. Functionality to become an auditor is coming soon.</p></div>;
    };


    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />
            <main className="max-w-6xl mx-auto px-4 py-24 sm:py-32">
                <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white">Auditor Dashboard</h1>
                {feedbackMessage.text && (
                    <div className={`p-4 mb-6 rounded-lg text-sm border ${feedbackMessage.type === 'success' ? 'bg-lime-500/10 border-lime-500/20 text-lime-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                        {feedbackMessage.text}
                    </div>
                )}
                {renderContent()}
            </main>
        </div>
    )
}