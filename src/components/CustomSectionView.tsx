import React from "react";
import { motion } from "motion/react";
import { CustomSection } from "../types";
import { FileText, Calendar, Compass, Share2, ArrowUpRight } from "lucide-react";

interface CustomSectionViewProps {
  key?: string | number;
  section: CustomSection;
}

export default function CustomSectionView({ section }: CustomSectionViewProps) {
  const layout = section.layout || "left-image";
  const hasImage = !!section.imageUrl;

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
        {/* Scenario 1: Centered or No Image */}
        {layout === "centered" || !hasImage ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="max-w-4xl mx-auto bg-slate-900/15 border border-white/5 p-8 sm:p-12 rounded-3xl backdrop-blur-md relative overflow-hidden text-center flex flex-col items-center"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink" />
            
            {hasImage && (
              <div className="w-full max-w-2xl mb-8 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                <img
                  src={section.imageUrl}
                  alt={section.title}
                  className="w-full h-auto object-cover max-h-[350px]"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium mb-6">
              {section.content}
            </div>

            {section.linkText && section.linkUrl && (
              <a
                href={section.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink hover:opacity-90 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer animate-pulse"
              >
                <span>{section.linkText}</span>
                <ArrowUpRight size={15} />
              </a>
            )}
          </motion.div>
        ) : (
          /* Scenario 2: Columns layouts (Left Image, Right Image, or Split) */
          <div className={`grid grid-cols-1 gap-12 items-start ${
            layout === "split" ? "lg:grid-cols-2" : "lg:grid-cols-12"
          }`}>
            {/* Image Block */}
            <motion.div
              initial={{ opacity: 0, x: layout === "left-image" ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, type: "spring", stiffness: 100 }}
              className={`group relative rounded-3xl overflow-hidden bg-slate-950/40 p-2.5 border border-white/5 shadow-2xl shadow-purple-500/5 hover:border-slate-800 transition-colors ${
                layout === "split" 
                  ? "w-full" 
                  : layout === "left-image" 
                    ? "lg:col-span-5 lg:order-1" 
                    : "lg:col-span-5 lg:order-2"
              }`}
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

            {/* Text Box Block */}
            <motion.div
              initial={{ opacity: 0, x: layout === "left-image" ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className={`space-y-6 bg-slate-900/10 border border-white/5 p-6 sm:p-8 rounded-3xl backdrop-blur-sm ${
                layout === "split"
                  ? "w-full"
                  : layout === "left-image"
                    ? "lg:col-span-7 lg:order-2"
                    : "lg:col-span-7 lg:order-1"
              }`}
            >
              <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                {section.content}
              </div>

              {section.linkText && section.linkUrl && (
                <div className="pt-2">
                  <a
                    href={section.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-blue hover:to-brand-pink text-white text-xs font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{section.linkText}</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
