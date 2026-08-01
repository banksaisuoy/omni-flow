"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  FormEvent,
  KeyboardEvent,
} from "react";
import { Loader2 } from "lucide-react";

// --- Types ---
export type NegotiationState =
  | "idle"
  | "initial_offer"
  | "counter_offer"
  | "accepted"
  | "rejected";

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

export interface NegotiationContextType {
  messages: Message[];
  negotiationState: NegotiationState;
  conversationId: string;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
}

// --- Context Setup ---
const NegotiationContext = createContext<NegotiationContextType | undefined>(
  undefined
);

export const useNegotiation = () => {
  const context = useContext(NegotiationContext);
  if (!context) {
    throw new Error("useNegotiation must be used within a NegotiationProvider");
  }
  return context;
};

// --- Component ---
export interface NegotiationBotProps {
  initialConversationId?: string;
}

export const NegotiationBot: React.FC<React.PropsWithChildren<NegotiationBotProps>> = ({
  initialConversationId = "default-conversation",
  children,
}) => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [negotiationState, setNegotiationState] =
    useState<NegotiationState>("idle");
  const [conversationId] = useState<string>(initialConversationId);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Abort controller cleanup
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
      }
    };
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;
    
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setError(null);
    setIsStreaming(true);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    // Reset state slightly during processing
    if (negotiationState === "idle") {
        setNegotiationState("initial_offer");
    }

    try {
      const response = await fetch("/api/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: content,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
         throw new Error("Response body is empty");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      const aiMessageId = crypto.randomUUID();
      let aiContent = "";
      
      setMessages((prev) => [
          ...prev,
          {
              id: aiMessageId,
              role: "ai",
              content: "",
              timestamp: Date.now(),
          }
      ]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // Simple heuristic for parsing a simulated JSON-LD or structured state
        // For actual parsing, you'd likely expect structured JSON per chunk or rely on SSE.
        // For now, we append string.
        aiContent += chunk;

        setMessages((prev) => 
            prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, content: aiContent } : msg
            )
        );
      }
      
      // Basic heuristic to update negotiation state visually
      const lowerContent = aiContent.toLowerCase();
      if (lowerContent.includes("accept")) {
          setNegotiationState("accepted");
      } else if (lowerContent.includes("reject")) {
          setNegotiationState("rejected");
      } else if (lowerContent.includes("offer") || lowerContent.includes("counter")) {
          setNegotiationState("counter_offer");
      }
      

    } catch (err: any) {
        if (err.name === 'AbortError') {
             console.log("Fetch aborted");
        } else {
             setError(err.message || "An error occurred during communication.");
        }
    } finally {
      setIsStreaming(false);
      // Focus input back
      setTimeout(() => {
          inputRef.current?.focus();
      }, 0);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
        if (e.ctrlKey) {
             // Quick send
             e.preventDefault();
             sendMessage(inputValue);
        } else if (!e.shiftKey) {
            // Also send on standard enter without shift
             e.preventDefault();
             sendMessage(inputValue);
        }
    }
  };

  const contextValue: NegotiationContextType = {
    messages,
    negotiationState,
    conversationId,
    isStreaming,
    error,
    sendMessage,
  };
  
  const getBadgeColor = (state: NegotiationState) => {
      switch (state) {
          case 'initial_offer': return 'bg-blue-100 text-blue-800';
          case 'counter_offer': return 'bg-yellow-100 text-yellow-800';
          case 'accepted': return 'bg-green-100 text-green-800';
          case 'rejected': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  return (
    <NegotiationContext.Provider value={contextValue}>
      {children}
      <div className="flex flex-col h-full w-full max-w-3xl mx-auto border rounded-lg shadow-md bg-white overflow-hidden" role="region" aria-label="Negotiation Interface">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Negotiation AI</h2>
          <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(negotiationState)}`} role="status" aria-label={`Current state: ${negotiationState.replace('_', ' ')}`}>
                  {negotiationState.replace('_', ' ').toUpperCase()}
              </span>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4" role="log" aria-live="polite">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Start negotiating by sending a message.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          
          {isStreaming && (
              <div className="flex w-full justify-start">
                  <div className="bg-white border text-gray-500 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-2" aria-label="AI is typing...">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Typing...</span>
                  </div>
              </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Area */}
        {error && (
            <div className="px-4 py-2 bg-red-50 text-red-600 text-sm border-t border-red-100 flex items-center" role="alert">
                <span className="font-medium mr-2">Error:</span> {error}
            </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSubmit} className="flex space-x-2 items-end">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your offer or counter-offer... (Press Enter to send)"
              className="flex-1 min-h-[60px] max-h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isStreaming}
              aria-label="Message input"
              tabIndex={0}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isStreaming}
              className="h-[60px] px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Send message"
            >
              Send
            </button>
          </form>
          <div className="mt-2 text-xs text-gray-400 text-center">
              Press Enter or Ctrl+Enter to quick send
          </div>
        </div>
      </div>
    </NegotiationContext.Provider>
  );
};

export default NegotiationBot;