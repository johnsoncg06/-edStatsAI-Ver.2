/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ProjectDetails } from '../types';
import { geminiService } from '../services/geminiService';
import { Send, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIChatProps {
  project: ProjectDetails | null;
  selectedAlgorithms: string[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIChat({ project, selectedAlgorithms }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '您好！我是您的醫學統計 AI 顧問。您可以詢問關於演算法選擇、數據處理或統計假設的任何問題。' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Add context about the current project
      const context = project 
        ? `[當前專案背景: ${project.title}, 目標: ${project.goal}, 已選演算法: ${selectedAlgorithms.join(', ')}] ` 
        : '';
      
      const stream = await geminiService.chat(history, context + userMessage);
      
      let fullText = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of stream) {
        fullText += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: '抱歉，我現在無法回應，請稍後再試。' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-[#F5F5F7] text-[#86868B]' : 'bg-[#0071E3] text-white'}`}>
                {m.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`}>
                <div className="markdown-body prose prose-sm max-w-none">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length - 1].role === 'user' && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0071E3] text-white flex items-center justify-center">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="bg-[#F5F5F7] p-4 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-[#D2D2D7]">
        <div className="relative">
          <input
            type="text"
            placeholder="詢問 AI 顧問..."
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-[#F5F5F7] border-none focus:ring-2 focus:ring-[#0071E3] transition-all"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#0071E3] hover:bg-white rounded-lg transition-all disabled:opacity-30"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-[#86868B] text-center">AI 建議僅供參考，請務必諮詢臨床統計專家。</p>
      </div>
    </div>
  );
}
