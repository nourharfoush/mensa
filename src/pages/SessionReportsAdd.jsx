import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { quranSurahs } from '../data/quranSurahs';

import { children1Curriculum } from '../data/children1';
import { children2Curriculum } from '../data/children2';
import { children3Curriculum } from '../data/children3';
import { children4Curriculum } from '../data/children4';
import { children5Curriculum } from '../data/children5';
import { children6Curriculum } from '../data/children6';
import { children7Curriculum } from '../data/children7';
import { children8Curriculum } from '../data/children8';
import { children9Curriculum } from '../data/children9';
import { children10Curriculum } from '../data/children10';

import { seniorsOneYearCurriculum } from '../data/seniors_one_year';
import { seniorsTwoYearsCurriculum } from '../data/seniors_two_years';
import { seniorsThreeYearsCurriculum } from '../data/seniors_three_years';
import { seniorsFourYearsFatihahCurriculum } from '../data/seniors_four_years_fatihah';
import { seniorsFourYearsNasCurriculum } from '../data/seniors_four_years_nas';
import { seniorsFiveYearsFatihahCurriculum } from '../data/seniors_five_years_fatihah';
import { seniorsFiveYearsNasCurriculum } from '../data/seniors_five_years_nas';

const getCurriculumData = (rowaq, level) => {
  if (!rowaq || !level) return null;
  
  if (rowaq.includes('أطفال')) {
    if (level === 'الأول') return children1Curriculum;
    if (level === 'الثاني') return children2Curriculum;
    if (level === 'الثالث') return children3Curriculum;
    if (level === 'الرابع') return children4Curriculum;
    if (level === 'الخامس') return children5Curriculum;
    if (level === 'السادس') return children6Curriculum;
    if (level === 'السابع') return children7Curriculum;
    if (level === 'الثامن') return children8Curriculum;
    if (level === 'التاسع') return children9Curriculum;
    if (level === 'العاشر') return children10Curriculum;
  } else if (rowaq.includes('كبار')) {
    if (level === 'السنة الواحدة') return seniorsOneYearCurriculum;
    if (level === 'السنتين') return seniorsTwoYearsCurriculum;
    if (level === 'ثلاث سنوات') return seniorsThreeYearsCurriculum;
    if (level === 'أربع سنوات من البقرة') return seniorsFourYearsFatihahCurriculum;
    if (level === 'أربع سنوات من الناس') return seniorsFourYearsNasCurriculum;
    if (level === 'خمس سنوات من البقرة') return seniorsFiveYearsFatihahCurriculum;
    if (level === 'خمس سنوات من الناس') return seniorsFiveYearsNasCurriculum;
  }
  return null;
};

function SessionReportsAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isPlatform = location.pathname.startsWith('/platform-sessions');
  const { sessions, platformSessions, addSessionReport } = useAppData();
  
  const sessionId = id;
  const session = isPlatform
    ? platformSessions.find(s => String(s.id) === String(id))
    : sessions.find(s => String(s.id) === String(id));

  const getLocalDateString = (offsetHours = 0) => {
    const d = new Date();
    d.setHours(d.getHours() + offsetHours);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getLocalDateString(0));
  const [sessionNum, setSessionNum] = useState('');

  // Sections State
  const [memorization, setMemorization] = useState({ fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });
  const [review, setReview] = useState({ fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });
  const [recentReview, setRecentReview] = useState({ fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });
  const [distantReview, setDistantReview] = useState({ fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });

  const isLevelOneChild = session?.rowaq === 'رواق القرآن الكريم (أطفال)' && (session?.level === 'الأول' || session?.level?.includes('الأول'));
  const curriculumData = getCurriculumData(session?.rowaq, session?.level);

  const handleSave = () => {
    if (!date) {
      alert('يرجى اختيار التاريخ');
      return;
    }
    
    addSessionReport({
      sessionId,
      isPlatform,
      date,
      sessionNum,
      memorization,
      review,
      recentReview,
      distantReview
    });
    
    alert('تم حفظ التقرير بنجاح');
    navigate(isPlatform ? `/platform-sessions/${sessionId}/reports` : `/sessions/${sessionId}/reports`);
  };

  const renderSectionFields = (title, state, setState, isRequired = false) => {
    const handleChange = (field, value) => {
      setState(prev => ({ ...prev, [field]: value }));
    };

    // Calculate max ayahs for the selected surahs
    const fromSurahData = quranSurahs.find(s => s.name === state.fromSurah);
    const toSurahData = quranSurahs.find(s => s.name === state.toSurah);
    
    const maxFromAyahs = fromSurahData ? fromSurahData.ayahs : 0;
    const maxToAyahs = toSurahData ? toSurahData.ayahs : 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '15px' }}>
        <div style={{ width: '200px', fontWeight: 'bold' }}>
          {title} {isRequired && <span className="req">*</span>}
        </div>
        <div style={{ flex: '1', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
            <select 
              className="form-select" 
              value={state.fromSurah} 
              disabled={!!curriculumData}
              onChange={e => {
                handleChange('fromSurah', e.target.value);
                handleChange('fromAyah', ''); // Reset ayah when surah changes
              }}
            >
              <option value="">--- من سورة ---</option>
              {quranSurahs.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '100px' }}>
            <select 
              className="form-select" 
              value={state.fromAyah} 
              onChange={e => handleChange('fromAyah', e.target.value)}
              disabled={!!curriculumData || !state.fromSurah}
            >
              <option value="">من الاية</option>
              {Array.from({ length: maxFromAyahs }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
            <select 
              className="form-select" 
              value={state.toSurah} 
              disabled={!!curriculumData}
              onChange={e => {
                handleChange('toSurah', e.target.value);
                handleChange('toAyah', ''); // Reset ayah when surah changes
              }}
            >
              <option value="">--- الي سورة ---</option>
              {quranSurahs.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '100px' }}>
            <select 
              className="form-select" 
              value={state.toAyah} 
              onChange={e => handleChange('toAyah', e.target.value)}
              disabled={!!curriculumData || !state.toSurah}
            >
              <option value="">الي الاية</option>
              {Array.from({ length: maxToAyahs }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>ادارة التقارير اليومية [حلقة:{session?.session_no || sessionId}]</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '30px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>إضافة تقرير يومي</h3>
        
        {/* Date and Session Num Row */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
          <div style={{ width: '200px', fontWeight: 'bold' }}>التاريخ <span className="req">*</span></div>
          <div style={{ flex: '1', display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: '1' }}>
              <input 
                type="date" 
                className="form-input" 
                value={date} 
                min={getLocalDateString(-48)}
                max={getLocalDateString(0)}
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>
            <div className="form-group" style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ margin: 0, fontWeight: 'bold', whiteSpace: 'nowrap' }}>رقم الجلسة</label>
              {curriculumData ? (
                <select 
                  className="form-select" 
                  value={sessionNum} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setSessionNum(val);
                    if (val) {
                      const cur = curriculumData.find(c => c.session === parseInt(val));
                      if (cur) {
                        setMemorization({ ...cur.memorization });
                        setReview({ ...cur.review });
                        setRecentReview({ ...cur.recentReview });
                        setDistantReview(cur.distantReview ? { ...cur.distantReview } : { fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });
                      }
                    } else {
                      setMemorization({ fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });
                      setReview({ fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });
                      setRecentReview({ fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });
                      setDistantReview({ fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });
                    }
                  }}
                >
                  <option value="">اختار رقم الجلسة</option>
                  {curriculumData.map(c => (
                    <option key={c.session} value={c.session}>جلسة {c.session}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  className="form-input" 
                  value={sessionNum} 
                  onChange={(e) => setSessionNum(e.target.value)} 
                  placeholder="رقم الجلسة"
                />
              )}
            </div>
          </div>
        </div>

        {renderSectionFields('الحفظ', memorization, setMemorization, true)}
        {renderSectionFields('التسميع', review, setReview, true)}
        {renderSectionFields('مراجعة الماضي القريب', recentReview, setRecentReview)}
        {!isLevelOneChild && renderSectionFields('مراجعة الماضي البعيد', distantReview, setDistantReview)}

        <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '30px', flexDirection: 'row-reverse' }}>
          <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSave}>حفظ</button>
          <button className="btn btn-outline" style={{ padding: '10px 40px' }} onClick={() => {
             setMemorization({ fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });
             setReview({ fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });
             setRecentReview({ fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });
             setDistantReview({ fromSurah: '', fromAyah: '', toSurah: '', toAyah: '' });
          }}>اعادة ادخال</button>
          <button className="btn btn-secondary" style={{ padding: '10px 40px', background: '#6b7280', color: 'white', border: 'none' }} onClick={() => navigate(-1)}>رجوع</button>
        </div>
      </div>
    </div>
  );
}

export default SessionReportsAdd;
