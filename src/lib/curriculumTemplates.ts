// Curriculum-specific chapter templates for quick topic generation

export interface ChapterTemplate {
  chapter: string;
  topics: string[];
}

export interface CurriculumSubject {
  subject: string;
  chapters: ChapterTemplate[];
}

export interface CurriculumTemplate {
  curriculum: string;
  grades: {
    grade: string;
    subjects: CurriculumSubject[];
  }[];
}

export const CURRICULUM_TEMPLATES: CurriculumTemplate[] = [
  {
    curriculum: "CBSE",
    grades: [
      {
        grade: "Grade 10",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Real Numbers", topics: ["Euclid's Division Lemma", "Fundamental Theorem of Arithmetic", "Irrational Numbers", "Decimal Expansions"] },
              { chapter: "Polynomials", topics: ["Zeros of Polynomials", "Division Algorithm", "Relationship between Zeros and Coefficients"] },
              { chapter: "Pair of Linear Equations", topics: ["Graphical Method", "Substitution Method", "Elimination Method", "Cross-Multiplication"] },
              { chapter: "Quadratic Equations", topics: ["Factorization Method", "Completing the Square", "Quadratic Formula", "Nature of Roots"] },
              { chapter: "Arithmetic Progressions", topics: ["nth Term of AP", "Sum of n Terms", "Applications of AP"] },
              { chapter: "Triangles", topics: ["Similar Triangles", "Basic Proportionality Theorem", "Pythagoras Theorem"] },
              { chapter: "Coordinate Geometry", topics: ["Distance Formula", "Section Formula", "Area of Triangle"] },
              { chapter: "Trigonometry", topics: ["Trigonometric Ratios", "Trigonometric Identities", "Heights and Distances"] },
              { chapter: "Circles", topics: ["Tangent to a Circle", "Number of Tangents from a Point"] },
              { chapter: "Statistics", topics: ["Mean", "Median", "Mode", "Ogive Curves"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "Light - Reflection and Refraction", topics: ["Laws of Reflection", "Spherical Mirrors", "Refraction", "Lens Formula"] },
              { chapter: "Human Eye and Colourful World", topics: ["Structure of Eye", "Defects of Vision", "Atmospheric Refraction", "Scattering of Light"] },
              { chapter: "Electricity", topics: ["Electric Current", "Ohm's Law", "Resistance", "Electric Power"] },
              { chapter: "Magnetic Effects of Electric Current", topics: ["Magnetic Field", "Electromagnetic Induction", "Electric Motor", "Generator"] },
              { chapter: "Sources of Energy", topics: ["Conventional Sources", "Non-Conventional Sources", "Environmental Consequences"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "Chemical Reactions and Equations", topics: ["Types of Reactions", "Balancing Equations", "Oxidation and Reduction"] },
              { chapter: "Acids, Bases and Salts", topics: ["Properties of Acids and Bases", "pH Scale", "Preparation of Salts"] },
              { chapter: "Metals and Non-metals", topics: ["Physical Properties", "Chemical Properties", "Reactivity Series", "Extraction of Metals"] },
              { chapter: "Carbon and its Compounds", topics: ["Covalent Bonding", "Hydrocarbons", "Functional Groups", "Soaps and Detergents"] },
              { chapter: "Periodic Classification", topics: ["Mendeleev's Periodic Table", "Modern Periodic Table", "Trends in Periodic Table"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "Life Processes", topics: ["Nutrition", "Respiration", "Transportation", "Excretion"] },
              { chapter: "Control and Coordination", topics: ["Nervous System", "Hormones in Animals", "Plant Hormones"] },
              { chapter: "How do Organisms Reproduce?", topics: ["Asexual Reproduction", "Sexual Reproduction", "Human Reproductive System"] },
              { chapter: "Heredity and Evolution", topics: ["Mendel's Laws", "Sex Determination", "Evolution", "Speciation"] },
              { chapter: "Our Environment", topics: ["Ecosystem Components", "Food Chains", "Ozone Layer", "Waste Management"] },
            ],
          },
        ],
      },
      {
        grade: "Grade 12",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Relations and Functions", topics: ["Types of Relations", "Types of Functions", "Composition of Functions", "Invertible Functions"] },
              { chapter: "Inverse Trigonometric Functions", topics: ["Principal Values", "Properties", "Graphs"] },
              { chapter: "Matrices", topics: ["Types of Matrices", "Operations", "Transpose", "Symmetric Matrices"] },
              { chapter: "Determinants", topics: ["Properties", "Area of Triangle", "Minors and Cofactors", "Inverse of Matrix"] },
              { chapter: "Continuity and Differentiability", topics: ["Continuity", "Differentiability", "Chain Rule", "Implicit Differentiation"] },
              { chapter: "Application of Derivatives", topics: ["Rate of Change", "Tangents and Normals", "Maxima and Minima"] },
              { chapter: "Integrals", topics: ["Indefinite Integrals", "Definite Integrals", "Integration Methods"] },
              { chapter: "Differential Equations", topics: ["Order and Degree", "Formation", "Methods of Solving"] },
              { chapter: "Vectors", topics: ["Vector Operations", "Dot Product", "Cross Product"] },
              { chapter: "Probability", topics: ["Conditional Probability", "Bayes Theorem", "Random Variables"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "Electric Charges and Fields", topics: ["Coulomb's Law", "Electric Field", "Electric Dipole", "Gauss's Law"] },
              { chapter: "Electrostatic Potential", topics: ["Electric Potential", "Equipotential Surfaces", "Capacitance"] },
              { chapter: "Current Electricity", topics: ["Ohm's Law", "Kirchhoff's Rules", "Wheatstone Bridge", "Potentiometer"] },
              { chapter: "Electromagnetic Induction", topics: ["Faraday's Law", "Lenz's Law", "Eddy Currents", "Self and Mutual Inductance"] },
              { chapter: "Atoms", topics: ["Rutherford Model", "Bohr Model", "Hydrogen Spectrum"] },
              { chapter: "Nuclei", topics: ["Nuclear Properties", "Radioactivity", "Nuclear Fission and Fusion"] },
            ],
          },
        ],
      },
    ],
  },
  {
    curriculum: "IGCSE",
    grades: [
      {
        grade: "Grade 10",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Number", topics: ["Types of Numbers", "Indices and Standard Form", "Ratio and Proportion", "Percentages"] },
              { chapter: "Algebra", topics: ["Algebraic Expressions", "Equations", "Inequalities", "Sequences"] },
              { chapter: "Functions", topics: ["Function Notation", "Composite Functions", "Inverse Functions"] },
              { chapter: "Geometry", topics: ["Angles", "Polygons", "Circle Theorems", "Constructions"] },
              { chapter: "Mensuration", topics: ["Area", "Volume", "Surface Area", "Arc Length and Sector Area"] },
              { chapter: "Coordinate Geometry", topics: ["Straight Lines", "Distance and Midpoint", "Equation of a Line"] },
              { chapter: "Trigonometry", topics: ["Sine, Cosine, Tangent", "Sine and Cosine Rules", "3D Trigonometry"] },
              { chapter: "Probability", topics: ["Simple Probability", "Combined Events", "Tree Diagrams"] },
              { chapter: "Statistics", topics: ["Averages", "Cumulative Frequency", "Histograms"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "General Physics", topics: ["Measurement", "Motion", "Mass and Weight", "Density"] },
              { chapter: "Thermal Physics", topics: ["Thermal Expansion", "Heat Capacity", "Melting and Boiling", "Heat Transfer"] },
              { chapter: "Waves", topics: ["Wave Properties", "Light", "Sound", "Electromagnetic Spectrum"] },
              { chapter: "Electricity and Magnetism", topics: ["Static Electricity", "Current Electricity", "Magnetism", "Electromagnetic Effects"] },
              { chapter: "Atomic Physics", topics: ["The Atom", "Radioactivity", "Nuclear Reactions"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "States of Matter", topics: ["Particle Theory", "Changes of State", "Diffusion"] },
              { chapter: "Atomic Structure", topics: ["Atoms and Elements", "Electron Configuration", "Periodic Table"] },
              { chapter: "Chemical Bonding", topics: ["Ionic Bonding", "Covalent Bonding", "Metallic Bonding"] },
              { chapter: "Stoichiometry", topics: ["Moles", "Chemical Equations", "Limiting Reactants"] },
              { chapter: "Electrochemistry", topics: ["Electrolysis", "Electrochemical Cells"] },
              { chapter: "Organic Chemistry", topics: ["Hydrocarbons", "Alcohols", "Polymers"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "Cells", topics: ["Cell Structure", "Cell Division", "Movement In and Out of Cells"] },
              { chapter: "Human Nutrition", topics: ["Digestive System", "Nutrients", "Enzymes"] },
              { chapter: "Transport", topics: ["Blood and Circulation", "Heart Structure", "Transport in Plants"] },
              { chapter: "Respiration", topics: ["Aerobic Respiration", "Anaerobic Respiration", "Gas Exchange"] },
              { chapter: "Reproduction", topics: ["Asexual Reproduction", "Sexual Reproduction in Plants", "Human Reproduction"] },
              { chapter: "Inheritance", topics: ["Chromosomes and Genes", "Monohybrid Inheritance", "Variation"] },
            ],
          },
        ],
      },
    ],
  },
  {
    curriculum: "IB",
    grades: [
      {
        grade: "Grade 11",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Number and Algebra", topics: ["Scientific Notation", "Arithmetic Sequences", "Geometric Sequences", "Compound Interest"] },
              { chapter: "Functions", topics: ["Linear Functions", "Quadratic Functions", "Exponential Functions", "Graphing"] },
              { chapter: "Geometry and Trigonometry", topics: ["Right-Angled Trigonometry", "Non-Right Trigonometry", "Sine and Cosine Rules"] },
              { chapter: "Statistics and Probability", topics: ["Descriptive Statistics", "Regression", "Probability", "Normal Distribution"] },
              { chapter: "Calculus", topics: ["Differentiation", "Integration", "Optimization", "Kinematics"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "Measurements and Uncertainties", topics: ["SI Units", "Uncertainties", "Vectors and Scalars"] },
              { chapter: "Mechanics", topics: ["Motion", "Forces", "Work and Energy", "Momentum"] },
              { chapter: "Thermal Physics", topics: ["Temperature", "Internal Energy", "Specific Heat Capacity"] },
              { chapter: "Waves", topics: ["Wave Behavior", "Standing Waves", "Wave Phenomena"] },
              { chapter: "Electricity and Magnetism", topics: ["Electric Fields", "Electric Current", "Magnetic Fields"] },
              { chapter: "Atomic and Nuclear Physics", topics: ["Discrete Energy", "Nuclear Reactions", "Radioactive Decay"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "Stoichiometric Relationships", topics: ["Mole Concept", "Reacting Masses", "Limiting Reagents"] },
              { chapter: "Atomic Structure", topics: ["Electron Configuration", "Ionization Energy", "Isotopes"] },
              { chapter: "Periodicity", topics: ["Periodic Trends", "Group Properties"] },
              { chapter: "Chemical Bonding", topics: ["Ionic Bonding", "Covalent Bonding", "Intermolecular Forces"] },
              { chapter: "Energetics", topics: ["Enthalpy Changes", "Hess's Law", "Bond Enthalpies"] },
              { chapter: "Chemical Kinetics", topics: ["Rate of Reaction", "Rate Expression", "Activation Energy"] },
              { chapter: "Equilibrium", topics: ["Dynamic Equilibrium", "Le Chatelier's Principle", "Equilibrium Constants"] },
              { chapter: "Acids and Bases", topics: ["pH Scale", "Strong vs Weak Acids", "Buffer Solutions"] },
              { chapter: "Organic Chemistry", topics: ["Functional Groups", "Reactions of Organic Compounds", "Isomerism"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "Cell Biology", topics: ["Cell Theory", "Ultrastructure", "Membrane Transport", "Cell Division"] },
              { chapter: "Molecular Biology", topics: ["DNA Structure", "DNA Replication", "Transcription", "Translation"] },
              { chapter: "Genetics", topics: ["Mendel's Laws", "Meiosis", "Genetic Modification"] },
              { chapter: "Ecology", topics: ["Species and Communities", "Energy Flow", "Carbon Cycling", "Climate Change"] },
              { chapter: "Evolution", topics: ["Evidence for Evolution", "Natural Selection", "Classification"] },
              { chapter: "Human Physiology", topics: ["Digestion", "Blood System", "Defense Against Disease", "Hormones"] },
            ],
          },
        ],
      },
      {
        grade: "Grade 12",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Further Algebra", topics: ["Polynomials", "Complex Numbers", "Mathematical Induction"] },
              { chapter: "Further Functions", topics: ["Rational Functions", "Logarithmic Functions", "Transformations"] },
              { chapter: "Further Calculus", topics: ["Techniques of Integration", "Differential Equations", "Maclaurin Series"] },
              { chapter: "Further Statistics", topics: ["Binomial Distribution", "Poisson Distribution", "Hypothesis Testing"] },
              { chapter: "Vectors", topics: ["Vector Equations of Lines", "Vector Equations of Planes", "Intersections"] },
            ],
          },
        ],
      },
    ],
  },
];

export const getCurriculumTemplates = (curriculum: string, grade: string): CurriculumSubject[] => {
  const curriculumData = CURRICULUM_TEMPLATES.find(c => c.curriculum === curriculum);
  if (!curriculumData) return [];
  
  const gradeData = curriculumData.grades.find(g => g.grade === grade);
  return gradeData?.subjects || [];
};

export const getAvailableCurriculums = (): string[] => {
  return CURRICULUM_TEMPLATES.map(c => c.curriculum);
};

export const getGradesForCurriculum = (curriculum: string): string[] => {
  const curriculumData = CURRICULUM_TEMPLATES.find(c => c.curriculum === curriculum);
  return curriculumData?.grades.map(g => g.grade) || [];
};
