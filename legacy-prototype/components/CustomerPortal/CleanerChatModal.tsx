'use client';

import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { X, Send, ShieldCheck, Sparkles } from 'lucide-react';

interface CleanerChatModalProps {
  onClose: () => void;
}

export const CleanerChatModal: React.FC<CleanerChatModalProps> = ({ onClose }) => {
  const { activeBooking, chatMessages, sendChatMessage } = useBooking();
  const [inputText, setInputText] = useState('');

  const cleaner = activeBooking?.cleaner;

  const quickReplies = [
    'Thank you so much, Maria!',
    'Lockbox code is 4821',
    'Please focus on the shower glass if you have extra time',
    'Water bottles are in the fridge',
  ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText.trim(), 'customer');
    setInputText('');

    // Simulate friendly instant cleaner response
    setTimeout(() => {
      sendChatMessage('Received, thank you! On it right away!', 'cleaner');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full h-[580px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={cleaner?.avatar}
                alt={cleaner?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 absolute bottom-0 right-0" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold">{cleaner?.name}</h4>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active at your home
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          <div className="text-center">
            <span className="text-[10px] font-semibold text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
              Direct Encrypted In-App Chat
            </span>
          </div>

          {chatMessages.map((msg) => {
            const isMe = msg.sender === 'customer';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p className="font-medium">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">{msg.timestamp}</span>
              </div>
            );
          })}
        </div>

        {/* Quick Suggestions */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {quickReplies.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setInputText(r);
              }}
              className="text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border border-slate-200 shrink-0"
            >
              {r}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to Maria..."
            className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-transparent rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-emerald-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-colors shadow-xs active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
