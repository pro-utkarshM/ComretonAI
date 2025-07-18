'use client'

import { Navigation } from '@/components/Navigation'
import { Cpu, FileText, Link as LinkIcon, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image' // Import the Next.js Image component

// The code snippet for the upcoming SDK
const sdkSnippet = `
// [Preview] Example usage of upcoming SDK

// Connect wallet
await connectWallet();

// Request a job
const job = await requestJob();

// Run model and generate proof (off-chain)

// Submit proof to claim reward
await submitProof(job.id, proofData);
`

export default function ComputePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
        {/* 1. Header + Intro Section */}
        <header className="text-center mb-16">
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-xl bg-foreground/5 border border-foreground/10 mb-6">
            <Cpu className="w-8 h-8 text-foreground/80" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Join the Compute Network</h1>
          <p className="text-lg text-foreground/70 mt-4 max-w-2xl mx-auto">
            This page demonstrates how compute contributors can connect to the ComretonAI network, accept jobs, and earn rewards through verifiable off-chain inference.
          </p>
        </header>

        {/* 2. Live Output Simulation with GIF */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Live Economic Loop in Action</h2>
          
          {/* THE NEW GIF COMPONENT */}
          <div className="p-2 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
            <Image
              src="compute-demo.gif" // Next.js automatically finds this in the 'public' folder
              alt="A live demonstration of the ComretonAI service processing a job."
              width={1200} // Use the actual width of your GIF
              height={600} // Use the actual height of your GIF
              unoptimized={true} // Important for animated GIFs to prevent optimization artifacts
              className="rounded-lg w-full"
            />
          </div>
        </section>
        
        {/* 3. How It Will Work (Code Snippet Box) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">How It Will Work</h2>
          <div className="p-6 border border-foreground/10 rounded-xl bg-foreground/[0.02] relative">
            <span className="absolute top-4 right-4 text-xs font-semibold px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full">
              Coming Soon
            </span>
            <pre><code className="language-js text-sm text-foreground/80">{sdkSnippet}</code></pre>
          </div>
        </section>

        {/* 4. CTA Section */}
        <section>
          <div className="p-8 text-center border border-dashed border-foreground/20 rounded-xl bg-foreground/[0.02]">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">SDK In Progress</h3>
            <p className="text-foreground/60 mb-6">
              Full integration for compute providers is coming soon. For now, you can explore the test scripts that power this demonstration.
            </p>
            <a 
              href="https://github.com/pro-utkarshM/ComretonAI/tree/develop/packages/submitter" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2 font-semibold bg-foreground/10 border border-transparent rounded-lg transition-colors hover:bg-foreground/20 hover:border-foreground/30 group"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              View SDK Code on GitHub
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}