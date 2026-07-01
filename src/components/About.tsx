import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Edit2, Upload, Plus, Trash2, Check, X, Shield, BookOpen, Calendar, MapPin, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { uploadFile, getInstantImagePreview } from "../firebase";

interface InfoCard {
  id: string;
  label: string;
  value: string;
  iconName: "college" | "year" | "location" | "status";
}

interface AboutProps {
  isAdmin: boolean;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function About({ isAdmin, showToast }: AboutProps) {
  // Load local state synced with LocalStorage/Firestore
  const [aboutText, setAboutText] = useState(() => {
    return localStorage.getItem("about_text") || 
      "I am an aspiring software engineer current pursuing my B.Tech at St. Peter's Engineering College, Hyderabad. I am deeply enthusiastic about solving logical puzzles, creating interactive web services, and learning modern cloud technologies. I specialize in React, Node.js, and Express, with a constant drive to build high-performance, robust, and clean applications that help users solve real problems.";
  });

  const [bannerUrl, setBannerUrl] = useState(() => {
    return localStorage.getItem("about_banner_url") || 
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=675&q=80";
  });

  const [cards, setCards] = useState<InfoCard[]>(() => {
    const saved = localStorage.getItem("about_cards");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: "1", label: "College", value: "St. Peter's Engineering College", iconName: "college" },
      { id: "2", label: "Year", value: "B.Tech CSE - 4th Year", iconName: "year" },
      { id: "3", label: "Location", value: "Hyderabad, India", iconName: "location" },
      { id: "4", label: "Status", value: "Actively Seeking Opportunities", iconName: "status" }
    ];
  });

  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelUploadRef = useRef<{ cancel?: () => void } | null>(null);

  // Edit fields
  const [editAboutText, setEditAboutText] = useState(aboutText);
  const [editCards, setEditCards] = useState<InfoCard[]>(cards);

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem("about_text", aboutText);
  }, [aboutText]);

  useEffect(() => {
    localStorage.setItem("about_banner_url", bannerUrl);
  }, [bannerUrl]);

  useEffect(() => {
    localStorage.setItem("about_cards", JSON.stringify(cards));
  }, [cards]);

  const handleBannerUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    cancelUploadRef.current = {};
    
    // Get local preview immediately (instant!)
    try {
      const instantUrl = await getInstantImagePreview(file);
      setBannerUrl(instantUrl);
      showToast("Instant banner preview loaded!", "success");
    } catch (err) {
      console.error("Instant preview failed:", err);
    }

    // Perform actual background upload
    try {
      const url = await uploadFile(file, "about_banners", setUploadProgress, cancelUploadRef.current);
      setBannerUrl(url);
    } catch (err: any) {
      if (err && err.isCancelled) {
        showToast("Upload cancelled.", "info");
      } else {
        console.error("Background sync failed:", err);
        // Keep the instant preview URL so it can still be saved successfully!
        showToast("Cloud sync failed, using instant local version.", "info");
      }
    } finally {
      setUploading(false);
      cancelUploadRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (cancelUploadRef.current?.cancel) {
      cancelUploadRef.current.cancel();
    }
  };

  const handleSave = () => {
    setAboutText(editAboutText);
    setCards(editCards);
    setIsEditing(false);
    showToast("About section saved!", "success");
  };

  const handleAddCard = () => {
    const newCard: InfoCard = {
      id: Date.now().toString(),
      label: "New Category",
      value: "Add details here",
      iconName: "status"
    };
    setEditCards([...editCards, newCard]);
  };

  const handleDeleteCard = (id: string) => {
    setEditCards(editCards.filter(c => c.id !== id));
  };

  const handleCardFieldChange = (id: string, field: "label" | "value" | "iconName", val: string) => {
    setEditCards(
      editCards.map(c => {
        if (c.id === id) {
          return { ...c, [field]: val };
        }
        return c;
      })
    );
  };

  // Helper to map icon types
  const getIconComponent = (name: string) => {
    switch (name) {
      case "college":
        return <BookOpen className="text-brand-purple" size={24} />;
      case "year":
        return <Calendar className="text-brand-blue" size={24} />;
      case "location":
        return <MapPin className="text-brand-pink" size={24} />;
      default:
        return <Briefcase className="text-emerald-400" size={24} />;
    }
  };

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-slate-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-pulse" />
            <h2 className="text-xs font-black tracking-[0.2em] text-brand-pink uppercase">
              About Me
            </h2>
          </div>
          <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
            My <span className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink bg-clip-text text-transparent italic">Background & Focus</span>
          </h3>
          <div className="h-1.5 w-16 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: 16:9 Banner Image */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="relative group rounded-2xl overflow-hidden aspect-[16/9] border border-white/5 bg-slate-900 shadow-xl shadow-purple-500/5">
              <img
                src={bannerUrl}
                alt="About banner"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
              
              {isAdmin && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-2">
                    <Upload size={20} className={uploading ? "animate-bounce" : ""} />
                  </div>
                  <span className="text-xs text-white font-medium">Upload Banner Image (16:9)</span>
                </div>
              )}

              {uploading && (
                <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center p-4 z-20">
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="text-slate-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="text-emerald-400 transition-all duration-150 ease-out"
                        strokeWidth="3"
                        strokeDasharray={163.36}
                        strokeDashoffset={163.36 - (163.36 * uploadProgress) / 100}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-emerald-400 font-bold text-[10px]">
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-300 font-semibold text-[11px] mt-2">
                    Uploading banner...
                  </span>
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="mt-3 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <X size={10} />
                    <span>Cancel Upload</span>
                  </button>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleBannerUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </motion.div>

          {/* Right Column: Bio & Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-slate-100">Who is Akash Adepu?</h4>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditAboutText(aboutText);
                      setEditCards(cards);
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-all cursor-pointer"
                  >
                    <Edit2 size={12} />
                    <span>Edit About Info</span>
                  </button>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                {aboutText}
              </p>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((card, idx) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  className="glass-card p-5 rounded-2xl flex items-start space-x-4 hover:scale-[1.02] transition-transform"
                >
                  <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl">
                    {getIconComponent(card.iconName)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {card.label}
                    </h5>
                    <p className="text-slate-200 font-semibold text-sm sm:text-base mt-1 leading-snug">
                      {card.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>

        </div>

      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white">
                  <Shield size={20} />
                  <h3 className="font-bold text-lg">Edit About Me & Key Info Cards</h3>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-slate-300">
                {/* Paragraph input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    About Paragraph
                  </label>
                  <textarea
                    rows={5}
                    value={editAboutText}
                    onChange={(e) => setEditAboutText(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple resize-none"
                  />
                </div>

                {/* Key Cards Editor */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Key Info Cards ({editCards.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCard}
                      className="flex items-center gap-1 text-xs bg-brand-purple/20 hover:bg-brand-purple/45 text-brand-purple px-2.5 py-1.5 rounded-lg border border-brand-purple/30 transition-colors"
                    >
                      <Plus size={12} />
                      <span>Add Card</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editCards.map((c, index) => (
                      <div 
                        key={c.id} 
                        className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                      >
                        {/* Title input */}
                        <div className="md:col-span-3">
                          <input
                            type="text"
                            placeholder="Card Label"
                            value={c.label}
                            onChange={(e) => handleCardFieldChange(c.id, "label", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-purple"
                          />
                        </div>

                        {/* Value input */}
                        <div className="md:col-span-5">
                          <input
                            type="text"
                            placeholder="Card Value"
                            value={c.value}
                            onChange={(e) => handleCardFieldChange(c.id, "value", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-purple"
                          />
                        </div>

                        {/* Icon selector */}
                        <div className="md:col-span-3">
                          <select
                            value={c.iconName}
                            onChange={(e) => handleCardFieldChange(c.id, "iconName", e.target.value as any)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-brand-purple"
                          >
                            <option value="college">Graduation Cap</option>
                            <option value="year">Calendar Date</option>
                            <option value="location">Map Pin Location</option>
                            <option value="status">Briefcase Status</option>
                          </select>
                        </div>

                        {/* Delete action */}
                        <div className="md:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(c.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-slate-800/60 bg-slate-900/20 flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Check size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
