// Brand constants
export const BRAND_NAME = "StudyHub";
export const BRAND_TAGLINE = "Study Smarter, Win Harder";
export const BRAND_URL = "https://studyhub-studentportal.lovable.app";
export const BRAND_DESCRIPTION = "Connect with students worldwide on StudyHub. Share knowledge, ask questions, and collaborate across different countries, subjects, grades, and streams.";

// Grade levels - includes adult option (minimum age 13+, so starting from Grade 9)
export const STUDENT_GRADES = [
  "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Undergraduate", "Postgraduate"
];

export const ADULT_GRADES = ["Adult (18+)", "Working Professional"];

export const ALL_GRADES = [...STUDENT_GRADES, ...ADULT_GRADES];

// Streams/Curriculum
export const STUDENT_STREAMS = [
  "CBSE", "IGCSE", "IB", "AP", "A-Levels", "GCSE", 
  "State Board", "Cambridge", "Edexcel", "German Abitur", 
  "French Baccalauréat", "Dutch VWO", "Other"
];

export const ADULT_STREAMS = [
  "Not Applicable", "Self-Learning", "Professional Development",
  // Dental Degrees
  "BDS", "MDS",
  // UK Royal College Qualifications
  "LDSRCS(Eng)", "MFDSRCS(Eng)", "MFDSRCS(Edin)", "MFDSRCPS(Glas)",
  "MIMPDent RCSEd",
  // Registration Status
  "GDC Registered", "DCI Registered",
  // Support Roles
  "Dental Hygiene", "Dental Technology", "Dental Nursing",
  "Other"
];

// Subjects
export const STUDENT_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", 
  "Computer Science", "English", "History", "Geography"
];

export const ADULT_SUBJECTS = [
  "General", "Career Advice", "Finance", "Technology", 
  "Business", "Personal Development", "Health & Wellness", 
  // Dental General
  "Dentistry", "Oral Health", "Dental Sciences",
  // Dental Specialties
  "Implant Dentistry", "Oral Surgery", "Endodontics", 
  "Prosthodontics", "Orthodontics", "Periodontics",
  "Paediatric Dentistry", "Oral Medicine", "Dental Radiology",
  "Other"
];

export const DENTAL_STREAMS = [
  "BDS", "MDS",
  "LDSRCS(Eng)", "MFDSRCS(Eng)", "MFDSRCS(Edin)", "MFDSRCPS(Glas)",
  "MIMPDent RCSEd", "GDC Registered", "DCI Registered",
  "Dental Hygiene", "Dental Technology", "Dental Nursing"
];

export const ALL_SUBJECTS = [...STUDENT_SUBJECTS, ...ADULT_SUBJECTS];

// Countries
export const COUNTRIES = [
  "United States", "United Kingdom", "India", "Canada", "Australia", 
  "Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", 
  "Poland", "Switzerland", "Belgium", "Austria", "Other"
];

// Helper functions
export const isAdultGrade = (grade: string): boolean => {
  return ADULT_GRADES.includes(grade);
};

export const getGradesForSelection = (): string[] => ALL_GRADES;

export const getStreamsForGrade = (grade: string): string[] => {
  if (isAdultGrade(grade)) {
    return ADULT_STREAMS;
  }
  return STUDENT_STREAMS;
};

export const getSubjectsForGrade = (grade: string): string[] => {
  if (isAdultGrade(grade)) {
    return [...ADULT_SUBJECTS, ...STUDENT_SUBJECTS];
  }
  return [...STUDENT_SUBJECTS, ...ADULT_SUBJECTS];
};

// For filters - show all options
export const getFilterGrades = (): string[] => ALL_GRADES;
export const getFilterStreams = (): string[] => [...new Set([...STUDENT_STREAMS, ...ADULT_STREAMS])];
export const getFilterSubjects = (): string[] => [...new Set([...STUDENT_SUBJECTS, ...ADULT_SUBJECTS])];
