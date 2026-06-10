import React, { useState } from 'react';
import { BookOpen, Plus, Search, Filter } from 'lucide-react';

function ShariaCourses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', category: 'الفقه وأصوله', level: 'المستوى الأول', code: '' });

  const handleAddCourse = (e) => {
    e.preventDefault();
    setCourses([...courses, { ...newCourse, id: Date.now(), students: 0, teacher: '', hours: 20 }]);
    setShowAddModal(false);
    setNewCourse({ name: '', category: 'الفقه وأصوله', level: 'المستوى الأول', code: '' });
  };

  const filteredCourses = courses.filter(c => 
    c.name.includes(searchTerm) || 
    c.code.includes(searchTerm)
  );

  return (
    <div style={{ padding: '10px 0', direction: 'rtl' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={24} color="var(--accent-gold)" />
            برامج ودورات العلوم الشرعية والعربية
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            عرض وإدارة المقررات التعليمية المعتمدة وتفاصيل الدراسة
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: 'bold' }}
        >
          <Plus size={18} />
          إضافة مقرر جديد
        </button>
      </div>

      {/* Control Panel (Search & Filter) */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            placeholder="البحث باسم المقرر أو الرمز..."
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
        
        <button style={{
          backgroundColor: 'transparent',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          color: 'var(--text-primary)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          <Filter size={16} />
          <span>تصفية المخرجات</span>
        </button>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          لا توجد مقررات دراسية حالياً. اضغط على "إضافة مقرر جديد" لإنشاء مقرر.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredCourses.map(c => (
            <div key={c.id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{c.code}</span>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {c.category}
                </span>
              </div>
              
              <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '10px', lineHeight: '1.5' }}>
                {c.name}
              </h3>
              
  
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '14px 0' }} />
  
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div>ساعات المقرر: <strong style={{ color: 'var(--text-primary)' }}>{c.hours} ساعة</strong></div>
                <div>المستوى: <strong style={{ color: 'var(--text-primary)' }}>{c.level}</strong></div>
              </div>
  
              <div style={{
                marginTop: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>الدارسين المسجلين</span>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '14px' }}>{c.students} دارس</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Course Modal Mockup */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          direction: 'rtl'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            width: '95%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 'bold' }}>إضافة مقرر جديد</h2>
            
            <form onSubmit={handleAddCourse}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>رمز المقرر</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: SH101"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>اسم المقرر</label>
                  <input
                    type="text"
                    required
                    placeholder="أدخل اسم المقرر بالكامل"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>القسم التخصصي</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    <option value="الفقه وأصوله">الفقه وأصوله</option>
                    <option value="العقيدة الإسلامية">العقيدة الإسلامية</option>
                    <option value="العلوم العربية">العلوم العربية</option>
                    <option value="علوم القرآن">علوم القرآن</option>
                    <option value="الحديث الشريف">الحديث الشريف</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>المستوى الدراسي</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    <option value="المستوى التمهيدي">المستوى التمهيدي</option>
                    <option value="المستوى الأول">المستوى الأول</option>
                    <option value="المستوى الثاني">المستوى الثاني</option>
                    <option value="المستوى الثالث">المستوى الثالث</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold' }}>
                  حفظ المقرر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ShariaCourses;
