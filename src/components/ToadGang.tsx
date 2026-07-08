import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, X, ChevronRight, MessageSquare, Shield, Swords } from 'lucide-react';

interface ToadGangProps {
  onClose: () => void;
}

export default function ToadGang({ onClose }: ToadGangProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-disable scroll on background when splash overlay is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Dark Ambient Overlay with green glow */}
      <div 
        className="fixed inset-0 bg-[#020305]/95 backdrop-blur-md transition-opacity" 
        onClick={handleDismiss}
      />

      {/* Floating Sparkles & Matrix Rain background effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Playful & Highly Polished Splash Card */}
      <div className="relative w-full max-w-lg bg-[#080d12] border border-lime-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-lime-950/40 text-center space-y-6 transform scale-100 transition-all z-10 overflow-hidden group">
        
        {/* Samurai Top Border highlight */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-lime-400 via-emerald-500 to-teal-400" />
        
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-500 hover:text-lime-400 transition-colors p-2 hover:bg-slate-900/60 rounded-full border border-transparent hover:border-slate-800"
          title="Enter Dashboard"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Animated Toad Samurai Mascot Container */}
        <div className="relative py-4 flex justify-center">
          {/* Pulsing circular background plate */}
          <div className="absolute inset-0 m-auto w-36 h-36 rounded-full bg-gradient-to-tr from-lime-950/40 to-emerald-950/40 border border-lime-500/20 animate-ping opacity-30 pointer-events-none" />
          <div className="absolute inset-0 m-auto w-40 h-40 rounded-full bg-slate-900/40 border border-emerald-500/10 pointer-events-none" />
          
          {/* Custom SVG Toad Samurai Mascot */}
          <svg 
            className="w-36 h-36 relative z-10 drop-shadow-[0_0_20px_rgba(132,204,22,0.4)] animate-bounce"
            style={{ animationDuration: '3s' }}
            viewBox="0 0 200 200" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Crown / Red Samurai Bandana (Hachimaki) Knot */}
            <path d="M 50,45 L 35,35 L 42,30 Z" fill="#ef4444" className="animate-pulse" />
            <path d="M 150,45 L 165,35 L 158,30 Z" fill="#ef4444" className="animate-pulse" />
            
            {/* Bandana Tails floating behind */}
            <path d="M 38,36 C 25,30 20,45 15,40 C 22,48 28,42 38,36 Z" fill="#ef4444" />
            
            {/* Toad main green skin body */}
            <ellipse cx="100" cy="115" rx="65" ry="55" fill="#22c55e" />
            
            {/* Toad belly (cream / yellow color) */}
            <ellipse cx="100" cy="125" rx="42" ry="38" fill="#fef08a" />
            
            {/* Head contour */}
            <ellipse cx="100" cy="78" rx="55" ry="42" fill="#22c55e" />
            
            {/* Cute spotted markings on head and sides */}
            <circle cx="65" cy="85" r="5" fill="#15803d" />
            <circle cx="75" cy="75" r="4" fill="#15803d" />
            <circle cx="135" cy="85" r="5" fill="#15803d" />
            <circle cx="125" cy="75" r="4" fill="#15803d" />
            <circle cx="45" cy="115" r="6" fill="#15803d" />
            <circle cx="155" cy="115" r="6" fill="#15803d" />

            {/* Red Samurai Bandana wrapped around the head */}
            <rect x="44" y="60" width="112" height="12" rx="4" fill="#ef4444" />
            {/* White circle badge on the bandana (represents Japan / Bushido) */}
            <circle cx="100" cy="66" r="4.5" fill="#ffffff" />

            {/* Toad big expressive froggy eyes */}
            {/* Left Eye */}
            <circle cx="60" cy="55" r="16" fill="#22c55e" />
            <circle cx="60" cy="55" r="12" fill="#ffffff" />
            <circle cx="60" cy="55" r="7" fill="#0f172a" />
            {/* Left eye reflection */}
            <circle cx="57" cy="52" r="3.5" fill="#ffffff" />
            
            {/* Right Eye */}
            <circle cx="140" cy="55" r="16" fill="#22c55e" />
            <circle cx="140" cy="55" r="12" fill="#ffffff" />
            <circle cx="140" cy="55" r="7" fill="#0f172a" />
            {/* Right eye reflection */}
            <circle cx="137" cy="52" r="3.5" fill="#ffffff" />

            {/* Big friendly, happy frog mouth */}
            <path d="M 72,92 Q 100,105 128,92" stroke="#14532d" strokeWidth="4" strokeLinecap="round" />
            
            {/* Cute rosy cheeks (blushing) */}
            <circle cx="56" cy="88" r="6.5" fill="#f43f5e" opacity="0.6" className="animate-pulse" />
            <circle cx="144" cy="88" r="6.5" fill="#f43f5e" opacity="0.6" className="animate-pulse" />

            {/* Front legs / cute webbed hands resting on hips */}
            <path d="M 45,130 C 35,135 30,148 34,152" stroke="#15803d" strokeWidth="6" strokeLinecap="round" />
            <path d="M 155,130 C 165,135 170,148 166,152" stroke="#15803d" strokeWidth="6" strokeLinecap="round" />

            {/* Back cute toad feet */}
            {/* Left Foot */}
            <path d="M 50,165 Q 40,175 32,170" stroke="#15803d" strokeWidth="8" strokeLinecap="round" />
            {/* Right Foot */}
            <path d="M 150,165 Q 160,175 168,170" stroke="#15803d" strokeWidth="8" strokeLinecap="round" />

            {/* Miniature Samurai Katana on the back */}
            <rect x="75" y="150" width="50" height="6" rx="2" fill="#475569" transform="rotate(-15 100 150)" />
            <rect x="70" y="148" width="8" height="10" rx="1.5" fill="#b45309" transform="rotate(-15 100 150)" /> {/* Katana guard */}
            <rect x="58" y="150" width="14" height="5" rx="1" fill="#ef4444" transform="rotate(-15 100 150)" /> {/* Katana handle */}
          </svg>
        </div>

        {/* Content & Copywriting */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-950/50 border border-lime-500/20 text-lime-400 font-mono text-[10px] font-bold uppercase rounded-full">
            <Sparkles className="h-3 w-3 animate-spin text-lime-400" />
            COMMUNITY FIRST MEME ENGINE
          </div>
          <h1 className="text-3xl font-display font-black text-slate-100 tracking-tight">
            Welcome to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400 font-black">ToadGang™</span>!
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            The legendary Shogun amphibian guild on Base! Guided by code honor, absolute humor, and community coordination. Join our forces on Telegram now!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2 relative z-10">
          {/* Main Join Button with embedded Telegram link */}
          <a
            href="https://t.me/toadgang"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 hover:from-lime-400 hover:to-teal-400 text-slate-950 font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-lime-950/20 hover:shadow-lime-400/10 active:scale-[0.98]"
          >
            <MessageSquare className="h-4.5 w-4.5 fill-slate-950" />
            Join the ToadGang™ (Telegram)
            <ExternalLink className="h-3.5 w-3.5 text-slate-950" />
          </a>

          {/* Enter App secondary button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-300 font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
          >
            Enter Bushido Dashboard
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Honor Code & Security Pledge Footer inside overlay */}
        <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <Swords className="h-3 w-3 text-red-500" />
            <span>Way of the Sword</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-900" />
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-lime-500" />
            <span>100% Locked Liquidity</span>
          </div>
        </div>

      </div>
    </div>
  );
}
