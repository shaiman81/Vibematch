'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { Member } from '@/lib/types';

interface SuccessScreenProps {
  member: Member;
  onReset: () => void;
  onOpenAdmin?: () => void;
}

export default function SuccessScreen({ member, onReset }: SuccessScreenProps) {
  return (
    <motion.section
      id="success-screen"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/90 backdrop-blur-md border border-[#ffe4e9] rounded-3xl p-8 sm:p-12 shadow-[0_20px_50px_-20px_rgba(255,107,107,0.2)] text-center"
    >
      {/* Animated Heart Icon */}
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#FFF5F7] border border-[#ffd1dc] flex items-center justify-center text-[#FF6B6B] shadow-sm">
        <Heart className="w-8 h-8 fill-[#FF6B6B]" />
      </div>

      <div className="inline-flex items-center gap-1.5 bg-[#e8f8ec] text-[#2e7d32] px-4 py-1 rounded-full text-xs font-bold mb-3">
        <Sparkles className="w-3.5 h-3.5 text-[#6BCB77]" />
        <span>Details Successfully Submitted!</span>
      </div>

      <h2 className="text-3xl sm:text-4xl font-black text-[#2D3436] tracking-tight mb-3">
        Thank You, {member.name}!
      </h2>

      <p className="text-base sm:text-lg text-[#636E72] font-medium max-w-md mx-auto mb-8">
        Aapki information successfully save ho gayi hai. Hum aapse bahut jaldi connect karenge!
      </p>

      {/* Summary Box */}
      <div className="max-w-md mx-auto bg-[#FFF5F7] border border-[#ffe0e6] rounded-2xl p-5 mb-8 text-left space-y-3">
        <div className="flex justify-between items-center text-xs text-[#A0A0A0] font-black uppercase">
          <span>Submitted Profile</span>
          <span className="text-[#FF6B6B]">Age: {member.age}</span>
        </div>

        <div className="text-sm font-bold text-[#2D3436]">
          Aapke Chune Gaye Topics:
        </div>

        <div className="flex flex-wrap gap-1.5">
          {member.interests.map((topic, idx) => (
            <span
              key={idx}
              className="bg-white border border-[#ffd1dc] text-[#FF6B6B] text-xs font-bold px-2.5 py-1 rounded-xl shadow-2xs"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-bold text-sm transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-white" />
          <span>Wapas Landing Page</span>
        </button>
      </div>
    </motion.section>
  );
}
