import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { Plus, Trash2, Edit2, Github, ExternalLink, Image, Upload, Check, X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Project } from "../types";
import { uploadFile, getInstantImagePreview } from "../firebase";

interface ProjectsProps {
  projects: Project[];
  isAdmin: boolean;
  onAddProject: (proj: Project) => void;
  onUpdateProject: (proj: Project) => void;
  onDeleteProject: (id: string) => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function Projects({
  projects,
  isAdmin,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  showToast
}: ProjectsProps) {
  const [isEditing, setIsEditing] = useState<Project | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelUploadRef = useRef<{ cancel?: () => void } | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState(""); // comma-separated
  const [githubLink, setGithubLink] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Description read-more state
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
      showToast("Instant image preview loaded!", "success");
    } catch (err) {
      console.error("Instant preview failed:", err);
    }

    // Perform actual background upload
    try {
      const url = await uploadFile(file, "projects", setUploadProgress, cancelUploadRef.current);
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
    setDescription("");
    setTechInput("");
    setGithubLink("");
    setDemoLink("");
    setImageUrl("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&h=450&q=80");
    setIsAdding(true);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast("Title and Description are required", "error");
      return;
    }

    const techArray = techInput
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newProject: Project = {
      id: Date.now().toString(),
      title,
      description,
      tech: techArray.length > 0 ? techArray : ["HTML", "CSS"],
      githubLink: githubLink.trim() || "https://github.com",
      demoLink: demoLink.trim() || undefined,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&h=450&q=80"
    };

    onAddProject(newProject);
    setIsAdding(false);
    showToast(`Created project: ${title}`, "success");
  };

  const handleEditOpen = (proj: Project) => {
    setIsEditing(proj);
    setTitle(proj.title);
    setDescription(proj.description);
    setTechInput(proj.tech.join(", "));
    setGithubLink(proj.githubLink);
    setDemoLink(proj.demoLink || "");
    setImageUrl(proj.imageUrl);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    if (!title.trim() || !description.trim()) {
      showToast("Title and Description are required", "error");
      return;
    }

    const techArray = techInput
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onUpdateProject({
      id: isEditing.id,
      title,
      description,
      tech: techArray,
      githubLink: githubLink.trim(),
      demoLink: demoLink.trim() ? demoLink.trim() : undefined,
      imageUrl
    });

    setIsEditing(null);
    showToast(`Updated project: ${title}`, "success");
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete project "${name}"? This action cannot be undone.`)) {
      onDeleteProject(id);
      showToast(`Deleted project: ${name}`, "success");
    }
  };

  return (
    <section id="projects" className="py-24 relative overflow-hidden bg-slate-950/30">
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
              Selected Works
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
            <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
              My <span className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink bg-clip-text text-transparent italic">Creative Projects</span>
            </h3>
            {isAdmin && (
              <button
                onClick={handleAddOpen}
                className="flex items-center gap-1 self-center px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Project</span>
              </button>
            )}
          </div>
          <div className="h-1.5 w-16 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {projects.map((proj, idx) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + idx * 0.08 }}
                className="glass-card rounded-2xl overflow-hidden hover:scale-[1.03] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col h-full group relative"
              >
                {/* Delete Confirmation Overlay */}
                {deleteConfirmId === proj.id && (
                  <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 z-30 text-center rounded-2xl border border-red-500/30">
                    <p className="text-sm font-semibold text-slate-200 mb-4">
                      Delete "{proj.title}"?
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(proj.id);
                          setDeleteConfirmId(null);
                          showToast(`Deleted project: ${proj.title}`, "success");
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

                {/* Image 16:9 box */}
                <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-900 border-b border-white/5">
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                  
                  {/* Admin Controls Overlay */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-20">
                      <button
                        onClick={() => handleEditOpen(proj)}
                        className="p-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-600 text-white shadow-lg transition-colors cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(proj.id)}
                        className="p-2 rounded-xl bg-red-500/90 hover:bg-red-600 text-white shadow-lg transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-lg sm:text-xl font-bold text-slate-100 group-hover:text-brand-pink transition-colors">
                      {proj.title}
                    </h4>
                    <p className={`text-slate-400 text-sm leading-relaxed ${expandedIds.includes(proj.id) ? "" : "line-clamp-3"}`}>
                      {proj.description}
                    </p>
                    {proj.description && proj.description.length > 120 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(proj.id);
                        }}
                        className="text-xs font-bold text-brand-pink hover:text-brand-pink/85 transition-colors mt-1 flex items-center gap-0.5 cursor-pointer focus:outline-none"
                      >
                        {expandedIds.includes(proj.id) ? "Show Less" : "Read More"}
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tech.map((t, idx) => (
                        <span
                          key={`${t}-${idx}`}
                          className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900/65 border border-white/5 text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <a
                        href={proj.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900 hover:border-slate-500 transition-colors"
                      >
                        <Github size={14} />
                        <span>GitHub</span>
                      </a>
                      {proj.demoLink && (
                        <a
                          href={proj.demoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-purple to-brand-blue text-white hover:opacity-90 transition-opacity"
                        >
                          <ExternalLink size={14} />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {projects.length === 0 && (
            <div className="col-span-full text-center py-16 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-400">No projects added yet.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Project Dialog */}
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
                    {isAdding ? "Create Project Showcase" : "Edit Project Details"}
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
                    Project Title
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
                    Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Tech Stack Badges (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, Node.js, Express, MongoDB"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Live Demo URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={demoLink}
                      onChange={(e) => setDemoLink(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple text-xs"
                    />
                  </div>
                </div>

                {/* 16:9 Image preview and upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Thumbnail Image (16:9 ratio)
                  </label>
                  <div className="space-y-2">
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 relative border border-slate-800 flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-500 flex flex-col items-center">
                          <Image size={32} />
                          <span className="text-xs mt-1">No Image Loaded</span>
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
                            Uploading image...
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
                        placeholder="Or enter Image URL directly"
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
                      "Save Project"
                    )}
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
