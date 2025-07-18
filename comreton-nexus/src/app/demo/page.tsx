'use client'

import { useRef } from 'react'
import { Navigation } from '@/components/Navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Upload, ShieldCheck, Store, Cpu, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// --- Data for our demo steps ---
const demoSteps = [
    {
        icon: Upload,
        title: "1. Deploy & Package",
        description: "A developer registers their model as a Verifiable Model Artifact (VMA), creating its on-chain identity.",
        link: "/deploy",
        linkLabel: "Try Model Deployment",
        math: {
            title: "Verifiable Model Artifact (VMA)",
            content: (
                <code className="block text-xs">
                    - model.onnx<br />
                    - spec.move<br />
                    - Genesis Hash H₀
                </code>
            )
        }
    },
    {
        icon: ShieldCheck,
        title: "2. Audit & Verify",
        description: "Community auditors stake tokens to attest to the model's safety, triggering on-chain verification.",
        link: "/audit",
        linkLabel: "View Audit Dashboard",
        math: {
            title: "Staking Consensus",
            content: (
                <code className="block text-xs text-center">
                    <span className="text-purple-400">Σ</span> S<sub className="text-xs">i</sub> ≥ Θ
                </code>
            )
        }
    },
    {
        icon: Store,
        title: "3. List on Marketplace",
        description: "Once verified, the model is listed on the marketplace, ready for trustless execution.",
        link: "/marketplace",
        linkLabel: "Explore Marketplace",
        math: {
            title: "Execution & Proof",
            content: (
                <code className="block text-xs text-center">
                    π = <span className="text-teal-400">ZK-SNARK</span>(C, w, x)
                </code>
            )
        }
    },
    {
        icon: Cpu,
        title: "4. Infer & Earn",
        description: "Users run inferences, and fees are automatically distributed to the creator, auditors, and compute provider.",
        link: "/compute",
        linkLabel: "Learn about Compute",
        math: {
            title: "Fee Distribution",
            content: (
                <code className="block text-xs text-center">
                    F<sub className="text-xs">total</sub> = F<sub className="text-xs">creator</sub> + F<sub className="text-xs">auditors</sub> + ...
                </code>
            )
        }
    },
]

// --- The Spaceship SVG ---
const RocketShip = (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M9.11327 4.90826C9.98818 3.32563 12.3854 3.29411 13.3013 4.85619L15.2285 8.19694C15.5823 8.80218 16.2753 9.17316 16.9899 9.17316H20.5714C22.2133 9.17316 22.9515 11.1217 21.6629 12.1818L18.8254 14.5323C18.2732 14.9863 18.0385 15.6983 18.2393 16.3536L19.193 19.6631C19.6253 21.2337 17.7787 22.4415 16.3813 21.579L13.5187 19.8242C12.9234 19.4419 12.1194 19.4313 11.5126 19.7997L8.62021 21.579C7.22279 22.4415 5.37624 21.2337 5.80854 19.6631L6.76229 16.3536C6.96307 15.6983 6.72834 14.9863 6.17616 14.5323L3.33866 12.1818C2.05007 11.1217 2.78824 9.17316 4.43014 9.17316H8.01166C8.72628 9.17316 9.41926 8.80218 9.77309 8.19694L9.11327 4.90826Z" className="fill-foreground/80 group-hover:fill-white transition-colors" />
    </svg>
)

export default function DemoPage() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start center', 'end end']
    });

    // Use useTransform to create a springy, delayed effect for the rocket
    const rocketPathProgress = useTransform(scrollYProgress, [0, 1], [0, 1], { ease: [0.0, 0.0, 0.0, 1.0] });

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />

            <main className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
                <header className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">The Orbital Trajectory</h1>
                    <p className="text-lg text-foreground/70 mt-4">
                        An interactive journey through the ComretonAI protocol, from launch to landing.
                    </p>
                </header>

                <div ref={targetRef} className="relative">
                    {/* The SVG Trajectory Path */}
                    <svg width="100%" height="100%" viewBox="0 0 400 1200" className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-auto hidden md:block" preserveAspectRatio="xMidYMin meet">
                        <path
                            id="trajectory"
                            d="M 200,50 C 400,250 0,450 200,650 C 400,850 0,1050 200,1150"
                            fill="none"
                            stroke="url(#grad)"
                            strokeWidth="2"
                            strokeDasharray="8 8"
                        />
                        <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0)' }} />
                                <stop offset="10%" style={{ stopColor: 'rgba(255,255,255,0.2)' }} />
                                <stop offset="90%" style={{ stopColor: 'rgba(255,255,255,0.2)' }} />
                                <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)' }} />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* The Animated Rocket Ship - CSS offset-path is more performant */}
                    <motion.div
                        className="w-12 h-12 absolute top-0 left-0 hidden md:flex items-center justify-center group"
                        style={{
                            offsetPath: `path('M 200,50 C 400,250 0,450 200,650 C 400,850 0,1050 200,1150')`,
                            offsetDistance: rocketPathProgress,
                            offsetRotate: 'auto'
                        }}
                    >
                        <div className="absolute inset-0 bg-foreground/30 rounded-full animate-ping opacity-75"></div>
                        <RocketShip />
                    </motion.div>


                    {/* The Steps */}
                    <div className="space-y-16 md:space-y-0">
                        {demoSteps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                className="md:min-h-[300px] flex flex-col md:flex-row items-center gap-8"
                                style={{
                                    justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
                                }}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                                    <div className="p-6 border border-foreground/10 rounded-xl bg-foreground/[0.02] backdrop-blur-sm">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-foreground/10 rounded-lg flex items-center justify-center border border-foreground/10">
                                                <step.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">{step.title}</h2>
                                                <p className="text-foreground/60 text-sm">{step.description}</p>
                                            </div>
                                        </div>
                                        <div className="p-3 my-4 border border-foreground/10 rounded-lg bg-background/50">
                                            <h4 className="text-xs font-semibold text-foreground/50 mb-2">{step.math.title}</h4>
                                            {step.math.content}
                                        </div>
                                        <Link href={step.link} className="inline-flex items-center font-semibold text-white group">
                                            {step.linkLabel} <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-24 text-center">
                    <p className="text-foreground/60 mb-4">Ready to experience the future of verifiable AI?</p>
                    <Link href="/marketplace" className="px-6 py-3 bg-foreground text-background rounded-lg font-semibold hover:scale-105 transition-transform inline-block">
                        Explore the Marketplace
                    </Link>
                </div>
            </main>
        </div>
    )
}