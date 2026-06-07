import React, { useState } from 'react';
import { Users, Plus, Search, Mail, Phone } from 'lucide-react';

function ShariaTeachers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState([]);

  const filteredTeachers = teachers.filter(t => 
    t.name.includes(searchTerm) || 
    t.department.includes(searchTerm)
  );

  return (
    <div style={{ padding: '10px 0', direction: 'rtl' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} color="var(--accent-gold)" />
            أعضاء هيئة التدريس (المحاضرين)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            إدارة المعلمين، المشايخ وأساتذة قطاع العلوم الشرعية والعربية بالجامع الأزهر
          </p>
        </div>
      </div>

      {/* Filter panel */}
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
            placeholder="البحث باسم المعلم أو القسم التخصصي..."
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

      {/* Teachers List */}
      {filteredTeachers.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          لا يوجد أعضاء هيئة تدريس مسجلين حالياً.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {filteredTeachers.map(t => (
            <div key={t.id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(214,175,55,0.1), rgba(16,185,129,0.1))',
                  border: '1px solid rgba(214,175,55,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold)',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  {t.name[0] === 'د' ? 'أ.د' : 'ش'}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 'bold', margin: 0 }}>{t.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.title}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} color="var(--accent-gold)" />
                  <span>{t.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="#10b981" />
                  <span>{t.phone}</span>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '14px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  {t.department}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  المقررات المسندة: <strong style={{ color: 'var(--text-primary)' }}>{t.courses}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ShariaTeachers;
