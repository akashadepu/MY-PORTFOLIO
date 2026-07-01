import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { Plus, Trash2, Edit2, Eye, Calendar, Upload, Check, X, Shield, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Certification } from "../types";
import { uploadFile, getInstantImagePreview } from "../firebase";

interface CertificationsProps {
  certifications: Certification[];
  isAdmin: boolean;
  onAddCertification: (cert: Certification) => void;
  onUpdateCertification: (cert: Certification) => void;
  onDeleteCertification: (id: string) => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function Certifications({
  certifications,
  isAdmin,
  onAddCertification,
  onUpdateCertification,
  onDeleteCertification,
  showToast
}: CertificationsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<Certification | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
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
  const [imageUrl, setImageUrl] = useState("");

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
      showToast("Instant certificate preview loaded!", "success");
    } catch (err) {
      console.error("Instant preview failed:", err);
    }

    // Perform actual background upload
    try {
      const url = await uploadFile(file, "certifications", setUploadProgress, cancelUploadRef.current);
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
    setImageUrl("https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=800&h=450&q=80");
    setIsAdding(true);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !org.trim() || !date.trim()) {
      showToast("Title, Org, and Date are required", "error");
      return;
    }

    const newCert: Certification = {
      id: Date.now().toString(),
      title,
      org,
      date,
      description,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=800&h=450&q=80"
    };

    onAddCertification(newCert);
    setIsAdding(false);
    showToast(`Added certification: ${title}`, "success");
  };

  const handleEditOpen = (cert: Certification) => {
    setIsEditing(cert);
    setTitle(cert.title);
    setOrg(cert.org);
    setDate(cert.date);
    setDescription(cert.description);
    setImageUrl(cert.imageUrl);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    if (!title.trim() || !org.trim() || !date.trim()) {
      showToast("Title, Org, and Date are required", "error");
      return;
    }

    onUpdateCertification({
      id: isEditing.id,
      title,
      org,
      date,
      description,
      imageUrl
    });

    setIsEditing(null);
    showToast(`Updated certification: ${title}`, "success");
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete certificate: "${name}"?`)) {
      onDeleteCertification(id);
      showToast(`Deleted certification: ${name}`, "success");
    }
  };

  return (
    <section id="certifications" className="py-24 relative overflow-hidden bg-slate-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse" />
            <h2 className="text-xs font-black tracking-[0.2em] text-brand-blue uppercase">
              Credentials
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
            <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
              My <span className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink bg-clip-text text-transparent italic">Certifications</span>
            </h3>
            {isAdmin && (
              <button
                onClick={handleAddOpen}
                className="flex items-center gap-1 self-center px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Certificate</span>
              </button>
            )}
          </div>
          <div className="h-1.5 w-16 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink mx-auto mt-4 rounded-full" />
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {certifications.map((cert, idx) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="glass-card rounded-2xl overflow-hidden hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col h-full group relative"
              >
                {/* Delete Confirmation Overlay */}
                {deleteConfirmId === cert.id && (
                  <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 z-30 text-center rounded-2xl border border-red-500/30">
                    <p className="text-sm font-semibold text-slate-200 mb-4">
                      Delete "{cert.title}"?
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCertification(cert.id);
                          setDeleteConfirmId(null);
                          showToast(`Deleted certification: ${cert.title}`, "success");
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

                {/* 16:9 Image box */}
                <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-900 border-b border-white/5">
                  <img
                    src={cert.imageUrl}
                    alt={cert.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                  
                  {/* Action buttons overlay */}
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <button
                      onClick={() => setLightboxUrl(cert.imageUrl)}
                      className="flex items-center gap-1.5 bg-brand-blue/95 hover:bg-brand-blue text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>View Certificate</span>
                    </button>
                  </div>

                  {/* Admin actions overlay */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-20">
                      <button
                        onClick={() => handleEditOpen(cert)}
                        className="p-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-600 text-white shadow-lg transition-colors cursor-pointer"
                        title="Edit Certificate"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(cert.id)}
                        className="p-2 rounded-xl bg-red-500/90 hover:bg-red-600 text-white shadow-lg transition-colors cursor-pointer"
                        title="Delete Certificate"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Info Text */}
                <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                      <Award size={14} className="text-brand-pink" />
                      <span className="font-bold uppercase tracking-wider">{cert.org}</span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-brand-blue transition-colors">
                      {cert.title}
                    </h4>

                    {cert.description && (
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
                        {cert.description}
                      </p>
                    )}
                  </div>

                  {/* Date and CTA */}
                  <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Calendar size={12} />
                      {cert.date}
                    </span>
                    <button
                      onClick={() => setLightboxUrl(cert.imageUrl)}
                      className="text-brand-blue hover:text-brand-pink font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Show Full</span>
                      <Eye size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {certifications.length === 0 && (
            <div className="col-span-full text-center py-16 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-400">No certifications logged yet.</p>
            </div>
          )}
        </div>

      </div>

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
              onClick={(e) => e.stopPropagation()} // stop close on image click
            >
              <img 
                src={lightboxUrl} 
                alt="Certificate View" 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[85vh] object-contain rounded-xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Certification Dialog */}
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
                    {isAdding ? "Log New Certification" : "Edit Certification Entry"}
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
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Certification Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Issuing Organization
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
                      Date Obtained
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jan 2025"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Short Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple resize-none"
                  />
                </div>

                {/* 16:9 Image Preview and upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Certificate Image (16:9 ratio)
                  </label>
                  <div className="space-y-2">
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 relative border border-slate-800 flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-500 flex flex-col items-center">
                          <Eye size={32} />
                          <span className="text-xs mt-1">No File Preview Loaded</span>
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
                            Uploading certificate...
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
                        placeholder="Or input dynamic URL directly"
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
                      accept="image/*,application/pdf"
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
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                  >
                    Save Certificate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
