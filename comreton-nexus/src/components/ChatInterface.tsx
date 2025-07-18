'use client'

import { useState } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface ChatInterfaceProps {
    modelName: string
    onSendMessage: (message: string) => Promise<string>
}

export function ChatInterface({ modelName, onSendMessage }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<{ type: 'user' | 'bot', content: string }[]>([
        { type: 'bot', content: `Hello! I'm ${modelName}. How can I help you today?` }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { type: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            const response = await onSendMessage(userMessage)
            setMessages(prev => [...prev, { type: 'bot', content: response }])
        } catch (error) {
            setMessages(prev => [...prev, {
                type: 'bot',
                content: 'Sorry, there was an error processing your request.'
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-96 border border-foreground/10 rounded-xl bg-foreground/[0.02]">
            {/* Header */}
            <div className="p-4 border-b border-foreground/10 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">{modelName}</span>
                <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-blue-500' : 'bg-foreground/10'
                            }`}>
                            {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-foreground/5 text-foreground'
                            }`}>
                            {message.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-foreground/5 px-4 py-2 rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-foreground/10">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-foreground/10 rounded-lg bg-foreground/5 focus:outline-none focus:border-foreground/50"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}