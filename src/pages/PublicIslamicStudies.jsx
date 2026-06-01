import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import './PublicPages.css';

function PublicIslamicStudies() {
  return (
    <div style={{ backgroundColor: 'var(--pub-bg)', color: 'var(--pub-text)', minHeight: '100vh', fontFamily: `'Tajawal', 'Cairo', sans-serif`, position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background Pattern */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Al-Azhar_Mosque_%287%29.jpg/1280px-Al-Azhar_Mosque_%287%29.jpg")', 
        backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.05, zIndex: 0 
      }} />

      <PublicNavbar activePage="sharia" />

      {/* Main Content Area */}
      <div className="pub-main-area">
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', marginBottom: '30px', fontSize: '14px', flexDirection: 'row-reverse' }}>
          <Link to="/" style={{ color: 'var(--pub-text-muted)', textDecoration: 'none' }}>الرئيسية</Link>
          <span style={{ color: 'var(--pub-text-muted)' }}>&lt;</span>
          <span style={{ color: 'var(--pub-text)' }}>العلوم الشرعية</span>
        </div>

        {/* Headers */}
        <h1 style={{ color: 'var(--pub-green)', fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>العلم الشرعي.. نور يهدي الطريق</h1>
        
        <p style={{ fontSize: '16px', color: 'var(--pub-text-soft)', lineHeight: '1.8', margin: '0 auto 30px auto', maxWidth: '800px' }}>
          تسعى العلوم الشرعية إلي بناء الفرد والمجتمع من خلال تعميق الفهم الصحيح للدين الإسلامي وتأصيل القيم الإسلامية في نفوس الطلاب، مما يساهم في إعداد جيل واعٍ بدينه ومتمسك بهويته.
        </p>

        <Link to="#" className="btn" style={{ background: 'var(--pub-green)', color: '#fff', padding: '10px 35px', fontSize: '15px', border: 'none', textDecoration: 'none', display: 'inline-block', marginBottom: '50px', borderRadius: '8px' }}>
          سجل في دوراتنا
        </Link>

        {/* Section 2 */}
        <h2 style={{ color: 'var(--pub-green)', fontSize: '26px', fontWeight: 'bold', marginBottom: '40px' }}>برامجنا ودوراتنا</h2>

        <div className="pub-cards-row">
          
          {/* Card 1 */}
          <div style={{ background: 'var(--pub-card-bg)', border: '1px solid var(--pub-card-border)', borderRadius: '12px', padding: '30px', width: '320px', textAlign: 'center' }}>
             <h3 style={{ color: 'var(--pub-text)', fontSize: '20px', marginBottom: '15px' }}>العقيدة الإسلامية</h3>
             <p style={{ color: 'var(--pub-text-muted)', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
               يركز هذا البرنامج على دراسة أصول الإيمان والعقيدة الصحيحة، مع التركيز على الفرق الإسلامية وآراء علماء الكلام في مسائل العقيدة.
             </p>
          </div>

          {/* Card 2 */}
          <div style={{ background: 'var(--pub-card-bg)', border: '1px solid var(--pub-card-border)', borderRadius: '12px', padding: '30px', width: '320px', textAlign: 'center' }}>
             <h3 style={{ color: 'var(--pub-text)', fontSize: '20px', marginBottom: '15px' }}>الفقه وأصوله</h3>
             <p style={{ color: 'var(--pub-text-muted)', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
               يتناول هذا البرنامج دراسة الأحكام الشرعية العملية وأدلتها التفصيلية، مع التركيز على المذاهب الفقهية المختلفة وأصول استنباط الأحكام.
             </p>
          </div>

          {/* Card 3 */}
          <div style={{ background: 'var(--pub-card-bg)', border: '1px solid var(--pub-card-border)', borderRadius: '12px', padding: '30px', width: '320px', textAlign: 'center' }}>
             <h3 style={{ color: 'var(--pub-text)', fontSize: '20px', marginBottom: '15px' }}>علوم الحديث</h3>
             <p style={{ color: 'var(--pub-text-muted)', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
               برنامج متخصص في دراسة الأحاديث النبوية الشريفة علماً ورواية، يشمل دراسة أصول الحديث، مصطلح الحديث، والجرح والتعديل.
             </p>
          </div>

        </div>

        {/* Section 3 */}
        <div style={{ background: 'var(--pub-card-bg)', border: '1px solid var(--pub-card-border)', borderRadius: '12px', padding: '35px', textAlign: 'right', marginBottom: '30px', direction: 'rtl' }}>
           <h3 style={{ color: 'var(--pub-green)', fontSize: '20px', marginBottom: '15px' }}>عن قسم العلوم الشرعية</h3>
           <p style={{ color: 'var(--pub-text-soft)', fontSize: '15px', lineHeight: '1.8', margin: 0 }}>
             يهدف قسم العلوم الشرعية إلي تخريج علماء مؤهلين في مختلف العلوم الشرعية، قادرين على فهم النصوص الدينية وتفسيرها بشكل صحيح، والإسهام في نشر الوعي الديني المعتدل. يسعى القسم لتحقيق التميز الأكاديمي في مجال العلوم الشرعية من خلال تقديم برامج تعليمية متنوعة تجمع بين الأصالة والمعاصرة، وتلبي احتياجات المجتمع المحلي والعالمي.
           </p>
        </div>

        {/* Footer phrase */}
        <div style={{ background: 'var(--pub-card-bg)', border: '1px solid var(--pub-card-border)', borderRadius: '12px', padding: '35px', textAlign: 'center' }}>
           <h3 style={{ color: 'var(--pub-green)', fontSize: '20px', margin: '0 0 15px 0' }}>فضل العلم</h3>
           <p style={{ color: 'var(--pub-text-soft)', fontSize: '15px', margin: 0 }}>
             قال تعالي: ( يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ ) [المجادلة: 11]
           </p>
        </div>

      </div>
    </div>
  );
}

export default PublicIslamicStudies;
