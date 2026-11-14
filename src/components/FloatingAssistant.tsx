'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { stripEmojis } from '@/lib/strip-emojis';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Tell me the history of Karnak Temple in Luxor',
  'Who built the Great Pyramid of Giza and why?',
  'Explain the Valley of the Kings tombs',
  'What is the significance of Abu Simbel?',
  'Best historical route to explore Islamic Cairo',
];

interface FormattedMessageProps {
  content: string;
}

function FormattedAssistantMessage({ content: rawContent }: FormattedMessageProps) {
  const content = stripEmojis(rawContent);
  const isArabic = /[\u0600-\u06FF]/.test(content);

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`text-sm leading-relaxed text-gray-800 dark:text-slate-100 ${
        isArabic ? 'text-right font-sans' : 'text-left'
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[#8A661C] dark:text-[#E2CB85] tracking-wide">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-gray-700 dark:text-slate-200">{children}</em>,
          ul: ({ children }) => (
            <ul className={`my-2 space-y-1.5 list-disc ${isArabic ? 'pr-5' : 'pl-5'}`}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className={`my-2 space-y-1.5 list-decimal ${isArabic ? 'pr-5' : 'pl-5'}`}>{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed marker:text-[#C9A84C] pl-1">{children}</li>
          ),
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-[#E2CB85] mt-3 mb-1.5 border-b border-[#C9A84C]/20 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-[#E2CB85] mt-2.5 mb-1">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-[#C9A84C] mt-2 mb-1">{children}</h3>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={`my-2 py-1.5 italic text-gray-700 dark:text-slate-300 bg-amber-50/50 dark:bg-white/5 rounded-lg border-[#C9A84C]/60 ${
                isArabic ? 'border-r-2 pr-3' : 'border-l-2 pl-3'
              }`}
            >
              {children}
            </blockquote>
          ),
          code: ({ inline, children }: any) => {
            if (inline) {
              return (
                <code className="bg-[#030712]/60 text-[#4CC9F0] px-1.5 py-0.5 rounded text-xs font-mono border border-white/10">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-[#030712]/80 text-[#4CC9F0] p-3 rounded-lg text-xs font-mono overflow-x-auto my-2 border border-white/10">
                <code>{children}</code>
              </pre>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4CC9F0] underline underline-offset-2 hover:text-[#70D6FF] transition-colors font-medium"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-2 space-y-1.5 rounded-lg border border-[#C9A84C]/25 bg-black/5 dark:bg-white/5 p-2.5 text-xs overflow-x-auto">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="py-1 px-1.5 text-left font-semibold text-[#8A661C] dark:text-[#E2CB85] border-b border-[#C9A84C]/25">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="py-1 px-1.5 border-b border-[#C9A84C]/10 align-top">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { t, locale } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = user
        ? t('assistant.welcomeUser').replace('{name}', user.name.split(' ')[0])
        : t('assistant.welcomeGuest');

      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen, user, messages.length]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg], language: locale || 'en' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            t('assistant.errorReply'),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#C9A84C] to-[#E2CB85] rounded-full shadow-[0_0_25px_rgba(201,168,76,0.5)] hover:shadow-[0_0_35px_rgba(201,168,76,0.8)] transition-all duration-300"
            >
              {/* Pulsing glow behind button */}
              <div className="absolute inset-0 rounded-full bg-[#C9A84C] opacity-40 animate-ping" />

              <svg
                className="w-7 h-7 text-[#080705] relative z-10"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Eye of Horus"
              >
                {/* Brow of Horus */}
                <path
                  d="M11 21C19 14 34 12 52 17"
                  stroke="#080705"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                {/* Outer Eye Almond */}
                <path
                  d="M12 31C19 22 39 21 51 30C41 39 22 40 12 31Z"
                  stroke="#080705"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                  fill="#080705"
                  fillOpacity="0.08"
                />
                {/* Iris & Pupil */}
                <circle cx="31.5" cy="30.5" r="5.5" fill="#080705" />
                <circle cx="31.5" cy="30.5" r="2.1" fill="#D6A044" />
                {/* Cosmetic Tail */}
                <path
                  d="M50 30L58 31.5"
                  stroke="#080705"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                {/* Vertical Falcon Cheek Mark */}
                <path
                  d="M27 38V50"
                  stroke="#080705"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Spiral Falcon Wing / Tear Drop */}
                <path
                  d="M34 37.5C38 43 43 49 50 48.5C53.5 48.2 55.5 45.8 54.8 43.2C54.1 40.8 51.2 40.2 49.5 41.8"
                  stroke="#080705"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Hover Label */}
              <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0A1628]/90 backdrop-blur-md border border-[#C9A84C]/20 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap">
                {t('assistant.title')}
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 right-0 w-full h-[100dvh] md:bottom-24 md:right-6 md:w-[420px] md:h-[620px] z-[100] flex flex-col bg-[#FDFBF7]/98 dark:bg-[#060E1A]/95 backdrop-blur-xl md:rounded-2xl border-t md:border border-slate-200 dark:border-[#C9A84C]/20 shadow-2xl dark:shadow-[0_0_50px_rgba(3,7,18,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-[#C9A84C]/10 bg-[#F8F3E9] dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#1B6B93]">
                  <span className="text-[#030712] font-bold text-xs">AI</span>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#060E1A]" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-semibold text-sm">{t('assistant.title')}</h3>
                  <p className="text-gray-500 dark:text-white/50 text-xs">{t('assistant.subtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#C9A84C] to-[#E2CB85] text-[#030712] font-semibold rounded-2xl rounded-tr-sm shadow-[0_4px_16px_rgba(201,168,76,0.25)]'
                        : 'bg-[#F8F3E9] dark:bg-[#0B1728]/95 text-gray-800 dark:text-slate-100 border border-slate-200 dark:border-[#C9A84C]/25 rounded-2xl rounded-tl-sm shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-md'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <FormattedAssistantMessage content={msg.content} />
                    ) : (
                      <div dir={/[\u0600-\u06FF]/.test(msg.content) ? 'rtl' : 'ltr'}>
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Initial Suggestions */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(t(`assistant.suggestions.${idx}`))}
                      className="px-3 py-2 bg-[#1B6B93]/10 dark:bg-[#1B6B93]/20 hover:bg-[#1B6B93]/20 dark:hover:bg-[#1B6B93]/40 border border-[#1B6B93]/30 text-[#1B6B93] dark:text-[#4CC9F0] text-xs font-medium rounded-lg transition-colors text-left"
                    >
                      {t(`assistant.suggestions.${idx}`)}
                    </button>
                  ))}
                </div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/5 rounded-2xl px-4 py-4 flex gap-1.5 items-center">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-1.5 h-1.5 bg-white/50 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-white/50 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-white/50 rounded-full"
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#F8F3E9] dark:bg-white/5 border-t border-slate-200 dark:border-[#C9A84C]/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputText);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('assistant.placeholder')}
                  className="flex-1 bg-white dark:bg-[#030712]/50 border border-slate-300 dark:border-white/10 focus:border-[#C9A84C]/50 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="p-3 bg-[#C9A84C] hover:bg-[#D5B965] disabled:opacity-50 disabled:hover:bg-[#C9A84C] text-[#030712] rounded-xl transition-colors"
                >
                  <svg
                    className="w-5 h-5 translate-x-0.5 -translate-y-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
