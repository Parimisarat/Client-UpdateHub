import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddTeamMemberModal({ clientId, onClose, onAdded, showToast }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    const { error } = await supabase
      .from('team_members')
      .insert([{ 
        client_id: clientId,
        name,
        role
      }]);

    if (error) {
      if (showToast) showToast('Error adding team member: ' + error.message, 'error');
      else alert('Error adding team member: ' + error.message);
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
          <h2 style={{ margin: 0 }}>Add Team Member</h2>
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Member Name *</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div className="form-group">
            <label>Role / Designation</label>
            <input 
              type="text" 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, padding: '0.8rem' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }} disabled={loading}>
              {loading ? 'Adding...' : 'Add to Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
