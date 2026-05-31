import React from 'react';
import './HeroBanner.css';
import { Crown } from 'lucide-react';

function HeroBanner() {
  return (
    <div className="hero-banner">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="welcome-tag">
          <Crown className="crown-icon text-gold" size={24} />
          <div>
            <h4>مرحباً بك في نظام إدارة الأروقة الأزهرية</h4>
            <span className="university-name">الجامع الأزهر الشريف - وفق الله تعالى</span>
          </div>
        </div>
        
        <div className="main-title">
          <h1 className="font-calligraphy text-gold">الأروقةُ الأَزهريَّةُ</h1>
          <h2>برنامج إدارة شؤون الأروقة</h2>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
