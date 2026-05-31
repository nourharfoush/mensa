import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);
const parts = Array.from({ length: 30 }, (_, i) => `الجزء ${i + 1}`);

function ApplicantsCreate() {
  const { addApplicant, updateApplicant, branches, applicants, users, addUser, updateUser } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicantId = searchParams.get('id');
  const isEditing = !!applicantId;
  
  const [form, setForm] = useState({
    name: '', national_id: '', birth_date: '', phone: '', gender: '', address: '',
    admin: '', center: '', branch: '', rowaq: '', memorization_from: '', memorization_to: '', status: 'قيد المراجعة', username: '', password: ''
  });

  const availableCenters = form.admin ? (egyptCenters[form.admin] || []) : [];
  const availableBranches = branches.filter(b => b.admin === form.admin && b.center === form.center);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAdminChange = e => setForm({ ...form, admin: e.target.value, center: '', branch: '' });
  const handleCenterChange = e => setForm({ ...form, center: e.target.value, branch: '' });

  useEffect(() => {
    if (isEditing && applicantId) {
      const applicantToEdit = applicants.find(a => String(a.id) === String(applicantId));
      if (applicantToEdit) {
        setForm({
          name: applicantToEdit.name || '',
          national_id: applicantToEdit.national_id || '',
          birth_date: applicantToEdit.birth_date || '',
          phone: applicantToEdit.phone || '',
          gender: applicantToEdit.gender || '',
          address: applicantToEdit.address || '',
          admin: applicantToEdit.admin || '',
          center: applicantToEdit.center || '',
          branch: applicantToEdit.branch || '',
          rowaq: applicantToEdit.rowaq || '',
          memorization_from: applicantToEdit.memorization_from || '',
          memorization_to: applicantToEdit.memorization_to || '',
          status: applicantToEdit.status || 'قيد المراجعة',
          username: applicantToEdit.username || '',
          password: applicantToEdit.password || ''
        });
      }
    }
  }, [isEditing, applicantId, applicants]);

  const handleSubmit = () => {
    if (!form.name || !form.national_id || !form.phone || !form.admin || !form.branch || !form.rowaq) {
      alert('الرجاء ملء الحقول المطلوبة');
      return;
    }

    const finalForm = {
      ...form,
      username: form.national_id,
      password: form.national_id
    };
    
    const existingUser = users.find(u => u.national_id === form.national_id || u.email === form.national_id);

    if (isEditing) {
      updateApplicant(applicantId, finalForm);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          email: form.national_id,
          password: form.national_id,
          national_id: form.national_id,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || ''
        });
      } else {
        addUser({
          name: form.name,
          email: form.national_id,
          password: form.national_id,
          phone: form.phone,
          role: 'student',
          national_id: form.national_id,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || ''
        });
      }
      alert('تم تحديث الطلب بنجاح');
    } else {
      addApplicant(finalForm);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          role: 'student',
          email: form.national_id,
          national_id: form.national_id,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || ''
        });
      } else {
        addUser({
          name: form.name,
          email: form.national_id,
          password: form.national_id,
          phone: form.phone,
          role: 'student',
          national_id: form.national_id,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || ''
        });
      }
      alert('تم إضافة الطلب بنجاح');
    }
    navigate('/applicants');
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>{isEditing ? 'تعديل طلب التحاق' : 'إضافة طلب التحاق جديد'}</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>المعلومات الشخصية</h3>
        
        <div className="form-grid" style={{ marginBottom: '30px' }}>
          <div className="form-group">
            <label>الاسم الكامل <span className="req">*</span></label>
            <input name="name" type="text" className="form-input" placeholder="أدخل الاسم الكامل" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>الرقم القومي <span className="req">*</span></label>
            <input name="national_id" type="text" className="form-input" placeholder="أدخل الرقم القومي" value={form.national_id} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>رقم الهاتف <span className="req">*</span></label>
            <div style={{ display: 'flex' }}>
               <span style={{ padding: '0 10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderLeft: 'none', borderRadius: '0 6px 6px 0', display: 'flex', alignItems: 'center', direction: 'ltr' }}>+20 <img src="https://flagcdn.com/w20/eg.png" alt="Egypt" style={{ marginLeft: '5px' }}/></span>
               <input name="phone" type="text" className="form-input" placeholder="أدخل رقم الهاتف" value={form.phone} onChange={handleChange} style={{ borderRadius: '6px 0 0 6px', flex: 1 }} dir="ltr" />
            </div>
          </div>
          <div className="form-group">
            <label>اختر التاريخ <span className="req">*</span></label>
            <input name="birth_date" type="date" className="form-input" value={form.birth_date} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>الجنس <span className="req">*</span></label>
            <select name="gender" className="form-select" value={form.gender} onChange={handleChange}>
              <option value="">اختار الجنس</option>
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '30px' }}>
           <label>العنوان <span className="req">*</span></label>
           <textarea name="address" className="form-input textarea" placeholder="أدخل العنوان التفصيلي" value={form.address} onChange={handleChange}></textarea>
        </div>

        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>معلومات الالتحاق</h3>

        <div className="form-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="form-group">
            <label>الإدارة <span className="req">*</span></label>
            <select name="admin" className="form-select" value={form.admin} onChange={handleAdminChange}>
              <option value="">اختار إدارة</option>
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
          <div className="form-group">
            <label>الرواق <span className="req">*</span></label>
            <select name="rowaq" className="form-select" value={form.rowaq} onChange={handleChange}>
              <option value="">اختار الرواق</option>
              <option value="رواق القرآن الكريم (أطفال)">رواق القرآن الكريم (أطفال)</option>
              <option value="رواق القرآن الكريم (كبار)">رواق القرآن الكريم (كبار)</option>
              <option value="رواق التجويد">رواق التجويد</option>
              <option value="رواق القراءات">رواق القراءات</option>
            </select>
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="form-group">
            <label>مقدار الحفظ (من) <span className="req">*</span></label>
            <select name="memorization_from" className="form-select" value={form.memorization_from} onChange={handleChange}>
              <option value="">اختار الجزء</option>
              {parts.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>مقدار الحفظ (إلى) <span className="req">*</span></label>
            <select name="memorization_to" className="form-select" value={form.memorization_to} onChange={handleChange}>
              <option value="">اختار الجزء</option>
              {parts.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الحالة <span className="req">*</span></label>
            <select name="status" className="form-select" value={form.status} onChange={handleChange}>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="مقبول">مقبول</option>
              <option value="مرفوض">مرفوض</option>
            </select>
          </div>
        </div>

      </div>

      <div className="form-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSubmit}>حفظ</button>
        <Link to="/applicants" className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 40px' }}>إلغاء</Link>
      </div>
    </div>
  );
}

export default ApplicantsCreate;
