import React, { useState } from 'react';
import { Calendar, Search, MapPin, Clock } from 'lucide-react';

function ShariaSessions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState([]);

  const filteredSessions = sessions.filter(s => 
    s.name.includes(searchTerm) || 
    s.teacher.includes(searchTerm) || 
    s.location.includes(searchTerm)
  );

  return (
    <div style={{ padding: '10px 0', direction: 'rtl' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={24} color="var(--accent-gold)" />
            الحلقات والمجموعات الدراسية
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            متابعة مواعيد وأماكن انعقاد الحلقات الدراسية وحلقات التسميع
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="البحث باسم الحلقة، المعلم، أو القاعة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', right: '14px', top: '12px' }} />
        </div>
      </div>

      {/* Sessions Cards Grid */}
      {filteredSessions.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          لا توجد حلقات دراسية مسجلة حالياً.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {filteredSessions.map(s => (
            <div key={s.id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {s.status}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.days}</span>
              </div>
  
              <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '12px' }}>
                {s.name}
              </h3>
  
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                المحاضر: <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{s.teacher}</span>
              </div>
  
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '14px 0' }} />
  
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={15} color="var(--accent-gold)" />
                  <span>التوقيت: {s.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={15} color="#3b82f6" />
                  <span>المكان: {s.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ShariaSessions;
