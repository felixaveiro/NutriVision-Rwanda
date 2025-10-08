"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles, Loader2, TrendingUp, Target, BarChart3, AlertCircle } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function InsightsPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
  "Hello! I'm your AI assistant for NutriVision Rwanda. I can help you understand nutrition data, risk assessments, interventions, and policy recommendations across Rwanda's 30 districts. What would you like to know?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to get response")
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please try again.`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestionClick = (question: string) => {
    if (!isLoading) {
      setInput(question)
    }
  }

  const suggestedQuestions = [
    {
      icon: AlertCircle,
      text: "What are the highest risk districts for malnutrition?",
      color: "text-red-500"
    },
    {
      icon: Target,
      text: "What interventions are most effective for reducing stunting?",
      color: "text-green-500"
    },
    {
      icon: BarChart3,
      text: "How does the data quality vary across provinces?",
      color: "text-blue-500"
    },
    {
      icon: TrendingUp,
      text: "What are the main risk factors for malnutrition in Rwanda?",
      color: "text-orange-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#005BAB] via-[#0078D4] to-[#E6E8EB]">
      

      {/* Chat Container */}
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Welcome Banner - Only show when no messages */}
        {messages.length === 1 && (
          <div className="mb-6 bg-white/95 backdrop-blur rounded-2xl shadow-lg p-8 border-l-4 border-[#005BAB]">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#005BAB] to-[#0078D4] rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to AI Insights</h2>
                <p className="text-gray-600 leading-relaxed">
                  Get instant answers about nutrition data, district-level insights, risk assessments, 
                  and evidence-based interventions. Our AI assistant is trained on comprehensive data 
                  from NISR, DHS, HMIS, and Sentinel surveillance systems.
                </p>
              </div>
            </div>
          </div>
        )}

        <Card className="flex flex-col bg-white/95 backdrop-blur shadow-2xl border-0 overflow-hidden">
          {/* Messages */}
          <div className="overflow-y-auto p-6 space-y-6 min-h-[400px] max-h-[600px]">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[90%] rounded-2xl px-6 py-4 shadow-md ${
                    message.role === "user" 
                      ? "bg-gradient-to-br from-[#005BAB] to-[#0078D4] text-white" 
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-[#005BAB] to-[#0078D4] rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <p className={`text-base whitespace-pre-wrap leading-relaxed ${
                      message.role === "user" ? "text-white" : "text-gray-800"
                    }`}>
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl px-6 py-4 bg-gray-50 border border-gray-200 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#005BAB] to-[#0078D4] rounded-full flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    </div>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#005BAB] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-[#005BAB] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-[#005BAB] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about nutrition data, risk analysis, interventions, or policy recommendations..."
                  className="min-h-[70px] max-h-[140px] resize-none pr-4 border-2 border-gray-200 focus:border-[#005BAB] focus:ring-2 focus:ring-[#005BAB]/20 rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSubmit}
                size="icon"
                className="h-[70px] w-[70px] flex-shrink-0 bg-gradient-to-br from-[#005BAB] to-[#0078D4] hover:from-[#004a8f] hover:to-[#0066bb] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Press <kbd className="px-2 py-1 bg-gray-100 rounded text-[#005BAB] font-semibold">Enter</kbd> to send • <kbd className="px-2 py-1 bg-gray-100 rounded text-[#005BAB] font-semibold">Shift + Enter</kbd> for new line
            </p>
          </div>
        </Card>

        {/* Suggested Questions */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Suggested Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedQuestions.map((question, index) => (
              <div
                key={index}
                onClick={() => handleQuestionClick(question.text)}
                className="bg-white/95 backdrop-blur rounded-xl p-4 text-left hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-shrink-0 group-hover:from-[#005BAB]/10 group-hover:to-[#0078D4]/10 transition-colors`}>
                    <question.icon className={`w-5 h-5 ${question.color}`} />
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed group-hover:text-[#005BAB] transition-colors">
                    {question.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/90 backdrop-blur rounded-xl p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold text-gray-800 mb-1 text-sm">Real-time Analysis</h4>
            <p className="text-xs text-gray-600">Get instant insights from latest nutrition data</p>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-xl p-4 border-l-4 border-green-500">
            <h4 className="font-semibold text-gray-800 mb-1 text-sm">Evidence-based</h4>
            <p className="text-xs text-gray-600">Recommendations backed by comprehensive datasets</p>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-xl p-4 border-l-4 border-orange-500">
            <h4 className="font-semibold text-gray-800 mb-1 text-sm">District-level Detail</h4>
            <p className="text-xs text-gray-600">Granular insights across all 30 districts</p>
          </div>
        </div>
      </main>
    </div>
  )
}