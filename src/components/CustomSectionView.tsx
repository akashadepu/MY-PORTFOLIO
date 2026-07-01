import React from "react";
import { motion } from "motion/react";
import { CustomSection } from "../types";
import { FileText, Calendar, Compass, Share2 } from "lucide-react";

interface CustomSectionViewProps {
  key?: string | number;
  section: CustomSection;
}

export default function CustomSectionView({ section }: CustomSectionViewProps) {
  return (
    <section id={section.id} className="relative py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Decorative background glow behind custom sections */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-bold uppercase tracking-widest inline-flex items-center space-x-1.5 mb-4"
        >
          <Compass size={12} className="animate-spin-slow text-brand-pink" />
          <span>{section.title}</span>
        </motion.span>
        
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight"
        >
          {section.heading}
        </motion.h2>

        {section.subheading && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-400 font-medium"
          >
            {section.subheading}
          </motion.p>
        )}
      </div>

      {/* Main Body Layout */}
      <div className="relative z-10">
        {section.imageUrl ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Image Box */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, type: "spring", stiffness: 100 }}
              className="lg:col-span-5 group relative rounded-3xl overflow-hidden bg-slate-950/40 p-2.5 border border-white/5 shadow-2xl shadow-purple-500/5 hover:border-slate-800 transition-colors"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/5">
                <img
                  src={section.imageUrl}
                  alt={section.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
              </div>
            </motion.div>

            {/* Text Box */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="lg:col-span-7 space-y-6 bg-slate-900/10 border border-white/5 p-6 sm:p-8 rounded-3xl backdrop-blur-sm"
            >
              <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                {section.content}
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="max-w-4xl mx-auto bg-slate-900/15 border border-white/5 p-8 sm:p-12 rounded-3xl backdrop-blur-md relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-brand-purple via-brand-blue to-brand-pink" />
            <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
              {section.content}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
