export interface CurriculumGuide {
  slug: string;
  name: string;
  short: string;
  description: string;
  examTips: string[];
  studyResources: string[];
  subjects: string[];
  faqs: { question: string; answer: string }[];
}

export const CURRICULA: CurriculumGuide[] = [
  {
    slug: "cbse",
    name: "CBSE",
    short: "Central Board of Secondary Education (India) — Classes 9 to 12.",
    description:
      "The CBSE curriculum is followed by thousands of schools across India and abroad. Success depends on mastering NCERT textbooks, solving previous years' question papers, and a strong grasp of fundamentals in Math, Science, Social Science and English.",
    examTips: [
      "Master NCERT books cover-to-cover — most board questions come directly from them.",
      "Solve at least 10 years of previous board papers to identify recurring patterns.",
      "Practice writing answers in the official CBSE format with proper headings and diagrams.",
      "Time-box mock tests to 3 hours to build exam-day stamina.",
      "Revise sample papers released by CBSE every January before boards.",
    ],
    studyResources: [
      "NCERT textbooks and exemplar problems",
      "CBSE official sample papers and marking schemes",
      "RD Sharma / RS Aggarwal for Math practice",
      "Lakhmir Singh / Pradeep for Science",
      "StudyHub Groups for CBSE peer discussions",
    ],
    subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Social Science", "Computer Science"],
    faqs: [
      {
        question: "How to ace CBSE board exams?",
        answer:
          "Stick to NCERT, solve 10 years of past papers, write answers in the prescribed format, and take at least 5 full-length timed mocks before the exam.",
      },
      {
        question: "Which reference books are best for CBSE Class 12?",
        answer:
          "NCERT is the primary source. Supplement with RD Sharma for Math, HC Verma for Physics, and Pradeep for Chemistry & Biology.",
      },
    ],
  },
  {
    slug: "igcse",
    name: "IGCSE",
    short: "International General Certificate of Secondary Education by Cambridge.",
    description:
      "IGCSE is a globally recognised qualification taken by students aged 14–16. Exams reward conceptual understanding, application, and structured answer writing. Past paper practice is the single biggest predictor of high grades.",
    examTips: [
      "Use the Cambridge syllabus document as your checklist — tick off every learning objective.",
      "Solve at least 5 years of past papers per subject under timed conditions.",
      "Read examiner reports to understand exactly how marks are awarded.",
      "Memorise command words (state, explain, evaluate) — they dictate answer length.",
      "Use the official Cambridge mark scheme to self-grade your practice answers.",
    ],
    studyResources: [
      "Cambridge endorsed textbooks (Hodder, Cambridge University Press)",
      "Save My Exams revision notes",
      "PapaCambridge / GCE Guide for past papers",
      "Cambridge syllabus PDFs (always use the latest)",
      "StudyHub IGCSE study groups",
    ],
    subjects: ["Mathematics (0580)", "Physics (0625)", "Chemistry (0620)", "Biology (0610)", "English (0500)", "Economics (0455)", "Computer Science (0478)"],
    faqs: [
      {
        question: "How to get A* in IGCSE?",
        answer:
          "Cover the full syllabus, solve at least 10 past papers per subject, learn command words, and self-mark with official mark schemes.",
      },
      {
        question: "Are IGCSE exams harder than CBSE?",
        answer:
          "IGCSE focuses more on application and analysis; CBSE leans on memorisation. Difficulty depends on the student — both are rigorous.",
      },
    ],
  },
  {
    slug: "ib",
    name: "IB (International Baccalaureate)",
    short: "IB Diploma Programme (DP) — globally recognised, university preparatory.",
    description:
      "The IB Diploma is one of the most demanding pre-university qualifications in the world. It blends six subject groups with the core (TOK, Extended Essay, CAS). High scores demand consistent internal assessment work, strong essay writing and time management.",
    examTips: [
      "Start your IAs (Internal Assessments) early — don't leave them until DP2.",
      "Use IB command terms (analyse, evaluate, justify) precisely in every answer.",
      "Plan your Extended Essay topic by the end of DP1 to give yourself a full year.",
      "Practice past Paper 1, 2, and 3 questions for each subject — official sources only.",
      "Don't neglect TOK — it can swing your total by up to 3 points.",
    ],
    studyResources: [
      "Official IB subject guides",
      "Oxford / Pearson IB course companions",
      "Revision Village (Math, Physics, Chemistry, Biology)",
      "IB past papers (via your school's IB coordinator)",
      "StudyHub IB Diploma study groups",
    ],
    subjects: ["Math AA/AI HL & SL", "Physics", "Chemistry", "Biology", "English A Lang & Lit", "Economics", "History", "Computer Science"],
    faqs: [
      {
        question: "How to get 45 in IB?",
        answer:
          "A perfect 45 requires 7s in all six subjects plus full 3 bonus points from TOK + EE. Focus on IAs early — they make up 20–30% of each subject.",
      },
      {
        question: "Is IB harder than A-Levels?",
        answer:
          "IB is broader (6 subjects + core); A-Levels go deeper into fewer subjects. IB students often find it more workload-heavy.",
      },
    ],
  },
  {
    slug: "ap",
    name: "AP (Advanced Placement)",
    short: "College Board AP courses — earn US college credit in high school.",
    description:
      "AP exams (administered by College Board in May) let high school students earn college credit. Scores of 4 or 5 are accepted by most US universities. Success comes from mastering the Course and Exam Description (CED) and practicing official released MCQs and FRQs.",
    examTips: [
      "Download the official Course and Exam Description (CED) — it lists every testable skill.",
      "Practice with released FRQs from College Board — these are the gold standard.",
      "For AP Calc, Stats, Physics — memorise the formula sheet so you can use it instantly.",
      "Take a full-length timed practice exam at least 3 weeks before May.",
      "Learn the AP rubric — graders reward specific keywords and structured reasoning.",
    ],
    studyResources: [
      "AP Classroom (official College Board platform)",
      "Princeton Review / Barron's AP prep books",
      "Khan Academy (AP Calc, Bio, Chem, Stats, CS, World History)",
      "AP released free-response questions (apcentral.collegeboard.org)",
      "StudyHub AP study groups",
    ],
    subjects: ["AP Calculus AB/BC", "AP Physics 1/2/C", "AP Chemistry", "AP Biology", "AP Computer Science A", "AP US History", "AP English Lang/Lit", "AP Statistics"],
    faqs: [
      {
        question: "How to get a 5 on AP exams?",
        answer:
          "Study from the official CED, practice released FRQs weekly, take 2–3 full-length timed mocks, and review the scoring rubric for each free response.",
      },
      {
        question: "How many AP classes should I take?",
        answer:
          "Quality over quantity — most competitive US colleges look for 5–8 APs across your high school career, with 5s in your strongest subjects.",
      },
    ],
  },
  {
    slug: "a-levels",
    name: "A-Levels",
    short: "UK Advanced Level — typically 3 subjects studied in depth.",
    description:
      "A-Levels are the UK gold standard for university admissions. Students typically specialise in 3 subjects. Top grades require deep subject knowledge, exam technique, and practice with past papers from the specific board (AQA, Edexcel, OCR, Cambridge).",
    examTips: [
      "Identify your exam board first — past papers differ significantly between AQA, Edexcel and OCR.",
      "Solve a minimum of 10 past papers per subject in timed conditions.",
      "Use examiner reports — they tell you exactly what students lost marks on.",
      "Make condensed revision notes for the 6 weeks before exams, not earlier.",
      "Master one essay/long-answer technique per subject and apply it consistently.",
    ],
    studyResources: [
      "Physics & Maths Tutor (PMT) — past papers and notes",
      "Save My Exams — concise revision notes",
      "CGP / Oxford A-Level textbooks",
      "Seneca Learning for spaced repetition",
      "StudyHub A-Level study groups",
    ],
    subjects: ["Mathematics", "Further Maths", "Physics", "Chemistry", "Biology", "Economics", "English Literature", "Computer Science"],
    faqs: [
      {
        question: "How to get A* in A-Levels?",
        answer:
          "Master the specification, solve 15+ past papers per subject, read examiner reports, and time every practice paper strictly.",
      },
      {
        question: "How many A-Levels do top UK universities require?",
        answer:
          "Most require 3 A-Levels at A*AA or AAA. Some courses (e.g. Cambridge Maths) prefer 4 with Further Maths.",
      },
    ],
  },
];

export const getCurriculum = (slug: string) =>
  CURRICULA.find((c) => c.slug === slug.toLowerCase());
