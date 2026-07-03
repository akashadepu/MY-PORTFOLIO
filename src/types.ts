export interface Profile {
  name: string;
  title: string;
  bio: string;
  college: string;
  profilePhotoUrl: string;
  gradientFrom: string; // e.g., "#8B5CF6"
  gradientTo: string;   // e.g., "#EC4899"
  greetingText?: string; // Custom typing text prefix, e.g., "Hi, I'm"
}

export interface CustomSection {
  id: string;
  title: string;      // Navigation item title (e.g., "Research")
  heading: string;    // Page section header (e.g., "Academic Research")
  subheading?: string; // Subtitle / subtext
  content: string;    // Section content (markdown/text)
  imageUrl?: string;  // Image for illustration
  isActive: boolean;  // Whether to show this section
  order: number;      // Navigation sort order
  layout?: "left-image" | "right-image" | "centered" | "split";
  linkText?: string;  // Optional custom CTA link text
  linkUrl?: string;   // Optional custom CTA link url
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[]; // string array of badges
  githubLink: string;
  demoLink?: string;
  imageUrl: string;
}

export interface Certification {
  id: string;
  title: string;
  org: string;
  date: string;
  description: string;
  imageUrl: string; // Can be full certificate view
}

export interface Activity {
  id: string;
  title: string;
  org: string;
  date: string;
  description: string;
  imageUrl: string;
  roleBadge: string;
}

export interface Skill {
  id: string;
  name: string;
  percentage: number;
  category: "Languages" | "Frontend" | "Backend" | "Tools" | "Database";
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string; // ISO string or formatted date
  read: boolean;
}

export interface SocialLinks {
  instagram: string;
  linkedin: string;
  github: string;
  email: string;
}

export interface PortfolioSettings {
  footerText: string;
  copyrightText: string;
  socialLinks: SocialLinks;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface InfoCard {
  id: string;
  label: string;
  value: string;
  iconName: "college" | "year" | "location" | "status";
}

export interface AboutInfo {
  aboutText: string;
  bannerUrl: string;
  cards: InfoCard[];
}

export interface DailyViewsData {
  date: string;
  label: string;
  views: number;
  cumulative: number;
}

