
export interface Project {
  id: number;
  title: string;
  category: 'Web' | 'Design' | 'Training';
  description: string;
  image: string;
  link: string;
  tags: string[];
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

/* Learning Portal Types */
export type UserRole = 'student' | 'tutor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
}

export interface Badge {
  id: string;
  courseId: string;
  name: string;
  icon: string;
  color: string;
  earnedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
  category: string;
  enrolledStudents?: number;
  tutorId?: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  assessmentType?: 'quiz' | 'written';
  prompt?: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  questions?: Question[];
  writtenPrompt?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Submission {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  content: string;
  type: 'essay' | 'code';
  aiScore: number;
  aiFeedback: string;
  tutorScore?: number;
  tutorFeedback?: string;
  status: 'pending' | 'graded';
  timestamp: string;
}

export interface StudentProgress {
  userId: string;
  courseId: string;
  completedLessons: string[]; // lesson IDs
  quizScore: number | null;
  lastAccessed: string;
  timeSpentMinutes: number;
  earnedBadge?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  groupId: string; // Course ID or "direct-tutor-id"
}

export interface ChatGroup {
  id: string;
  name: string;
  type: 'group' | 'direct';
  courseId?: string;
}
