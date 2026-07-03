import { useState, FormEvent } from "react";
import { Plus, Trash2, Edit2, Check, X, Shield, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Skill } from "../types";

interface SkillsProps {
  skills: Skill[];
  isAdmin: boolean;
  onAddSkill: (skill: Skill) => void;
  onUpdateSkill: (skill: Skill) => void;
  onDeleteSkill: (id: string) => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

type CategoryType = "All" | "Languages" | "Frontend" | "Backend" | "Tools" | "Database";

export default function Skills({
  skills,
  isAdmin,
  onAddSkill,
  onUpdateSkill,
  onDeleteSkill,
  showToast
}: SkillsProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("All");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<Skill | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states for Add Skill
  const [newName, setNewName] = useState("");
  const [newPercentage, setNewPercentage] = useState(80);
  const [newCategory, setNewCategory] = useState<Skill["category"]>("Frontend");

  // Form states for Edit Skill
  const [editName, setEditName] = useState("");
  const [editPercentage, setEditPercentage] = useState(80);
  const [editCategory, setEditCategory] = useState<Skill["category"]>("Frontend");

  const categories: CategoryType[] = ["All", "Languages", "Frontend", "Backend", "Database", "Tools"];

  const filteredSkills = selectedCategory === "All"
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast("Skill name is required", "error");
      return;
    }
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: newName,
      percentage: newPercentage,
      category: newCategory
    };
    onAddSkill(newSkill);
    setNewName("");
    setNewPercentage(80);
    setIsAdding(false);
    showToast(`Added skill: ${newName}`, "success");
  };

  const handleEditOpen = (skill: Skill) => {
    setIsEditing(skill);
    setEditName(skill.name);
    setEditPercentage(skill.percentage);
    setEditCategory(skill.category);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    if (!editName.trim()) {
      showToast("Skill name cannot be empty", "error");
      return;
    }
    onUpdateSkill({
      id: isEditing.id,
      name: editName,
      percentage: editPercentage,
      category: editCategory
    });
    setIsEditing(null);
    showToast(`Updated skill: ${editName}`, "success");
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      onDeleteSkill(id);
      showToast(`Deleted skill: ${name}`, "success");
    }
  };

  // Helper color map for visual interest based on categories
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Languages":
        return "from-purple-500 to-indigo-500";
      case "Frontend":
        return "from-pink-500 to-rose-500";
      case "Backend":
        return "from-blue-500 to-indigo-500";
      case "Database":
        return "from-emerald-500 to-teal-500";
      default:
        return "from-amber-500 to-orange-500";
    }
  };

  return (
    <section id="skills" className="py-24 relative overflow-hidden bg-slate-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse" />
            <h2 className="text-xs font-black tracking-[0.2em] text-brand-blue uppercase">
              Acquired Skills
            </h2>
          </div>
          <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
            My <span className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink bg-clip-text text-transparent italic">Technical Toolkit</span>
          </h3>
          <div className="h-1.5 w-16 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Category Filter Pills & Admin Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12"
        >
          {/* Pills */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4.5 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide border transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-brand-purple to-brand-blue text-white border-transparent shadow-md shadow-purple-500/10"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Admin "Add Skill" trigger */}
          {isAdmin && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 self-start md:self-auto px-4.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Skill</span>
            </button>
          )}
        </motion.div>

        {/* Skills Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map(skill => (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="p-5 rounded-2xl glass-card flex flex-col justify-between group relative"
              >
                {/* Delete Confirmation Overlay */}
                {deleteConfirmId === skill.id && (
                  <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-3 z-30 text-center rounded-2xl border border-red-500/30">
                    <p className="text-xs font-semibold text-slate-200 mb-2">
                      Delete "{skill.name}"?
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSkill(skill.id);
                          setDeleteConfirmId(null);
                          showToast(`Deleted skill: ${skill.name}`, "success");
                        }}
                        className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(null);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Text and Actions */}
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100 text-sm sm:text-base">{skill.name}</span>
                    <span className="text-[10px] bg-slate-900 border border-white/5 text-slate-400 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                      {skill.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-300">{skill.percentage}%</span>
                    
                    {/* Admin micro-actions */}
                    {isAdmin && (
                      <div className="flex items-center space-x-1.5 ml-2">
                        <button
                          onClick={() => handleEditOpen(skill)}
                          className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(skill.id)}
                          className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar Container */}
                <div className="w-full h-3 bg-slate-900/60 rounded-full overflow-hidden border border-white/5 relative p-[1px]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${getCategoryColor(skill.category)} shadow-lg`}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredSkills.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-400">No skills found in this category.</p>
            </div>
          )}
        </motion.div>

      </div>

      {/* Add Skill Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-brand-purple to-brand-blue p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white">
                  <Shield size={18} />
                  <h3 className="font-bold">Add New Tech Skill</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-white hover:bg-white/15 p-1 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-slate-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Docker, TypeScript"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
                  >
                    <option value="Languages">Languages</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Tools">Tools</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Proficiency Percentage
                    </label>
                    <span className="text-xs font-bold font-mono text-brand-blue">{newPercentage}%</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={newPercentage}
                      onChange={(e) => setNewPercentage(parseInt(e.target.value))}
                      className="flex-1 accent-brand-purple h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                  >
                    Add Skill
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Skill Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white">
                  <Sliders size={18} />
                  <h3 className="font-bold">Modify Skill Details</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="text-white hover:bg-white/15 p-1 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-slate-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
                  >
                    <option value="Languages">Languages</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Tools">Tools</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Proficiency Percentage
                    </label>
                    <span className="text-xs font-bold font-mono text-brand-pink">{editPercentage}%</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={editPercentage}
                      onChange={(e) => setEditPercentage(parseInt(e.target.value))}
                      className="flex-1 accent-brand-pink h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(null)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                  >
                    Save Changes
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
