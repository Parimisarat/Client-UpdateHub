import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, ArrowLeft, User, Calendar, MessageSquare, CheckCircle, LayoutDashboard, Briefcase, Trash2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import ClientDetail from './components/ClientDetail';
import AddClientModal from './components/AddClientModal';
import Login from './components/Login';
import { LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 });
  const [refreshToggle, setRefreshToggle] = useState(0);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
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
              <Link to="/" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)' }}>
                <LayoutDashboard size={18} /> <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Dashboard</span>
              </Link>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-title">Analytics</h4>
              <div className="stat-row">
                <span className="stat-label">Total Projects</span>
                <span className="stat-num">{stats.total}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">On Track</span>
                <span className="stat-num" style={{ color: 'var(--success)' }}>{stats.active}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Blocked</span>
                <span className="stat-num" style={{ color: '#ef4444' }}>{stats.blocked}</span>
              </div>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-title">Status Key</h4>
              <div className="legend-grid">
                <div className="legend-pill"><span className="dot dot-track"></span> Track</div>
                <div className="legend-pill"><span className="dot dot-risk"></span> Risk</div>
                <div className="legend-pill"><span className="dot dot-blocked"></span> Blocked</div>
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
            <Route path="/" element={<Dashboard onRefresh={fetchGlobalData} refreshKey={refreshToggle} />} />
            <Route path="/client/:id" element={<ClientDetail onRefresh={fetchGlobalData} />} />
          </Routes>
        </main>

        {showAddModal && (
          <AddClientModal 
            onClose={() => setShowAddModal(false)} 
            onAdded={() => {
              setShowAddModal(false);
              setRefreshToggle(prev => prev + 1);
              fetchGlobalData();
              if (window.location.pathname !== '/') window.location.href = '/';
            }} 
          />
        )}
      </div>
    </Router>
  );
}

function Dashboard({ onRefresh, refreshKey }) {
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
      .order('name');

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
      alert('Error deleting client: ' + error.message);
    } else {
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
            <ClientCard key={client.id} client={client} onDelete={deleteClient} />
          ))}
          {filteredClients.length === 0 && !loading && (
            <p>No projects found. Create one to get started!</p>
          )}
        </div>
      )}
    </div>
  );
}

function ClientCard({ client, onDelete }) {
  const navigate = useNavigate();
  
  const sortedUpdates = [...(client.updates || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const latestUpdate = sortedUpdates[0];
  
  const openIssues = (client.issues || []).filter(i => i.status !== 'closed');

  const statusMap = {
    'on-track': { label: 'On Track', class: 'status-on-track' },
    'waiting': { label: 'At Risk', class: 'status-waiting' },
    'blocked': { label: 'Blocked', class: 'status-blocked' }
  };

  const status = statusMap[client.status] || statusMap['on-track'];

  return (
    <div className="client-card" onClick={() => navigate(`/client/${client.id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{client.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`status-tag ${status.class}`}>{status.label}</span>
          <button 
            onClick={(e) => onDelete(e, client.id)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '4rem', lineHeight: '1.6' }}>
        {latestUpdate ? (
          <span><MessageSquare size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {latestUpdate.update_text}</span>
        ) : (
          client.description || 'No updates posted yet.'
        )}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={14} /> {latestUpdate?.responsible_person || 'Admin'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={14} /> {openIssues.length} Issues
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
          <Calendar size={12} style={{ marginRight: '4px' }} />
          {latestUpdate ? new Date(latestUpdate.created_at).toLocaleDateString() : 'Never'}
        </div>
      </div>
    </div>
  );
}

export default App;
