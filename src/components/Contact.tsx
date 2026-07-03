import { useState, useEffect, FormEvent } from "react";
import { Mail, Instagram, Linkedin, Github, Phone, Send, Trash2, Check, Eye, EyeOff, Shield, Edit3, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ContactMessage, SocialLinks } from "../types";
import { addMessage, markMessageRead, deleteMessage, getMessages } from "../firebase";

interface ContactProps {
  socialLinks: SocialLinks;
  isAdmin: boolean;
  onUpdateSocialLinks: (links: SocialLinks) => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  messages: ContactMessage[];
  onMarkMessageRead: (id: string, read: boolean) => Promise<void>;
  onDeleteMessage: (id: string) => Promise<void>;
  fetchMessages: () => Promise<void>;
}

export default function Contact({
  socialLinks,
  isAdmin,
  onUpdateSocialLinks,
  showToast,
  messages,
  onMarkMessageRead,
  onDeleteMessage,
  fetchMessages
}: ContactProps) {
  // Contact Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Admin Panel states
  const [showSocialEdit, setShowSocialEdit] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [deleteMsgConfirmId, setDeleteMsgConfirmId] = useState<string | null>(null);
  
  // Local edit states
  const [editInsta, setEditInsta] = useState(socialLinks.instagram);
  const [editIn, setEditIn] = useState(socialLinks.linkedin);
  const [editGit, setEditGit] = useState(socialLinks.github);
  const [editEmail, setEditEmail] = useState(socialLinks.email);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSending(true);
    const newMessage: ContactMessage = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
      date: new Date().toLocaleString(),
      read: false
    };

    try {
      await addMessage(newMessage);
      showToast("Message sent successfully!", "success");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      // Refresh list if admin is viewing
      if (isAdmin) fetchMessages();
    } catch (err) {
      console.error(err);
      showToast("Failed to send message.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleUpdateSocials = (e: FormEvent) => {
    e.preventDefault();
    onUpdateSocialLinks({
      instagram: editInsta.trim(),
      linkedin: editIn.trim(),
      github: editGit.trim(),
      email: editEmail.trim()
    });
    setShowSocialEdit(false);
    showToast("Social links updated!", "success");
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      await onMarkMessageRead(id, !currentRead);
      showToast(`Message marked as ${!currentRead ? "read" : "unread"}`, "info");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (deleteMsgConfirmId === id) {
      try {
        await onDeleteMessage(id);
        showToast("Message deleted successfully", "success");
      } catch (err) {
        console.error(err);
        showToast("Error deleting message", "error");
      }
      setDeleteMsgConfirmId(null);
    } else {
      setDeleteMsgConfirmId(id);
      showToast("Click again on Delete to confirm deleting this message", "info");
      setTimeout(() => {
        setDeleteMsgConfirmId(current => current === id ? null : current);
      }, 4000);
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-slate-950/20">
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
              Get In Touch
            </h2>
          </div>
          <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
            Contact & <span className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink bg-clip-text text-transparent italic">Feedback Inbox</span>
          </h3>
          <div className="h-1.5 w-16 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Admin inbox toggle */}
        {isAdmin && (
          <div className="flex justify-center mb-10 gap-4">
            <button
              onClick={() => {
                fetchMessages();
                setShowInbox(!showInbox);
              }}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all shadow-md cursor-pointer"
            >
              <Mail size={16} />
              <span>{showInbox ? "Hide Received Messages" : "Open Inbox Panel"}</span>
              {unreadCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setEditInsta(socialLinks.instagram);
                setEditIn(socialLinks.linkedin);
                setEditGit(socialLinks.github);
                setEditEmail(socialLinks.email);
                setShowSocialEdit(true);
              }}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 transition-all cursor-pointer"
            >
              <Edit3 size={16} />
              <span>Edit Social Handles</span>
            </button>
          </div>
        )}

        {/* Inbox panel view */}
        <AnimatePresence>
          {isAdmin && showInbox && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mb-12 glass-card rounded-2xl p-6 border border-emerald-500/20 max-h-[500px] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Shield className="text-emerald-400" size={18} />
                  <h4 className="font-extrabold text-slate-100 text-lg">Received Messages ({messages.length})</h4>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
                  {unreadCount} Unread
                </span>
              </div>

              {messages.length === 0 ? (
                <p className="text-center py-8 text-slate-500 text-sm">No messages received yet.</p>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`p-4 rounded-xl border transition-colors ${
                        msg.read 
                          ? "bg-slate-900/25 border-slate-800/80" 
                          : "bg-gradient-to-r from-emerald-500/5 to-transparent border-emerald-500/20"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-200">{msg.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 border border-white/5 rounded">
                              {msg.date}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-3">
                            <span className="font-semibold text-brand-blue">Email: {msg.email}</span>
                            {msg.phone && <span className="text-slate-500">Phone: {msg.phone}</span>}
                          </div>
                        </div>

                        {/* Message actions */}
                        <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => handleToggleRead(msg.id, msg.read)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              msg.read 
                                ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white" 
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            }`}
                            title={msg.read ? "Mark Unread" : "Mark Read"}
                          >
                            {msg.read ? <EyeOff size={14} /> : <Check size={14} />}
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              deleteMsgConfirmId === msg.id 
                                ? "bg-red-500 border-red-400 text-white animate-pulse scale-110" 
                                : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                            }`}
                            title={deleteMsgConfirmId === msg.id ? "Click again to confirm delete" : "Delete Message"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Msg Subject & body */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/40">
                        <p className="text-xs font-bold text-slate-300">Subject: {msg.subject}</p>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form and Social details layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Social Links */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 space-y-8 flex flex-col justify-center"
          >
            <div className="space-y-4">
              <h4 className="text-xl sm:text-2xl font-extrabold text-slate-100">
                Let's build something <span className="text-gradient-purple-pink">amazing together!</span>
              </h4>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Whether you have an interesting project idea, a job opportunity, or just want to connect, feel free to drop a message or reach out on social channels!
              </p>
            </div>

            {/* Structured Social list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LinkedIn */}
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 rounded-xl flex items-center space-x-3.5 hover:scale-[1.03] transition-all border-l-4 border-l-[#0077b5] group"
              >
                <div className="p-2.5 bg-slate-900 border border-white/5 rounded-lg group-hover:bg-[#0077b5]/10 group-hover:text-[#0077b5] transition-colors">
                  <Linkedin size={20} />
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LinkedIn</h5>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate max-w-[130px]">Connect with me</p>
                </div>
              </a>

              {/* GitHub */}
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 rounded-xl flex items-center space-x-3.5 hover:scale-[1.03] transition-all border-l-4 border-l-white group"
              >
                <div className="p-2.5 bg-slate-900 border border-white/5 rounded-lg group-hover:bg-white/10 group-hover:text-white transition-colors">
                  <Github size={20} />
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GitHub</h5>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate max-w-[130px]">View code</p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 rounded-xl flex items-center space-x-3.5 hover:scale-[1.03] transition-all border-l-4 border-l-[#e1306c] group"
              >
                <div className="p-2.5 bg-slate-900 border border-white/5 rounded-lg group-hover:bg-[#e1306c]/10 group-hover:text-[#e1306c] transition-colors">
                  <Instagram size={20} />
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instagram</h5>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate max-w-[130px]">Follow me</p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${socialLinks.email}`}
                className="glass-card p-4 rounded-xl flex items-center space-x-3.5 hover:scale-[1.03] transition-all border-l-4 border-l-brand-pink group"
              >
                <div className="p-2.5 bg-slate-900 border border-white/5 rounded-lg group-hover:bg-brand-pink/10 group-hover:text-brand-pink transition-colors">
                  <Mail size={20} />
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</h5>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate max-w-[130px]">Send an email</p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Contact form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/5 relative">
              <h4 className="text-lg sm:text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Send size={18} className="text-brand-pink" />
                <span>Drop Me A Line</span>
              </h4>

              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Message Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink hover:opacity-95 transition-opacity shadow-lg cursor-pointer"
                >
                  <Send size={15} className={sending ? "animate-bounce" : ""} />
                  <span>{sending ? "Sending..." : "Send Secure Message"}</span>
                </button>
              </form>
            </div>
          </motion.div>

        </div>

      </div>

      {/* Social Edit Modal */}
      <AnimatePresence>
        {isAdmin && showSocialEdit && (
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
                  <h3 className="font-bold">Edit Professional Handles</h3>
                </div>
                <button
                  onClick={() => setShowSocialEdit(false)}
                  className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateSocials} className="p-6 space-y-4 text-slate-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    LinkedIn Link
                  </label>
                  <input
                    type="url"
                    value={editIn}
                    onChange={(e) => setEditIn(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    GitHub Profile Link
                  </label>
                  <input
                    type="url"
                    value={editGit}
                    onChange={(e) => setEditGit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Instagram Handle Link
                  </label>
                  <input
                    type="url"
                    value={editInsta}
                    onChange={(e) => setEditInsta(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Primary Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setShowSocialEdit(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                  >
                    Save Handles
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
