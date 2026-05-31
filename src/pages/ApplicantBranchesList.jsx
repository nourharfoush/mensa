import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);

function ApplicantBranchesList() {
  const { applicantBranches, deleteApplicantBranch, branches, rowaqs } = useAppData();
  
  const [filterAdmin, setFilterAdmin] = useState('');
  const [filterCenter, setFilterCenter] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterRowaq, setFilterRowaq] = useState('');

  const availableCenters = filterAdmin ? (egyptCenters[filterAdmin] || []) : [];
  const availableBranches = branches.filter(b => b.admin === filterAdmin && b.center === filterCenter);

  const filtered = applicantBranches.filter(b =>
    (filterAdmin ? b.admin === filterAdmin : true) &&
    (filterCenter ? b.center === filterCenter : true) &&
    (filterBranch ? b.branch === filterBranch : true) &&
    (filterRowaq ? b.rowaq === filterRowaq : true)
  );

  return (
    <div className="management-page">
      <div className="page-header">
        <div className="title-section">
          <h2>إدارة فروع طلبات التقديم</h2>
          <p>عرض وتعديل فروع طلبات التقديم</p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '15px' }}>
          <div className="form-group">
            <label>الإدارة</label>
            <select className="form-select" value={filterAdmin} onChange={e => { setFilterAdmin(e.target.value); setFilterCenter(''); setFilterBranch(''); }}>
              <option value="">--- اختار الإدارة ---</option>
              {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>المركز</label>
            <select className="form-select" value={filterCenter} onChange={e => { setFilterCenter(e.target.value); setFilterBranch(''); }} disabled={!filterAdmin}>
              <option value="">{filterAdmin ? '--- اختار المركز ---' : 'اختار الإدارة أولاً'}</option>
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
          <div className="form-group">
            <label>الرواق</label>
            <select className="form-select" value={filterRowaq} onChange={e => setFilterRowaq(e.target.value)}>
              <option value="">--- اختار الرواق ---</option>
              {rowaqs.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
        </div>
        <div className="search-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-outline" onClick={() => { 
            setFilterAdmin(''); setFilterCenter(''); setFilterBranch(''); setFilterRowaq(''); 
          }}>إعادة تعيين</button>
          <button className="btn btn-primary" style={{ marginRight: '10px' }}><Search size={16} /> بحث</button>
        </div>
      </div>

      {/* Table controls */}
      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          <Link to="/applicant-branches/create" className="btn btn-primary" style={{ textDecoration: 'none', background: 'var(--accent-gold)', color: 'var(--bg-black)' }}>
            <Plus size={16} /> إضافة
          </Link>
        </div>
        <div className="table-stats">النتائج ({filtered.length})</div>
      </div>

      <div className="table-wrapper box-card">
        <table className="management-table">
          <thead>
            <tr>
              <th>الإدارة</th>
              <th>المنطقة</th>
              <th>الفرع</th>
              <th>الرواق</th>
              <th>الحد الأقصى</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد فروع مسجلة.
                </td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id}>
                  <td>{b.admin}</td>
                  <td>{b.center}</td>
                  <td>{b.branch}</td>
                  <td>{b.rowaq}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{b.max_limit}</td>
                  <td className="actions-cell">
                    <Link to={`/applicant-branches/create?id=${b.id}`} className="action-icon edit" style={{textDecoration: 'none', color: 'inherit'}}><Edit size={16}/></Link>
                    <button className="action-icon delete" onClick={() => deleteApplicantBranch(b.id)}><Trash2 size={16}/></button>
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

export default ApplicantBranchesList;
