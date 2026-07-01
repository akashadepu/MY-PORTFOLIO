import { useState } from "react";
import { Edit2, Heart, Shield, Check, X, Github, Linkedin, Instagram, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SocialLinks } from "../types";

interface FooterProps {
  footerText: string;
  copyrightText: string;
  socialLinks: SocialLinks;
  isAdmin: boolean;
  onUpdateFooter: (text: string, copyright: string) => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  onNavigate?: (sectionId: string) => void;
}

export default function Footer({
  footerText,
  copyrightText,
  socialLinks,
  isAdmin,
  onUpdateFooter,
  showToast,
  onNavigate
}: FooterProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(footerText);
  const [editCopyright, setEditCopyright] = useState(copyrightText);

  const handleSave = () => {
    onUpdateFooter(editText.trim(), editCopyright.trim());
    setIsEditing(false);
    showToast("Footer content saved!", "success");
  };

  const quickLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "certifications", label: "Certifications" },
    { id: "activities", label: "Activities" },
    { id: "contact", label: "Contact" },
  ];

  const scrollToSection = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <footer className="relative bg-gradient-to-r from-brand-purple/20 via-[#0b0f19] to-brand-pink/20 pt-16 pb-12 border-t border-white/5 overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink rounded-full blur-md opacity-60" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* Logo Monogram */}
          <div 
            onClick={() => scrollToSection("home")}
            className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-purple via-brand-blue to-brand-pink flex items-center justify-center font-black text-white text-xl shadow-lg cursor-pointer hover:scale-105 transition-transform"
          >
            AA
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {quickLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Social Channels */}
          <div className="flex items-center space-x-4">
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Linkedin size={18} />
            </a>
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Github size={18} />
            </a>
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Instagram size={18} />
            </a>
            <a
              href={`mailto:${socialLinks.email}`}
              className="p-2.5 rounded-full bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Mail size={18} />
            </a>
          </div>

          {/* Text Line */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <p className="text-sm sm:text-base text-slate-300 font-medium flex items-center gap-1.5">
              <span>{footerText}</span>
            </p>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditText(footerText);
                  setEditCopyright(copyrightText);
                  setIsEditing(true);
                }}
                className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                title="Edit Footer Text"
              >
                <Edit2 size={10} />
              </button>
            )}
          </div>

          {/* Copyright Line */}
          <p className="text-xs text-slate-500 tracking-wider">
            {copyrightText}
          </p>

        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isAdmin && isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-brand-purple to-brand-pink p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white">
                  <Shield size={18} />
                  <h3 className="font-bold">Edit Footer Layout Lines</h3>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-slate-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Footer Main Text
                  </label>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Copyright Line
                  </label>
                  <input
                    type="text"
                    value={editCopyright}
                    onChange={(e) => setEditCopyright(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                  >
                    Save Footer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
