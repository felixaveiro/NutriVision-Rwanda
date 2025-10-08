"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles, Loader2, Home } from "lucide-react"
import Link from "next/link"

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-balance">AI Insights</h1>
                <p className="text-sm text-muted-foreground">Ask anything about NutriVision Rwanda data and analysis</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="flex flex-col h-[calc(100vh-200px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === "assistant" && <Sparkles className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about nutrition data, risk analysis, interventions..."
                className="min-h-[60px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0"
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>

        {/* Suggested Questions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto py-3 text-left justify-start bg-transparent"
            onClick={() => setInput("What are the highest risk districts for malnutrition?")}
            disabled={isLoading}
          >
            <span className="text-sm">What are the highest risk districts for malnutrition?</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 text-left justify-start bg-transparent"
            onClick={() => setInput("What interventions are most effective for reducing stunting?")}
            disabled={isLoading}
          >
            <span className="text-sm">What interventions are most effective for reducing stunting?</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 text-left justify-start bg-transparent"
            onClick={() => setInput("How does the data quality vary across provinces?")}
            disabled={isLoading}
          >
            <span className="text-sm">How does the data quality vary across provinces?</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 text-left justify-start bg-transparent"
            onClick={() => setInput("What are the main risk factors for malnutrition in Rwanda?")}
            disabled={isLoading}
          >
            <span className="text-sm">What are the main risk factors for malnutrition in Rwanda?</span>
          </Button>
        </div>
      </main>
    </div>
  )
}
