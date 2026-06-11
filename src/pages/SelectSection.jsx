import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Monitor, BookOpen, LogOut, Sun, Moon } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import './Auth.css'; // We can reuse background styles

function SelectSection() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const { theme, toggleTheme } = useAppData();

  if (!currentUser) {
    window.location.href = '/login';
    return null;
  }

  const handleSelect = (section, path) => {
    sessionStorage.setItem('activeSection', section);
    navigate(path);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('activeSection');
    navigate('/login');
  };

  // Determine which sections to show based on user role
  const role = currentUser.role || '';
  const isAdmin = role === 'admin';
  
  const isRowaqAllowed = isAdmin || [
    'rowaq_admin', 'rowaq_manager', 'rowaq_tech', 'rowaq_member',
    'branch_admin_coordinator', 'branch_scientific_coordinator', 'mohfez'
  ].includes(role);

  const isPlatformAllowed = isAdmin || [
    'platform_admin', 'platform_supervisor', 'platform_coordinator',
    'platform_mohfez', 'student'
  ].includes(role);

  // Sharia is open to admin, rowaq_admin, and the four designated specialties
  const shariaSpecialties = [
    'مدير الإدارة',
    'العضو التقني',
    'العضو الإداري علوم شرعية وعربية',
    'العضو العلمي علوم شرعية وعربية',
    'العضو الإداري، علوم شرعية وعربية',
    'العضو العلمي، علوم شرعية وعربية',
    'العضو الإداري للعلوم الشرعية والعربية',
    'العضو العلمي للعلوم الشرعية والعربية'
  ];

  const isShariaAllowed = isAdmin || 
    (role === 'rowaq_admin') || 
    (role === 'sharia_student') ||
    (role === 'sharia_teacher') ||
    shariaSpecialties.includes(currentUser.specialty);

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', direction: 'rtl', transition: 'background-color 0.3s ease' }}>
      <div className="auth-background" style={{
        filter: theme === 'light' ? 'brightness(0.9) blur(2px)' : 'brightness(0.35) blur(2px)',
        transition: 'filter 0.3s ease'
      }}></div>

      {/* Floating Theme Toggle */}
      <div style={{ position: 'absolute', top: '25px', left: '25px', zIndex: 100 }}>
        <button 
          onClick={toggleTheme}
          style={{
            background: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
            border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease'
          }}
          title="تغيير المظهر"
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>
      
      <div style={{ zIndex: 10, width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '80px', marginBottom: '10px', filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.3))' }} />
          <h1 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>مرحباً بك في منصة الجامع الأزهر</h1>
          <p style={{ color: 'var(--accent-gold)', fontSize: '16px', fontWeight: '600' }}>مرحباً، {currentUser.name}</p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 'bold' }}>يرجى اختيار القسم الرئيسي المطلوب للدخول إليه:</p>
        </div>

        {/* Section Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          width: '100%',
          padding: '10px 0',
          justifyContent: 'center',
          marginBottom: '50px'
        }}>
          
          {/* Card 1: Rowaq Affairs */}
          {isRowaqAllowed && (
            <div 
              onClick={() => handleSelect('rowaq', '/dashboard')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '40px 30px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="section-selection-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.borderColor = 'var(--accent-gold)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(214, 175, 55, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(214, 175, 55, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                marginBottom: '25px',
                boxShadow: 'inset 0 0 15px rgba(214, 175, 55, 0.1)'
              }}>
                <Home size={38} />
              </div>
              <h2 style={{ fontSize: '22px', color: 'var(--text-primary)', marginBottom: '15px', fontWeight: 'bold' }}>لوحة تحكم شؤون الأروقة</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', margin: 0 }}>
                متابعة وإدارة الأروقة بمختلف فروع المحافظات، وتنسيق المحفظين، والمشرفين والدارسين، وإصدار التقارير الدورية والزيارات الميدانية.
              </p>
              <div style={{
                marginTop: '30px',
                padding: '8px 24px',
                borderRadius: '8px',
                background: 'rgba(214, 175, 55, 0.15)',
                color: 'var(--accent-gold)',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}>
                دخول القسم
              </div>
            </div>
          )}

          {/* Card 2: Platform */}
          {isPlatformAllowed && (
            <div 
              onClick={() => handleSelect('platform', '/platform-dashboard')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '40px 30px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="section-selection-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
                marginBottom: '25px',
                boxShadow: 'inset 0 0 15px rgba(59, 130, 246, 0.1)'
              }}>
                <Monitor size={38} />
              </div>
              <h2 style={{ fontSize: '22px', color: 'var(--text-primary)', marginBottom: '15px', fontWeight: 'bold' }}>لوحة تحكم المنصة الإلكترونية</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', margin: 0 }}>
                إدارة حلقات التحفيظ الافتراضية والدروس التفاعلية للتعليم الإلكتروني عن بعد، ومتابعة الطلاب والمنسقين والمشرفين بالمنصة.
              </p>
              <div style={{
                marginTop: '30px',
                padding: '8px 24px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}>
                دخول القسم
              </div>
            </div>
          )}

          {/* Card 3: Sharia & Arabic Sciences */}
          {isShariaAllowed && (
            <div 
              onClick={() => handleSelect('sharia_arabic', '/sharia-dashboard')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '40px 30px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="section-selection-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                marginBottom: '25px',
                boxShadow: 'inset 0 0 15px rgba(16, 185, 129, 0.1)'
              }}>
                <BookOpen size={38} />
              </div>
              <h2 style={{ fontSize: '22px', color: 'var(--text-primary)', marginBottom: '15px', fontWeight: 'bold' }}>لوحة العلوم الشرعية والعربية</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', margin: 0 }}>
                إدارة البرامج التعليمية التخصصية في العلوم الشرعية (كالفقه والعقيدة والحديث) والعلوم العربية (كالنحو والبلاغة) ومتابعة دوراتها.
              </p>
              <div style={{
                marginTop: '30px',
                padding: '8px 24px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}>
                دخول القسم
              </div>
            </div>
          )}

        </div>

        {/* Patronage and Leadership Banner Section */}
        <div style={{
          width: '100%',
          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 32, 43, 0.4)',
          border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '30px 20px',
          marginBottom: '30px',
          boxShadow: theme === 'light' ? '0 8px 32px rgba(0,0,0,0.06)' : '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          transition: 'all 0.3s ease'
        }}>
          {/* Main Patron Card */}
          <div style={{
            border: '2px solid var(--accent-gold)',
            borderRadius: '12px',
            padding: '16px 40px',
            textAlign: 'center',
            minWidth: '280px',
            background: 'rgba(214, 175, 55, 0.03)',
            boxShadow: '0 0 20px rgba(214, 175, 55, 0.05)'
          }}>
            <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              برعاية كريمة من فضيلة الإمام الأكبر
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: 'bold', fontFamily: "'Cairo', sans-serif" }}>
              أ.د / أحمد الطيب
            </div>
          </div>

          {/* Leadership Roles Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            width: '100%',
            maxWidth: '900px'
          }}>
            {/* Role 1 */}
            <div style={{
              background: theme === 'light' ? 'var(--bg-card)' : 'rgba(28, 32, 43, 0.8)',
              border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ color: 'var(--accent-gold)', fontSize: '13px', marginBottom: '6px' }}>
                مدير شؤون الأروقة
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 'bold' }}>
                الدكتور / مصطفى شيشي
              </div>
            </div>

            {/* Role 2 */}
            <div style={{
              background: theme === 'light' ? 'var(--bg-card)' : 'rgba(28, 32, 43, 0.8)',
              border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ color: 'var(--accent-gold)', fontSize: '13px', marginBottom: '6px' }}>
                مدير عام الجامع الأزهر
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 'bold' }}>
                الدكتور / هاني عودة
              </div>
            </div>

            {/* Role 3 */}
            <div style={{
              background: theme === 'light' ? 'var(--bg-card)' : 'rgba(28, 32, 43, 0.8)',
              border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ color: 'var(--accent-gold)', fontSize: '13px', marginBottom: '6px' }}>
                المشرف العام على الأروقة
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 'bold' }}>
                أ.د / عبدالمنعم فؤاد
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SelectSection;
