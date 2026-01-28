import { useState } from "react";
import { Clock, Calendar, Plus, Trash2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

interface StudySession {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  duration: number;
  breakTime: number;
}

const StudyTimetableTool = () => {
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
    <ToolLayout
      title="Study Timetable Generator"
      description="Create personalized study schedules with break times"
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
              <label className="mb-2 block text-sm font-medium">Subject</label>
              <input
                type="text"
                value={currentSession.subject}
                onChange={(e) => setCurrentSession({...currentSession, subject: e.target.value})}
                placeholder="e.g., Mathematics"
                className="input-tool"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium">Start Time</label>
              <input
                type="time"
                value={currentSession.startTime}
                onChange={(e) => setCurrentSession({...currentSession, startTime: e.target.value})}
                className="input-tool"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium">End Time</label>
              <input
                type="time"
                value={currentSession.endTime}
                onChange={(e) => setCurrentSession({...currentSession, endTime: e.target.value})}
                className="input-tool"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium">Break (minutes)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={currentSession.breakTime}
                onChange={(e) => setCurrentSession({...currentSession, breakTime: parseInt(e.target.value) || 0})}
                className="input-tool"
              />
            </div>
          </div>
          
          <button onClick={addSession} className="btn-primary mt-4">
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
      </div>
    </ToolLayout>
  );
};

export default StudyTimetableTool;
