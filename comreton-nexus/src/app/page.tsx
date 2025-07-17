'use client'

import { Navigation } from '@/components/Navigation'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { NeuralFlow } from '@/components/NeuralFlow' // This will be our new animated component
import { Brain, Shield, Code, Cpu, Zap, Lock, Users, Coins, ArrowRight, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    // The bg color is now on the root div, which is good.
    <div className="min-h-screen bg-nexus-bg text-nexus-text overflow-x-hidden">
      <Navigation />

      <main className="w-full">
        {/* Section 1: Hero - The First Impression */}
        {/* This section now uses relative positioning for its contents and a z-index to layer them correctly. */}
        <section className="relative w-full min-h-screen flex items-center justify-center text-center overflow-hidden px-4">
          {/* Background Gradient & Effects */}
          <div className="absolute inset-0 -z-20 bg-grid-pattern opacity-30"></div>
          <div className="absolute top-1/2 left-1/2 w-[50vw] h-[50vw] bg-nexus-purple/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl -z-10 animate-float"></div>

          <div className="relative z-10">
            <span className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-nexus-surface/80 border border-nexus-border backdrop-blur-sm text-nexus-cyan font-semibold">
              <Zap className="h-5 w-5 mr-2" />
              World's First Verifiable AI Protocol
            </span>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="gradient-text">AI You Can Trust.</span>
              <br />
              <span>Verifiably.</span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-3xl mx-auto">
              ComretonAI separates <strong className="text-text-primary">on-chain trust</strong> from <strong className="text-text-primary">off-chain computation</strong> to create a provably safe and transparent AI marketplace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/marketplace" className="cybernetic-btn group">
                Explore Marketplace <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/litepaper" className="outline-btn group">
                Read the Litepaper <Brain className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: The Proof - On-Chain Metrics Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="metrics-bar grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 text-center glass-card p-8 border-b-4 border-nexus-blue">
            <div>
              <p className="text-text-secondary text-sm mb-2">Total Value Staked</p>
              <AnimatedCounter end={1234567} prefix="$" />
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-2">Models Verified</p>
              <AnimatedCounter end={42} />
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-2">Inferences Processed</p>
              <AnimatedCounter end={1987654} />
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-2">Active Compute Nodes</p>
              <AnimatedCounter end={256} />
            </div>
          </div>
        </div>

        {/* Section 3: The Animation - "How ComretonAI Works" */}
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black">How <span className="gradient-text">ComretonAI</span> Works</h2>
              <p className="text-lg text-text-secondary mt-4 max-w-3xl mx-auto">
                A revolutionary protocol ensuring AI safety via cryptographic proofs and community governance.
              </p>
            </div>
            {/* The new, animated NeuralFlow component will go here */}
            <NeuralFlow />
          </div>
        </section>

        {/* Section 4: The Personas - "Join the Verification Economy" */}
        <section className="py-24 sm:py-32 bg-surface-1 rounded-t-3xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black">Join the <span className="gradient-text">Verification Economy</span></h2>
              <p className="text-lg text-text-secondary mt-4 max-w-3xl mx-auto">
                Three ways to participate in the decentralized AI revolution and earn rewards.
              </p>
            </div>
            {/* These cards are now properly centered within the grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Persona Cards remain the same but will now be centered */}
              {/* For AI Developers */}
              <div className="persona-card border-brand-blue">
                <div className="persona-icon bg-brand-blue/10 text-brand-blue"><Code className="h-10 w-10" /></div>
                <h3 className="text-2xl font-bold mb-4 text-text-primary">Deploy & Monetize</h3>
                <p className="text-text-secondary mb-8">Immutable IP rights, automated revenue sharing, and access to a global compute network.</p>
                <Link href="/deploy" className="outline-btn w-full mt-auto">Deploy a Model</Link>
              </div>

              {/* For Auditors & Stakers */}
              <div className="persona-card border-brand-purple">
                <div className="persona-icon bg-brand-purple/10 text-brand-purple"><Shield className="h-10 w-10" /></div>
                <h3 className="text-2xl font-bold mb-4 text-text-primary">Secure & Stake</h3>
                <p className="text-text-secondary mb-8">Put your expertise to work. Review models, stake COMAI, and earn a share of every inference fee.</p>
                <Link href="/audit" className="outline-btn w-full mt-auto">View Audit Tasks</Link>
              </div>

              {/* For Compute Providers */}
              <div className="persona-card border-success">
                <div className="persona-icon bg-success/10 text-success"><Cpu className="h-10 w-10" /></div>
                <h3 className="text-2xl font-bold mb-4 text-text-primary">Power & Earn</h3>
                <p className="text-text-secondary mb-8">Connect idle GPUs. Our simple SDK lets you securely execute jobs and earn COMAI for every computation.</p>
                <Link href="/compute" className="outline-btn w-full mt-auto">Become a Provider</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 & Footer CTA can remain similar but wrapped in max-width containers */}

      </main>
    </div>
  )
}