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
  category: 'academic' | 'dental' | 'other';
  grades: {
    grade: string;
    subjects: CurriculumSubject[];
  }[];
}

export const CURRICULUM_TEMPLATES: CurriculumTemplate[] = [
  // ======================= CBSE (India) =======================
  {
    curriculum: "CBSE",
    category: 'academic',
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
        grade: "Grade 11",
        subjects: [
          {
            subject: "Physics",
            chapters: [
              { chapter: "Physical World", topics: ["Scope of Physics", "Nature of Physical Laws", "Fundamental Forces"] },
              { chapter: "Units and Measurements", topics: ["SI Units", "Dimensional Analysis", "Significant Figures", "Errors in Measurement"] },
              { chapter: "Motion in a Straight Line", topics: ["Position and Displacement", "Average and Instantaneous Velocity", "Uniform Acceleration", "Kinematic Equations"] },
              { chapter: "Motion in a Plane", topics: ["Vectors", "Projectile Motion", "Uniform Circular Motion"] },
              { chapter: "Laws of Motion", topics: ["Newton's Laws", "Friction", "Circular Motion Dynamics", "Problem Solving Techniques"] },
              { chapter: "Work, Energy and Power", topics: ["Work-Energy Theorem", "Conservative Forces", "Potential Energy", "Collisions"] },
              { chapter: "Rotational Motion", topics: ["Moment of Inertia", "Angular Momentum", "Torque", "Rolling Motion"] },
              { chapter: "Gravitation", topics: ["Kepler's Laws", "Gravitational Potential Energy", "Escape Velocity", "Satellites"] },
              { chapter: "Mechanical Properties of Solids", topics: ["Stress and Strain", "Hooke's Law", "Elastic Moduli"] },
              { chapter: "Thermodynamics", topics: ["Laws of Thermodynamics", "Heat Engines", "Carnot Cycle", "Entropy"] },
              { chapter: "Oscillations", topics: ["Simple Harmonic Motion", "Damped Oscillations", "Forced Oscillations", "Resonance"] },
              { chapter: "Waves", topics: ["Wave Motion", "Standing Waves", "Beats", "Doppler Effect"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "Some Basic Concepts of Chemistry", topics: ["Mole Concept", "Stoichiometry", "Atomic and Molecular Mass", "Percentage Composition"] },
              { chapter: "Structure of Atom", topics: ["Bohr's Model", "Quantum Mechanical Model", "Electron Configuration", "Quantum Numbers"] },
              { chapter: "Classification of Elements", topics: ["Periodic Table", "Periodic Trends", "Valence and Oxidation States"] },
              { chapter: "Chemical Bonding", topics: ["Ionic Bonding", "Covalent Bonding", "VSEPR Theory", "Molecular Orbital Theory"] },
              { chapter: "States of Matter", topics: ["Gas Laws", "Kinetic Theory", "Liquids and Intermolecular Forces"] },
              { chapter: "Thermodynamics", topics: ["Enthalpy", "Entropy", "Gibbs Free Energy", "Spontaneity"] },
              { chapter: "Equilibrium", topics: ["Le Chatelier's Principle", "Ionic Equilibrium", "pH and Buffer Solutions"] },
              { chapter: "Redox Reactions", topics: ["Oxidation Numbers", "Balancing Redox Reactions", "Electrochemical Cells"] },
              { chapter: "Organic Chemistry - Basic Principles", topics: ["Nomenclature", "Isomerism", "Reaction Mechanisms", "Inductive and Resonance Effects"] },
              { chapter: "Hydrocarbons", topics: ["Alkanes", "Alkenes", "Alkynes", "Aromatic Hydrocarbons"] },
            ],
          },
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Sets", topics: ["Types of Sets", "Venn Diagrams", "Set Operations", "Cartesian Products"] },
              { chapter: "Relations and Functions", topics: ["Domain and Range", "Types of Functions", "Composition of Functions"] },
              { chapter: "Trigonometric Functions", topics: ["Trigonometric Identities", "Trigonometric Equations", "Graphs of Trigonometric Functions"] },
              { chapter: "Complex Numbers", topics: ["Algebra of Complex Numbers", "Polar Form", "Argand Plane"] },
              { chapter: "Linear Inequalities", topics: ["Solving Linear Inequalities", "Graphical Solutions", "System of Inequalities"] },
              { chapter: "Permutations and Combinations", topics: ["Factorial", "Permutations", "Combinations", "Applications"] },
              { chapter: "Binomial Theorem", topics: ["Binomial Expansion", "General Term", "Middle Term", "Applications"] },
              { chapter: "Sequences and Series", topics: ["Arithmetic Progression", "Geometric Progression", "Sum to Infinity"] },
              { chapter: "Straight Lines", topics: ["Slope", "Equations of Lines", "Distance from a Line", "Angle Between Lines"] },
              { chapter: "Conic Sections", topics: ["Circle", "Parabola", "Ellipse", "Hyperbola"] },
              { chapter: "Limits and Derivatives", topics: ["Limits", "Differentiation", "Derivatives of Functions"] },
              { chapter: "Statistics", topics: ["Measures of Dispersion", "Variance", "Standard Deviation"] },
              { chapter: "Probability", topics: ["Random Experiments", "Axiomatic Probability", "Probability of Events"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "The Living World", topics: ["Biodiversity", "Taxonomic Categories", "Taxonomical Aids"] },
              { chapter: "Biological Classification", topics: ["Kingdom Monera", "Kingdom Protista", "Kingdom Fungi", "Kingdom Plantae", "Kingdom Animalia"] },
              { chapter: "Plant Kingdom", topics: ["Algae", "Bryophytes", "Pteridophytes", "Gymnosperms", "Angiosperms"] },
              { chapter: "Animal Kingdom", topics: ["Phylum Porifera", "Phylum Coelenterata", "Phylum Arthropoda", "Phylum Chordata"] },
              { chapter: "Morphology of Flowering Plants", topics: ["Root", "Stem", "Leaf", "Flower", "Fruit"] },
              { chapter: "Anatomy of Flowering Plants", topics: ["Tissues", "Tissue Systems", "Secondary Growth"] },
              { chapter: "Cell: The Unit of Life", topics: ["Cell Theory", "Prokaryotic Cell", "Eukaryotic Cell", "Organelles"] },
              { chapter: "Biomolecules", topics: ["Carbohydrates", "Proteins", "Lipids", "Nucleic Acids", "Enzymes"] },
              { chapter: "Cell Cycle and Cell Division", topics: ["Cell Cycle", "Mitosis", "Meiosis"] },
              { chapter: "Transport in Plants", topics: ["Diffusion", "Osmosis", "Transpiration", "Translocation"] },
              { chapter: "Photosynthesis", topics: ["Light Reactions", "Dark Reactions", "C3 and C4 Pathways", "Photorespiration"] },
              { chapter: "Respiration in Plants", topics: ["Glycolysis", "Krebs Cycle", "Electron Transport Chain"] },
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
              { chapter: "Three Dimensional Geometry", topics: ["Direction Cosines", "Equation of Line", "Equation of Plane"] },
              { chapter: "Linear Programming", topics: ["Graphical Method", "Simplex Method", "Optimization Problems"] },
              { chapter: "Probability", topics: ["Conditional Probability", "Bayes Theorem", "Random Variables", "Probability Distributions"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "Electric Charges and Fields", topics: ["Coulomb's Law", "Electric Field", "Electric Dipole", "Gauss's Law"] },
              { chapter: "Electrostatic Potential", topics: ["Electric Potential", "Equipotential Surfaces", "Capacitance"] },
              { chapter: "Current Electricity", topics: ["Ohm's Law", "Kirchhoff's Rules", "Wheatstone Bridge", "Potentiometer"] },
              { chapter: "Moving Charges and Magnetism", topics: ["Magnetic Force", "Biot-Savart Law", "Ampere's Law"] },
              { chapter: "Magnetism and Matter", topics: ["Magnetic Properties", "Diamagnetism", "Paramagnetism", "Ferromagnetism"] },
              { chapter: "Electromagnetic Induction", topics: ["Faraday's Law", "Lenz's Law", "Eddy Currents", "Self and Mutual Inductance"] },
              { chapter: "Alternating Current", topics: ["AC Circuits", "LCR Circuits", "Power in AC", "Transformers"] },
              { chapter: "Electromagnetic Waves", topics: ["Displacement Current", "EM Spectrum", "Properties of EM Waves"] },
              { chapter: "Ray Optics", topics: ["Reflection", "Refraction", "Optical Instruments", "Prism"] },
              { chapter: "Wave Optics", topics: ["Interference", "Diffraction", "Polarization"] },
              { chapter: "Dual Nature of Matter", topics: ["Photoelectric Effect", "de Broglie Wavelength", "Davisson-Germer Experiment"] },
              { chapter: "Atoms", topics: ["Rutherford Model", "Bohr Model", "Hydrogen Spectrum"] },
              { chapter: "Nuclei", topics: ["Nuclear Properties", "Radioactivity", "Nuclear Fission and Fusion"] },
              { chapter: "Semiconductor Electronics", topics: ["p-n Junction", "Diodes", "Transistors", "Logic Gates"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "Solid State", topics: ["Crystal Lattices", "Unit Cells", "Defects in Solids", "Electrical Properties"] },
              { chapter: "Solutions", topics: ["Types of Solutions", "Concentration Terms", "Colligative Properties", "Osmotic Pressure"] },
              { chapter: "Electrochemistry", topics: ["Electrochemical Cells", "Nernst Equation", "Electrolysis", "Batteries"] },
              { chapter: "Chemical Kinetics", topics: ["Rate of Reaction", "Order of Reaction", "Activation Energy", "Collision Theory"] },
              { chapter: "Surface Chemistry", topics: ["Adsorption", "Catalysis", "Colloids", "Emulsions"] },
              { chapter: "p-Block Elements", topics: ["Group 15 Elements", "Group 16 Elements", "Group 17 Elements", "Group 18 Elements"] },
              { chapter: "d and f Block Elements", topics: ["Transition Elements", "Lanthanoids", "Actinoids", "Coordination Compounds"] },
              { chapter: "Coordination Compounds", topics: ["Werner's Theory", "IUPAC Nomenclature", "Isomerism", "Bonding Theories"] },
              { chapter: "Haloalkanes and Haloarenes", topics: ["Nomenclature", "Reactions", "SN1 and SN2 Mechanisms"] },
              { chapter: "Alcohols, Phenols and Ethers", topics: ["Preparation", "Properties", "Reactions"] },
              { chapter: "Aldehydes, Ketones and Carboxylic Acids", topics: ["Nomenclature", "Preparation", "Reactions"] },
              { chapter: "Amines", topics: ["Classification", "Preparation", "Properties", "Diazonium Salts"] },
              { chapter: "Biomolecules", topics: ["Carbohydrates", "Proteins", "Vitamins", "Nucleic Acids"] },
              { chapter: "Polymers", topics: ["Classification", "Addition Polymers", "Condensation Polymers", "Biodegradable Polymers"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "Reproduction in Organisms", topics: ["Asexual Reproduction", "Sexual Reproduction", "Post-fertilization Events"] },
              { chapter: "Sexual Reproduction in Flowering Plants", topics: ["Flower Structure", "Pollination", "Fertilization", "Seed Development"] },
              { chapter: "Human Reproduction", topics: ["Male Reproductive System", "Female Reproductive System", "Gametogenesis", "Menstrual Cycle"] },
              { chapter: "Reproductive Health", topics: ["Birth Control", "STDs", "Infertility", "Assisted Reproductive Technologies"] },
              { chapter: "Principles of Inheritance", topics: ["Mendelian Genetics", "Chromosomal Theory", "Linkage and Crossing Over", "Sex Determination"] },
              { chapter: "Molecular Basis of Inheritance", topics: ["DNA Structure", "Replication", "Transcription", "Translation", "Gene Regulation"] },
              { chapter: "Evolution", topics: ["Origin of Life", "Evidence of Evolution", "Natural Selection", "Human Evolution"] },
              { chapter: "Human Health and Disease", topics: ["Common Diseases", "Immunity", "AIDS", "Cancer", "Drugs and Alcohol Abuse"] },
              { chapter: "Microbes in Human Welfare", topics: ["Microbes in Household Products", "Industrial Applications", "Biogas", "Biocontrol Agents"] },
              { chapter: "Biotechnology Principles and Processes", topics: ["Genetic Engineering", "rDNA Technology", "PCR", "Gel Electrophoresis"] },
              { chapter: "Biotechnology and its Applications", topics: ["Transgenic Animals", "GM Crops", "Gene Therapy", "Bioethics"] },
              { chapter: "Organisms and Populations", topics: ["Organism and Environment", "Population Attributes", "Population Interactions"] },
              { chapter: "Ecosystem", topics: ["Structure and Function", "Productivity", "Nutrient Cycling", "Ecological Succession"] },
              { chapter: "Biodiversity and Conservation", topics: ["Biodiversity", "Threats to Biodiversity", "Conservation Strategies"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= IGCSE =======================
  {
    curriculum: "IGCSE",
    category: 'academic',
    grades: [
      {
        grade: "Grade 9",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Number", topics: ["Integers and Decimals", "Fractions", "Percentages", "Ratios", "Standard Form"] },
              { chapter: "Algebra", topics: ["Algebraic Expressions", "Linear Equations", "Formulae", "Indices"] },
              { chapter: "Geometry", topics: ["Angles", "Polygons", "Symmetry", "Constructions"] },
              { chapter: "Mensuration", topics: ["Perimeter", "Area", "Volume", "Surface Area"] },
              { chapter: "Statistics", topics: ["Data Collection", "Averages", "Charts and Graphs"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "General Physics", topics: ["Length and Time", "Motion", "Mass and Weight", "Density"] },
              { chapter: "Thermal Physics", topics: ["Simple Kinetic Molecular Model", "Thermal Properties", "Thermal Processes"] },
              { chapter: "Properties of Waves", topics: ["General Wave Properties", "Light", "Electromagnetic Spectrum", "Sound"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "States of Matter", topics: ["Solids, Liquids and Gases", "Particle Theory", "Diffusion"] },
              { chapter: "Atoms, Elements and Compounds", topics: ["Atomic Structure", "Elements and Compounds", "Ionic and Covalent Bonding"] },
              { chapter: "Stoichiometry", topics: ["Formulae", "Equations", "Mole Concept"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "Characteristics of Living Organisms", topics: ["Life Processes", "Classification"] },
              { chapter: "Cells", topics: ["Cell Structure", "Cell Division", "Movement of Substances"] },
              { chapter: "Enzymes", topics: ["Enzyme Structure", "Factors Affecting Enzyme Activity"] },
            ],
          },
        ],
      },
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

  // ======================= IB (International Baccalaureate) =======================
  {
    curriculum: "IB",
    category: 'academic',
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
          {
            subject: "Physics",
            chapters: [
              { chapter: "Circular Motion and Gravitation", topics: ["Uniform Circular Motion", "Newton's Law of Gravitation", "Orbital Motion"] },
              { chapter: "Atomic, Nuclear and Particle Physics", topics: ["Energy Levels", "Nuclear Physics", "Fundamental Particles"] },
              { chapter: "Energy Production", topics: ["Energy Sources", "Thermal Energy Transfer", "Nuclear Power"] },
              { chapter: "Astrophysics", topics: ["Stellar Quantities", "Stellar Evolution", "Cosmology"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "Redox Processes", topics: ["Oxidation and Reduction", "Electrochemical Cells", "Electrolysis"] },
              { chapter: "Organic Chemistry", topics: ["Types of Reactions", "Reaction Pathways", "Stereochemistry"] },
              { chapter: "Measurement and Analysis", topics: ["Spectroscopy", "Chromatography"] },
              { chapter: "Biochemistry", topics: ["Proteins", "Lipids", "Vitamins", "Environmental Chemistry"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "Nucleic Acids", topics: ["DNA Replication Details", "Transcription", "Translation", "Gene Expression"] },
              { chapter: "Metabolism", topics: ["Photosynthesis", "Cellular Respiration", "Metabolic Pathways"] },
              { chapter: "Plant Biology", topics: ["Plant Transport", "Plant Growth", "Reproduction in Plants"] },
              { chapter: "Animal Physiology", topics: ["Antibody Production", "Movement", "Hormones and Homeostasis"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= AP (Advanced Placement - USA) =======================
  {
    curriculum: "AP",
    category: 'academic',
    grades: [
      {
        grade: "AP Level",
        subjects: [
          {
            subject: "AP Calculus AB",
            chapters: [
              { chapter: "Limits and Continuity", topics: ["Definition of Limits", "Properties of Limits", "Continuity", "Intermediate Value Theorem"] },
              { chapter: "Differentiation: Definition and Fundamental Properties", topics: ["Definition of Derivative", "Basic Differentiation Rules", "Product and Quotient Rules"] },
              { chapter: "Differentiation: Composite, Implicit, and Inverse Functions", topics: ["Chain Rule", "Implicit Differentiation", "Derivatives of Inverse Functions"] },
              { chapter: "Contextual Applications of Differentiation", topics: ["Related Rates", "Linear Approximation", "L'Hôpital's Rule"] },
              { chapter: "Analytical Applications of Differentiation", topics: ["Mean Value Theorem", "Extreme Values", "Concavity", "Curve Sketching"] },
              { chapter: "Integration and Accumulation of Change", topics: ["Riemann Sums", "Fundamental Theorem of Calculus", "Properties of Definite Integrals"] },
              { chapter: "Differential Equations", topics: ["Slope Fields", "Separation of Variables", "Exponential Models"] },
              { chapter: "Applications of Integration", topics: ["Area Between Curves", "Volumes of Revolution", "Average Value of a Function"] },
            ],
          },
          {
            subject: "AP Calculus BC",
            chapters: [
              { chapter: "All AB Topics", topics: ["Limits", "Differentiation", "Integration", "Differential Equations"] },
              { chapter: "Parametric Equations", topics: ["Parametric Functions", "Derivatives of Parametric Functions", "Arc Length"] },
              { chapter: "Polar Functions", topics: ["Polar Coordinates", "Area in Polar Coordinates", "Polar Derivatives"] },
              { chapter: "Vector-Valued Functions", topics: ["Vector Functions", "Derivatives and Integrals of Vectors", "Motion in Space"] },
              { chapter: "Infinite Sequences and Series", topics: ["Convergence Tests", "Taylor Series", "Maclaurin Series", "Power Series"] },
            ],
          },
          {
            subject: "AP Physics 1",
            chapters: [
              { chapter: "Kinematics", topics: ["Motion in One Dimension", "Motion in Two Dimensions", "Projectile Motion"] },
              { chapter: "Dynamics", topics: ["Newton's Laws", "Forces", "Friction", "Circular Motion"] },
              { chapter: "Circular Motion and Gravitation", topics: ["Uniform Circular Motion", "Newton's Law of Gravitation"] },
              { chapter: "Energy", topics: ["Work", "Kinetic Energy", "Potential Energy", "Conservation of Energy"] },
              { chapter: "Momentum", topics: ["Impulse", "Linear Momentum", "Conservation of Momentum", "Collisions"] },
              { chapter: "Simple Harmonic Motion", topics: ["Oscillations", "Springs", "Pendulums"] },
              { chapter: "Torque and Rotational Motion", topics: ["Torque", "Angular Momentum", "Rotational Kinematics"] },
            ],
          },
          {
            subject: "AP Physics 2",
            chapters: [
              { chapter: "Fluids", topics: ["Pressure", "Buoyancy", "Fluid Dynamics", "Bernoulli's Equation"] },
              { chapter: "Thermodynamics", topics: ["Heat and Temperature", "Laws of Thermodynamics", "Heat Engines"] },
              { chapter: "Electric Force, Field, and Potential", topics: ["Coulomb's Law", "Electric Field", "Electric Potential"] },
              { chapter: "Electric Circuits", topics: ["Current", "Resistance", "Capacitors", "RC Circuits"] },
              { chapter: "Magnetism and Electromagnetic Induction", topics: ["Magnetic Fields", "Magnetic Forces", "Faraday's Law"] },
              { chapter: "Geometric and Physical Optics", topics: ["Reflection", "Refraction", "Interference", "Diffraction"] },
              { chapter: "Quantum, Atomic, and Nuclear Physics", topics: ["Photoelectric Effect", "Atomic Models", "Nuclear Reactions"] },
            ],
          },
          {
            subject: "AP Physics C: Mechanics",
            chapters: [
              { chapter: "Kinematics", topics: ["Motion with Calculus", "Vectors", "Relative Motion"] },
              { chapter: "Newton's Laws of Motion", topics: ["Force and Acceleration", "Friction", "Drag Forces"] },
              { chapter: "Work, Energy, and Power", topics: ["Work-Energy Theorem", "Conservative Forces", "Power"] },
              { chapter: "Systems of Particles and Linear Momentum", topics: ["Center of Mass", "Impulse", "Collisions"] },
              { chapter: "Rotation", topics: ["Rotational Kinematics", "Rotational Dynamics", "Angular Momentum"] },
              { chapter: "Oscillations", topics: ["Simple Harmonic Motion", "Physical Pendulum", "Damped Oscillations"] },
              { chapter: "Gravitation", topics: ["Newton's Law of Gravitation", "Orbital Motion", "Energy in Orbits"] },
            ],
          },
          {
            subject: "AP Physics C: Electricity and Magnetism",
            chapters: [
              { chapter: "Electrostatics", topics: ["Coulomb's Law", "Electric Field", "Gauss's Law", "Electric Potential"] },
              { chapter: "Conductors, Capacitors, Dielectrics", topics: ["Conductors", "Capacitance", "Dielectrics", "Energy Storage"] },
              { chapter: "Electric Circuits", topics: ["Current", "Resistance", "DC Circuits", "RC Circuits"] },
              { chapter: "Magnetic Fields", topics: ["Biot-Savart Law", "Ampere's Law", "Magnetic Forces"] },
              { chapter: "Electromagnetism", topics: ["Faraday's Law", "Inductance", "LR Circuits", "Maxwell's Equations"] },
            ],
          },
          {
            subject: "AP Chemistry",
            chapters: [
              { chapter: "Atomic Structure and Properties", topics: ["Atomic Models", "Electron Configuration", "Periodic Trends", "Spectroscopy"] },
              { chapter: "Molecular and Ionic Compound Structure and Properties", topics: ["Chemical Bonding", "Lewis Structures", "VSEPR Theory", "Hybridization"] },
              { chapter: "Intermolecular Forces and Properties", topics: ["Intermolecular Forces", "Phase Diagrams", "Solutions", "Separation Techniques"] },
              { chapter: "Chemical Reactions", topics: ["Physical and Chemical Changes", "Stoichiometry", "Types of Reactions"] },
              { chapter: "Kinetics", topics: ["Reaction Rate", "Rate Laws", "Reaction Mechanisms", "Catalysis"] },
              { chapter: "Thermodynamics", topics: ["Enthalpy", "Entropy", "Gibbs Free Energy", "Equilibrium"] },
              { chapter: "Equilibrium", topics: ["Chemical Equilibrium", "Le Chatelier's Principle", "Acid-Base Equilibrium", "Solubility"] },
              { chapter: "Acids and Bases", topics: ["Brønsted-Lowry Theory", "pH Calculations", "Buffers", "Titrations"] },
              { chapter: "Applications of Thermodynamics", topics: ["Electrochemistry", "Batteries", "Electrolysis", "Thermodynamic Calculations"] },
            ],
          },
          {
            subject: "AP Biology",
            chapters: [
              { chapter: "Chemistry of Life", topics: ["Water", "Carbon Chemistry", "Macromolecules"] },
              { chapter: "Cell Structure and Function", topics: ["Cell Components", "Cell Membranes", "Cell Communication"] },
              { chapter: "Cellular Energetics", topics: ["Enzymes", "Photosynthesis", "Cellular Respiration"] },
              { chapter: "Cell Communication and Cell Cycle", topics: ["Signal Transduction", "Cell Cycle", "Mitosis and Meiosis"] },
              { chapter: "Heredity", topics: ["Mendelian Genetics", "Non-Mendelian Genetics", "Chromosomal Inheritance"] },
              { chapter: "Gene Expression and Regulation", topics: ["DNA Replication", "Transcription", "Translation", "Gene Regulation"] },
              { chapter: "Natural Selection", topics: ["Evidence for Evolution", "Mechanisms of Evolution", "Hardy-Weinberg Equilibrium"] },
              { chapter: "Ecology", topics: ["Population Ecology", "Community Ecology", "Ecosystems", "Biodiversity"] },
            ],
          },
          {
            subject: "AP Computer Science A",
            chapters: [
              { chapter: "Primitive Types", topics: ["Variables", "Data Types", "Expressions", "Assignment"] },
              { chapter: "Using Objects", topics: ["Objects and Classes", "Methods", "Strings", "Wrapper Classes"] },
              { chapter: "Boolean Expressions and if Statements", topics: ["Boolean Logic", "Conditionals", "Comparing Objects"] },
              { chapter: "Iteration", topics: ["While Loops", "For Loops", "Nested Loops", "Informal Code Analysis"] },
              { chapter: "Writing Classes", topics: ["Anatomy of a Class", "Constructors", "Encapsulation", "Static Variables"] },
              { chapter: "Array", topics: ["Array Creation", "Traversing Arrays", "Enhanced For Loop", "Array Algorithms"] },
              { chapter: "ArrayList", topics: ["ArrayList Methods", "Traversing ArrayLists", "ArrayList Algorithms"] },
              { chapter: "2D Array", topics: ["2D Array Creation", "Traversing 2D Arrays", "2D Array Algorithms"] },
              { chapter: "Inheritance", topics: ["Superclasses and Subclasses", "Overriding Methods", "Polymorphism"] },
              { chapter: "Recursion", topics: ["Recursive Methods", "Recursive Search", "Recursive Sort"] },
            ],
          },
          {
            subject: "AP English Language",
            chapters: [
              { chapter: "Rhetorical Situation", topics: ["Purpose", "Audience", "Context", "Exigence"] },
              { chapter: "Claims and Evidence", topics: ["Thesis Statements", "Types of Evidence", "Reasoning", "Line of Reasoning"] },
              { chapter: "Reasoning and Organization", topics: ["Methods of Development", "Organizing an Argument", "Transitions"] },
              { chapter: "Style", topics: ["Word Choice", "Syntax", "Figurative Language", "Tone"] },
            ],
          },
          {
            subject: "AP English Literature",
            chapters: [
              { chapter: "Short Fiction", topics: ["Character Analysis", "Setting", "Plot Structure", "Narrative Perspective"] },
              { chapter: "Poetry", topics: ["Poetic Structure", "Figurative Language", "Imagery", "Tone and Theme"] },
              { chapter: "Longer Fiction or Drama", topics: ["Character Development", "Conflict", "Symbolism", "Thematic Analysis"] },
            ],
          },
          {
            subject: "AP US History",
            chapters: [
              { chapter: "Period 1: 1491-1607", topics: ["Native American Societies", "European Exploration", "Columbian Exchange"] },
              { chapter: "Period 2: 1607-1754", topics: ["Colonial America", "Transatlantic Trade", "Colonial Society"] },
              { chapter: "Period 3: 1754-1800", topics: ["French and Indian War", "American Revolution", "Early Republic"] },
              { chapter: "Period 4: 1800-1848", topics: ["Jeffersonian Era", "Market Revolution", "Jacksonian Democracy", "Manifest Destiny"] },
              { chapter: "Period 5: 1844-1877", topics: ["Causes of Civil War", "Civil War", "Reconstruction"] },
              { chapter: "Period 6: 1865-1898", topics: ["Gilded Age", "Industrialization", "Westward Expansion", "Immigration"] },
              { chapter: "Period 7: 1890-1945", topics: ["Progressive Era", "World War I", "Great Depression", "World War II"] },
              { chapter: "Period 8: 1945-1980", topics: ["Cold War", "Civil Rights Movement", "Vietnam War", "Social Movements"] },
              { chapter: "Period 9: 1980-Present", topics: ["Conservative Resurgence", "End of Cold War", "21st Century Challenges"] },
            ],
          },
          {
            subject: "AP World History",
            chapters: [
              { chapter: "Unit 1: The Global Tapestry (1200-1450)", topics: ["Song Dynasty", "Mongol Empire", "Islamic Empires", "African Kingdoms"] },
              { chapter: "Unit 2: Networks of Exchange (1200-1450)", topics: ["Silk Roads", "Indian Ocean Trade", "Trans-Saharan Trade"] },
              { chapter: "Unit 3: Land-Based Empires (1450-1750)", topics: ["Ottoman Empire", "Safavid Empire", "Mughal Empire", "Ming and Qing China"] },
              { chapter: "Unit 4: Transoceanic Interconnections (1450-1750)", topics: ["European Exploration", "Columbian Exchange", "Atlantic Slave Trade"] },
              { chapter: "Unit 5: Revolutions (1750-1900)", topics: ["Enlightenment", "American Revolution", "French Revolution", "Industrial Revolution"] },
              { chapter: "Unit 6: Consequences of Industrialization (1750-1900)", topics: ["Imperialism", "Economic Changes", "Social Changes"] },
              { chapter: "Unit 7: Global Conflict (1900-Present)", topics: ["World War I", "World War II", "Cold War", "Decolonization"] },
              { chapter: "Unit 8: Cold War and Decolonization (1900-Present)", topics: ["Superpower Rivalry", "Independence Movements", "Regional Conflicts"] },
              { chapter: "Unit 9: Globalization (1900-Present)", topics: ["Economic Globalization", "Cultural Exchange", "Environmental Challenges"] },
            ],
          },
          {
            subject: "AP Psychology",
            chapters: [
              { chapter: "Scientific Foundations of Psychology", topics: ["History of Psychology", "Research Methods", "Statistics"] },
              { chapter: "Biological Bases of Behavior", topics: ["Neural Processing", "The Brain", "Genetics and Behavior"] },
              { chapter: "Sensation and Perception", topics: ["Sensory Processes", "Perceptual Organization", "Attention"] },
              { chapter: "Learning", topics: ["Classical Conditioning", "Operant Conditioning", "Cognitive Learning"] },
              { chapter: "Cognitive Psychology", topics: ["Memory", "Thinking and Problem Solving", "Language"] },
              { chapter: "Developmental Psychology", topics: ["Lifespan Development", "Cognitive Development", "Social Development"] },
              { chapter: "Motivation, Emotion, and Personality", topics: ["Theories of Motivation", "Emotion", "Personality Theories"] },
              { chapter: "Clinical Psychology", topics: ["Psychological Disorders", "Treatment of Disorders", "Social Psychology"] },
              { chapter: "Social Psychology", topics: ["Attribution", "Attitudes", "Conformity and Obedience", "Group Dynamics"] },
            ],
          },
          {
            subject: "AP Economics",
            chapters: [
              { chapter: "Basic Economic Concepts", topics: ["Scarcity", "Opportunity Cost", "Production Possibilities", "Comparative Advantage"] },
              { chapter: "Supply and Demand", topics: ["Demand", "Supply", "Market Equilibrium", "Elasticity"] },
              { chapter: "Production, Cost, and Perfect Competition", topics: ["Production Function", "Costs", "Perfect Competition"] },
              { chapter: "Imperfect Competition", topics: ["Monopoly", "Oligopoly", "Monopolistic Competition", "Game Theory"] },
              { chapter: "Factor Markets", topics: ["Labor Markets", "Capital Markets", "Income Distribution"] },
              { chapter: "Market Failure and the Role of Government", topics: ["Externalities", "Public Goods", "Government Intervention"] },
              { chapter: "Macroeconomic Measures", topics: ["GDP", "Inflation", "Unemployment", "Business Cycle"] },
              { chapter: "National Income and Price Determination", topics: ["Aggregate Demand", "Aggregate Supply", "Fiscal Policy"] },
              { chapter: "Financial Sector", topics: ["Money and Banking", "Monetary Policy", "Interest Rates"] },
              { chapter: "International Economics", topics: ["Balance of Payments", "Exchange Rates", "Trade Policy"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= A-Levels (UK) =======================
  {
    curriculum: "A-Levels",
    category: 'academic',
    grades: [
      {
        grade: "AS Level",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Pure Mathematics 1", topics: ["Algebraic Expressions", "Quadratics", "Equations and Inequalities", "Graphs and Transformations"] },
              { chapter: "Pure Mathematics 2", topics: ["Coordinate Geometry", "Trigonometry", "Logarithms", "Differentiation"] },
              { chapter: "Statistics", topics: ["Statistical Sampling", "Data Presentation", "Probability", "Statistical Distributions"] },
              { chapter: "Mechanics", topics: ["Quantities and Units", "Kinematics", "Forces and Newton's Laws"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "Measurements and Errors", topics: ["SI Units", "Estimation", "Errors and Uncertainties"] },
              { chapter: "Particles and Radiation", topics: ["Constituents of the Atom", "Stable and Unstable Nuclei", "Particles and Antiparticles", "Particle Interactions"] },
              { chapter: "Waves", topics: ["Progressive Waves", "Longitudinal and Transverse Waves", "Superposition", "Interference"] },
              { chapter: "Mechanics and Materials", topics: ["Scalars and Vectors", "Moments", "Motion Along a Straight Line", "Newton's Laws", "Bulk Properties of Solids"] },
              { chapter: "Electricity", topics: ["Current Electricity", "Potential Difference", "Resistance", "Electrical Circuits"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "Physical Chemistry 1", topics: ["Atomic Structure", "Amount of Substance", "Bonding", "Energetics", "Kinetics", "Equilibria"] },
              { chapter: "Inorganic Chemistry 1", topics: ["Periodicity", "Group 2", "Group 7"] },
              { chapter: "Organic Chemistry 1", topics: ["Introduction to Organic Chemistry", "Alkanes", "Halogenoalkanes", "Alkenes", "Alcohols", "Organic Analysis"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "Biological Molecules", topics: ["Monomers and Polymers", "Carbohydrates", "Lipids", "Proteins", "Nucleic Acids", "Enzymes"] },
              { chapter: "Cells", topics: ["Cell Structure", "All Cells Arise from Other Cells", "Transport Across Cell Membranes", "Cell Recognition and the Immune System"] },
              { chapter: "Organisms Exchange Substances", topics: ["Surface Area to Volume Ratio", "Gas Exchange", "Digestion and Absorption", "Mass Transport"] },
              { chapter: "Genetic Information", topics: ["DNA, Genes and Chromosomes", "DNA and Protein Synthesis", "Genetic Diversity", "Biodiversity"] },
            ],
          },
          {
            subject: "Computer Science",
            chapters: [
              { chapter: "Fundamentals of Programming", topics: ["Data Types", "Programming Constructs", "Subroutines", "Recursion"] },
              { chapter: "Fundamentals of Data Structures", topics: ["Arrays", "Records", "Stacks", "Queues", "Trees", "Hash Tables"] },
              { chapter: "Fundamentals of Algorithms", topics: ["Graph Traversal", "Searching Algorithms", "Sorting Algorithms"] },
              { chapter: "Theory of Computation", topics: ["Abstraction", "Regular Languages", "Context-Free Languages", "Turing Machines"] },
            ],
          },
          {
            subject: "Economics",
            chapters: [
              { chapter: "Microeconomics", topics: ["The Economic Problem", "Price Determination", "Production and Costs", "Market Structures"] },
              { chapter: "Macroeconomics", topics: ["Measures of Economic Performance", "Aggregate Demand and Supply", "Economic Objectives", "Fiscal Policy"] },
            ],
          },
        ],
      },
      {
        grade: "A2 Level",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Pure Mathematics 3", topics: ["Algebra and Functions", "Trigonometry", "Exponentials and Logarithms", "Differentiation", "Integration"] },
              { chapter: "Pure Mathematics 4", topics: ["Binomial Expansion", "Sequences and Series", "Numerical Methods", "Vectors"] },
              { chapter: "Further Statistics", topics: ["Discrete Random Variables", "Poisson Distribution", "Hypothesis Testing", "Chi-Squared Tests"] },
              { chapter: "Further Mechanics", topics: ["Momentum and Impulse", "Work, Energy and Power", "Collisions"] },
            ],
          },
          {
            subject: "Further Mathematics",
            chapters: [
              { chapter: "Complex Numbers", topics: ["Argand Diagrams", "Modulus-Argument Form", "De Moivre's Theorem", "Roots of Unity"] },
              { chapter: "Matrices", topics: ["Matrix Operations", "Determinants", "Inverse Matrices", "Linear Transformations"] },
              { chapter: "Further Calculus", topics: ["Improper Integrals", "Volumes of Revolution", "Mean Value of a Function"] },
              { chapter: "Polar Coordinates", topics: ["Polar Curves", "Areas", "Tangents"] },
              { chapter: "Hyperbolic Functions", topics: ["Definitions", "Differentiation", "Integration"] },
              { chapter: "Differential Equations", topics: ["First Order", "Second Order", "Modeling"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "Further Mechanics", topics: ["Circular Motion", "Simple Harmonic Motion", "Simple Harmonic Systems"] },
              { chapter: "Thermal Physics", topics: ["Thermal Energy Transfer", "Ideal Gases", "Molecular Kinetic Theory"] },
              { chapter: "Fields", topics: ["Gravitational Fields", "Electric Fields", "Capacitance", "Magnetic Fields"] },
              { chapter: "Nuclear Physics", topics: ["Radioactivity", "Nuclear Energy", "Binding Energy", "Nuclear Fission and Fusion"] },
              { chapter: "Optional Topics", topics: ["Astrophysics", "Medical Physics", "Engineering Physics", "Turning Points in Physics"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "Physical Chemistry 2", topics: ["Thermodynamics", "Rate Equations", "Equilibrium Constant Kp", "Electrode Potentials", "Acids and Bases"] },
              { chapter: "Inorganic Chemistry 2", topics: ["Properties of Period 3 Elements", "Transition Metals", "Reactions of Ions in Aqueous Solution"] },
              { chapter: "Organic Chemistry 2", topics: ["Optical Isomerism", "Aldehydes and Ketones", "Carboxylic Acids", "Aromatic Chemistry", "Amines", "Polymers", "Amino Acids and Proteins", "Organic Synthesis", "NMR Spectroscopy", "Chromatography"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "Energy Transfers", topics: ["Photosynthesis", "Respiration", "Energy and Ecosystems", "Nutrient Cycles"] },
              { chapter: "Organisms Respond to Changes", topics: ["Stimuli and Responses", "Nervous Coordination", "Skeletal Muscles", "Homeostasis"] },
              { chapter: "Genetics, Populations and Ecosystems", topics: ["Inheritance", "Populations", "Evolution", "Populations in Ecosystems"] },
              { chapter: "Control of Gene Expression", topics: ["Gene Mutations", "Gene Expression", "Using Genome Projects", "Gene Technology"] },
            ],
          },
          {
            subject: "Computer Science",
            chapters: [
              { chapter: "Fundamentals of Data Representation", topics: ["Number Systems", "Binary Arithmetic", "Information Coding", "Digital Images", "Digital Sound"] },
              { chapter: "Fundamentals of Computer Systems", topics: ["Hardware and Software", "Classification of Software", "Software Development", "Types of Programming Language"] },
              { chapter: "Fundamentals of Computer Organisation", topics: ["Internal Hardware", "The Processor", "The Fetch-Execute Cycle", "Processor Performance"] },
              { chapter: "Consequences of Uses of Computing", topics: ["Moral, Ethical, Legal and Cultural Issues", "Privacy and Security"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= GCSE (UK) =======================
  {
    curriculum: "GCSE",
    category: 'academic',
    grades: [
      {
        grade: "Year 10",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Number", topics: ["Integers and Place Value", "Decimals", "Indices and Roots", "Factors and Multiples", "Fractions", "Percentages", "Ratio and Proportion"] },
              { chapter: "Algebra", topics: ["Algebraic Notation", "Equations", "Sequences", "Graphs"] },
              { chapter: "Geometry", topics: ["Properties of Shapes", "Angles", "Transformations", "Perimeter, Area and Volume"] },
              { chapter: "Statistics and Probability", topics: ["Collecting Data", "Representing Data", "Analysing Data", "Probability"] },
            ],
          },
          {
            subject: "English Language",
            chapters: [
              { chapter: "Reading Skills", topics: ["Inference", "Language Analysis", "Structure Analysis", "Comparison"] },
              { chapter: "Writing Skills", topics: ["Narrative Writing", "Descriptive Writing", "Persuasive Writing", "SPAG"] },
            ],
          },
          {
            subject: "Combined Science",
            chapters: [
              { chapter: "Biology 1", topics: ["Cell Structure", "Organisation", "Infection and Response", "Bioenergetics"] },
              { chapter: "Chemistry 1", topics: ["Atomic Structure", "The Periodic Table", "Bonding", "Quantitative Chemistry", "Chemical Changes"] },
              { chapter: "Physics 1", topics: ["Energy", "Electricity", "Particle Model", "Atomic Structure"] },
            ],
          },
        ],
      },
      {
        grade: "Year 11",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Higher Number", topics: ["Surds", "Bounds", "Recurring Decimals", "Standard Form"] },
              { chapter: "Higher Algebra", topics: ["Quadratic Equations", "Simultaneous Equations", "Inequalities", "Functions", "Algebraic Fractions"] },
              { chapter: "Higher Geometry", topics: ["Circle Theorems", "Trigonometry", "Vectors", "Similarity and Congruence"] },
              { chapter: "Higher Statistics", topics: ["Histograms", "Cumulative Frequency", "Box Plots", "Sampling"] },
            ],
          },
          {
            subject: "English Literature",
            chapters: [
              { chapter: "Shakespeare", topics: ["Macbeth", "Romeo and Juliet", "The Merchant of Venice", "Much Ado About Nothing"] },
              { chapter: "19th Century Novel", topics: ["A Christmas Carol", "The Sign of Four", "The Strange Case of Dr Jekyll and Mr Hyde", "Great Expectations"] },
              { chapter: "Modern Text", topics: ["An Inspector Calls", "Lord of the Flies", "Animal Farm", "Blood Brothers"] },
              { chapter: "Poetry", topics: ["Power and Conflict", "Love and Relationships", "Unseen Poetry"] },
            ],
          },
          {
            subject: "Combined Science",
            chapters: [
              { chapter: "Biology 2", topics: ["Homeostasis", "Inheritance", "Variation", "Evolution", "Ecology"] },
              { chapter: "Chemistry 2", topics: ["Energy Changes", "Rates of Reaction", "Organic Chemistry", "Chemical Analysis", "Chemistry of the Atmosphere", "Using Resources"] },
              { chapter: "Physics 2", topics: ["Forces", "Waves", "Magnetism", "Space"] },
            ],
          },
          {
            subject: "History",
            chapters: [
              { chapter: "Medicine Through Time", topics: ["Medieval Medicine", "Renaissance Medicine", "Industrial Revolution Medicine", "Modern Medicine"] },
              { chapter: "Weimar and Nazi Germany", topics: ["The Weimar Republic", "Hitler's Rise to Power", "Nazi Control", "Life in Nazi Germany"] },
              { chapter: "Cold War", topics: ["Origins of the Cold War", "Cold War Crises", "End of the Cold War"] },
            ],
          },
          {
            subject: "Geography",
            chapters: [
              { chapter: "Physical Geography", topics: ["The Challenge of Natural Hazards", "Physical Landscapes in the UK", "The Living World"] },
              { chapter: "Human Geography", topics: ["Urban Issues and Challenges", "The Changing Economic World", "Resource Management"] },
              { chapter: "Geographical Skills", topics: ["Cartographic Skills", "Graphical Skills", "Statistical Skills", "Fieldwork"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= Cambridge International (CAIE) =======================
  {
    curriculum: "Cambridge",
    category: 'academic',
    grades: [
      {
        grade: "AS Level",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Pure Mathematics 1", topics: ["Quadratics", "Functions", "Coordinate Geometry", "Circular Measure", "Trigonometry", "Series", "Differentiation", "Integration"] },
              { chapter: "Probability and Statistics 1", topics: ["Representation of Data", "Permutations and Combinations", "Probability", "Discrete Random Variables", "Normal Distribution"] },
              { chapter: "Mechanics 1", topics: ["Forces and Equilibrium", "Kinematics of Motion", "Newton's Laws of Motion", "Energy, Work and Power"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "Physical Quantities and Units", topics: ["Physical Quantities", "SI Units", "Scalars and Vectors"] },
              { chapter: "Measurement Techniques", topics: ["Measurements", "Errors and Uncertainties"] },
              { chapter: "Kinematics", topics: ["Equations of Motion", "Graphical Analysis", "Projectile Motion"] },
              { chapter: "Dynamics", topics: ["Newton's Laws", "Momentum", "Collisions"] },
              { chapter: "Forces, Density and Pressure", topics: ["Types of Force", "Density", "Pressure in Fluids"] },
              { chapter: "Work, Energy and Power", topics: ["Work Done", "Kinetic Energy", "Potential Energy", "Power and Efficiency"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "Atoms, Molecules and Stoichiometry", topics: ["Atomic Structure", "Mole Concept", "Chemical Formulae and Equations"] },
              { chapter: "Atomic Structure", topics: ["Electrons in Atoms", "Ionisation Energy", "Electron Configuration"] },
              { chapter: "Chemical Bonding", topics: ["Ionic Bonding", "Covalent Bonding", "Metallic Bonding", "Intermolecular Forces"] },
              { chapter: "States of Matter", topics: ["Gases", "Liquids", "Solids"] },
              { chapter: "Chemical Energetics", topics: ["Enthalpy Changes", "Hess's Law", "Bond Energies"] },
              { chapter: "Electrochemistry", topics: ["Redox Reactions", "Electrolysis"] },
              { chapter: "Equilibria", topics: ["Chemical Equilibrium", "Le Chatelier's Principle"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "Cell Structure", topics: ["Cell Ultrastructure", "Cell Division", "Cell Cycle"] },
              { chapter: "Biological Molecules", topics: ["Carbohydrates", "Lipids", "Proteins", "Nucleic Acids", "Water"] },
              { chapter: "Enzymes", topics: ["Mode of Action", "Factors Affecting Enzyme Action"] },
              { chapter: "Cell Membranes and Transport", topics: ["Membrane Structure", "Movement Across Membranes"] },
              { chapter: "The Mitotic Cell Cycle", topics: ["Chromosomes", "Mitosis", "Roles of Mitosis"] },
            ],
          },
        ],
      },
      {
        grade: "A Level",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Pure Mathematics 2", topics: ["Algebra", "Logarithmic and Exponential Functions", "Trigonometry", "Differentiation", "Integration"] },
              { chapter: "Pure Mathematics 3", topics: ["Numerical Solution of Equations", "Vectors", "Differential Equations", "Complex Numbers"] },
              { chapter: "Probability and Statistics 2", topics: ["Poisson Distribution", "Linear Combinations", "Continuous Random Variables", "Sampling", "Hypothesis Testing"] },
              { chapter: "Mechanics 2", topics: ["Motion of Projectiles", "Equilibrium of Rigid Bodies", "Circular Motion", "Hooke's Law", "Work and Energy"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "Motion in a Circle", topics: ["Uniform Circular Motion", "Centripetal Acceleration", "Centripetal Force"] },
              { chapter: "Gravitational Fields", topics: ["Newton's Law of Gravitation", "Gravitational Field Strength", "Gravitational Potential"] },
              { chapter: "Temperature", topics: ["Thermal Equilibrium", "Temperature Scales", "Thermometers"] },
              { chapter: "Ideal Gases", topics: ["Gas Laws", "Kinetic Theory", "Pressure"] },
              { chapter: "Thermodynamics", topics: ["Internal Energy", "First Law", "Heat Engines"] },
              { chapter: "Oscillations", topics: ["Simple Harmonic Motion", "Energy in SHM", "Damping", "Resonance"] },
              { chapter: "Electric Fields", topics: ["Electric Field Strength", "Electric Potential", "Capacitance"] },
              { chapter: "Capacitance", topics: ["Capacitors in Circuits", "Energy Storage", "Time Constant"] },
              { chapter: "Magnetic Fields", topics: ["Magnetic Force", "Magnetic Flux", "Electromagnetic Induction"] },
              { chapter: "Nuclear Physics", topics: ["Mass Defect", "Binding Energy", "Radioactive Decay"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "Reaction Kinetics", topics: ["Rate Equations", "Order of Reaction", "Arrhenius Equation", "Catalysis"] },
              { chapter: "Equilibria", topics: ["Equilibrium Constant", "Ionic Equilibria", "Solubility Product", "Buffer Solutions"] },
              { chapter: "Enthalpy, Entropy and Free Energy", topics: ["Lattice Energy", "Born-Haber Cycles", "Entropy", "Gibbs Free Energy"] },
              { chapter: "Electrochemistry", topics: ["Standard Electrode Potentials", "Electrochemical Cells", "Electrolysis Calculations"] },
              { chapter: "Transition Elements", topics: ["Physical and Chemical Properties", "Complex Ions", "Ligand Substitution", "Redox Reactions"] },
              { chapter: "Organic Chemistry", topics: ["Arenes", "Aldehydes and Ketones", "Carboxylic Acids", "Esters", "Nitrogen Compounds", "Polymerisation"] },
              { chapter: "Analytical Techniques", topics: ["Mass Spectrometry", "Infrared Spectroscopy", "NMR Spectroscopy", "Chromatography"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "Energy and Respiration", topics: ["Cellular Respiration", "ATP Production", "Respiratory Substrates"] },
              { chapter: "Photosynthesis", topics: ["Light-Dependent Stage", "Light-Independent Stage", "Limiting Factors"] },
              { chapter: "Homeostasis", topics: ["Control Systems", "Control of Blood Glucose", "Control of Body Temperature"] },
              { chapter: "Coordination", topics: ["Nervous System", "Endocrine System", "Synaptic Transmission"] },
              { chapter: "Inherited Change", topics: ["Meiosis", "Genetic Diagrams", "Gene Mutations", "Natural Selection"] },
              { chapter: "Selection and Evolution", topics: ["Evidence for Evolution", "Speciation", "Artificial Selection"] },
              { chapter: "Biodiversity, Classification and Conservation", topics: ["Biodiversity", "Classification", "Conservation Strategies"] },
              { chapter: "Genetic Technology", topics: ["Gene Technology", "Genetic Engineering", "GM Organisms", "Gene Therapy"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= Edexcel International =======================
  {
    curriculum: "Edexcel",
    category: 'academic',
    grades: [
      {
        grade: "IGCSE",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Numbers and the Number System", topics: ["Integers", "Fractions", "Decimals", "Powers and Roots", "Standard Form"] },
              { chapter: "Equations, Formulae and Identities", topics: ["Algebraic Manipulation", "Linear Equations", "Quadratic Equations", "Simultaneous Equations"] },
              { chapter: "Sequences, Functions and Graphs", topics: ["Sequences", "Function Notation", "Linear Graphs", "Quadratic Graphs", "Other Graphs"] },
              { chapter: "Geometry", topics: ["Angles", "Polygons", "Circles", "Constructions", "Transformations"] },
              { chapter: "Vectors and Transformation Geometry", topics: ["Vector Notation", "Vector Operations", "Translations", "Enlargements"] },
              { chapter: "Statistics and Probability", topics: ["Statistical Measures", "Data Representation", "Probability", "Combined Events"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "Forces and Motion", topics: ["Movement and Position", "Forces and Shape", "Forces and Movement", "Momentum"] },
              { chapter: "Electricity", topics: ["Mains Electricity", "Energy and Potential Difference", "Electric Circuits", "Electrical Safety"] },
              { chapter: "Waves", topics: ["Properties of Waves", "The Electromagnetic Spectrum", "Light and Sound"] },
              { chapter: "Energy Resources and Energy Transfer", topics: ["Energy Transfers", "Work and Power", "Energy Resources and Electricity Generation"] },
              { chapter: "Solids, Liquids and Gases", topics: ["Density and Pressure", "Change of State", "Ideal Gas Molecules"] },
              { chapter: "Magnetism and Electromagnetism", topics: ["Magnetism", "Electromagnetism", "Electromagnetic Induction"] },
              { chapter: "Radioactivity and Particles", topics: ["Radioactivity", "Particles", "Nuclear Fission and Fusion"] },
              { chapter: "Astrophysics", topics: ["Motion in the Universe", "Stellar Evolution", "Cosmology"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "Principles of Chemistry", topics: ["States of Matter", "Atoms", "Atomic Structure", "The Periodic Table", "Chemical Formulae and Equations", "Ionic Bonding", "Covalent Bonding", "Metallic Bonding", "Electrolysis"] },
              { chapter: "Inorganic Chemistry", topics: ["Group 1 Elements", "Group 7 Elements", "Gases in the Atmosphere", "Reactivity Series", "Extraction and Uses of Metals", "Acids, Alkalis and Salts", "Preparation of Salts"] },
              { chapter: "Physical Chemistry", topics: ["Energetics", "Rates of Reaction", "Reversible Reactions and Equilibria"] },
              { chapter: "Organic Chemistry", topics: ["Introduction to Organic Chemistry", "Crude Oil and Fuels", "Alkanes and Alkenes", "Alcohols", "Carboxylic Acids", "Polymers"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "The Nature and Variety of Living Organisms", topics: ["Characteristics of Living Organisms", "Variety of Living Organisms"] },
              { chapter: "Structure and Function in Living Organisms", topics: ["Cell Structure", "Biological Molecules", "Movement of Substances", "Nutrition", "Respiration", "Gas Exchange", "Transport", "Excretion", "Coordination and Response"] },
              { chapter: "Reproduction and Inheritance", topics: ["Reproduction", "Inheritance", "Variation and Selection"] },
              { chapter: "Ecology and the Environment", topics: ["The Organism in the Environment", "Feeding Relationships", "Cycles within Ecosystems", "Human Influences on the Environment"] },
            ],
          },
        ],
      },
      {
        grade: "AS Level",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Pure Mathematics", topics: ["Proof", "Algebra and Functions", "Coordinate Geometry", "Sequences and Series", "Trigonometry", "Exponentials and Logarithms", "Differentiation", "Integration"] },
              { chapter: "Statistics", topics: ["Statistical Sampling", "Data Presentation", "Probability", "Statistical Distributions", "Statistical Hypothesis Testing"] },
              { chapter: "Mechanics", topics: ["Quantities and Units", "Kinematics", "Forces and Newton's Laws", "Moments"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "Working as a Physicist", topics: ["SI Units", "Estimation", "Experimental Techniques"] },
              { chapter: "Mechanics", topics: ["Rectilinear Motion", "Projectile Motion", "Newton's Laws", "Momentum", "Work and Energy"] },
              { chapter: "Electric Circuits", topics: ["Charge and Current", "Potential Difference and EMF", "Resistance", "Electrical Circuits"] },
              { chapter: "Materials", topics: ["Fluids", "Solid Materials", "Stress-Strain Graphs"] },
              { chapter: "Waves and Particle Nature of Light", topics: ["Wave Motion", "Electromagnetic Waves", "Superposition", "Photoelectric Effect"] },
            ],
          },
        ],
      },
      {
        grade: "A Level",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Pure Mathematics", topics: ["Proof", "Algebra and Functions", "Coordinate Geometry", "Sequences and Series", "Trigonometry", "Exponentials and Logarithms", "Differentiation", "Integration", "Numerical Methods", "Vectors"] },
              { chapter: "Statistics", topics: ["Probability", "Statistical Distributions", "Hypothesis Testing", "Correlation and Regression"] },
              { chapter: "Mechanics", topics: ["Kinematics", "Forces and Newton's Laws", "Moments", "Projectiles", "Application of Forces", "Further Kinematics"] },
            ],
          },
          {
            subject: "Physics",
            chapters: [
              { chapter: "Further Mechanics", topics: ["Impulse", "Circular Motion", "Oscillations"] },
              { chapter: "Electric and Magnetic Fields", topics: ["Electric Fields", "Capacitors", "Magnetic Fields", "Electromagnetic Induction"] },
              { chapter: "Nuclear and Particle Physics", topics: ["Radioactivity", "Particle Physics", "Nuclear Energy"] },
              { chapter: "Thermodynamics", topics: ["Heat and Temperature", "Specific Heat Capacity", "Internal Energy", "Gas Laws"] },
              { chapter: "Space", topics: ["Gravitational Fields", "Stars", "Cosmology"] },
              { chapter: "Nuclear Radiation", topics: ["Radioactive Decay", "Half-life", "Nuclear Fission and Fusion"] },
              { chapter: "Gravitational Fields", topics: ["Newton's Law of Gravitation", "Gravitational Field Strength", "Orbits"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= German Abitur =======================
  {
    curriculum: "German Abitur",
    category: 'academic',
    grades: [
      {
        grade: "Qualifikationsphase 1",
        subjects: [
          {
            subject: "Mathematik",
            chapters: [
              { chapter: "Analysis I", topics: ["Funktionen und ihre Eigenschaften", "Differentialrechnung", "Grundlegende Ableitungsregeln", "Anwendungen der Ableitung", "Kurvendiskussion"] },
              { chapter: "Analytische Geometrie I", topics: ["Vektoren im Raum", "Geraden und Ebenen", "Lagebeziehungen", "Abstandsberechnungen"] },
              { chapter: "Stochastik I", topics: ["Wahrscheinlichkeitsrechnung", "Bedingte Wahrscheinlichkeit", "Unabhängigkeit", "Kombinatorik"] },
            ],
          },
          {
            subject: "Physik",
            chapters: [
              { chapter: "Mechanik", topics: ["Kinematik", "Dynamik", "Energie und Impuls", "Kreisbewegung", "Gravitation"] },
              { chapter: "Elektrodynamik I", topics: ["Elektrisches Feld", "Potenzial und Spannung", "Kondensatoren", "Elektrischer Stromkreis"] },
            ],
          },
          {
            subject: "Chemie",
            chapters: [
              { chapter: "Organische Chemie I", topics: ["Kohlenwasserstoffe", "Alkohole und Ether", "Aldehyde und Ketone", "Carbonsäuren und Ester"] },
              { chapter: "Reaktionskinetik", topics: ["Reaktionsgeschwindigkeit", "Einflussfaktoren", "Katalyse", "Reaktionsmechanismen"] },
              { chapter: "Chemisches Gleichgewicht", topics: ["Gleichgewichtsreaktionen", "Massenwirkungsgesetz", "Le Chatelier'sches Prinzip"] },
            ],
          },
          {
            subject: "Biologie",
            chapters: [
              { chapter: "Genetik", topics: ["DNA-Struktur und Replikation", "Proteinbiosynthese", "Mutationen", "Gentechnik"] },
              { chapter: "Neurobiologie", topics: ["Nervenzellen", "Erregungsleitung", "Synapsen", "Sinnesorgane"] },
            ],
          },
          {
            subject: "Deutsch",
            chapters: [
              { chapter: "Literatur der Aufklärung", topics: ["Lessings Dramen", "Aufklärungsphilosophie", "Literarische Formen"] },
              { chapter: "Klassik und Romantik", topics: ["Goethes Werke", "Schillers Dramen", "Romantische Lyrik", "Märchen und Novellen"] },
              { chapter: "Sprachliche Analyse", topics: ["Rhetorische Mittel", "Textanalyse", "Argumentation"] },
            ],
          },
          {
            subject: "Englisch",
            chapters: [
              { chapter: "American Dream", topics: ["History and Myth", "Immigration", "Social Mobility", "Contemporary Issues"] },
              { chapter: "Shakespeare", topics: ["Drama Analysis", "Historical Context", "Character Study", "Themes and Motifs"] },
            ],
          },
        ],
      },
      {
        grade: "Qualifikationsphase 2",
        subjects: [
          {
            subject: "Mathematik",
            chapters: [
              { chapter: "Analysis II", topics: ["Integralrechnung", "Bestimmte Integrale", "Flächenberechnung", "Rotationskörper", "Wachstumsprozesse"] },
              { chapter: "Analytische Geometrie II", topics: ["Ebenen im Raum", "Schnittwinkel", "Spiegelungen", "Matrizenrechnung"] },
              { chapter: "Stochastik II", topics: ["Binomialverteilung", "Normalverteilung", "Hypothesentests", "Konfidenzintervalle"] },
            ],
          },
          {
            subject: "Physik",
            chapters: [
              { chapter: "Elektrodynamik II", topics: ["Magnetisches Feld", "Elektromagnetische Induktion", "Wechselstrom", "Schwingkreis"] },
              { chapter: "Quantenphysik", topics: ["Photoeffekt", "Welleneigenschaften von Teilchen", "Atomphysik", "Unschärferelation"] },
              { chapter: "Atom- und Kernphysik", topics: ["Atomaufbau", "Radioaktivität", "Kernspaltung und Kernfusion", "Strahlenschutz"] },
            ],
          },
          {
            subject: "Chemie",
            chapters: [
              { chapter: "Elektrochemie", topics: ["Redoxreaktionen", "Galvanische Zellen", "Elektrolyse", "Batterien und Akkus"] },
              { chapter: "Organische Chemie II", topics: ["Aromaten", "Kunststoffe und Polymere", "Farbstoffe", "Biomoleküle"] },
              { chapter: "Säure-Base-Chemie", topics: ["pH-Wert und Puffer", "Titration", "Indikatoren", "Säure-Base-Gleichgewichte"] },
            ],
          },
          {
            subject: "Biologie",
            chapters: [
              { chapter: "Ökologie", topics: ["Ökosysteme", "Stoffkreisläufe", "Populationsökologie", "Umweltprobleme"] },
              { chapter: "Evolution", topics: ["Evolutionstheorie", "Artbildung", "Evolutionsfaktoren", "Humanevolution"] },
              { chapter: "Verhaltensbiologie", topics: ["Angeborenes Verhalten", "Lernverhalten", "Sozialverhalten", "Kommunikation"] },
            ],
          },
          {
            subject: "Deutsch",
            chapters: [
              { chapter: "Literatur des 20. Jahrhunderts", topics: ["Expressionismus", "Nachkriegsliteratur", "DDR-Literatur", "Gegenwartsliteratur"] },
              { chapter: "Medien und Kommunikation", topics: ["Medienanalyse", "Rhetorik", "Sprachentwicklung", "Kommunikationsmodelle"] },
            ],
          },
          {
            subject: "Informatik",
            chapters: [
              { chapter: "Algorithmen und Datenstrukturen", topics: ["Sortieralgorithmen", "Suchalgorithmen", "Rekursion", "Komplexitätsanalyse"] },
              { chapter: "Objektorientierte Programmierung", topics: ["Klassen und Objekte", "Vererbung", "Polymorphismus", "Design Patterns"] },
              { chapter: "Datenbanken", topics: ["ER-Modelle", "SQL", "Normalisierung", "Datenbankdesign"] },
              { chapter: "Theoretische Informatik", topics: ["Automatentheorie", "Formale Sprachen", "Berechenbarkeit", "Komplexitätstheorie"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= French Baccalauréat =======================
  {
    curriculum: "French Baccalauréat",
    category: 'academic',
    grades: [
      {
        grade: "Première",
        subjects: [
          {
            subject: "Mathématiques",
            chapters: [
              { chapter: "Analyse", topics: ["Second degré", "Dérivation", "Variations et extremums", "Suites numériques"] },
              { chapter: "Géométrie", topics: ["Calcul vectoriel", "Produit scalaire", "Géométrie repérée"] },
              { chapter: "Probabilités et Statistiques", topics: ["Variables aléatoires", "Loi binomiale", "Échantillonnage"] },
              { chapter: "Algorithmique", topics: ["Instructions conditionnelles", "Boucles", "Fonctions"] },
            ],
          },
          {
            subject: "Physique-Chimie",
            chapters: [
              { chapter: "Constitution et transformations de la matière", topics: ["Structure de la matière", "Réactions chimiques", "Synthèse organique"] },
              { chapter: "Mouvement et interactions", topics: ["Description du mouvement", "Forces et interactions", "Énergie mécanique"] },
              { chapter: "L'énergie: conversions et transferts", topics: ["Formes d'énergie", "Transferts thermiques", "Bilan énergétique"] },
              { chapter: "Ondes et signaux", topics: ["Ondes mécaniques", "La lumière", "Signaux électriques"] },
            ],
          },
          {
            subject: "Sciences de la Vie et de la Terre",
            chapters: [
              { chapter: "La Terre, la vie et l'organisation du vivant", topics: ["Transmission, variation et expression du patrimoine génétique", "La dynamique interne de la Terre"] },
              { chapter: "Enjeux contemporains de la planète", topics: ["Écosystèmes et services écosystémiques", "L'humanité et les écosystèmes"] },
              { chapter: "Corps humain et santé", topics: ["Variations génétiques et santé", "Le fonctionnement du système immunitaire humain"] },
            ],
          },
          {
            subject: "Français",
            chapters: [
              { chapter: "La poésie du XIXe au XXIe siècle", topics: ["Le romantisme", "Le Parnasse", "Le symbolisme", "Poésie moderne"] },
              { chapter: "La littérature d'idées du XVIe au XVIIIe siècle", topics: ["L'humanisme", "Les Lumières", "L'argumentation"] },
              { chapter: "Le roman et le récit du Moyen Âge au XXIe siècle", topics: ["L'évolution du genre romanesque", "Les formes du récit"] },
              { chapter: "Le théâtre du XVIIe au XXIe siècle", topics: ["La comédie", "La tragédie", "Le drame moderne"] },
            ],
          },
          {
            subject: "Histoire-Géographie",
            chapters: [
              { chapter: "Nations, empires, nationalités (1789-1918)", topics: ["L'Europe bouleversée par la Révolution française", "Nationalités et nationalismes", "La Première Guerre mondiale"] },
              { chapter: "La multiplication des acteurs internationaux", topics: ["La puissance des États-Unis", "La Chine", "Acteurs non étatiques"] },
              { chapter: "Les espaces ruraux", topics: ["Fragmentation et recomposition", "La France: les mutations des espaces ruraux"] },
            ],
          },
        ],
      },
      {
        grade: "Terminale",
        subjects: [
          {
            subject: "Mathématiques",
            chapters: [
              { chapter: "Analyse avancée", topics: ["Limites et continuité", "Logarithme népérien", "Fonction exponentielle", "Intégration"] },
              { chapter: "Géométrie dans l'espace", topics: ["Vecteurs de l'espace", "Droites et plans", "Orthogonalité"] },
              { chapter: "Probabilités", topics: ["Indépendance", "Lois continues", "Loi normale", "Estimation"] },
              { chapter: "Suites", topics: ["Raisonnement par récurrence", "Limites de suites", "Suites arithmético-géométriques"] },
            ],
          },
          {
            subject: "Physique-Chimie",
            chapters: [
              { chapter: "Constitution et transformations de la matière", topics: ["Évolution d'un système chimique", "Acides et bases", "Oxydoréduction"] },
              { chapter: "Mouvement et interactions", topics: ["Lois de Newton", "Mouvement dans un champ uniforme", "Énergie mécanique"] },
              { chapter: "L'énergie: conversions et transferts", topics: ["Thermodynamique", "Transferts thermiques", "Machines thermiques"] },
              { chapter: "Ondes et signaux", topics: ["Caractéristiques des ondes", "Interférences", "Effet Doppler", "Ondes électromagnétiques"] },
            ],
          },
          {
            subject: "Sciences de la Vie et de la Terre",
            chapters: [
              { chapter: "Génétique et évolution", topics: ["L'origine du génotype des individus", "La complexification des génomes", "L'évolution humaine"] },
              { chapter: "À la recherche du passé géologique de notre planète", topics: ["Le temps et les roches", "Les traces du passé mouvementé de la Terre"] },
              { chapter: "De la plante sauvage à la plante domestiquée", topics: ["La plante, productrice de matière organique", "Reproduction de la plante et vie fixée"] },
              { chapter: "Comportements, mouvement et système nerveux", topics: ["Le cerveau", "Le mouvement", "Comportements et stress"] },
            ],
          },
          {
            subject: "Philosophie",
            chapters: [
              { chapter: "Le sujet", topics: ["La conscience", "L'inconscient", "Le désir", "La liberté"] },
              { chapter: "La culture", topics: ["L'art", "Le langage", "La technique", "Le travail", "La religion"] },
              { chapter: "La raison et le réel", topics: ["La démonstration", "L'interprétation", "La théorie et l'expérience", "La vérité"] },
              { chapter: "La politique", topics: ["La justice", "L'État", "Le devoir", "Le bonheur"] },
              { chapter: "La morale", topics: ["La liberté", "Le devoir", "Le bonheur"] },
            ],
          },
          {
            subject: "Sciences Économiques et Sociales",
            chapters: [
              { chapter: "Science économique", topics: ["Croissance économique", "Commerce international", "Crises financières", "Politiques économiques"] },
              { chapter: "Sociologie et science politique", topics: ["Structure sociale", "Mobilité sociale", "Action collective", "Vote et comportement politique"] },
              { chapter: "Regards croisés", topics: ["Travail et emploi", "Justice sociale et inégalités", "Action publique pour l'environnement"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= Dutch VWO =======================
  {
    curriculum: "Dutch VWO",
    category: 'academic',
    grades: [
      {
        grade: "VWO 5",
        subjects: [
          {
            subject: "Wiskunde A",
            chapters: [
              { chapter: "Analyse", topics: ["Functies en grafieken", "Differentiëren", "Statistiek", "Kansrekening"] },
              { chapter: "Statistiek", topics: ["Verdelingen", "Toetsen", "Betrouwbaarheidsintervallen", "Correlatie en regressie"] },
            ],
          },
          {
            subject: "Wiskunde B",
            chapters: [
              { chapter: "Analyse", topics: ["Functies en grafieken", "Differentiëren", "Integreren", "Differentiaalvergelijkingen"] },
              { chapter: "Meetkunde", topics: ["Vectoren", "Lijnen en vlakken", "Coördinaten in de ruimte"] },
              { chapter: "Goniometrie", topics: ["Goniometrische functies", "Vergelijkingen", "Somformules"] },
            ],
          },
          {
            subject: "Natuurkunde",
            chapters: [
              { chapter: "Mechanica", topics: ["Kinematica", "Dynamica", "Arbeid en energie", "Impuls"] },
              { chapter: "Elektriciteit", topics: ["Elektrische schakelingen", "Elektromagnetisme", "Inductie"] },
              { chapter: "Golven", topics: ["Golfverschijnselen", "Licht", "Geluid"] },
            ],
          },
          {
            subject: "Scheikunde",
            chapters: [
              { chapter: "Structuur van stoffen", topics: ["Atoombouw", "Bindingen", "Molecuulstructuur"] },
              { chapter: "Reacties", topics: ["Reactiekinetiek", "Chemisch evenwicht", "Zuur-base reacties", "Redoxreacties"] },
              { chapter: "Organische chemie", topics: ["Koolwaterstoffen", "Zuurstofhoudende verbindingen", "Polymeren"] },
            ],
          },
          {
            subject: "Biologie",
            chapters: [
              { chapter: "Evolutie", topics: ["Evolutietheorie", "Soortvorming", "Moleculaire evolutie"] },
              { chapter: "Erfelijkheid", topics: ["DNA en genen", "Overerving", "Genetische modificatie"] },
              { chapter: "Ecologie", topics: ["Ecosystemen", "Populatiedynamica", "Stofkringlopen"] },
            ],
          },
          {
            subject: "Nederlands",
            chapters: [
              { chapter: "Literatuur", topics: ["Literaire stromingen", "Tekstanalyse", "Schrijvers en werken"] },
              { chapter: "Taalbeheersing", topics: ["Argumenteren", "Schrijfvaardigheden", "Presenteren"] },
            ],
          },
          {
            subject: "Engels",
            chapters: [
              { chapter: "Reading Comprehension", topics: ["Academic Texts", "Literary Analysis", "Critical Reading"] },
              { chapter: "Writing Skills", topics: ["Essay Writing", "Argumentation", "Academic Style"] },
              { chapter: "Literature", topics: ["Literary Periods", "Novel Analysis", "Poetry and Drama"] },
            ],
          },
        ],
      },
      {
        grade: "VWO 6",
        subjects: [
          {
            subject: "Wiskunde A",
            chapters: [
              { chapter: "Verdieping statistiek", topics: ["Toetsen", "Chi-kwadraattoets", "Correlatie en regressie", "Voorspellen"] },
              { chapter: "Verdieping kansrekening", topics: ["Verwachtingswaarde", "Standaardafwijking", "Binomiale verdeling", "Normale verdeling"] },
            ],
          },
          {
            subject: "Wiskunde B",
            chapters: [
              { chapter: "Verdieping analyse", topics: ["Primitieve functies", "Toepassingen van integreren", "Reeksen en limieten"] },
              { chapter: "Complexe getallen", topics: ["Rekenen met complexe getallen", "Complexe vergelijkingen", "Toepassingen"] },
            ],
          },
          {
            subject: "Natuurkunde",
            chapters: [
              { chapter: "Quantummechanica", topics: ["Foto-elektrisch effect", "Golfkarakter van deeltjes", "Onzekerheidsrelatie"] },
              { chapter: "Atoom- en kernfysica", topics: ["Atoommodel", "Radioactiviteit", "Kernreacties"] },
              { chapter: "Relativiteitstheorie", topics: ["Speciale relativiteit", "Tijddilatatie", "Lengtecontractie", "Massa-energie equivalentie"] },
            ],
          },
          {
            subject: "Scheikunde",
            chapters: [
              { chapter: "Elektrochemie", topics: ["Galvanische cellen", "Elektrolyse", "Corrosie", "Batterijen"] },
              { chapter: "Biochemie", topics: ["Eiwitten", "Enzymen", "Metabolisme"] },
              { chapter: "Industriële chemie", topics: ["Productieprocessen", "Groene chemie", "Duurzaamheid"] },
            ],
          },
          {
            subject: "Biologie",
            chapters: [
              { chapter: "Mens en gezondheid", topics: ["Voeding en vertering", "Hart en bloedsomloop", "Afweer"] },
              { chapter: "Voortplanting en ontwikkeling", topics: ["Voortplanting bij dieren", "Embryonale ontwikkeling", "Hormonale regulatie"] },
              { chapter: "Gedrag", topics: ["Gedragsbiologie", "Leergedrag", "Sociaal gedrag"] },
            ],
          },
          {
            subject: "Economie",
            chapters: [
              { chapter: "Macro-economie", topics: ["Economische groei", "Conjunctuur", "Overheidsbeleid", "Internationale handel"] },
              { chapter: "Micro-economie", topics: ["Marktvormen", "Prijsvorming", "Consumentengedrag", "Producentengedrag"] },
            ],
          },
          {
            subject: "Informatica",
            chapters: [
              { chapter: "Programmeren", topics: ["Algoritmen", "Datastructuren", "Object-georiënteerd programmeren"] },
              { chapter: "Databases", topics: ["Relationele databases", "SQL", "Normaliseren"] },
              { chapter: "Netwerken", topics: ["Protocollen", "Beveiliging", "Internet"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= State Board (Generic India) =======================
  {
    curriculum: "State Board",
    category: 'academic',
    grades: [
      {
        grade: "Class 9",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Number Systems", topics: ["Natural Numbers", "Whole Numbers", "Integers", "Rational Numbers", "Irrational Numbers", "Real Numbers"] },
              { chapter: "Algebra", topics: ["Polynomials", "Linear Equations in Two Variables", "Factorization"] },
              { chapter: "Geometry", topics: ["Lines and Angles", "Triangles", "Quadrilaterals", "Circles", "Constructions"] },
              { chapter: "Mensuration", topics: ["Areas", "Surface Areas and Volumes", "Heron's Formula"] },
              { chapter: "Statistics and Probability", topics: ["Collection of Data", "Presentation of Data", "Probability"] },
            ],
          },
          {
            subject: "Science",
            chapters: [
              { chapter: "Physics", topics: ["Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound"] },
              { chapter: "Chemistry", topics: ["Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of Atom"] },
              { chapter: "Biology", topics: ["The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms", "Why Do We Fall Ill", "Natural Resources", "Improvement in Food Resources"] },
            ],
          },
          {
            subject: "English",
            chapters: [
              { chapter: "Grammar", topics: ["Tenses", "Voice", "Narration", "Subject-Verb Agreement", "Prepositions"] },
              { chapter: "Writing", topics: ["Letter Writing", "Essay Writing", "Story Writing", "Notice and Message"] },
              { chapter: "Literature", topics: ["Prose", "Poetry", "Drama", "Supplementary Reader"] },
            ],
          },
          {
            subject: "Social Science",
            chapters: [
              { chapter: "History", topics: ["French Revolution", "Russian Revolution", "Nazism", "Forest Society and Colonialism", "Pastoralists in the Modern World"] },
              { chapter: "Geography", topics: ["India - Size and Location", "Physical Features of India", "Drainage", "Climate", "Natural Vegetation and Wildlife"] },
              { chapter: "Civics", topics: ["What is Democracy", "Constitutional Design", "Electoral Politics", "Working of Institutions", "Democratic Rights"] },
              { chapter: "Economics", topics: ["The Story of Village Palampur", "People as Resource", "Poverty as a Challenge", "Food Security in India"] },
            ],
          },
        ],
      },
      {
        grade: "Class 10",
        subjects: [
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Real Numbers", topics: ["Euclid's Division Lemma", "Fundamental Theorem of Arithmetic", "Irrational Numbers", "Decimal Representation"] },
              { chapter: "Polynomials", topics: ["Geometrical Meaning of Zeros", "Relationship Between Zeros and Coefficients", "Division Algorithm"] },
              { chapter: "Pair of Linear Equations", topics: ["Graphical Method", "Algebraic Methods", "Equations Reducible to Linear Equations"] },
              { chapter: "Quadratic Equations", topics: ["Standard Form", "Solution by Factorization", "Completing the Square", "Nature of Roots"] },
              { chapter: "Arithmetic Progressions", topics: ["nth Term", "Sum of n Terms", "Applications"] },
              { chapter: "Triangles", topics: ["Similar Triangles", "Criteria for Similarity", "Areas of Similar Triangles", "Pythagoras Theorem"] },
              { chapter: "Coordinate Geometry", topics: ["Distance Formula", "Section Formula", "Area of Triangle"] },
              { chapter: "Trigonometry", topics: ["Trigonometric Ratios", "Trigonometric Ratios of Complementary Angles", "Trigonometric Identities"] },
              { chapter: "Applications of Trigonometry", topics: ["Heights and Distances", "Angle of Elevation", "Angle of Depression"] },
              { chapter: "Circles", topics: ["Tangent to a Circle", "Number of Tangents from a Point Outside Circle"] },
              { chapter: "Constructions", topics: ["Division of Line Segment", "Construction of Tangents"] },
              { chapter: "Areas Related to Circles", topics: ["Perimeter and Area of Circle", "Areas of Sector and Segment"] },
              { chapter: "Surface Areas and Volumes", topics: ["Combination of Solids", "Conversion of Shapes", "Frustum of Cone"] },
              { chapter: "Statistics", topics: ["Mean of Grouped Data", "Mode of Grouped Data", "Median of Grouped Data", "Ogives"] },
              { chapter: "Probability", topics: ["Classical Definition", "Simple Problems on Probability"] },
            ],
          },
          {
            subject: "Science",
            chapters: [
              { chapter: "Physics", topics: ["Light - Reflection and Refraction", "Human Eye and Colourful World", "Electricity", "Magnetic Effects of Current", "Sources of Energy"] },
              { chapter: "Chemistry", topics: ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification of Elements"] },
              { chapter: "Biology", topics: ["Life Processes", "Control and Coordination", "How do Organisms Reproduce", "Heredity and Evolution", "Our Environment", "Management of Natural Resources"] },
            ],
          },
          {
            subject: "English",
            chapters: [
              { chapter: "Grammar", topics: ["Tenses", "Modals", "Subject-Verb Agreement", "Determiners", "Reported Speech", "Commands and Requests"] },
              { chapter: "Writing", topics: ["Formal Letter", "Article Writing", "Story Writing", "Analytical Paragraph"] },
              { chapter: "Literature", topics: ["First Flight", "Footprints Without Feet", "Poetry Analysis", "Character Studies"] },
            ],
          },
          {
            subject: "Social Science",
            chapters: [
              { chapter: "History", topics: ["Rise of Nationalism in Europe", "Nationalism in India", "The Making of a Global World", "The Age of Industrialisation", "Print Culture and Modern World"] },
              { chapter: "Geography", topics: ["Resources and Development", "Forest and Wildlife Resources", "Water Resources", "Agriculture", "Minerals and Energy Resources", "Manufacturing Industries", "Lifelines of National Economy"] },
              { chapter: "Political Science", topics: ["Power Sharing", "Federalism", "Democracy and Diversity", "Gender, Religion and Caste", "Political Parties", "Outcomes of Democracy", "Challenges to Democracy"] },
              { chapter: "Economics", topics: ["Development", "Sectors of the Indian Economy", "Money and Credit", "Globalisation and the Indian Economy", "Consumer Rights"] },
            ],
          },
        ],
      },
      {
        grade: "Class 11",
        subjects: [
          {
            subject: "Physics",
            chapters: [
              { chapter: "Physical World and Measurement", topics: ["Scope of Physics", "Units and Dimensions", "Significant Figures", "Errors"] },
              { chapter: "Kinematics", topics: ["Motion in a Straight Line", "Motion in a Plane", "Projectile Motion", "Circular Motion"] },
              { chapter: "Laws of Motion", topics: ["Newton's Laws", "Friction", "Circular Motion Dynamics"] },
              { chapter: "Work, Energy and Power", topics: ["Work-Energy Theorem", "Conservation of Energy", "Power", "Collisions"] },
              { chapter: "Rotational Motion", topics: ["Centre of Mass", "Moment of Inertia", "Angular Momentum", "Torque"] },
              { chapter: "Gravitation", topics: ["Kepler's Laws", "Gravitational Potential", "Escape Velocity", "Satellites"] },
              { chapter: "Properties of Bulk Matter", topics: ["Mechanical Properties of Solids", "Mechanical Properties of Fluids", "Thermal Properties of Matter"] },
              { chapter: "Thermodynamics", topics: ["Laws of Thermodynamics", "Heat Engines", "Entropy"] },
              { chapter: "Oscillations and Waves", topics: ["Simple Harmonic Motion", "Wave Motion", "Superposition of Waves"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "Some Basic Concepts of Chemistry", topics: ["Laws of Chemical Combination", "Mole Concept", "Stoichiometry"] },
              { chapter: "Structure of Atom", topics: ["Atomic Models", "Quantum Mechanical Model", "Electron Configuration"] },
              { chapter: "Classification of Elements", topics: ["Development of Periodic Table", "Periodic Properties"] },
              { chapter: "Chemical Bonding", topics: ["Ionic Bond", "Covalent Bond", "VSEPR Theory", "Hybridization", "Molecular Orbital Theory"] },
              { chapter: "States of Matter", topics: ["Gas Laws", "Kinetic Theory", "Liquids", "Solids"] },
              { chapter: "Thermodynamics", topics: ["First Law", "Enthalpy", "Entropy", "Gibbs Energy"] },
              { chapter: "Equilibrium", topics: ["Chemical Equilibrium", "Ionic Equilibrium", "pH and Buffers"] },
              { chapter: "Redox Reactions", topics: ["Oxidation-Reduction", "Balancing Redox Reactions"] },
              { chapter: "Organic Chemistry", topics: ["IUPAC Nomenclature", "Isomerism", "Electronic Effects"] },
              { chapter: "Hydrocarbons", topics: ["Alkanes", "Alkenes", "Alkynes", "Aromatic Compounds"] },
            ],
          },
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Sets", topics: ["Types of Sets", "Venn Diagrams", "Operations on Sets"] },
              { chapter: "Relations and Functions", topics: ["Ordered Pairs", "Cartesian Product", "Types of Relations", "Types of Functions"] },
              { chapter: "Trigonometric Functions", topics: ["Radian Measure", "Trigonometric Functions", "Trigonometric Equations"] },
              { chapter: "Complex Numbers", topics: ["Algebra of Complex Numbers", "Modulus and Argument", "Argand Plane"] },
              { chapter: "Linear Inequalities", topics: ["Algebraic Solutions", "Graphical Solutions"] },
              { chapter: "Permutations and Combinations", topics: ["Fundamental Principle", "Permutations", "Combinations"] },
              { chapter: "Binomial Theorem", topics: ["Binomial Theorem for Positive Integral Index", "General and Middle Terms"] },
              { chapter: "Sequences and Series", topics: ["Arithmetic Progression", "Geometric Progression", "Sum to n Terms"] },
              { chapter: "Straight Lines", topics: ["Slope", "Various Forms of Equation", "Distance of a Point from Line"] },
              { chapter: "Conic Sections", topics: ["Circles", "Parabola", "Ellipse", "Hyperbola"] },
              { chapter: "Introduction to Three Dimensional Geometry", topics: ["Coordinate Axes", "Distance Formula", "Section Formula"] },
              { chapter: "Limits and Derivatives", topics: ["Limits", "Derivatives", "Derivative of Standard Functions"] },
              { chapter: "Mathematical Reasoning", topics: ["Statements", "Compound Statements", "Quantifiers and Quantified Statements"] },
              { chapter: "Statistics", topics: ["Measures of Dispersion", "Range", "Mean Deviation", "Variance and Standard Deviation"] },
              { chapter: "Probability", topics: ["Random Experiments", "Events", "Axiomatic Approach to Probability"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "Diversity in Living World", topics: ["What is Living", "Taxonomic Categories", "Taxonomical Aids"] },
              { chapter: "Biological Classification", topics: ["Kingdom Monera", "Kingdom Protista", "Kingdom Fungi", "Kingdom Plantae", "Kingdom Animalia"] },
              { chapter: "Plant Kingdom", topics: ["Algae", "Bryophytes", "Pteridophytes", "Gymnosperms", "Angiosperms"] },
              { chapter: "Animal Kingdom", topics: ["Basis of Classification", "Classification of Animals"] },
              { chapter: "Structural Organisation", topics: ["Morphology and Anatomy of Flowering Plants", "Structural Organisation in Animals"] },
              { chapter: "Cell Structure and Function", topics: ["Cell Theory", "Cell: The Unit of Life", "Biomolecules", "Cell Cycle"] },
              { chapter: "Plant Physiology", topics: ["Transport in Plants", "Mineral Nutrition", "Photosynthesis", "Respiration", "Plant Growth"] },
              { chapter: "Human Physiology", topics: ["Digestion", "Breathing", "Body Fluids", "Excretion", "Locomotion", "Neural Control", "Chemical Coordination"] },
            ],
          },
        ],
      },
      {
        grade: "Class 12",
        subjects: [
          {
            subject: "Physics",
            chapters: [
              { chapter: "Electrostatics", topics: ["Electric Charges and Fields", "Electrostatic Potential and Capacitance"] },
              { chapter: "Current Electricity", topics: ["Electric Current", "Ohm's Law", "Kirchhoff's Laws", "Electrical Instruments"] },
              { chapter: "Magnetic Effects of Current", topics: ["Moving Charges and Magnetism", "Magnetism and Matter"] },
              { chapter: "Electromagnetic Induction", topics: ["Electromagnetic Induction", "Alternating Current"] },
              { chapter: "Electromagnetic Waves", topics: ["Displacement Current", "Electromagnetic Spectrum"] },
              { chapter: "Optics", topics: ["Ray Optics", "Wave Optics"] },
              { chapter: "Dual Nature of Matter", topics: ["Dual Nature of Radiation and Matter"] },
              { chapter: "Atoms and Nuclei", topics: ["Atoms", "Nuclei"] },
              { chapter: "Electronic Devices", topics: ["Semiconductor Electronics"] },
              { chapter: "Communication Systems", topics: ["Elements of Communication", "Types of Transmission"] },
            ],
          },
          {
            subject: "Chemistry",
            chapters: [
              { chapter: "Solid State", topics: ["Classification of Solids", "Crystal Lattice", "Defects in Crystals"] },
              { chapter: "Solutions", topics: ["Types of Solutions", "Concentration", "Colligative Properties"] },
              { chapter: "Electrochemistry", topics: ["Electrochemical Cells", "Nernst Equation", "Electrolysis", "Batteries"] },
              { chapter: "Chemical Kinetics", topics: ["Rate of Reaction", "Rate Law", "Collision Theory"] },
              { chapter: "Surface Chemistry", topics: ["Adsorption", "Colloids", "Emulsions"] },
              { chapter: "p-Block Elements", topics: ["Group 15 to 18 Elements"] },
              { chapter: "d and f Block Elements", topics: ["Transition Elements", "Inner Transition Elements"] },
              { chapter: "Coordination Compounds", topics: ["Werner's Theory", "Nomenclature", "Isomerism", "Bonding"] },
              { chapter: "Haloalkanes and Haloarenes", topics: ["Classification", "Reactions", "Uses"] },
              { chapter: "Alcohols, Phenols and Ethers", topics: ["Classification", "Preparation", "Properties"] },
              { chapter: "Aldehydes, Ketones and Carboxylic Acids", topics: ["Nomenclature", "Preparation", "Reactions"] },
              { chapter: "Amines", topics: ["Classification", "Preparation", "Properties", "Diazonium Salts"] },
              { chapter: "Biomolecules", topics: ["Carbohydrates", "Proteins", "Vitamins", "Nucleic Acids"] },
              { chapter: "Polymers", topics: ["Classification", "Polymerization", "Biodegradable Polymers"] },
              { chapter: "Chemistry in Everyday Life", topics: ["Drugs", "Chemicals in Food", "Cleansing Agents"] },
            ],
          },
          {
            subject: "Mathematics",
            chapters: [
              { chapter: "Relations and Functions", topics: ["Types of Relations", "Types of Functions", "Inverse Trigonometric Functions"] },
              { chapter: "Algebra", topics: ["Matrices", "Determinants"] },
              { chapter: "Calculus", topics: ["Continuity and Differentiability", "Applications of Derivatives", "Integrals", "Applications of Integrals", "Differential Equations"] },
              { chapter: "Vectors and 3D Geometry", topics: ["Vectors", "Three Dimensional Geometry"] },
              { chapter: "Linear Programming", topics: ["Introduction", "Graphical Method", "Applications"] },
              { chapter: "Probability", topics: ["Conditional Probability", "Bayes' Theorem", "Random Variables", "Binomial Distribution"] },
            ],
          },
          {
            subject: "Biology",
            chapters: [
              { chapter: "Reproduction", topics: ["Reproduction in Organisms", "Sexual Reproduction in Flowering Plants", "Human Reproduction", "Reproductive Health"] },
              { chapter: "Genetics and Evolution", topics: ["Principles of Inheritance", "Molecular Basis of Inheritance", "Evolution"] },
              { chapter: "Biology and Human Welfare", topics: ["Human Health and Disease", "Strategies for Food Production", "Microbes in Human Welfare"] },
              { chapter: "Biotechnology", topics: ["Biotechnology Principles", "Biotechnology Applications"] },
              { chapter: "Ecology", topics: ["Organisms and Populations", "Ecosystem", "Biodiversity and Conservation", "Environmental Issues"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= BDS (Bachelor of Dental Surgery - India) =======================
  {
    curriculum: "BDS",
    category: 'dental',
    grades: [
      {
        grade: "1st Year",
        subjects: [
          {
            subject: "General Anatomy",
            chapters: [
              { chapter: "Introduction to Anatomy", topics: ["Anatomical Terminology", "Planes and Sections", "Types of Tissues", "Basic Embryology"] },
              { chapter: "Upper Limb", topics: ["Bones of Upper Limb", "Muscles of Upper Limb", "Blood Supply", "Nerve Supply", "Joints"] },
              { chapter: "Lower Limb", topics: ["Bones of Lower Limb", "Muscles of Lower Limb", "Blood Supply", "Nerve Supply", "Joints"] },
              { chapter: "Thorax", topics: ["Thoracic Wall", "Pleura", "Lungs", "Heart", "Mediastinum"] },
              { chapter: "Abdomen", topics: ["Anterior Abdominal Wall", "Gastrointestinal Tract", "Liver and Biliary System", "Kidneys and Ureters"] },
              { chapter: "Pelvis and Perineum", topics: ["Pelvic Bones", "Pelvic Organs", "Perineum", "Reproductive Organs"] },
              { chapter: "Head and Neck", topics: ["Skull Bones", "Muscles of Head and Neck", "Blood Supply", "Cranial Nerves", "Parotid Region", "Temporal and Infratemporal Fossa"] },
            ],
          },
          {
            subject: "General Histology and Embryology",
            chapters: [
              { chapter: "Basic Tissues", topics: ["Epithelial Tissue", "Connective Tissue", "Muscular Tissue", "Nervous Tissue"] },
              { chapter: "Special Histology", topics: ["Skin", "Blood and Bone Marrow", "Lymphoid Organs", "Endocrine Glands"] },
              { chapter: "General Embryology", topics: ["Gametogenesis", "Fertilization", "Cleavage and Implantation", "Gastrulation", "Organogenesis"] },
              { chapter: "Special Embryology", topics: ["Development of Face", "Development of Palate", "Development of Tongue", "Development of Teeth"] },
            ],
          },
          {
            subject: "General Physiology",
            chapters: [
              { chapter: "Cell Physiology", topics: ["Cell Membrane", "Transport Mechanisms", "Resting Membrane Potential", "Action Potential"] },
              { chapter: "Blood", topics: ["Composition of Blood", "Red Blood Cells", "White Blood Cells", "Hemostasis", "Blood Groups"] },
              { chapter: "Cardiovascular System", topics: ["Cardiac Cycle", "Electrocardiogram", "Blood Pressure", "Regulation of Circulation"] },
              { chapter: "Respiratory System", topics: ["Mechanics of Breathing", "Gas Exchange", "Transport of Gases", "Regulation of Respiration"] },
              { chapter: "Gastrointestinal System", topics: ["Digestion", "Absorption", "Gastrointestinal Motility", "Gastrointestinal Hormones"] },
              { chapter: "Renal System", topics: ["Glomerular Filtration", "Tubular Reabsorption", "Concentration of Urine", "Acid-Base Balance"] },
              { chapter: "Nerve and Muscle Physiology", topics: ["Nerve Impulse", "Neuromuscular Junction", "Skeletal Muscle", "Smooth Muscle"] },
              { chapter: "Endocrine System", topics: ["Pituitary Gland", "Thyroid Gland", "Adrenal Gland", "Pancreas", "Calcium Metabolism"] },
            ],
          },
          {
            subject: "Biochemistry",
            chapters: [
              { chapter: "Biomolecules", topics: ["Carbohydrates", "Proteins", "Lipids", "Nucleic Acids", "Enzymes"] },
              { chapter: "Carbohydrate Metabolism", topics: ["Glycolysis", "Gluconeogenesis", "Glycogen Metabolism", "Pentose Phosphate Pathway"] },
              { chapter: "Lipid Metabolism", topics: ["Fatty Acid Oxidation", "Fatty Acid Synthesis", "Cholesterol Metabolism", "Lipoproteins"] },
              { chapter: "Protein Metabolism", topics: ["Amino Acid Catabolism", "Urea Cycle", "Amino Acid Biosynthesis"] },
              { chapter: "Molecular Biology", topics: ["DNA Replication", "Transcription", "Translation", "Regulation of Gene Expression"] },
              { chapter: "Vitamins and Minerals", topics: ["Water-Soluble Vitamins", "Fat-Soluble Vitamins", "Minerals and Trace Elements"] },
              { chapter: "Clinical Biochemistry", topics: ["Liver Function Tests", "Kidney Function Tests", "Cardiac Markers", "Diabetes Diagnosis"] },
            ],
          },
          {
            subject: "Dental Anatomy",
            chapters: [
              { chapter: "Introduction to Dental Anatomy", topics: ["Dental Nomenclature", "Tooth Numbering Systems", "Parts of a Tooth", "Tooth Surfaces"] },
              { chapter: "Deciduous Teeth", topics: ["Deciduous Incisors", "Deciduous Canines", "Deciduous Molars", "Differences from Permanent Teeth"] },
              { chapter: "Permanent Anterior Teeth", topics: ["Maxillary Central Incisor", "Maxillary Lateral Incisor", "Mandibular Incisors", "Canines"] },
              { chapter: "Permanent Posterior Teeth", topics: ["Premolars", "Maxillary Molars", "Mandibular Molars", "Third Molars"] },
              { chapter: "Root Canal Anatomy", topics: ["Pulp Chamber", "Root Canal System", "Accessory Canals", "Apical Foramen"] },
              { chapter: "Occlusion", topics: ["Planes of Occlusion", "Intercuspation", "Curve of Spee", "Curve of Wilson"] },
            ],
          },
        ],
      },
      {
        grade: "2nd Year",
        subjects: [
          {
            subject: "General Pathology",
            chapters: [
              { chapter: "Cell Injury and Adaptation", topics: ["Causes of Cell Injury", "Reversible Cell Injury", "Irreversible Cell Injury", "Cell Death", "Cellular Adaptations"] },
              { chapter: "Inflammation", topics: ["Acute Inflammation", "Chronic Inflammation", "Granulomatous Inflammation", "Wound Healing"] },
              { chapter: "Hemodynamic Disorders", topics: ["Edema", "Hyperemia and Congestion", "Hemorrhage", "Thrombosis", "Embolism", "Infarction"] },
              { chapter: "Neoplasia", topics: ["Nomenclature", "Characteristics of Neoplasms", "Carcinogenesis", "Tumor Immunology"] },
              { chapter: "Immunopathology", topics: ["Hypersensitivity Reactions", "Autoimmune Diseases", "Immunodeficiency Diseases"] },
              { chapter: "Genetic and Pediatric Diseases", topics: ["Chromosomal Disorders", "Single Gene Disorders", "Multifactorial Disorders"] },
            ],
          },
          {
            subject: "Microbiology",
            chapters: [
              { chapter: "General Microbiology", topics: ["Classification of Microorganisms", "Sterilization and Disinfection", "Culture Media", "Staining Techniques"] },
              { chapter: "Immunology", topics: ["Innate Immunity", "Adaptive Immunity", "Antigens and Antibodies", "Complement System", "Vaccines"] },
              { chapter: "Systemic Bacteriology", topics: ["Staphylococci", "Streptococci", "Enterobacteriaceae", "Mycobacteria", "Anaerobes"] },
              { chapter: "Virology", topics: ["General Properties of Viruses", "Hepatitis Viruses", "HIV", "Respiratory Viruses", "Herpesviruses"] },
              { chapter: "Mycology", topics: ["Superficial Mycoses", "Subcutaneous Mycoses", "Systemic Mycoses", "Opportunistic Fungi"] },
              { chapter: "Parasitology", topics: ["Protozoa", "Helminths", "Arthropods"] },
              { chapter: "Oral Microbiology", topics: ["Normal Oral Flora", "Dental Plaque", "Caries Microbiology", "Periodontal Microbiology", "Oral Infections"] },
            ],
          },
          {
            subject: "Pharmacology",
            chapters: [
              { chapter: "General Pharmacology", topics: ["Pharmacokinetics", "Pharmacodynamics", "Drug Interactions", "Adverse Drug Reactions"] },
              { chapter: "Autonomic Pharmacology", topics: ["Cholinergic Drugs", "Anticholinergic Drugs", "Adrenergic Drugs", "Antiadrenergic Drugs"] },
              { chapter: "CNS Pharmacology", topics: ["General Anesthetics", "Local Anesthetics", "Sedatives and Hypnotics", "Antiepileptics", "Opioid Analgesics"] },
              { chapter: "CVS Pharmacology", topics: ["Antihypertensives", "Antianginal Drugs", "Antiarrhythmics", "Drugs for Heart Failure"] },
              { chapter: "Chemotherapy", topics: ["Antibiotics", "Antiviral Drugs", "Antifungal Drugs", "Antimalarial Drugs", "Anticancer Drugs"] },
              { chapter: "Autacoids", topics: ["Histamine and Antihistamines", "Serotonin", "Prostaglandins", "NSAIDs"] },
              { chapter: "Drugs in Dentistry", topics: ["Local Anesthetics in Dentistry", "Analgesics for Dental Pain", "Antibiotics in Dental Practice", "Anxiolytics", "Antiseptics and Disinfectants"] },
            ],
          },
          {
            subject: "Dental Materials",
            chapters: [
              { chapter: "Introduction to Dental Materials", topics: ["Physical Properties", "Mechanical Properties", "Biological Properties", "Material Selection"] },
              { chapter: "Gypsum Products", topics: ["Types of Gypsum", "Setting Reaction", "Properties", "Manipulation", "Uses"] },
              { chapter: "Impression Materials", topics: ["Classification", "Elastomeric Impression Materials", "Hydrocolloids", "Impression Compound"] },
              { chapter: "Waxes", topics: ["Composition", "Properties", "Types of Dental Waxes", "Uses"] },
              { chapter: "Restorative Materials", topics: ["Amalgam", "Composite Resins", "Glass Ionomer Cements", "Compomers"] },
              { chapter: "Dental Cements", topics: ["Zinc Phosphate Cement", "Zinc Polycarboxylate Cement", "Glass Ionomer Cement", "Resin Cements"] },
              { chapter: "Metals and Alloys", topics: ["Casting Alloys", "Base Metal Alloys", "Titanium and Titanium Alloys", "Soldering and Welding"] },
              { chapter: "Polymers", topics: ["Denture Base Resins", "Polymerization Reactions", "Properties and Uses"] },
              { chapter: "Ceramics", topics: ["Dental Porcelain", "All-Ceramic Systems", "Metal-Ceramic Systems"] },
            ],
          },
          {
            subject: "Pre-Clinical Prosthodontics",
            chapters: [
              { chapter: "Complete Dentures - Introduction", topics: ["Patient Examination", "Diagnosis and Treatment Planning", "Anatomy for Complete Dentures"] },
              { chapter: "Impression Procedures", topics: ["Preliminary Impressions", "Final Impressions", "Border Molding", "Impression Trays"] },
              { chapter: "Jaw Relations", topics: ["Orientation Jaw Relation", "Vertical Jaw Relation", "Horizontal Jaw Relation", "Face Bow Transfer"] },
              { chapter: "Teeth Selection and Arrangement", topics: ["Selection of Teeth", "Principles of Tooth Arrangement", "Esthetics", "Try-in Procedures"] },
              { chapter: "Laboratory Procedures", topics: ["Waxing", "Flasking", "Packing", "Curing", "Deflasking", "Finishing and Polishing"] },
            ],
          },
        ],
      },
      {
        grade: "3rd Year",
        subjects: [
          {
            subject: "Oral Pathology",
            chapters: [
              { chapter: "Developmental Disturbances of Oral Structures", topics: ["Developmental Disturbances of Teeth", "Abnormalities of Tooth Structure", "Hereditary Conditions"] },
              { chapter: "Dental Caries", topics: ["Etiology", "Histopathology", "Classification", "Prevention"] },
              { chapter: "Diseases of Dental Pulp and Periapical Tissues", topics: ["Pulpitis", "Pulp Necrosis", "Periapical Diseases", "Periapical Cyst"] },
              { chapter: "Periodontal Diseases", topics: ["Gingivitis", "Periodontitis", "Desquamative Gingivitis", "Gingival Enlargements"] },
              { chapter: "Infections of Oral Cavity", topics: ["Bacterial Infections", "Viral Infections", "Fungal Infections", "Parasitic Infections"] },
              { chapter: "Cysts of Orofacial Region", topics: ["Odontogenic Cysts", "Non-Odontogenic Cysts", "Pseudocysts"] },
              { chapter: "Odontogenic Tumors", topics: ["Benign Odontogenic Tumors", "Malignant Odontogenic Tumors"] },
              { chapter: "Non-Odontogenic Tumors", topics: ["Benign Tumors of Oral Cavity", "Malignant Tumors of Oral Cavity", "Salivary Gland Tumors"] },
              { chapter: "Oral Manifestations of Systemic Diseases", topics: ["Hematological Disorders", "Endocrine Disorders", "Nutritional Deficiencies", "Skin Diseases"] },
              { chapter: "Oral Premalignant Lesions", topics: ["Leukoplakia", "Erythroplakia", "Oral Submucous Fibrosis", "Lichen Planus"] },
            ],
          },
          {
            subject: "Oral Medicine and Radiology",
            chapters: [
              { chapter: "Oral Diagnosis", topics: ["History Taking", "Clinical Examination", "Special Investigations", "Diagnosis and Treatment Planning"] },
              { chapter: "Dental Radiology", topics: ["Physics of X-rays", "Intraoral Radiography", "Extraoral Radiography", "Digital Imaging"] },
              { chapter: "Radiographic Interpretation", topics: ["Normal Radiographic Anatomy", "Radiographic Pathology", "Interpretation Guidelines"] },
              { chapter: "Diseases of TMJ", topics: ["TMJ Disorders", "Myofascial Pain Dysfunction", "Internal Derangements", "Arthritis"] },
              { chapter: "Orofacial Pain", topics: ["Odontogenic Pain", "Non-Odontogenic Pain", "Neuralgias", "Referred Pain"] },
              { chapter: "Oral Manifestations of HIV/AIDS", topics: ["Classification", "Oral Lesions", "Management", "Infection Control"] },
              { chapter: "Forensic Odontology", topics: ["Identification of Individuals", "Bite Mark Analysis", "Age Estimation", "Mass Disasters"] },
            ],
          },
          {
            subject: "General Surgery",
            chapters: [
              { chapter: "Surgical Principles", topics: ["Asepsis", "Wound Healing", "Surgical Incisions", "Suturing Techniques"] },
              { chapter: "Surgical Infections", topics: ["Types of Infections", "Prevention", "Treatment", "Antibiotics in Surgery"] },
              { chapter: "Fluid and Electrolyte Balance", topics: ["Body Fluid Compartments", "Fluid Therapy", "Electrolyte Disorders"] },
              { chapter: "Shock", topics: ["Types of Shock", "Pathophysiology", "Clinical Features", "Management"] },
              { chapter: "Burns", topics: ["Classification", "Pathophysiology", "Assessment", "Management"] },
              { chapter: "Head and Neck Surgery", topics: ["Thyroid Surgery", "Salivary Gland Surgery", "Lymph Node Disorders"] },
            ],
          },
          {
            subject: "General Medicine",
            chapters: [
              { chapter: "Cardiovascular Diseases", topics: ["Hypertension", "Ischemic Heart Disease", "Heart Failure", "Valvular Heart Disease", "Infective Endocarditis"] },
              { chapter: "Respiratory Diseases", topics: ["Asthma", "COPD", "Pneumonia", "Tuberculosis"] },
              { chapter: "Gastrointestinal Diseases", topics: ["Peptic Ulcer", "Liver Diseases", "Inflammatory Bowel Disease"] },
              { chapter: "Endocrine Disorders", topics: ["Diabetes Mellitus", "Thyroid Disorders", "Adrenal Disorders"] },
              { chapter: "Hematological Disorders", topics: ["Anemia", "Bleeding Disorders", "Leukemia", "Lymphoma"] },
              { chapter: "Neurological Disorders", topics: ["Stroke", "Epilepsy", "Parkinson's Disease", "Multiple Sclerosis"] },
              { chapter: "Renal Diseases", topics: ["Acute Kidney Injury", "Chronic Kidney Disease", "Nephrotic Syndrome"] },
              { chapter: "Medical Emergencies", topics: ["Anaphylaxis", "Cardiac Arrest", "Diabetic Emergencies", "Respiratory Failure"] },
            ],
          },
        ],
      },
      {
        grade: "Final Year",
        subjects: [
          {
            subject: "Prosthodontics",
            chapters: [
              { chapter: "Complete Dentures", topics: ["Diagnosis and Treatment Planning", "Impression Procedures", "Jaw Relations", "Teeth Arrangement", "Insertion and Post-Insertion Care"] },
              { chapter: "Removable Partial Dentures", topics: ["Kennedy Classification", "Components of RPD", "Surveying", "Design Principles", "Framework Design"] },
              { chapter: "Fixed Partial Dentures", topics: ["Treatment Planning", "Tooth Preparation", "Impression Procedures", "Provisional Restorations", "Cementation"] },
              { chapter: "Maxillofacial Prosthetics", topics: ["Obturators", "Nasal Prostheses", "Auricular Prostheses", "Ocular Prostheses"] },
              { chapter: "Implant Prosthodontics", topics: ["Implant Components", "Treatment Planning", "Surgical Procedures", "Prosthetic Rehabilitation"] },
              { chapter: "Occlusion", topics: ["Concepts of Occlusion", "Articulators", "Facebow", "Occlusal Adjustment"] },
            ],
          },
          {
            subject: "Conservative Dentistry and Endodontics",
            chapters: [
              { chapter: "Diagnosis and Treatment Planning", topics: ["Clinical Examination", "Pulp Testing", "Radiographic Interpretation", "Treatment Planning"] },
              { chapter: "Operative Dentistry", topics: ["Cavity Preparation", "Restorative Materials", "Direct Restorations", "Indirect Restorations"] },
              { chapter: "Endodontics - Pulp Therapy", topics: ["Pulp Capping", "Pulpotomy", "Pulpectomy", "Single Visit Endodontics"] },
              { chapter: "Root Canal Treatment", topics: ["Access Cavity Preparation", "Working Length Determination", "Cleaning and Shaping", "Obturation"] },
              { chapter: "Endodontic Mishaps", topics: ["Procedural Errors", "Instrument Separation", "Perforations", "Management"] },
              { chapter: "Endodontic Surgery", topics: ["Indications", "Periapical Surgery", "Root Resection", "Retrograde Filling"] },
              { chapter: "Bleaching", topics: ["Vital Bleaching", "Non-Vital Bleaching", "Materials", "Techniques"] },
              { chapter: "Esthetics", topics: ["Smile Analysis", "Veneers", "Tooth Reshaping", "Full Mouth Rehabilitation"] },
            ],
          },
          {
            subject: "Oral and Maxillofacial Surgery",
            chapters: [
              { chapter: "Armamentarium and Principles", topics: ["Surgical Instruments", "Principles of Surgery", "Asepsis", "Patient Preparation"] },
              { chapter: "Exodontia", topics: ["Indications and Contraindications", "Forceps Extraction", "Surgical Extraction", "Post-Extraction Complications"] },
              { chapter: "Impactions", topics: ["Classification", "Diagnosis", "Surgical Removal", "Complications"] },
              { chapter: "Odontogenic Infections", topics: ["Spread of Infection", "Fascial Space Infections", "Ludwig's Angina", "Management"] },
              { chapter: "Maxillofacial Trauma", topics: ["Soft Tissue Injuries", "Dentoalveolar Fractures", "Mandibular Fractures", "Midface Fractures", "Zygomatic Fractures"] },
              { chapter: "Cysts and Tumors", topics: ["Diagnosis", "Surgical Management", "Enucleation", "Marsupialization", "Resection"] },
              { chapter: "TMJ Surgery", topics: ["Surgical Approaches", "Arthroscopy", "Arthroplasty", "Joint Replacement"] },
              { chapter: "Orthognathic Surgery", topics: ["Diagnosis", "Treatment Planning", "Surgical Techniques", "Post-Surgical Orthodontics"] },
              { chapter: "Cleft Lip and Palate", topics: ["Classification", "Surgical Repair", "Multidisciplinary Management"] },
              { chapter: "Pre-Prosthetic Surgery", topics: ["Ridge Augmentation", "Vestibuloplasty", "Frenectomy", "Tori Removal"] },
            ],
          },
          {
            subject: "Periodontology",
            chapters: [
              { chapter: "Anatomy and Histology of Periodontium", topics: ["Gingiva", "Periodontal Ligament", "Cementum", "Alveolar Bone"] },
              { chapter: "Etiology of Periodontal Disease", topics: ["Dental Plaque", "Calculus", "Host Response", "Risk Factors"] },
              { chapter: "Classification of Periodontal Diseases", topics: ["Gingivitis", "Periodontitis", "Necrotizing Periodontal Diseases", "Periodontitis as Manifestation of Systemic Diseases"] },
              { chapter: "Diagnosis and Treatment Planning", topics: ["Clinical Examination", "Periodontal Charting", "Radiographic Assessment", "Treatment Planning"] },
              { chapter: "Non-Surgical Periodontal Therapy", topics: ["Scaling and Root Planing", "Chemotherapy", "Host Modulation", "Maintenance"] },
              { chapter: "Periodontal Surgery", topics: ["Access Flap Surgery", "Osseous Surgery", "Regenerative Procedures", "Mucogingival Surgery"] },
              { chapter: "Periodontal Plastic Surgery", topics: ["Root Coverage", "Crown Lengthening", "Ridge Augmentation", "Papilla Reconstruction"] },
              { chapter: "Implant Dentistry", topics: ["Implant Selection", "Surgical Procedures", "Maintenance", "Peri-implant Diseases"] },
            ],
          },
          {
            subject: "Orthodontics",
            chapters: [
              { chapter: "Growth and Development", topics: ["Prenatal Development", "Postnatal Development", "Growth of Craniofacial Complex", "Growth Prediction"] },
              { chapter: "Development of Dentition", topics: ["Development of Teeth", "Eruption of Teeth", "Development of Occlusion"] },
              { chapter: "Etiology of Malocclusion", topics: ["General Factors", "Local Factors", "Genetic Factors", "Environmental Factors"] },
              { chapter: "Classification of Malocclusion", topics: ["Angle's Classification", "Incisor Classification", "Skeletal Classification"] },
              { chapter: "Orthodontic Diagnosis", topics: ["Case History", "Clinical Examination", "Model Analysis", "Cephalometrics", "Radiographic Analysis"] },
              { chapter: "Biomechanics", topics: ["Force Systems", "Anchorage", "Friction", "Optimal Forces"] },
              { chapter: "Orthodontic Appliances", topics: ["Removable Appliances", "Fixed Appliances", "Functional Appliances", "Brackets and Wires"] },
              { chapter: "Treatment of Malocclusion", topics: ["Class I Treatment", "Class II Treatment", "Class III Treatment", "Surgical Orthodontics"] },
              { chapter: "Retention and Relapse", topics: ["Causes of Relapse", "Retainers", "Retention Protocols"] },
            ],
          },
          {
            subject: "Pedodontics",
            chapters: [
              { chapter: "Child Psychology", topics: ["Psychological Development", "Behavior Management", "Pharmacological Management", "Special Needs Children"] },
              { chapter: "Prevention of Dental Disease", topics: ["Oral Hygiene", "Fluorides", "Pit and Fissure Sealants", "Diet Counseling"] },
              { chapter: "Restorative Dentistry in Children", topics: ["Cavity Preparation", "Restorative Materials", "Stainless Steel Crowns"] },
              { chapter: "Pulp Therapy in Primary Teeth", topics: ["Pulpotomy", "Pulpectomy", "Apexogenesis", "Apexification"] },
              { chapter: "Traumatic Injuries", topics: ["Classification", "Management of Primary Teeth", "Management of Permanent Teeth", "Follow-up"] },
              { chapter: "Interceptive Orthodontics", topics: ["Space Maintainers", "Habit Breaking Appliances", "Serial Extraction"] },
              { chapter: "Oral Conditions in Children", topics: ["Developmental Abnormalities", "Soft Tissue Lesions", "Oral Manifestations of Systemic Diseases"] },
            ],
          },
          {
            subject: "Public Health Dentistry",
            chapters: [
              { chapter: "Concept of Health and Disease", topics: ["Definition of Health", "Disease Spectrum", "Natural History of Disease", "Epidemiological Triad"] },
              { chapter: "Epidemiology", topics: ["Study Designs", "Measures of Disease Frequency", "Screening", "Surveillance"] },
              { chapter: "Dental Epidemiology", topics: ["Dental Caries Indices", "Periodontal Indices", "Malocclusion Indices", "Oral Cancer Epidemiology"] },
              { chapter: "Biostatistics", topics: ["Data Collection", "Measures of Central Tendency", "Measures of Dispersion", "Statistical Tests", "Sampling"] },
              { chapter: "Preventive Dentistry", topics: ["Fluorides", "Plaque Control", "Pit and Fissure Sealants", "Tobacco Cessation"] },
              { chapter: "Health Education", topics: ["Principles", "Methods", "IEC Materials", "Evaluation"] },
              { chapter: "Oral Health Administration", topics: ["Health Systems", "Health Planning", "National Oral Health Programs", "Dental Practice Management"] },
              { chapter: "Dental Ethics and Jurisprudence", topics: ["Dental Council of India", "Dental Ethics", "Consent", "Professional Negligence", "Consumer Protection Act"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= NEET MDS (Dental PG Entrance - India) =======================
  {
    curriculum: "NEET MDS",
    category: 'dental',
    grades: [
      {
        grade: "NEET MDS Preparation",
        subjects: [
          {
            subject: "Prosthodontics",
            chapters: [
              { chapter: "Complete Dentures", topics: ["Diagnosis", "Impression Techniques", "Jaw Relations", "Teeth Arrangement", "Denture Insertion", "Post-Insertion Problems"] },
              { chapter: "Removable Partial Dentures", topics: ["Kennedy Classification", "Surveying", "Components", "Design Principles", "Connectors"] },
              { chapter: "Fixed Prosthodontics", topics: ["Tooth Preparation", "Impression Materials", "Provisional Restorations", "Cementation", "All-Ceramic Restorations"] },
              { chapter: "Implant Prosthodontics", topics: ["Osseointegration", "Implant Components", "Treatment Planning", "Loading Protocols", "Complications"] },
              { chapter: "Maxillofacial Prosthetics", topics: ["Obturators", "Facial Prostheses", "Speech Prostheses"] },
              { chapter: "Dental Materials", topics: ["Impression Materials", "Dental Cements", "Casting Alloys", "Polymers", "Ceramics"] },
            ],
          },
          {
            subject: "Conservative Dentistry and Endodontics",
            chapters: [
              { chapter: "Dental Caries", topics: ["Etiology", "Histopathology", "Diagnosis", "Prevention"] },
              { chapter: "Cavity Preparation", topics: ["Principles", "Nomenclature", "Techniques", "Instruments"] },
              { chapter: "Restorative Materials", topics: ["Amalgam", "Composite Resins", "Glass Ionomer Cement", "Ceramics"] },
              { chapter: "Endodontic Diagnosis", topics: ["Pulp Testing", "Radiographic Interpretation", "Differential Diagnosis"] },
              { chapter: "Root Canal Treatment", topics: ["Access Cavity", "Working Length", "Instrumentation", "Irrigation", "Obturation"] },
              { chapter: "Endodontic Mishaps", topics: ["Procedural Errors", "Instrument Separation", "Perforations", "Management"] },
              { chapter: "Endodontic Surgery", topics: ["Indications", "Techniques", "Materials", "Outcomes"] },
            ],
          },
          {
            subject: "Oral and Maxillofacial Surgery",
            chapters: [
              { chapter: "Principles of Exodontia", topics: ["Armamentarium", "Forceps Extraction", "Surgical Extraction", "Complications"] },
              { chapter: "Impacted Teeth", topics: ["Classification", "Radiographic Assessment", "Surgical Technique", "Complications"] },
              { chapter: "Maxillofacial Infections", topics: ["Spread of Infection", "Fascial Spaces", "Ludwig's Angina", "Management"] },
              { chapter: "Maxillofacial Trauma", topics: ["Dentoalveolar Fractures", "Mandibular Fractures", "Midface Fractures", "Zygomatic Fractures", "Orbital Fractures"] },
              { chapter: "Cysts and Tumors", topics: ["Classification", "Clinical Features", "Radiographic Features", "Management"] },
              { chapter: "Orthognathic Surgery", topics: ["Diagnosis", "Treatment Planning", "Surgical Techniques", "Complications"] },
              { chapter: "TMJ Disorders", topics: ["Anatomy", "Disorders", "Diagnosis", "Management"] },
            ],
          },
          {
            subject: "Periodontics",
            chapters: [
              { chapter: "Periodontium", topics: ["Anatomy", "Histology", "Functions"] },
              { chapter: "Etiology and Classification", topics: ["Microbiology", "Host Response", "Risk Factors", "Classification Systems"] },
              { chapter: "Diagnosis", topics: ["Clinical Examination", "Radiographic Assessment", "Additional Tests"] },
              { chapter: "Non-Surgical Therapy", topics: ["Scaling and Root Planing", "Chemotherapy", "Host Modulation"] },
              { chapter: "Periodontal Surgery", topics: ["Flap Surgery", "Osseous Surgery", "Regenerative Procedures", "Mucogingival Surgery"] },
              { chapter: "Implantology", topics: ["Implant Selection", "Surgical Procedures", "Maintenance", "Peri-implant Diseases"] },
            ],
          },
          {
            subject: "Orthodontics",
            chapters: [
              { chapter: "Growth and Development", topics: ["Craniofacial Growth", "Growth Modification", "Growth Prediction"] },
              { chapter: "Diagnosis", topics: ["Case History", "Clinical Examination", "Model Analysis", "Cephalometrics"] },
              { chapter: "Biomechanics", topics: ["Force Systems", "Anchorage", "Friction", "Tooth Movement"] },
              { chapter: "Appliances", topics: ["Removable Appliances", "Fixed Appliances", "Functional Appliances", "TADs"] },
              { chapter: "Treatment", topics: ["Class I", "Class II", "Class III", "Surgical Orthodontics"] },
              { chapter: "Retention", topics: ["Types of Retainers", "Relapse Factors", "Retention Protocols"] },
            ],
          },
          {
            subject: "Oral Pathology and Microbiology",
            chapters: [
              { chapter: "Developmental Disturbances", topics: ["Tooth Development Anomalies", "Structural Anomalies"] },
              { chapter: "Dental Caries and Pulp Diseases", topics: ["Caries Histopathology", "Pulp Pathology", "Periapical Diseases"] },
              { chapter: "Periodontal Diseases", topics: ["Gingivitis", "Periodontitis", "Pathogenesis"] },
              { chapter: "Infections", topics: ["Bacterial Infections", "Viral Infections", "Fungal Infections"] },
              { chapter: "Cysts and Tumors", topics: ["Odontogenic Cysts", "Odontogenic Tumors", "Non-Odontogenic Tumors"] },
              { chapter: "Oral Cancer", topics: ["Premalignant Lesions", "Oral Squamous Cell Carcinoma", "Salivary Gland Tumors"] },
              { chapter: "Oral Microbiology", topics: ["Oral Flora", "Biofilm", "Caries Microbiology", "Periodontal Microbiology"] },
            ],
          },
          {
            subject: "Pedodontics",
            chapters: [
              { chapter: "Child Psychology", topics: ["Development", "Behavior Management", "Pharmacological Management"] },
              { chapter: "Prevention", topics: ["Oral Hygiene", "Fluorides", "Sealants", "Diet"] },
              { chapter: "Restorative Dentistry", topics: ["Cavity Preparation", "Materials", "Crowns"] },
              { chapter: "Pulp Therapy", topics: ["Pulpotomy", "Pulpectomy", "Apexogenesis", "Apexification"] },
              { chapter: "Trauma", topics: ["Classification", "Management", "Follow-up"] },
              { chapter: "Interceptive Orthodontics", topics: ["Space Maintainers", "Habit Breaking", "Serial Extraction"] },
            ],
          },
          {
            subject: "Public Health Dentistry",
            chapters: [
              { chapter: "Epidemiology", topics: ["Study Designs", "Measures", "Screening", "Surveillance"] },
              { chapter: "Biostatistics", topics: ["Data Collection", "Descriptive Statistics", "Inferential Statistics"] },
              { chapter: "Dental Indices", topics: ["Caries Indices", "Periodontal Indices", "Malocclusion Indices"] },
              { chapter: "Prevention", topics: ["Fluorides", "Plaque Control", "Tobacco Cessation"] },
              { chapter: "Health Education", topics: ["Principles", "Methods", "Evaluation"] },
              { chapter: "Administration", topics: ["Health Systems", "Planning", "National Programs"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= NBDE/INBDE (USA Dental Boards) =======================
  {
    curriculum: "NBDE/INBDE",
    category: 'dental',
    grades: [
      {
        grade: "INBDE Preparation",
        subjects: [
          {
            subject: "Anatomical Sciences",
            chapters: [
              { chapter: "General Anatomy", topics: ["Anatomical Terminology", "Body Planes", "Tissues", "Skeletal System", "Muscular System"] },
              { chapter: "Head and Neck Anatomy", topics: ["Skull Bones", "Muscles of Mastication", "Blood Supply", "Nerve Supply", "Lymphatics"] },
              { chapter: "Oral Cavity Anatomy", topics: ["Tongue", "Palate", "Salivary Glands", "TMJ", "Pharynx"] },
              { chapter: "Dental Anatomy", topics: ["Tooth Morphology", "Eruption", "Nomenclature", "Occlusion"] },
              { chapter: "Histology", topics: ["Oral Mucosa", "Tooth Structure", "Periodontium", "Salivary Glands"] },
              { chapter: "Embryology", topics: ["Face Development", "Palate Development", "Tooth Development", "Tongue Development"] },
            ],
          },
          {
            subject: "Biochemistry and Physiology",
            chapters: [
              { chapter: "Biochemistry", topics: ["Biomolecules", "Enzymes", "Metabolism", "Vitamins and Minerals", "Molecular Biology"] },
              { chapter: "General Physiology", topics: ["Cell Physiology", "Nerve and Muscle Physiology", "Blood and Immunity", "Cardiovascular System", "Respiratory System"] },
              { chapter: "Oral Physiology", topics: ["Saliva", "Mastication", "Deglutition", "Speech", "Taste"] },
              { chapter: "Endocrine System", topics: ["Pituitary Gland", "Thyroid and Parathyroid", "Adrenal Glands", "Pancreas", "Calcium Metabolism"] },
            ],
          },
          {
            subject: "Microbiology and Pathology",
            chapters: [
              { chapter: "General Microbiology", topics: ["Bacteria", "Viruses", "Fungi", "Parasites", "Sterilization and Disinfection"] },
              { chapter: "Oral Microbiology", topics: ["Oral Flora", "Dental Plaque", "Caries Microbiology", "Periodontal Microbiology"] },
              { chapter: "Immunology", topics: ["Innate Immunity", "Adaptive Immunity", "Hypersensitivity", "Immunodeficiency", "Vaccines"] },
              { chapter: "General Pathology", topics: ["Cell Injury", "Inflammation", "Neoplasia", "Hemodynamic Disorders"] },
              { chapter: "Oral Pathology", topics: ["Developmental Disorders", "Infections", "Cysts and Tumors", "Premalignant Lesions", "Oral Cancer"] },
            ],
          },
          {
            subject: "Pharmacology",
            chapters: [
              { chapter: "General Pharmacology", topics: ["Pharmacokinetics", "Pharmacodynamics", "Drug Interactions", "Adverse Effects"] },
              { chapter: "Autonomic Pharmacology", topics: ["Cholinergic Drugs", "Adrenergic Drugs", "Autonomic Blockers"] },
              { chapter: "CNS Pharmacology", topics: ["Anesthetics", "Analgesics", "Anxiolytics", "Antiepileptics"] },
              { chapter: "Antimicrobials", topics: ["Antibiotics", "Antifungals", "Antivirals"] },
              { chapter: "Dental Pharmacology", topics: ["Local Anesthetics", "Vasoconstrictors", "Analgesics for Dental Pain", "Antibiotics in Dentistry"] },
            ],
          },
          {
            subject: "Dental Anatomy and Occlusion",
            chapters: [
              { chapter: "Tooth Morphology", topics: ["Incisors", "Canines", "Premolars", "Molars", "Deciduous Teeth"] },
              { chapter: "Root Canal Anatomy", topics: ["Pulp Chamber", "Root Canal System", "Accessory Canals"] },
              { chapter: "Occlusion", topics: ["Static Occlusion", "Dynamic Occlusion", "Articulation", "TMJ Function"] },
            ],
          },
          {
            subject: "Patient Management",
            chapters: [
              { chapter: "Medical History and Examination", topics: ["History Taking", "Physical Examination", "Vital Signs", "Risk Assessment"] },
              { chapter: "Medical Emergencies", topics: ["Syncope", "Anaphylaxis", "Cardiac Emergencies", "Diabetic Emergencies", "Seizures"] },
              { chapter: "Special Populations", topics: ["Pediatric Patients", "Geriatric Patients", "Medically Compromised Patients", "Pregnant Patients"] },
              { chapter: "Infection Control", topics: ["Standard Precautions", "Sterilization", "Disinfection", "Waste Management"] },
              { chapter: "Ethics and Professionalism", topics: ["Informed Consent", "Patient Rights", "Professional Conduct", "HIPAA"] },
            ],
          },
          {
            subject: "Clinical Treatment",
            chapters: [
              { chapter: "Operative Dentistry", topics: ["Caries Diagnosis", "Cavity Preparation", "Restorative Materials", "Direct Restorations", "Indirect Restorations"] },
              { chapter: "Endodontics", topics: ["Pulp Diagnosis", "Root Canal Treatment", "Endodontic Surgery", "Retreatment"] },
              { chapter: "Periodontics", topics: ["Periodontal Diagnosis", "Non-Surgical Therapy", "Periodontal Surgery", "Implant Dentistry"] },
              { chapter: "Prosthodontics", topics: ["Fixed Prosthodontics", "Removable Prosthodontics", "Implant Prosthodontics"] },
              { chapter: "Oral Surgery", topics: ["Exodontia", "Impacted Teeth", "Infections", "Trauma"] },
              { chapter: "Orthodontics", topics: ["Diagnosis", "Treatment Planning", "Appliances", "Retention"] },
              { chapter: "Pediatric Dentistry", topics: ["Behavior Management", "Prevention", "Restorative Dentistry", "Pulp Therapy"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= GDC Registration Prep (UK) =======================
  {
    curriculum: "GDC",
    category: 'dental',
    grades: [
      {
        grade: "GDC Registration Preparation",
        subjects: [
          {
            subject: "Clinical Dentistry",
            chapters: [
              { chapter: "Patient Assessment", topics: ["History Taking", "Clinical Examination", "Diagnosis", "Treatment Planning", "Risk Assessment"] },
              { chapter: "Prevention and Oral Health", topics: ["Oral Hygiene Instruction", "Diet Counseling", "Fluoride Therapy", "Fissure Sealants"] },
              { chapter: "Operative Dentistry", topics: ["Caries Management", "Restorative Procedures", "Endodontics", "Tooth Wear"] },
              { chapter: "Periodontology", topics: ["Periodontal Assessment", "Non-Surgical Treatment", "Maintenance"] },
              { chapter: "Prosthodontics", topics: ["Removable Prostheses", "Fixed Prostheses", "Implant-Supported Restorations"] },
              { chapter: "Oral Surgery", topics: ["Extractions", "Minor Oral Surgery", "Management of Complications"] },
              { chapter: "Orthodontics", topics: ["Assessment", "Referral Criteria", "Retention"] },
              { chapter: "Pediatric Dentistry", topics: ["Child Management", "Preventive Care", "Restorative Care", "Trauma"] },
            ],
          },
          {
            subject: "Ethics and Professionalism",
            chapters: [
              { chapter: "GDC Standards", topics: ["Standards for the Dental Team", "Scope of Practice", "Continuing Professional Development"] },
              { chapter: "Patient Communication", topics: ["Informed Consent", "Confidentiality", "Breaking Bad News", "Complaints Handling"] },
              { chapter: "Professional Relationships", topics: ["Working with Colleagues", "Referral Protocols", "Teamwork"] },
              { chapter: "Legal and Ethical Issues", topics: ["Dental Negligence", "Record Keeping", "Data Protection", "Fitness to Practice"] },
            ],
          },
          {
            subject: "Patient Care",
            chapters: [
              { chapter: "Medical Emergencies", topics: ["Recognition of Emergencies", "Basic Life Support", "Emergency Drugs", "Emergency Equipment"] },
              { chapter: "Infection Control", topics: ["Standard Precautions", "Decontamination", "Sterilization", "Personal Protective Equipment"] },
              { chapter: "Safeguarding", topics: ["Child Protection", "Vulnerable Adults", "Domestic Violence", "Reporting Concerns"] },
              { chapter: "Special Care Dentistry", topics: ["Physical Disabilities", "Learning Disabilities", "Mental Health", "Elderly Patients"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= LDS (Licence in Dental Surgery - RCS UK) =======================
  {
    curriculum: "LDS",
    category: 'dental',
    grades: [
      {
        grade: "Part 1 (Theory)",
        subjects: [
          {
            subject: "Clinical Dentistry",
            chapters: [
              { chapter: "Operative Dentistry", topics: ["Caries Diagnosis", "Cavity Preparation", "Restorative Materials", "Direct Restorations", "Indirect Restorations", "Tooth Wear Management"] },
              { chapter: "Endodontics", topics: ["Pulp Diagnosis", "Root Canal Treatment", "Endodontic Emergencies", "Retreatment", "Endodontic Surgery"] },
              { chapter: "Periodontology", topics: ["Periodontal Assessment", "Non-Surgical Therapy", "Periodontal Surgery", "Maintenance", "Implant Complications"] },
              { chapter: "Prosthodontics", topics: ["Complete Dentures", "Removable Partial Dentures", "Fixed Prosthodontics", "Implant Prosthodontics"] },
              { chapter: "Oral Surgery", topics: ["Surgical Extractions", "Impacted Teeth", "Dentoalveolar Surgery", "Complications Management"] },
              { chapter: "Oral Medicine", topics: ["Mucosal Diseases", "Salivary Gland Disorders", "TMJ Disorders", "Orofacial Pain"] },
            ],
          },
          {
            subject: "Basic Dental Sciences",
            chapters: [
              { chapter: "Anatomy", topics: ["Head and Neck Anatomy", "Dental Anatomy", "TMJ Anatomy", "Blood Supply", "Nerve Supply"] },
              { chapter: "Physiology", topics: ["Oral Physiology", "Cardiovascular Physiology", "Respiratory Physiology", "Relevant Systemic Physiology"] },
              { chapter: "Pathology", topics: ["General Pathology", "Oral Pathology", "Systemic Diseases Affecting Oral Health"] },
              { chapter: "Pharmacology", topics: ["Local Anesthetics", "Analgesics", "Antimicrobials", "Sedatives", "Drug Interactions"] },
              { chapter: "Microbiology", topics: ["Oral Microbiology", "Infection Control", "Sterilization", "Cross-Infection"] },
            ],
          },
          {
            subject: "Ethics, Law and Professionalism",
            chapters: [
              { chapter: "Dental Ethics", topics: ["Ethical Principles", "Patient Autonomy", "Beneficence", "Non-maleficence", "Justice"] },
              { chapter: "Dental Law", topics: ["GDC Regulations", "Consent", "Confidentiality", "Record Keeping", "Negligence"] },
              { chapter: "Professionalism", topics: ["Professional Conduct", "CPD", "Fitness to Practice", "Complaints Handling"] },
            ],
          },
          {
            subject: "Oral Pharmacology",
            chapters: [
              { chapter: "Local Anesthetics", topics: ["Mechanism of Action", "Types", "Complications", "Vasoconstrictors"] },
              { chapter: "Sedation", topics: ["Inhalation Sedation", "Oral Sedation", "IV Sedation", "Monitoring"] },
              { chapter: "Analgesics", topics: ["Opioid Analgesics", "Non-Opioid Analgesics", "Pain Management Protocols"] },
              { chapter: "Antimicrobials", topics: ["Antibiotics", "Antifungals", "Antivirals", "Prescribing Guidelines"] },
            ],
          },
          {
            subject: "Oral Medicine",
            chapters: [
              { chapter: "Mucosal Diseases", topics: ["Vesiculobullous Lesions", "Ulcerative Conditions", "White Lesions", "Red Lesions"] },
              { chapter: "Premalignant Lesions", topics: ["Leukoplakia", "Erythroplakia", "Oral Submucous Fibrosis", "Lichen Planus"] },
              { chapter: "Salivary Disorders", topics: ["Xerostomia", "Sialadenitis", "Salivary Gland Tumors"] },
              { chapter: "Orofacial Pain", topics: ["Trigeminal Neuralgia", "TMD", "Atypical Facial Pain", "Burning Mouth Syndrome"] },
            ],
          },
        ],
      },
      {
        grade: "Part 2 (Clinical/OSCE)",
        subjects: [
          {
            subject: "Practical Clinical Skills",
            chapters: [
              { chapter: "History Taking", topics: ["Comprehensive History", "Medical History", "Dental History", "Social History"] },
              { chapter: "Clinical Examination", topics: ["Extraoral Examination", "Intraoral Examination", "Special Tests", "Charting"] },
              { chapter: "Diagnosis", topics: ["Differential Diagnosis", "Definitive Diagnosis", "Treatment Planning"] },
              { chapter: "Treatment Planning", topics: ["Comprehensive Treatment Plans", "Sequencing", "Prognosis", "Informed Consent"] },
            ],
          },
          {
            subject: "Unseen Clinical Cases",
            chapters: [
              { chapter: "Restorative Cases", topics: ["Caries Management", "Endodontic Cases", "Prosthodontic Cases", "Periodontal Cases"] },
              { chapter: "Surgical Cases", topics: ["Extraction Cases", "Surgical Pathology", "Trauma Cases"] },
              { chapter: "Medical Emergencies", topics: ["Recognition and Management", "BLS", "Drug Administration"] },
              { chapter: "Ethics Scenarios", topics: ["Consent Issues", "Confidentiality", "Professional Boundaries"] },
            ],
          },
          {
            subject: "Communication Skills",
            chapters: [
              { chapter: "Patient Communication", topics: ["Explaining Diagnoses", "Discussing Treatment Options", "Informed Consent", "Breaking Bad News"] },
              { chapter: "Professional Communication", topics: ["Referral Letters", "Communication with Colleagues", "Record Keeping"] },
            ],
          },
        ],
      },
    ],
  },

  // ======================= ORE (Overseas Registration Examination - UK) =======================
  {
    curriculum: "ORE",
    category: 'dental',
    grades: [
      {
        grade: "Part 1 (Computer-Based)",
        subjects: [
          {
            subject: "Clinical Dentistry",
            chapters: [
              { chapter: "Operative Dentistry", topics: ["Caries Detection", "Cavity Preparation Principles", "Restorative Materials", "Direct Restorations", "Indirect Restorations"] },
              { chapter: "Endodontics", topics: ["Pulp Pathology", "Diagnosis", "Root Canal Treatment", "Endodontic Emergencies", "Retreatment Considerations"] },
              { chapter: "Periodontology", topics: ["Periodontal Assessment", "Disease Classification", "Non-Surgical Treatment", "Surgical Principles", "Maintenance"] },
              { chapter: "Prosthodontics", topics: ["Treatment Planning", "Complete Dentures", "Partial Dentures", "Fixed Prosthodontics", "Implant Considerations"] },
              { chapter: "Oral Surgery", topics: ["Extraction Principles", "Surgical Extractions", "Impacted Teeth", "Post-Operative Care", "Complications"] },
              { chapter: "Orthodontics", topics: ["Assessment and Diagnosis", "Referral Criteria", "Retention Principles"] },
              { chapter: "Pediatric Dentistry", topics: ["Child Development", "Behavior Management", "Preventive Care", "Restorative Dentistry", "Pulp Therapy", "Trauma Management"] },
            ],
          },
          {
            subject: "Basic Dental Science",
            chapters: [
              { chapter: "Anatomy", topics: ["Head and Neck Anatomy", "Dental Anatomy", "Neuroanatomy", "Blood Supply", "Lymphatic Drainage"] },
              { chapter: "Physiology", topics: ["Oral Physiology", "Pain Physiology", "Cardiovascular Considerations", "Respiratory Considerations"] },
              { chapter: "Pathology", topics: ["General Pathology", "Oral Pathology", "Systemic Disease Effects"] },
              { chapter: "Pharmacology", topics: ["Local Anesthetics", "Analgesics", "Antimicrobials", "Sedatives", "Emergency Drugs"] },
              { chapter: "Microbiology", topics: ["Oral Flora", "Caries Microbiology", "Periodontal Microbiology", "Infection Control"] },
            ],
          },
          {
            subject: "Human Disease",
            chapters: [
              { chapter: "Cardiovascular Diseases", topics: ["Hypertension", "Ischemic Heart Disease", "Heart Failure", "Infective Endocarditis", "Anticoagulant Therapy"] },
              { chapter: "Respiratory Diseases", topics: ["Asthma", "COPD", "Respiratory Infections"] },
              { chapter: "Endocrine Disorders", topics: ["Diabetes Mellitus", "Thyroid Disorders", "Adrenal Disorders"] },
              { chapter: "Hematological Disorders", topics: ["Anemia", "Bleeding Disorders", "Leukemia"] },
              { chapter: "Neurological Disorders", topics: ["Epilepsy", "Parkinson's Disease", "Multiple Sclerosis", "Stroke"] },
              { chapter: "Liver and Renal Diseases", topics: ["Liver Failure", "Hepatitis", "Chronic Kidney Disease", "Dialysis Patients"] },
              { chapter: "Immunological Conditions", topics: ["HIV/AIDS", "Immunosuppression", "Allergies"] },
            ],
          },
          {
            subject: "Law and Ethics",
            chapters: [
              { chapter: "Dental Ethics", topics: ["Ethical Principles", "Patient Autonomy", "Beneficence and Non-maleficence", "Professional Values"] },
              { chapter: "UK Dental Law", topics: ["GDC Standards", "Consent", "Confidentiality", "Mental Capacity Act", "Safeguarding"] },
              { chapter: "Professional Practice", topics: ["Record Keeping", "Complaints Handling", "Fitness to Practice", "CPD Requirements"] },
            ],
          },
        ],
      },
      {
        grade: "Part 2 (Clinical/Manikin)",
        subjects: [
          {
            subject: "Restorative Dentistry (Manikin)",
            chapters: [
              { chapter: "Cavity Preparation", topics: ["Class I Preparations", "Class II Preparations", "Class III Preparations", "Class IV Preparations", "Class V Preparations"] },
              { chapter: "Crown Preparation", topics: ["Full Crown Preparation", "PFM Crown Preparation", "All-Ceramic Crown Preparation"] },
              { chapter: "Endodontics", topics: ["Access Cavity Preparation", "Canal Instrumentation", "Obturation"] },
            ],
          },
          {
            subject: "Clinical Skills (OSCE)",
            chapters: [
              { chapter: "History Taking", topics: ["Dental History", "Medical History", "Social History", "Chief Complaint Assessment"] },
              { chapter: "Clinical Examination", topics: ["Extraoral Examination", "Intraoral Examination", "Periodontal Assessment", "Radiographic Interpretation"] },
              { chapter: "Diagnosis and Treatment Planning", topics: ["Case Analysis", "Differential Diagnosis", "Treatment Options", "Prognosis"] },
              { chapter: "Communication Skills", topics: ["Explaining Procedures", "Obtaining Consent", "Patient Education", "Breaking Bad News"] },
              { chapter: "Medical Emergencies", topics: ["Recognition", "Basic Life Support", "Emergency Drug Administration", "Emergency Equipment Use"] },
              { chapter: "Ethics Stations", topics: ["Consent Scenarios", "Confidentiality Issues", "Professional Conduct", "Complaints"] },
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

export const getCurriculumsByCategory = (category: 'academic' | 'dental' | 'other'): string[] => {
  return CURRICULUM_TEMPLATES.filter(c => c.category === category).map(c => c.curriculum);
};

export const getGradesForCurriculum = (curriculum: string): string[] => {
  const curriculumData = CURRICULUM_TEMPLATES.find(c => c.curriculum === curriculum);
  return curriculumData?.grades.map(g => g.grade) || [];
};

export const getCurriculumCategory = (curriculum: string): 'academic' | 'dental' | 'other' | undefined => {
  const curriculumData = CURRICULUM_TEMPLATES.find(c => c.curriculum === curriculum);
  return curriculumData?.category;
};
