import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function EditProjectModal({ client, onClose, onUpdated, showToast }) {
  const getInitialDeadline = () => {
    if (!client.deadline) return '';
    const date = new Date(client.deadline);
    return !isNaN(date.getTime()) ? format(date, 'yyyy-MM-dd') : '';
  };

  const [formData, setFormData] = useState({
    name: client.name,
    description: client.description,
    status: client.status,
    deadline: getInitialDeadline(),
    figma: client.links?.figma || '',
    staging: client.links?.staging || '',
    docs: client.links?.docs || ''
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('clients')
      .update({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        deadline: formData.deadline || null,
        links: {
          figma: formData.figma,
          staging: formData.staging,
          docs: formData.docs
        }
      })
      .eq('id', client.id);

    if (error) {
      if (showToast) showToast('Error updating project: ' + error.message, 'error');
      else alert('Error updating project: ' + error.message);
      setLoading(false);
    } else {
      onUpdated();
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
          <h2 style={{ margin: 0 }}>Edit Project Details</h2>
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
              name="name"
              type="text" 
              required 
              value={formData.name} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description"
              rows="3" 
              value={formData.description} 
              onChange={handleChange} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
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
                name="deadline"
                type="date" 
                value={formData.deadline} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Resource Hub Links</h4>
            <div className="form-group">
              <label>Figma Prototype Link</label>
              <input name="figma" type="url" value={formData.figma} onChange={handleChange} placeholder="https://figma.com/file/..." />
            </div>
            <div className="form-group">
              <label>Staging URL</label>
              <input name="staging" type="url" value={formData.staging} onChange={handleChange} placeholder="https://staging.example.com" />
            </div>
            <div className="form-group">
              <label>Technical Docs (Notion/GitHub)</label>
              <input name="docs" type="url" value={formData.docs} onChange={handleChange} placeholder="https://notion.so/..." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, padding: '0.8rem' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
