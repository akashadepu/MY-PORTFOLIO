import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, 
         getDoc, getDocs, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, 
         getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { 
  Profile, 
  Project, 
  Certification, 
  Activity, 
  Skill, 
  ContactMessage, 
  PortfolioSettings, 
  AdminCredentials,
  CustomSection
} from "./types";

// Firebase Config Placeholder (User will replace this with real credentials)
const firebaseConfig = {
  apiKey: "AIzaSyDo1VG9StcoZb6BwOMdbdah5sS3Vzbz1Wg",
  authDomain: "akash-portfolio-7a05d.firebaseapp.com",
  projectId: "akash-portfolio-7a05d",
  storageBucket: "akash-portfolio-7a05d.firebasestorage.app",
  messagingSenderId: "299630425339",
  appId: "1:299630425339:web:df350393fca8a2c8026c5e"
};

// Check if credentials are placeholders
export const isDemoMode = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey === "REPLACE_WITH_YOUR_API_KEY" || 
  firebaseConfig.apiKey.trim() === "";

let app: any;
let db: any;
let storage: any;

if (!isDemoMode) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebase initialized successfully in production mode.");
  } catch (error) {
    console.error("Firebase initialization failed, falling back to Demo Mode:", error);
  }
} else {
  console.log("Running in LocalStorage Demo Mode. Replace firebaseConfig keys with real values to sync to Firestore.");
}

// Default Seed Data
const DEFAULT_PROFILE: Profile = {
  name: "AKASH ADEPU",
  title: "Aspiring Software Developer",
  college: "St. Peter's Engineering College, Hyderabad",
  bio: "A highly motivated and passionate aspiring software developer with expertise in building responsive web applications. I love solving complex algorithms, designing beautiful interfaces, and developing full-stack web applications with modern technologies like React, Node.js, and databases.",
  profilePhotoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&h=600&q=80",
  gradientFrom: "#8B5CF6", // purple
  gradientTo: "#EC4899",   // pink
  greetingText: "Hi, I'm"
};

const DEFAULT_SKILLS: Skill[] = [
  { id: "1", name: "HTML", percentage: 90, category: "Languages" },
  { id: "2", name: "CSS", percentage: 85, category: "Frontend" },
  { id: "3", name: "JavaScript", percentage: 80, category: "Frontend" },
  { id: "4", name: "React", percentage: 75, category: "Frontend" },
  { id: "5", name: "Node.js", percentage: 70, category: "Backend" },
  { id: "6", name: "Express.js", percentage: 70, category: "Backend" },
  { id: "7", name: "MongoDB", percentage: 70, category: "Database" },
  { id: "8", name: "Python", percentage: 65, category: "Languages" },
  { id: "9", name: "Git", percentage: 85, category: "Tools" },
  { id: "10", name: "GitHub", percentage: 85, category: "Tools" }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Event Management System",
    description: "Full stack event management web app with ticket booking, QR check-in, payment integration and analytics dashboard.",
    tech: ["React", "Node.js", "Express.js", "MongoDB"],
    githubLink: "https://github.com/akashadepu/event-management-system",
    demoLink: "https://event-manager-demo.example.com",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&h=450&q=80"
  },
  {
    id: "2",
    title: "Algorithmic Trading Bot",
    description: "A python-based trading helper that evaluates moving average crossovers to signal potential buy and sell entry points.",
    tech: ["Python", "Pandas", "Matplotlib"],
    githubLink: "https://github.com/akashadepu/trading-bot",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&h=450&q=80"
  }
];

const DEFAULT_CERTIFICATIONS: Certification[] = [
  {
    id: "1",
    title: "Google Cloud Digital Leader",
    org: "Google Cloud",
    date: "Jan 2025",
    description: "Demonstrates fundamental understanding of cloud computing services and how Google Cloud products enable business transformation.",
    imageUrl: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=800&h=450&q=80"
  },
  {
    id: "2",
    title: "Full-Stack Web Development Course",
    org: "Udemy",
    date: "Sep 2024",
    description: "Mastery of HTML, CSS, JavaScript, Node, React, MongoDB, and deployment strategies.",
    imageUrl: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=800&h=450&q=80"
  }
];

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: "1",
    title: "Technical Lead",
    org: "St. Peter's Coding Club",
    date: "2024 - Present",
    description: "Responsible for organizing coding hackathons, leading a group of 30+ students, and organizing weekly JavaScript bootcamps.",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&h=450&q=80",
    roleBadge: "Leadership"
  },
  {
    id: "2",
    title: "Smart India Hackathon Participant",
    org: "MHRD Innovation Cell",
    date: "Dec 2024",
    description: "Developed a prototype for waste management tracking using dynamic IoT maps and React dashboards.",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&h=450&q=80",
    roleBadge: "Technical Innovation"
  }
];

const DEFAULT_SETTINGS: PortfolioSettings = {
  footerText: "Made with ❤️ by Akash Adepu",
  copyrightText: "© 2025 Akash Adepu. All Rights Reserved.",
  socialLinks: {
    instagram: "https://instagram.com/akash_adepu",
    linkedin: "https://linkedin.com/in/akash-adepu",
    github: "https://github.com/akashadepu",
    email: "adepuakash1@gmail.com"
  }
};

const DEFAULT_ADMIN: AdminCredentials = {
  username: "akash",
  password: "akash@2025"
};

// helper local storage initializers
const getLocal = <T>(key: string, fallback: T): T => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(item);
  } catch {
    return fallback;
  }
};

const setLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- DATA ACCESS LAYER ---

// 1. Profile
export async function getProfile(): Promise<Profile> {
  if (isDemoMode) {
    return getLocal<Profile>("portfolio_profile", DEFAULT_PROFILE);
  }
  try {
    const docRef = doc(db, "profile", "main");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Profile;
    } else {
      // Seed initial
      await setDoc(docRef, DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
  } catch (err) {
    console.error("Firebase error reading profile, returning fallback:", err);
    return getLocal<Profile>("portfolio_profile", DEFAULT_PROFILE);
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  setLocal("portfolio_profile", profile);
  if (!isDemoMode) {
    try {
      await setDoc(doc(db, "profile", "main"), profile);
    } catch (err) {
      console.error("Firebase saveProfile error:", err);
      throw err;
    }
  }
}

// 2. Projects
export async function getProjects(): Promise<Project[]> {
  if (isDemoMode) {
    return getLocal<Project[]>("portfolio_projects", DEFAULT_PROJECTS);
  }
  try {
    const colSnap = await getDocs(collection(db, "projects"));
    const list: Project[] = [];
    colSnap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Project);
    });
    if (list.length === 0) {
      // Seed initial
      for (const p of DEFAULT_PROJECTS) {
        await setDoc(doc(db, "projects", p.id), {
          title: p.title,
          description: p.description,
          tech: p.tech,
          githubLink: p.githubLink,
          demoLink: p.demoLink || "",
          imageUrl: p.imageUrl
        });
      }
      return DEFAULT_PROJECTS;
    }
    return list;
  } catch (err) {
    console.error("Firebase error reading projects, returning fallback:", err);
    return getLocal<Project[]>("portfolio_projects", DEFAULT_PROJECTS);
  }
}

export async function saveProject(project: Project): Promise<void> {
  const projects = getLocal<Project[]>("portfolio_projects", DEFAULT_PROJECTS);
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx > -1) {
    projects[idx] = project;
  } else {
    projects.push(project);
  }
  setLocal("portfolio_projects", projects);

  if (!isDemoMode) {
    try {
      await setDoc(doc(db, "projects", project.id), {
        title: project.title,
        description: project.description,
        tech: project.tech,
        githubLink: project.githubLink,
        demoLink: project.demoLink || "",
        imageUrl: project.imageUrl
      });
    } catch (err) {
      console.error("Firebase saveProject error:", err);
      throw err;
    }
  }
}

export async function deleteProject(id: string): Promise<void> {
  const projects = getLocal<Project[]>("portfolio_projects", DEFAULT_PROJECTS);
  const updated = projects.filter(p => p.id !== id);
  setLocal("portfolio_projects", updated);

  if (!isDemoMode) {
    try {
      await deleteDoc(doc(db, "projects", id));
    } catch (err) {
      console.error("Firebase deleteProject error:", err);
      throw err;
    }
  }
}

// 3. Certifications
export async function getCertifications(): Promise<Certification[]> {
  if (isDemoMode) {
    return getLocal<Certification[]>("portfolio_certifications", DEFAULT_CERTIFICATIONS);
  }
  try {
    const colSnap = await getDocs(collection(db, "certifications"));
    const list: Certification[] = [];
    colSnap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Certification);
    });
    if (list.length === 0) {
      for (const c of DEFAULT_CERTIFICATIONS) {
        await setDoc(doc(db, "certifications", c.id), {
          title: c.title,
          org: c.org,
          date: c.date,
          description: c.description,
          imageUrl: c.imageUrl
        });
      }
      return DEFAULT_CERTIFICATIONS;
    }
    return list;
  } catch (err) {
    console.error("Firebase error reading certifications:", err);
    return getLocal<Certification[]>("portfolio_certifications", DEFAULT_CERTIFICATIONS);
  }
}

export async function saveCertification(cert: Certification): Promise<void> {
  const certs = getLocal<Certification[]>("portfolio_certifications", DEFAULT_CERTIFICATIONS);
  const idx = certs.findIndex(c => c.id === cert.id);
  if (idx > -1) {
    certs[idx] = cert;
  } else {
    certs.push(cert);
  }
  setLocal("portfolio_certifications", certs);

  if (!isDemoMode) {
    try {
      await setDoc(doc(db, "certifications", cert.id), {
        title: cert.title,
        org: cert.org,
        date: cert.date,
        description: cert.description,
        imageUrl: cert.imageUrl
      });
    } catch (err) {
      console.error("Firebase saveCertification error:", err);
      throw err;
    }
  }
}

export async function deleteCertification(id: string): Promise<void> {
  const certs = getLocal<Certification[]>("portfolio_certifications", DEFAULT_CERTIFICATIONS);
  const updated = certs.filter(c => c.id !== id);
  setLocal("portfolio_certifications", updated);

  if (!isDemoMode) {
    try {
      await deleteDoc(doc(db, "certifications", id));
    } catch (err) {
      console.error("Firebase deleteCertification error:", err);
      throw err;
    }
  }
}

// 4. Activities
export async function getActivities(): Promise<Activity[]> {
  if (isDemoMode) {
    return getLocal<Activity[]>("portfolio_activities", DEFAULT_ACTIVITIES);
  }
  try {
    const colSnap = await getDocs(collection(db, "activities"));
    const list: Activity[] = [];
    colSnap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Activity);
    });
    if (list.length === 0) {
      for (const a of DEFAULT_ACTIVITIES) {
        await setDoc(doc(db, "activities", a.id), {
          title: a.title,
          org: a.org,
          date: a.date,
          description: a.description,
          imageUrl: a.imageUrl,
          roleBadge: a.roleBadge
        });
      }
      return DEFAULT_ACTIVITIES;
    }
    return list;
  } catch (err) {
    console.error("Firebase error reading activities:", err);
    return getLocal<Activity[]>("portfolio_activities", DEFAULT_ACTIVITIES);
  }
}

export async function saveActivity(act: Activity): Promise<void> {
  const acts = getLocal<Activity[]>("portfolio_activities", DEFAULT_ACTIVITIES);
  const idx = acts.findIndex(a => a.id === act.id);
  if (idx > -1) {
    acts[idx] = act;
  } else {
    acts.push(act);
  }
  setLocal("portfolio_activities", acts);

  if (!isDemoMode) {
    try {
      await setDoc(doc(db, "activities", act.id), {
        title: act.title,
        org: act.org,
        date: act.date,
        description: act.description,
        imageUrl: act.imageUrl,
        roleBadge: act.roleBadge
      });
    } catch (err) {
      console.error("Firebase saveActivity error:", err);
      throw err;
    }
  }
}

export async function deleteActivity(id: string): Promise<void> {
  const acts = getLocal<Activity[]>("portfolio_activities", DEFAULT_ACTIVITIES);
  const updated = acts.filter(a => a.id !== id);
  setLocal("portfolio_activities", updated);

  if (!isDemoMode) {
    try {
      await deleteDoc(doc(db, "activities", id));
    } catch (err) {
      console.error("Firebase deleteActivity error:", err);
      throw err;
    }
  }
}

// 5. Skills
export async function getSkills(): Promise<Skill[]> {
  if (isDemoMode) {
    return getLocal<Skill[]>("portfolio_skills", DEFAULT_SKILLS);
  }
  try {
    const colSnap = await getDocs(collection(db, "skills"));
    const list: Skill[] = [];
    colSnap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Skill);
    });
    if (list.length === 0) {
      for (const s of DEFAULT_SKILLS) {
        await setDoc(doc(db, "skills", s.id), {
          name: s.name,
          percentage: s.percentage,
          category: s.category
        });
      }
      return DEFAULT_SKILLS;
    }
    return list;
  } catch (err) {
    console.error("Firebase error reading skills:", err);
    return getLocal<Skill[]>("portfolio_skills", DEFAULT_SKILLS);
  }
}

export async function saveSkill(skill: Skill): Promise<void> {
  const skills = getLocal<Skill[]>("portfolio_skills", DEFAULT_SKILLS);
  const idx = skills.findIndex(s => s.id === skill.id);
  if (idx > -1) {
    skills[idx] = skill;
  } else {
    skills.push(skill);
  }
  setLocal("portfolio_skills", skills);

  if (!isDemoMode) {
    try {
      await setDoc(doc(db, "skills", skill.id), {
        name: skill.name,
        percentage: skill.percentage,
        category: skill.category
      });
    } catch (err) {
      console.error("Firebase saveSkill error:", err);
      throw err;
    }
  }
}

export async function deleteSkill(id: string): Promise<void> {
  const skills = getLocal<Skill[]>("portfolio_skills", DEFAULT_SKILLS);
  const updated = skills.filter(s => s.id !== id);
  setLocal("portfolio_skills", updated);

  if (!isDemoMode) {
    try {
      await deleteDoc(doc(db, "skills", id));
    } catch (err) {
      console.error("Firebase deleteSkill error:", err);
      throw err;
    }
  }
}

// 6. Contact Messages
export async function getMessages(): Promise<ContactMessage[]> {
  const localMsgs = getLocal<ContactMessage[]>("portfolio_messages", []);
  if (isDemoMode) {
    return localMsgs;
  }
  try {
    const colSnap = await getDocs(collection(db, "contact_messages"));
    const list: ContactMessage[] = [];
    colSnap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as ContactMessage);
    });
    // merge and return sorted by date desc
    const merged = [...list];
    localMsgs.forEach(lm => {
      if (!merged.find(m => m.id === lm.id)) {
        merged.push(lm);
      }
    });
    return merged.sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      const valA = isNaN(timeA) ? 0 : timeA;
      const valB = isNaN(timeB) ? 0 : timeB;
      return valB - valA;
    });
  } catch (err) {
    console.error("Firebase error reading messages:", err);
    return localMsgs;
  }
}

export async function addMessage(msg: ContactMessage): Promise<void> {
  const msgs = getLocal<ContactMessage[]>("portfolio_messages", []);
  msgs.push(msg);
  setLocal("portfolio_messages", msgs);

  if (!isDemoMode) {
    try {
      await setDoc(doc(db, "contact_messages", msg.id), {
        name: msg.name,
        email: msg.email,
        phone: msg.phone || "",
        subject: msg.subject,
        message: msg.message,
        date: msg.date,
        read: msg.read
      });
    } catch (err) {
      console.error("Firebase addMessage error:", err);
    }
  }
}

export async function markMessageRead(id: string, read: boolean): Promise<void> {
  const msgs = getLocal<ContactMessage[]>("portfolio_messages", []);
  const idx = msgs.findIndex(m => m.id === id);
  if (idx > -1) {
    msgs[idx].read = read;
  }
  setLocal("portfolio_messages", msgs);

  if (!isDemoMode) {
    try {
      await setDoc(doc(db, "contact_messages", id), { read }, { merge: true });
    } catch (err) {
      console.error("Firebase markMessageRead error:", err);
    }
  }
}

export async function deleteMessage(id: string): Promise<void> {
  const msgs = getLocal<ContactMessage[]>("portfolio_messages", []);
  const updated = msgs.filter(m => m.id !== id);
  setLocal("portfolio_messages", updated);

  if (!isDemoMode) {
    try {
      await deleteDoc(doc(db, "contact_messages", id));
    } catch (err) {
      console.error("Firebase deleteMessage error:", err);
    }
  }
}

// 7. Settings
export async function getSettings(): Promise<PortfolioSettings> {
  if (isDemoMode) {
    return getLocal<PortfolioSettings>("portfolio_settings", DEFAULT_SETTINGS);
  }
  try {
    const docRef = doc(db, "settings", "main");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as PortfolioSettings;
    } else {
      await setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (err) {
    console.error("Firebase error reading settings:", err);
    return getLocal<PortfolioSettings>("portfolio_settings", DEFAULT_SETTINGS);
  }
}

export async function saveSettings(settings: PortfolioSettings): Promise<void> {
  setLocal("portfolio_settings", settings);
  if (!isDemoMode) {
    try {
      await setDoc(doc(db, "settings", "main"), settings);
    } catch (err) {
      console.error("Firebase saveSettings error:", err);
      throw err;
    }
  }
}

// 8. Admin Credentials
export async function getAdminCredentials(): Promise<AdminCredentials> {
  if (isDemoMode) {
    return getLocal<AdminCredentials>("portfolio_admin", DEFAULT_ADMIN);
  }
  try {
    const docRef = doc(db, "settings", "admin");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AdminCredentials;
    } else {
      await setDoc(docRef, DEFAULT_ADMIN);
      return DEFAULT_ADMIN;
    }
  } catch (err) {
    console.error("Firebase error reading admin credentials:", err);
    return getLocal<AdminCredentials>("portfolio_admin", DEFAULT_ADMIN);
  }
}

export async function saveAdminCredentials(creds: AdminCredentials): Promise<void> {
  setLocal("portfolio_admin", creds);
  if (!isDemoMode) {
    try {
      await setDoc(doc(db, "settings", "admin"), creds);
    } catch (err) {
      console.error("Firebase saveAdminCredentials error:", err);
      throw err;
    }
  }
}

// 9. Custom Sections
export async function getCustomSections(): Promise<CustomSection[]> {
  if (isDemoMode) {
    return getLocal<CustomSection[]>("portfolio_custom_sections", []);
  }
  try {
    const colSnap = await getDocs(collection(db, "custom_sections"));
    const list: CustomSection[] = [];
    colSnap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as CustomSection);
    });
    return list.sort((a, b) => a.order - b.order);
  } catch (err) {
    console.error("Firebase error reading custom sections, returning fallback:", err);
    return getLocal<CustomSection[]>("portfolio_custom_sections", []);
  }
}

export async function saveCustomSection(section: CustomSection): Promise<void> {
  const sections = getLocal<CustomSection[]>("portfolio_custom_sections", []);
  const idx = sections.findIndex(s => s.id === section.id);
  if (idx > -1) {
    sections[idx] = section;
  } else {
    sections.push(section);
  }
  setLocal("portfolio_custom_sections", sections);

  if (!isDemoMode) {
    try {
      await setDoc(doc(db, "custom_sections", section.id), {
        title: section.title,
        heading: section.heading,
        subheading: section.subheading || "",
        content: section.content,
        imageUrl: section.imageUrl || "",
        isActive: section.isActive,
        order: section.order
      });
    } catch (err) {
      console.error("Firebase saveCustomSection error:", err);
      throw err;
    }
  }
}

export async function deleteCustomSection(id: string): Promise<void> {
  const sections = getLocal<CustomSection[]>("portfolio_custom_sections", []);
  const updated = sections.filter(s => s.id !== id);
  setLocal("portfolio_custom_sections", updated);

  if (!isDemoMode) {
    try {
      await deleteDoc(doc(db, "custom_sections", id));
    } catch (err) {
      console.error("Firebase deleteCustomSection error:", err);
      throw err;
    }
  }
}

// Helper function to compress and resize images client-side to prevent large payload and storage limit failures
export function compressAndResizeImage(file: File, maxW: number = 800, maxH: number = 800, quality: number = 0.75): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Return compressed JPEG format
                const compressedFile = new File([blob], file.name.substring(0, file.name.lastIndexOf('.')) + ".jpg", {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            quality
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

// 10. Analytics / Visitor Counter
export async function getPageViewCount(): Promise<number> {
  if (isDemoMode) {
    const localCount = localStorage.getItem("portfolio_page_views");
    return localCount ? parseInt(localCount, 10) : 0;
  }
  try {
    const docRef = doc(db, "analytics", "views");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().count || 0;
    } else {
      await setDoc(docRef, { count: 0 });
      return 0;
    }
  } catch (err) {
    console.error("Firebase error getting page views, returning local:", err);
    const localCount = localStorage.getItem("portfolio_page_views");
    return localCount ? parseInt(localCount, 10) : 0;
  }
}

export async function incrementPageViewCount(): Promise<number> {
  if (sessionStorage.getItem("page_view_counted")) {
    return getPageViewCount();
  }
  
  sessionStorage.setItem("page_view_counted", "true");
  
  if (isDemoMode) {
    const localCount = localStorage.getItem("portfolio_page_views");
    const newCount = (localCount ? parseInt(localCount, 10) : 0) + 1;
    localStorage.setItem("portfolio_page_views", newCount.toString());
    return newCount;
  }
  try {
    const docRef = doc(db, "analytics", "views");
    const docSnap = await getDoc(docRef);
    let newCount = 1;
    if (docSnap.exists()) {
      newCount = (docSnap.data().count || 0) + 1;
      await setDoc(docRef, { count: newCount }, { merge: true });
    } else {
      await setDoc(docRef, { count: 1 });
    }
    localStorage.setItem("portfolio_page_views", newCount.toString());
    return newCount;
  } catch (err) {
    console.error("Firebase error incrementing page views, using local:", err);
    const localCount = localStorage.getItem("portfolio_page_views");
    const newCount = (localCount ? parseInt(localCount, 10) : 0) + 1;
    localStorage.setItem("portfolio_page_views", newCount.toString());
    return newCount;
  }
}

export class UploadCancelledError extends Error {
  isCancelled: boolean;
  constructor(message = "Upload cancelled by user") {
    super(message);
    this.name = "UploadCancelledError";
    this.isCancelled = true;
  }
}

// Generate compressed base64 preview instantly
export async function getInstantImagePreview(file: File): Promise<string> {
  let processedFile = file;
  try {
    processedFile = await compressAndResizeImage(file);
  } catch (err) {
    console.error("Compression failed in preview helper", err);
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error("File read error"));
    };
    reader.readAsDataURL(processedFile);
  });
}

// File / Image Upload simulation & real integration
export async function uploadFile(
  file: File, 
  pathString: string, 
  onProgress?: (percent: number) => void,
  cancelTrigger?: { cancel?: () => void }
): Promise<string> {
  let processedFile = file;
  try {
    processedFile = await compressAndResizeImage(file);
  } catch (compressErr) {
    console.error("Image compression failed, using original file:", compressErr);
  }

  if (isDemoMode) {
    let interval: any;
    let cancelled = false;

    if (cancelTrigger) {
      cancelTrigger.cancel = () => {
        cancelled = true;
        if (interval) clearInterval(interval);
      };
    }

    if (onProgress) {
      let progress = 0;
      interval = setInterval(() => {
        if (cancelled) {
          clearInterval(interval);
          return;
        }
        progress += 10;
        if (progress > 100) {
          clearInterval(interval);
        } else {
          onProgress(progress);
        }
      }, 150);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (cancelled) {
          reject(new UploadCancelledError());
          return;
        }
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error("File reading failed"));
      };
      reader.readAsDataURL(processedFile);
    });
  }

  try {
    const fileRef = ref(storage, pathString + "/" + Date.now() + "_" + processedFile.name);
    const uploadTask = uploadBytesResumable(fileRef, processedFile);

    if (cancelTrigger) {
      cancelTrigger.cancel = () => {
        uploadTask.cancel();
      };
    }

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error("Firebase upload error, falling back to Base64:", error);
          if (error.code === "storage/canceled") {
            reject(new UploadCancelledError());
          } else {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (onProgress) onProgress(100);
              resolve(reader.result as string);
            };
            reader.onerror = () => {
              reject(error);
            };
            reader.readAsDataURL(processedFile);
          }
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve(url);
          } catch (urlErr) {
            console.error("Firebase getDownloadURL error, falling back to Base64:", urlErr);
            const reader = new FileReader();
            reader.onloadend = () => {
              if (onProgress) onProgress(100);
              resolve(reader.result as string);
            };
            reader.onerror = () => {
              reject(urlErr);
            };
            reader.readAsDataURL(processedFile);
          }
        }
      );
    });
  } catch (err) {
    console.error("Firebase uploadFile error, simulating base64 fallback:", err);
    let interval: any;
    let cancelled = false;

    if (cancelTrigger) {
      cancelTrigger.cancel = () => {
        cancelled = true;
        if (interval) clearInterval(interval);
      };
    }

    if (onProgress) {
      let progress = 0;
      interval = setInterval(() => {
        if (cancelled) {
          clearInterval(interval);
          return;
        }
        progress += 10;
        if (progress > 100) {
          clearInterval(interval);
        } else {
          onProgress(progress);
        }
      }, 150);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (cancelled) {
          reject(new UploadCancelledError());
          return;
        }
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
    });
  }
}
