import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { Plus, Trash2, Edit2, Check, X, MoveUp, MoveDown, Upload, FileText, Globe, Layers, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CustomSection } from "../types";
import { uploadFile, getInstantImagePreview } from "../firebase";

interface AdminSectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  sections: CustomSection[];
  onAddSection: (section: CustomSection) => Promise<void>;
  onUpdateSection: (section: CustomSection) => Promise<void>;
  onDeleteSection: (id: string) => Promise<void>;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function AdminSectionManager({
  isOpen,
  onClose,
  sections,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  showToast
}: AdminSectionManagerProps) {
  const [editingSection, setEditingSection] = useState<CustomSection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelUploadRef = useRef<{ cancel?: () => void } | null>(null);

  const resetForm = () => {
    setTitle("");
    setHeading("");
    setSubheading("");
    setContent("");
    setImageUrl("");
    setIsActive(true);
    setOrder(sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 1);
    setEditingSection(null);
    setIsCreating(false);
    setUploadProgress(0);
    setUploading(false);
  };

  const handleEditClick = (sec: CustomSection) => {
    setEditingSection(sec);
    setIsCreating(false);
    setTitle(sec.title);
    setHeading(sec.heading);
    setSubheading(sec.subheading || "");
    setContent(sec.content);
    setImageUrl(sec.imageUrl || "");
    setIsActive(sec.isActive);
    setOrder(sec.order);
  };

  const handleCreateClick = () => {
    resetForm();
    setIsCreating(true);
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    cancelUploadRef.current = {};

    try {
      const instantUrl = await getInstantImagePreview(file);
      setImageUrl(instantUrl);
    } catch (err) {
      console.error("Instant preview failed:", err);
    }

    try {
      const url = await uploadFile(file, "custom_sections", setUploadProgress, cancelUploadRef.current);
      setImageUrl(url);
      showToast("Section image uploaded successfully!", "success");
    } catch (err: any) {
      if (err && err.isCancelled) {
        showToast("Upload cancelled.", "info");
      } else {
        console.error("Upload failed:", err);
        showToast("Upload failed, using local preview.", "info");
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !heading.trim() || !content.trim()) {
      showToast("Title, Heading, and Content are required fields.", "error");
      return;
    }

    const sectionData: CustomSection = {
      id: editingSection ? editingSection.id : `section_${Date.now()}`,
      title: title.trim(),
      heading: heading.trim(),
      subheading: subheading.trim() || undefined,
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      isActive,
      order: Number(order) || 0
    };

    try {
      if (editingSection) {
        await onUpdateSection(sectionData);
        showToast(`Section "${title}" updated successfully!`, "success");
      } else {
        await onAddSection(sectionData);
        showToast(`New Section "${title}" created successfully!`, "success");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      showToast("Error saving section.", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (deleteConfirmId === id) {
      try {
        await onDeleteSection(id);
        showToast(`Section "${name}" deleted.`, "success");
        if (editingSection?.id === id) {
          resetForm();
        }
      } catch (err) {
        console.error(err);
        showToast("Error deleting section.", "error");
      }
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      showToast(`Click again on Trash to confirm deleting "${name}"`, "info");
      setTimeout(() => {
        setDeleteConfirmId(current => current === id ? null : current);
      }, 4000);
    }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const temp = sorted[index].order;
    sorted[index].order = sorted[targetIdx].order;
    sorted[targetIdx].order = temp;

    try {
      await onUpdateSection(sorted[index]);
      await onUpdateSection(sorted[targetIdx]);
      showToast("Sections reordered successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Reorder sync failed.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="glass-card w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-3">
            <Layers className="text-white animate-pulse" size={24} />
            <div>
              <h3 className="font-bold text-lg">Custom Content Sections Manager</h3>
              <p className="text-xs text-white/70">Create, edit, and arrange custom portfolio page views dynamically</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="p-1.5 rounded-xl hover:bg-white/15 transition-colors cursor-pointer"
            title="Close Manager"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Split Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Side: Sections List */}
          <div className="w-full md:w-[320px] border-r border-white/5 bg-slate-900/30 overflow-y-auto p-4 flex flex-col justify-start space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Sections</span>
              <button
                onClick={handleCreateClick}
                className="flex items-center space-x-1 px-2.5 py-1 bg-brand-purple/20 hover:bg-brand-purple/35 text-brand-purple hover:text-brand-pink border border-brand-purple/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                <Plus size={12} />
                <span>Add Section</span>
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl">
                <FileText size={28} className="text-slate-600 mb-2" />
                <p className="text-slate-400 text-xs font-semibold">No Custom Sections</p>
                <p className="text-slate-500 text-[10px] mt-1">Create your first custom tab to display extra content on your portfolio page!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...sections]
                  .sort((a, b) => a.order - b.order)
                  .map((sec, idx) => (
                    <div
                      key={sec.id}
                      className={`group p-3 rounded-xl border transition-all flex items-center justify-between ${
                        editingSection?.id === sec.id
                          ? "bg-brand-purple/10 border-brand-purple/50 shadow-md"
                          : "bg-slate-950/20 border-white/5 hover:border-slate-700 hover:bg-slate-900/10"
                      }`}
                    >
                      <div 
                        onClick={() => handleEditClick(sec)}
                        className="flex-1 min-w-0 pr-2 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-200 truncate">{sec.title}</span>
                          {!sec.isActive && (
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded border border-white/5 flex items-center space-x-0.5">
                              <EyeOff size={8} />
                              <span>Hidden</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{sec.heading}</p>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveOrder(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="Move Up"
                        >
                          <MoveUp size={12} />
                        </button>
                        <button
                          onClick={() => moveOrder(idx, "down")}
                          disabled={idx === sections.length - 1}
                          className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="Move Down"
                        >
                          <MoveDown size={12} />
                        </button>
                        <button
                          onClick={() => handleEditClick(sec)}
                          className="p-1 text-brand-blue hover:text-white cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(sec.id, sec.title)}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            deleteConfirmId === sec.id 
                              ? "text-red-500 bg-red-500/20 border border-red-500/40 animate-pulse scale-110" 
                              : "text-red-400 hover:text-red-300"
                          }`}
                          title={deleteConfirmId === sec.id ? "Click again to confirm delete" : "Delete"}
                        >
                          <Trash2 size={deleteConfirmId === sec.id ? 14 : 12} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Right Side: Editor form */}
          <div className="flex-1 bg-slate-950/40 p-6 overflow-y-auto">
            {isCreating || editingSection ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className="text-base font-bold text-slate-200 border-b border-white/5 pb-2">
                  {editingSection ? `Editing Section: "${editingSection.title}"` : "Create New Custom Section"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Navbar Menu Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Research, Hobbies"
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Order Weight (Sorting)
                    </label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                      placeholder="Sorting index"
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Heading */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Section Heading *
                    </label>
                    <input
                      type="text"
                      required
                      value={heading}
                      onChange={(e) => setHeading(e.target.value)}
                      placeholder="e.g., Academic Publications & Research"
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>

                  {/* Subheading */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Subheading / Subtext
                    </label>
                    <input
                      type="text"
                      value={subheading}
                      onChange={(e) => setSubheading(e.target.value)}
                      placeholder="e.g., My published papers & research interests"
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </div>

                {/* Section Content */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                    <span>Section Content *</span>
                    <span className="text-[10px] text-slate-500 lowercase font-medium">supports plain text or basic Markdown spacing</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter the main body of your custom section..."
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple font-sans leading-relaxed"
                  />
                </div>

                {/* Photo / Visual banner Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Section Illustration Image
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-8">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Image URL or upload a file"
                        className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
                      />
                    </div>
                    <div className="sm:col-span-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Upload size={14} className={uploading ? "animate-bounce" : ""} />
                        <span>Upload File</span>
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail / progress */}
                  {(imageUrl || uploading) && (
                    <div className="mt-3 relative w-full h-36 rounded-2xl overflow-hidden border border-white/5 bg-slate-900 flex items-center justify-center">
                      {imageUrl && !uploading && (
                        <img
                          src={imageUrl}
                          alt="Section preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      {!imageUrl && !uploading && (
                        <span className="text-slate-600 text-xs">No Image Loaded</span>
                      )}

                      {uploading && (
                        <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center p-3 z-10">
                          <div className="relative flex items-center justify-center w-12 h-12">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="24"
                                cy="24"
                                r="18"
                                className="text-slate-800"
                                strokeWidth="2.5"
                                stroke="currentColor"
                                fill="transparent"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="18"
                                className="text-emerald-400 transition-all duration-150 ease-out"
                                strokeWidth="2.5"
                                strokeDasharray={113.1}
                                strokeDashoffset={113.1 - (113.1 * uploadProgress) / 100}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                              />
                            </svg>
                            <span className="absolute text-emerald-400 font-bold text-[9px]">{uploadProgress}%</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCancelUpload}
                            className="mt-2 px-2.5 py-0.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded text-[9px] font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Section Visibility */}
                <div className="flex items-center space-x-3 bg-slate-900/40 border border-white/5 p-3 rounded-2xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-purple focus:ring-brand-purple bg-slate-950 border-slate-800 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-xs sm:text-sm text-slate-300 font-semibold cursor-pointer select-none">
                    Publish this section (Visible in Navbar and Portfolio page)
                  </label>
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand-purple hover:bg-brand-purple/95 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-500/10 cursor-pointer flex items-center space-x-1"
                  >
                    <Check size={12} />
                    <span>{editingSection ? "Save Changes" : "Create Section"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <Globe size={40} className="text-slate-600 animate-pulse" />
                <h5 className="text-sm font-bold text-slate-300">Select or Create a Custom Section</h5>
                <p className="text-xs text-slate-500 max-w-sm">
                  Click on an existing section in the left panel to edit its details, reorder navigation hierarchy, or click "Add Section" to make a brand new one.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
