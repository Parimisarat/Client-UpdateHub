import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, deadline, status')
      .not('deadline', 'is', null);
    
    if (error) console.error(error);
    else setProjects(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Project Deadlines</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Visual timeline of upcoming project completion dates.</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={20} /></button>
        <span style={{ fontSize: '1.1rem', fontWeight: '700', minWidth: '150px', textAlign: 'center' }}>{format(currentMonth, 'MMMM yyyy')}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}><ChevronRight size={20} /></button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '1rem' }}>
        {days.map(day => (
          <div key={day} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border-color)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        {calendarDays.map(day => {
          const dayProjects = projects.filter(p => isSameDay(new Date(p.deadline), day));
          const isSelectedMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={day.toString()} 
              style={{ 
                minHeight: '140px', 
                background: isSelectedMonth ? 'rgba(15, 23, 42, 0.4)' : 'rgba(2, 6, 23, 0.2)', 
                padding: '1rem',
                position: 'relative'
              }}
            >
              <span style={{ 
                fontSize: '0.9rem', 
                fontWeight: isToday ? '800' : '500', 
                color: isToday ? 'var(--accent-color)' : isSelectedMonth ? 'white' : 'rgba(255,255,255,0.2)',
                display: 'inline-block',
                marginBottom: '0.75rem'
              }}>
                {format(day, 'd')}
                {isToday && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-color)', margin: '2px auto 0' }}></div>}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dayProjects.map(project => (
                  <div 
                    key={project.id} 
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '6px 8px', 
                      borderRadius: '6px', 
                      background: `rgba(${project.status === 'blocked' ? '239, 68, 68' : project.status === 'at-risk' ? '245, 158, 11' : '56, 189, 248'}, 0.15)`, 
                      color: project.status === 'blocked' ? '#ef4444' : project.status === 'at-risk' ? '#f59e0b' : 'var(--accent-color)',
                      borderLeft: `3px solid ${project.status === 'blocked' ? '#ef4444' : project.status === 'at-risk' ? '#f59e0b' : 'var(--accent-color)'}`,
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={project.name}
                  >
                    {project.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <div className="fade-in" style={{ padding: '2rem' }}>Loading calendar...</div>;

  return (
    <div className="fade-in">
      {renderHeader()}
      <div className="update-card" style={{ padding: '2.5rem', background: 'rgba(15, 23, 42, 0.6)' }}>
        {renderDays()}
        {renderCells()}
      </div>
      
      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.2)', borderLeft: '3px solid var(--accent-color)' }}></div>
          On Track
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(245, 158, 11, 0.2)', borderLeft: '3px solid #f59e0b' }}></div>
          At Risk
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.2)', borderLeft: '3px solid #ef4444' }}></div>
          Blocked
        </div>
      </div>
    </div>
  );
}
