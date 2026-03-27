import { Inbox, Briefcase, User, Archive, Plus, HelpCircle, LogOut, Sparkles } from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  onLogout: () => void;
  customLists: string[];
  onNewList: () => void;
}

export default function Sidebar({ activeCategory, onCategoryChange, onLogout, customLists, onNewList }: SidebarProps) {
  const navItems = [
    { id: 'Inbox', icon: Inbox, label: 'Inbox' },
    { id: 'Work', icon: Briefcase, label: 'Work' },
    { id: 'Personal', icon: User, label: 'Personal' },
    { id: 'Archive', icon: Archive, label: 'Archive' },
  ];

  return (
    <aside className="hidden md:flex flex-col sticky top-0 h-screen p-4 bg-surface-container-low w-64 border-r border-surface-container-high transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-3 px-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
          <Sparkles className="text-primary" size={24} />
        </div>
        <div>
          <h2 className="font-headline font-bold text-on-surface text-sm leading-tight">My Sanctuary</h2>
          <p className="font-body text-on-surface-variant text-[10px] uppercase tracking-wider">Productivity Flow</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onCategoryChange(item.id as Category)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ease-in-out ${
              activeCategory === item.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary hover:bg-white/50'
            }`}
          >
            <item.icon size={20} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}

        {customLists.length > 0 && (
          <div className="pt-4 space-y-1">
            <p className="px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Custom Lists</p>
            {customLists.map((list) => (
              <button
                key={list}
                onClick={() => onCategoryChange(list as Category)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl font-bold transition-all duration-300 ease-in-out ${
                  activeCategory === list
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary hover:bg-white/50'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <span className="text-sm">{list}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="mt-auto space-y-4">
        <button 
          onClick={onNewList}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm shadow-sm hover:bg-primary-dim active:scale-95 transition-all"
        >
          <Plus size={18} />
          New List
        </button>
        <div className="pt-4 space-y-1">
          <a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-medium" href="#">
            <HelpCircle size={18} />
            Help
          </a>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-red-500 transition-colors text-xs font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
