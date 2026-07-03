import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { Plus, Trash2, Edit2, Calendar, Upload, Check, X, Shield, Users, Award, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Activity } from "../types";
import { uploadFile, getInstantImagePreview } from "../firebase";

interface ActivitiesProps {
  activities: Activity[];
  isAdmin: boolean;
  onAddActivity: (act: Activity) => void;
  onUpdateActivity: (act: Activity) => void;
  onDeleteActivity: (id: string) => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function Activities({
  activities,
  isAdmin,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  showToast
}: ActivitiesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<Activity | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelUploadRef = useRef<{ cancel?: () => void } | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [org, setOrg] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [roleBadge, setRoleBadge] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // UI state for Full Image lightbox & Description expand
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    cancelUploadRef.current = {};
    
    // Get local preview immediately (instant!)
    try {
      const instantUrl = await getInstantImagePreview(file);
      setImageUrl(instantUrl);
      showToast("Instant activity preview loaded!", "success");
    } catch (err) {
      console.error("Instant preview failed:", err);
    }

    // Perform actual background upload
    try {
      const url = await uploadFile(file, "activities", setUploadProgress, cancelUploadRef.current);
      setImageUrl(url);
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

  const handleAddOpen = () => {
    setTitle("");
    setOrg("");
    setDate("");
    setDescription("");
    setRoleBadge("Leadership");
    setImageUrl("https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&h=450&q=80");
    setIsAdding(true);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !org.trim() || !date.trim()) {
      showToast("Title, Organization, and Date are required", "error");
      return;
    }

    const newAct: Activity = {
      id: Date.now().toString(),
      title,
      org,
      date,
      description,
      roleBadge: roleBadge.trim() || "Participant",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&h=450&q=80"
    };

    onAddActivity(newAct);
    setIsAdding(false);
    showToast(`Added activity: ${title}`, "success");
  };

  const handleEditOpen = (act: Activity) => {
    setIsEditing(act);
    setTitle(act.title);
    setOrg(act.org);
    setDate(act.date);
    setDescription(act.description);
    setRoleBadge(act.roleBadge);
    setImageUrl(act.imageUrl);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    if (!title.trim() || !org.trim() || !date.trim()) {
      showToast("Title, Organization, and Date are required", "error");
      return;
    }

    onUpdateActivity({
      id: isEditing.id,
      title,
      org,
      date,
      description,
      roleBadge: roleBadge.trim(),
      imageUrl
    });

    setIsEditing(null);
    showToast(`Updated activity: ${title}`, "success");
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete activity: "${name}"?`)) {
      onDeleteActivity(id);
      showToast(`Deleted activity: ${name}`, "success");
    }
  };

  return (
    <section id="activities" className="py-24 relative overflow-hidden bg-slate-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-pulse" />
            <h2 className="text-xs font-black tracking-[0.2em] text-brand-pink uppercase">
              Involvement
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
            <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
              My <span className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink bg-clip-text text-transparent italic">Extracurriculars</span>
            </h3>
            {isAdmin && (
              <button
                onClick={handleAddOpen}
                className="flex items-center gap-1 self-center px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Activity</span>
              </button>
            )}
          </div>
          <div className="h-1.5 w-16 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {activities.map((act, idx) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + idx * 0.08 }}
                className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col md:flex-row h-full group relative"
              >
                {/* Delete Confirmation Overlay */}
                {deleteConfirmId === act.id && (
                  <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 z-30 text-center rounded-2xl border border-red-500/30">
                    <p className="text-sm font-semibold text-slate-200 mb-4">
                      Delete "{act.title}"?
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteActivity(act.id);
                          setDeleteConfirmId(null);
                          showToast(`Deleted activity: ${act.title}`, "success");
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(null);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* 16:9 Image box left */}
                <div className="aspect-[16/9] md:aspect-auto md:w-2/5 relative overflow-hidden bg-slate-900 border-b md:border-b-0 md:border-r border-white/5">
                  <img
                    src={act.imageUrl}
                    alt={act.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-50" />
                  
                  {/* Click to open full-screen overlay option */}
                  <div 
                    onClick={() => setLightboxUrl(act.imageUrl)}
                    className="absolute inset-0 bg-slate-950/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 cursor-pointer z-10"
                  >
                    <div className="p-2 rounded-full bg-brand-pink/25 text-brand-pink border border-brand-pink/30 shadow-lg shadow-brand-pink/10">
                      <Eye size={18} />
                    </div>
                    <span className="text-xs font-black tracking-wider text-white uppercase bg-slate-950/85 px-2.5 py-1 rounded-lg border border-white/5">
                      Show Full Image
                    </span>
                  </div>
                  
                  {/* Role Badge top left */}
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-brand-purple to-brand-pink text-white text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                    {act.roleBadge}
                  </span>

                  {/* Admin actions overlay */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-20">
                      <button
                        onClick={() => handleEditOpen(act)}
                        className="p-1.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-600 text-white shadow-lg transition-colors cursor-pointer"
                        title="Edit Activity"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(act.id)}
                        className="p-1.5 rounded-xl bg-red-500/90 hover:bg-red-600 text-white shadow-lg transition-colors cursor-pointer"
                        title="Delete Activity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Info Text Right */}
                <div className="p-6 flex flex-col flex-1 justify-between space-y-4 md:w-3/5">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                      <Users size={14} className="text-brand-blue" />
                      <span className="font-bold uppercase tracking-wider">{act.org}</span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-brand-pink transition-colors">
                      {act.title}
                    </h4>

                    {act.description && (
                      <div>
                        <p className={`text-slate-400 text-xs sm:text-sm leading-relaxed ${expandedIds.includes(act.id) ? "" : "line-clamp-3"}`}>
                          {act.description}
                        </p>
                        {act.description.length > 120 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(act.id);
                            }}
                            className="text-xs font-bold text-brand-pink hover:text-brand-pink/85 transition-colors mt-1 flex items-center gap-0.5 cursor-pointer focus:outline-none"
                          >
                            {expandedIds.includes(act.id) ? "Show Less" : "Read More"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Date footer */}
                  <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Calendar size={12} />
                      {act.date}
                    </span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-900/80 px-2 py-0.5 border border-white/5 rounded">
                      Involvement
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {activities.length === 0 && (
            <div className="col-span-full text-center py-16 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-400">No extracurricular activities logged yet.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Activity Dialog */}
      <AnimatePresence>
        {(isAdding || isEditing) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white">
                  <Shield size={18} />
                  <h3 className="font-bold">
                    {isAdding ? "Log New Extracurricular" : "Edit Activity Entry"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(null);
                  }}
                  className="text-white hover:bg-white/15 p-1 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form 
                onSubmit={isAdding ? handleAddSubmit : handleEditSubmit} 
                className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-slate-300"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Activity Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Role / Achievement Badge
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Leadership, Winner, Participant"
                      value={roleBadge}
                      onChange={(e) => setRoleBadge(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Organization or Event
                    </label>
                    <input
                      type="text"
                      required
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Date / Duration
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2024 - Present"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Description / Key Highlight
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple resize-none"
                  />
                </div>

                {/* 16:9 Image Preview and upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Activity Photo (16:9 ratio)
                  </label>
                  <div className="space-y-2">
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 relative border border-slate-800 flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-500 flex flex-col items-center">
                          <Plus size={32} />
                          <span className="text-xs mt-1">No Activity Photo Loaded</span>
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
                            Uploading photo...
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
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Or input image URL directly"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Upload size={12} />
                        <span>Upload File</span>
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setIsEditing(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`px-5 py-2 rounded-xl text-white font-semibold transition-all flex items-center gap-2 ${
                      uploading 
                        ? "bg-slate-700 cursor-not-allowed opacity-65" 
                        : "bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                    }`}
                  >
                    {uploading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      "Save Activity"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-zoom-out"
            onClick={() => setLightboxUrl(null)}
          >
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={() => setLightboxUrl(null)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={lightboxUrl} 
                alt="Activity View" 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[85vh] object-contain rounded-xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
