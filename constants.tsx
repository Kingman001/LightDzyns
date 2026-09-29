
import { Project, Service, Testimonial, Course, Assessment, User, StudentProgress, Message, Submission, Badge } from './types';

export const SERVICES: Service[] = [
  {
    id: 1,
    title: 'Web Development',
    description: 'Crafting high-performance, responsive websites and complex web applications using modern technologies like React, Next.js, and Node.js.',
    icon: 'fa-solid fa-code',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Graphic Design',
    description: 'Transforming ideas into stunning visual stories through brand identity, UI/UX design, and marketing collateral.',
    icon: 'fa-solid fa-bezier-curve',
    color: 'bg-purple-500'
  },
  {
    id: 3,
    title: 'Digital Skills Training',
    description: 'Empowering the next generation of tech talent with hands-on training in coding, design, and digital literacy.',
    icon: 'fa-solid fa-user-graduate',
    color: 'bg-orange-500'
  }
];

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Modern E-commerce Platform',
    category: 'Web',
    description: 'A full-featured shopping experience with cart management and secure checkout.',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800',
    link: '#',
    tags: ['React', 'Tailwind', 'Node.js']
  },
  {
    id: 2,
    title: 'Brand Identity: Zenith',
    category: 'Design',
    description: 'Complete visual rebranding for a fintech startup, including logo, typography, and color palette.',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800',
    link: '#',
    tags: ['Branding', 'Adobe CC', 'UI/UX']
  },
  {
    id: 3,
    title: 'Task Management System',
    category: 'Web',
    description: 'Collaborative productivity tool with real-time updates and team dashboards.',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800',
    link: '#',
    tags: ['Next.js', 'Firebase', 'TypeScript']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'CEO at TechStream',
    content: 'LightDzyns took our abstract ideas and turned them into a world-class digital platform. Their attention to detail in design is unmatched.',
    avatar: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    id: 2,
    name: 'David Okafor',
    role: 'Product Manager',
    content: 'The training my team received was transformative. We went from basics to building complex apps in weeks.',
    avatar: 'https://i.pravatar.cc/150?u=david'
  }
];

/* Portal Data */
export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Mastering Modern Web Architecture',
    description: 'Learn React, Next.js, and high-performance frontend patterns.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400',
    category: 'Development',
    enrolledStudents: 124,
    tutorId: 't-main',
    lessons: [
      { 
        id: 'l1', 
        title: 'React Fundamentals', 
        content: `
          React is a declarative, efficient, and flexible JavaScript library for building user interfaces.

          ### 1. JSX (JavaScript XML)
          JSX allows us to write HTML-like code inside JavaScript. It is transformed into regular JavaScript objects that React uses to update the UI.
          Example: \`const element = <h1>Hello World</h1>;\`

          ### 2. Props (Properties)
          Props are read-only data passed from a parent component to a child component. They allow components to be dynamic and reusable.
          \`<Profile name="Alex" />\`

          ### 3. State
          State is a built-in object that stores data values belonging to the component. When the state object changes, the component re-renders.
          In modern React, we use the \`useState\` hook to manage this.
        `, 
        duration: '15m', 
        assessmentType: 'quiz' 
      },
      { id: 'l2', title: 'Advanced State Management', content: 'State management is a way to handle data across different parts of an application.', duration: '25m', assessmentType: 'written', prompt: 'Explain the benefits of using a Global State management tool like Zustand over standard React Context API.' },
      { id: 'l3', title: 'Next.js Routing', content: 'Understanding App Router and Pages Router.', duration: '20m', assessmentType: 'quiz' }
    ]
  },
  {
    id: 'c2',
    title: 'UI/UX Fundamentals for Startups',
    description: 'Design beautiful, conversion-focused interfaces from scratch.',
    thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=400',
    category: 'Design',
    enrolledStudents: 89,
    tutorId: 't-main',
    lessons: [
      { id: 'l3', title: 'Color Theory', content: 'Choosing palettes that convert.', duration: '10m', assessmentType: 'quiz' },
      { id: 'l4', title: 'Typography Systems', content: 'Hierarchy and readability.', duration: '20m', assessmentType: 'written', prompt: 'Design a typography scale for a mobile e-commerce app and explain your choice of font pairings.' }
    ]
  }
];

export const COURSE_BADGES: Badge[] = [
  {
    id: 'b1',
    courseId: 'c1',
    name: 'Web Architect',
    icon: 'fa-solid fa-cubes-stacked',
    color: 'from-blue-400 to-indigo-600'
  },
  {
    id: 'b2',
    courseId: 'c2',
    name: 'UX Visionary',
    icon: 'fa-solid fa-wand-magic-sparkles',
    color: 'from-purple-400 to-pink-600'
  }
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    userId: 's1',
    courseId: 'c1',
    lessonId: 'l2',
    content: 'I believe Zustand is better because it prevents unnecessary re-renders that happen in Context API when the root provider updates.',
    type: 'essay',
    aiScore: 85,
    aiFeedback: 'Good technical understanding of re-rendering, but could expand more on the "flux" pattern.',
    status: 'graded',
    timestamp: '2024-03-21T10:00:00Z'
  }
];

export const ASSESSMENTS: Assessment[] = [
  {
    id: 'a1',
    courseId: 'c1',
    questions: [
      { id: 'q1', text: 'Which hook is used for side effects in React?', options: ['useState', 'useEffect', 'useMemo', 'useRef'], correctAnswer: 1 },
      { id: 'q2', text: 'What does "SSR" stand for?', options: ['Static Site Rendering', 'Server Side React', 'Server Side Rendering', 'Simple Site Router'], correctAnswer: 2 }
    ]
  }
];

export const MOCK_STUDENTS: User[] = [
  { id: 's1', name: 'James Wilson', email: 'james@example.com', role: 'student', avatar: 'https://i.pravatar.cc/150?u=s1', bio: 'Aspiring full-stack developer.' },
  { id: 's2', name: 'Emma Thompson', email: 'emma@example.com', role: 'student', avatar: 'https://i.pravatar.cc/150?u=s2', bio: 'Graphic designer moving into UI/UX.' },
  { id: 's3', name: 'Liam Chen', email: 'liam@example.com', role: 'student', avatar: 'https://i.pravatar.cc/150?u=s3', bio: 'Tech entrepreneur.' }
];

export const MOCK_PROGRESS: StudentProgress[] = [
  { userId: 's-main', courseId: 'c1', completedLessons: ['l1'], quizScore: null, lastAccessed: '2024-03-21', timeSpentMinutes: 45 },
  { userId: 's-main', courseId: 'c2', completedLessons: ['l3', 'l4'], quizScore: 100, lastAccessed: '2024-03-20', timeSpentMinutes: 120, earnedBadge: true },
  { userId: 's1', courseId: 'c1', completedLessons: ['l1', 'l2'], quizScore: 90, lastAccessed: '2024-03-20', timeSpentMinutes: 180 },
  { userId: 's2', courseId: 'c1', completedLessons: ['l1'], quizScore: null, lastAccessed: '2024-03-18', timeSpentMinutes: 60 }
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 't-main', text: 'Welcome to the course everyone! Feel free to ask any questions here.', timestamp: '2024-03-20T10:00:00Z', groupId: 'c1' },
  { id: 'm2', senderId: 's1', text: 'Thanks Professor! Excited to start.', timestamp: '2024-03-20T10:05:00Z', groupId: 'c1' },
  { id: 'm3', senderId: 't-main', text: 'Hey Alex, saw your progress on Module 1. Good job!', timestamp: '2024-03-21T09:00:00Z', groupId: 'direct-s-main' },
  { id: 'm4', senderId: 's2', text: 'Has anyone finished the UI/UX final project yet?', timestamp: '2024-03-21T11:00:00Z', groupId: 'c2' },
  { id: 'm5', senderId: 's1', text: 'I am stuck on the routing part of Next.js, any tips?', timestamp: '2024-03-21T12:00:00Z', groupId: 'c1' }
];
