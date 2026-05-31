import React from 'react';
import { Link } from 'react-router-dom';
import { User, Sun, Moon, Bell, Settings } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

function PublicNavbar({ activePage }) {
  const { theme, toggleTheme } = useAppData();

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 50px',
      background: 'var(--pub-nav-bg)',
      borderBottom: '1px solid var(--pub-nav-border)',
      position: 'relative', top: 0, left: 0, right: 0, zIndex: 10,
      width: '100%'
    }}>
        
      {/* Right Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/logo.png" alt="Logo" style={{ height: '55px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
        <div style={{ textAlign: 'right', lineHeight: '1.4' }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>المنصة العالمية الرسمية</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>لأروقة الجامع الأزهر</div>
        </div>
      </div>

      {/* Center links */}
      <div style={{ display: 'flex', gap: '35px', alignItems: 'center' }}>
        <Link to="/" style={{
          color: activePage === 'home' ? '#D4AF37' : '#ffffff',
          textDecoration: 'none', fontSize: '15px',
          fontWeight: activePage === 'home' ? 'bold' : '500',
          padding: '8px 4px',
          borderBottom: activePage === 'home' ? '2px solid #D4AF37' : '2px solid transparent',
          transition: 'all 0.3s ease'
        }}>الرئيسية</Link>
        <Link to="/quran" style={{
          color: activePage === 'quran' ? '#D4AF37' : '#ffffff',
          textDecoration: 'none', fontSize: '15px',
          fontWeight: activePage === 'quran' ? 'bold' : '500',
          padding: '8px 4px',
          borderBottom: activePage === 'quran' ? '2px solid #D4AF37' : '2px solid transparent',
          transition: 'all 0.3s ease'
        }}>القرآن الكريم</Link>
        <Link to="/IslamicStudies" style={{
          color: activePage === 'sharia' ? '#D4AF37' : '#ffffff',
          textDecoration: 'none', fontSize: '15px',
          fontWeight: activePage === 'sharia' ? 'bold' : '500',
          padding: '8px 4px',
          borderBottom: activePage === 'sharia' ? '2px solid #D4AF37' : '2px solid transparent',
          transition: 'all 0.3s ease'
        }}>العلوم الشرعية</Link>
        <Link to="#" style={{
          color: activePage === 'about' ? '#D4AF37' : '#ffffff',
          textDecoration: 'none', fontSize: '15px',
          fontWeight: activePage === 'about' ? 'bold' : '500',
          padding: '8px 4px',
          borderBottom: activePage === 'about' ? '2px solid #D4AF37' : '2px solid transparent',
          transition: 'all 0.3s ease'
        }}>من نحن</Link>
      </div>

      {/* Left items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        <Link to="/login" style={{
          background: '#D4AF37', color: '#1a202c', padding: '8px 22px',
          borderRadius: '6px', textDecoration: 'none', fontSize: '14px',
          fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'all 0.3s ease'
        }}>
          <User size={16} />
          تسجيل دخول
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '8px' }}>
            <span style={{ color: '#ffffff', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>AR ˅</span>
            <button style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', position: 'relative', padding: '4px' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '1px 4px', fontSize: '9px' }}>15</span>
            </button>
            <button style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}>
              <Settings size={18} />
            </button>
            <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;
