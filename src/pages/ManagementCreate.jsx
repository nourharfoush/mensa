import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import egyptCenters from '../data/egyptCenters';

const specialties = [
  'مدير الإدارة',
  'العضو الإداري قران كريم',
  'عضو علمي قران كريم',
  'العضو الإداري، علوم شرعية وعربية',
  'العضو العلمي، علوم شرعية وعربية',
  'العضو العلمي تجويد وقراءات',
  'العضو التقني'
];

const governorates = Object.keys(egyptCenters);

function ManagementCreate() {
  const { addManager, updateManager, managers, users, addUser, updateUser } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const managerId = searchParams.get('id');
  const isEditing = !!managerId;
  const [form, setForm] = useState({
    name: '', email: '', phone: '', national_id: '', specialty: '',
    record_no: '', job_title: '', workplace: '', job_grade: '',
    qualification: '', decision_no: '', admin: '', address: '', username: '', password: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    if (isEditing && managerId) {
      const managerToEdit = managers.find(m => String(m.id) === String(managerId));
      if (managerToEdit) {
        setForm({
          name: managerToEdit.name || '',
          email: managerToEdit.email || '',
          phone: managerToEdit.phone || '',
          national_id: managerToEdit.national_id || '',
          specialty: managerToEdit.specialty || '',
          record_no: managerToEdit.record_no || '',
          job_title: managerToEdit.job_title || '',
          workplace: managerToEdit.workplace || '',
          job_grade: managerToEdit.job_grade || '',
          qualification: managerToEdit.qualification || '',
          decision_no: managerToEdit.decision_no || '',
          admin: managerToEdit.admin || '',
          address: managerToEdit.address || '',
          username: managerToEdit.username || '',
          password: managerToEdit.password || ''
        });
      }
    }
  }, [isEditing, managerId, managers]);

  const handleSubmit = () => {
    const required = ['name', 'email', 'phone', 'national_id', 'specialty', 'record_no', 'job_title', 'workplace', 'job_grade', 'qualification', 'decision_no', 'admin', 'address'];
    for (const f of required) {
      if (!form[f]) {
        alert(`الرجاء ملء الحقل: ${f}`);
        return;
      }
    }

    const finalForm = {
      ...form,
      username: form.national_id,
      password: form.record_no
    };

    let computedRole = 'rowaq_member';
    if (form.specialty === 'مدير الإدارة') computedRole = 'rowaq_manager';
    else if (form.specialty === 'العضو التقني') computedRole = 'rowaq_tech';

    const existingUser = users.find(u => u.national_id === form.national_id || u.email === form.national_id);
    
    if (isEditing) {
      updateManager(Number(managerId), finalForm);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          email: form.national_id,
          password: form.record_no,
          national_id: form.national_id,
          record_number: form.record_no,
          userAdmin: form.admin || ''
        });
      } else {
        addUser({
          name: form.name,
          email: form.national_id,
          password: form.record_no,
          phone: form.phone,
          role: computedRole,
          national_id: form.national_id,
          record_number: form.record_no,
          userAdmin: form.admin || ''
        });
      }
      alert('تم تحديث المدير بنجاح');
    } else {
      addManager(finalForm);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          role: computedRole,
          email: form.national_id,
          national_id: form.national_id,
          record_number: form.record_no,
          userAdmin: form.admin || ''
        });
      } else {
        addUser({
          name: form.name,
          email: form.national_id,
          password: form.record_no,
          phone: form.phone,
          role: computedRole,
          national_id: form.national_id,
          record_number: form.record_no,
          userAdmin: form.admin || ''
        });
      }
      alert('تم إضافة المدير بنجاح');
    }
    navigate('/management');
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="title-section"><h2>{isEditing ? 'تعديل مدير' : 'إضافة مدير جديد'}</h2></div>
      </div>

      <div className="form-wrapper box-card">
        <div className="form-section">
          <h3 className="section-title">المعلومات الأساسية</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>الاسم <span className="req">*</span></label>
              <input name="name" type="text" className="form-input" placeholder="ادخل الاسم الكامل" onChange={handleChange} value={form.name} />
            </div>
            <div className="form-group">
              <label>البريد الإلكتروني <span className="req">*</span></label>
              <input name="email" type="email" className="form-input" placeholder="ادخل البريد الإلكتروني" onChange={handleChange} value={form.email} />
            </div>
            <div className="form-group">
              <label>رقم الهاتف <span className="req">*</span></label>
              <div className="phone-input-wrapper">
                <div className="country-code">🇪🇬 +20</div>
                <input name="phone" type="text" className="form-input phone-input" onChange={handleChange} value={form.phone} />
              </div>
            </div>
            <div className="form-group">
              <label>الرقم القومي <span className="req">*</span></label>
              <input name="national_id" type="text" className="form-input" placeholder="ادخل الرقم القومي" onChange={handleChange} value={form.national_id} />
            </div>
            <div className="form-group">
              <label>التخصص <span className="req">*</span></label>
              <select name="specialty" className="form-select" onChange={handleChange} value={form.specialty}>
                <option value="">ابحث عن تخصص..</option>
                {specialties.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>رقم السجل <span className="req">*</span></label>
              <input name="record_no" type="text" className="form-input" placeholder="ادخل رقم السجل" onChange={handleChange} value={form.record_no} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">معلومات الوظيفة</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>الوظيفة <span className="req">*</span></label>
              <input name="job_title" type="text" className="form-input" placeholder="ادخل المسمى الوظيفي" onChange={handleChange} value={form.job_title} />
            </div>
            <div className="form-group">
              <label>جهة العمل <span className="req">*</span></label>
              <input name="workplace" type="text" className="form-input" placeholder="ادخل جهة العمل" onChange={handleChange} value={form.workplace} />
            </div>
            <div className="form-group">
              <label>الدرجة الوظيفية <span className="req">*</span></label>
              <input name="job_grade" type="text" className="form-input" placeholder="ادخل الدرجة الوظيفية" onChange={handleChange} value={form.job_grade} />
            </div>
            <div className="form-group">
              <label>المؤهل الدراسي <span className="req">*</span></label>
              <input name="qualification" type="text" className="form-input" placeholder="ادخل المؤهل الدراسي" onChange={handleChange} value={form.qualification} />
            </div>
            <div className="form-group">
              <label>رقم القرار <span className="req">*</span></label>
              <input name="decision_no" type="text" className="form-input" placeholder="ادخل رقم القرار" onChange={handleChange} value={form.decision_no} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">معلومات العنوان</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>الإدارة <span className="req">*</span></label>
              <select name="admin" className="form-select" onChange={handleChange} value={form.admin}>
                <option value="">اختار الإدارة</option>
                {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group full-width">
              <label>العنوان التفصيلي <span className="req">*</span></label>
              <textarea name="address" className="form-input textarea" placeholder="ادخل العنوان التفصيلي" onChange={handleChange} value={form.address}></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSubmit}>حفظ المدير</button>
        <Link to="/management" className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 40px' }}>إلغاء</Link>
      </div>
    </div>
  );
}

export default ManagementCreate;
