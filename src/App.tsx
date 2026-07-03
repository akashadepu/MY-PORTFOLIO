import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, CheckCircle, Info, RefreshCw } from "lucide-react";

// Types
import { 
  Profile, 
  Skill, 
  Project, 
  Certification, 
  Activity, 
  PortfolioSettings, 
  AdminCredentials,
  CustomSection,
  ContactMessage
} from "./types";

// Firebase/Local CRUD service
import {
  isDemoMode,
  getProfile,
  saveProfile,
  getSkills,
  saveSkill,
  deleteSkill,
  getProjects,
  saveProject,
  deleteProject,
  getCertifications,
  saveCertification,
  deleteCertification,
  getActivities,
  saveActivity,
  deleteActivity,
  getSettings,
  saveSettings,
  getAdminCredentials,
  saveAdminCredentials,
  getCustomSections,
  saveCustomSection,
  deleteCustomSection,
  getPageViewCount,
  incrementPageViewCount,
  getMessages,
  markMessageRead,
  deleteMessage
} from "./firebase";

// Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Certifications from "./components/Certifications";
import Activities from "./components/Activities";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AdminPanel from "./components/AdminPanel";
import SectionDivider from "./components/SectionDivider";
import CustomSectionView from "./components/CustomSectionView";
import SEO from "./components/SEO";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("is_admin_logged_in") === "true";
  });

  // Scroll to top instantly on section transition to ensure clean page swap
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [activeSection]);

  // Global Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Core Data States
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [adminCreds, setAdminCreds] = useState<AdminCredentials | null>(null);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [pageViews, setPageViews] = useState(0);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Helper to show a toast message
  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  // Dismiss Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load All Portfolio Data
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [prof, sks, projs, certs, acts, setts, creds, secs] = await Promise.all([
          getProfile(),
          getSkills(),
          getProjects(),
          getCertifications(),
          getActivities(),
          getSettings(),
          getAdminCredentials(),
          getCustomSections()
        ]);

        setProfile(prof);
        // sort skills for best layout
        setSkills(sks);
        setProjects(projs);
        setCertifications(certs);
        setActivities(acts);
        setSettings(setts);
        setAdminCreds(creds);
        setCustomSections(secs);

        try {
          await incrementPageViewCount();
          const count = await getPageViewCount();
          setPageViews(count);
        } catch (viewsErr) {
          console.error("Error updating page views:", viewsErr);
        }
      } catch (err) {
        console.error("Error fetching portfolio database:", err);
        showToast("Error loading profile database. Check console.", "error");
      } finally {
        // Slow down loading slightly to showcase AA animation
        setTimeout(() => {
          setLoading(false);
        }, 1800);
      }
    };

    loadAllData();
  }, []);

  // Sync messages in background for unread navbar badges when admin is logged in
  const fetchMessages = async () => {
    try {
      const msgs = await getMessages();
      setMessages(msgs);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 30000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [isAdmin]);

  const handleMarkMessageRead = async (id: string, read: boolean) => {
    try {
      await markMessageRead(id, read);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read } : m));
    } catch (err) {
      console.error("Error marking message read:", err);
      showToast("Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Error deleting message:", err);
      showToast("Firebase sync failed (check rules/permissions).", "error");
    }
  };



  // --- ADMIN ACTIONS CALLER ---

  const handleAdminLogin = async (credentials: AdminCredentials): Promise<boolean> => {
    if (!adminCreds) return false;
    if (
      credentials.username === adminCreds.username &&
      credentials.password === adminCreds.password
    ) {
      setIsAdmin(true);
      localStorage.setItem("is_admin_logged_in", "true");
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("is_admin_logged_in");
    showToast("Logged out from Admin Mode", "info");
  };

  const handleUpdateAdminCredentials = async (
    currentPass: string,
    newCreds: AdminCredentials
  ): Promise<boolean> => {
    if (!adminCreds) return false;
    if (currentPass !== adminCreds.password) {
      return false;
    }

    setAdminCreds(newCreds);
    await saveAdminCredentials(newCreds);
    return true;
  };

  const handleUpdateProfile = async (updated: Profile) => {
    setProfile(updated);
    try {
      await saveProfile(updated);
    } catch (err) {
      console.error(err);
      showToast("Offline update saved. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleAddSkill = async (newSkill: Skill) => {
    const updated = [...skills, newSkill];
    setSkills(updated);
    try {
      await saveSkill(newSkill);
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleUpdateSkill = async (updatedSkill: Skill) => {
    const updated = skills.map(s => s.id === updatedSkill.id ? updatedSkill : s);
    setSkills(updated);
    try {
      await saveSkill(updatedSkill);
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleDeleteSkill = async (id: string) => {
    const updated = skills.filter(s => s.id !== id);
    setSkills(updated);
    try {
      await deleteSkill(id);
    } catch (err) {
      console.error(err);
      showToast("Deleted locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleAddProject = async (newProj: Project) => {
    const updated = [...projects, newProj];
    setProjects(updated);
    try {
      await saveProject(newProj);
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleUpdateProject = async (updatedProj: Project) => {
    const updated = projects.map(p => p.id === updatedProj.id ? updatedProj : p);
    setProjects(updated);
    try {
      await saveProject(updatedProj);
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleDeleteProject = async (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    try {
      await deleteProject(id);
    } catch (err) {
      console.error(err);
      showToast("Deleted locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleAddCertification = async (newCert: Certification) => {
    const updated = [...certifications, newCert];
    setCertifications(updated);
    try {
      await saveCertification(newCert);
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleUpdateCertification = async (updatedCert: Certification) => {
    const updated = certifications.map(c => c.id === updatedCert.id ? updatedCert : c);
    setCertifications(updated);
    try {
      await saveCertification(updatedCert);
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleDeleteCertification = async (id: string) => {
    const updated = certifications.filter(c => c.id !== id);
    setCertifications(updated);
    try {
      await deleteCertification(id);
    } catch (err) {
      console.error(err);
      showToast("Deleted locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleAddActivity = async (newAct: Activity) => {
    const updated = [...activities, newAct];
    setActivities(updated);
    try {
      await saveActivity(newAct);
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleUpdateActivity = async (updatedAct: Activity) => {
    const updated = activities.map(a => a.id === updatedAct.id ? updatedAct : a);
    setActivities(updated);
    try {
      await saveActivity(updatedAct);
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleDeleteActivity = async (id: string) => {
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    try {
      await deleteActivity(id);
    } catch (err) {
      console.error(err);
      showToast("Deleted locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleUpdateFooter = async (text: string, copyright: string) => {
    if (!settings) return;
    const updated = {
      ...settings,
      footerText: text,
      copyrightText: copyright
    };
    setSettings(updated);
    try {
      await saveSettings(updated);
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleUpdateSocialLinks = async (links: any) => {
    if (!settings) return;
    const updated = {
      ...settings,
      socialLinks: links
    };
    setSettings(updated);
    try {
      await saveSettings(updated);
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleAddCustomSection = async (newSec: CustomSection) => {
    const updated = [...customSections, newSec];
    setCustomSections(updated);
    try {
      await saveCustomSection(newSec);
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleUpdateCustomSection = async (updatedSec: CustomSection) => {
    const updated = customSections.map(s => s.id === updatedSec.id ? updatedSec : s);
    setCustomSections(updated);
    try {
      await saveCustomSection(updatedSec);
    } catch (err) {
      console.error(err);
      showToast("Saved locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  const handleDeleteCustomSection = async (id: string) => {
    const updated = customSections.filter(s => s.id !== id);
    setCustomSections(updated);
    try {
      await deleteCustomSection(id);
    } catch (err) {
      console.error(err);
      showToast("Deleted locally. Firebase sync failed (check rules/permissions).", "error");
    }
  };

  // 1. Initial Animated Logo Loading Screen
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#06030a] flex flex-col items-center justify-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.1, 1], opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-purple via-brand-blue to-brand-pink flex items-center justify-center font-black text-white text-3xl shadow-2xl shadow-purple-500/25 border border-white/5"
        >
          AA
        </motion.div>
        
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold tracking-widest text-white uppercase">
            AKASH ADEPU
          </h2>
          <span className="text-xs text-slate-400 font-medium tracking-wider mt-1.5 uppercase">
            Personal Portfolio Suite
          </span>
        </div>

        {/* Dynamic Loading Dot Bar */}
        <div className="flex space-x-1.5 pt-4">
          <div className="w-2 h-2 rounded-full bg-brand-purple animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-brand-blue animate-bounce delay-150" />
          <div className="w-2 h-2 rounded-full bg-brand-pink animate-bounce delay-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0510] text-slate-100 selection:bg-brand-purple/30 selection:text-white">
      {/* Declarative Dynamic SEO Title & Metadata Provider */}
      <SEO section={activeSection} profile={profile} customSections={customSections} />

      {/* Background ambient glowing spheres */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600 rounded-full blur-[130px] opacity-25" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600 rounded-full blur-[130px] opacity-25" />
        <div className="absolute top-[30%] right-[5%] w-[450px] h-[450px] bg-pink-600 rounded-full blur-[120px] opacity-20" />
        <div className="absolute top-[65%] left-[5%] w-[450px] h-[450px] bg-purple-700 rounded-full blur-[125px] opacity-20" />
      </div>

      {/* Dynamic Header */}
      <Navbar 
        isAdmin={isAdmin} 
        onLogout={handleAdminLogout} 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        customSections={customSections}
        unreadMessagesCount={messages.filter(m => !m.read).length}
      />

      {/* Main sections wrapper */}
      <main className={`relative pb-12 min-h-[calc(100vh-220px)] flex flex-col justify-start transition-all duration-300 ${
        isAdmin ? "pt-[136px]" : "pt-24"
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="w-full flex-grow flex flex-col justify-start"
          >
            {activeSection === "home" && profile && (
              <Hero
                profile={profile}
                isAdmin={isAdmin}
                onUpdateProfile={handleUpdateProfile}
                showToast={showToast}
                onNavigate={setActiveSection}
              />
            )}
            
            {activeSection === "about" && (
              <About 
                isAdmin={isAdmin} 
                showToast={showToast} 
              />
            )}

            {activeSection === "skills" && (
              <Skills
                skills={skills}
                isAdmin={isAdmin}
                onAddSkill={handleAddSkill}
                onUpdateSkill={handleUpdateSkill}
                onDeleteSkill={handleDeleteSkill}
                showToast={showToast}
              />
            )}

            {activeSection === "projects" && (
              <Projects
                projects={projects}
                isAdmin={isAdmin}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                showToast={showToast}
              />
            )}

            {activeSection === "certifications" && (
              <Certifications
                certifications={certifications}
                isAdmin={isAdmin}
                onAddCertification={handleAddCertification}
                onUpdateCertification={handleUpdateCertification}
                onDeleteCertification={handleDeleteCertification}
                showToast={showToast}
              />
            )}

            {activeSection === "activities" && (
              <Activities
                activities={activities}
                isAdmin={isAdmin}
                onAddActivity={handleAddActivity}
                onUpdateActivity={handleUpdateActivity}
                onDeleteActivity={handleDeleteActivity}
                showToast={showToast}
              />
            )}

            {customSections
              .filter(sec => sec.isActive && sec.id === activeSection)
              .map(sec => (
                <CustomSectionView key={sec.id} section={sec} />
              ))
            }

            {activeSection === "contact" && settings && (
              <Contact
                socialLinks={settings.socialLinks}
                isAdmin={isAdmin}
                onUpdateSocialLinks={handleUpdateSocialLinks}
                showToast={showToast}
                messages={messages}
                onMarkMessageRead={handleMarkMessageRead}
                onDeleteMessage={handleDeleteMessage}
                fetchMessages={fetchMessages}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      {settings && (
        <Footer
          footerText={settings.footerText}
          copyrightText={settings.copyrightText}
          socialLinks={settings.socialLinks}
          isAdmin={isAdmin}
          onUpdateFooter={handleUpdateFooter}
          showToast={showToast}
          onNavigate={setActiveSection}
        />
      )}

      {/* SYSTEM ADMIN MODALS & OVERLAYS */}
      <AdminPanel
        isAdmin={isAdmin}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        onUpdateCredentials={handleUpdateAdminCredentials}
        isDemoMode={isDemoMode}
        showToast={showToast}
        sections={customSections}
        onAddSection={handleAddCustomSection}
        onUpdateSection={handleUpdateCustomSection}
        onDeleteSection={handleDeleteCustomSection}
        pageViews={pageViews}
        profile={profile}
        skills={skills}
        projects={projects}
        certifications={certifications}
        activities={activities}
        settings={settings}
      />

      {/* Global Animated Toast Notification Panel */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-50 flex items-center space-x-3 px-5 py-3.5 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-xl"
          >
            {toast.type === "success" && (
              <CheckCircle size={18} className="text-emerald-400" />
            )}
            {toast.type === "error" && (
              <AlertCircle size={18} className="text-red-400" />
            )}
            {toast.type === "info" && (
              <Info size={18} className="text-brand-blue" />
            )}
            <span className="text-sm font-semibold text-slate-100">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
