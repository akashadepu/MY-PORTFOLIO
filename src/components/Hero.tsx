import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Edit2, Upload, ChevronDown, Check, X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Profile } from "../types";
import { uploadFile, getInstantImagePreview } from "../firebase";

interface HeroProps {
  profile: Profile;
  isAdmin: boolean;
  onUpdateProfile: (updated: Profile) => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  onNavigate?: (sectionId: string) => void;
}

export default function Hero({ profile, isAdmin, onUpdateProfile, showToast, onNavigate }: HeroProps) {
  const [typedText, setTypedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modalUploading, setModalUploading] = useState(false);
  const [modalUploadProgress, setModalUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const cancelUploadRef = useRef<{ cancel?: () => void } | null>(null);
  const cancelModalUploadRef = useRef<{ cancel?: () => void } | null>(null);

  // Edit states
  const [editName, setEditName] = useState(profile.name);
  const [editTitle, setEditTitle] = useState(profile.title);
  const [editCollege, setEditCollege] = useState(profile.college);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editFrom, setEditFrom] = useState(profile.gradientFrom || "#8B5CF6");
  const [editTo, setEditTo] = useState(profile.gradientTo || "#EC4899");
  const [editPhotoUrl, setEditPhotoUrl] = useState(profile.profilePhotoUrl);
  const [editGreeting, setEditGreeting] = useState(profile.greetingText || "Hi, I'm");

  // Typing Effect
  useEffect(() => {
    const greeting = profile.greetingText || "Hi, I'm";
    const fullText = `${greeting} ${profile.name} 👋`;
    let index = 0;
    setTypedText("");

    const interval = setInterval(() => {
      index++;
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [profile.name, profile.greetingText]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    cancelUploadRef.current = {};
    
    // Get local preview immediately (instant!)
    try {
      const instantUrl = await getInstantImagePreview(file);
      onUpdateProfile({
        ...profile,
        profilePhotoUrl: instantUrl
      });
      setEditPhotoUrl(instantUrl); // Also update edit state
      showToast("Instant profile photo preview loaded!", "success");
    } catch (err) {
      console.error("Instant preview failed:", err);
    }

    // Perform actual background upload
    try {
      const url = await uploadFile(file, "profile_photos", setUploadProgress, cancelUploadRef.current);
      onUpdateProfile({
        ...profile,
        profilePhotoUrl: url
      });
      setEditPhotoUrl(url);
    } catch (err: any) {
      if (err && err.isCancelled) {
        showToast("Upload cancelled.", "info");
      } else {
        console.error("Background sync failed:", err);
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

  // Handle Photo Upload in the Edit Modal
  const handleModalPhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setModalUploading(true);
    setModalUploadProgress(0);
    cancelModalUploadRef.current = {};
    
    // Get local preview immediately (instant!)
    try {
      const instantUrl = await getInstantImagePreview(file);
      setEditPhotoUrl(instantUrl);
      showToast("Instant profile photo preview loaded!", "success");
    } catch (err) {
      console.error("Instant preview failed:", err);
    }

    // Perform actual background upload
    try {
      const url = await uploadFile(file, "profile_photos", setModalUploadProgress, cancelModalUploadRef.current);
      setEditPhotoUrl(url);
    } catch (err: any) {
      if (err && err.isCancelled) {
        showToast("Upload cancelled.", "info");
      } else {
        console.error("Background sync failed:", err);
        showToast("Cloud sync failed, using instant local version.", "info");
      }
    } finally {
      setModalUploading(false);
      cancelModalUploadRef.current = null;
    }
  };

  const handleCancelModalUpload = () => {
    if (cancelModalUploadRef.current?.cancel) {
      cancelModalUploadRef.current.cancel();
    }
  };

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      name: editName,
      title: editTitle,
      college: editCollege,
      bio: editBio,
      gradientFrom: editFrom,
      gradientTo: editTo,
      profilePhotoUrl: editPhotoUrl,
      greetingText: editGreeting
    });
    setIsEditing(false);
    showToast("Profile settings saved!", "success");
  };

  const scrollDown = () => {
    if (onNavigate) {
      onNavigate("about");
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden"
    >
      {/* Animated Floating Shapes Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-purple/10 blur-[130px] -top-20 -left-20 animate-pulse" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-brand-pink/10 blur-[120px] bottom-10 right-10 animate-pulse delay-1000" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-brand-blue/10 blur-[100px] top-1/3 left-1/2 animate-pulse delay-500" />
        
        {/* Floating circles */}
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-[15%] w-12 h-12 rounded-full bg-gradient-to-tr from-brand-purple/20 to-brand-blue/20 border border-white/5 backdrop-blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-[15%] w-16 h-16 rounded-full bg-gradient-to-tr from-brand-pink/20 to-brand-blue/20 border border-white/5 backdrop-blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-[10%] w-8 h-8 rounded-full bg-gradient-to-tr from-brand-purple/20 to-brand-pink/20 border border-white/5"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-[1px] w-12 bg-brand-blue"></div>
              <span className="text-brand-blue font-mono text-sm tracking-widest uppercase">Portfolio 2026</span>
            </div>

            <div className="inline-flex items-center space-x-2 bg-slate-900/45 border border-white/5 px-4 py-1.5 rounded-full text-slate-300 font-medium text-xs sm:text-sm tracking-wide shadow-sm backdrop-blur-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Available for Opportunities</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] tracking-tight">
                <span className="block text-slate-100 min-h-[70px] sm:min-h-[80px] cursor-blink">
                  {typedText}
                </span>
                <span className="block mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink bg-clip-text text-transparent">
                  {profile.title}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 font-semibold tracking-wide max-w-xl uppercase">
                🏫 {profile.college}
              </p>

              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate("projects");
                  }
                }}
                className="px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all cursor-pointer"
              >
                View My Work
              </button>
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate("contact");
                  }
                }}
                className="px-8 py-3.5 rounded-xl font-semibold text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-900/50 hover:border-slate-500 transition-all cursor-pointer"
              >
                Contact Me
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    setEditName(profile.name);
                    setEditTitle(profile.title);
                    setEditCollege(profile.college);
                    setEditBio(profile.bio);
                    setEditFrom(profile.gradientFrom || "#8B5CF6");
                    setEditTo(profile.gradientTo || "#EC4899");
                    setEditPhotoUrl(profile.profilePhotoUrl);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1.5 px-6 py-3.5 rounded-xl font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Edit2 size={16} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Hero Right: Profile Photo (16:9 ratio image box) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-md aspect-[16/9] rounded-2xl p-[3px] bg-gradient-to-tr from-brand-purple via-brand-blue to-brand-pink shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/30 transition-all duration-500">
              <div className="w-full h-full rounded-2xl overflow-hidden relative bg-slate-950/90 flex items-center justify-center">
                <img
                  src={profile.profilePhotoUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    // Fallback to high tech colorful canvas gradient placeholder if image fails
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const pl = parent.querySelector('.gradient-placeholder');
                      if (pl) pl.classList.remove('hidden');
                    }
                  }}
                />
                
                {/* Fallback visual gradient placeholder */}
                <div className="gradient-placeholder hidden absolute inset-0 bg-gradient-to-tr from-brand-purple/20 via-slate-900 to-brand-pink/20 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-purple via-brand-blue to-brand-pink flex items-center justify-center font-bold text-2xl text-white shadow-lg mb-3">
                    AA
                  </div>
                  <span className="text-slate-300 font-semibold">{profile.name}</span>
                  <span className="text-slate-500 text-xs mt-1">Photo Placeholder</span>
                </div>

                {/* Upload Overlay on Hover/Progress for Admin */}
                {isAdmin && (
                  <>
                    {uploading ? (
                      <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center p-4 z-20">
                        <div className="relative flex items-center justify-center w-14 h-14">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="28"
                              cy="28"
                              r="22"
                              className="text-slate-800"
                              strokeWidth="3"
                              stroke="currentColor"
                              fill="transparent"
                            />
                            <circle
                              cx="28"
                              cy="28"
                              r="22"
                              className="text-emerald-400 transition-all duration-150 ease-out"
                              strokeWidth="3"
                              strokeDasharray={138.23}
                              strokeDashoffset={138.23 - (138.23 * uploadProgress) / 100}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-emerald-400 font-bold text-[9px]">
                              {uploadProgress}%
                            </span>
                          </div>
                        </div>
                        <span className="text-slate-300 font-semibold text-[10px] mt-1.5">
                          Uploading photo...
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelUpload();
                          }}
                          className="mt-2 px-2.5 py-0.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-md text-[9px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <X size={8} />
                          <span>Cancel Upload</span>
                        </button>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer"
                           onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-2">
                          <Upload size={20} />
                        </div>
                        <span className="text-xs text-slate-200 font-medium">
                          Upload Photo (16:9)
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          Saves to Firebase Storage
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Secret hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Down arrow indicator */}
      <div 
        onClick={scrollDown}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 cursor-pointer animate-bounce text-slate-500 hover:text-white transition-colors"
      >
        <ChevronDown size={28} />
      </div>

      {/* Modal Profile Editor */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white">
                  <Shield size={20} />
                  <h3 className="font-bold text-lg">Edit Portfolio Identity & Hero</h3>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Greeting Intro
                    </label>
                    <input
                      type="text"
                      value={editGreeting}
                      onChange={(e) => setEditGreeting(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    College / Institution
                  </label>
                  <input
                    type="text"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Bio Paragraph
                  </label>
                  <textarea
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple resize-none"
                  />
                </div>

                {/* 16:9 Image preview and upload inside Modal */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Profile Photo (16:9 ratio recommended)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-xl">
                    <div className="md:col-span-4 aspect-[16/9] rounded-lg overflow-hidden bg-slate-950 relative border border-slate-800 flex items-center justify-center">
                      {editPhotoUrl ? (
                        <img src={editPhotoUrl} alt="Modal Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-600 text-xs">No Image</span>
                      )}
                      {modalUploading && (
                        <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center p-2 z-20">
                          <div className="relative flex items-center justify-center w-10 h-10">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                className="text-slate-800"
                                strokeWidth="2.5"
                                stroke="currentColor"
                                fill="transparent"
                              />
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                className="text-emerald-400 transition-all duration-150 ease-out"
                                strokeWidth="2.5"
                                strokeDasharray={100.53}
                                strokeDashoffset={100.53 - (100.53 * modalUploadProgress) / 100}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                              <span className="text-emerald-400 font-bold text-[8px]">
                                {modalUploadProgress}%
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelModalUpload();
                            }}
                            className="mt-1.5 px-1.5 py-0.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded text-[8px] font-bold transition-all flex items-center space-x-0.5 cursor-pointer"
                          >
                            <X size={8} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-8 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Or enter Image URL directly"
                          value={editPhotoUrl}
                          onChange={(e) => setEditPhotoUrl(e.target.value)}
                          className="flex-1 bg-slate-950/60 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
                        />
                        <button
                          type="button"
                          onClick={() => modalFileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Upload size={12} />
                          <span>Upload File</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Supports JPEG, PNG, WEBP. Compresses automatically to save space.
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={modalFileInputRef}
                    onChange={handleModalPhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Theme Gradient Pickers */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Gradient From Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={editFrom}
                        onChange={(e) => setEditFrom(e.target.value)}
                        className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editFrom}
                        onChange={(e) => setEditFrom(e.target.value)}
                        className="flex-1 bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Gradient To Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={editTo}
                        onChange={(e) => setEditTo(e.target.value)}
                        className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editTo}
                        onChange={(e) => setEditTo(e.target.value)}
                        className="flex-1 bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
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
