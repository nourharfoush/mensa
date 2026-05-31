import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import '../components/Management.css';

function FollowUpReportPreview() {
  const { reportId, branchId } = useParams();
  const { monthlyReports, followUpReports } = useAppData();

  const monthlyReport = monthlyReports.find(r => r.id === Number(reportId));
  const report = followUpReports.find(
    r => r.monthlyReportId === Number(reportId) && r.branchVisitId === Number(branchId)
  );

  if (!monthlyReport || !report) {
    return (
      <div className="management-page" style={{ textAlign: 'center', padding: '50px', direction: 'rtl' }}>
        <h3>خطأ: لم يتم العثور على التقرير المطلوب.</h3>
        <Link to="/monthlyreport" className="btn btn-outline" style={{ marginTop: '20px' }}>العودة للمتابعات</Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="management-page" style={{ direction: 'rtl' }}>
      {/* CSS style block for printing */}
      <style>{`
        @media print {
          /* Hide everything except the print-area */
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            direction: rtl;
            background-color: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-title {
            color: black !important;
            border-bottom: 2px solid black !important;
          }
          .print-section {
            border: 1px solid #000 !important;
            background-color: #fff !important;
            page-break-inside: avoid;
          }
          .print-label {
            color: #000 !important;
          }
        }
      `}</style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>معاينة تقرير المتابعة</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '8px 25px', fontWeight: 'bold' }}>
            🖨️ طباعة التقرير
          </button>
          <Link to="/monthlyreport" className="btn btn-outline" style={{ textDecoration: 'none', padding: '8px 25px', backgroundColor: '#6b7280', color: 'white', border: 'none' }}>
            رجوع
          </Link>
        </div>
      </div>

      {/* Main Printable Document Sheet */}
      <div className="print-area box-card" style={{ maxWidth: '850px', margin: '0 auto', padding: '40px', backgroundColor: '#11141d', border: '1px solid var(--accent-gold-dark)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        
        {/* Document Header */}
        <div className="print-title" style={{ textAlign: 'center', borderBottom: '3px double var(--accent-gold)', paddingBottom: '20px', marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--accent-gold)', margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>الأروقة الأزهرية الشريفة</h2>
          <h3 style={{ color: 'var(--text-primary)', margin: '0', fontSize: '18px' }}>تقرير زيارة المتابعة الميدانية للفرع</h3>
          <p style={{ color: 'var(--text-muted)', margin: '10px 0 0 0', fontSize: '13px' }}>تاريخ الزيارة: <strong>{report.date}</strong> | تاريخ طباعة التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
        </div>

        {/* 1. Branch Information */}
        <div className="print-section" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '20px', marginBottom: '25px' }}>
          <h4 className="print-label" style={{ color: 'var(--accent-gold)', marginTop: 0, marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px', fontSize: '15px' }}>بيانات الفرع والزيارة</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px 30px', fontSize: '14px' }}>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>الإدارة: </strong> {report.admin}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>المركز: </strong> {report.center}</div>
            <div style={{ gridColumn: 'span 2' }}><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>الفرع: </strong> {report.branch}</div>
            <div style={{ gridColumn: 'span 2' }}>
              <strong className="print-label" style={{ color: 'var(--text-secondary)' }}>الأروقة المتواجدة: </strong> 
              {report.rwaqs?.join('، ') || 'رواق القرآن الكريم (أطفال)'}
            </div>
            <div>
              <strong className="print-label" style={{ color: 'var(--text-secondary)' }}>أيام عمل الفرع: </strong> 
              {report.workDays?.join('، ') || 'غير محدد'}
            </div>
            <div>
              <strong className="print-label" style={{ color: 'var(--text-secondary)' }}>مواعيد العمل بالفرع: </strong> 
              من {report.timeFrom} إلى {report.timeTo}
            </div>
            <div style={{ gridColumn: 'span 2' }}><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>العنوان بالتفصيل: </strong> {report.address}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>عضو المتابعة (المتابع): </strong> {report.followerName}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>وظيفة المتابع: </strong> {report.followerSpecialty}</div>
          </div>
        </div>

        {/* 2. Coordinators Evaluation */}
        <div className="print-section" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '20px', marginBottom: '25px' }}>
          <h4 className="print-label" style={{ color: 'var(--accent-gold)', marginTop: 0, marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px', fontSize: '15px' }}>أولاً: تقييم المنسقين بالفرع</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '12px', fontSize: '14px' }}>
            <div>
              <strong className="print-label" style={{ color: 'var(--text-secondary)' }}>التزام المنسق العلمي بمهام عمله: </strong>
              <span style={{ color: report.scientificCommitment === 'نعم' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{report.scientificCommitment}</span>
            </div>
            {report.scientificShortcoming && (
              <div style={{ paddingRight: '20px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                - وجه التقصير العلمي: {report.scientificShortcoming}
              </div>
            )}
            <div>
              <strong className="print-label" style={{ color: 'var(--text-secondary)' }}>التزام المنسق الإداري بمهام عمله: </strong>
              <span style={{ color: report.administrativeCommitment === 'نعم' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{report.administrativeCommitment}</span>
            </div>
            {report.administrativeShortcoming && (
              <div style={{ paddingRight: '20px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                - وجه التقصير الإداري: {report.administrativeShortcoming}
              </div>
            )}
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>المنسقين المتغيبين عن العمل: </strong> {report.absentCoordinators || 'لا يوجد'}</div>
          </div>
        </div>

        {/* 3. Mohfezs Evaluation & Stats */}
        <div className="print-section" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '20px', marginBottom: '25px' }}>
          <h4 className="print-label" style={{ color: 'var(--accent-gold)', marginTop: 0, marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px', fontSize: '15px' }}>ثانياً: تقييم المحفظين والإحصائيات</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px 30px', fontSize: '14px' }}>
            <div style={{ gridColumn: 'span 2' }}><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>المحفظين المتغيبين عن العمل: </strong> {report.absentMohfezs || 'لا يوجد'}</div>
            <div style={{ gridColumn: 'span 2' }}><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>نسبة المحفظين الذين تجاوزوا الحد الأدنى (48 ساعة): </strong> {report.exceedingHoursPercentage}</div>
            
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>عدد الحلقات متعددة المستوى: </strong> {report.multiLevelSessionsCount}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>عدد محفظي رواق الكبار: </strong> {report.adultRwaqMohfezsCount}</div>
            
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>حلقات الكبار المباشر: </strong> {report.adultRwaqDirectSessionsCount}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>حلقات الكبار أونلاين: </strong> {report.adultRwaqOnlineSessionsCount}</div>
            
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>دارسي رواق الكبار: </strong> {report.adultRwaqStudentsCount}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>حضور رواق الكبار: </strong> {report.adultRwaqAttendanceCount}</div>
            
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>عدد محفظي رواق الطفل: </strong> {report.childRwaqMohfezsCount}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>دارسي رواق الطفل: </strong> {report.childRwaqStudentsCount}</div>
            
            <div style={{ gridColumn: 'span 2' }}><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>حضور رواق الطفل: </strong> {report.childRwaqAttendanceCount}</div>
          </div>
        </div>

        {/* 4. Educational Process */}
        <div className="print-section" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '20px', marginBottom: '25px' }}>
          <h4 className="print-label" style={{ color: 'var(--accent-gold)', marginTop: 0, marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px', fontSize: '15px' }}>ثالثاً: سير العملية التعليمية</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '12px', fontSize: '14px' }}>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>التزام المحفظين بالمنهج المقرّر: </strong> {report.mohfezsCommitmentToCurriculum}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>إدارة المحفظ للحلقة التعليمية: </strong> {report.mohfezClassManagement}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>سلوك المحفظ مع الدارسين والطلاب: </strong> {report.mohfezStudentBehavior}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>تفعيل كراسة التجويد الخاصة بالرواق: </strong> {report.tajweedNotebookActivated}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>التزام المحفظين بطريقة المصحف المعلم: </strong> {report.teacherRecitationCommitment}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>التزام المحفظين بالزي الأزهري/المقرر: </strong> {report.dressCodeCommitment}</div>
            <div><strong className="print-label" style={{ color: 'var(--text-secondary)' }}>إجراء اختبارات شهرية وتقويم الدارسين: </strong> {report.monthlyTestsAndEvaluations}</div>
          </div>
        </div>

        {/* 5. Qualitative Report & General Comments */}
        <div className="print-section" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '20px', marginBottom: '35px' }}>
          <h4 className="print-label" style={{ color: 'var(--accent-gold)', marginTop: 0, marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px', fontSize: '15px' }}>رابعاً: الملاحظات والتقييم النوعي</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '18px', fontSize: '14px' }}>
            <div>
              <strong className="print-label" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>أسماء الطلاب المتفوقين في الفرع (حضور - أداء):</strong>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', whiteSpace: 'pre-line' }}>{report.topStudentsNames || 'لا يوجد'}</div>
            </div>
            <div>
              <strong className="print-label" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>النقاط الإيجابية الملاحظة بالفرع:</strong>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', whiteSpace: 'pre-line' }}>{report.positives || 'لا يوجد'}</div>
            </div>
            <div>
              <strong className="print-label" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>النقاط السلبية التي تواجه الفرع:</strong>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', whiteSpace: 'pre-line' }}>{report.negatives || 'لا يوجد'}</div>
            </div>
            <div>
              <strong className="print-label" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>التوصية لمعالجة السلبية المتكررة:</strong>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', whiteSpace: 'pre-line' }}>{report.recommendations || 'لا يوجد'}</div>
            </div>
            <div>
              <strong className="print-label" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>ملاحظات عامة وتوصيات ختامية:</strong>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', whiteSpace: 'pre-line' }}>{report.generalComments || 'لا يوجد'}</div>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', marginTop: '50px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', fontSize: '14px' }}>
          <div style={{ textAlign: 'center' }}>
            <p className="print-label" style={{ margin: '0 0 40px 0', fontWeight: 'bold' }}>توقيع عضو المتابعة الميدانية</p>
            <p style={{ margin: 0, fontStyle: 'italic' }}>{report.followerName}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="print-label" style={{ margin: '0 0 40px 0', fontWeight: 'bold' }}>اعتماد مدير عام الرواق الأزهري</p>
            <p style={{ margin: 0 }}>........................................</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FollowUpReportPreview;
