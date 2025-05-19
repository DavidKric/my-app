"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { cn } from "@/lib/utils";
import { PenLine, BookOpen, Hash } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlassBubble, TextShimmer, ThinkingAnimation } from "./ThinkingAnimation";
import { AIInput } from "./AIInput";

interface ChatSidebarProps {
  className?: string;
  onNewMessage?: () => void;
}

export default function ChatSidebar({ className, onNewMessage }: ChatSidebarProps) {
  // Mock state for development if LangGraph is not available
  const [mockMessages, setMockMessages] = useState<Array<{ role: string; content: string; isNew?: boolean }>>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant for document analysis. I can help you understand the legal document, extract key clauses, or summarize sections. How can I help you today?",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // This would be replaced with actual LangGraph hook in production
  // You can uncomment this when LangGraph is properly configured
  /*
  const thread = useStream<{ messages: Message[] }>({
    apiUrl: process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || "http://localhost:2024",
    assistantId: "agent",
    messagesKey: "messages",
  });
  */

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && mockMessages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mockMessages]);

  // Set notification when new messages arrive and chat tab isn't active
  useEffect(() => {
    if (mockMessages.some(msg => msg.isNew) && activeTab !== "chat") {
      setHasNewMessages(true);
      } else {
      setHasNewMessages(false);
    }
  }, [mockMessages, activeTab]);

  // Clear new message flags when switching to chat tab
  useEffect(() => {
    if (activeTab === "chat" && hasNewMessages) {
      setHasNewMessages(false);
      setMockMessages(prevMessages => 
        prevMessages.map(msg => ({ ...msg, isNew: false }))
      );
    }
  }, [activeTab, hasNewMessages]);

  const handleSubmit = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    // Add user message
    setMockMessages((prev) => [
      ...prev,
      { role: "user", content: message, isNew: true },
    ]);
    
    // Notify parent component
    onNewMessage?.();
    
    setIsLoading(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      // Add AI response
      setMockMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "The AI service is currently unavailable. Please try again later.",
          isNew: true
        },
      ]);
      
      // Notify parent component again for AI response
      onNewMessage?.();
      
      setIsLoading(false);
    }, 2000);
    
    // In production, use LangGraph:
    /*
    thread.submit({ 
      messages: [{ type: "human", content: message }] 
    });
    */
  };

  const handleStopGeneration = () => {
    // In production with LangGraph:
    // thread.stop();
    setIsLoading(false);
  };

  const handleVoiceInput = () => {
    alert("Voice input feature would be activated here");
    // In a real app, we'd initialize the microphone and speech recognition
  };

  return (
    <Card className={cn("h-full flex flex-col overflow-hidden border-none shadow-none", className)}>
      <CardHeader className="px-4 py-2 border-b bg-white dark:bg-gray-950">
        <div className="grid grid-cols-3 h-9 bg-gray-100 dark:bg-gray-900 rounded-md relative overflow-hidden">
          <button 
            onClick={() => setActiveTab("chat")}
            className={cn(
              "flex items-center justify-center gap-2 text-sm font-medium transition-all",
              activeTab === "chat" 
                ? "text-blue-700 tab-border-glow tab-border-glow-blue" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300",
              hasNewMessages && "tab-notification"
            )}
          >
            <PenLine className="w-4 h-4" />
            AI Chat
          </button>
          <button 
            onClick={() => setActiveTab("annotations")}
            className={cn(
              "flex items-center justify-center gap-2 text-sm font-medium transition-all",
              activeTab === "annotations" 
                ? "text-amber-700 tab-border-glow tab-border-glow-amber" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
            )}
          >
            <BookOpen className="w-4 h-4" />
            Notes
          </button>
          <button 
            onClick={() => setActiveTab("references")}
            className={cn(
              "flex items-center justify-center gap-2 text-sm font-medium transition-all",
              activeTab === "references" 
                ? "text-purple-700 tab-border-glow tab-border-glow-purple" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
            )}
          >
            <Hash className="w-4 h-4" />
            References
          </button>
          </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <Tabs value={activeTab} className="h-full flex flex-col">
          <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0 h-full">
            <ScrollArea className="flex-1 px-4 py-4" aria-busy={isLoading}>
              <div
                className="space-y-4 mb-4"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
              >
                {mockMessages.map((message, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-3 text-sm",
                      message.role === "user" ? "justify-end" : "",
                      message.isNew ? "message-arrive" : ""
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        AI
      </div>
                    )}
                    <GlassBubble
                      className={cn(
                        "max-w-[80%]",
                        message.role === "user" 
                          ? "bg-blue-600/90 text-white border-blue-500/30" 
                          : "bg-white/80 dark:bg-gray-900/80 text-gray-800 dark:text-gray-200"
                      )}
      >
        {message.content}
                    </GlassBubble>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0">
                        You
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                      AI
                    </div>
                    <GlassBubble className="max-w-[80%] bg-white/60 dark:bg-gray-900/60">
                      <ThinkingAnimation />
                    </GlassBubble>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
              <AIInput 
                onSubmit={handleSubmit}
                isLoading={isLoading}
                onStopGeneration={handleStopGeneration}
                onVoiceInput={handleVoiceInput}
                placeholderText="Ask about the document or annotations..."
              />
            </div>
          </TabsContent>

          <TabsContent value="annotations" className="flex-1 m-0 p-4 h-full">
            <GlassBubble className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <TextShimmer text="Annotation notes will appear here" className="text-transparent" />
      </div>
            </GlassBubble>
          </TabsContent>

          <TabsContent value="references" className="flex-1 m-0 p-4 h-full">
            <GlassBubble className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <TextShimmer text="References and citations will appear here" className="text-transparent" />
    </div>
            </GlassBubble>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
