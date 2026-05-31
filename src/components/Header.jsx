import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon } from 'lucide-react';
import './Header.css';
import { useAppData } from '../context/AppDataContext';

function Header({ toggleSidebar }) {
  const { theme, toggleTheme } = useAppData();
  return (
    <header className="app-header">
      <div className="header-left">
        <button className="icon-btn" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <Link to="/" className="primary-btn" style={{ textDecoration: 'none' }}>
          الصفحة الرئيسية
        </Link>
      </div>
      
      <div className="header-right">
         <button className="icon-btn theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
         </button>
         <button className="icon-btn notification-btn">
            <Bell size={20} />
            <span className="badge">35</span>
         </button>
      </div>
    </header>
  );
}

export default Header;
