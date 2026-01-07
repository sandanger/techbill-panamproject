import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, Code } from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'invoices', icon: FileText, label: 'Facturación' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-10 shadow-xl border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
          Panamproject
        </h1>
        <p className="text-xs text-slate-400 mt-1">Gestión de Ordenes</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewMode)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors">
          <Settings size={20} />
          <span>Configuración</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors hover:bg-red-900/10 rounded-lg"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Developer Credit Footer */}
      <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800">
        <div className="flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
            <Code size={12} className="text-teal-500 mb-1" />
            <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
                Desarrollado por <br/>
                <span className="text-slate-300 font-bold">CENTRAL</span> <br/>
                <span className="normal-case tracking-normal">by Santiago Rojas</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;