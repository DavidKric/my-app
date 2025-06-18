'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Using Textarea for multiline
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Zap, CornerDownLeft, Loader2 } from 'lucide-react'; // Added Loader2 for typing indicator
import { cn } from '@/lib/utils';
import scrollService from '@/lib/scroll-service'; // For mock references

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  references?: Array<{ type: 'page' | 'highlight'; value: string | number; text?: string }>;
}

interface AssistantPanelProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
  documentId?: string; // To scope chat history
}

const AssistantPanel: React.FC<AssistantPanelProps> = ({
  isVisible,
  onClose,
  className,
  documentId = 'default-doc', // Default document ID for history
}) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chatHistoryKey = `assistantChatHistory_${documentId}`;

  // Load chat history from localStorage
  useEffect(() => {
    if (isVisible) {
      const storedHistory = localStorage.getItem(chatHistoryKey);
      if (storedHistory) {
        setChatHistory(JSON.parse(storedHistory).map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp) // Ensure timestamp is a Date object
        })));
      } else {
        // Add a default welcome message if history is empty
        setChatHistory([{
          id: 'welcome-' + Date.now(),
          text: "Hello! I'm your AI Assistant. How can I help you with this document?",
          sender: 'assistant',
          timestamp: new Date(),
        }]);
      }
    }
  }, [isVisible, chatHistoryKey]);

  // Save chat history to localStorage
  useEffect(() => {
    if (chatHistory.length > 0) { // Only save if there's history
        localStorage.setItem(chatHistoryKey, JSON.stringify(chatHistory));
    }
  }, [chatHistory, chatHistoryKey]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [chatHistory, isAssistantTyping]);


  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const newUserMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      text: trimmedMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);
    setMessage('');
    setIsAssistantTyping(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantResponse: ChatMessage = {
        id: 'assistant-' + Date.now(),
        text: `You asked about "${trimmedMessage}". I found relevant information. For example, see page 3 for details on this topic. Also, regarding your query, there's an important section about [Project Alpha](#highlight-project-alpha) that might be useful.`,
        sender: 'assistant',
        timestamp: new Date(),
        references: [
          { type: 'page', value: 3, text: 'page 3' },
          { type: 'highlight', value: 'project-alpha', text: 'Project Alpha' }
        ]
      };
      setChatHistory(prev => [...prev, assistantResponse]);
      setIsAssistantTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleReferenceClick = (reference: ChatMessage['references'][0]) => {
    if (!reference) return;
    console.log(`User clicked reference: Type=${reference.type}, Value=${reference.value}, Text=${reference.text}`);
    if (reference.type === 'page') {
      // This would ideally use scrollService if PDFViewer is listening for direct page scrolls
      // scrollService.scrollToPage(reference.value as number);
      alert(`Scrolling to page ${reference.value} (mocked).`);
    } else if (reference.type === 'highlight') {
      // scrollService.scrollToAnnotation({ id: reference.value, pageNumber: ... }); // Need pageNumber for this
      alert(`Highlighting text related to "${reference.text}" (mocked). An AIHighlightOverlay could be used here.`);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 30, scale: 0.98 },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={cn(
            "fixed bottom-24 right-6 w-[380px] h-[calc(100vh-12rem)] max-h-[600px] bg-background border border-border rounded-xl shadow-2xl flex flex-col z-40",
            // "fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[380px] md:h-[calc(100vh-12rem)] md:max-h-[600px] bg-background border border-border rounded-xl shadow-2xl flex flex-col z-40",
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-panel-title"
        >
          {/* Header */}
          <header className="flex items-center justify-between p-3 border-b border-border bg-muted/30 rounded-t-xl">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h2 id="assistant-panel-title" className="text-md font-semibold text-foreground">
                AI Assistant
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">Close assistant panel</span>
            </Button>
          </header>

          {/* Conversation Area */}
          <ScrollArea className="flex-1 p-4 space-y-4">
            {/* Placeholder for conversation messages */}
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "mb-3 flex",
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  dir="auto" // For RTL/LTR support
                  className={cn(
                    "p-2.5 rounded-lg max-w-[85%] shadow-sm text-sm leading-relaxed",
                    msg.sender === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none border border-border/50"
                  )}
                >
                  {/* Render message text, parsing for references */}
                  {msg.text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
                    const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                    if (match) {
                      const refText = match[1];
                      const refId = match[2]; // e.g., #highlight-project-alpha or page:3
                      const refType = refId.startsWith('#highlight-') ? 'highlight' : (refId.startsWith('page:') ? 'page' : null);
                      const refValue = refType === 'highlight' ? refId.substring(10) : (refType === 'page' ? parseInt(refId.substring(5)) : refId);

                      const foundRef = msg.references?.find(r => (r.type === refType && (r.text === refText || r.value === refValue)));

                      if (foundRef) {
                        return (
                          <span
                            key={index}
                            className="text-blue-500 hover:underline cursor-pointer font-medium"
                            onClick={() => handleReferenceClick(foundRef)}
                          >
                            {refText}
                          </span>
                        );
                      }
                    }
                    return <React.Fragment key={index}>{part}</React.Fragment>;
                  })}

                  <div className={cn("text-xs mt-1.5", msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left')}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isAssistantTyping && (
              <div className="flex justify-start mb-2">
                <div className="bg-muted p-2.5 rounded-lg max-w-[80%] border border-border/50">
                  <div className="flex items-center space-x-1">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Assistant is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-background">
            <div className="relative flex items-start">
              <Textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Type your message or ask about the document..."
                className="pr-12 text-sm resize-none rounded-xl border-border focus-visible:ring-1 focus-visible:ring-primary/50"
                rows={Math.max(1, Math.min(message.split('\n').length, 3))} // Auto-adjust rows slightly
                dir="auto" // For RTL/LTR support
                aria-label="User message input"
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost" // Changed to ghost to better fit inside textarea area
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-primary disabled:text-muted-foreground"
                disabled={!message.trim() || isAssistantTyping}
                title="Send message (Enter)"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssistantPanel;
