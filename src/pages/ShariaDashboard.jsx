import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, Calendar, Award } from 'lucide-react';
import StatsCards from '../components/StatsCards';
import Footer from '../components/Footer';

function ShariaDashboard() {
  const dynamicStats = [
    {
      id: 1,
      title: 'البرامج والدورات',
      value: 8,
      iconColor: '#10b981',
      iconType: 'book'
    },
    {
      id: 2,
      title: 'أعضاء هيئة التدريس',
      value: 14,
      iconColor: '#a855f7',
      iconType: 'graduation-cap'
    },
    {
      id: 3,
      title: 'الطلاب والدارسين',
      value: 320,
      iconColor: '#f97316',
      iconType: 'users'
    },
    {
      id: 4,
      title: 'الحلقات الدراسية',
      value: 18,
      iconColor: '#3b82f6',
      iconType: 'book-open'
    }
  ];

  const courses = [
    { id: 1, name: 'شرح متن أبي شجاع في الفقه الشافعي', teacher: 'د. أحمد محمود الطيب', category: 'الفقه وأصوله', level: 'المستوى الأول', students: 45 },
    { id: 2, name: 'شرح متن العقيدة الطحاوية', teacher: 'الشيخ حسن عبد اللطيف', category: 'العقيدة الإسلامية', level: 'المستوى الأول', students: 60 },
    { id: 3, name: 'المقدمة الآجرومية في علم النحو', teacher: 'د. خالد عبد الرحمن', category: 'العلوم العربية', level: 'المستوى التمهيدي', students: 85 },
    { id: 4, name: 'مناهل العرفان في علوم القرآن', teacher: 'الشيخ محمد يوسف', category: 'علوم القرآن', level: 'المستوى الثاني', students: 50 },
    { id: 5, name: 'شرح الأربعين النووية في الحديث', teacher: 'د. مصطفى الشافعي', category: 'الحديث الشريف', level: 'المستوى الأول', students: 80 }
  ];

  return (
    <div className="dashboard-page" style={{ direction: 'rtl' }}>
      
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #11141D 0%, #1c202b 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '40px 30px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div>
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'inline-block',
            marginBottom: '12px'
          }}>
            بوابة التعليم الأزهري المعتمد
          </span>
          <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 'bold' }}>
            لوحة تحكم العلوم الشرعية والعربية
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', maxWidth: '600px', margin: 0 }}>
            مرحباً بك في لوحة الإشراف المتخصصة لبرامج ودورات قطاع العلوم الشرعية والعربية بالجامع الأزهر الشريف. تتيح لك هذه المنصة إدارة المقررات وتوزيع المعلمين وجداول الحلقات المباشرة.
          </p>
        </div>
        
        <div style={{
          background: 'rgba(214, 175, 55, 0.05)',
          border: '1px solid rgba(214, 175, 55, 0.2)',
          borderRadius: '12px',
          padding: '16px 24px',
          textAlign: 'center'
        }}>
          <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>حالة الفصل الدراسي</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>فصل الصيف 2026</div>
          <div style={{ color: '#10b981', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            نشط ومستمر
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <StatsCards stats={dynamicStats} />

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '30px',
        marginTop: '30px',
        marginBottom: '40px'
      }}>
        
        {/* Active Courses Table Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={20} color="var(--accent-gold)" />
              الدورات والمقررات النشطة حالياً
            </h2>
            <Link to="/sharia-courses" style={{ color: 'var(--accent-gold)', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>
              عرض الكل
            </Link>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '14px' }}>الدورة</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '14px' }}>المحاضر</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '14px' }}>القسم</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>الطلاب</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '14px 8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{c.name}</td>
                    <td style={{ padding: '14px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{c.teacher}</td>
                    <td style={{ padding: '14px 8px', fontSize: '13px' }}>
                      <span style={{
                        background: 'rgba(214, 175, 55, 0.1)',
                        color: 'var(--accent-gold)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px'
                      }}>
                        {c.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center' }}>{c.students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule / Upcoming Lectures Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} color="#10b981" />
            جدول المحاضرات القادمة اليوم
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 1, time: '04:00 م - 05:30 م', course: 'المقدمة الآجرومية في علم النحو', hall: 'قاعة الإمام البخاري', status: 'مباشر' },
              { id: 2, time: '06:00 م - 07:30 م', course: 'شرح متن أبي شجاع في الفقه', hall: 'قاعة الإمام الشافعي', status: 'مباشر' },
              { id: 3, time: '08:00 م - 09:30 م', course: 'شرح متن العقيدة الطحاوية', hall: 'قاعة الدراسات الإسلامية', status: 'عبر الإنترنت' }
            ].map(item => (
              <div key={item.id} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.course}</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>{item.time}</span>
                    <span>•</span>
                    <span>{item.hall}</span>
                  </div>
                </div>
                <div>
                  <span style={{
                    backgroundColor: item.status === 'مباشر' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: item.status === 'مباشر' ? '#10b981' : '#3b82f6',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '25px',
            background: 'linear-gradient(135deg, rgba(214,175,55,0.05), rgba(16,185,129,0.05))',
            border: '1px solid rgba(214,175,55,0.15)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 'bold' }}>أخبار هامة وقرارات</h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              بدء التسجيل للدورة المكثفة في مصطلح الحديث للطلاب المتقدمين اعتباراً من الأسبوع القادم عبر منسقي المحافظات.
            </p>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default ShariaDashboard;
