import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';

function AdministrationsList() {
  const { administrations, addCenterToAdmin } = useAppData();
  
  const [filterAdminName, setFilterAdminName] = useState('');
  const [filterManager, setFilterManager] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAdmin, setModalAdmin] = useState('');
  const [modalCenterName, setModalCenterName] = useState('');

  const filtered = administrations.filter(a =>
    (filterAdminName ? a.name?.includes(filterAdminName) : true) &&
    (filterManager ? a.manager?.includes(filterManager) : true)
  );

  const handleAddCenter = () => {
    if (!modalAdmin || !modalCenterName) {
      alert('الرجاء اختيار الإدارة وإدخال اسم المركز');
      return;
    }
    addCenterToAdmin(modalAdmin, modalCenterName);
    setIsModalOpen(false);
    setModalAdmin('');
    setModalCenterName('');
    alert('تمت إضافة المركز بنجاح');
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <div className="title-section">
          <h2>إدارة الإدارات</h2>
          <p>إدارة وعرض قائمة المديرين لكل محافظة</p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '15px' }}>
          <div className="form-group">
            <label>اسم المحافظة</label>
            <input type="text" className="form-input" placeholder="البحث بالمحافظة" value={filterAdminName} onChange={e => setFilterAdminName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>اسم المدير</label>
            <input type="text" className="form-input" placeholder="البحث بالمدير" value={filterManager} onChange={e => setFilterManager(e.target.value)} />
          </div>
        </div>
        <div className="search-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-outline" onClick={() => { 
            setFilterAdminName(''); setFilterManager(''); 
          }}>إعادة تعيين</button>
          <button className="btn btn-primary" style={{ marginRight: '10px' }}><Search size={16} /> بحث</button>
        </div>
      </div>

      {/* Table controls */}
      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          <button className="btn btn-outline" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> إضافة مركز
          </button>
        </div>
        <div className="table-stats">النتائج ({filtered.length})</div>
      </div>

      <div className="table-wrapper box-card">
        <table className="management-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>المدير</th>
              <th>المراكز</th>
              <th>انشئ في</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد إدارات مسجلة.
                </td>
              </tr>
            ) : (
              filtered.map(a => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td style={{ color: a.manager !== '-' ? '#3b82f6' : 'inherit' }}>{a.manager}</td>
                  <td>{a.centers_count}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{a.created_at}</td>
                  <td className="actions-cell">
                    <button className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px', height: 'auto' }}>عرض المراكز بالمحافظة</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Center Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="box-card" style={{ width: '400px', padding: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>إضافة مركز</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>الإدارة</label>
              <select className="form-select" value={modalAdmin} onChange={e => setModalAdmin(e.target.value)}>
                <option value="">اختار الإدارة</option>
                {administrations.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label>اسم المركز</label>
              <input type="text" className="form-input" placeholder="أدخل اسم المركز" value={modalCenterName} onChange={e => setModalCenterName(e.target.value)} />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'row-reverse' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>إلغاء</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddCenter}>إضافة المركز</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdministrationsList;
