import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);

function WatchtowerList() {
  const { auditLogs, branches } = useAppData();
  
  const [filterName, setFilterName] = useState('');
  const [filterAdmin, setFilterAdmin] = useState('');
  const [filterCenter, setFilterCenter] = useState('');
  const [filterBranch, setFilterBranch] = useState('');

  const availableCenters = filterAdmin ? (egyptCenters[filterAdmin] || []) : [];
  const availableBranches = branches.filter(b => b.admin === filterAdmin && b.center === filterCenter);

  const filtered = auditLogs.filter(log =>
    (filterName ? log.name?.includes(filterName) : true) &&
    (filterAdmin ? log.admin === filterAdmin : true) &&
    (filterCenter ? log.center === filterCenter : true) &&
    (filterBranch ? log.branch === filterBranch : true)
  );

  const handleExport = () => {
    const exportData = filtered.map(log => ({
      'الاسم': log.name,
      'الإدارة': log.admin,
      'المركز': log.center,
      'الفرع': log.branch,
      'المقصود': log.action,
      'أنشئ في': log.created_at,
    }));
    exportToXLSX(exportData, 'برج المراقبة', 'برج المراقبة');
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <div className="title-section">
          <h2>برج المراقبة</h2>
          <p>إدارة وعرض برج المراقبة في النظام</p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '15px' }}>
          <div className="form-group">
            <label>الاسم</label>
            <input type="text" className="form-input" placeholder="البحث بالاسم" value={filterName} onChange={e => setFilterName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>المحافظة</label>
            <select className="form-select" value={filterAdmin} onChange={e => { setFilterAdmin(e.target.value); setFilterCenter(''); setFilterBranch(''); }}>
              <option value="">--- اختار المحافظة ---</option>
              {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>المركز</label>
            <select className="form-select" value={filterCenter} onChange={e => { setFilterCenter(e.target.value); setFilterBranch(''); }} disabled={!filterAdmin}>
              <option value="">{filterAdmin ? '--- اختار المركز ---' : 'اختار المحافظة أولاً'}</option>
              {availableCenters.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الفرع</label>
            <select className="form-select" value={filterBranch} onChange={e => setFilterBranch(e.target.value)} disabled={!filterCenter}>
              <option value="">{filterCenter ? '--- اختار الفرع ---' : 'اختار المركز أولاً'}</option>
              {availableBranches.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div className="search-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-outline" onClick={() => { 
            setFilterName(''); setFilterAdmin(''); setFilterCenter(''); setFilterBranch(''); 
          }}>إعادة تعيين</button>
          <button className="btn btn-primary" style={{ marginRight: '10px' }}><Search size={16} /> بحث</button>
        </div>
      </div>

      {/* Table controls */}
      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons">
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
              <th>الإدارة</th>
              <th>المركز</th>
              <th>الفرع</th>
              <th>المقصود</th>
              <th>أنشئ في</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد حركات مسجلة.
                </td>
              </tr>
            ) : (
              filtered.map(log => (
                <tr key={log.id}>
                  <td style={{ fontWeight: '500' }}>{log.name}</td>
                  <td>{log.admin}</td>
                  <td>{log.center}</td>
                  <td>{log.branch}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right', color: 'var(--accent-gold)' }}>{log.action}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{log.created_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WatchtowerList;
