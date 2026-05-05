import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddIssueModal({ clientId, onClose, onAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
    assigned_to: ''
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.title) return;

    setLoading(true);
    const { error } = await supabase
      .from('issues')
      .insert([{ 
        client_id: clientId,
        ...formData
      }]);

    if (error) {
      alert('Error adding issue: ' + error.message);
      setLoading(false);
    } else {
      onAdded();
      onClose();
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>Track New Issue</h2>
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Issue Title *</label>
            <input 
              name="title"
              type="text" 
              required 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="e.g. Broken login button"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description"
              rows="3" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Detailed explanation of the problem..."
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Status</label>
              <select 
                name="status"
                value={formData.status} 
                onChange={handleChange}
                style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white', padding: '0.75rem', borderRadius: '8px' }}
              >
                <option value="open">🔴 Open</option>
                <option value="in-progress">🟡 In Progress</option>
                <option value="closed">🟢 Closed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Assigned To</label>
              <input 
                name="assigned_to"
                type="text" 
                value={formData.assigned_to} 
                onChange={handleChange} 
                placeholder="Developer name"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
