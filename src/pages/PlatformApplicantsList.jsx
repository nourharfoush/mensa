import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Upload, Trash2 } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX, importFromXLSX } from '../utils/xlsxHelper';

function PlatformApplicantsList() {
  const { platformApplicants, deletePlatformApplicant, addPlatformApplicant } = useAppData();
  const importRef = useRef(null);
  
  const [filterName, setFilterName] = useState('');

  const filtered = platformApplicants.filter(a =>
    filterName ? a.name?.includes(filterName) : true
  );

  const handleExport = () => {
    const exportData = filtered.map(a => ({
      'الاسم': a.name,
      'الرواق': a.rowaq,
      'الجنس': a.gender,
      'الرقم القومي': a.national_id,
      'الهاتف': a.phone,
      'الجزء': `${a.memorization_from} - ${a.memorization_to}`,
      'تاريخ التسجيل': a.register_date,
    }));
    exportToXLSX(exportData, 'الطلبات', 'طلبات الالتحاق - المنصة');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      if (!rows || rows.length === 0) {
        alert('الملف فارغ أو يحتوي على بيانات غير صالحة');
        return;
      }
      rows.forEach(row => {
        const nationalId = String(row['الرقم القومي'] || '').trim();
        if (!nationalId) return;

        // Skip duplicates
        const isDuplicate = platformApplicants.some(a => String(a.national_id || '').trim() === nationalId);
        if (!isDuplicate) {
          const partStr = String(row['الجزء'] || '');
          const parts = partStr.split('-').map(p => p.trim());
          const memorization_from = parts[0] || 'من الفاتحة';
          const memorization_to = parts[1] || 'إلى الناس';

          addPlatformApplicant({
            name: row['الاسم'] || '',
            rowaq: row['الرواق'] || '',
            gender: row['الجنس'] || '',
            national_id: nationalId,
            phone: row['الهاتف'] || '',
            memorization_from,
            memorization_to,
            register_date: row['تاريخ التسجيل'] || new Date().toLocaleDateString('ar-EG')
          });
        }
      });
      alert('تم استيراد طلبات المنصة بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <div className="title-section">
          <h2>المتقدمين الجدد - المنصة</h2>
          <p>عرض وإدارة طلبات الالتحاق المقدمة للمنصة</p>
        </div>
      </div>

      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)', marginBottom: '15px' }}>
          <div className="form-group">
            <label>الاسم</label>
            <input type="text" className="form-input" placeholder="البحث بالاسم" value={filterName} onChange={e => setFilterName(e.target.value)} />
          </div>
        </div>
        <div className="search-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-outline" onClick={() => { setFilterName(''); }}>إعادة تعيين</button>
          <button className="btn btn-primary" style={{ marginRight: '10px' }}><Search size={16} /> بحث</button>
        </div>
      </div>

      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          <Link to="/platform-applicants/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={16} /> إضافة طلب
          </Link>
          <button className="btn btn-gold-outline" onClick={() => importRef.current.click()}>
            <Upload size={16} /> استيراد
          </button>
          <input ref={importRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImport} />
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={16} /> تصدير
          </button>
        </div>
        <div className="table-stats">النتائج ({filtered.length})</div>
      </div>

      <div className="table-wrapper box-card">
        <table className="management-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الرواق</th>
              <th>الجنس</th>
              <th>الرقم القومي</th>
              <th>الهاتف</th>
              <th>الجزء</th>
              <th>تاريخ التسجيل</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>لا توجد طلبات لعرضها.</td></tr>
            ) : (
              filtered.map(a => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.rowaq}</td>
                  <td>{a.gender}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{a.national_id}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{a.phone}</td>
                  <td>{a.memorization_from} - {a.memorization_to}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{a.register_date}</td>
                  <td className="actions-cell">
                    <button className="action-icon delete" onClick={() => deletePlatformApplicant(a.id)}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PlatformApplicantsList;
