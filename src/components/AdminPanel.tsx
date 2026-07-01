import { useState, FormEvent, useEffect } from "react";
import { Settings, Shield, Key, Eye, EyeOff, Check, X, LogOut, Info, AlertTriangle, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdminCredentials, CustomSection } from "../types";
import AdminSectionManager from "./AdminSectionManager";

interface AdminPanelProps {
  isAdmin: boolean;
  onLogin: (credentials: AdminCredentials) => Promise<boolean>;
  onLogout: () => void;
  onUpdateCredentials: (currentPass: string, newCreds: AdminCredentials) => Promise<boolean>;
  isDemoMode: boolean;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  sections: CustomSection[];
  onAddSection: (section: CustomSection) => Promise<void>;
  onUpdateSection: (section: CustomSection) => Promise<void>;
  onDeleteSection: (id: string) => Promise<void>;
}

export default function AdminPanel({
  isAdmin,
  onLogin,
  onLogout,
  onUpdateCredentials,
  isDemoMode,
  showToast,
  sections,
  onAddSection,
  onUpdateSection,
  onDeleteSection
}: AdminPanelProps) {
  // Login States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  // Settings / Change Pass States
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newUsername, setNewUsername] = useState("akash");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [savingCreds, setSavingCreds] = useState(false);

  // Custom Content Sections Manager State
  const [showSectionManager, setShowSectionManager] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret key combination: Ctrl + Shift + A (or Cmd + Shift + A on macOS)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setShowLoginModal((prev) => !prev);
      }
    };

    const handleCustomOpen = () => {
      setShowLoginModal(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open_admin_login", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open_admin_login", handleCustomOpen);
    };
  }, []);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast("Username and password required", "error");
      return;
    }

    setLoggingIn(true);
    try {
      const success = await onLogin({ username: username.trim(), password: password.trim() });
      if (success) {
        setShowLoginModal(false);
        setUsername("");
        setPassword("");
        showToast("Logged in as Administrator!", "success");
      } else {
        showToast("Invalid credentials", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Authentication failed", "error");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleCredsUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPass.trim() || !newUsername.trim() || !newPass.trim()) {
      showToast("All fields are required", "error");
      return;
    }

    if (newPass !== confirmNewPass) {
      showToast("New passwords do not match", "error");
      return;
    }

    setSavingCreds(true);
    try {
      const success = await onUpdateCredentials(currentPass, {
        username: newUsername.trim(),
        password: newPass.trim()
      });

      if (success) {
        setShowSettingsModal(false);
        setCurrentPass("");
        setNewPass("");
        setConfirmNewPass("");
        showToast("Credentials updated successfully!", "success");
      } else {
        showToast("Incorrect current password", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update credentials", "error");
    } finally {
      setSavingCreds(false);
    }
  };

  return (
    <>
      {/* 2. Floating Admin Toolbar at top of page (Logged in mode) */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/90 backdrop-blur-md border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-xs font-semibold text-emerald-100"
          >
            <div className="flex items-center space-x-3">
              <Shield size={14} className="text-emerald-400 animate-pulse" />
              <span>ADMIN MODE ACTIVE</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                Direct live edits unlocked
              </span>
              
              {isDemoMode && (
                <div className="flex items-center space-x-1.5 text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded">
                  <AlertTriangle size={10} />
                  <span className="text-[10px]">Demo Offline Mode (Using LocalStorage)</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSectionManager(true)}
                className="flex items-center gap-1.5 bg-brand-purple/20 border border-brand-purple/45 hover:bg-brand-purple/35 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Layers size={12} />
                <span>Manage Sections</span>
              </button>

              <button
                onClick={() => {
                  setNewUsername("akash");
                  setShowSettingsModal(true);
                }}
                className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Key size={12} />
                <span>Change Password</span>
              </button>
              
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={12} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Login Modal popup */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-white/5"
            >
              <div className="bg-gradient-to-r from-brand-purple to-brand-blue p-5 flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <Shield size={18} />
                  <h3 className="font-bold">Admin Console Login</h3>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="p-6 space-y-4 text-slate-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple"
                    placeholder="Enter admin username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-purple to-brand-blue shadow-lg hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center space-x-1"
                >
                  <span>{loggingIn ? "Verifying..." : "Access Admin Console"}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Credentials Settings / Change Password Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-white/5"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <Key size={18} />
                  <h3 className="font-bold">Update Admin Credentials</h3>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCredsUpdate} className="p-6 space-y-4 text-slate-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="border-t border-slate-800/60 pt-3 mt-3">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    New Username
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCreds}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center"
                  >
                    {savingCreds ? "Updating..." : "Update Credentials"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminSectionManager
        isOpen={showSectionManager}
        onClose={() => setShowSectionManager(false)}
        sections={sections}
        onAddSection={onAddSection}
        onUpdateSection={onUpdateSection}
        onDeleteSection={onDeleteSection}
        showToast={showToast}
      />
    </>
  );
}
