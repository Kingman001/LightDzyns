
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Course, Lesson, StudentProgress, Message, Submission, Badge } from '../types';
import { COURSES, ASSESSMENTS, MOCK_STUDENTS, MOCK_PROGRESS, MOCK_MESSAGES, MOCK_SUBMISSIONS, COURSE_BADGES } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

interface LearningPortalProps {
  onClose: () => void;
}

type PortalView = 'dashboard' | 'my-courses' | 'lesson' | 'assessment' | 'students' | 'settings' | 'student-detail' | 'community' | 'written-assessment' | 'gradebook' | 'achievements';
type CourseFilter = 'active' | 'completed';
type GradeFilter = 'all' | 'pending' | 'graded';

const LearningPortal: React.FC<LearningPortalProps> = ({ onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [roleSelection, setRoleSelection] = useState<UserRole>('student');
  const [view, setView] = useState<PortalView>('dashboard');
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('active');
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Settings mock state
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifBrowser, setNotifBrowser] = useState(false);
  
  // Dynamic state for simulation
  const [userProgress, setUserProgress] = useState<StudentProgress[]>(MOCK_PROGRESS);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [writtenInput, setWrittenInput] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  
  // Badge Unlocked State
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [activeChatGroupId, setActiveChatGroupId] = useState<string>('c1');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync profile edits with user state
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    if (view === 'community') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, view, activeChatGroupId]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      id: roleSelection === 'student' ? 's-main' : 't-main',
      name: roleSelection === 'student' ? 'Alex Student' : 'Professor Light',
      email: 'user@lightdzyns.tech',
      role: roleSelection,
      avatar: `https://i.pravatar.cc/150?u=${roleSelection}`,
      bio: roleSelection === 'student' ? 'Enthusiastic learner focusing on web technologies.' : 'Senior IT consultant and educator at LightDzyns.'
    });
  };

  const updateProgress = (lessonId: string, courseId: string) => {
    setUserProgress(prev => {
      const existing = prev.find(p => p.userId === user?.id && p.courseId === courseId);
      if (existing) {
        if (existing.completedLessons.includes(lessonId)) return prev;
        
        const updatedLessons = [...existing.completedLessons, lessonId];
        const course = COURSES.find(c => c.id === courseId);
        const isNowFinished = course && updatedLessons.length === course.lessons.length;
        
        if (isNowFinished && !existing.earnedBadge) {
          const badge = COURSE_BADGES.find(b => b.courseId === courseId);
          if (badge) {
             setUnlockedBadge(badge);
          }
        }

        return prev.map(p => 
          (p.userId === user?.id && p.courseId === courseId) 
          ? { ...p, completedLessons: updatedLessons, lastAccessed: new Date().toISOString(), earnedBadge: isNowFinished || p.earnedBadge }
          : p
        );
      } else {
        return [...prev, {
          userId: user?.id || 's-main',
          courseId,
          completedLessons: [lessonId],
          quizScore: null,
          lastAccessed: new Date().toISOString(),
          timeSpentMinutes: 0
        }];
      }
    });
  };

  const handleMarkComplete = (lessonId: string, courseId: string) => {
    if (user?.role !== 'student' || !activeCourse) return;
    updateProgress(lessonId, courseId);
    const currentIndex = activeCourse.lessons.findIndex(l => l.id === lessonId);
    if (currentIndex !== -1 && currentIndex + 1 < activeCourse.lessons.length) {
      setActiveLesson(activeCourse.lessons[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setView('dashboard');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderId: user.id,
      text: chatInput,
      timestamp: new Date().toISOString(),
      groupId: activeChatGroupId
    };
    setMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  const handleWrittenSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writtenInput.trim() || !user || !activeCourse || !activeLesson) return;
    setIsGrading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Assess the following student submission for the lesson "${activeLesson.title}" based on this prompt: "${activeLesson.prompt}". 
        Submission: "${writtenInput}". 
        Provide a numeric score (0-100) and constructive feedback in JSON format with keys "score" and "feedback".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING }
            },
            required: ["score", "feedback"]
          }
        }
      });
      const result = JSON.parse(response.text || '{}');
      const newSub: Submission = {
        id: `sub-${Date.now()}`,
        userId: user.id,
        courseId: activeCourse.id,
        lessonId: activeLesson.id,
        content: writtenInput,
        type: activeLesson.title.toLowerCase().includes('code') ? 'code' : 'essay',
        aiScore: result.score || 0,
        aiFeedback: result.feedback || "Good effort.",
        status: 'graded',
        timestamp: new Date().toISOString()
      };
      setAllSubmissions(prev => [...prev, newSub]);
      updateProgress(activeLesson.id, activeCourse.id);
      setAssessmentScore(result.score);
      setWrittenInput('');
      setView('assessment'); 
    } catch (error) {
      console.error("AI Grading failed", error);
    } finally {
      setIsGrading(false);
    }
  };

  const handleTutorGradeUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubmission) return;
    setAllSubmissions(prev => prev.map(s => s.id === editingSubmission.id ? { ...editingSubmission, status: 'graded' } : s));
    setEditingSubmission(null);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setUser({ ...user, name: profileName, bio: profileBio });
      alert('Profile settings saved successfully!');
    }
  };

  const getStudentProgress = (studentId: string) => {
    return userProgress.filter(p => p.userId === studentId);
  };

  const getCourseProgress = (courseId: string) => {
    if (!user) return 0;
    const progress = getStudentProgress(user.id).find(p => p.courseId === courseId);
    if (!progress) return 0;
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return 0;
    return Math.round((progress.completedLessons.length / course.lessons.length) * 100);
  };

  const getEarnedBadges = () => {
    if (!user) return [];
    const completedCourseIds = userProgress
      .filter(p => p.userId === user.id && p.earnedBadge)
      .map(p => p.courseId);
    return COURSE_BADGES.filter(b => completedCourseIds.includes(b.courseId));
  };

  const getTutorStats = () => {
    const tutorCourses = COURSES.filter(c => c.tutorId === user?.id);
    const tutorCourseIds = tutorCourses.map(c => c.id);
    const relatedProgress = userProgress.filter(p => tutorCourseIds.includes(p.courseId));
    
    const performanceList = MOCK_STUDENTS.map(s => {
      const sp = relatedProgress.filter(p => p.userId === s.id);
      if (sp.length === 0) return null;
      
      const totalPossible = tutorCourses.reduce((acc, c) => acc + c.lessons.length, 0);
      const totalDone = sp.reduce((acc, p) => acc + p.completedLessons.length, 0);
      const completionRate = (totalDone / totalPossible) * 100;
      
      const subs = allSubmissions.filter(sub => sub.userId === s.id && tutorCourseIds.includes(sub.courseId));
      const avgGrade = subs.length > 0 ? subs.reduce((acc, sub) => acc + (sub.tutorScore ?? sub.aiScore), 0) / subs.length : 0;
      
      return { student: s, completionRate, avgGrade };
    }).filter(Boolean) as { student: User, completionRate: number, avgGrade: number }[];

    const excelling = performanceList.filter(p => p.completionRate > 70 || p.avgGrade > 85);
    const struggling = performanceList.filter(p => p.completionRate < 30 || (p.avgGrade < 60 && p.avgGrade > 0));

    return { 
      totalStudents: performanceList.length,
      avgCompletion: performanceList.reduce((acc, p) => acc + p.completionRate, 0) / (performanceList.length || 1),
      excelling, 
      struggling 
    };
  };

  const theme = {
    bg: isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900',
    card: isDarkMode ? 'bg-slate-900 border-slate-800 shadow-xl shadow-black/20' : 'bg-white border-gray-100 shadow-sm',
    sidebar: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200',
    textPrimary: isDarkMode ? 'text-slate-50' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    border: isDarkMode ? 'border-slate-800' : 'border-gray-100',
    input: isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-blue-400' : 'bg-gray-50 border-gray-100 text-gray-700 focus:ring-blue-500',
    navActive: isDarkMode ? 'bg-blue-600/10 text-blue-400 font-bold' : 'bg-blue-50 text-blue-600 font-bold',
    navHover: isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-50 text-gray-500',
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 relative shadow-2xl transition-all duration-300">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
              <i className="fa-solid fa-user-graduate text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Light Academy</h2>
            <p className="text-gray-500 text-sm">Empowering your digital future</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setRoleSelection('student')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${roleSelection === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Student
            </button>
            <button 
              onClick={() => setRoleSelection('tutor')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${roleSelection === 'tutor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Tutor
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
              <input type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="academy@lightdzyns.tech" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
              <input type="password" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98]">
              {authMode === 'login' ? 'Enter Academy' : 'Join Academy'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {authMode === 'login' ? "New to the portal?" : "Already have an account?"}{' '}
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-blue-600 font-bold hover:underline"
            >
              {authMode === 'login' ? 'Create Account' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  const tutorStats = user.role === 'tutor' ? getTutorStats() : null;

  return (
    <div className={`fixed inset-0 ${theme.bg} z-[100] flex flex-col md:flex-row transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`w-full md:w-64 ${theme.sidebar} border-r flex flex-col p-6 space-y-8 transition-colors duration-300`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-blue-500/20">L</div>
            <span className={`font-bold ${theme.textPrimary} tracking-tight`}>Light Academy</span>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-gray-100 text-gray-500'}`}
          >
            <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          <button onClick={() => setView('dashboard')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${view === 'dashboard' ? theme.navActive : theme.navHover}`}>
            <i className="fa-solid fa-house-chimney"></i> Dashboard
          </button>
          <button onClick={() => setView('my-courses')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${view === 'my-courses' ? theme.navActive : theme.navHover}`}>
            <i className="fa-solid fa-book-open"></i> {user.role === 'tutor' ? 'Managed Courses' : 'My Learning'}
          </button>
          <button onClick={() => setView('community')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${view === 'community' ? theme.navActive : theme.navHover}`}>
            <i className="fa-solid fa-comments"></i> Community
          </button>
          {user.role === 'student' && (
            <button onClick={() => setView('achievements')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${view === 'achievements' ? theme.navActive : theme.navHover}`}>
              <i className="fa-solid fa-medal"></i> Achievements
            </button>
          )}
          {user.role === 'tutor' && (
            <>
              <button onClick={() => setView('students')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${view === 'students' ? theme.navActive : theme.navHover}`}>
                <i className="fa-solid fa-users"></i> My Students
              </button>
              <button onClick={() => setView('gradebook')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${view === 'gradebook' ? theme.navActive : theme.navHover}`}>
                <i className="fa-solid fa-vial-circle-check"></i> Gradebook
              </button>
            </>
          )}
          <button onClick={() => setView('settings')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${view === 'settings' ? theme.navActive : theme.navHover}`}>
            <i className="fa-solid fa-gear"></i> Settings
          </button>
        </nav>

        <div className={`pt-6 border-t ${theme.border} flex items-center gap-3`}>
          <img src={user.avatar} className={`w-10 h-10 rounded-full bg-gray-100 border ${theme.border}`} alt="Avatar" />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${theme.textPrimary} truncate`}>{user.name}</p>
            <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest">{user.role}</p>
          </div>
          <button onClick={() => setUser(null)} className="text-gray-400 hover:text-red-500 transition-colors">
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          
          {/* Dashboard View */}
          {view === 'dashboard' && (
            <div className="space-y-10 animate-fade-in">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className={`text-3xl font-extrabold ${theme.textPrimary}`}>Academy Dashboard</h1>
                  <p className={theme.textSecondary + " mt-1"}>Insights into the learning journey.</p>
                </div>
              </div>

              {user.role === 'tutor' && tutorStats && (
                <div className="space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className={`${theme.card} p-8 rounded-[2.5rem] border space-y-2 relative overflow-hidden`}>
                         <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl"><i className="fa-solid fa-user-group text-blue-500"></i></div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Students</p>
                         <h3 className={`text-4xl font-black ${theme.textPrimary}`}>{tutorStats.totalStudents}</h3>
                         <div className="text-[10px] text-green-500 font-bold">+12% from last month</div>
                      </div>
                      <div className={`${theme.card} p-8 rounded-[2.5rem] border space-y-2 relative overflow-hidden`}>
                         <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl"><i className="fa-solid fa-chart-line text-purple-500"></i></div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg Completion</p>
                         <h3 className={`text-4xl font-black ${theme.textPrimary}`}>{Math.round(tutorStats.avgCompletion)}%</h3>
                         <div className="text-[10px] text-blue-500 font-bold">Cohorts are on track</div>
                      </div>
                      <div className={`${theme.card} p-8 rounded-[2.5rem] border space-y-2 relative overflow-hidden`}>
                         <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl"><i className="fa-solid fa-star text-yellow-500"></i></div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Top Performers</p>
                         <h3 className={`text-4xl font-black ${theme.textPrimary}`}>{tutorStats.excelling.length}</h3>
                         <div className="text-[10px] text-yellow-500 font-bold">Candidates for mentorship</div>
                      </div>
                   </div>
                </div>
              )}

              {user.role === 'student' && (
                <div className="space-y-12">
                   {/* Student Welcome Summary */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {getStudentProgress(user.id).map(prog => {
                        const course = COURSES.find(c => c.id === prog.courseId);
                        const percentage = getCourseProgress(prog.courseId);
                        if (!course || percentage === 100) return null;
                        return (
                          <div key={prog.courseId} className={`${theme.card} p-8 rounded-[2.5rem] border group transition-all`}>
                             <div className="flex items-center gap-4 mb-6">
                               <img src={course.thumbnail} className="w-20 h-20 object-cover rounded-2xl shadow-sm" alt="" />
                               <div className="flex-1 min-w-0">
                                 <h3 className={`text-xl font-bold ${theme.textPrimary}`}>{course.title}</h3>
                                 <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">{course.category}</p>
                               </div>
                             </div>
                             <div className="space-y-2 mb-6">
                               <div className="flex justify-between text-[10px] font-bold">
                                 <span className="text-blue-500">{percentage}% COMPLETE</span>
                                 <span className={theme.textSecondary}>{prog.completedLessons.length} / {course.lessons.length} LESSONS</span>
                               </div>
                               <div className={`h-2 w-full ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                                 <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                               </div>
                             </div>
                             <button 
                                onClick={() => { setActiveCourse(course); setView('lesson'); setActiveLesson(course.lessons.find(l => !prog.completedLessons.includes(l.id)) || course.lessons[0]); }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/10"
                             >
                               Continue Module
                             </button>
                          </div>
                        );
                      })}
                   </div>
                </div>
              )}
            </div>
          )}

          {/* My Students View (Enhanced) */}
          {view === 'students' && user.role === 'tutor' && (
            <div className="space-y-10 animate-fade-in">
               <div>
                 <h1 className={`text-3xl font-extrabold ${theme.textPrimary}`}>Enrolled Cohort</h1>
                 <p className={theme.textSecondary}>Detailed performance overview of all students in your courses.</p>
               </div>

               <div className="grid grid-cols-1 gap-8">
                 {MOCK_STUDENTS.map(s => {
                    const progress = userProgress.find(p => p.userId === s.id);
                    const course = COURSES.find(c => c.id === progress?.courseId);
                    if (!course || course.tutorId !== user.id) return null;
                    
                    const completion = Math.round(((progress?.completedLessons.length ?? 0) / course.lessons.length) * 100);
                    const avgGrade = allSubmissions
                      .filter(sub => sub.userId === s.id && sub.courseId === course.id)
                      .reduce((acc, sub, _, arr) => acc + (sub.tutorScore ?? sub.aiScore) / arr.length, 0);

                    return (
                      <div key={s.id} className={`${theme.card} p-8 rounded-[2.5rem] border group transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col md:flex-row items-center gap-8`}>
                         <div className="relative">
                            <img src={s.avatar} className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-slate-800 shadow-lg" alt="" />
                            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs border-4 border-white dark:border-slate-800 shadow-md ${avgGrade > 80 ? 'bg-green-500' : avgGrade < 60 && avgGrade > 0 ? 'bg-red-500' : 'bg-blue-500'}`}>
                               <i className={`fa-solid ${avgGrade > 80 ? 'fa-star' : avgGrade < 60 && avgGrade > 0 ? 'fa-triangle-exclamation' : 'fa-user'}`}></i>
                            </div>
                         </div>
                         
                         <div className="flex-1 space-y-4 text-center md:text-left">
                            <div>
                               <h3 className={`text-xl font-bold ${theme.textPrimary}`}>{s.name}</h3>
                               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{course.title}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                               <div>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Lesson Mastery</p>
                                  <div className="flex items-center gap-2">
                                     <div className={`flex-1 h-1.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                                        <div className="h-full bg-blue-500" style={{ width: `${completion}%` }}></div>
                                     </div>
                                     <span className={`text-xs font-bold ${theme.textPrimary}`}>{completion}%</span>
                                  </div>
                               </div>
                               <div>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Average Grade</p>
                                  <p className={`text-sm font-bold ${avgGrade > 80 ? 'text-green-500' : avgGrade < 60 && avgGrade > 0 ? 'text-red-500' : theme.textPrimary}`}>
                                     {avgGrade > 0 ? `${Math.round(avgGrade)}%` : 'N/A'}
                                  </p>
                               </div>
                               <div className="hidden md:block">
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Last Active</p>
                                  <p className={`text-xs ${theme.textPrimary}`}>{progress?.lastAccessed ? new Date(progress.lastAccessed).toLocaleDateString() : 'Never'}</p>
                               </div>
                            </div>
                         </div>

                         <div className="flex gap-3">
                            <button 
                               onClick={() => { setActiveChatGroupId(`direct-${s.id}`); setView('community'); }}
                               className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'} hover:bg-blue-600 hover:text-white`}
                            >
                               <i className="fa-solid fa-message"></i>
                            </button>
                            <button 
                               onClick={() => { setSelectedStudent(s); setView('student-detail'); }}
                               className="px-6 h-12 bg-gray-900 dark:bg-slate-700 text-white rounded-2xl font-bold text-xs hover:bg-blue-600 transition-all"
                            >
                               View Full Profile
                            </button>
                         </div>
                      </div>
                    );
                 })}
               </div>
            </div>
          )}

          {/* Gradebook View (Enhanced) */}
          {view === 'gradebook' && user.role === 'tutor' && (
            <div className="space-y-10 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-3xl font-extrabold ${theme.textPrimary}`}>Gradebook & Review</h1>
                  <p className={theme.textSecondary}>Evaluate student submissions and provide personalized feedback.</p>
                </div>
                
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                  {(['all', 'pending', 'graded'] as GradeFilter[]).map(f => (
                    <button 
                      key={f}
                      onClick={() => setGradeFilter(f)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${gradeFilter === f ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {allSubmissions
                  .filter(sub => {
                    const course = COURSES.find(c => c.id === sub.courseId);
                    if (course?.tutorId !== user.id) return false;
                    if (gradeFilter === 'pending') return sub.status === 'pending';
                    if (gradeFilter === 'graded') return sub.status === 'graded';
                    return true;
                  })
                  .map(sub => {
                    const student = MOCK_STUDENTS.find(s => s.id === sub.userId);
                    const course = COURSES.find(c => c.id === sub.courseId);
                    return (
                      <div key={sub.id} className={`${theme.card} p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between hover:shadow-lg transition-all gap-4`}>
                        <div className="flex items-center gap-4">
                           <img src={student?.avatar} className="w-12 h-12 rounded-2xl shadow-sm" alt="" />
                           <div>
                              <h4 className={`font-bold ${theme.textPrimary}`}>{student?.name}</h4>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{course?.title} • {sub.lessonId}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-8">
                           <div className="text-center">
                              <p className={`text-sm font-bold px-3 py-1 rounded-lg ${sub.status === 'graded' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                 {sub.status.toUpperCase()}
                              </p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Status</p>
                           </div>

                           <div className="text-center">
                              <p className={`text-xl font-black ${theme.textPrimary}`}>
                                 {sub.tutorScore ?? sub.aiScore}%
                              </p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase">Current Score</p>
                           </div>

                           <button 
                              onClick={() => setEditingSubmission({ ...sub })}
                              className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all"
                           >
                              Review Work
                           </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Enhanced Review Modal */}
              {editingSubmission && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                  <div className={`${theme.card} w-full max-w-5xl rounded-[3rem] p-0 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col h-[90vh]`}>
                    <div className={`p-8 border-b ${theme.border} flex items-center justify-between`}>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/20">
                             <i className="fa-solid fa-file-signature"></i>
                          </div>
                          <div>
                             <h3 className={`text-2xl font-bold ${theme.textPrimary}`}>Submission Review</h3>
                             <p className="text-xs text-gray-400 uppercase font-bold tracking-[0.2em]">Evaluating academic excellence</p>
                          </div>
                       </div>
                       <button onClick={() => setEditingSubmission(null)} className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all">
                          <i className="fa-solid fa-xmark text-xl"></i>
                       </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                       <div className="space-y-6">
                          <h4 className={`text-lg font-bold ${theme.textPrimary} flex items-center gap-2`}>
                             <i className="fa-solid fa-quote-left text-blue-500 opacity-30"></i>
                             Student Submission
                          </h4>
                          <div className={`p-8 rounded-[2rem] border ${theme.border} ${isDarkMode ? 'bg-slate-950/50' : 'bg-gray-50'} min-h-[400px] leading-relaxed text-sm whitespace-pre-line ${theme.textPrimary} shadow-inner`}>
                             {editingSubmission.content}
                          </div>
                       </div>

                       <div className="space-y-8">
                          <div className="p-8 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 space-y-4">
                             <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">AI Assessment Summary</span>
                                <span className="text-2xl font-black text-blue-500">{editingSubmission.aiScore}%</span>
                             </div>
                             <p className={`text-sm italic leading-relaxed ${theme.textSecondary}`}>"{editingSubmission.aiFeedback}"</p>
                          </div>

                          <form onSubmit={handleTutorGradeUpdate} className="space-y-8">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">Mastery Level (0-100%)</label>
                                <input 
                                   type="range" 
                                   min="0" 
                                   max="100" 
                                   value={editingSubmission.tutorScore ?? editingSubmission.aiScore}
                                   onChange={(e) => setEditingSubmission({ ...editingSubmission, tutorScore: parseInt(e.target.value) })}
                                   className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600" 
                                />
                                <div className="flex justify-between text-xl font-black text-blue-600 px-1">
                                   <span>0%</span>
                                   <span className="bg-blue-600 text-white px-4 py-1 rounded-xl shadow-lg shadow-blue-500/20">{editingSubmission.tutorScore ?? editingSubmission.aiScore}%</span>
                                   <span>100%</span>
                                </div>
                             </div>

                             <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">Tutor Guidance & Feedback</label>
                                <textarea 
                                   value={editingSubmission.tutorFeedback ?? ""}
                                   onChange={(e) => setEditingSubmission({ ...editingSubmission, tutorFeedback: e.target.value })}
                                   placeholder="Add your expert guidance here..."
                                   className={`w-full ${theme.input} rounded-[2rem] px-8 py-6 outline-none h-40 transition-all text-sm leading-relaxed`} 
                                />
                             </div>

                             <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold shadow-2xl shadow-blue-600/20 transition-all text-lg flex items-center justify-center gap-3">
                                   <i className="fa-solid fa-paper-plane-top"></i>
                                   Publish Results
                                </button>
                             </div>
                          </form>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings, Achievements, etc. views remain exactly as before */}
          {view === 'settings' && (
            <div className="space-y-10 animate-fade-in max-w-3xl mx-auto pb-20">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-4xl font-black ${theme.textPrimary}`}>Settings</h1>
                  <p className={theme.textSecondary + " mt-1"}>Personalize your academy experience.</p>
                </div>
              </div>

              <div className="space-y-8">
                <section className={`${theme.card} rounded-[3rem] border overflow-hidden`}>
                   <div className={`px-10 py-6 border-b ${theme.border} flex items-center gap-4`}>
                      <i className="fa-solid fa-circle-user text-blue-500 text-xl"></i>
                      <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Public Profile</h3>
                   </div>
                   <form onSubmit={handleUpdateProfile} className="p-10 space-y-8">
                      <div className="flex flex-col md:flex-row gap-10">
                        <div className="flex flex-col items-center gap-4">
                           <div className="relative group">
                              <img src={user.avatar} className={`w-32 h-32 rounded-full border-4 ${isDarkMode ? 'border-slate-800' : 'border-blue-50'} shadow-xl group-hover:opacity-80 transition-opacity`} alt="Avatar" />
                              <button type="button" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full text-white">
                                <i className="fa-solid fa-camera text-xl"></i>
                              </button>
                           </div>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Change Photo</p>
                        </div>
                        <div className="flex-1 space-y-6">
                           <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Display Name</label>
                             <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className={`w-full ${theme.input} rounded-2xl px-6 py-4 outline-none font-bold text-lg shadow-sm`} />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Short Bio</label>
                             <textarea value={profileBio} onChange={(e) => setProfileBio(e.target.value)} className={`w-full ${theme.input} rounded-2xl px-6 py-4 outline-none h-32 leading-relaxed shadow-sm`} />
                           </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">Save Profile</button>
                      </div>
                   </form>
                </section>
              </div>
            </div>
          )}

          {/* Other Views... (Community, Lesson, My Learning, etc. maintained from previous implementation) */}
          {view === 'my-courses' && (
             <div className="space-y-10 animate-fade-in">
                <div className="flex items-center justify-between">
                   <h1 className={`text-3xl font-extrabold ${theme.textPrimary}`}>My Learning Journey</h1>
                   <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button onClick={() => setCourseFilter('active')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${courseFilter === 'active' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-500'}`}>Active</button>
                      <button onClick={() => setCourseFilter('completed')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${courseFilter === 'completed' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-500'}`}>Completed</button>
                   </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                   {COURSES.map(course => {
                      const progress = userProgress.find(p => p.userId === user?.id && p.courseId === course.id);
                      const percentage = getCourseProgress(course.id);
                      const isCompleted = percentage === 100;
                      if (courseFilter === 'active' && isCompleted) return null;
                      if (courseFilter === 'completed' && !isCompleted) return null;
                      return (
                         <div key={course.id} className={`${theme.card} p-8 rounded-[2.5rem] border flex flex-col md:flex-row items-center gap-8 group hover:shadow-xl transition-all`}>
                            <img src={course.thumbnail} className="w-full md:w-48 h-32 object-cover rounded-2xl" alt="" />
                            <div className="flex-1 space-y-4">
                               <h3 className={`text-xl font-bold ${theme.textPrimary}`}>{course.title}</h3>
                               <div className="space-y-2">
                                  <div className="flex justify-between text-[10px] font-bold">
                                     <span className="text-blue-500 uppercase tracking-widest">{percentage}% Complete</span>
                                     <span className={theme.textSecondary}>{progress?.completedLessons.length || 0} / {course.lessons.length} Lessons</span>
                                  </div>
                                  <div className={`h-2 w-full ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                                     <div className="h-full bg-blue-500" style={{ width: `${percentage}%` }}></div>
                                  </div>
                               </div>
                            </div>
                            <button onClick={() => { setActiveCourse(course); setView('lesson'); setActiveLesson(course.lessons.find(l => !progress?.completedLessons.includes(l.id)) || course.lessons[0]); }} className="w-full md:w-40 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">{isCompleted ? 'Review' : 'Continue'}</button>
                         </div>
                      );
                   })}
                </div>
             </div>
          )}

          {view === 'community' && (
            <div className={`animate-fade-in flex h-[calc(100vh-140px)] rounded-[2.5rem] overflow-hidden border ${theme.border} ${theme.card}`}>
              <div className={`w-64 border-r ${theme.border} ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50/50'} flex flex-col`}>
                <div className="p-6">
                  <h3 className={`text-xs font-bold ${theme.textSecondary} uppercase tracking-[0.2em]`}>Channels</h3>
                </div>
                <div className="flex-1 space-y-1 px-3">
                  {COURSES.map(c => (
                    <button key={c.id} onClick={() => setActiveChatGroupId(c.id)} className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${activeChatGroupId === c.id ? theme.navActive : theme.navHover}`}><span className="text-blue-500">#</span><span className="text-sm font-bold truncate">{c.title.split(' ')[0]} Hub</span></button>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
                <div className={`p-6 border-b ${theme.border} flex items-center justify-between`}>
                  <h3 className={`font-bold ${theme.textPrimary}`}>{COURSES.find(c => c.id === activeChatGroupId)?.title}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.filter(m => m.groupId === activeChatGroupId).map((msg, i) => {
                    const isOwn = msg.senderId === user?.id;
                    const sender = [...MOCK_STUDENTS, { id: 't-main', name: 'Professor Light', avatar: 'https://i.pravatar.cc/150?u=t-main' }].find(u => u.id === msg.senderId);
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`flex gap-3 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isOwn && <img src={sender?.avatar || 'https://i.pravatar.cc/150'} className="w-8 h-8 rounded-full shadow-sm" alt="" />}
                          <div>
                            <div className={`p-4 rounded-2xl shadow-sm ${isOwn ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-tl-none'}`}><p className="text-sm leading-relaxed">{msg.text}</p></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className={`p-6 border-t ${theme.border} flex gap-4`}><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type your message..." className={`flex-1 ${theme.input} rounded-2xl px-6 py-4 outline-none text-sm transition-all`} /><button type="submit" className="bg-blue-600 text-white px-6 rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center"><i className="fa-solid fa-paper-plane"></i></button></form>
              </div>
            </div>
          )}

          {view === 'lesson' && activeCourse && activeLesson && (
            <div className="animate-fade-in space-y-10">
              <button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-blue-500 flex items-center gap-2 font-bold text-sm"><i className="fa-solid fa-arrow-left"></i> Exit to Dashboard</button>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="aspect-video bg-gray-900 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden group shadow-2xl"><i className="fa-solid fa-play text-white text-7xl group-hover:scale-110 transition-transform cursor-pointer drop-shadow-2xl"></i></div>
                  <div className={`${theme.card} p-10 rounded-[3rem] border space-y-6 transition-colors duration-300`}>
                    <h2 className={`text-3xl font-extrabold ${theme.textPrimary}`}>{activeLesson.title}</h2>
                    <div className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none ${theme.textSecondary} leading-relaxed text-lg whitespace-pre-line`}>{activeLesson.content}</div>
                    <div className="pt-8 border-t border-gray-100 flex justify-end">
                      {activeLesson.assessmentType === 'written' ? <button onClick={() => setView('written-assessment')} className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Submit Assignment</button> : <button onClick={() => handleMarkComplete(activeLesson.id, activeCourse.id)} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Mark as Complete</button>}
                    </div>
                  </div>
                </div>
                <div className={`${theme.card} p-8 rounded-[2.5rem] border space-y-8 h-fit transition-colors duration-300`}><h3 className={`text-xl font-bold ${theme.textPrimary}`}>Course Path</h3><div className="space-y-4">{activeCourse.lessons.map((l, idx) => { const isDone = userProgress.find(p => p.courseId === activeCourse.id)?.completedLessons.includes(l.id); const isActive = activeLesson.id === l.id; return (<div key={l.id} onClick={() => setActiveLesson(l)} className={`p-4 rounded-2xl flex items-center gap-4 border cursor-pointer transition-all ${isActive ? 'border-blue-500 bg-blue-500/10' : theme.border}`}><div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isActive ? 'bg-blue-500 text-white shadow-lg' : isDone ? 'bg-green-500/20 text-green-500' : 'bg-gray-200 text-gray-400'}`}>{isDone ? <i className="fa-solid fa-check"></i> : idx + 1}</div><p className={`text-sm font-bold truncate ${isActive ? 'text-blue-500' : theme.textPrimary}`}>{l.title}</p></div>); })}</div></div>
              </div>
            </div>
          )}

          {/* Written Assessment View */}
          {view === 'written-assessment' && activeLesson && (
            <div className="animate-fade-in max-w-2xl mx-auto space-y-10 py-10">
               <div className="text-center space-y-2">
                 <h2 className={`text-3xl font-extrabold ${theme.textPrimary}`}>Written Assessment</h2>
                 <p className={theme.textSecondary}>{activeLesson.title}</p>
               </div>
               
               <div className={`${theme.card} p-10 rounded-[3rem] border space-y-8 transition-colors duration-300`}>
                  <div className={`p-6 rounded-2xl bg-blue-500/5 border ${isDarkMode ? 'border-blue-400/20' : 'border-blue-100'}`}>
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">The Assignment</p>
                    <p className={`text-lg font-bold ${theme.textPrimary}`}>{activeLesson.prompt}</p>
                  </div>

                  <form onSubmit={handleWrittenSubmission} className="space-y-6">
                    <textarea 
                      value={writtenInput}
                      onChange={(e) => setWrittenInput(e.target.value)}
                      placeholder="Type your response here... Be detailed to get a higher AI score."
                      className={`w-full h-80 p-8 rounded-[2rem] ${theme.input} outline-none transition-all leading-relaxed`}
                    />
                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setView('lesson')}
                        className={`flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'} text-gray-500 py-4 rounded-2xl font-bold`}
                      >
                        Back to Lesson
                      </button>
                      <button 
                        type="submit" 
                        disabled={isGrading || !writtenInput.trim()}
                        className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                        {isGrading ? <><i className="fa-solid fa-microchip animate-pulse"></i> AI Assessment in Progress...</> : "Submit for Assessment"}
                      </button>
                    </div>
                  </form>
               </div>
            </div>
          )}

          {/* Achievements View */}
          {view === 'achievements' && (
            <div className="space-y-10 animate-fade-in">
              <div>
                <h1 className={`text-3xl font-extrabold ${theme.textPrimary}`}>My Achievements</h1>
                <p className={theme.textSecondary}>Badges earned through your dedication and mastery.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                {COURSE_BADGES.map(badge => {
                  const isEarned = getEarnedBadges().some(b => b.id === badge.id);
                  return (
                    <div key={badge.id} className={`${theme.card} p-8 rounded-[2.5rem] border text-center space-y-4 group transition-all ${!isEarned ? 'grayscale opacity-40' : 'hover:scale-105 shadow-xl'}`}>
                      <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${badge.color} p-1 relative`}>
                        <div className={`w-full h-full rounded-full ${isDarkMode ? 'bg-slate-900' : 'bg-white'} flex items-center justify-center`}>
                          <i className={`${badge.icon} text-4xl text-transparent bg-clip-text bg-gradient-to-br ${badge.color}`}></i>
                        </div>
                      </div>
                      <div>
                        <h4 className={`font-bold ${theme.textPrimary}`}>{badge.name}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {unlockedBadge && (
            <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-xl z-[300] flex items-center justify-center p-6 overflow-hidden">
               <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[4rem] p-12 text-center space-y-8 animate-bounce-in shadow-[0_0_100px_rgba(59,130,246,0.3)]">
                  <div className={`w-40 h-40 mx-auto rounded-full bg-gradient-to-br ${unlockedBadge.color} p-2 shadow-2xl animate-pulse`}><div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center"><i className={`${unlockedBadge.icon} text-6xl text-transparent bg-clip-text bg-gradient-to-br ${unlockedBadge.color}`}></i></div></div>
                  <h2 className={`text-4xl font-extrabold ${theme.textPrimary}`}>New Badge Unlocked!</h2>
                  <p className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br ${unlockedBadge.color} uppercase tracking-[0.2em]`}>{unlockedBadge.name}</p>
                  <button onClick={() => { setUnlockedBadge(null); setView('achievements'); }} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-bold shadow-2xl shadow-blue-600/30 transition-all text-xl">View My Achievements</button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LearningPortal;
