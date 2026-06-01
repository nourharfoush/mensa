import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, Settings, Check, Globe } from 'lucide-react';
import './Header.css';
import { useAppData } from '../context/AppDataContext';

function Header({ toggleSidebar }) {
  const { theme, toggleTheme } = useAppData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState('ar');
  const [notifications, setNotifications] = useState([
    { id: 1, text: "تم تسجيل طلب تقديم جديد في رواق القرآن", time: "منذ 5 دقائق", unread: true },
    { id: 2, text: "قام المحفظ أحمد علي بتسجيل حضور حلقة اليوم", time: "منذ ساعة", unread: true },
    { id: 3, text: "تقرير المتابعة الشهرية لفرع الجيزة جاهز للمراجعة", time: "منذ ساعتين", unread: false },
    { id: 4, text: "تحديث جديد في صلاحيات مدراء الأروقة", time: "منذ يوم", unread: false },
  ]);

  const notifRef = useRef(null);
  const langRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="icon-btn text-muted" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <Link to="/" className="primary-btn" style={{ textDecoration: 'none' }}>
          الصفحة الرئيسية
        </Link>
      </div>
      
      <div className="header-right">
        {/* Theme Toggle */}
        <button className="icon-btn theme-toggle" onClick={toggleTheme} title="تغيير المظهر">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Language Selector */}
        <div className="lang-selector-container" ref={langRef} style={{ position: 'relative' }}>
          <button 
            className="icon-btn lang-btn" 
            onClick={() => setShowLangMenu(!showLangMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 'bold' }}
            title="تغيير اللغة"
          >
            <Globe size={18} />
            <span>{currentLang === 'ar' ? 'AR' : 'EN'}</span>
          </button>
          
          {showLangMenu && (
            <div className="dropdown-menu lang-dropdown" style={{
              position: 'absolute', top: '100%', left: '0', 
              backgroundColor: 'var(--bg-lighter)', border: '1px solid var(--border-subtle)',
              borderRadius: '6px', padding: '6px 0', minWidth: '120px', zIndex: 100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginTop: '8px', textAlign: 'right'
            }}>
              <div 
                className="dropdown-item" 
                onClick={() => { setCurrentLang('ar'); setShowLangMenu(false); }}
                style={{
                  padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  color: currentLang === 'ar' ? 'var(--accent-gold)' : 'var(--text-primary)',
                  backgroundColor: currentLang === 'ar' ? 'rgba(214, 175, 55, 0.1)' : 'transparent'
                }}
              >
                <span>العربية</span>
                {currentLang === 'ar' && <Check size={14} />}
              </div>
              <div 
                className="dropdown-item" 
                onClick={() => { alert('اللغة الإنجليزية ستكون متاحة قريباً في تحديث قادم!'); setShowLangMenu(false); }}
                style={{
                  padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  color: currentLang === 'en' ? 'var(--accent-gold)' : 'var(--text-primary)'
                }}
              >
                <span>English</span>
                {currentLang === 'en' && <Check size={14} />}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="notifications-container" ref={notifRef} style={{ position: 'relative' }}>
          <button 
            className="icon-btn notification-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="الإشعارات"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="dropdown-menu notifications-dropdown" style={{
              position: 'absolute', top: '100%', left: '0', 
              backgroundColor: 'var(--bg-lighter)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', width: '320px', zIndex: 100,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)', marginTop: '8px',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-primary)' }}>الإشعارات</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '12px' }}
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>
              
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    لا توجد إشعارات جديدة
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      style={{
                        padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: n.unread ? 'rgba(214, 175, 55, 0.05)' : 'transparent',
                        transition: 'background 0.2s', textAlign: 'right'
                      }}
                    >
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: '1.4' }}>
                        {n.text}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {n.time}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Gear */}
        <Link to="/settings" className="icon-btn settings-btn" title="إعدادات النظام">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}

export default Header;
