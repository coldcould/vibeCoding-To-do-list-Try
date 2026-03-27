import { Bolt, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Stats } from '../types';

interface StatsSidebarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  stats: Stats;
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function StatsSidebar({ selectedDate, onDateChange, stats }: StatsSidebarProps) {
  const currentDate = new Date(selectedDate);
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);
  const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const firstWeekday = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const dayCells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];

  function moveMonth(offset: number) {
    const target = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    onDateChange(toIsoDate(target));
  }

  return (
    <aside className="custom-scrollbar mt-16 hidden w-80 overflow-y-auto bg-surface-container-low p-8 lg:block">
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
        <h4 className="mb-6 flex items-center gap-2 font-bold text-on-surface">
          <Bolt className="fill-primary text-primary" size={20} />
          Focus Stats
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-surface p-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Focus Score</p>
            <p className="text-3xl font-extrabold text-primary">{stats.focusScore}</p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Completed</p>
            <p className="text-3xl font-extrabold text-on-surface">{stats.completedCount}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-surface p-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Focus Minutes</p>
            <p className="text-2xl font-extrabold text-on-surface">{stats.focusMinutes}</p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tasks Today</p>
            <p className="text-2xl font-extrabold text-on-surface">{stats.totalTasks}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex justify-between px-1 text-xs font-medium">
            <span>Daily Goal</span>
            <span>{stats.completionRate}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-primary" style={{ width: `${stats.completionRate}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="font-bold text-on-surface">{monthLabel}</h4>
          <div className="flex gap-1">
            <button onClick={() => moveMonth(-1)} className="rounded-lg p-1 transition-colors hover:bg-surface">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => moveMonth(1)} className="rounded-lg p-1 transition-colors hover:bg-surface">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="mb-2 grid grid-cols-7 gap-y-3 text-center">
          {weekdayLabels.map((day, index) => (
            <span key={`${day}-${index}`} className="text-[10px] font-bold text-outline-variant">
              {day}
            </span>
          ))}
          {dayCells.map((day, index) =>
            day ? (
              <button
                key={`${day}-${index}`}
                onClick={() => onDateChange(toIsoDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)))}
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all ${day === currentDate.getDate() ? 'bg-primary font-bold text-white' : 'cursor-pointer text-on-surface-variant hover:bg-surface'}`}
              >
                {day}
              </button>
            ) : (
              <span key={`empty-${index}`} />
            ),
          )}
        </div>
      </div>

      <div className="group relative mt-8 aspect-[4/3] overflow-hidden rounded-3xl">
        <img
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400"
          alt="Breathtaking mountain lake landscape"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6">
          <p className="mb-2 text-base italic leading-tight text-white">
            "Peace is the result of retraining your mind to process life as it is."
          </p>
          <p className="text-[10px] uppercase tracking-wider text-white/80">Wayne Dyer</p>
        </div>
      </div>
    </aside>
  );
}
