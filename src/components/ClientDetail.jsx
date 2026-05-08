import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MessageSquare, CheckCircle, Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AddUpdateModal from './AddUpdateModal';
import AddIssueModal from './AddIssueModal';
import AddTeamMemberModal from './AddTeamMemberModal';
import EditProjectModal from './EditProjectModal';
import { format } from 'date-fns';
import { Edit2 } from 'lucide-react';

export default function ClientDetail({ user, onRefresh, showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [issues, setIssues] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'updates', or 'issues'
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchClientData();

    // Subscribe to project-specific real-time changes
    const projectSub = supabase
      .channel(`project:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'updates', filter: `client_id=eq.${id}` }, fetchClientData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues', filter: `client_id=eq.${id}` }, fetchClientData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members', filter: `client_id=eq.${id}` }, fetchClientData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `id=eq.${id}` }, fetchClientData)
      .subscribe();

    return () => {
      supabase.removeChannel(projectSub);
    };
  }, [id]);

  async function fetchClientData() {
    setLoading(true);
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (clientError) {
      console.error(clientError);
      navigate('/');
      return;
    }

    const { data: updatesData, error: updatesError } = await supabase
      .from('updates')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    const { data: issuesData, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    const { data: teamData, error: teamError } = await supabase
      .from('team_members')
      .select('*')
      .eq('client_id', id);

    if (updatesError) console.error(updatesError);
    if (issuesError) console.error(issuesError);
    if (teamError) console.error(teamError);

    setClient(clientData);
    setUpdates(updatesData || []);
    setIssues(issuesData || []);
    setTeamMembers(teamData || []);
    setLoading(false);
    if (onRefresh) onRefresh();
  }

  async function deleteUpdate(id) {
    if (!window.confirm('Delete this update?')) return;
    const { error } = await supabase.from('updates').delete().eq('id', id);
    if (error) showToast('Error deleting update: ' + error.message, 'error');
    else {
      showToast('Update deleted');
      fetchClientData();
    }
  }

  async function deleteIssue(id) {
    if (!window.confirm('Delete this issue?')) return;
    const { error } = await supabase.from('issues').delete().eq('id', id);
    if (error) showToast('Error deleting issue: ' + error.message, 'error');
    else {
      showToast('Issue deleted');
      fetchClientData();
    }
  }

  async function updateIssueStatus(id, newStatus) {
    const { error } = await supabase.from('issues').update({ status: newStatus }).eq('id', id);
    if (error) showToast('Error updating status: ' + error.message, 'error');
    else {
      showToast('Status updated to ' + newStatus);
      fetchClientData();
    }
  }

  async function deleteTeamMember(id) {
    if (!window.confirm('Remove this team member?')) return;
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) showToast('Error removing member: ' + error.message, 'error');
    else {
      showToast('Team member removed');
      fetchClientData();
    }
  }

  if (loading) return <p>Loading project details...</p>;

  return (
    <>
      <div className="fade-in">
      <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      {/* HERO HEADER SECTION */}
      <div style={{ 
        background: 'rgba(30, 41, 59, 0.4)', 
        border: '1px solid rgba(255, 255, 255, 0.05)', 
        borderRadius: '24px', 
        padding: '3rem', 
        marginBottom: '3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Background */}
        <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.03em' }}>{client.name}</h1>
            <span className={`status-tag status-${client.status}`} style={{ fontSize: '0.75rem', padding: '0.4rem 1rem', borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {client.status?.replace('-', ' ')}
            </span>
            <button 
              onClick={() => setShowEditModal(true)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Edit Project Details"
            >
              <Edit2 size={16} />
            </button>
          </div>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.6', margin: 0 }}>
            {client.description}
          </p>
          
          {updates[0]?.next_action && (
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: '800' }}>NEXT STEP</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{updates[0].next_action}</div>
            </div>
          )}

          {client.deadline && (
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
              <Calendar size={16} />
              <span style={{ fontSize: '0.95rem' }}>Deadline: <strong style={{ color: 'var(--accent-color)' }}>{format(new Date(client.deadline), 'MMMM d, yyyy')}</strong></span>
            </div>
          )}
        </div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'right', minWidth: '280px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.1em' }}>PROJECT COMPLETION</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="40" cy="40" r="35" fill="none" stroke="var(--success)" strokeWidth="8" 
                  strokeDasharray={`${2 * Math.PI * 35}`} 
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - (issues.length > 0 ? issues.filter(i => i.status === 'closed').length / issues.length : 1))}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1rem', fontWeight: '800' }}>
                {issues.length > 0 ? Math.round((issues.filter(i => i.status === 'closed').length / issues.length) * 100) : 100}%
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)' }}>Healthy</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{issues.filter(i => i.status === 'closed').length} / {issues.length} Issues Fixed</div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="tabs-container">
        <div style={{ display: 'flex', gap: '2.5rem' }}>
          <div className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</div>
          <div className={`tab ${activeTab === 'updates' ? 'active' : ''}`} onClick={() => setActiveTab('updates')}>Updates ({updates.length})</div>
          <div className={`tab ${activeTab === 'issues' ? 'active' : ''}`} onClick={() => setActiveTab('issues')}>Issues ({issues.length})</div>
        </div>
        <button 
          onClick={() => activeTab === 'issues' ? setShowIssueModal(true) : setShowUpdateModal(true)} 
          className="btn btn-primary"
          disabled={(user.role || 'admin') !== 'admin' && activeTab === 'issues'}
        >
          <Plus size={18} /> Add {activeTab === 'issues' ? 'Issue' : 'Update'}
        </button>
      </div>

      {/* CONTENT AREA */}
      {activeTab === 'overview' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
          {/* Recent Activity Widget */}
          <div className="update-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Activity</h3>
              <Clock size={16} color="var(--text-secondary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[...updates, ...issues]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5)
                .map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '2px', background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: '-3px', width: '8px', height: '8px', borderRadius: '50%', background: item.title ? '#ef4444' : 'var(--accent-color)' }}></div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                        {item.title ? `New Issue: ${item.title}` : `Status: ${item.update_text.substring(0, 30)}...`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                        {format(new Date(item.created_at), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Project Team Widget */}
          <div className="update-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Project Team</h3>
              <button 
                onClick={() => setShowTeamModal(true)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Plus size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {teamMembers.length === 0 ? (
                <p style={{ fontSize: '0.85rem', textAlign: 'center', opacity: 0.5 }}>No team members added yet.</p>
              ) : (
                teamMembers.map((member, i) => {
                  const colors = ['#38bdf8', '#10b981', '#ff7262', '#f59e0b', '#8b5cf6'];
                  const color = colors[i % colors.length];
                  return (
                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'white', flexShrink: 0 }}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{member.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{member.role || 'Contributor'}</div>
                      </div>
                      {user.role === 'admin' && (
                        <button 
                          onClick={() => deleteTeamMember(member.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.3 }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0.3}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Resource Hub Widget */}
          <div className="update-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Resource Hub</h3>
              <MessageSquare size={16} color="var(--text-secondary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href={client.links?.figma || "#"} target="_blank" rel="noopener noreferrer" className={`resource-link-premium ${!client.links?.figma ? 'disabled' : ''}`}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 114, 98, 0.1)', color: '#ff7262' }}><MessageSquare size={18} /></div> Figma Prototypes
              </a>
              <a href={client.links?.staging || "#"} target="_blank" rel="noopener noreferrer" className={`resource-link-premium ${!client.links?.staging ? 'disabled' : ''}`}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><CheckCircle size={18} /></div> Staging Environment
              </a>
              <a href={client.links?.docs || "#"} target="_blank" rel="noopener noreferrer" className={`resource-link-premium ${!client.links?.docs ? 'disabled' : ''}`}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)' }}><Clock size={18} /></div> Technical Docs
              </a>
            </div>
          </div>
        </div>
      ) : activeTab === 'updates' ? (
        <div className="timeline">
          {updates.length === 0 ? (
            <div className="update-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p>No updates yet. Add the first one!</p>
            </div>
          ) : (
            updates.map((update) => (
              <div key={update.id} className="timeline-item">
                <div className="update-card">
                  <div className="update-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} /> {update.responsible_person || 'Anonymous'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} /> {format(new Date(update.created_at), 'MMM d, yyyy • h:mm a')}
                    </span>
                    {user.role === 'admin' && (
                      <button 
                        onClick={() => deleteUpdate(update.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 'auto' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  <h3 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>
                    {update.update_text}
                  </h3>

                  {update.issue_id && (
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-progress" style={{ fontSize: '0.65rem' }}>Related Issue</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                        {issues.find(i => i.id === update.issue_id)?.title || 'Linked Issue'}
                      </span>
                    </div>
                  )}

                  {update.meeting_notes && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Meeting Notes</h4>
                      <p style={{ fontSize: '0.95rem' }}>{update.meeting_notes}</p>
                    </div>
                  )}

                  {update.next_action && (
                    <div className="next-action">
                      <CheckCircle size={16} color="var(--accent-color)" />
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                        Next Step: <span style={{ color: 'var(--text-primary)' }}>{update.next_action}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="issues-list">
          {issues.length === 0 ? (
            <div className="issue-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p>No issues reported yet. Good job!</p>
            </div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="issue-card">
                <div className="issue-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`badge badge-${issue.status === 'in-progress' ? 'progress' : issue.status}`}>
                      {issue.status}
                    </span>
                    <h3 style={{ margin: 0 }}>{issue.title}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select 
                      value={issue.status} 
                      onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
                      style={{ background: 'var(--sidebar-bg)', border: '1px solid var(--border-color)', color: 'white', padding: '0.25rem', borderRadius: '4px', fontSize: '0.8rem' }}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                    {user.role === 'admin' && (
                      <button 
                        onClick={() => deleteIssue(issue.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '0.95rem', margin: '0.5rem 0' }}>{issue.description}</p>
                {issue.assigned_to && (
                  <div className="issue-assignee">
                    <User size={14} /> Assigned to: <span style={{ color: 'var(--text-primary)' }}>{issue.assigned_to}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showUpdateModal && (
        <AddUpdateModal 
          clientId={id} 
          issues={issues}
          onClose={() => setShowUpdateModal(false)} 
          onAdded={() => {
            showToast('Update posted');
            fetchClientData();
          }} 
          showToast={showToast}
        />
      )}

      {showIssueModal && (
        <AddIssueModal 
          clientId={id} 
          onClose={() => setShowIssueModal(false)} 
          onAdded={() => {
            showToast('Issue tracked');
            fetchClientData();
          }} 
          showToast={showToast}
        />
      )}

      {showTeamModal && (
        <AddTeamMemberModal 
          clientId={id} 
          onClose={() => setShowTeamModal(false)} 
          onAdded={() => {
            showToast('Team member added');
            fetchClientData();
          }} 
          showToast={showToast}
        />
      )}

      {showEditModal && (
        <EditProjectModal 
          client={client}
          onClose={() => setShowEditModal(false)} 
          onUpdated={() => {
            showToast('Project updated');
            fetchClientData();
          }} 
          showToast={showToast}
        />
      )}
      </div>
    </>
  );
}
