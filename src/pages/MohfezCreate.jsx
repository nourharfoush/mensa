import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);

function MohfezCreate() {
  const { addMohfez, updateMohfez, branches, mohfezs, users, addUser, updateUser } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mohfezId = searchParams.get('id');
  const isEditing = !!mohfezId;
  
  const [form, setForm] = useState({
    name: '', email: '', phone: '', national_id: '', registry_no: '',
    job: '', workplace: '', job_grade: '', qualification: '', contest_date: '', status: '', address: '',
    admin: '', center: '', branch: '', rowaq: '', username: '', password: ''
  });

  const availableCenters = form.admin ? (egyptCenters[form.admin] || []) : [];
  const availableBranches = branches.filter(b => b.admin === form.admin && b.center === form.center);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdminChange = e => setForm({ ...form, admin: e.target.value, center: '', branch: '' });
  const handleCenterChange = e => setForm({ ...form, center: e.target.value, branch: '' });

  // Load mohfez data for editing
  useEffect(() => {
    if (isEditing && mohfezId) {
      const mohfezToEdit = mohfezs.find(m => String(m.id) === String(mohfezId));
      if (mohfezToEdit) {
        setForm({
          name: mohfezToEdit.name || '',
          email: mohfezToEdit.email || '',
          phone: mohfezToEdit.phone || '',
          national_id: mohfezToEdit.national_id || '',
          registry_no: mohfezToEdit.registry_no || '',
          job: mohfezToEdit.job || '',
          workplace: mohfezToEdit.workplace || '',
          job_grade: mohfezToEdit.job_grade || '',
          qualification: mohfezToEdit.qualification || '',
          contest_date: mohfezToEdit.contest_date || '',
          status: mohfezToEdit.status || '',
          address: mohfezToEdit.address || '',
          admin: mohfezToEdit.admin || '',
          center: mohfezToEdit.center || '',
          branch: mohfezToEdit.branch || '',
          rowaq: mohfezToEdit.rowaq || '',
          username: mohfezToEdit.username || '',
          password: mohfezToEdit.password || ''
        });
      }
    }
  }, [isEditing, mohfezId, mohfezs]);

  const handleSubmit = () => {
    if (!form.name || !form.admin || !form.center || !form.national_id || !form.registry_no) {
      alert('الرجاء ملء الحقول المطلوبة');
      return;
    }

    const finalForm = {
      ...form,
      username: form.national_id,
      password: form.registry_no
    };

    const existingUser = users.find(u => u.national_id === form.national_id || u.email === form.national_id);
    
    if (isEditing) {
      updateMohfez(String(mohfezId), finalForm);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          email: form.national_id,
          password: form.registry_no,
          national_id: form.national_id,
          record_number: form.registry_no,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || ''
        });
      } else {
        addUser({
          name: form.name,
          email: form.national_id,
          password: form.registry_no,
          phone: form.phone,
          role: 'mohfez',
          national_id: form.national_id,
          record_number: form.registry_no,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || ''
        });
      }
      alert('تم تحديث المحفظ بنجاح');
    } else {
      addMohfez(finalForm);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          role: 'mohfez',
          email: form.national_id,
          national_id: form.national_id,
          record_number: form.registry_no,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || ''
        });
      } else {
        addUser({
          name: form.name,
          email: form.national_id,
          password: form.registry_no,
          phone: form.phone,
          role: 'mohfez',
          national_id: form.national_id,
          record_number: form.registry_no,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || ''
        });
      }
      alert('تم إضافة المحفظ بنجاح');
    }
    navigate('/mohfez');
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>{isEditing ? 'تعديل المحفظ' : 'إضافة محفظ جديد'}</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>المعلومات الأساسية</h3>
        
        <div className="form-grid" style={{ marginBottom: '30px' }}>
          <div className="form-group">
            <label>الاسم <span className="req">*</span></label>
            <input name="name" type="text" className="form-input" placeholder="أدخل الاسم الكامل" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input name="email" type="email" className="form-input" placeholder="example@email.com" value={form.email} onChange={handleChange} dir="ltr" />
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
            <label>رقم السجل <span className="req">*</span></label>
            <input name="registry_no" type="text" className="form-input" placeholder="أدخل رقم السجل" value={form.registry_no} onChange={handleChange} />
          </div>
        </div>

        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>معلومات الوظيفة</h3>
        
        <div className="form-grid" style={{ marginBottom: '30px' }}>
          <div className="form-group">
            <label>الوظيفة <span className="req">*</span></label>
            <input name="job" type="text" className="form-input" placeholder="أدخل الوظيفة" value={form.job} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>جهة العمل <span className="req">*</span></label>
            <input name="workplace" type="text" className="form-input" placeholder="أدخل جهة العمل" value={form.workplace} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>الدرجة الوظيفية <span className="req">*</span></label>
            <input name="job_grade" type="text" className="form-input" placeholder="أدخل الدرجة الوظيفية" value={form.job_grade} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>المؤهل <span className="req">*</span></label>
            <input name="qualification" type="text" className="form-input" placeholder="أدخل المؤهل" value={form.qualification} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>تاريخ المسابقة <span className="req">*</span></label>
            <input name="contest_date" type="date" className="form-input" value={form.contest_date} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>الحالة <span className="req">*</span></label>
            <select name="status" className="form-select" value={form.status} onChange={handleChange}>
              <option value="">اختار الحالة</option>
              <option value="مسّكن">مسّكن</option>
              <option value="اجازة">اجازة</option>
              <option value="اُخرى">اُخرى</option>
              <option value="معتذر">معتذر</option>
              <option value="انتظار">انتظار</option>
              <option value="مستبعد">مستبعد</option>
              <option value="موقوف">موقوف</option>
            </select>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: '30px' }}>
           <label>العنوان <span className="req">*</span></label>
           <textarea name="address" className="form-input textarea" placeholder="أدخل العنوان التفصيلي" value={form.address} onChange={handleChange}></textarea>
        </div>

        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>معلومات الرواق والفرع</h3>

        <div className="form-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
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

      </div>

      <div className="form-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSubmit}>حفظ</button>
        <Link to="/mohfez" className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 40px' }}>إلغاء</Link>
      </div>
    </div>
  );
}

export default MohfezCreate;
