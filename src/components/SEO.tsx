import { useEffect } from "react";
import { Profile, CustomSection } from "../types";

interface SEOProps {
  section: string;
  profile: Profile | null;
  customSections: CustomSection[];
}

export default function SEO({ section, profile, customSections }: SEOProps) {
  useEffect(() => {
    // 1. Determine Title and Meta Content dynamically based on the current section
    const userName = profile?.name || "Akash Adepu";
    const userRole = profile?.title || "Software Developer";
    const userBio = profile?.bio || "Explore my professional portfolio, projects, skills, and experience.";

    let titleSuffix = "";
    let description = userBio;
    let keywords = "portfolio, developer, software engineer, web development, react, javascript";

    switch (section) {
      case "home":
        titleSuffix = "Home";
        description = `Welcome to my professional portfolio. I am ${userName}, a ${userRole}. ${userBio}`;
        keywords += `, home, coding portfolio, web application`;
        break;
      case "about":
        titleSuffix = "About Me";
        description = `Learn more about my background, philosophy, education, and career journey.`;
        keywords += `, about, bio, experience, background`;
        break;
      case "skills":
        titleSuffix = "Skills & Expertise";
        description = `Explore my technical skillset, proficiency levels, technologies, and developer tools.`;
        keywords += `, skills, frontend, backend, technologies, tools`;
        break;
      case "projects":
        titleSuffix = "Projects & Case Studies";
        description = `Browse my featured web applications, open-source projects, and technical builds.`;
        keywords += `, projects, applications, showcase, github`;
        break;
      case "certifications":
        titleSuffix = "Certifications";
        description = `View my professional credentials, course achievements, and verified technical skills.`;
        keywords += `, certifications, credentials, courses, training`;
        break;
      case "activities":
        titleSuffix = "Activities & Achievements";
        description = `Discover my extracurricular engagements, achievements, and contributions.`;
        keywords += `, activities, achievements, experience, timeline`;
        break;
      case "contact":
        titleSuffix = "Get in Touch";
        description = `Contact me for collaboration, freelance work, job opportunities, or general inquiries.`;
        keywords += `, contact, email, message, hire me`;
        break;
      default:
        // Try to match custom sections
        const customSec = customSections.find((s) => s.id === section);
        if (customSec) {
          titleSuffix = customSec.title;
          description = `Explore the ${customSec.title} section in my portfolio.`;
          keywords += `, ${customSec.title.toLowerCase()}`;
        } else {
          titleSuffix = "Portfolio";
        }
        break;
    }

    const finalTitle = `Akash Portfolio | ${titleSuffix}`;

    // 2. Helper function to update or create meta tags in <head>
    const updateMetaTag = (nameAttr: { name?: string; property?: string }, content: string) => {
      const selector = nameAttr.name 
        ? `meta[name="${nameAttr.name}"]` 
        : `meta[property="${nameAttr.property}"]`;
      
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        if (nameAttr.name) {
          element.setAttribute("name", nameAttr.name);
        }
        if (nameAttr.property) {
          element.setAttribute("property", nameAttr.property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 3. Update Document Title
    document.title = finalTitle;

    // 4. Update Standard SEO Meta Tags
    updateMetaTag({ name: "description" }, description);
    updateMetaTag({ name: "keywords" }, keywords);
    updateMetaTag({ name: "author" }, userName);

    // 5. Update OpenGraph (OG) Meta Tags for Rich Social Previews (Facebook, LinkedIn, Discord)
    updateMetaTag({ property: "og:title" }, finalTitle);
    updateMetaTag({ property: "og:description" }, description);
    updateMetaTag({ property: "og:type" }, "profile");
    updateMetaTag({ property: "og:image" }, "/favicon.svg");
    updateMetaTag({ property: "og:site_name" }, `${userName} Portfolio`);

    // 6. Update Twitter Meta Tags
    updateMetaTag({ name: "twitter:card" }, "summary_large_image");
    updateMetaTag({ name: "twitter:title" }, finalTitle);
    updateMetaTag({ name: "twitter:description" }, description);
    updateMetaTag({ name: "twitter:image" }, "/favicon.svg");

  }, [section, profile, customSections]);

  return null; // This component handles the SEO updates declaratively and doesn't render visual nodes
}
