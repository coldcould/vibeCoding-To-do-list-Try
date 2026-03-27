import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Category, Stats, Task, User } from './types';
import ForgotPassword from './components/ForgotPassword';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import Sidebar from './components/Sidebar';
import Signup from './components/Signup';
import StatsSidebar from './components/StatsSidebar';
import TaskList from './components/TaskList';
import TopBar from './components/TopBar';
import {
  ApiError,
  bootstrapDashboard,
  createList,
  createTask,
  fetchStats,
  forgotPassword,
  login,
  resetPassword,
  signup,
  updateTask,
} from './lib/api';
import { clearSessionToken, getSessionToken, setSessionToken } from './lib/session';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password';

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const today = getLocalDateString();

const emptyStats: Stats = {
  focusScore: 0,
  completedCount: 0,
  totalTasks: 0,
  completionRate: 0,
  focusMinutes: 0,
};

export default function App() {
  const [token, setToken] = useState<string | null>(() => getSessionToken());
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [activeCategory, setActiveCategory] = useState<Category>('Inbox');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [customLists, setCustomLists] = useState<string[]>([]);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [bootstrapping, setBootstrapping] = useState(Boolean(token));
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [authNoticeLink, setAuthNoticeLink] = useState('');
  const [pageError, setPageError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('resetToken');
    if (tokenFromUrl && !token) {
      setResetToken(tokenFromUrl);
      setAuthView('reset-password');
      setAuthError('');
      setAuthNotice('');
      setAuthNoticeLink('');
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setBootstrapping(false);
      return;
    }

    let cancelled = false;
    setBootstrapping(true);
    setPageError('');

    bootstrapDashboard(selectedDate)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setUser(data.user);
        setTasks(data.tasks);
        setCustomLists(data.customLists);
        setStats(data.stats);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Failed to load dashboard.';
        setPageError(message);
        if (error instanceof ApiError && error.status === 401) {
          handleLogout();
        }
      })
      .finally(() => {
        if (!cancelled) {
          setBootstrapping(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, selectedDate]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.isRunning && !task.completed
            ? { ...task, elapsedTime: (task.elapsedTime || 0) + 1 }
            : task,
        ),
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesDate = task.scheduledFor === selectedDate;
      const matchesCategory = activeCategory === 'Inbox' || task.category === activeCategory;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, selectedDate, tasks]);

  async function refreshStats(date: string) {
    const latestStats = await fetchStats(date);
    setStats(latestStats);
  }

  function applyAuthPayload(payload: { token: string; user: User; tasks: Task[]; customLists: string[]; stats: Stats }) {
    setSessionToken(payload.token);
    setToken(payload.token);
    setUser(payload.user);
    setTasks(payload.tasks);
    setCustomLists(payload.customLists);
    setStats(payload.stats);
    setAuthError('');
    setAuthNotice('');
    setAuthNoticeLink('');
  }

  async function handleLogin(credentials: { email: string; password: string }) {
    const payload = await login(credentials);
    applyAuthPayload(payload);
  }

  async function handleSignup(payload: { name: string; email: string; password: string }) {
    const authPayload = await signup(payload);
    applyAuthPayload(authPayload);
  }

  async function handleForgotPassword(payload: { email: string }) {
    const response = await forgotPassword(payload);
    setAuthNotice(response.message);
    setAuthNoticeLink(response.resetUrl || '');
    setAuthError('');
    setAuthView('login');
  }

  async function handleResetPassword(payload: { token: string; password: string }) {
    const response = await resetPassword(payload);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete('resetToken');
    window.history.replaceState({}, '', nextUrl.toString());
    setResetToken('');
    setAuthNotice(response.message);
    setAuthNoticeLink('');
    setAuthError('');
    setAuthView('login');
  }

  function handleLogout() {
    clearSessionToken();
    setToken(null);
    setUser(null);
    setTasks([]);
    setCustomLists([]);
    setStats(emptyStats);
    setPageError('');
  }

  async function runAuthAction(action: () => Promise<void>) {
    setAuthError('');
    setAuthNotice('');
    setAuthNoticeLink('');

    try {
      await action();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Request failed.');
    }
  }

  async function handleToggleTask(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedTask = await updateTask(taskId, {
        completed: !task.completed,
        isRunning: false,
        elapsedTime: task.elapsedTime,
      });
      setTasks((currentTasks) => currentTasks.map((item) => (item.id === taskId ? updatedTask : item)));
      await refreshStats(selectedDate);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to update task.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleTimer(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedTask = await updateTask(taskId, {
        isRunning: !task.isRunning,
        elapsedTime: task.elapsedTime,
      });
      setTasks((currentTasks) => currentTasks.map((item) => (item.id === taskId ? updatedTask : item)));
      await refreshStats(selectedDate);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to update timer.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddTask(title: string) {
    setIsSaving(true);
    try {
      const newTask = await createTask({
        title,
        category: activeCategory === 'Inbox' ? 'Personal' : activeCategory,
        scheduledFor: selectedDate,
      });
      setTasks((currentTasks) => [newTask, ...currentTasks]);
      await refreshStats(selectedDate);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to create task.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateList() {
    if (!newListTitle.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await createList(newListTitle.trim());
      setCustomLists((currentLists) => [...currentLists, response.name]);
      setNewListTitle('');
      setIsAddingList(false);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to create list.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!token) {
    return (
      <AnimatePresence mode="wait">
        {authView === 'login' && (
          <Login
            error={authError}
            notice={authNotice}
            noticeLink={authNoticeLink}
            onLogin={(payload) => runAuthAction(() => handleLogin(payload))}
            onGoToSignup={() => setAuthView('signup')}
            onGoToForgotPassword={() => setAuthView('forgot-password')}
          />
        )}
        {authView === 'signup' && (
          <Signup
            error={authError}
            onSignup={(payload) => runAuthAction(() => handleSignup(payload))}
            onBackToLogin={() => setAuthView('login')}
          />
        )}
        {authView === 'forgot-password' && (
          <ForgotPassword
            error={authError}
            onReset={(payload) => runAuthAction(() => handleForgotPassword(payload))}
            onBackToLogin={() => setAuthView('login')}
          />
        )}
        {authView === 'reset-password' && (
          <ResetPassword
            error={authError}
            notice={authNotice}
            token={resetToken}
            onResetPassword={(payload) => runAuthAction(() => handleResetPassword(payload))}
            onBackToLogin={() => {
              const nextUrl = new URL(window.location.href);
              nextUrl.searchParams.delete('resetToken');
              window.history.replaceState({}, '', nextUrl.toString());
              setResetToken('');
              setAuthView('login');
            }}
          />
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onLogout={handleLogout}
        customLists={customLists}
        onNewList={() => setIsAddingList(true)}
      />

      <main className="relative flex min-h-screen flex-1 flex-col">
        <TopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} user={user} />

        <div className="flex flex-1 overflow-hidden">
          <TaskList
            activeCategory={activeCategory}
            isLoading={bootstrapping}
            isSaving={isSaving}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onToggleTimer={handleToggleTimer}
            searchQuery={searchQuery}
            selectedDate={selectedDate}
            tasks={visibleTasks}
          />
          <StatsSidebar onDateChange={setSelectedDate} selectedDate={selectedDate} stats={stats} />
        </div>

        {pageError && (
          <div className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-medium text-red-700 shadow-lg">
            {pageError}
          </div>
        )}
      </main>

      <AnimatePresence>
        {isAddingList && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
            >
              <h3 className="mb-6 text-2xl font-bold text-on-surface">Create New List</h3>
              <input
                autoFocus
                type="text"
                placeholder="List name (e.g. Groceries)"
                value={newListTitle}
                onChange={(event) => setNewListTitle(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && void handleCreateList()}
                className="mb-8 w-full rounded-2xl bg-surface-container-high px-6 py-4 text-lg text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setIsAddingList(false)}
                  className="flex-1 rounded-2xl px-6 py-4 font-bold text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleCreateList()}
                  disabled={!newListTitle.trim() || isSaving}
                  className="flex-1 rounded-2xl bg-primary px-6 py-4 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-dim disabled:pointer-events-none disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
