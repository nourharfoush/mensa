import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import './PublicPages.css';

function PublicQuran() {
  return (
    <div style={{ backgroundColor: 'var(--pub-bg)', color: 'var(--pub-text)', minHeight: '100vh', fontFamily: `'Tajawal', 'Cairo', sans-serif`, position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background Pattern */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Al-Azhar_Mosque_%287%29.jpg/1280px-Al-Azhar_Mosque_%287%29.jpg")', 
        backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.05, zIndex: 0 
      }} />

      <PublicNavbar activePage="quran" />

      {/* Main Content Area */}
      <div className="pub-main-area">
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', marginBottom: '40px', fontSize: '14px', flexDirection: 'row-reverse' }}>
          <Link to="/" style={{ color: 'var(--pub-text-muted)', textDecoration: 'none' }}>الرئيسية</Link>
          <span style={{ color: 'var(--pub-text-muted)' }}>&lt;</span>
          <span style={{ color: 'var(--pub-text)' }}>القرآن الكريم</span>
        </div>

        {/* Headers */}
        <h1 style={{ color: 'var(--pub-green)', fontSize: '36px', fontWeight: 'bold', marginBottom: '15px' }}>رواق القرآن الكريم بالأزهر الشريف</h1>
        <h2 style={{ color: 'var(--accent-gold)', fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>نور القرآن بين يديك</h2>
        
        <p style={{ fontSize: '16px', color: 'var(--pub-text-soft)', lineHeight: '1.8', margin: '0 auto 60px auto', maxWidth: '800px' }}>
          يقدم الأزهر الشريف برامج متميزة لتحفيظ القرآن الكريم علي أيدي نخبة من المشايخ والعلماء، حيث يحمل الأزهر رسالة تعليم وتحفيظ كتاب الله منذ أكثر من ألف عام، مع الحفاظ علي التجويد والقراءات الصحيحة.
        </p>

        {/* Section 2 */}
        <h2 style={{ color: 'var(--pub-green)', fontSize: '28px', fontWeight: 'bold', marginBottom: '40px' }}>رسالة الأزهر في رواق القرآن الكريم</h2>

        <div className="pub-cards-row">
          
          {/* Card 1 */}
          <div style={{ background: 'var(--pub-card-bg)', border: '1px solid var(--pub-card-border)', borderRadius: '12px', padding: '30px', width: '300px', textAlign: 'center' }}>
             <h3 style={{ color: 'var(--accent-gold)', fontSize: '20px', marginBottom: '15px' }}>تاريخ عريق</h3>
             <p style={{ color: 'var(--pub-text-muted)', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
               يمتد تاريخ الأزهر الشريف في تحفيظ القرآن الكريم لأكثر من ألف عام، حيث كان ولا يزال منارة للعلم والمعرفة الإسلامية في العالم أجمع.
             </p>
          </div>

          {/* Card 2 */}
          <div style={{ background: 'var(--pub-card-bg)', border: '1px solid var(--pub-card-border)', borderRadius: '12px', padding: '30px', width: '300px', textAlign: 'center' }}>
             <h3 style={{ color: 'var(--accent-gold)', fontSize: '20px', marginBottom: '15px' }}>منهجية متكاملة</h3>
             <p style={{ color: 'var(--pub-text-muted)', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
               يتبع الأزهر منهجية متكاملة في تحفيظ القرآن الكريم تجمع بين الحفظ والتجويد والتفسير، مع التركيز على فهم المعاني وتطبيق الأحكام.
             </p>
          </div>

          {/* Card 3 */}
          <div style={{ background: 'var(--pub-card-bg)', border: '1px solid var(--pub-card-border)', borderRadius: '12px', padding: '30px', width: '300px', textAlign: 'center' }}>
             <h3 style={{ color: 'var(--accent-gold)', fontSize: '20px', marginBottom: '15px' }}>مشايخ متخصصون</h3>
             <p style={{ color: 'var(--pub-text-muted)', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
               يشرف على حلقات التحفيظ نخبة من المشايخ المتخصصين الحاصلين على إجازات في القراءات المختلفة والمتقنين لأحكام التجويد.
             </p>
          </div>

        </div>

        {/* Footer phrase */}
        <div style={{ background: 'var(--pub-card-bg)', border: '1px solid var(--pub-card-border)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
           <h3 style={{ color: 'var(--pub-green)', fontSize: '18px', margin: 0 }}>نسأل الله لكم التوفيق والثبات علي طاعته</h3>
        </div>

      </div>
    </div>
  );
}

export default PublicQuran;
