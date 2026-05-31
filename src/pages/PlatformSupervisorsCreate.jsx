import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';

function PlatformSupervisorsCreate() {
  const { addPlatformSupervisor, updatePlatformSupervisor, platformSupervisors, users, addUser, updateUser } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get('id');
  const isEditing = !!itemId;
  
  const [form, setForm] = useState({
    name: '', email: '', phone: '', national_id: '', specialization: '', registry_no: '',
    job: '', workplace: '', job_grade: '', qualification: '',
    address: '', username: '', password: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    if (isEditing && itemId) {
      const itemToEdit = platformSupervisors.find(c => String(c.id) === String(itemId));
      if (itemToEdit) {
        setForm({
          name: itemToEdit.name || '', email: itemToEdit.email || '',
          phone: itemToEdit.phone || '', national_id: itemToEdit.national_id || '',
          specialization: itemToEdit.specialization || '', registry_no: itemToEdit.registry_no || '',
          job: itemToEdit.job || '', workplace: itemToEdit.workplace || '',
          job_grade: itemToEdit.job_grade || '', qualification: itemToEdit.qualification || '',
          address: itemToEdit.address || '',
          username: itemToEdit.username || '', password: itemToEdit.password || ''
        });
      }
    }
  }, [isEditing, itemId, platformSupervisors]);

  const handleSubmit = () => {
    if (!form.name || !form.national_id || !form.registry_no) {
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
      updatePlatformSupervisor(itemId, finalForm);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          email: form.national_id,
          password: form.registry_no,
          national_id: form.national_id,
          record_number: form.registry_no
        });
      } else {
        addUser({
          name: form.name,
          email: form.national_id,
          password: form.registry_no,
          phone: form.phone,
          role: 'platform_supervisor',
          national_id: form.national_id,
          record_number: form.registry_no
        });
      }
      alert('تم تحديث المشرف بنجاح');
    } else {
      addPlatformSupervisor(finalForm);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          role: 'platform_supervisor',
          email: form.national_id,
          national_id: form.national_id,
          record_number: form.registry_no
        });
      } else {
        addUser({
          name: form.name,
          email: form.national_id,
          password: form.registry_no,
          phone: form.phone,
          role: 'platform_supervisor',
          national_id: form.national_id,
          record_number: form.registry_no
        });
      }
      alert('تم إضافة المشرف بنجاح');
    }
    navigate('/platform-supervisors');
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>{isEditing ? 'تعديل المشرف' : 'إضافة مشرف جديد'}</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', padding: '10px', fontSize: '18px' }}>المعلومات الأساسية</h3>
        <div className="form-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group"><label>الاسم <span className="req">*</span></label><input name="name" type="text" className="form-input" placeholder="أدخل الاسم الكامل" value={form.name} onChange={handleChange} /></div>
          <div className="form-group"><label>البريد الإلكتروني</label><input name="email" type="email" className="form-input" placeholder="example@email.com" value={form.email} onChange={handleChange} dir="ltr" /></div>
          <div className="form-group"><label>رقم الهاتف</label><input name="phone" type="text" className="form-input" placeholder="أدخل رقم الهاتف" value={form.phone} onChange={handleChange} dir="ltr" /></div>
          <div className="form-group"><label>الرقم القومي <span className="req">*</span></label><input name="national_id" type="text" className="form-input" placeholder="أدخل الرقم القومي" value={form.national_id} onChange={handleChange} /></div>
          <div className="form-group"><label>التخصص</label><select name="specialization" className="form-select" value={form.specialization} onChange={handleChange}><option value="">اختار التخصص</option><option value="إداري">إداري</option><option value="علمي">علمي</option></select></div>
          <div className="form-group"><label>رقم السجل <span className="req">*</span></label><input name="registry_no" type="number" className="form-input" placeholder="أدخل رقم السجل" value={form.registry_no} onChange={handleChange} /></div>
        </div>

        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', padding: '10px', fontSize: '18px' }}>معلومات الوظيفة</h3>
        <div className="form-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group"><label>الوظيفة</label><input name="job" type="text" className="form-input" placeholder="أدخل الوظيفة" value={form.job} onChange={handleChange} /></div>
          <div className="form-group"><label>جهة العمل</label><input name="workplace" type="text" className="form-input" placeholder="أدخل جهة العمل" value={form.workplace} onChange={handleChange} /></div>
          <div className="form-group"><label>الدرجة الوظيفية</label><input name="job_grade" type="text" className="form-input" placeholder="أدخل الدرجة الوظيفية" value={form.job_grade} onChange={handleChange} /></div>
          <div className="form-group"><label>المؤهل</label><input name="qualification" type="text" className="form-input" placeholder="أدخل المؤهل" value={form.qualification} onChange={handleChange} /></div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
           <label>العنوان</label>
           <textarea name="address" className="form-input textarea" placeholder="أدخل العنوان التفصيلي" value={form.address} onChange={handleChange}></textarea>
        </div>
      </div>

      <div className="form-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSubmit}>حفظ</button>
        <Link to="/platform-supervisors" className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 40px' }}>إلغاء</Link>
      </div>
    </div>
  );
}

export default PlatformSupervisorsCreate;
