import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Plus, Search, User, Calendar, MessageSquare, CheckCircle, LayoutDashboard, Briefcase, Trash2, XCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import ClientDetail from './components/ClientDetail';
import AddClientModal from './components/AddClientModal';
import Login from './components/Login';
import CalendarView from './components/CalendarView';
import { LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hub_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 });
  const [refreshToggle, setRefreshToggle] = useState(0);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('hub_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hub_user');
  };

  useEffect(() => {
    fetchGlobalData();
    
    // Subscribe to real-time changes
    const clientsSub = supabase
      .channel('public:clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        fetchGlobalData();
        setRefreshToggle(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(clientsSub);
    };
  }, []);

  async function fetchGlobalData() {
    // Fetch Stats
    const { data: clients, error: clientsError } = await supabase.from('clients').select('status');
    if (!clientsError) {
      setStats({
        total: clients.length,
        active: clients.filter(c => c.status === 'on-track').length,
        blocked: clients.filter(c => c.status === 'blocked').length
      });
    }
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', cursor: 'default', userSelect: 'none' }}>
            <div style={{ background: 'var(--accent-color)', padding: '0.5rem', borderRadius: '8px' }}>
              <Briefcase size={24} color="white" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>UpdateHub</h2>
          </div>

          <div style={{ marginBottom: '2.5rem', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
            <div style={{ width: '28px', height: '28px', background: 'var(--accent-color)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Status: Online</div>
            </div>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <Link to="/" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', marginBottom: '0.5rem' }}>
                <LayoutDashboard size={18} /> <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Dashboard</span>
              </Link>
              <Link to="/calendar" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.6rem 0.8rem', background: 'transparent' }}>
                <Calendar size={18} /> <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Deadlines</span>
              </Link>
            </div>

            <div className="sidebar-section" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 className="sidebar-title" style={{ margin: 0 }}>System Health</h4>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>LIVE</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--status-on-track)' }}>{stats.active}</div>
                  <div style={{ fontSize: '0.5rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Track</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--status-blocked)' }}>{stats.blocked}</div>
                  <div style={{ fontSize: '0.5rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Blocked</div>
                </div>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${(stats.active / (stats.total || 1)) * 100}%`, background: 'var(--status-on-track)' }}></div>
                <div style={{ width: `${((stats.total - stats.active - stats.blocked) / (stats.total || 1)) * 100}%`, background: 'var(--status-waiting)' }}></div>
                <div style={{ width: `${(stats.blocked / (stats.total || 1)) * 100}%`, background: 'var(--status-blocked)' }}></div>
              </div>
            </div>
          </nav>

          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary new-project-btn" 
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            <Plus size={18} /> New Project
          </button>

          <button 
            onClick={handleLogout}
            className="btn btn-secondary" 
            style={{ width: '100%', justifyContent: 'flex-start', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} onRefresh={fetchGlobalData} refreshKey={refreshToggle} showToast={showToast} />} />
            <Route path="/client/:id" element={<ClientDetail user={user} onRefresh={fetchGlobalData} showToast={showToast} />} />
            <Route path="/calendar" element={<CalendarView />} />
          </Routes>
        </main>

        {/* Global Toast System */}
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {toasts.map(toast => (
            <div 
              key={toast.id} 
              style={{ 
                background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
                color: 'white',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(8px)',
                minWidth: '300px'
              }}
            >
              {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
              <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{toast.message}</div>
            </div>
          ))}
        </div>

        {showAddModal && (
          <AddClientModal 
            onClose={() => setShowAddModal(false)} 
            onAdded={() => {
              setShowAddModal(false);
              setRefreshToggle(prev => prev + 1);
              fetchGlobalData();
              showToast('Project created successfully!');
            }} 
          />
        )}
      </div>
    </Router>
  );
}

function Dashboard({ user, onRefresh, refreshKey, showToast }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, [refreshKey]);

  async function fetchClients() {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        updates (
          update_text,
          next_action,
          responsible_person,
          created_at
        ),
        issues (
          title,
          status,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setClients(data || []);
    setLoading(false);
    if (onRefresh) onRefresh();
  }

  async function deleteClient(e, id) {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project? All updates will be lost.')) return;

    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      showToast('Error deleting client: ' + error.message, 'error');
    } else {
      showToast('Project deleted');
      fetchClients();
    }
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Client Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage and track all project status updates and issue tracking in one place.</p>
      </header>

      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Search clients or projects..." 
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="client-grid">
          {filteredClients.map(client => (
            <ClientCard 
              key={client.id} 
              client={client} 
              user={user} 
              onRefresh={fetchClients} 
              showToast={showToast} 
            />
          ))}
          {filteredClients.length === 0 && !loading && (
            <p>No projects found. Create one to get started!</p>
          )}
        </div>
      )}
    </div>
  );
}

function ClientCard({ client, user, onRefresh, showToast }) {
  const navigate = useNavigate();
  
  const sortedUpdates = [...(client.updates || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const latestUpdate = sortedUpdates[0];
  const issues = client.issues || [];
  const openIssues = issues.filter(i => i.status !== 'closed');
  const closedIssues = issues.filter(i => i.status === 'closed').length;
  const progress = issues.length > 0 ? Math.round((closedIssues / issues.length) * 100) : 100;

  return (
    <div className={`client-card ${client.status}`} onClick={() => navigate(`/client/${client.id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className={`pulse-dot dot-${client.status}`}></span>
            <h3 className="client-name" style={{ margin: 0 }}>{client.name}</h3>
          </div>
          <p className="client-desc" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{client.description?.substring(0, 45)}...</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`status-tag status-${client.status}`} style={{ fontSize: '0.65rem' }}>
              {client.status.replace('-', ' ')}
            </span>
            {user.role === 'admin' && (
              <button 
                onClick={(e) => deleteClient(e, client.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.3 }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.3}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
          <div style={{ position: 'relative', width: '36px', height: '36px' }}>
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke={client.status === 'blocked' ? 'var(--status-blocked)' : 'var(--status-on-track)'} strokeWidth="3" 
                strokeDasharray={`${2 * Math.PI * 15}`} 
                strokeDashoffset={`${2 * Math.PI * 15 * (1 - (progress / 100))}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.55rem', fontWeight: '800' }}>
              {progress}%
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.02)', 
        borderRadius: '12px', 
        padding: '1rem', 
        marginBottom: '1.5rem',
        border: '1px solid rgba(255,255,255,0.03)'
      }}>
        {latestUpdate ? (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ padding: '6px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px', height: 'fit-content' }}>
              <MessageSquare size={12} color="var(--accent-color)" />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Latest Activity</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {latestUpdate.update_text}
              </p>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, textAlign: 'center', fontStyle: 'italic' }}>No activity yet.</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.6 }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={12} /> {openIssues.length} Issues
          </div>
        </div>
        <div style={{ fontSize: '0.7rem' }}>
          <Calendar size={11} style={{ marginRight: '4px' }} />
          {client.deadline ? new Date(client.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No deadline'}
        </div>
      </div>
    </div>
  );
}

export default App;
