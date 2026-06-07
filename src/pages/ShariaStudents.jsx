import React, { useState } from 'react';
import { Users, Search, GraduationCap } from 'lucide-react';

function ShariaStudents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || 
    s.course.includes(searchTerm) || 
    s.nationalId.includes(searchTerm)
  );

  return (
    <div style={{ padding: '10px 0', direction: 'rtl' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={24} color="var(--accent-gold)" />
            الطلاب المسجلين بالعلوم الشرعية والعربية
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            متابعة الطلاب المسجلين بالدورات والمقررات الأكاديمية ونسب حضورهم
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
            placeholder="البحث باسم الطالب، الرقم القومي، أو اسم الدورة..."
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

      {/* Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '14px' }}>اسم الدارس</th>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '14px' }}>الرقم القومي</th>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '14px' }}>رقم الجوال</th>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '14px' }}>المقرر المسجل فيه</th>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>نسبة حضور المحاضرات</th>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '14px' }}>تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  لا يوجد طلاب مسجلين حالياً.
                </td>
              </tr>
            ) : (
              filteredStudents.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '14px 10px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{s.name}</td>
                  <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{s.nationalId}</td>
                  <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{s.phone}</td>
                  <td style={{ padding: '14px 10px', fontSize: '13px' }}>
                    <span style={{
                      background: 'rgba(214, 175, 55, 0.1)',
                      color: 'var(--accent-gold)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {s.course}
                    </span>
                  </td>
                  <td style={{ padding: '14px 10px', fontSize: '14px', fontWeight: 'bold', color: '#10b981', textAlign: 'center' }}>{s.progress}</td>
                  <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-muted)' }}>{s.regDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default ShariaStudents;
