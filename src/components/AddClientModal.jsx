import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddClientModal({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('on-track');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    const { error } = await supabase
      .from('clients')
      .insert([{ name, description, status, deadline: deadline || null }]);

    if (error) {
      alert('Error adding client: ' + error.message);
      setLoading(false);
    } else {
      onAdded();
      onClose();
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>Add New Project</h2>
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name *</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Website Redesign"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Initial Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}
              >
                <option value="on-track">🟢 On Track</option>
                <option value="at-risk">🟡 At Risk</option>
                <option value="blocked">🔴 Blocked</option>
              </select>
            </div>
            <div className="form-group">
              <label>Project Deadline</label>
              <input 
                type="date" 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)} 
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              rows="3" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Brief overview of the project..."
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
