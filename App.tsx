import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import BillingModal from './components/BillingModal';
import Login from './components/Login';
import { MOCK_DATA } from './services/mockData';
import { ServiceRecord, ViewMode } from './types';
import { Plus, Loader2, Database, WifiOff } from 'lucide-react';
import { supabase } from './services/supabaseClient';

// Default empty record for creation
const EMPTY_RECORD: ServiceRecord = {
  id: '',
  caseId: '',
  orderDescription: '',
  serviceType: '',
  department: '',
  municipality: '',
  difficulty: '',
  beneficiary: '',
  date: new Date().toLocaleDateString('es-CO'),
  acta: '',
  valueLabor: 0,
  valueAdditionalDay: 0,
  valueFailedVisit: 0,
  valueCivilWorks: 0,
  valueTransport: 0,
  advanceAmount: 0,
  totalAdvances: 0,
  iva: 0,
  reteFuente: 0,
  reteIca: 0,
  otherDiscounts: 0,
  subtotalService: 0,
  totalService: 0,
  balanceLabor: 0,
  balanceToPay: 0,
  status: 'Abierto',
  observation: ''
};

const AUTH_STORAGE_KEY = 'panamproject_auth';
const LOCAL_STORAGE_KEY = 'panamproject_db_v1'; // Fallback for offline mode

const App: React.FC = () => {
  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });

  // --- APP STATE ---
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [data, setData] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // --- DATA FETCH ---
  const fetchServices = async () => {
    setIsLoading(true);

    // 1. If Supabase is NOT configured (null), use LocalStorage/Mock
    if (!supabase) {
      console.warn("Supabase no configurado. Usando modo Local/Mock.");
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        try {
          setData(JSON.parse(localData));
        } catch {
          setData(MOCK_DATA);
        }
      } else {
        setData(MOCK_DATA);
      }
      setIsLoading(false);
      return;
    }

    // 2. If Supabase IS configured, fetch from Cloud
    try {
      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty if connection fails
        if (data.length === 0) setData(MOCK_DATA); 
      } else {
        if (services && services.length > 0) {
            setData(services as ServiceRecord[]);
        } else {
             setData([]); 
        }
      }
    } catch (err) {
      console.error("Connection error:", err);
      // Fallback
      if (data.length === 0) setData(MOCK_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchServices();
    }
  }, [isAuthenticated]);

  // --- HANDLERS ---

  const handleLogin = () => {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setCurrentView('dashboard');
  };

  const handleEditRecord = (record: ServiceRecord) => {
    setSelectedRecord(record);
    setIsNewRecord(false);
  };

  const handleCreateRecord = () => {
    // Create a unique ID
    const newId = Date.now().toString(); 
    setSelectedRecord({ ...EMPTY_RECORD, id: newId });
    setIsNewRecord(true);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!id) return;

    // 1. Optimistic UI Update (Remove immediately from list)
    const prevData = [...data];
    const newData = data.filter(item => item.id !== id);
    setData(newData);
    setSelectedRecord(null); // Close modal

    // 2. Persistence
    if (!supabase) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
      return;
    }

    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      console.error("Error deleting from DB:", err);
      alert("Error eliminando el registro de la nube. Por favor recargue la página.");
      // Rollback logic could go here, but for now we warn the user
      fetchServices(); 
    }
  };

  const handleSaveRecord = async (updatedRecord: ServiceRecord) => {
    // Optimistic Update (Update UI immediately)
    const prevData = [...data];
    let newData: ServiceRecord[] = [];
    
    if (isNewRecord) {
      newData = [updatedRecord, ...prevData];
    } else {
      newData = prevData.map(item => item.id === updatedRecord.id ? updatedRecord : item);
    }
    
    setData(newData);
    
    // Close modal immediately
    setSelectedRecord(null);
    setIsNewRecord(false);

    // PERSISTENCE LOGIC
    if (!supabase) {
        // Fallback: Save to LocalStorage if no DB
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
        return;
    }

    // DB Update in Background
    try {
        if (isNewRecord) {
            const { error } = await supabase.from('services').insert([updatedRecord]);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('services')
                .update(updatedRecord)
                .eq('id', updatedRecord.id);
            if (error) throw error;
        }
    } catch (err: any) {
        console.error("Error saving to DB:", err);
        // Show specific error message for easier debugging
        alert(`Error guardando en la nube: ${err.message || 'Error desconocido'}`);
    }
  };

  // --- RENDER ---

  if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onLogout={handleLogout}
      />
      
      <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
                {currentView === 'dashboard' ? 'Panel de Control' : 'Gestión de Facturación'}
            </h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              Bienvenido a <span className="font-semibold text-blue-600">Panamproject</span>.
              
              {/* Status Indicator */}
              {isLoading ? (
                  <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Loader2 size={10} className="animate-spin" /> Conectando...
                  </span>
              ) : supabase ? (
                   <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Database size={10} /> En Línea
                  </span>
              ) : (
                  <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full border border-slate-300">
                    <WifiOff size={10} /> Modo Local
                  </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
             {currentView === 'invoices' && (
               <button 
                onClick={handleCreateRecord}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all active:scale-95"
               >
                 <Plus size={20} />
                 Nuevo Servicio
               </button>
             )}
             <div className="flex items-center gap-3 border-l pl-4 border-slate-300">
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-slate-700">Admin User</div>
                    <div className="text-xs text-slate-400">Administrador</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-600 shadow-sm">
                    AD
                </div>
             </div>
          </div>
        </header>

        {currentView === 'dashboard' && <Dashboard data={data} />}
        
        {currentView === 'invoices' && (
          <InvoiceList 
            data={data} 
            onEdit={handleEditRecord} 
          />
        )}

      </main>

      {/* Modal is rendered at root level but controlled via state */}
      <BillingModal 
        record={selectedRecord} 
        onClose={() => setSelectedRecord(null)} 
        onSave={handleSaveRecord}
        onDelete={handleDeleteRecord}
        isNew={isNewRecord}
      />
    </div>
  );
};

export default App;