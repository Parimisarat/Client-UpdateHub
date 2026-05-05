import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddUpdateModal({ clientId, issues, onClose, onAdded }) {
  const [formData, setFormData] = useState({
    update_text: '',
    meeting_notes: '',
    next_action: '',
    responsible_person: '',
    issue_id: ''
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.update_text) return;

    setLoading(true);
    const { error } = await supabase
      .from('updates')
      .insert([{ 
        client_id: clientId,
        ...formData,
        issue_id: formData.issue_id || null
      }]);

    if (error) {
      alert('Error adding update: ' + error.message);
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
          <h2 style={{ margin: 0 }}>Add Update</h2>
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', opacity: 0.8 }}>Update Status / Key Message *</label>
            <input 
              name="update_text"
              type="text" 
              required 
              value={formData.update_text} 
              onChange={handleChange} 
              placeholder="e.g. Phase 1 completed, awaiting feedback"
            />
          </div>
          
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', opacity: 0.8 }}>Meeting Notes</label>
            <textarea 
              name="meeting_notes"
              rows="3" 
              value={formData.meeting_notes} 
              onChange={handleChange} 
              placeholder="What was discussed?"
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', opacity: 0.8 }}>Next Action</label>
            <input 
              name="next_action"
              type="text" 
              value={formData.next_action} 
              onChange={handleChange} 
              placeholder="What needs to be done next?"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', opacity: 0.8 }}>Link to Issue</label>
              <select 
                name="issue_id"
                value={formData.issue_id} 
                onChange={handleChange}
                style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}
              >
                <option value="">No linked issue</option>
                {issues?.map(issue => (
                  <option key={issue.id} value={issue.id}>
                    {issue.status === 'closed' ? '✅' : '🔴'} {issue.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', opacity: 0.8 }}>Responsible Person</label>
              <input 
                name="responsible_person"
                type="text" 
                value={formData.responsible_person} 
                onChange={handleChange} 
                placeholder="Name"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, padding: '0.8rem' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }} disabled={loading}>
              {loading ? 'Adding...' : 'Post Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
