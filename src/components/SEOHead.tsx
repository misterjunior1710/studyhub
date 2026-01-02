import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  type?: "website" | "article";
  image?: string;
  noIndex?: boolean;
}

const SEOHead = ({
  title,
  description,
  canonical,
  type = "website",
  image = "https://storage.googleapis.com/gpt-engineer-file-uploads/T6FlWUVm6DYTgcsVHeiIqQYaN6A2/social-images/social-1764745412327-Screenshot 2025-12-03 123228.png",
  noIndex = false,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = `${title} | StudyHub`;

    // Helper to update or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic meta tags
    setMetaTag("description", description);
    setMetaTag("robots", noIndex ? "noindex, nofollow" : "index, follow");

    // Open Graph tags
    setMetaTag("og:title", `${title} | StudyHub`, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", type, true);
    setMetaTag("og:image", image, true);
    setMetaTag("og:site_name", "StudyHub", true);

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", `${title} | StudyHub`);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", image);

    // Canonical URL and og:url
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
      setMetaTag("og:url", canonical, true);
    }

    // Cleanup function to reset on unmount (optional)
    return () => {
      // Don't clean up as we want the last page's meta to persist
    };
  }, [title, description, canonical, type, image, noIndex]);

  return null;
};

export default SEOHead;

// Structured Data Component for JSON-LD
export const StructuredData = ({ data }: { data: object }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    script.id = "structured-data";
    
    // Remove existing script if any
    const existing = document.getElementById("structured-data");
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("structured-data");
      if (el) el.remove();
    };
  }, [data]);

  return null;
};

// Common structured data schemas
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "StudyHub",
  slogan: "Study Smarter, Win Harder",
  description: "StudyHub is a free global student community where learners connect, ask academic questions, share study materials, and collaborate in study groups. Join thousands of students from around the world.",
  url: "https://studyhub.world",
  logo: "https://storage.googleapis.com/gpt-engineer-file-uploads/T6FlWUVm6DYTgcsVHeiIqQYaN6A2/uploads/1764745423647-Screenshot 2025-12-03 123228.png",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "misterjunior1710@gmail.com",
  },
});

export const getCommunitySchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "StudyHub",
  alternateName: "Study Smarter, Win Harder",
  description: "StudyHub is a free online learning community for students worldwide. Ask homework questions, join study groups, track your progress on leaderboards, and access AI-powered study tools.",
  url: "https://studyhub.world",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://studyhub.world/questions?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
});

export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const getFAQSchema = (items: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map(item => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer
    }
  }))
});
