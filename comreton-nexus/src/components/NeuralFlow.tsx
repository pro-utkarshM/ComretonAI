'use client'
import { Code, ShieldCheck, Cpu, Coins } from 'lucide-react'

const steps = [
    {
        icon: Code,
        title: "1. Deploy & Package",
        description: "Developers submit AI models as Verifiable Model Artifacts (VMAs)."
    },
    {
        icon: ShieldCheck,
        title: "2. Audit & Stake",
        description: "Community auditors stake COMAI to verify model safety and performance."
    },
    {
        icon: Cpu,
        title: "3. Execute & Prove",
        description: "ZK-proofs guarantee correct execution on decentralized compute nodes."
    },
    {
        icon: Coins,
        title: "4. Earn & Distribute",
        description: "Fees are automatically split, rewarding all participants in the ecosystem."
    }
];

export function NeuralFlow() {
    return (
        <div className="relative flex flex-col items-center justify-center w-full p-4 md:p-12 glass-card rounded-2xl overflow-hidden">
            {/* Background animated grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20 z-0"></div>

            {/* The main flow container */}
            <div className="relative z-10 w-full">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-brand-blue/20 via-brand-purple/50 to-brand-blue/20">
                    {/* Animated pulse traveling along the line */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-brand-blue shadow-[0_0_15px_theme(colors.brand.blue)] animate-flow-line"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-4">
                            <div className="relative mb-4">
                                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-surface-2 border-2 border-nexus-border transition-all duration-300 group-hover:border-brand-blue">
                                    <step.icon className="w-10 h-10 text-brand-blue" />
                                </div>
                                {/* Connector for mobile view */}
                                {index < steps.length - 1 && (
                                    <div className="md:hidden absolute bottom-[-2rem] left-1/2 w-0.5 h-8 bg-nexus-border"></div>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-text-primary mb-2">{step.title}</h3>
                            <p className="text-sm text-text-secondary">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}