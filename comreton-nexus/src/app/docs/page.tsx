'use client'

import { useState, useEffect, useRef } from 'react'
import { Navigation } from '@/components/Navigation'
import { Book, Layers, Code, Cpu, ArrowRight } from 'lucide-react'

// Helper component for displaying function signatures cleanly
const FunctionSignature = ({ name, args, returns }: { name: string, args: string, returns?: string }) => (
    <div className="p-4 my-4 border border-foreground/10 rounded-lg bg-foreground/[0.02] font-mono text-sm">
        <span className="text-purple-400">public entry fun</span> <span className="text-teal-400">{name}</span>
        <span className="text-white">({args})</span>
        {returns && <><span className="text-purple-400">:</span> <span className="text-yellow-400">{returns}</span></>}
    </div>
);

// Main Docs Page Component
export default function DocsPage() {
    const [activeId, setActiveId] = useState('')
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const sections = document.querySelectorAll('section[id]');

        // Intersection Observer to track which section is in view
        observer.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id);
                }
            });
        }, { rootMargin: '-30% 0px -70% 0px' }); // Trigger when section is in the middle 30% of the screen

        sections.forEach(section => observer.current?.observe(section));

        return () => sections.forEach(section => observer.current?.observe(section));
    }, []);

    const navItems = [
        { id: 'introduction', title: 'Introduction' },
        { id: 'core-concepts', title: 'Core Concepts' },
        { id: 'smart-contract-api', title: 'Smart Contract API' },
        { id: 'off-chain-components', title: 'Off-Chain Components' },
        { id: 'getting-started', title: 'Getting Started' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
                {/* Page Header */}
                <header className="mb-16">
                    <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-foreground/5 border border-foreground/10 mb-6">
                        <Book className="w-8 h-8 text-foreground/80" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white">ComretonAI Documentation</h1>
                    <p className="text-lg text-foreground/60 mt-4 max-w-3xl">
                        A comprehensive guide to the architecture, smart contracts, and core concepts of the ComretonAI protocol.
                    </p>
                </header>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Table of Contents (Sticky Sidebar) */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <nav className="sticky top-24">
                            <h3 className="font-semibold text-white mb-4">On this page</h3>
                            <ul className="space-y-2">
                                {navItems.map(item => (
                                    <li key={item.id}>
                                        <a
                                            href={`#${item.id}`}
                                            className={`block text-sm transition-colors ${activeId === item.id ? 'text-white font-semibold' : 'text-foreground/60 hover:text-white'}`}
                                        >
                                            {item.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <article className="prose prose-invert max-w-none lg:col-span-9">
                        <section id="introduction">
                            <h2>1. Introduction</h2>
                            <p>ComretonAI is a decentralized AI execution and verification platform designed to run machine learning models with provable guarantees. By combining zero-knowledge proofs and the power of the Aptos blockchain, we create a trustless ecosystem where the integrity of every AI inference can be verified on-chain.</p>
                            <p>Our hybrid architecture separates on-chain trust logic from off-chain computation, ensuring that the platform is both highly secure and economically viable for real-world use.</p>
                        </section>

                        <section id="core-concepts">
                            <h2>2. Core Concepts</h2>
                            <p>The entire lifecycle of an AI model on our platform is transparent and secured by the Aptos blockchain.</p>
                            <ol>
                                <li><strong>Deploy & Package:</strong> A developer registers their AI model as a Verifiable Model Artifact (VMA).</li>
                                <li><strong>Audit & Stake:</strong> A decentralized network of auditors reviews the model and stakes APT to attest to its quality.</li>
                                <li><strong>Verify & List:</strong> Once a model reaches the required audit threshold, the contract automatically verifies it.</li>
                                <li><strong>Infer & Prove:</strong> A user pays a fee, a compute provider executes the model, generates a ZK-proof, and returns the result.</li>
                                <li><strong>Distribute & Earn:</strong> The contract verifies the proof and automatically distributes fees to all participants.</li>
                            </ol>
                        </section>

                        <section id="smart-contract-api">
                            <h2>3. Smart Contract API</h2>
                            <p>The core logic is managed by the <code>comreton_ai::marketplace</code> smart contract on the Aptos blockchain.</p>

                            <h3>Entry Functions</h3>
                            <p>These are the primary functions for interacting with the protocol.</p>
                            <FunctionSignature name="create_profile" args="user: &signer" />
                            <FunctionSignature name="run_inference" args="user: &signer, marketplace_addr: address, model_id: u64" />
                            <FunctionSignature name="register_model" args="creator: &signer, marketplace_addr: address, name: vector<u8>, ..." />
                            <FunctionSignature name="become_auditor" args="auditor: &signer, marketplace_addr: address, stake_amount: u64" />
                            <FunctionSignature name="audit_model" args="auditor: &signer, marketplace_addr: address, model_id: u64, approved: bool, ..." />

                            <h3>View Functions</h3>
                            <p>Read data from the contract without submitting a transaction.</p>
                            <FunctionSignature name="get_model" args="marketplace_addr: address, model_id: u64" returns="Model" />
                            <FunctionSignature name="get_all_models" args="marketplace_addr: address" returns="vector<Model>" />
                            <FunctionSignature name="get_user_profile" args="user_addr: address" returns="(vector<u64>, u64, bool, u64)" />
                        </section>

                        <section id="off-chain-components">
                            <h2>4. Off-Chain Components</h2>
                            <div className="flex items-start gap-4 p-4 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                                <Code className="w-8 h-8 text-foreground/50 mt-1" />
                                <div>
                                    <h4 className="font-bold text-white">ComretonAI SDK</h4>
                                    <p>A command-line tool and library for easily packaging models, uploading them to IPFS, and calling the on-chain `register_model` function.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 mt-4 p-4 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                                <Cpu className="w-8 h-8 text-foreground/50 mt-1" />
                                <div>
                                    <h4 className="font-bold text-white">Decentralized Compute Executor</h4>
                                    <p>A lightweight service anyone can run to process inference jobs. It listens for on-chain events, executes models, generates proofs, and submits results.</p>
                                </div>
                            </div>
                        </section>

                        <section id="getting-started">
                            <h2>5. Getting Started</h2>
                            <p>Ready to deploy your first verifiable AI model? Follow these steps.</p>
                            <ol>
                                <li><strong>Install Prerequisites:</strong> Ensure you have the Aptos CLI and a funded devnet account.</li>
                                <li><strong>Create Your Profile:</strong> Call the `create_profile` function to initialize your account on ComretonAI.</li>
                                <li><strong>Prepare Your Model:</strong> Package your model into one of the supported formats.</li>
                                <li><strong>Deploy via SDK:</strong> Use the `comretonai deploy` command. This handles uploading your model and registering it on-chain.</li>
                                <li><strong>Await Audits:</strong> Your model is now visible to auditors. Once verified, you'll start earning rewards from every inference.</li>
                            </ol>
                        </section>
                    </article>
                </div>
            </div>
        </div>
    )
}