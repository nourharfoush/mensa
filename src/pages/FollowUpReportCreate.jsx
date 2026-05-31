import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import '../components/Management.css';

function FollowUpReportCreate() {
  const { reportId, branchId } = useParams();
  const navigate = useNavigate();
  const { 
    monthlyReports, 
    branches: appBranches, 
    coordinators: appCoordinators, 
    sessions: appSessions,
    addFollowUpReport,
    followUpReports
  } = useAppData();

  const monthlyReport = monthlyReports.find(r => String(r.id) === String(reportId));
  const branchVisit = monthlyReport?.branches?.find(b => String(b.id) === String(branchId));
  
  // Find full branch details from database
  const branchDetails = appBranches.find(
    b => b.admin === monthlyReport?.admin && b.name === branchVisit?.branch
  );

  // Derive Rwaqs from sessions or default
  const derivedRwaqs = branchVisit
    ? Array.from(
        new Set(
          appSessions
            .filter(s => s.admin === monthlyReport?.admin && s.center === branchVisit?.center && s.branch === branchVisit?.branch)
            .map(s => s.rowaq)
            .filter(Boolean)
        )
      )
    : [];
  const displayRwaqs = derivedRwaqs.length > 0 ? derivedRwaqs : ['رواق القرآن الكريم (أطفال)'];

  // Derive Coordinators
  const branchCoordinators = branchVisit
    ? appCoordinators.filter(
        c => c.admin === monthlyReport?.admin && c.center === branchVisit?.center && c.branch === branchVisit?.branch
      )
    : [];
  
  const scientificCoords = branchCoordinators.filter(c => c.specialization === 'علمي');
  const adminCoords = branchCoordinators.filter(c => c.specialization === 'إداري');

  // Form State
  const [form, setForm] = useState({
    scientificCommitment: 'نعم',
    scientificShortcoming: '',
    administrativeCommitment: 'نعم',
    administrativeShortcoming: '',
    absentCoordinators: '',
    absentMohfezs: '',
    exceedingHoursPercentage: '0%',
    multiLevelSessionsCount: '0',
    adultRwaqMohfezsCount: '0',
    adultRwaqDirectSessionsCount: '0',
    adultRwaqOnlineSessionsCount: '0',
    adultRwaqStudentsCount: '0',
    adultRwaqAttendanceCount: '0',
    childRwaqMohfezsCount: '0',
    childRwaqStudentsCount: '0',
    childRwaqAttendanceCount: '0',
    mohfezsCommitmentToCurriculum: 'الجميع ملتزم',
    mohfezClassManagement: 'أداء ممتاز لكل المحفظين',
    mohfezStudentBehavior: 'أداء ممتاز لكل المحفظين',
    tajweedNotebookActivated: 'نعم',
    teacherRecitationCommitment: 'كل المحفظين',
    dressCodeCommitment: 'كل المحفظين',
    monthlyTestsAndEvaluations: 'نعم',
    topStudentsNames: '',
    positives: '',
    negatives: '',
    recommendations: '',
    generalComments: '',
  });

  // Load existing report data if editing
  useEffect(() => {
    if (monthlyReport && branchVisit) {
      const existing = followUpReports.find(
        r => r.monthlyReportId === monthlyReport.id && r.branchVisitId === branchVisit.id
      );
      if (existing) {
        setForm({
          scientificCommitment: existing.scientificCommitment || 'نعم',
          scientificShortcoming: existing.scientificShortcoming || '',
          administrativeCommitment: existing.administrativeCommitment || 'نعم',
          administrativeShortcoming: existing.administrativeShortcoming || '',
          absentCoordinators: existing.absentCoordinators || '',
          absentMohfezs: existing.absentMohfezs || '',
          exceedingHoursPercentage: existing.exceedingHoursPercentage || '0%',
          multiLevelSessionsCount: existing.multiLevelSessionsCount || '0',
          adultRwaqMohfezsCount: existing.adultRwaqMohfezsCount || '0',
          adultRwaqDirectSessionsCount: existing.adultRwaqDirectSessionsCount || '0',
          adultRwaqOnlineSessionsCount: existing.adultRwaqOnlineSessionsCount || '0',
          adultRwaqStudentsCount: existing.adultRwaqStudentsCount || '0',
          adultRwaqAttendanceCount: existing.adultRwaqAttendanceCount || '0',
          childRwaqMohfezsCount: existing.childRwaqMohfezsCount || '0',
          childRwaqStudentsCount: existing.childRwaqStudentsCount || '0',
          childRwaqAttendanceCount: existing.childRwaqAttendanceCount || '0',
          mohfezsCommitmentToCurriculum: existing.mohfezsCommitmentToCurriculum || 'الجميع ملتزم',
          mohfezClassManagement: existing.mohfezClassManagement || 'أداء ممتاز لكل المحفظين',
          mohfezStudentBehavior: existing.mohfezStudentBehavior || 'أداء ممتاز لكل المحفظين',
          tajweedNotebookActivated: existing.tajweedNotebookActivated || 'نعم',
          teacherRecitationCommitment: existing.teacherRecitationCommitment || 'كل المحفظين',
          dressCodeCommitment: existing.dressCodeCommitment || 'كل المحفظين',
          monthlyTestsAndEvaluations: existing.monthlyTestsAndEvaluations || 'نعم',
          topStudentsNames: existing.topStudentsNames || '',
          positives: existing.positives || '',
          negatives: existing.negatives || '',
          recommendations: existing.recommendations || '',
          generalComments: existing.generalComments || '',
        });
      }
    }
  }, [monthlyReport, branchVisit, followUpReports]);

  if (!monthlyReport || !branchVisit) {
    return (
      <div className="management-page" style={{ textAlign: 'center', padding: '50px' }}>
        <h3>خطأ: لم يتم العثور على بيانات الزيارة المطلوبة.</h3>
        <Link to="/monthlyreport" className="btn btn-outline" style={{ marginTop: '20px' }}>العودة للمتابعات</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const reportData = {
      monthlyReportId: monthlyReport.id,
      branchVisitId: branchVisit.id,
      date: branchVisit.date,
      admin: monthlyReport.admin,
      center: branchVisit.center,
      branch: branchVisit.branch,
      address: branchDetails?.address || 'غير محدد',
      rwaqs: displayRwaqs,
      workDays: branchDetails?.workDays || [],
      timeFrom: branchDetails?.timeFrom || '14:00',
      timeTo: branchDetails?.timeTo || '18:00',
      followerName: monthlyReport.member,
      followerSpecialty: monthlyReport.specialty,
      ...form,
      isConfirmed: false,
      confirmationFile: ''
    };

    addFollowUpReport(reportData);
    alert('تم حفظ تقرير المتابعة بنجاح.');
    navigate('/monthlyreport');
  };

  return (
    <div className="management-page" style={{ direction: 'rtl' }}>
      <div className="page-header" style={{ marginBottom: '25px' }}>
        <h2 style={{ width: '100%', textAlign: 'center', color: 'var(--text-primary)' }}>تقارير المتابعة</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-wrapper box-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '30px' }}>
        <h3 style={{ borderBottom: '2px solid var(--accent-gold)', paddingBottom: '10px', marginBottom: '25px', color: 'var(--accent-gold)' }}>اضافة تقرير</h3>

        {/* Read-Only Branch Header Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>إدارة *</label>
            <input type="text" className="form-input" value={monthlyReport.admin} readOnly style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>المركز *</label>
            <input type="text" className="form-input" value={branchVisit.center} readOnly style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
          </div>
          <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
            <label style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>الفرع *</label>
            <input type="text" className="form-input" value={branchVisit.branch} readOnly style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
          </div>

          <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
            <label style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>الأروقة *</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '5px' }}>
              {displayRwaqs.map((r, i) => (
                <span key={i} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
            <label style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>أيام العمل *</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '5px' }}>
              {(branchDetails?.workDays || ['الأحد', 'الثلاثاء', 'الخميس']).map((d, i) => (
                <span key={i} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>توقيت عمل الفرع *</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>من:</span>
              <input type="text" className="form-input" value={branchDetails?.timeFrom || '14:00:00'} readOnly style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed', width: '120px', textAlign: 'center' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>إلى:</span>
              <input type="text" className="form-input" value={branchDetails?.timeTo || '18:00:00'} readOnly style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed', width: '120px', textAlign: 'center' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
            <label style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>العنوان *</label>
            <input type="text" className="form-input" value={branchDetails?.address || 'مركز أبو حمص - قرية نصر الله'} readOnly style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
          </div>

          <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
            <label style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>اسم المتابع *</label>
            <input type="text" className="form-input" value={`${monthlyReport.member} [${monthlyReport.specialty}]`} readOnly style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
          </div>

          <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
            <label style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>المنسقين *</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '5px' }}>
              {branchCoordinators.length === 0 ? (
                <>
                  <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                    سعيد عبد الغني عبد العاطي محمد [إداري]
                  </span>
                  <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                    السيد عبد السلام حسين سواح [علمي]
                  </span>
                </>
              ) : (
                branchCoordinators.map((c, i) => (
                  <span key={i} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                    {c.name} [{c.specialization}]
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Evaluation Sections */}

        {/* 1. Coordinators Evaluation */}
        <h4 style={{ color: 'var(--text-primary)', borderBottom: '1px dashed var(--border-subtle)', paddingBottom: '5px', marginBottom: '20px' }}>أولاً: تقييم المنسقين بالفرع</h4>
        
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>هل إلتزم المنسق العلمي بمهام عمله *</label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" checked={form.scientificCommitment === 'نعم'} onChange={() => handleRadioChange('scientificCommitment', 'نعم')} style={{ cursor: 'pointer' }} />
              نعم
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" checked={form.scientificCommitment === 'لا'} onChange={() => handleRadioChange('scientificCommitment', 'لا')} style={{ cursor: 'pointer' }} />
              لا
            </label>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>ما وجه التقصير للمنسق العلمي إن وجد *</label>
          <input type="text" name="scientificShortcoming" className="form-input" value={form.scientificShortcoming} onChange={handleChange} placeholder="أدخل وجه التقصير إن وجد" />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>هل إلتزم المنسق الإداري بمهام عمله *</label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" checked={form.administrativeCommitment === 'نعم'} onChange={() => handleRadioChange('administrativeCommitment', 'نعم')} style={{ cursor: 'pointer' }} />
              نعم
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" checked={form.administrativeCommitment === 'لا'} onChange={() => handleRadioChange('administrativeCommitment', 'لا')} style={{ cursor: 'pointer' }} />
              لا
            </label>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>ما وجه التقصير للمنسق الإداري إن وجد *</label>
          <input type="text" name="administrativeShortcoming" className="form-input" value={form.administrativeShortcoming} onChange={handleChange} placeholder="أدخل وجه التقصير إن وجد" />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>أسماء المنسقين المتغيبين عن العمل إن وجد *</label>
          <input type="text" name="absentCoordinators" className="form-input" value={form.absentCoordinators} onChange={handleChange} placeholder="أدخل الأسماء أو 'لا يوجد'" />
        </div>

        {/* 2. Mohfezs Evaluation */}
        <h4 style={{ color: 'var(--text-primary)', borderBottom: '1px dashed var(--border-subtle)', paddingBottom: '5px', marginBottom: '20px', marginTop: '30px' }}>ثانياً: تقييم المحفظين والإحصائيات</h4>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>أسماء المحفظين المتغيبين عن العمل إن وجد *</label>
          <input type="text" name="absentMohfezs" className="form-input" value={form.absentMohfezs} onChange={handleChange} placeholder="أدخل الأسماء أو 'لا يوجد'" />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>نسبة عدد المحفظين الذين تجاوزوا الحد الأدنى (48) ساعة *</label>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '8px' }}>
            {['0%', '25%', '50%', '75%', '100%'].map(pct => (
              <label key={pct} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" checked={form.exceedingHoursPercentage === pct} onChange={() => handleRadioChange('exceedingHoursPercentage', pct)} style={{ cursor: 'pointer' }} />
                {pct}
              </label>
            ))}
          </div>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>عدد الحلقات المتعددة المستوى إن وجد *</label>
            <input type="number" name="multiLevelSessionsCount" className="form-input" value={form.multiLevelSessionsCount} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>عدد محفظي رواق الكبار (قرآن-تجويد قراءات) إن وجد *</label>
            <input type="number" name="adultRwaqMohfezsCount" className="form-input" value={form.adultRwaqMohfezsCount} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>عدد الحلقات رواق الكبار مباشر (قرآن-تجويد قراءات) إن وجد *</label>
            <input type="number" name="adultRwaqDirectSessionsCount" className="form-input" value={form.adultRwaqDirectSessionsCount} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>عدد الحلقات رواق الكبار (أونلاين) (قرآن) إن وجد *</label>
            <input type="number" name="adultRwaqOnlineSessionsCount" className="form-input" value={form.adultRwaqOnlineSessionsCount} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>عدد دارسي رواق الكبار (مجموع الحلقات) *</label>
            <input type="number" name="adultRwaqStudentsCount" className="form-input" value={form.adultRwaqStudentsCount} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>(مجموع الحلقات) عدد الحضور برواق الكبار *</label>
            <input type="number" name="adultRwaqAttendanceCount" className="form-input" value={form.adultRwaqAttendanceCount} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>عدد محفظي رواق الطفل *</label>
            <input type="number" name="childRwaqMohfezsCount" className="form-input" value={form.childRwaqMohfezsCount} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>عدد دارسي رواق الطفل (مجموع الحلقات) *</label>
            <input type="number" name="childRwaqStudentsCount" className="form-input" value={form.childRwaqStudentsCount} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>(مجموع الحلقات) عدد الحضور برواق الطفل *</label>
            <input type="number" name="childRwaqAttendanceCount" className="form-input" value={form.childRwaqAttendanceCount} onChange={handleChange} style={{ maxWidth: '400px' }} />
          </div>
        </div>

        {/* 3. Educational Process Evaluation */}
        <h4 style={{ color: 'var(--text-primary)', borderBottom: '1px dashed var(--border-subtle)', paddingBottom: '5px', marginBottom: '20px', marginTop: '30px' }}>ثالثاً: سير العملية التعليمية</h4>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>هل التزم المحفظون بالمنهج *</label>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '8px' }}>
            {['الجميع ملتزم', 'الجميع غير ملتزم', 'البعض ملتزم والبعض الآخر غير ملتزم'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" checked={form.mohfezsCommitmentToCurriculum === opt} onChange={() => handleRadioChange('mohfezsCommitmentToCurriculum', opt)} style={{ cursor: 'pointer' }} />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>إدارة المحفظ للحلقة *</label>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '8px' }}>
            {['أداء ممتاز لكل المحفظين', 'أداء جيد لكل المحفظين', 'أداء ضعيف لكل المحفظين'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" checked={form.mohfezClassManagement === opt} onChange={() => handleRadioChange('mohfezClassManagement', opt)} style={{ cursor: 'pointer' }} />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>سلوك المحفظ في التعامل مع الدارسين *</label>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '8px' }}>
            {['أداء ممتاز لكل المحفظين', 'أداء جيد لكل المحفظين', 'أداء ضعيف لكل المحفظين'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" checked={form.mohfezStudentBehavior === opt} onChange={() => handleRadioChange('mohfezStudentBehavior', opt)} style={{ cursor: 'pointer' }} />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>هل تم تفعيل كراسة التجويد *</label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" checked={form.tajweedNotebookActivated === 'نعم'} onChange={() => handleRadioChange('tajweedNotebookActivated', 'نعم')} style={{ cursor: 'pointer' }} />
              نعم
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" checked={form.tajweedNotebookActivated === 'لا'} onChange={() => handleRadioChange('tajweedNotebookActivated', 'لا')} style={{ cursor: 'pointer' }} />
              لا
            </label>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>هل التزم المحفظون بطريقة المصحف المعلم *</label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" checked={form.teacherRecitationCommitment === 'كل المحفظين'} onChange={() => handleRadioChange('teacherRecitationCommitment', 'كل المحفظين')} style={{ cursor: 'pointer' }} />
              كل المحفظين
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" checked={form.teacherRecitationCommitment === 'بعض المحفظين'} onChange={() => handleRadioChange('teacherRecitationCommitment', 'بعض المحفظين')} style={{ cursor: 'pointer' }} />
              بعض المحفظين
            </label>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>هل التزم المحفظون بالزي *</label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" checked={form.dressCodeCommitment === 'كل المحفظين'} onChange={() => handleRadioChange('dressCodeCommitment', 'كل المحفظين')} style={{ cursor: 'pointer' }} />
              كل المحفظين
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" checked={form.dressCodeCommitment === 'بعض المحفظين'} onChange={() => handleRadioChange('dressCodeCommitment', 'بعض المحفظين')} style={{ cursor: 'pointer' }} />
              بعض المحفظين
            </label>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>هل يتم عمل اختبارات شهرية وتقويم أداء الدارسين *</label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" checked={form.monthlyTestsAndEvaluations === 'نعم'} onChange={() => handleRadioChange('monthlyTestsAndEvaluations', 'نعم')} style={{ cursor: 'pointer' }} />
              نعم
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" checked={form.monthlyTestsAndEvaluations === 'لا'} onChange={() => handleRadioChange('monthlyTestsAndEvaluations', 'لا')} style={{ cursor: 'pointer' }} />
              لا
            </label>
          </div>
        </div>

        {/* 4. Qualitative Fields */}
        <h4 style={{ color: 'var(--text-primary)', borderBottom: '1px dashed var(--border-subtle)', paddingBottom: '5px', marginBottom: '20px', marginTop: '30px' }}>رابعاً: الملاحظات والتقييم النوعي</h4>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>اسماء الطلاب المتفوقين (حضور-أداء) في الفرع لهذا الشهر (واحد في كل مستوى) *</label>
          <textarea name="topStudentsNames" className="form-input textarea" value={form.topStudentsNames} onChange={handleChange} placeholder="أدخل أسماء الطلاب المتفوقين" style={{ height: '100px' }}></textarea>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>الايجابيات الموجودة في الفرع *</label>
          <textarea name="positives" className="form-input textarea" value={form.positives} onChange={handleChange} placeholder="أدخل الإيجابيات" style={{ height: '100px' }}></textarea>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>السلبيات التي يواجهها الفرع إن وجدت *</label>
          <textarea name="negatives" className="form-input textarea" value={form.negatives} onChange={handleChange} placeholder="أدخل السلبيات" style={{ height: '100px' }}></textarea>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>التوصية لمعالجة السلبية المتكررة *</label>
          <textarea name="recommendations" className="form-input textarea" value={form.recommendations} onChange={handleChange} placeholder="أدخل التوصيات لمعالجة السلبيات" style={{ height: '100px' }}></textarea>
        </div>

        <div className="form-group" style={{ marginBottom: '25px' }}>
          <label>ملاحظات عامة *</label>
          <textarea name="generalComments" className="form-input textarea" value={form.generalComments} onChange={handleChange} placeholder="أدخل الملاحظات العامة" style={{ height: '100px' }}></textarea>
        </div>

        {/* Form Actions */}
        <div className="form-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'flex-start', marginTop: '30px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 40px', fontSize: '14px', fontWeight: 'bold' }}>حفظ</button>
          <button type="button" className="btn btn-outline" onClick={() => setForm({
            scientificCommitment: 'نعم',
            scientificShortcoming: '',
            administrativeCommitment: 'نعم',
            administrativeShortcoming: '',
            absentCoordinators: '',
            absentMohfezs: '',
            exceedingHoursPercentage: '0%',
            multiLevelSessionsCount: '0',
            adultRwaqMohfezsCount: '0',
            adultRwaqDirectSessionsCount: '0',
            adultRwaqOnlineSessionsCount: '0',
            adultRwaqStudentsCount: '0',
            adultRwaqAttendanceCount: '0',
            childRwaqMohfezsCount: '0',
            childRwaqStudentsCount: '0',
            childRwaqAttendanceCount: '0',
            mohfezsCommitmentToCurriculum: 'الجميع ملتزم',
            mohfezClassManagement: 'أداء ممتاز لكل المحفظين',
            mohfezStudentBehavior: 'أداء ممتاز لكل المحفظين',
            tajweedNotebookActivated: 'نعم',
            teacherRecitationCommitment: 'كل المحفظين',
            dressCodeCommitment: 'كل المحفظين',
            monthlyTestsAndEvaluations: 'نعم',
            topStudentsNames: '',
            positives: '',
            negatives: '',
            recommendations: '',
            generalComments: '',
          })} style={{ padding: '10px 30px', fontSize: '14px' }}>اعادة ادخال</button>
          <Link to="/monthlyreport" className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 30px', fontSize: '14px', backgroundColor: '#6b7280', color: 'white', border: 'none' }}>رجوع</Link>
        </div>
      </form>
    </div>
  );
}

export default FollowUpReportCreate;
