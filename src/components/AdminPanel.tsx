import { useState, FormEvent, useEffect } from "react";
import { 
  Settings, Shield, Key, Eye, EyeOff, Check, X, LogOut, Info, AlertTriangle, 
  Layers, TrendingUp, BarChart2, Activity, ArrowUpRight, FileText, Printer, 
  Briefcase, Award, BookOpen, Mail, Phone, Globe, Download 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  AdminCredentials, CustomSection, DailyViewsData, Profile, Skill, 
  Project, Certification, Activity as ActivityType, PortfolioSettings 
} from "../types";
import { getDailyPageViews } from "../firebase";
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
  pageViews: number;
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  activities: ActivityType[];
  settings: PortfolioSettings | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md text-[11px] space-y-1">
        <p className="font-extrabold text-slate-300 border-b border-white/5 pb-1 mb-1">{label}</p>
        {payload.map((pld: any, idx: number) => (
          <p key={`${pld.name || idx}-${idx}`} className="font-semibold flex items-center justify-between gap-4">
            <span style={{ color: pld.color || pld.stroke }}>{pld.name}:</span>
            <span className="text-white font-black">{pld.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
  onDeleteSection,
  pageViews,
  profile,
  skills,
  projects,
  certifications,
  activities,
  settings
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

  // Resume Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeFormat, setResumeFormat] = useState<"classic-ats" | "modern-sidebar" | "tech-chic">("classic-ats");

  // Analytics States
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<DailyViewsData[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [chartType, setChartType] = useState<"daily" | "cumulative">("cumulative");

  useEffect(() => {
    if (showAnalyticsModal) {
      const fetchAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
          const data = await getDailyPageViews();
          setAnalyticsData(data);
        } catch (err) {
          console.error("Error loading analytics data:", err);
          showToast("Failed to load popularity data", "error");
        } finally {
          setLoadingAnalytics(false);
        }
      };
      fetchAnalytics();
    }
  }, [showAnalyticsModal]);

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

  const renderResumeContent = () => {
    const defaultEmail = "adepuakash1@gmail.com";
    const userEmail = settings?.socialLinks?.email || defaultEmail;
    const githubUrl = settings?.socialLinks?.github || "https://github.com";
    const linkedinUrl = settings?.socialLinks?.linkedin || "https://linkedin.com";
    const websiteUrl = window.location.origin;

    // Group skills by category for resume
    const skillsByCategory = skills.reduce((acc, skill) => {
      const cat = skill.category || "Languages";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill.name);
      return acc;
    }, {} as Record<string, string[]>);

    // ==========================================
    // FORMAT 1: CLASSIC ATS (Traditional Single-Column)
    // ==========================================
    if (resumeFormat === "classic-ats") {
      return (
        <div className="resume-body text-slate-900 bg-white p-2">
          {/* Header Block */}
          <div className="text-center border-b-2 border-slate-900 pb-5 mb-5">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
              {profile?.name || "Akash Adepu"}
            </h1>
            <p className="text-xs sm:text-sm font-extrabold text-slate-600 tracking-wider uppercase mt-1">
              {profile?.title || "Full Stack Engineer"}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1.5 text-[10px] sm:text-xs text-slate-500 mt-3 font-semibold">
              {profile?.college && (
                <span className="flex items-center gap-1">
                  <Globe size={11} className="text-slate-400" />
                  <span>{profile.college}</span>
                </span>
              )}
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Mail size={11} className="text-slate-400" />
                <a href={`mailto:${userEmail}`} className="hover:underline text-slate-700 print-link">{userEmail}</a>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Globe size={11} className="text-slate-400" />
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-700 print-link">Portfolio</a>
              </span>
              {settings?.socialLinks?.github && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <span className="font-bold">GitHub:</span>
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-700 print-link">{githubUrl.replace("https://", "")}</a>
                  </span>
                </>
              )}
              {settings?.socialLinks?.linkedin && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <span className="font-bold">LinkedIn:</span>
                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-700 print-link">{linkedinUrl.replace("https://", "")}</a>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Section: Summary */}
          {profile?.bio && (
            <div className="mb-6 text-left">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-1.5">
                <Briefcase size={13} className="text-slate-700" />
                <span>Professional Summary</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Section: Technical Skills */}
          {skills.length > 0 && (
            <div className="mb-6 text-left">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-1.5">
                <Award size={13} className="text-slate-700" />
                <span>Technical Skills</span>
              </h2>
              <div className="grid grid-cols-1 gap-1.5 text-[11px] sm:text-xs">
                {Object.entries(skillsByCategory).map(([category, names]) => (
                  <div key={category} className="flex items-start">
                    <span className="w-28 sm:w-32 font-bold text-slate-800 shrink-0">{category}:</span>
                    <span className="text-slate-600 font-medium leading-tight">{names.join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Projects */}
          {projects.length > 0 && (
            <div className="mb-6 text-left">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3 flex items-center gap-1.5">
                <Layers size={13} className="text-slate-700" />
                <span>Featured Technical Projects</span>
              </h2>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="group">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>{proj.title}</span>
                        <span className="text-[9px] font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 font-mono">
                          {proj.tech.join(", ")}
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold no-print">
                        <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-600 print-link flex items-center gap-0.5">
                          GitHub <ArrowUpRight size={10} />
                        </a>
                        {proj.demoLink && (
                          <>
                            <span>|</span>
                            <a href={proj.demoLink} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-600 print-link flex items-center gap-0.5">
                              Live Demo <ArrowUpRight size={10} />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Certifications */}
          {certifications.length > 0 && (
            <div className="mb-6 text-left">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3 flex items-center gap-1.5">
                <Award size={13} className="text-slate-700" />
                <span>Certifications & Credentials</span>
              </h2>
              <div className="space-y-3.5">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-0.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {cert.title} <span className="text-[10px] font-medium text-slate-500">by {cert.org}</span>
                      </h3>
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{cert.date}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                      {cert.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Co-curricular / Leadership Activities */}
          {activities.length > 0 && (
            <div className="mb-6 text-left">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3 flex items-center gap-1.5">
                <BookOpen size={13} className="text-slate-700" />
                <span>Co-Curricular & Leadership Experience</span>
              </h2>
              <div className="space-y-3.5">
                {activities.map((act) => (
                  <div key={act.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-0.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {act.title} <span className="text-[10px] font-semibold text-slate-500 italic">({act.roleBadge})</span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-slate-500 italic">{act.org}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{act.date}</span>
                      </div>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // ==========================================
    // FORMAT 2: MODERN SIDEBAR (Premium Two-Column)
    // ==========================================
    if (resumeFormat === "modern-sidebar") {
      return (
        <div className="resume-body text-slate-900 bg-white p-2">
          {/* Main Grid: Left sidebar (1/3), Right body (2/3) */}
          <div className="grid grid-cols-12 gap-6 items-start" id="modern-sidebar-grid">
            
            {/* Left Column Sidebar */}
            <div className="col-span-12 md:col-span-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-6" id="modern-sidebar-left">
              
              {/* Profile Block */}
              <div className="text-left pb-4 border-b border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg mb-3">
                  {(profile?.name || "AA").split(" ").map(n => n[0]).join("")}
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                  {profile?.name || "Akash Adepu"}
                </h1>
                <p className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase mt-1.5 leading-tight">
                  {profile?.title || "Full Stack Engineer"}
                </p>
              </div>

              {/* Contact Details */}
              <div className="text-left space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Connect Details
                </h3>
                <div className="space-y-2 text-[11px] font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <a href={`mailto:${userEmail}`} className="hover:underline truncate print-link">{userEmail}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={12} className="text-slate-400 shrink-0" />
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate print-link">Portfolio Website</a>
                  </div>
                  {settings?.socialLinks?.github && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[10px] text-slate-400 shrink-0">GH</span>
                      <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate print-link">{githubUrl.replace("https://", "")}</a>
                    </div>
                  )}
                  {settings?.socialLinks?.linkedin && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[10px] text-slate-400 shrink-0">LN</span>
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate print-link">{linkedinUrl.replace("https://", "")}</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Education Block */}
              {profile?.college && (
                <div className="text-left space-y-2 pt-2 border-t border-slate-200">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Education
                  </h3>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-900 leading-tight">
                      {profile.college}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      B.Tech in Computer Science
                    </p>
                  </div>
                </div>
              )}

              {/* Technical Skills Categorized */}
              {skills.length > 0 && (
                <div className="text-left space-y-4 pt-2 border-t border-slate-200">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Technical Skills
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(skillsByCategory).map(([category, names]) => (
                      <div key={category} className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{category}</span>
                        <div className="flex flex-wrap gap-1">
                          {names.map((name, idx) => (
                            <span 
                              key={`${name}-${idx}`}
                              className="bg-white border border-slate-200 text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column Body */}
            <div className="col-span-12 md:col-span-8 flex flex-col gap-6" id="modern-sidebar-right">
              
              {/* Professional Summary */}
              {profile?.bio && (
                <div className="text-left">
                  <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-1.5">
                    <Briefcase size={12} className="text-slate-500" />
                    <span>Executive Summary</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Technical Projects */}
              {projects.length > 0 && (
                <div className="text-left">
                  <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1.5 mb-4.5 flex items-center gap-1.5">
                    <Layers size={12} className="text-slate-500" />
                    <span>Featured Engineering Projects</span>
                  </h2>
                  <div className="space-y-4.5">
                    {projects.map((proj) => (
                      <div key={proj.id} className="relative">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                            {proj.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold no-print">
                            <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-600 print-link flex items-center gap-0.5">
                              GitHub <ArrowUpRight size={10} />
                            </a>
                            {proj.demoLink && (
                              <>
                                <span>|</span>
                                <a href={proj.demoLink} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-600 print-link flex items-center gap-0.5">
                                  Live Demo <ArrowUpRight size={10} />
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {proj.tech.map((t, idx) => (
                            <span key={`${t}-${idx}`} className="text-[9px] font-extrabold font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {certifications.length > 0 && (
                <div className="text-left">
                  <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1.5 mb-3.5 flex items-center gap-1.5">
                    <Award size={12} className="text-slate-500" />
                    <span>Certifications & Milestones</span>
                  </h2>
                  <div className="space-y-3.5">
                    {certifications.map((cert) => (
                      <div key={cert.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                            {cert.title} <span className="text-[10px] font-semibold text-slate-500">by {cert.org}</span>
                          </h3>
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{cert.date}</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed mt-1">
                          {cert.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leadership / Co-curricular Activities */}
              {activities.length > 0 && (
                <div className="text-left">
                  <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1.5 mb-3.5 flex items-center gap-1.5">
                    <BookOpen size={12} className="text-slate-500" />
                    <span>Leadership & Activities</span>
                  </h2>
                  <div className="space-y-3.5">
                    {activities.map((act) => (
                      <div key={act.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                            {act.title} <span className="text-[10px] font-semibold text-slate-500 italic">({act.roleBadge})</span>
                          </h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                            <span>{act.org}</span>
                            <span>•</span>
                            <span>{act.date}</span>
                          </div>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed mt-1">
                          {act.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      );
    }

    // ==========================================
    // FORMAT 3: TECH CHIC (Futuristic / Design-Minded Chronological)
    // ==========================================
    return (
      <div className="resume-body text-slate-900 bg-white p-2">
        {/* Dynamic Executive Banner */}
        <div className="border-l-4 border-indigo-600 pl-4 py-1.5 mb-6 text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            {profile?.name || "Akash Adepu"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-[10px] font-black uppercase bg-indigo-600 text-white px-2.5 py-0.5 rounded-full tracking-wider shadow-sm">
              {profile?.title || "Full Stack Engineer"}
            </span>
            {profile?.college && (
              <span className="text-[10px] font-bold text-slate-500 italic">
                {profile.college}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500 mt-4 font-semibold">
            <span className="flex items-center gap-1">
              <Mail size={12} className="text-indigo-500" />
              <a href={`mailto:${userEmail}`} className="hover:underline text-slate-700 print-link">{userEmail}</a>
            </span>
            <span className="flex items-center gap-1">
              <Globe size={12} className="text-indigo-500" />
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-700 print-link">Personal Hub</a>
            </span>
            {settings?.socialLinks?.github && (
              <span className="flex items-center gap-1">
                <span className="text-indigo-500 font-bold">GH</span>
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-700 print-link">{githubUrl.replace("https://", "")}</a>
              </span>
            )}
            {settings?.socialLinks?.linkedin && (
              <span className="flex items-center gap-1">
                <span className="text-indigo-500 font-bold">LN</span>
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-700 print-link">{linkedinUrl.replace("https://", "")}</a>
              </span>
            )}
          </div>
        </div>

        {/* Section: Core Summary */}
        {profile?.bio && (
          <div className="mb-6 text-left">
            <h2 className="text-xs sm:text-sm font-extrabold text-indigo-700 uppercase tracking-widest border-b border-indigo-100 pb-1 mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-600 rounded-sm inline-block" />
              <span>Professional Objective</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Section: Technical Stack Grid */}
        {skills.length > 0 && (
          <div className="mb-6 text-left">
            <h2 className="text-xs sm:text-sm font-extrabold text-indigo-700 uppercase tracking-widest border-b border-indigo-100 pb-1 mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-600 rounded-sm inline-block" />
              <span>Technology Matrix</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] sm:text-xs">
              {Object.entries(skillsByCategory).map(([category, names]) => (
                <div key={category} className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/50">
                  <div className="font-extrabold text-slate-900 mb-1.5 tracking-wider uppercase text-[10px]">
                    {category}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {names.map((name, idx) => (
                      <span key={`${name}-${idx}`} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Engineering Showcases */}
        {projects.length > 0 && (
          <div className="mb-6 text-left">
            <h2 className="text-xs sm:text-sm font-extrabold text-indigo-700 uppercase tracking-widest border-b border-indigo-100 pb-1 mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-600 rounded-sm inline-block" />
              <span>Featured Engineering Showcases</span>
            </h2>
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="relative pl-4 border-l-2 border-slate-200 hover:border-indigo-500 transition-colors">
                  {/* Decorative timeline bullet */}
                  <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border border-white" />
                  
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-950 flex items-center gap-2 flex-wrap">
                      <span>{proj.title}</span>
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-extrabold no-print">
                      <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 print-link flex items-center gap-0.5">
                        Codebase <ArrowUpRight size={10} />
                      </a>
                      {proj.demoLink && (
                        <>
                          <span>|</span>
                          <a href={proj.demoLink} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 print-link flex items-center gap-0.5">
                            Interactive Demo <ArrowUpRight size={10} />
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {proj.tech.map((t, idx) => (
                      <span key={`${t}-${idx}`} className="text-[9px] font-extrabold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Credentials */}
        {certifications.length > 0 && (
          <div className="mb-6 text-left">
            <h2 className="text-xs sm:text-sm font-extrabold text-indigo-700 uppercase tracking-widest border-b border-indigo-100 pb-1 mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-600 rounded-sm inline-block" />
              <span>Credentials & Accreditations</span>
            </h2>
            <div className="space-y-3">
              {certifications.map((cert) => (
                <div key={cert.id} className="relative pl-4 border-l-2 border-slate-200">
                  <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border border-white" />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-950">
                      {cert.title} <span className="text-[10px] font-medium text-slate-500">by {cert.org}</span>
                    </h3>
                    <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">{cert.date}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed mt-1">
                    {cert.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Leadership Experience */}
        {activities.length > 0 && (
          <div className="mb-4 text-left">
            <h2 className="text-xs sm:text-sm font-extrabold text-indigo-700 uppercase tracking-widest border-b border-indigo-100 pb-1 mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-600 rounded-sm inline-block" />
              <span>Co-curricular Initiatives</span>
            </h2>
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="relative pl-4 border-l-2 border-slate-200">
                  <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border border-white" />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-950">
                      {act.title} <span className="text-[10px] font-semibold text-slate-500 italic">({act.roleBadge})</span>
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                      <span>{act.org}</span>
                      <span>•</span>
                      <span>{act.date}</span>
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed mt-1">
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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

              <button
                onClick={() => setShowAnalyticsModal(true)}
                className="flex items-center space-x-1.5 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded text-[10px] cursor-pointer transition-colors"
                title="View Popularity Growth Chart"
              >
                <Eye size={11} className="text-emerald-400 animate-pulse" />
                <span>Page Views: <span className="font-bold text-white">{pageViews}</span></span>
              </button>
              
              {isDemoMode && (
                <div className="flex items-center space-x-1.5 text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded">
                  <AlertTriangle size={10} />
                  <span className="text-[10px]">Demo Offline Mode (Using LocalStorage)</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAnalyticsModal(true)}
                className="flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/45 hover:bg-blue-500/35 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Activity size={12} />
                <span>Popularity Chart</span>
              </button>

              <button
                onClick={() => setShowSectionManager(true)}
                className="flex items-center gap-1.5 bg-brand-purple/20 border border-brand-purple/45 hover:bg-brand-purple/35 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Layers size={12} />
                <span>Manage Sections</span>
              </button>

              <button
                onClick={() => setShowResumeModal(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/40 hover:from-purple-500/40 hover:to-indigo-500/40 text-white px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <FileText size={12} className="text-purple-400 animate-pulse" />
                <span>Export PDF</span>
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

      {/* 5. Popularity Analytics Modal */}
      <AnimatePresence>
        {showAnalyticsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-slate-900/90 text-slate-100 flex flex-col h-[90vh] max-h-[750px]"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink p-6 flex items-center justify-between text-white shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 rounded-xl animate-pulse">
                    <TrendingUp size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg sm:text-xl tracking-tight">Portfolio Popularity Dashboard</h3>
                    <p className="text-[10px] sm:text-xs text-white/80 font-medium">Visualizing real-time and historical organic traffic</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                
                {/* 4-Column Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Views Card */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-brand-purple/20 transition-all">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Total Views</span>
                      <Eye size={16} className="text-brand-purple" />
                    </div>
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black text-white">{pageViews}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">All-time tracked events</p>
                    </div>
                  </div>

                  {/* Today's Views Card */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-brand-blue/20 transition-all">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Today's Active</span>
                      <Activity size={16} className="text-brand-blue" />
                    </div>
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black text-white">
                        {analyticsData.length ? analyticsData[analyticsData.length - 1].views : 0}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1">Organic visits today</p>
                    </div>
                  </div>

                  {/* Daily Average Card */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-brand-pink/20 transition-all">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Daily Average</span>
                      <BarChart2 size={16} className="text-brand-pink" />
                    </div>
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black text-white">
                        {analyticsData.length 
                          ? Math.round(analyticsData.reduce((sum, item) => sum + item.views, 0) / analyticsData.length)
                          : 0}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1">Last 7 tracking days</p>
                    </div>
                  </div>

                  {/* Growth Rate Card */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Growth Rate</span>
                      <ArrowUpRight size={16} className="text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black text-emerald-400">
                        {(() => {
                          const initial = analyticsData[0]?.views || 0;
                          const latest = analyticsData[analyticsData.length - 1]?.views || 0;
                          const diff = latest - initial;
                          const rate = initial > 0 ? Math.round((diff / initial) * 100) : 0;
                          return `${rate >= 0 ? "+" : ""}${rate}%`;
                        })()}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1">First vs. last logged day</p>
                    </div>
                  </div>
                </div>

                {/* Main Chart Card */}
                <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-5 sm:p-6 space-y-4 relative overflow-hidden">
                  {/* Subtle Background Glows */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-brand-purple/5 rounded-full filter blur-[80px] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-blue/5 rounded-full filter blur-[80px] pointer-events-none" />

                  {/* Chart Title and Toggles */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10 border-b border-white/5 pb-4">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-100 flex items-center gap-1.5">
                        <TrendingUp size={16} className="text-brand-blue" />
                        <span>Organic Traffic Trend</span>
                      </h4>
                      <p className="text-slate-400 text-xs mt-0.5">Historical growth timeline for the last 7 days</p>
                    </div>

                    {/* Chart Type Toggles */}
                    <div className="flex bg-slate-900 border border-white/10 rounded-xl p-1 self-start sm:self-center">
                      <button
                        onClick={() => setChartType("cumulative")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          chartType === "cumulative"
                            ? "bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Total Views
                      </button>
                      <button
                        onClick={() => setChartType("daily")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          chartType === "daily"
                            ? "bg-gradient-to-r from-brand-blue to-brand-pink text-white shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Daily Active
                      </button>
                    </div>
                  </div>

                  {/* Chart Frame */}
                  <div className="h-[280px] w-full relative z-10 flex items-center justify-center">
                    {loadingAnalytics ? (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-8 h-8 rounded-full border-4 border-slate-700 border-t-brand-purple animate-spin" />
                        <p className="text-slate-400 text-xs font-semibold">Retrieving popularity dataset...</p>
                      </div>
                    ) : analyticsData.length === 0 ? (
                      <div className="text-center text-slate-500">
                        <p className="text-sm font-semibold">No data points recorded yet</p>
                        <p className="text-xs mt-1">Your traffic counts will populate as people visit!</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={analyticsData}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop 
                                offset="5%" 
                                stopColor={chartType === "cumulative" ? "#8B5CF6" : "#06B6D4"} 
                                stopOpacity={0.25} 
                              />
                              <stop 
                                offset="95%" 
                                stopColor={chartType === "cumulative" ? "#3B82F6" : "#EC4899"} 
                                stopOpacity={0} 
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="rgba(255,255,255,0.03)" 
                            vertical={false} 
                          />
                          <XAxis 
                            dataKey="label" 
                            stroke="#64748b" 
                            fontSize={10} 
                            fontWeight={600}
                            tickLine={false} 
                            axisLine={false}
                            dy={10}
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={10} 
                            fontWeight={600}
                            tickLine={false} 
                            axisLine={false}
                            dx={-5}
                            allowDecimals={false}
                          />
                          <Tooltip 
                            content={<CustomTooltip />}
                            cursor={{ stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: 1 }}
                          />
                          <Area
                            type="monotone"
                            dataKey={chartType === "cumulative" ? "cumulative" : "views"}
                            name={chartType === "cumulative" ? "Total Portfolio Views" : "Daily Visits"}
                            stroke={chartType === "cumulative" ? "#a855f7" : "#06b6d4"}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#chartGradient)"
                            dot={{ stroke: chartType === "cumulative" ? "#c084fc" : "#22d3ee", strokeWidth: 2, r: 4, fill: "#0f172a" }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: chartType === "cumulative" ? "#a855f7" : "#06b6d4" }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-950/60 border-t border-white/5 p-4 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Info size={12} className="text-slate-500" />
                  <span>Interactive chart: Hover dots to view detailed data points</span>
                </span>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-white/5 hover:text-white transition-all font-semibold cursor-pointer text-xs"
                >
                  Close Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Printable/Downloadable Resume Preview Modal */}
      <AnimatePresence>
        {isAdmin && showResumeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto no-print">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/95 text-slate-100 flex flex-col h-[90vh] my-4"
              id="printable-resume-modal"
            >
              {/* Modal Toolbar Header */}
              <div className="bg-slate-950 border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4 no-print">
                <div className="flex items-center space-x-2.5">
                  <FileText className="text-brand-purple animate-pulse" size={20} />
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Printable Resume Engine</h3>
                    <p className="text-[10px] text-slate-400">Select a recruiter-preferred format below</p>
                  </div>
                </div>

                {/* Resume Style Format Selector */}
                <div className="flex bg-slate-900 border border-white/10 rounded-xl p-1 gap-1 items-center">
                  {(["classic-ats", "modern-sidebar", "tech-chic"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setResumeFormat(fmt)}
                      className={`px-3 py-1.5 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        resumeFormat === fmt
                          ? "bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-md shadow-brand-purple/25"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                      }`}
                    >
                      {fmt === "classic-ats" ? "Classic ATS" : fmt === "modern-sidebar" ? "Modern Sidebar" : "Tech Chic ✨"}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      window.print();
                      showToast("Print command triggered. Choose 'Save as PDF' to export.", "success");
                    }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-blue hover:to-brand-pink text-white px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-purple-500/10"
                    id="trigger-print-btn"
                  >
                    <Printer size={14} />
                    <span>Print / Save as PDF</span>
                  </button>

                  <button
                    onClick={() => setShowResumeModal(false)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/5"
                    title="Close Preview"
                    id="close-resume-modal-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Tips Banner */}
              <div className="bg-brand-purple/10 border-b border-brand-purple/20 px-6 py-2 flex items-center justify-between text-[11px] text-brand-purple font-medium no-print">
                <span className="flex items-center gap-2">
                  <Info size={12} className="text-brand-pink animate-pulse" />
                  <span><strong>Tip:</strong> In your browser's Print prompt, enable <strong>Background graphics</strong> to preserve list markers, and set <strong>Margins</strong> to 'Default' or 'Minimum'.</span>
                </span>
              </div>

              {/* Modal Body (Scrollable resume viewport) */}
              <div className="flex-grow overflow-y-auto bg-slate-950/40 p-4 sm:p-8 flex justify-center items-start no-print">
                {/* On-screen paper sheet mockup */}
                <div 
                  id="screen-resume-preview" 
                  className="w-full max-w-[812px] bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200/50 min-h-[1050px] font-sans text-xs sm:text-sm leading-relaxed"
                >
                  {renderResumeContent()}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-950/80 border-t border-white/10 p-4 flex items-center justify-between text-[11px] text-slate-500 no-print">
                <span>Resume auto-synced with live profile details</span>
                <span className="font-mono text-[10px] uppercase">Format: US Letter / A4 Chronological</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Print Container (Directly targets print-media page size) */}
      {isAdmin && (
        <div id="printable-resume-container" className="hidden">
          {renderResumeContent()}
        </div>
      )}

      {/* Floating Export PDF Resume Button (Accessible only to admins when logged in) */}
      {isAdmin && !showResumeModal && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => setShowResumeModal(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-blue hover:to-brand-pink text-white px-4 py-3 rounded-full shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 transition-all cursor-pointer font-extrabold text-xs sm:text-sm tracking-wide border border-white/10 no-print"
          title="Download PDF Resume"
          id="export-pdf-floating-btn"
        >
          <FileText size={16} className="animate-pulse" />
          <span>PDF Resume</span>
        </motion.button>
      )}

      {/* Print Stylesheet Injection */}
      <style>{`
        #printable-resume-container {
          display: none;
        }
        @media print {
          /* Force page background to white and hide unnecessary tags */
          html, body {
            background-color: #ffffff !important;
            background-image: none !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide everything except the print container */
          #root,
          .no-print,
          #printable-resume-modal,
          #screen-resume-preview,
          #export-pdf-floating-btn,
          header,
          footer,
          nav,
          button,
          .fixed,
          .absolute {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
            visibility: hidden !important;
          }
          /* Make the print container absolutely visible at the page top */
          #printable-resume-container {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            padding: 0.25in !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Ensure layout remains 2-column in Modern Sidebar during print */
          #modern-sidebar-grid {
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
            gap: 1.5rem !important;
          }
          #modern-sidebar-left {
            grid-column: span 4 / span 4 !important;
            background-color: #f8fafc !important;
            padding: 1.25rem !important;
            border-radius: 1rem !important;
            border: 1px solid #e2e8f0 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 1.5rem !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #modern-sidebar-right {
            grid-column: span 8 / span 8 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 1.5rem !important;
          }
          .resume-body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-link {
            text-decoration: underline !important;
          }
          @page {
            size: letter;
            margin: 0.5in;
          }
        }
      `}</style>

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
