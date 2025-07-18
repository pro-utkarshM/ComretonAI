'use client'

import { Navigation } from '@/components/Navigation'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { NeuralFlow } from '@/components/NeuralFlow'
import {
  Brain,
  ShieldCheck,
  Code,
  Cpu,
  Zap,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation />

      <main className="w-full">
        {/* Section 1: Hero */}
        <section className="relative w-full h-screen flex flex-col items-center justify-center text-center px-4">
          <div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vw] max-w-4xl max-h-4xl bg-radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_60%) -translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10">
            <span className="inline-flex items-center px-4 py-1.5 mb-6 text-sm rounded-full border border-foreground/20 bg-foreground/5">
              <Zap className="h-4 w-4 mr-2 text-foreground/80" />
              The Future of Verifiable AI is Here
            </span>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60">
              On-Chain Truth for <br /> Off-Chain Intelligence.
            </h1>

            <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-3xl mx-auto">
              ComretonAI is the decentralized protocol for provably safe and transparent AI execution, powered by Aptos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/marketplace" className="group flex items-center justify-center w-full sm:w-auto px-6 py-3 font-semibold bg-foreground text-background rounded-lg transition-transform hover:scale-105">
                Explore Marketplace
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/docs" className="group flex items-center justify-center w-full sm:w-auto px-6 py-3 font-semibold border border-foreground/20 rounded-lg transition-colors hover:border-foreground/50 hover:text-white">
                Read the Docs
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: Metrics Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px text-center bg-foreground/5 border border-foreground/10 rounded-xl overflow-hidden backdrop-blur-md">
            <div className="px-4 py-8">
              <p className="text-sm text-foreground/60 mb-2">Total Value Staked</p>
              <AnimatedCounter end={1234567} prefix="$" />
            </div>
            <div className="px-4 py-8">
              <p className="text-sm text-foreground/60 mb-2">Models Verified</p>
              <AnimatedCounter end={42} />
            </div>
            <div className="px-4 py-8">
              <p className="text-sm text-foreground/60 mb-2">Inferences Processed</p>
              <AnimatedCounter end={1987654} />
            </div>
            <div className="px-4 py-8">
              <p className="text-sm text-foreground/60 mb-2">Active Compute Nodes</p>
              <AnimatedCounter end={256} />
            </div>
          </div>
        </section>

        {/* Section 3: How It Works - NOW WITH NEURAL FLOW */}
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold">The Protocol in Action.</h2>
              <p className="text-lg text-foreground/70 mt-4 max-w-2xl mx-auto">
                Watch a live simulation of our protocol, from model deployment to verified inference and revenue sharing.
              </p>
            </div>

            {/* The new component is simply placed here */}
            <NeuralFlow />

          </div>
        </section>

        {/* Section 4: Personas */}
        <section className="py-24 sm:py-32 bg-foreground/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold">The AI Verification Economy</h2>
              <p className="text-lg text-foreground/70 mt-4 max-w-2xl mx-auto">
                Whether you build, secure, or power AI, there&apos;s a role for you in the ComretonAI ecosystem.
              </p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="p-8 border border-foreground/10 rounded-xl bg-background/50 transition-all hover:border-foreground/20 hover:bg-foreground/[0.04]">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-foreground/10 mb-4"><Code className="w-6 h-6 text-foreground/80" /></div>
                <h3 className="text-xl font-bold text-white mb-2">For Developers</h3>
                <p className="mb-4">Monetize your models with automated, on-chain revenue sharing and immutable IP protection.</p>

                <Link href="/deploy" className="font-semibold text-white group flex items-center">Learn More <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </div>
              <div className="p-8 border border-foreground/10 rounded-xl bg-background/50 transition-all hover:border-foreground/20 hover:bg-foreground/[0.04]">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-foreground/10 mb-4"><ShieldCheck className="w-6 h-6 text-foreground/80" /></div>
                <h3 className="text-xl font-bold text-white mb-2">For Auditors</h3>
                <p className="mb-4">Put your expertise to work. Earn yield by staking on models you&apos;ve verified, securing the ecosystem.</p>

                <Link href="/audit" className="font-semibold text-white group flex items-center">Learn More <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </div>
              <div className="p-8 border border-foreground/10 rounded-xl bg-background/50 transition-all hover:border-foreground/20 hover:bg-foreground/[0.04]">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-foreground/10 mb-4"><Cpu className="w-6 h-6 text-foreground/80" /></div>
                <h3 className="text-xl font-bold text-white mb-2">For Compute Providers</h3>
                <p className="mb-4">Connect idle hardware, securely execute jobs with our SDK, and earn rewards for powering the network.</p>

                <Link href="/compute" className="font-semibold text-white group flex items-center">Learn More <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </div>
            </div>
          </div>
        </section>
        {/* --- NEW SECTION: The Verifiable Pipeline --- */}
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white">The Verifiable Pipeline</h2>
              <p className="text-lg text-foreground/70 mt-4 max-w-3xl mx-auto">
                From a developer&apos;s code to a user&apos;s result, every step is cryptographically secured and transparently recorded.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* Left Column: Execution & Verification Flow */}
              <div className="space-y-8">
                {[
                  { title: "Model Upload", desc: "Creator uploads the Verifiable Model Artifact (VMA)." },
                  { title: "Resource Allocation", desc: "Smart contract matches the model to an optimal compute provider." },
                  { title: "Secure Execution", desc: "A sandboxed kernel executes the model with layer-by-layer tracking." },
                  { title: "Proof Generation", desc: "A ZK-proof of the computation's integrity is created." },
                  { title: "Community Audit", desc: "Staked auditors verify the model's safety and vote on-chain." },
                  { title: "Marketplace Listing", desc: "The verified model becomes available for public use." }
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 flex items-center justify-center font-bold text-background bg-foreground rounded-full">
                        {index + 1}
                      </div>
                      {index < 5 && <div className="w-px h-12 bg-foreground/20 mt-2"></div>}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{step.title}</h3>
                      <p className="text-foreground/60">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Protocol Lifecycle & Math */}
              <div className="sticky top-24 space-y-4">
                <div className="p-6 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                  <h4 className="font-bold text-white mb-2">Phase 1: Model Registration (VMA)</h4>
                  <code className="block text-xs text-foreground/70 bg-background/50 p-3 rounded">
                    - model.onnx<br />
                    - spec.move<br />
                    - Layer Hashes & Genesis Hash H₀
                  </code>
                </div>
                <div className="p-6 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                  <h4 className="font-bold text-white mb-2">Phase 2: Provable Execution (PEE)</h4>
                  <p className="text-xs text-foreground/60 mb-2">The PEE generates a hash for each layer&apos;s state:</p>
                  <code className="block text-xs text-center text-foreground/70 bg-background/50 p-3 rounded">
                    H<sub className="text-xs">i</sub> = <span className="text-teal-400">H</span>(H<sub className="text-xs">i-1</sub> || <span className="text-teal-400">H</span>(W<sub className="text-xs">i</sub>) || <span className="text-teal-400">H</span>(A<sub className="text-xs">i-1</sub>))
                  </code>
                </div>
                <div className="p-6 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                  <h4 className="font-bold text-white mb-2">Phase 3: Community Auditing</h4>
                  <p className="text-xs text-foreground/60 mb-2">A model is verified if the sum of approving stakes (S) meets the threshold (Θ):</p>
                  <code className="block text-xs text-center text-foreground/70 bg-background/50 p-3 rounded">
                    <span className="text-purple-400">Σ</span> S<sub className="text-xs">i</sub> ≥ Θ
                  </code>
                </div>
                <div className="p-6 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                  <h4 className="font-bold text-white mb-2">Phase 4: Inference & ZKP</h4>
                  <p className="text-xs text-foreground/60 mb-2">The on-chain verifier checks the final proof (π):</p>
                  <code className="block text-xs text-center text-foreground/70 bg-background/50 p-3 rounded">
                    π = <span className="text-teal-400">ZK-SNARK</span>(C, w, (H<sub className="text-xs">N-1</sub>, H<sub className="text-xs">N</sub>))
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* --- END OF NEW SECTION --- */}
        {/* Section 5: Final CTA */}
        <section className="text-center py-24 sm:py-32">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Enter the Nexus.</h2>
            <p className="text-lg text-foreground/70 mt-4 mb-8">
              Join the decentralized AI revolution. Deploy, audit, compute, and earn in the world&apos;s most transparent AI marketplace.
            </p>
            <Link href="/marketplace" className="group flex items-center justify-center w-full sm:w-auto px-6 py-3 font-semibold bg-foreground text-background rounded-lg transition-transform hover:scale-105 mx-auto">
              Go to Marketplace
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}