
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronRight,
  ShieldCheck,
  Truck,
  BookOpen,
  Cake,
  FileText
} from 'lucide-react';
import { cn } from './UI';
import { supabase } from '../lib/supabase';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
      active 
        ? 'bg-blue-50 text-blue-600' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    )}
  >
    <Icon className={cn('h-5 w-5', active ? 'text-blue-600' : 'text-slate-400')} />
    <span>{label}</span>
    {active && <ChevronRight className="ml-auto h-4 w-4" />}
  </button>
);

export const Layout = ({ children, activeTab, setActiveTab }: { 
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('Usuário');

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      } else if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0',
          !isSidebarOpen && '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">ServerMaster</span>
          </div>
        </div>

        <nav className="space-y-1 p-4">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
          />
          <SidebarItem 
            icon={Users} 
            label="Servidores" 
            active={activeTab === 'servers'} 
            onClick={() => setActiveTab('servers')}
          />
          <SidebarItem 
            icon={ShieldCheck} 
            label="Vantagens" 
            active={activeTab === 'benefits'} 
            onClick={() => setActiveTab('benefits')}
          />
          <SidebarItem 
            icon={Truck} 
            label="Locomoção" 
            active={activeTab === 'mobility'} 
            onClick={() => setActiveTab('mobility')}
          />
          <SidebarItem 
            icon={BookOpen} 
            label="Orientações Técnicas" 
            active={activeTab === 'guidance'} 
            onClick={() => setActiveTab('guidance')}
          />
          <SidebarItem 
            icon={Cake} 
            label="Aniversariantes" 
            active={activeTab === 'birthdays'} 
            onClick={() => setActiveTab('birthdays')}
          />
          <SidebarItem 
            icon={FileText} 
            label="Relatórios" 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')}
          />
        </nav>

        <div className="absolute bottom-0 w-full border-t border-slate-200 p-4">
          <SidebarItem 
            icon={Settings} 
            label="Configurações" 
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
          <SidebarItem 
            icon={LogOut} 
            label="Sair" 
            onClick={async () => {
              await supabase.auth.signOut();
            }}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <button 
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>

          <div className="hidden max-w-md flex-1 lg:flex items-center px-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">Administrador</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
