/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
//@ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import { Code, ShieldCheck, Cpu, Coins } from 'lucide-react'

// Configuration for the animation script
const script = [
    { delay: 1000, type: 'command', text: '> comretonai deploy "vision-transformer.v2"' },
    { delay: 800, type: 'info', text: '[INFO] Model packaged into VMA, uploading to IPFS...' },
    { delay: 1200, type: 'success', text: '[SUCCESS] Model 0x123... registered. Status: PENDING_AUDIT' },
    { delay: 500, type: 'stake', value: 0 }, // Triggers gauge appearance
    { delay: 2000, type: 'command', text: '> comretonai attest --model 0x123 --stake 6000' },
    { delay: 800, type: 'data', text: '[DATA] Total Stake: 6,000 / 10,000 COMAI' },
    { delay: 500, type: 'stake', value: 60 }, // Animates gauge to 60%
    { delay: 2500, type: 'command', text: '> comretonai attest --model 0x123 --stake 9000' },
    { delay: 800, type: 'data', text: '[DATA] Total Stake: 15,000 / 10,000 COMAI' },
    { delay: 500, type: 'stake', value: 100 }, // Animates gauge to 100%
    { delay: 1000, type: 'success', text: '[SUCCESS] Verification threshold met. Status -> VERIFIED' },
    { delay: 2500, type: 'command', text: '> comretonai infer --model 0x123 --input "image.jpg"' },
    { delay: 800, type: 'info', text: '[INFO] Job dispatched to compute network...' },
    { delay: 1500, type: 'info', text: '[INFO] ZK-Proof generated and verified on-chain...' },
    { delay: 1000, type: 'success', text: '[SUCCESS] Inference complete. Distributing fees...' },
    { delay: 500, type: 'fees' }, // Triggers fee chart
];

// --- Helper Components for Widgets ---

const VerificationGauge = ({ progress }: { progress: number }) => {
    const strokeWidth = 10;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                    className="text-foreground/10"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`${progress < 100 ? 'text-accent-teal' : 'text-success'}`}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {progress >= 100 ? (
                    <ShieldCheck className="w-8 h-8 text-success" />
                ) : (
                    <>
                        <span className="text-3xl font-bold text-white">{progress}%</span>
                        <span className="text-xs text-text-secondary">Staked</span>
                    </>
                )}
            </div>
        </div>
    );
};

const FeeChart = () => (
    <div className="w-full flex items-center gap-4">
        <svg width="100" height="100" viewBox="0 0 36 36" className="w-24 h-24 animate-fade-in">
            <circle r="15.9154943092" cx="18" cy="18" fill="transparent" stroke="var(--accent-teal)" strokeWidth="3" strokeDasharray="40 60" strokeDashoffset="25"></circle>
            <circle r="15.9154943092" cx="18" cy="18" fill="transparent" stroke="var(--accent-lime)" strokeWidth="3" strokeDasharray="40 60" strokeDashoffset="-15"></circle>
            <circle r="15.9154943092" cx="18" cy="18" fill="transparent" stroke="var(--warning)" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="-55"></circle>
        </svg>
        <div className="text-sm space-y-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent-teal"></div><span>Creator: 40%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent-lime"></div><span>Auditors: 40%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning"></div><span>Compute: 20%</span></div>
        </div>
    </div>
);


// --- Main Protocol Visualizer Component ---

export function NeuralFlow() {
    const [logLines, setLogLines] = useState<any[]>([]);
    const [stakeProgress, setStakeProgress] = useState<number | null>(null);
    const [showFeeChart, setShowFeeChart] = useState(false);
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const runScript = (step = 0) => {
            if (step >= script.length) {
                // After a pause, reset and loop the animation
                timeoutId = setTimeout(() => {
                    setLogLines([]);
                    setStakeProgress(null);
                    setShowFeeChart(false);
                    runScript(0);
                }, 5000);
                return;
            }

            const current = script[step];
            timeoutId = setTimeout(() => {
                if (current.type === 'stake') {
                    setStakeProgress(current.value);
                } else if (current.type === 'fees') {
                    setShowFeeChart(true);
                } else {
                    setLogLines(prev => [...prev, current]);
                }
                runScript(step + 1);
            }, current.delay);
        };

        runScript();
        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        // Auto-scroll terminal
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logLines]);

    const getLineColor = (type: string) => {
        switch (type) {
            case 'command': return 'text-accent-teal';
            case 'success': return 'text-success';
            case 'data': return 'text-warning';
            default: return 'text-text-secondary';
        }
    };

    return (
        <div className="w-full bg-surface/50 border border-border rounded-xl p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[450px]">

            {/* Left Side: Live Terminal */}
            <div className="lg:col-span-3 bg-background/50 rounded-lg p-4 font-mono text-sm overflow-hidden h-96 lg:h-full">
                <div ref={terminalRef} className="h-full overflow-y-auto scrollbar-thin">
                    {logLines.map((line, i) => (
                        <p key={i} className={`animate-fade-in ${getLineColor(line.type)}`}>
                            {line.text}
                        </p>
                    ))}
                    <div className="inline-block w-2 h-4 bg-accent-teal animate-pulse"></div>
                </div>
            </div>

            {/* Right Side: Data Widgets */}
            <div className="lg:col-span-2 flex flex-col justify-between gap-4">
                {/* Widget 1: Verification Progress */}
                <div className="bg-background/50 rounded-lg p-4 flex-1 flex flex-col items-center justify-center min-h-[150px]">
                    <h3 className="text-lg font-bold text-white mb-2">Model Verification</h3>
                    {stakeProgress !== null ? (
                        <VerificationGauge progress={stakeProgress} />
                    ) : (
                        <p className="text-text-secondary">Awaiting Deployment...</p>
                    )}
                </div>

                {/* Widget 2: Fee Distribution */}
                <div className="bg-background/50 rounded-lg p-4 flex-1 flex flex-col items-center justify-center min-h-[150px]">
                    <h3 className="text-lg font-bold text-white mb-2">Revenue Share</h3>
                    {showFeeChart ? (
                        <FeeChart />
                    ) : (
                        <p className="text-text-secondary">Awaiting Inference...</p>
                    )}
                </div>
            </div>
        </div>
    );
}