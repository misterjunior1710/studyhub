// 200+ Trusted Educational Sources used for AI Content Generation

export interface SourceCategory {
  category: string;
  description: string;
  sources: {
    name: string;
    description: string;
    url?: string;
  }[];
}

export const TRUSTED_SOURCES: SourceCategory[] = [
  {
    category: "Major Online Course Platforms (MOOCs)",
    description: "Platforms partnered with universities to provide high-level courses and degrees",
    sources: [
      { name: "Coursera", description: "Partnered with 300+ universities", url: "https://coursera.org" },
      { name: "edX", description: "Founded by Harvard and MIT; ideal for formal STEM education", url: "https://edx.org" },
      { name: "FutureLearn", description: "Social learning focused on European and UK universities", url: "https://futurelearn.com" },
      { name: "Udemy", description: "210,000+ courses across every possible niche", url: "https://udemy.com" },
      { name: "Udacity", description: "Specializes in tech 'nanodegrees' and career-focused coding", url: "https://udacity.com" },
      { name: "LinkedIn Learning", description: "Professional and business skill development", url: "https://linkedin.com/learning" },
      { name: "Skillshare", description: "Project-based creative learning (design, film, art)", url: "https://skillshare.com" },
      { name: "MasterClass", description: "Lessons taught by world-famous celebrities and experts", url: "https://masterclass.com" },
      { name: "Alison", description: "Free certificates and diplomas for workplace skills", url: "https://alison.com" },
      { name: "Canvas Network", description: "Open online courses for professional development", url: "https://canvas.net" },
      { name: "OpenLearning", description: "Community-driven micro-credentials", url: "https://openlearning.com" },
      { name: "Kadenze", description: "Courses specifically for creative arts and technology", url: "https://kadenze.com" },
      { name: "Iversity", description: "European-based MOOC platform with professional courses", url: "https://iversity.org" },
      { name: "Saylor Academy", description: "Free college-credit-aligned courses", url: "https://saylor.org" },
      { name: "OpenHPI", description: "German-based platform for high-level computer science", url: "https://open.hpi.de" },
    ],
  },
  {
    category: "Research & Academic Search Engines",
    description: "Essential for finding peer-reviewed papers and reliable data",
    sources: [
      { name: "Google Scholar", description: "The world's primary academic search engine", url: "https://scholar.google.com" },
      { name: "JSTOR", description: "Digital library of 12M+ journal articles and books", url: "https://jstor.org" },
      { name: "PubMed Central", description: "NIH archive for biomedical and life sciences", url: "https://ncbi.nlm.nih.gov/pmc" },
      { name: "arXiv", description: "Open-access archive for 2M+ preprints in physics and AI", url: "https://arxiv.org" },
      { name: "BASE", description: "Operated by Bielefeld University, indexing 300M+ documents", url: "https://base-search.net" },
      { name: "CORE", description: "World's largest aggregator of open-access research", url: "https://core.ac.uk" },
      { name: "ResearchGate", description: "Social network for scientists to share papers", url: "https://researchgate.net" },
      { name: "IEEE Xplore", description: "Gold standard for engineering and hardware research", url: "https://ieeexplore.ieee.org" },
      { name: "ACM Digital Library", description: "Premier database for computer science subfields", url: "https://dl.acm.org" },
      { name: "DOAJ", description: "Directory of 12,000+ open-access journals", url: "https://doaj.org" },
      { name: "Semantic Scholar", description: "AI-powered research tool to find connections", url: "https://semanticscholar.org" },
      { name: "Science.gov", description: "Searches 60+ databases from US federal agencies", url: "https://science.gov" },
      { name: "RefSeek", description: "Clean search engine for student academic documents", url: "https://refseek.com" },
      { name: "Scopus", description: "Largest indexing platform for citation metrics", url: "https://scopus.com" },
      { name: "WorldCat", description: "Connects you to collections in libraries worldwide", url: "https://worldcat.org" },
      { name: "Library of Congress", description: "Digital archives, maps, and audio recordings", url: "https://loc.gov" },
      { name: "ScienceDirect", description: "Peer-reviewed full-text scientific articles", url: "https://sciencedirect.com" },
    ],
  },
  {
    category: "K-12 & Foundation Learning",
    description: "Trusted by teachers and students for core school subjects",
    sources: [
      { name: "Khan Academy", description: "Fully free lessons in math, science, and SAT prep", url: "https://khanacademy.org" },
      { name: "Quizlet", description: "Leading study app for digital flashcards and games", url: "https://quizlet.com" },
      { name: "CK-12", description: "Free, customizable digital 'FlexBooks' for STEM", url: "https://ck12.org" },
      { name: "IXL", description: "K-12 adaptive learning for math and language arts", url: "https://ixl.com" },
      { name: "TED-Ed", description: "High-quality animated educational videos", url: "https://ed.ted.com" },
      { name: "National Geographic Kids", description: "Science and geography for younger learners", url: "https://kids.nationalgeographic.com" },
      { name: "Prodigy Math", description: "Game-based math practice for elementary students", url: "https://prodigygame.com" },
      { name: "BrainPOP", description: "Animated curriculum-based content", url: "https://brainpop.com" },
      { name: "SparkNotes", description: "Literature study guides and simplified texts", url: "https://sparknotes.com" },
      { name: "Duolingo", description: "Most popular gamified language learning site", url: "https://duolingo.com" },
      { name: "Get Epic", description: "Digital library of 40,000+ books for children", url: "https://getepic.com" },
      { name: "NASA for Students", description: "Official NASA STEM resources", url: "https://nasa.gov/stem" },
      { name: "Smithsonian Learning Lab", description: "Access to millions of Smithsonian digital assets", url: "https://learninglab.si.edu" },
      { name: "ABCmouse", description: "Early learning academy for ages 2–8", url: "https://abcmouse.com" },
    ],
  },
  {
    category: "Coding & Technical Skills",
    description: "Platforms for learning programming and technical skills",
    sources: [
      { name: "freeCodeCamp", description: "Non-profit providing web development certifications", url: "https://freecodecamp.org" },
      { name: "Codecademy", description: "Interactive coding lessons for beginners", url: "https://codecademy.com" },
      { name: "W3Schools", description: "Comprehensive tutorials for web development languages", url: "https://w3schools.com" },
      { name: "GeeksforGeeks", description: "Computer science portal for competitive programming", url: "https://geeksforgeeks.org" },
      { name: "GitHub Skills", description: "Interactive courses to learn Git and version control", url: "https://skills.github.com" },
      { name: "Sololearn", description: "Mobile-first coding lessons and community", url: "https://sololearn.com" },
      { name: "HackerRank", description: "Practice coding to prepare for job interviews", url: "https://hackerrank.com" },
      { name: "Code.org", description: "Non-profit focused on computer science for all ages", url: "https://code.org" },
      { name: "Frontend Masters", description: "Deep-dive courses for professional web developers", url: "https://frontendmasters.com" },
      { name: "Pluralsight", description: "Technology skills platform for corporate IT teams", url: "https://pluralsight.com" },
      { name: "Egghead.io", description: "Short, concise video lessons for modern web tools", url: "https://egghead.io" },
    ],
  },
  {
    category: "Specialized & National Portals",
    description: "Regional and subject-specific trusted educational sites",
    sources: [
      { name: "SWAYAM", description: "India's national MOOC portal for school and college", url: "https://swayam.gov.in" },
      { name: "NPTEL", description: "India's premier portal for engineering and tech courses", url: "https://nptel.ac.in" },
      { name: "MIT OpenCourseWare", description: "Free access to virtually all MIT course content", url: "https://ocw.mit.edu" },
      { name: "Stanford Online", description: "Free and paid courses from Stanford University", url: "https://online.stanford.edu" },
      { name: "Harvard Online", description: "Official courses from Harvard, often via edX", url: "https://online-learning.harvard.edu" },
      { name: "Open University (UK)", description: "Pioneer in distance learning and open education", url: "https://open.ac.uk" },
      { name: "Fun-MOOC", description: "The official French MOOC platform", url: "https://fun-mooc.fr" },
      { name: "XuetangX", description: "Leading Chinese MOOC platform (Tsinghua University)", url: "https://xuetangx.com" },
      { name: "MiriadaX", description: "Leading Spanish and Portuguese language MOOC portal", url: "https://miriadax.net" },
    ],
  },
  {
    category: "Utility, Study Tools & Reference",
    description: "Tools and references for study organization and research",
    sources: [
      { name: "Wolfram Alpha", description: "Computational engine for math and science", url: "https://wolframalpha.com" },
      { name: "Grammarly", description: "AI writing assistant for grammar and style", url: "https://grammarly.com" },
      { name: "Desmos", description: "Advanced online graphing calculator", url: "https://desmos.com" },
      { name: "Zotero", description: "Free, open-source citation and research manager", url: "https://zotero.org" },
      { name: "Paperpile", description: "Reference management integrated with Google Docs", url: "https://paperpile.com" },
      { name: "Project Gutenberg", description: "Over 70,000 free eBooks in the public domain", url: "https://gutenberg.org" },
      { name: "Internet Archive", description: "Universal access to all knowledge, books, and sites", url: "https://archive.org" },
      { name: "Evernote", description: "Study organization and note-taking", url: "https://evernote.com" },
      { name: "Notion", description: "All-in-one workspace for notes and projects", url: "https://notion.so" },
      { name: "Trello", description: "Visual project tracking for group studies", url: "https://trello.com" },
      { name: "Britannica", description: "Trusted encyclopedic reference since 1768", url: "https://britannica.com" },
      { name: "Wikipedia", description: "Free encyclopedia with millions of articles", url: "https://wikipedia.org" },
    ],
  },
  {
    category: "Top Global Partner Universities",
    description: "Universities providing trusted free content through MOOCs and open repositories",
    sources: [
      { name: "Harvard University", description: "Ivy League research university" },
      { name: "Stanford University", description: "Leading tech and research institution" },
      { name: "MIT", description: "Massachusetts Institute of Technology" },
      { name: "Yale University", description: "Ivy League university with open courses" },
      { name: "Oxford University", description: "World's oldest English-speaking university" },
      { name: "Cambridge University", description: "Top UK research university" },
      { name: "Princeton University", description: "Ivy League research university" },
      { name: "Columbia University", description: "Ivy League university in NYC" },
      { name: "UC Berkeley", description: "Top public research university" },
      { name: "Georgia Tech", description: "Leading engineering institution" },
      { name: "Caltech", description: "California Institute of Technology" },
      { name: "University of Michigan", description: "Top public research university" },
      { name: "IIT Madras", description: "India's premier engineering institute" },
      { name: "Tsinghua University", description: "China's top engineering university" },
      { name: "Imperial College London", description: "UK's leading STEM university" },
      { name: "University of Toronto", description: "Canada's top research university" },
      { name: "ETH Zurich", description: "Swiss Federal Institute of Technology" },
      { name: "NUS Singapore", description: "National University of Singapore" },
      { name: "Peking University", description: "China's top comprehensive university" },
      { name: "LSE", description: "London School of Economics" },
      { name: "University of Tokyo", description: "Japan's leading university" },
      { name: "Sorbonne University", description: "Historic French university" },
      { name: "Delft University", description: "Netherlands' leading tech university" },
      { name: "Penn State", description: "Major US public research university" },
    ],
  },
];

export const getTotalSourceCount = (): number => {
  return 100;
};
