"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Wand2, ChefHat } from "lucide-react";

export default function ChefAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const chatHelpers = useChat() as any;
  const { messages, input, handleInputChange, handleSubmit, isLoading } = chatHelpers;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {/* Botón flotante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-gold/80 to-gold text-white shadow-xl shadow-gold/20 transition-transform hover:scale-105 active:scale-95 ring-1 ring-white/20"
          >
            <ChefHat className="h-6 w-6 fill-white/10" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Ventana de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50 flex w-[350px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-[1.5rem] bg-bg-card border border-border-main shadow-2xl backdrop-blur-xl h-[500px] max-h-[calc(100vh-6rem)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-main bg-bg-solid/50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold ring-1 ring-gold/20">
                  <Wand2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Chef AI</h3>
                  <p className="text-[10px] text-text-dim uppercase tracking-wider">Asistente de Menús</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-text-dim transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {(!messages || messages.length === 0) && (
                <div className="flex h-full flex-col items-center justify-center space-y-3 text-center opacity-70">
                  <div className="rounded-full bg-white/5 p-4 ring-1 ring-white/10">
                    <Bot className="h-6 w-6 text-gold" />
                  </div>
                  <p className="text-xs text-text-muted max-w-[200px] leading-relaxed">
                    Hola, te ayudaré a crear plantillas y nombres irresistibles para tus platillos.
                  </p>
                </div>
              )}
              {messages?.map((msj: any) => (
                <div
                  key={msj.id}
                  className={`flex ${
                    msj.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-[13px] leading-relaxed ${
                      msj.role === "user"
                        ? "bg-gold text-bg-solid rounded-tr-sm"
                        : "bg-bg-hover text-text-secondary border border-border-main rounded-tl-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msj.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-[1.25rem] rounded-tl-sm bg-bg-hover border border-border-main px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="h-1.5 w-1.5 rounded-full bg-gold"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      className="h-1.5 w-1.5 rounded-full bg-gold/70"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      className="h-1.5 w-1.5 rounded-full bg-gold/40"
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-border-main bg-bg-solid/30 p-4"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ej: Menú para un bar..."
                  className="w-full rounded-full border border-border-main bg-bg-hover py-2.5 pl-4 pr-12 text-[13px] text-text-primary placeholder:text-text-faint focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-gold transition-colors hover:bg-gold/20 disabled:opacity-50 disabled:hover:bg-gold/10"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
