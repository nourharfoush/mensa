import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer-section">
      {/* Top Row - Imam */}
      <div className="footer-imam-row">
        <div className="imam-card">
          <p className="care-text">برعاية كريمة من فضيلة الإمام الأكبر</p>
          <h2 className="imam-name">أ.د / أحمد الطيب</h2>
        </div>
      </div>

      {/* Bottom Row - Three Positions */}
      <div className="footer-grid">
        {/* Right Column - مدير شؤون الأروقة */}
        <div className="footer-card">
          <span className="footer-card-title">مدير شؤون الأروقة</span>
          <span className="footer-card-name">الدكتور / مصطفى شيشي</span>
        </div>

        {/* Center Column - مدير عام الجامع الأزهر */}
        <div className="footer-card">
          <span className="footer-card-title">مدير عام الجامع الأزهر</span>
          <span className="footer-card-name">الدكتور / هاني عودة</span>
        </div>

        {/* Left Column - المشرف العام */}
        <div className="footer-card">
          <span className="footer-card-title">المشرف العام على الأروقة</span>
          <span className="footer-card-name">أ.د / عبدالمنعم فؤاد</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
