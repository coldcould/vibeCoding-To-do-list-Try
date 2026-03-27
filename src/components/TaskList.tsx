import type { KeyboardEvent } from 'react';
import { AlertCircle, Calendar, Check, Clock, MoreVertical, Pause, Play, PlusCircle, Tag } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Category, Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => Promise<void>;
  onToggleTimer: (id: string) => Promise<void>;
  onAddTask: (title: string) => Promise<void>;
  activeCategory: Category;
  isLoading: boolean;
  isSaving: boolean;
  searchQuery: string;
  selectedDate: string;
}

export default function TaskList({ tasks, onToggleTask, onToggleTimer, onAddTask, isLoading, isSaving, selectedDate }: TaskListProps) {
  function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDuration(seconds?: number) {
    if (!seconds) {
      return '00:00';
    }

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function formatHeading(date: string) {
    const currentDate = new Date(date);
    const isToday = date === getLocalDateString();

    return {
      title: isToday ? 'Today' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(currentDate),
      subtitle: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(currentDate),
    };
  }

  async function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && event.currentTarget.value.trim()) {
      await onAddTask(event.currentTarget.value.trim());
      event.currentTarget.value = '';
    }
  }

  const heading = formatHeading(selectedDate);

  return (
    <section className="custom-scrollbar mt-16 flex-1 overflow-y-auto p-8 md:p-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <h1 className="mb-2 text-5xl font-extrabold text-on-surface">{heading.title}</h1>
          <p className="font-body text-on-surface-variant">
            {heading.subtitle}. You have {tasks.filter((task) => !task.completed).length} intentions for this day.
          </p>
        </header>

        <div className="group mb-12">
          <div className="flex items-center gap-4 rounded-2xl border border-transparent bg-surface-container-lowest p-5 shadow-sm transition-all duration-300 group-focus-within:border-primary/10 group-focus-within:shadow-md">
            <PlusCircle className="text-primary" size={24} />
            <input
              className="w-full bg-transparent text-lg text-on-surface outline-none placeholder:text-outline-variant"
              placeholder="Add a task to your sanctuary..."
              type="text"
              onKeyDown={handleKeyDown}
              disabled={isSaving}
            />
            <div className="flex gap-2">
              <button className="p-2 text-outline-variant transition-colors hover:text-primary">
                <Calendar size={20} />
              </button>
              <button className="p-2 text-outline-variant transition-colors hover:text-primary">
                <Tag size={20} />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl bg-surface-container-lowest p-8 text-center text-on-surface-variant shadow-sm">
            Loading your workspace...
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  key={task.id}
                  className="group flex items-center justify-between rounded-2xl bg-surface-container-lowest p-5 transition-all duration-300 hover:shadow-sm"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <button
                      onClick={() => void onToggleTask(task.id)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${task.completed ? 'border-primary bg-primary' : 'border-outline hover:border-primary'}`}
                    >
                      {task.completed && <Check size={14} className="text-white" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <h3 className={`truncate font-body font-semibold leading-snug transition-all ${task.completed ? 'line-through text-outline-variant' : 'text-on-surface'}`}>
                        {task.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${task.category === 'Work' ? 'bg-blue-100 text-blue-700' : task.category === 'Personal' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {task.category}
                        </span>
                        {task.time && (
                          <span className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                            <Calendar size={12} /> {task.time}
                          </span>
                        )}
                        {task.priority === 'High' && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                            <AlertCircle size={12} /> High Priority
                          </span>
                        )}
                        {(task.elapsedTime || task.isRunning) && (
                          <span className={`flex items-center gap-1.5 rounded-lg px-2 py-0.5 font-mono text-[11px] ${task.isRunning ? 'animate-pulse bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                            <Clock size={12} />
                            {formatDuration(task.elapsedTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!task.completed && (
                      <button
                        onClick={() => void onToggleTimer(task.id)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${task.isRunning ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                      >
                        {task.isRunning ? (
                          <>
                            <Pause size={14} fill="currentColor" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play size={14} fill="currentColor" />
                            Start
                          </>
                        )}
                      </button>
                    )}

                    <button className="p-2 text-outline-variant opacity-0 transition-opacity group-hover:opacity-100 hover:text-on-surface-variant">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!tasks.length && (
              <div className="rounded-3xl bg-surface-container-lowest p-8 text-center text-on-surface-variant shadow-sm">
                No tasks scheduled for this day yet. Add one above to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
