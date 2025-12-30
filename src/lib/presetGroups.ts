// Preset groups for different categories

export const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Nigeria", "South Africa", "Kenya", "Ghana", "Pakistan",
  "Bangladesh", "Philippines", "Indonesia", "Malaysia", "Singapore",
  "Germany", "France", "Brazil", "Mexico", "UAE"
];

export const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
  "English", "History", "Geography", "Economics", "Business Studies",
  "Accounting", "Psychology", "Sociology", "Political Science", "Law",
  "Art", "Music", "Physical Education", "Environmental Science", "Statistics"
];

export const GRADES = [
  "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
  "O Levels", "A Levels", "IB Diploma", "IGCSE", "University"
];

export const STREAMS = [
  "Science", "Commerce", "Arts", "Humanities", "Engineering",
  "Medical", "Technology", "Management", "Law", "General"
];

export interface PresetGroup {
  name: string;
  description: string;
  category: "country" | "subject" | "grade" | "stream";
}

export function generatePresetGroups(): PresetGroup[] {
  const groups: PresetGroup[] = [];

  // Country-based groups
  COUNTRIES.forEach(country => {
    groups.push({
      name: `${country} Students`,
      description: `Study group for students in ${country}. Connect, share resources, and collaborate!`,
      category: "country"
    });
  });

  // Subject-based groups
  SUBJECTS.forEach(subject => {
    groups.push({
      name: `${subject} Learners`,
      description: `Dedicated study group for ${subject}. Ask questions, share notes, and master the subject together.`,
      category: "subject"
    });
  });

  // Grade-based groups
  GRADES.forEach(grade => {
    groups.push({
      name: `${grade} Study Hub`,
      description: `Study group for ${grade} students. Share exam tips, discuss topics, and help each other succeed.`,
      category: "grade"
    });
  });

  // Stream-based groups
  STREAMS.forEach(stream => {
    groups.push({
      name: `${stream} Stream`,
      description: `Connect with other ${stream} students. Share insights, resources, and career guidance.`,
      category: "stream"
    });
  });

  return groups;
}

// For seeding the database
export const PRESET_GROUPS = generatePresetGroups();
