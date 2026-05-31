import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';

function PlatformRowaqsList() {
  const { platformRowaqs, deletePlatformRowaq } = useAppData();

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="title-section" style={{ textAlign: 'center', width: '100%' }}>
          <h2>إدارة الأروقة</h2>
          <p>عرض وتعديل قائمة الأروقة المتاحة أوفلاين</p>
        </div>
      </div>

      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse', marginBottom: '15px' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          <Link to="/platform-rowaqs/create" className="btn btn-primary" style={{ textDecoration: 'none', background: 'var(--accent-gold)', color: 'var(--bg-black)' }}>
            <Plus size={16} /> إضافة رواق
          </Link>
        </div>
        <div className="table-stats">النتائج ({platformRowaqs.length})</div>
      </div>

      <div className="table-wrapper box-card">
        <table className="management-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>المستويات</th>
              <th>الحد الأدنى للعمر</th>
              <th>الحد الأقصى للعمر</th>
              <th>مستوى الحفظ</th>
              <th>أنشئ في</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {platformRowaqs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد أروقة مسجلة.
                </td>
              </tr>
            ) : (
              platformRowaqs.map(r => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.levels}</td>
                  <td>{r.age_min}</td>
                  <td>{r.age_max}</td>
                  <td>{r.memorization_level}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{r.created_at}</td>
                  <td className="actions-cell">
                    <button className="action-icon view" style={{ color: 'var(--text-muted)' }}><Eye size={16}/></button>
                    <Link to={`/platform-rowaqs/create?id=${r.id}`} className="action-icon edit" style={{textDecoration: 'none', color: 'inherit'}}><Edit size={16}/></Link>
                    <button className="action-icon delete" onClick={() => deletePlatformRowaq(r.id)}><Trash2 size={16}/></button>
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

export default PlatformRowaqsList;


