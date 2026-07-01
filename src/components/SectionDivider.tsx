import { motion } from "motion/react";

export default function SectionDivider() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pointer-events-none select-none relative z-10" id="section-divider">
      <div className="relative h-px w-full flex justify-center items-center">
        {/* Soft underlying background line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/40 to-transparent h-px" />
        
        {/* Animated gradient highlight overlay */}
        <motion.div
          initial={{ width: "0%", opacity: 0 }}
          whileInView={{ width: "60%", opacity: 0.7 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute h-[1.5px] bg-gradient-to-r from-transparent via-brand-purple via-brand-blue via-brand-pink to-transparent filter blur-[0.5px]"
        />

        {/* Small subtle center glowing bead */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.3, ease: "backOut" }}
          className="absolute w-1.5 h-1.5 rounded-full bg-brand-blue shadow-[0_0_8px_rgba(168,85,247,0.8)] border border-white/20"
        />
      </div>
    </div>
  );
}
