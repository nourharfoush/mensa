import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import '../components/Management.css';

function FollowUpReportConfirm() {
  const { reportId, branchId } = useParams();
  const navigate = useNavigate();
  const { monthlyReports, followUpReports, confirmFollowUpReport } = useAppData();

  const monthlyReport = monthlyReports.find(r => r.id === Number(reportId));
  const report = followUpReports.find(
    r => r.monthlyReportId === Number(reportId) && r.branchVisitId === Number(branchId)
  );

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  if (!monthlyReport || !report) {
    return (
      <div className="management-page" style={{ textAlign: 'center', padding: '50px', direction: 'rtl' }}>
        <h3>خطأ: لم يتم العثور على التقرير المطلوب لتأكيده.</h3>
        <Link to="/monthlyreport" className="btn btn-outline" style={{ marginTop: '20px' }}>العودة للمتابعات</Link>
      </div>
    );
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!file && !report.isConfirmed) {
      alert('الرجاء اختيار ملف التقرير الموقع والمختوم أولاً.');
      return;
    }

    const fileName = file ? file.name : report.confirmationFile || 'report_scan.pdf';
    confirmFollowUpReport(monthlyReport.id, report.branchVisitId, fileName);
    alert('تم تأكيد ورفع التقرير بنجاح.');
    navigate('/monthlyreport');
  };

  return (
    <div className="management-page" style={{ direction: 'rtl' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ width: '100%', textAlign: 'center', color: 'var(--text-primary)' }}>تأكيد تقرير المتابعة</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
        <h3 style={{ color: 'var(--accent-gold)', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
          رفع التقرير الموقع والمختوم
        </h3>

        {/* Report Summary Card */}
        <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '6px', marginBottom: '25px', fontSize: '14px' }}>
          <div style={{ marginBottom: '8px' }}><strong>الإدارة: </strong> {report.admin}</div>
          <div style={{ marginBottom: '8px' }}><strong>الفرع: </strong> {report.branch}</div>
          <div style={{ marginBottom: '8px' }}><strong>تاريخ المتابعة: </strong> {report.date}</div>
          <div><strong>عضو المتابعة: </strong> {report.followerName} ({report.followerSpecialty})</div>
        </div>

        {/* Upload Container */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: dragOver ? '2px dashed var(--accent-gold)' : '2px dashed var(--border-subtle)',
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: dragOver ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.01)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '30px'
          }}
          onClick={() => document.getElementById('file-upload-input').click()}
        >
          <input 
            type="file" 
            id="file-upload-input" 
            style={{ display: 'none' }} 
            accept="image/*,.pdf" 
            onChange={handleFileChange}
          />
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>📁</div>
          {file ? (
            <div>
              <p style={{ color: '#10b981', fontWeight: 'bold', margin: '0 0 5px 0' }}>تم تحديد الملف بنجاح!</p>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '13px' }}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
            </div>
          ) : report.isConfirmed ? (
            <div>
              <p style={{ color: '#10b981', fontWeight: 'bold', margin: '0 0 5px 0' }}>التقرير مؤكد ومرفوع مسبقاً</p>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '13px' }}>الملف الحالي: {report.confirmationFile}</p>
              <p style={{ color: 'var(--text-muted)', margin: '10px 0 0 0', fontSize: '12px' }}>اضغط هنا أو اسحب ملفاً جديداً لاستبداله</p>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 'bold', margin: '0 0 8px 0' }}>اسحب ملف المسح الضوئي (Scan) أو الصورة هنا</p>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13px' }}>أو اضغط لتصفح الملفات من جهازك (الملفات المدعومة: PDF, PNG, JPG)</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={handleConfirm} 
            className="btn btn-primary" 
            style={{ padding: '10px 30px', fontWeight: 'bold', flex: 1 }}
          >
            {report.isConfirmed ? 'حفظ التحديث' : 'تأكيد التقرير'}
          </button>
          <Link 
            to="/monthlyreport" 
            className="btn btn-outline" 
            style={{ textDecoration: 'none', padding: '10px 30px', flex: 1, backgroundColor: '#6b7280', color: 'white', border: 'none', textAlign: 'center' }}
          >
            إلغاء
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FollowUpReportConfirm;
