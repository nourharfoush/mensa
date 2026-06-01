import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Sun, Moon, Menu, X } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import './PublicNavbar.css';

function PublicNavbar({ activePage }) {
  const { theme, toggleTheme } = useAppData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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

      {/* Center links (Desktop) */}
      <div className="pub-nav-links">
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

      {/* Left items (Desktop Actions) */}
      <div className="pub-nav-actions">
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
            <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
      </div>

      {/* Hamburger Toggle (Mobile/Tablet) */}
      <button className="pub-menu-toggle" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Drawer */}
      <div className={`pub-mobile-drawer ${isMobileMenuOpen ? 'open' : 'closed'}`}>
        <Link to="/" className={`pub-mobile-link ${activePage === 'home' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>الرئيسية</Link>
        <Link to="/quran" className={`pub-mobile-link ${activePage === 'quran' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>القرآن الكريم</Link>
        <Link to="/IslamicStudies" className={`pub-mobile-link ${activePage === 'sharia' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>العلوم الشرعية</Link>
        <Link to="#" className={`pub-mobile-link ${activePage === 'about' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>من نحن</Link>
        
        <div className="pub-mobile-action-row">
          <Link to="/login" style={{
            background: '#D4AF37', color: '#1a202c', padding: '8px 22px',
            borderRadius: '6px', textDecoration: 'none', fontSize: '14px',
            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.3s ease'
          }} onClick={() => setIsMobileMenuOpen(false)}>
            <User size={16} />
            تسجيل دخول
          </Link>
          
          <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;
