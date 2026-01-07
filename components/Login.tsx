import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Admin' && password === '123456') {
      onLogin();
    } else {
      setError('Credenciales incorrectas. Intente nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header - Changed to White to accommodate the Logo */}
        <div className="bg-white p-8 text-center border-b border-slate-100">
            <div className="flex justify-center mb-4">
                {/* Logo Image */}
                <img 
                    src="/logo.png" 
                    alt="Panamproject Logo" 
                    className="h-20 w-auto object-contain"
                    onError={(e) => {
                        // Fallback text if image is missing
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                />
                {/* Fallback Title (Hidden by default unless image fails) */}
                <h1 className="hidden text-2xl font-bold text-blue-700 tracking-wide">PANAMPROJECT</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium">Sistema de Gestión de Facturación</p>
        </div>

        {/* Form */}
        <div className="p-8 bg-slate-50/50">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Usuario</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                            placeholder="Ingrese su usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="password" 
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
                >
                    Ingresar al Sistema
                    <ArrowRight size={18} />
                </button>
            </form>
        </div>

        {/* Footer Credit */}
        <div className="bg-white p-4 text-center border-t border-slate-100 flex flex-col gap-1">
             <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Developed by <span className="text-slate-600 font-bold">CENTRAL</span> by Santiago Rojas
             </p>
             <span className="text-[9px] text-slate-300 font-mono">v1.1 System Online</span>
        </div>

      </div>
    </div>
  );
};

export default Login;