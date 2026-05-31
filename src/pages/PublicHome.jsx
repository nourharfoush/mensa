import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Clock, Video, User, FileText, CheckCircle, Video as VideoIcon } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import azharImage from '../assets/azhar.jpeg';

function PublicHome() {
  return (
    <div style={{ backgroundColor: 'var(--pub-bg)', color: 'var(--pub-text)', minHeight: '100vh', fontFamily: `'Tajawal', 'Cairo', sans-serif`, position: 'relative', overflowX: 'hidden' }}>

    <PublicNavbar activePage="home" />

    {/* Hero Section */}
    <div style={{ display: 'flex', minHeight: '85vh', position: 'relative' }}>
      
      {/* Floating Decorative Circles */}
      <div className="animate-float-1" style={{
        position: 'absolute', top: '10%', left: '-60px',
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'var(--pub-circle-gold)',
        border: '1px solid var(--pub-circle-gold-border)',
        zIndex: 3
      }} />
      <div className="animate-float-2" style={{
        position: 'absolute', bottom: '15%', right: 'calc(50% - 40px)',
        width: '120px', height: '120px', borderRadius: '50%',
        background: 'var(--pub-circle-green)',
        border: '1px solid var(--pub-circle-green-border)',
        zIndex: 3
      }} />

      {/* Right Content Side (Rendered on Right due to RTL direction) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', textAlign: 'right', position: 'relative', zIndex: 2 }}>
        <h1 style={{ fontSize: '60px', fontWeight: 'bold', margin: '0 0 20px 0', lineHeight: '1.3', color: 'var(--pub-text)' }}>
          <span style={{ color: 'var(--pub-green)' }}>أهلاً بكم</span> في منصة<br />الجامع الأزهر
        </h1>
        <div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg, var(--accent-gold), transparent)', margin: '0 0 30px auto' }} />

        <p style={{ fontSize: '18px', color: 'var(--pub-text-soft)', marginBottom: '40px', lineHeight: '1.8', maxWidth: '420px', marginLeft: 'auto' }}>
          المنصة الرائدة لتحفيظ القرآن الكريم<br />ودراسة العلوم الشرعية و العربية
        </p>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
          <Link to="/login" className="btn" style={{
            background: 'var(--pub-green)', color: '#fff', padding: '12px 30px',
            fontSize: '15px', border: 'none', textDecoration: 'none',
            borderRadius: '8px', fontWeight: '600',
            transition: 'all 0.3s ease'
          }}>
            الذهاب إلي لوحة التحكم
          </Link>
        </div>
      </div>

      {/* Left Image Side (Rendered on Left due to RTL direction) */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${azharImage})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 'var(--pub-img-opacity)',
          clipPath: 'polygon(0 0, 100% 0, 82% 100%, 0% 100%)'
        }} />
        {/* Overlay gradient on image */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--pub-overlay)',
          clipPath: 'polygon(0 0, 100% 0, 82% 100%, 0% 100%)'
        }} />
      </div>

    </div>

    {/* Features Section */}
    <div style={{ padding: '80px 50px', textAlign: 'center', position: 'relative', zIndex: 2, background: 'var(--pub-bg-alt)' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '50px', fontWeight: 'bold', color: 'var(--pub-text)' }}>لماذا تختار منصة الجامع الأزهر؟</h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>

        {/* Card 1 */}
        <div style={{
          background: 'var(--pub-card-bg)', borderRadius: '15px', padding: '40px 30px',
          width: '300px', borderTop: '4px solid var(--accent-gold)',
          border: '1px solid var(--pub-card-border)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--pub-circle-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={30} color="var(--accent-gold)" />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', margin: '0 0 15px 0', color: 'var(--pub-text)' }}>حفظة متخصصون</h3>
          <p style={{ fontSize: '14px', color: 'var(--pub-text-muted)', lineHeight: '1.8', margin: 0 }}>
            تعلم على يد علماء الأزهر المعتمدين ذوي الخبرة الواسعة في حفظ القرآن الكريم والعلوم الشرعية.
          </p>
        </div>

        {/* Card 2 */}
        <div style={{
          background: 'var(--pub-card-bg)', borderRadius: '15px', padding: '40px 30px',
          width: '300px', borderTop: '4px solid var(--accent-gold)',
          border: '1px solid var(--pub-card-border)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--pub-circle-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={30} color="var(--accent-gold)" />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', margin: '0 0 15px 0', color: 'var(--pub-text)' }}>جدول زمني مرن</h3>
          <p style={{ fontSize: '14px', color: 'var(--pub-text-muted)', lineHeight: '1.8', margin: 0 }}>
            اختر من بين أوقات جلسات متعددة تناسب جدولك الزمني، مع خيارات الصباح، وبعد الظهر، والمساء.
          </p>
        </div>

        {/* Card 3 */}
        <div style={{
          background: 'var(--pub-card-bg)', borderRadius: '15px', padding: '40px 30px',
          width: '300px', borderTop: '4px solid var(--accent-gold)',
          border: '1px solid var(--pub-card-border)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--pub-circle-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={30} color="var(--accent-gold)" />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', margin: '0 0 15px 0', color: 'var(--pub-text)' }}>حلقات تعليمية</h3>
          <p style={{ fontSize: '14px', color: 'var(--pub-text-muted)', lineHeight: '1.8', margin: 0 }}>
            حلقات تعليمية مستمرة بمواعيد مرنة تناسب جميع الفئات العمرية
          </p>
        </div>

      </div>
    </div>

    {/* Steps Section */}
    <div style={{ padding: '80px 50px', textAlign: 'center', background: 'var(--pub-bg)' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '60px', fontWeight: 'bold', color: 'var(--pub-text)' }}>كيفية التسجيل معنا</h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', alignItems: 'center' }}>

        {/* Illustration Left */}
        <div style={{
          width: '300px', height: '350px',
          background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-dark) 100%)',
          borderRadius: '150px 150px 0 0', position: 'relative',
          display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(212,175,55,0.15)'
        }}>
          <BookIllustration />
        </div>

        {/* Steps Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative' }}>
          {/* Visual line */}
          <div style={{ position: 'absolute', right: '23px', top: '20px', bottom: '20px', width: '2px', background: 'var(--pub-card-border)', zIndex: 0 }} />

          {[
            { icon: <User size={20} />, title: 'سجل', desc: 'أنشئ حساباً باستخدام جواز سفرك (للطلاب) أو هويتك الوطنية (للحافظين)' },
            { icon: <FileText size={20} />, title: 'اختار الحلقات', desc: 'اختر من بين الفترات الزمنية المتاحة التي تناسب جدولك الزمني' },
            { icon: <CheckCircle size={20} />, title: 'احصل علي الموافقة', desc: 'استلم حافظة الحفظ المخصصة لك وتفاصيل الجلسة' },
            { icon: <VideoIcon size={20} />, title: 'حضور الحلقات', desc: 'انضم إلى جلساتك المجدولة عبر منصة الاجتماعات المتكاملة لدينا' }
          ].map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', gap: '20px', zIndex: 1 }}>
              <div style={{ textAlign: 'right', paddingTop: '5px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', color: 'var(--pub-text)' }}>{step.title}</div>
                <div style={{ fontSize: '14px', color: 'var(--pub-text-muted)' }}>{step.desc}</div>
              </div>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'var(--pub-card-bg)',
                border: '1px solid var(--pub-card-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-gold)', flexShrink: 0
              }}>
                {step.icon}
              </div>
            </div>
          ))}
        </div>

      </div>
      </div>
    </div>
  );
}

// Simple SVG Component for the Book
function BookIllustration() {
  return (
    <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Book stand */}
      <path d="M40 120 L160 120 L180 140 L20 140 Z" fill="#333" />
      <path d="M100 120 L100 140" stroke="#222" strokeWidth="8" />
      {/* Book Pages Right */}
      <path d="M100 110 Q 150 120 180 90 L 160 30 Q 130 50 100 40 Z" fill="#f8fafc" />
      <path d="M100 110 Q 150 120 180 90 L 160 30 Q 130 50 100 40 Z" fill="url(#grad1)" />
      {/* Book Pages Left */}
      <path d="M100 110 Q 50 120 20 90 L 40 30 Q 70 50 100 40 Z" fill="#f8fafc" />
      <path d="M100 110 Q 50 120 20 90 L 40 30 Q 70 50 100 40 Z" fill="url(#grad2)" />
      {/* Center line */}
      <path d="M100 40 L100 110" stroke="#1a2e35" strokeWidth="4" />
      <defs>
        <linearGradient id="grad1" x1="100" y1="40" x2="180" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
        <linearGradient id="grad2" x1="100" y1="40" x2="20" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default PublicHome;
