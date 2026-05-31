import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);

function ApplicantBranchesCreate() {
  const { addApplicantBranch, updateApplicantBranch, branches, rowaqs, applicantBranches } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicantBranchId = searchParams.get('id');
  const isEditing = !!applicantBranchId;
  
  const [form, setForm] = useState({
    admin: '', center: '', branch: '', rowaq: '', max_limit: ''
  });

  const availableCenters = form.admin ? (egyptCenters[form.admin] || []) : [];
  const availableBranches = branches.filter(b => b.admin === form.admin && b.center === form.center);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAdminChange = e => setForm({ ...form, admin: e.target.value, center: '', branch: '' });
  const handleCenterChange = e => setForm({ ...form, center: e.target.value, branch: '' });

  useEffect(() => {
    if (isEditing && applicantBranchId) {
      const itemToEdit = applicantBranches.find(b => String(b.id) === String(applicantBranchId));
      if (itemToEdit) {
        setForm({
          admin: itemToEdit.admin || '',
          center: itemToEdit.center || '',
          branch: itemToEdit.branch || '',
          rowaq: itemToEdit.rowaq || '',
          max_limit: itemToEdit.max_limit || ''
        });
      }
    }
  }, [isEditing, applicantBranchId, applicantBranches]);

  const handleSubmit = () => {
    if (!form.admin || !form.center || !form.branch || !form.rowaq || !form.max_limit) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    
    const data = {
      ...form,
      max_limit: parseInt(form.max_limit, 10)
    };
    
    if (isEditing) {
      updateApplicantBranch(applicantBranchId, data);
      alert('تم تحديث البيانات بنجاح');
    } else {
      addApplicantBranch(data);
      alert('تم إضافة البيانات بنجاح');
    }
    navigate('/applicant-branches');
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>{isEditing ? 'تعديل حد أقصى للمتقدمين' : 'إضافة حد أقصى للمتقدمين'}</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="form-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="form-group">
            <label>الإدارة <span className="req">*</span></label>
            <select name="admin" className="form-select" value={form.admin} onChange={handleAdminChange}>
              <option value="">اختار الإدارة</option>
              {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>المركز <span className="req">*</span></label>
            <select name="center" className="form-select" value={form.center} onChange={handleCenterChange} disabled={!form.admin}>
              <option value="">{form.admin ? 'اختار المركز' : 'اختار إدارة أولاً'}</option>
              {availableCenters.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الفرع <span className="req">*</span></label>
            <select name="branch" className="form-select" value={form.branch} onChange={handleChange} disabled={!form.center}>
              <option value="">{form.center ? 'اختار الفرع' : 'اختار المركز أولاً'}</option>
              {availableBranches.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group">
            <label>الرواق <span className="req">*</span></label>
            <select name="rowaq" className="form-select" value={form.rowaq} onChange={handleChange}>
              <option value="">اختار الرواق</option>
              {rowaqs.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div className="form-group">
             <label>الحد الأقصى للمتقدمين <span className="req">*</span></label>
             <input name="max_limit" type="number" className="form-input" placeholder="الحد الأقصى للمتقدمين" value={form.max_limit} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="form-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSubmit}>حفظ</button>
        <Link to="/applicant-branches" className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 40px' }}>إلغاء</Link>
      </div>
    </div>
  );
}

export default ApplicantBranchesCreate;
