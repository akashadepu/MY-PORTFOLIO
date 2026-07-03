import { useState, useEffect } from "react";
import { Menu, X, Shield, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CustomSection } from "../types";

interface NavbarProps {
  isAdmin: boolean;
  onLogout: () => void;
  activeSection: string;
  onSectionChange: (id: string) => void;
  customSections?: CustomSection[];
  unreadMessagesCount?: number;
}

export default function Navbar({ 
  isAdmin, 
  onLogout, 
  activeSection, 
  onSectionChange, 
  customSections = [],
  unreadMessagesCount = 0 
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const baseItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "certifications", label: "Certifications" },
    { id: "activities", label: "Activities" },
  ];

  const customNavItems = customSections
    .filter(sec => sec.isActive)
    .map(sec => ({ id: sec.id, label: sec.title }));

  const navItems = [
    ...baseItems,
    ...customNavItems,
    { id: "contact", label: "Contact" },
  ];

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    onSectionChange(id);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <nav
      id="navbar"
      className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
        isAdmin ? "top-[41px]" : "top-0"
      } ${
        scrolled ? "glass-nav py-3 shadow-lg" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div 
            onClick={() => scrollToSection("home")}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple via-brand-blue to-brand-pink flex items-center justify-center font-bold text-white text-lg shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              AA
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:text-brand-pink transition-colors">
                AKASH ADEPU
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider">
                PORTFOLIO
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative px-3 py-2 text-sm font-medium tracking-wide transition-colors flex items-center gap-1 ${
                  activeSection === item.id 
                    ? "text-brand-pink font-semibold" 
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {item.id === "contact" && isAdmin && unreadMessagesCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white animate-pulse shadow-md shadow-rose-500/35">
                    {unreadMessagesCount}
                  </span>
                )}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeUnderline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}

            {/* Admin Badge & Logout */}
            {isAdmin ? (
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-slate-800">
                <span className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse shadow-sm shadow-emerald-500/5">
                  <Shield size={12} />
                  <span>ADMIN</span>
                </span>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                  title="Logout Admin"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open_admin_login"))}
                className="flex items-center space-x-1.5 ml-4 pl-4 border-l border-slate-800 text-slate-400 hover:text-brand-pink transition-colors text-xs font-semibold cursor-pointer"
                title="Admin Login"
              >
                <Shield size={12} />
                <span className="hidden lg:inline">Admin Login</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {isAdmin && (
              <span className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                ADMIN
              </span>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/50 border border-slate-800/50 transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden glass-nav mt-2 border-t border-slate-800/40 bg-[#0b0f19]/95 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-base font-medium transition-all flex items-center justify-between ${
                    activeSection === item.id
                      ? "text-white bg-gradient-to-r from-brand-purple/20 to-brand-pink/20 border-l-4 border-brand-pink"
                      : "text-slate-300 hover:text-white hover:bg-slate-900/30"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === "contact" && isAdmin && unreadMessagesCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-black text-white animate-pulse shadow-md">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              ))}

              {isAdmin ? (
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between px-4">
                  <span className="text-sm text-emerald-400 font-semibold flex items-center gap-1">
                    <Shield size={14} /> Admin Active
                  </span>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onLogout();
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-semibold cursor-pointer"
                  >
                    <LogOut size={12} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t border-slate-800 px-4">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.dispatchEvent(new CustomEvent("open_admin_login"));
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-sm font-semibold transition-all cursor-pointer"
                  >
                    <Shield size={14} className="text-brand-purple" />
                    <span>Admin Dashboard Login</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
