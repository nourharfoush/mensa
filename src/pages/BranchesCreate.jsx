import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import egyptCenters from '../data/egyptCenters';
import TimePicker from '../components/TimePicker';

const governorates = Object.keys(egyptCenters);
const workDaysList = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

function BranchesCreate() {
  const { addBranch, updateBranch, branches } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get('id');
  const isEditing = !!branchId;
  
  const [form, setForm] = useState({
    admin: '', center: '', name: '',
    timeFrom: '', timeTo: '',
    address: '', phone: '', decision_no: '',
    workDays: [],
  });

  const availableCenters = form.admin ? (egyptCenters[form.admin] || []) : [];

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setForm({ ...form, phone: value.replace(/\D/g, '').slice(0, 11) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAdminChange = e => setForm({ ...form, admin: e.target.value, center: '' });

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }));
  };

  // Load branch data for editing
  useEffect(() => {
    if (isEditing && branchId) {
      const branchToEdit = branches.find(b => String(b.id) === String(branchId));
      if (branchToEdit) {
        setForm({
          admin: branchToEdit.admin || '',
          center: branchToEdit.center || '',
          name: branchToEdit.name || '',
          timeFrom: branchToEdit.timeFrom || '',
          timeTo: branchToEdit.timeTo || '',
          address: branchToEdit.address || '',
          phone: branchToEdit.phone || '',
          decision_no: branchToEdit.decision_no || '',
          workDays: branchToEdit.workDays || [],
        });
      }
    }
  }, [isEditing, branchId, branches]);

  const handleSubmit = () => {
    if (form.phone && form.phone.length !== 11) {
      alert('رقم الهاتف يجب أن يكون مكوناً من 11 رقماً');
      return;
    }

    if (!form.admin || !form.center || !form.name) {
      alert('الرجاء ملء الحقول المطلوبة: الإدارة، القسم، الاسم');
      return;
    }
    
    if (isEditing) {
      updateBranch(String(branchId), form);
      alert('تم تحديث الفرع بنجاح');
    } else {
      addBranch(form);
      alert('تم إضافة الفرع بنجاح');
    }
    navigate('/branches');
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>{isEditing ? 'تعديل الفرع' : 'إضافة فرع جديد'}</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Admin */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>الإدارة <span className="req">*</span></label>
          <select name="admin" className="form-select" value={form.admin} onChange={handleAdminChange}>
            <option value="">اختار الإدارة</option>
            {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Center */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>القسم <span className="req">*</span></label>
          <select name="center" className="form-select" value={form.center} onChange={handleChange} disabled={!form.admin}>
            <option value="">{form.admin ? 'اختار المركز' : 'اختار الإدارة أولاً'}</option>
            {availableCenters.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Name */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>الاسم <span className="req">*</span></label>
          <input name="name" type="text" className="form-input" placeholder="ادخل اسم الفرع" value={form.name} onChange={handleChange} />
        </div>

        {/* Work Days */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>أيام العمل <span className="req">*</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            {workDaysList.map(day => (
              <label key={day} style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                background: form.workDays.includes(day) ? 'rgba(212,175,55,0.15)' : 'var(--bg-card)',
                border: `1px solid ${form.workDays.includes(day) ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                padding: '6px 12px', borderRadius: '6px', transition: 'all 0.2s'
              }}>
                <input type="checkbox" checked={form.workDays.includes(day)} onChange={() => toggleDay(day)} style={{ display: 'none' }} />
                {day}
              </label>
            ))}
          </div>
        </div>

        {/* Time From / To */}
        <div className="form-grid" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label>من <span className="req">*</span></label>
            <TimePicker name="timeFrom" value={form.timeFrom} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>إلى <span className="req">*</span></label>
            <TimePicker name="timeTo" value={form.timeTo} onChange={handleChange} />
          </div>
        </div>

        {/* Address */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>العنوان <span className="req">*</span></label>
          <textarea name="address" className="form-input textarea" placeholder="ادخل عنوان الفرع" value={form.address} onChange={handleChange}></textarea>
        </div>

        {/* Phone */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>الهاتف <span className="req">*</span></label>
          <input name="phone" type="text" className="form-input" placeholder="ادخل رقم الهاتف" value={form.phone} onChange={handleChange} maxLength="11" />
        </div>

        {/* Decision No */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>رقم القرار <span className="req">*</span></label>
          <input name="decision_no" type="text" className="form-input" placeholder="ادخل رقم القرار" value={form.decision_no} onChange={handleChange} />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSubmit}>{isEditing ? 'تحديث' : 'حفظة'} الفرع</button>
        <Link to="/branches" className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 40px' }}>إلغاء</Link>
      </div>
    </div>
  );
}

export default BranchesCreate;
