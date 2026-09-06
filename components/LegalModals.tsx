'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, FileText, Mail, Lock, CheckCircle2 } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'contact' | null;

interface LegalModalsProps {
  activeModal: LegalModalType;
  onClose: () => void;
}

export default function LegalModals({ activeModal, onClose }: LegalModalsProps) {
  if (!activeModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-white border border-[#ffe0e6] rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(255,107,107,0.3)] flex flex-col max-h-[85vh] relative text-[#2D3436]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#ffe0e6] bg-[#FFF5F7] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FF6B6B] text-white flex items-center justify-center shadow-xs">
                {activeModal === 'privacy' && <ShieldCheck className="w-5 h-5" />}
                {activeModal === 'terms' && <FileText className="w-5 h-5" />}
                {activeModal === 'contact' && <Mail className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-black text-[#2D3436]">
                  {activeModal === 'privacy' && 'Privacy Policy & Data Protection'}
                  {activeModal === 'terms' && 'Terms of Service & Community Guidelines'}
                  {activeModal === 'contact' && 'Contact Us & Grievance Support'}
                </h3>
                <p className="text-xs text-[#636E72] font-medium">
                  VibeMatch Platform • Last updated: {new Date().getFullYear()}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 text-[#636E72] hover:text-[#2D3436] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
            {activeModal === 'privacy' && (
              <>
                <div className="bg-[#e8f8ec] border border-[#6BCB77]/30 rounded-2xl p-4 flex items-start gap-3 text-[#1e6f3d]">
                  <Lock className="w-5 h-5 shrink-0 mt-0.5 text-[#2e7d32]" />
                  <p className="text-xs font-semibold leading-relaxed">
                    <strong>Privacy First Guarantee:</strong> VibeMatch strictly protects your personal information. We never sell, rent, or trade your personal data with third-party advertisers.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-sm text-[#2D3436]">1. Information We Collect</h4>
                  <p>
                    When you use VibeMatch, we may collect basic profile details you voluntarily provide (such as your display name, age, selected conversation topics/preferences, and optional contact details like WhatsApp number when you request direct connection).
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-sm text-[#2D3436]">2. How Your Information Is Used</h4>
                  <p>
                    Collected details are used solely to match you with compatible conversational partners, provide in-app customer support, and ensure community safety.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-sm text-[#2D3436]">3. Data Security & Storage</h4>
                  <p>
                    All data is transmitted over 256-bit SSL encrypted channels and stored in secure Google Cloud Firebase databases with strict access-control protocols.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-sm text-[#2D3436]">4. Age Restriction (18+)</h4>
                  <p>
                    VibeMatch is strictly intended for individuals aged 18 years and above. We do not knowingly collect or maintain data from minors.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-sm text-[#2D3436]">5. User Rights & Data Deletion</h4>
                  <p>
                    You retain full right to request data erasure or profile modification at any time by contacting our support team.
                  </p>
                </div>
              </>
            )}

            {activeModal === 'terms' && (
              <>
                <div className="space-y-2">
                  <h4 className="font-black text-sm text-[#2D3436]">1. Acceptance of Terms</h4>
                  <p>
                    By accessing or registering on VibeMatch, you confirm that you are at least 18 years of age and agree to comply with our Terms of Service and Code of Conduct.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-sm text-[#2D3436]">2. Community Conduct & Respect</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs">
                    <li>Treat all members with mutual respect, dignity, and courtesy.</li>
                    <li>Strictly zero tolerance for harassment, abuse, unsolicited explicit media, or hate speech.</li>
                    <li>Any fraudulent profile or impersonation will lead to immediate account termination.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-sm text-[#2D3436]">3. Voluntary Interaction</h4>
                  <p>
                    All conversations, friendship matching, and contact sharing are completely voluntary between consenting adults. VibeMatch promotes safe and meaningful social interaction.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-sm text-[#2D3436]">4. Termination & Moderation</h4>
                  <p>
                    We reserve the right to suspend or block any user who violates community standards or engages in abusive behavior.
                  </p>
                </div>
              </>
            )}

            {activeModal === 'contact' && (
              <>
                <div className="space-y-3">
                  <p>
                    We are dedicated to providing a safe, comfortable, and respectful platform for all our users. If you have any inquiries, feedback, or grievance reports, reach out to our team:
                  </p>

                  <div className="bg-[#FFF5F7] border border-[#ffe0e6] p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2D3436]">
                      <Mail className="w-4 h-4 text-[#FF6B6B]" />
                      <span>Email Support: <a href="mailto:support@vibematch.in" className="text-[#FF6B6B] underline">support@vibematch.in</a></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2D3436]">
                      <CheckCircle2 className="w-4 h-4 text-[#6BCB77]" />
                      <span>Response Time: Typically within 12-24 hours</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#636E72]">
                    For urgent support or chat assistance, you can also use the in-app Help & Support button inside your profile zone.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#ffe0e6] bg-[#fafafa] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-[#2D3436] hover:bg-[#1a1e20] text-white text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
