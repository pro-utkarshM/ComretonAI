'use client'

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import Link from 'next/link'
import {
    Code,
    Server,
    CheckCircle,
    ArrowRight,
    Users,
    Zap,
    Globe,
    Shield,
    Cpu,
    Mail,
    Building,
    User,
    Loader2,
    Star,
    TrendingUp,
    Clock
} from 'lucide-react'

type WaitlistType = 'api' | 'compute' | null

interface FormData {
    name: string
    email: string
    company: string
    role: string
    useCase: string
    monthlyVolume: string
    techStack: string[]
    priority: string
}

const WaitlistPage = () => {
    const [selectedType, setSelectedType] = useState<WaitlistType>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        company: '',
        role: '',
        useCase: '',
        monthlyVolume: '',
        techStack: [],
        priority: ''
    })

    const stats = {
        api: {
            signups: 2847,
            growing: "+156 this week"
        },
        compute: {
            signups: 1293,
            growing: "+89 this week"
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        setIsSubmitting(false)
        setSubmitted(true)
    }

    const resetForm = () => {
        setSelectedType(null)
        setSubmitted(false)
        setFormData({
            name: '',
            email: '',
            company: '',
            role: '',
            useCase: '',
            monthlyVolume: '',
            techStack: [],
            priority: ''
        })
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navigation />
                <main className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">You&apos;re on the list! 🎉</h1>
                        <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
                            Thank you for joining the ComretonAI waitlist. We&apos;ll keep you updated on our progress and
                            give you early access when we launch.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="p-6 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                                <Mail className="w-8 h-8 text-blue-400 mb-3" />
                                <h3 className="font-bold text-white mb-2">Check Your Email</h3>
                                <p className="text-sm text-foreground/60">
                                    We&apos;ve sent a confirmation to {formData.email}
                                </p>
                            </div>
                            <div className="p-6 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                                <Clock className="w-8 h-8 text-purple-400 mb-3" />
                                <h3 className="font-bold text-white mb-2">Expected Timeline</h3>
                                <p className="text-sm text-foreground/60">
                                    Early access starts Q4 2025
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={resetForm}
                            className="px-6 py-3 border border-foreground/20 rounded-lg hover:border-foreground/50 transition-colors"
                        >
                            Join Another Waitlist
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    if (!selectedType) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navigation />

                <main className="max-w-6xl mx-auto px-4 py-24 sm:py-32">
                    <header className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Join the Future of AI
                        </h1>
                        <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
                            Be among the first to access ComretonAI&apos;s revolutionary platform.
                            Choose your path and help shape the future of decentralized AI.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* API Waitlist */}
                        <div className="group relative p-8 border border-foreground/10 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 hover:border-blue-500/30 transition-all hover:scale-[1.02]">
                            <div className="absolute top-4 right-4">
                                <div className="flex items-center gap-2 text-xs text-blue-400">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>{stats.api.growing}</span>
                                </div>
                            </div>

                            <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                                <Code className="w-8 h-8 text-blue-400" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-3">Developer API Access</h2>
                            <p className="text-foreground/70 mb-6">
                                Integrate verified AI models directly into your applications with our RESTful API.
                                Pay only for what you use with transparent blockchain billing.
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                    <span>RESTful API endpoints</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Globe className="w-4 h-4 text-blue-400" />
                                    <span>Global CDN distribution</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Shield className="w-4 h-4 text-blue-400" />
                                    <span>Blockchain-verified models</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Code className="w-4 h-4 text-blue-400" />
                                    <span>Multi-language SDKs</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <div className="text-sm text-foreground/60">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    {stats.api.signups.toLocaleString()} developers waiting
                                </div>
                                <div className="text-sm font-semibold text-blue-400">Q4 2025</div>
                            </div>

                            <button
                                onClick={() => setSelectedType('api')}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group-hover:scale-105"
                            >
                                Join API Waitlist
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Compute Provider Waitlist */}
                        <div className="group relative p-8 border border-foreground/10 rounded-xl bg-gradient-to-br from-purple-500/5 to-purple-500/10 hover:border-purple-500/30 transition-all hover:scale-[1.02]">
                            <div className="absolute top-4 right-4">
                                <div className="flex items-center gap-2 text-xs text-purple-400">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>{stats.compute.growing}</span>
                                </div>
                            </div>

                            <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                                <Server className="w-8 h-8 text-purple-400" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-3">Compute Provider SDK</h2>
                            <p className="text-foreground/70 mb-6">
                                Monetize your GPU infrastructure by joining our decentralized compute network.
                                Earn rewards by providing secure, verified AI inference services.
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm">
                                    <Cpu className="w-4 h-4 text-purple-400" />
                                    <span>Easy SDK integration</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Shield className="w-4 h-4 text-purple-400" />
                                    <span>seL4 kernel verification</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Zap className="w-4 h-4 text-purple-400" />
                                    <span>Automated job distribution</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Star className="w-4 h-4 text-purple-400" />
                                    <span>Competitive rewards</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <div className="text-sm text-foreground/60">
                                    <Server className="w-4 h-4 inline mr-1" />
                                    {stats.compute.signups.toLocaleString()} providers waiting
                                </div>
                                <div className="text-sm font-semibold text-purple-400">Q4 2025</div>
                            </div>

                            <button
                                onClick={() => setSelectedType('compute')}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors group-hover:scale-105"
                            >
                                Join Provider Waitlist
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="text-center mt-16 p-8 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
                        <h3 className="text-xl font-bold text-white mb-2">Questions about early access?</h3>
                        <p className="text-foreground/60 mb-4">
                            Our team is here to help you understand how ComretonAI can fit into your workflow.
                        </p>
                        <Link href="https://github.com/pro-utkarshM/ComretonAI" className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all">
                            Join Waitlist
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    // Form view
    const isAPI = selectedType === 'api'
    const themeColor = isAPI ? 'blue' : 'purple'

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />

            <main className="max-w-3xl mx-auto px-4 py-24 sm:py-32">
                <div className="mb-8">
                    <button
                        onClick={() => setSelectedType(null)}
                        className="flex items-center gap-2 text-foreground/60 hover:text-white transition-colors mb-6"
                    >
                        ← Back to Options
                    </button>

                    <div className="text-center mb-8">
                        <div className={`w-16 h-16 bg-${themeColor}-500/10 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                            {isAPI ? <Code className={`w-8 h-8 text-${themeColor}-400`} /> : <Server className={`w-8 h-8 text-${themeColor}-400`} />}
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {isAPI ? 'Join API Waitlist' : 'Join Compute Provider Waitlist'}
                        </h1>
                        <p className="text-foreground/70">
                            {isAPI
                                ? 'Get early access to our developer API and start building with verified AI models'
                                : 'Join our compute network and start earning rewards for providing GPU infrastructure'
                            }
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                placeholder="Your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2">
                                Company/Organization
                            </label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full px-4 py-3 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                placeholder="Company name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2">
                                Role/Title
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-3 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                            >
                                <option value="">Select your role</option>
                                {isAPI ? (
                                    <>
                                        <option value="developer">Software Developer</option>
                                        <option value="architect">Solution Architect</option>
                                        <option value="cto">CTO/Tech Lead</option>
                                        <option value="founder">Founder/CEO</option>
                                        <option value="researcher">AI Researcher</option>
                                        <option value="other">Other</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="individual">Individual Provider</option>
                                        <option value="company">Company/Enterprise</option>
                                        <option value="datacenter">Data Center</option>
                                        <option value="cloud">Cloud Provider</option>
                                        <option value="university">University/Research</option>
                                        <option value="other">Other</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                            {isAPI ? 'Primary Use Case *' : 'Infrastructure Details *'}
                        </label>
                        <textarea
                            required
                            value={formData.useCase}
                            onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                            className="w-full h-24 px-4 py-3 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none"
                            placeholder={isAPI
                                ? "Describe how you plan to use our API (e.g., chatbots, image generation, data analysis...)"
                                : "Describe your compute infrastructure (GPU types, quantities, location, current utilization...)"
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                            {isAPI ? 'Expected Monthly Volume' : 'Available Compute Hours per Month'}
                        </label>
                        <select
                            value={formData.monthlyVolume}
                            onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                            className="w-full px-4 py-3 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        >
                            <option value="">Select range</option>
                            {isAPI ? (
                                <>
                                    <option value="1k-10k">1K - 10K requests</option>
                                    <option value="10k-100k">10K - 100K requests</option>
                                    <option value="100k-1m">100K - 1M requests</option>
                                    <option value="1m+">1M+ requests</option>
                                </>
                            ) : (
                                <>
                                    <option value="1-100">1 - 100 hours</option>
                                    <option value="100-500">100 - 500 hours</option>
                                    <option value="500-2000">500 - 2,000 hours</option>
                                    <option value="2000+">2,000+ hours</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Priority Interest
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full px-4 py-3 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        >
                            <option value="">Select priority</option>
                            <option value="high">High - Ready to start immediately</option>
                            <option value="medium">Medium - Planning for Q3-Q4 2025</option>
                            <option value="low">Low - Exploring options</option>
                        </select>
                    </div>

                    <div className="pt-6 border-t border-foreground/10">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-${themeColor}-600 text-white rounded-lg hover:bg-${themeColor}-700 transition-colors disabled:opacity-50`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Joining Waitlist...
                                </>
                            ) : (
                                <>
                                    Join Waitlist
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <p className="text-xs text-foreground/60 text-center mt-4">
                            By joining, you agree to receive updates about ComretonAI. We respect your privacy and won&apos;t spam you.
                        </p>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default WaitlistPage