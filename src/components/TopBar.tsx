import { Search, Bell, Settings } from 'lucide-react';
import type { User } from '../types';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: User | null;
}

export default function TopBar({ searchQuery, onSearchChange, user }: TopBarProps) {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-50 bg-white/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tight text-primary font-headline">Serene Flow</span>
        <div className="hidden sm:flex items-center bg-surface-container px-4 py-2 rounded-full gap-2 w-64">
          <Search className="text-outline-variant" size={18} />
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm font-body w-full placeholder-outline-variant outline-none" 
            placeholder="Search tasks..." 
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
          <Bell size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
          <Settings size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-on-surface">{user?.name || 'Flow Member'}</p>
            <p className="text-[11px] text-on-surface-variant">{user?.email || 'Signed in'}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-primary-container bg-primary/10 text-xs font-bold text-primary">
            {user?.avatar ? (
              <img alt="User profile avatar" className="h-full w-full object-cover" src={user.avatar} referrerPolicy="no-referrer" />
            ) : (
              (user?.name || 'S').slice(0, 1).toUpperCase()
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
