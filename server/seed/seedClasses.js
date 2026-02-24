const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

const Class = require("../models/Class");

const classes = [
  // ── Junior: Class 3 to 9 ─────────────────────────────────
  {
    title: "Class 3",
    subtitle: "Foundation of curiosity & early concepts",
    category: "junior",
    level: "Beginner",
    instructor: "AcadLearn Jr. Team",
    description: "A playful introduction to numbers, words, and the world around us. Build strong foundations through stories, puzzles, and hands-on activities.",
    badge: "Popular",
    color: "bg-indigo-600",
    rating: 4.8,
    totalLessons: 10,
    duration: "2 months",
    enrolledCount: 980,
    curriculum: [
      { title: "Numbers & Basic Arithmetic", duration: "40 min" },
      { title: "Reading & Phonics", duration: "35 min" },
      { title: "My Environment", duration: "40 min" },
      { title: "Shapes & Patterns", duration: "30 min" },
      { title: "Storytelling & Creative Writing", duration: "45 min" },
    ],
  },
  {
    title: "Class 4",
    subtitle: "Building blocks for young minds",
    category: "junior",
    level: "Beginner",
    instructor: "AcadLearn Jr. Team",
    description: "Strengthen core skills in Maths, English and Science with concept-first lessons that connect learning to real life.",
    badge: "",
    color: "bg-indigo-600",
    rating: 4.7,
    totalLessons: 10,
    duration: "2 months",
    enrolledCount: 860,
    curriculum: [
      { title: "Multiplication & Division", duration: "45 min" },
      { title: "Grammar & Comprehension", duration: "40 min" },
      { title: "Plants & Animals", duration: "45 min" },
      { title: "Maps & Our World", duration: "40 min" },
      { title: "Creative Projects", duration: "50 min" },
    ],
  },
  {
    title: "Class 5",
    subtitle: "Expanding horizons — science & language",
    category: "junior",
    level: "Beginner",
    instructor: "AcadLearn Jr. Team",
    description: "Dive deeper into Maths, Science and Languages. Build analytical thinking and communication skills through interactive lessons.",
    badge: "New",
    color: "bg-indigo-600",
    rating: 4.8,
    totalLessons: 12,
    duration: "2.5 months",
    enrolledCount: 1020,
    curriculum: [
      { title: "Fractions & Decimals", duration: "50 min" },
      { title: "Essay Writing", duration: "45 min" },
      { title: "Human Body Systems", duration: "50 min" },
      { title: "History & Civilisations", duration: "45 min" },
      { title: "Problem Solving Workshop", duration: "55 min" },
    ],
  },
  {
    title: "Class 6",
    subtitle: "Middle school: logic, science & critical thinking",
    category: "junior",
    level: "Intermediate",
    instructor: "AcadLearn Jr. Team",
    description: "Transition to middle-school level thinking. Tackle algebra, experiments and essay arguments with guided mentoring.",
    badge: "Popular",
    color: "bg-indigo-600",
    rating: 4.9,
    totalLessons: 14,
    duration: "3 months",
    enrolledCount: 1340,
    curriculum: [
      { title: "Introduction to Algebra", duration: "55 min" },
      { title: "Scientific Method & Experiments", duration: "60 min" },
      { title: "Reading Non-fiction", duration: "45 min" },
      { title: "Geography & Climate", duration: "50 min" },
      { title: "Logical Reasoning Puzzles", duration: "50 min" },
      { title: "Group Project", duration: "60 min" },
    ],
  },
  {
    title: "Class 7",
    subtitle: "Concepts, experiments & real-world maths",
    category: "junior",
    level: "Intermediate",
    instructor: "AcadLearn Jr. Team",
    description: "Build on algebraic thinking, explore Physics concepts and refine writing skills. Perfect for students aiming to excel in school exams.",
    badge: "",
    color: "bg-indigo-600",
    rating: 4.7,
    totalLessons: 14,
    duration: "3 months",
    enrolledCount: 890,
    curriculum: [
      { title: "Equations & Inequalities", duration: "55 min" },
      { title: "Force & Motion", duration: "60 min" },
      { title: "Persuasive Writing", duration: "45 min" },
      { title: "Cell Biology", duration: "55 min" },
      { title: "Data Handling & Statistics", duration: "50 min" },
    ],
  },
  {
    title: "Class 8",
    subtitle: "Advanced thinking for board exam readiness",
    category: "junior",
    level: "Intermediate",
    instructor: "AcadLearn Jr. Team",
    description: "Prepare confidently for board-style assessments. Master quadratic equations, advanced science and analytical comprehension.",
    badge: "Trending",
    color: "bg-indigo-600",
    rating: 4.8,
    totalLessons: 16,
    duration: "3.5 months",
    enrolledCount: 1150,
    curriculum: [
      { title: "Quadratic Equations", duration: "60 min" },
      { title: "Light & Sound", duration: "55 min" },
      { title: "Chemical Reactions", duration: "60 min" },
      { title: "Comprehension & Literature", duration: "50 min" },
      { title: "Geometry & Mensuration", duration: "60 min" },
      { title: "Mock Test & Review", duration: "75 min" },
    ],
  },
  {
    title: "Class 9",
    subtitle: "Board foundation — maths, science & more",
    category: "junior",
    level: "Advanced",
    instructor: "AcadLearn Jr. Team",
    description: "A rigorous preparation program for Class 9 students. Covers NCERT-aligned topics in Maths and Science with concept clarity and exam strategy.",
    badge: "Best Seller",
    color: "bg-indigo-600",
    rating: 4.9,
    totalLessons: 18,
    duration: "4 months",
    enrolledCount: 1680,
    curriculum: [
      { title: "Number Systems & Polynomials", duration: "60 min" },
      { title: "Coordinate Geometry", duration: "55 min" },
      { title: "Matter & Atoms", duration: "60 min" },
      { title: "Tissues & Diversity", duration: "55 min" },
      { title: "Motion & Force (Physics)", duration: "65 min" },
      { title: "Statistics & Probability", duration: "60 min" },
      { title: "Full Mock Test", duration: "90 min" },
    ],
  },

  // ── Professional Courses ──────────────────────────────────
  {
    title: "Full-Stack Web Development",
    subtitle: "HTML → CSS → JS → React → Node → MongoDB",
    category: "professional",
    level: "Intermediate",
    instructor: "Rahul Mehta",
    description:
      "A comprehensive bootcamp covering the entire web development stack. Go from zero to deploying production-ready applications with industry-standard tools.",
    badge: "Best Seller",
    color: "bg-indigo-600",
    rating: 4.9,
    totalLessons: 36,
    duration: "6 months",
    enrolledCount: 3100,
    curriculum: [
      { title: "HTML5 & Semantic Markup", duration: "3 hrs", description: "Build well-structured, accessible web pages." },
      { title: "CSS3, Flexbox & Grid", duration: "4 hrs", description: "Style beautiful, responsive layouts." },
      { title: "JavaScript Essentials", duration: "8 hrs", description: "Core JS concepts — functions, arrays, DOM, async/await." },
      { title: "React.js Fundamentals", duration: "6 hrs", description: "Component-based UI with hooks and state management." },
      { title: "Node.js & Express", duration: "5 hrs", description: "Build REST APIs with Express and middleware." },
      { title: "MongoDB & Mongoose", duration: "4 hrs", description: "Schema design, queries, and database integration." },
      { title: "Deployment with Vercel & Railway", duration: "2 hrs", description: "Ship your full-stack app live on the internet." },
    ],
  },
  {
    title: "Data Science with Python",
    subtitle: "From data analysis to machine learning",
    category: "professional",
    level: "Intermediate",
    instructor: "Dr. Anjali Verma",
    description:
      "Master Python for data analysis, visualization, and machine learning. Build real-world projects and gain skills that employers are actively looking for.",
    badge: "Popular",
    color: "bg-emerald-600",
    rating: 4.8,
    totalLessons: 28,
    duration: "5 months",
    enrolledCount: 2450,
    curriculum: [
      { title: "Python for Data Science", duration: "5 hrs", description: "NumPy, Pandas, and data wrangling essentials." },
      { title: "Data Visualization", duration: "3 hrs", description: "Matplotlib, Seaborn, and Plotly for insightful charts." },
      { title: "Statistics & Probability", duration: "4 hrs", description: "Descriptive stats, distributions, and hypothesis testing." },
      { title: "Machine Learning Basics", duration: "6 hrs", description: "Regression, classification, and clustering with scikit-learn." },
      { title: "Capstone Project", duration: "4 hrs", description: "End-to-end data science project from raw data to insights." },
    ],
  },
  {
    title: "UI/UX Design Masterclass",
    subtitle: "Figma · Design Systems · User Research",
    category: "professional",
    level: "Beginner",
    instructor: "Sneha Kapoor",
    description:
      "Learn to design beautiful, user-centered digital products. Covers Figma, design principles, user research, prototyping, and handoff to developers.",
    badge: "New",
    color: "bg-rose-500",
    rating: 4.7,
    totalLessons: 20,
    duration: "3 months",
    enrolledCount: 1680,
    curriculum: [
      { title: "Design Thinking & UX Principles", duration: "2 hrs", description: "Empathy, ideation, and the design process." },
      { title: "Figma Crash Course", duration: "3 hrs", description: "Frames, components, auto-layout and styles." },
      { title: "User Research & Personas", duration: "2 hrs", description: "Interviews, surveys, and building user personas." },
      { title: "Wireframing & Prototyping", duration: "3 hrs", description: "Low and high-fidelity prototypes with interactive flows." },
      { title: "Design Systems", duration: "2 hrs", description: "Tokens, libraries, and scalable component systems." },
      { title: "Portfolio Project", duration: "4 hrs", description: "Design a real app end-to-end and add it to your portfolio." },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Class.deleteMany({});
    console.log("Cleared existing classes");

    const inserted = await Class.insertMany(classes);
    console.log(`Seeded ${inserted.length} classes successfully`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
