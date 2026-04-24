import { useState } from "react";
import { Clock, Calendar, Plus, Trash2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "145 70% 45%";

interface StudySession {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  duration: number;
  breakTime: number;
}

const StudyTimetableTool = () => {
  const toolSeoData = getToolSeoMetadata('study-timetable-generator');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [currentSession, setCurrentSession] = useState({
    subject: "",
    startTime: "",
    endTime: "",
    breakTime: 15
  });

  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  };

  const addSession = () => {
    if (!currentSession.subject || !currentSession.startTime || !currentSession.endTime) {
      return;
    }

    const duration = calculateDuration(currentSession.startTime, currentSession.endTime);
    if (duration <= 0) return;

    const newSession: StudySession = {
      id: Date.now().toString(),
      subject: currentSession.subject,
      startTime: currentSession.startTime,
      endTime: currentSession.endTime,
      duration,
      breakTime: currentSession.breakTime
    };

    setSessions([...sessions, newSession]);
    setCurrentSession({
      subject: "",
      startTime: "",
      endTime: "",
      breakTime: 15
    });
  };

  const removeSession = (id: string) => {
    setSessions(sessions.filter(session => session.id !== id));
  };

  const totalStudyTime = sessions.reduce((sum, session) => sum + session.duration, 0);
  const totalBreakTime = sessions.reduce((sum, session) => sum + session.breakTime, 0);
  const totalTime = totalStudyTime + totalBreakTime;

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <>
      {CategorySEO.Education(
        toolSeoData?.title || "Study Timetable Generator",
        toolSeoData?.description || "Create personalized study schedules with break times",
        "study-timetable-generator"
      )}
      <ToolLayout
      title={toolSeoData?.title || "Study Timetable Generator"}
      description={toolSeoData?.description || "Create personalized study schedules with break times"}
      category="Education Tools"
      categoryPath="/category/education"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Add Session Form */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Study Session
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="study-subject" className="mb-2 block text-sm font-medium">Subject</label>
              <input
                id="study-subject"
                type="text"
                title="Subject"
                value={currentSession.subject}
                onChange={(e) => setCurrentSession({...currentSession, subject: e.target.value})}
                placeholder="e.g., Mathematics"
                className="input-tool"
              />
            </div>
            
            <div>
              <label htmlFor="study-start-time" className="mb-2 block text-sm font-medium">Start Time</label>
              <input
                id="study-start-time"
                type="time"
                title="Start Time"
                value={currentSession.startTime}
                onChange={(e) => setCurrentSession({...currentSession, startTime: e.target.value})}
                className="input-tool"
              />
            </div>
            
            <div>
              <label htmlFor="study-end-time" className="mb-2 block text-sm font-medium">End Time</label>
              <input
                id="study-end-time"
                type="time"
                title="End Time"
                value={currentSession.endTime}
                onChange={(e) => setCurrentSession({...currentSession, endTime: e.target.value})}
                className="input-tool"
              />
            </div>
            
            <div>
              <label htmlFor="study-break-time" className="mb-2 block text-sm font-medium">Break (minutes)</label>
              <input
                id="study-break-time"
                type="number"
                title="Break (minutes)"
                min="0"
                max="60"
                value={currentSession.breakTime}
                onChange={(e) => setCurrentSession({...currentSession, breakTime: parseInt(e.target.value) || 0})}
                className="input-tool"
              />
            </div>
          </div>
          
          <button type="button" onClick={addSession} className="btn-primary mt-4">
            <Plus className="h-5 w-5" />
            Add Session
          </button>
        </div>

        {/* Sessions List */}
        {sessions.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Your Study Schedule
            </h3>
            
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div key={session.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground">Session {index + 1}</span>
                      <h4 className="font-semibold">{session.subject}</h4>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.startTime} - {session.endTime}
                      </span>
                      <span>Duration: {formatTime(session.duration)}</span>
                      <span>Break: {formatTime(session.breakTime)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    title={`Remove session ${index + 1}`}
                    aria-label={`Remove session ${index + 1}`}
                    onClick={() => removeSession(session.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {sessions.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Schedule Summary</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Study Time</p>
                <p className="mt-1 text-2xl font-bold text-primary">{formatTime(totalStudyTime)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Break Time</p>
                <p className="mt-1 text-2xl font-bold text-secondary">{formatTime(totalBreakTime)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="mt-1 text-2xl font-bold">{formatTime(totalTime)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            What is a Study Timetable?
          </h3>
          <p className="text-muted-foreground mb-4">
            A study timetable organizes your study sessions into a structured schedule with allocated time for each subject. It helps students manage their time effectively, ensure balanced coverage of all subjects, and maintain consistent study habits for better academic performance.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Add study sessions with subject, start time, and end time</li>
            <li>Set break times between sessions for better focus</li>
            <li>View your complete timetable with all sessions</li>
            <li>Adjust or remove sessions as needed</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Timetable Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Custom session duration</li>
                <li>• Break time scheduling</li>
                <li>• Subject organization</li>
                <li>• Easy editing</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Study Benefits</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Better time management</li>
                <li>• Consistent study habits</li>
                <li>• Balanced subject coverage</li>
                <li>• Reduced procrastination</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "How long should study sessions be?",
            answer: "The Pomodoro technique suggests 25-minute focused sessions with 5-minute breaks. However, you can customize session lengths based on your concentration span and subject difficulty."
          },
          {
            question: "Why include break times?",
            answer: "Breaks prevent mental fatigue, improve focus, and help retain information better. Regular breaks maintain productivity and prevent burnout during long study periods."
          },
          {
            question: "How do I balance multiple subjects?",
            answer: "Allocate time based on difficulty and importance. Give more time to challenging subjects while ensuring all subjects get regular attention throughout the week."
          },
          {
            question: "Can I modify sessions after creating them?",
            answer: "Yes, you can delete any session and create a new one with adjusted times. This flexibility allows you to adapt your timetable as your schedule changes."
          },
          {
            question: "What's the best time to study?",
            answer: "The best study time varies by person. Some prefer morning hours for fresh focus, while others study better at night. Choose times when you're most alert and least distracted."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default StudyTimetableTool;
