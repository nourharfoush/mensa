import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);

function CoordinatorsCreate() {
  const { addCoordinator, updateCoordinator, branches, coordinators, users, addUser, updateUser } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const coordinatorId = searchParams.get('id');
  const isEditing = !!coordinatorId;
  
  const [form, setForm] = useState({
    name: '', email: '', phone: '', national_id: '', specialization: '', registry_no: '',
    job: '', workplace: '', job_grade: '', qualification: '', decision_no: '',
    admin: '', center: '', branch: '', address: '', username: '', password: ''
  });

  const availableCenters = form.admin ? (egyptCenters[form.admin] || []) : [];
  const availableBranches = branches.filter(b => {
    const normalize = (val) => (val || '').toString().trim().replace(/ة/g, 'ه').replace(/أ|إ|آ/g, 'ا');
    return normalize(b.admin) === normalize(form.admin) && normalize(b.center) === normalize(form.center);
  });

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setForm({ ...form, phone: value.replace(/\D/g, '').slice(0, 11) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAdminChange = e => setForm({ ...form, admin: e.target.value, center: '', branch: '' });
  const handleCenterChange = e => setForm({ ...form, center: e.target.value, branch: '' });

  // Load coordinator data for editing
  useEffect(() => {
    if (isEditing && coordinatorId) {
      const coordinatorToEdit = coordinators.find(c => String(c.id) === String(coordinatorId));
      if (coordinatorToEdit) {
        setForm({
          name: coordinatorToEdit.name || '',
          email: coordinatorToEdit.email || '',
          phone: coordinatorToEdit.phone || '',
          national_id: coordinatorToEdit.national_id || '',
          specialization: coordinatorToEdit.specialization || '',
          registry_no: coordinatorToEdit.registry_no || '',
          job: coordinatorToEdit.job || '',
          workplace: coordinatorToEdit.workplace || '',
          job_grade: coordinatorToEdit.job_grade || '',
          qualification: coordinatorToEdit.qualification || '',
          decision_no: coordinatorToEdit.decision_no || '',
          admin: coordinatorToEdit.admin || '',
          center: coordinatorToEdit.center || '',
          branch: coordinatorToEdit.branch || '',
          address: coordinatorToEdit.address || '',
          username: coordinatorToEdit.username || '',
          password: coordinatorToEdit.password || ''
        });
      }
    } else {
      const paramAdmin = searchParams.get('admin') || '';
      const paramCenter = searchParams.get('center') || '';
      const paramBranch = searchParams.get('branch') || '';
      if (paramAdmin || paramCenter || paramBranch) {
        setForm(f => ({
          ...f,
          admin: paramAdmin,
          center: paramCenter,
          branch: paramBranch
        }));
      }
    }
  }, [isEditing, coordinatorId, coordinators, searchParams]);

  const handleSubmit = () => {
    if (form.phone && form.phone.length !== 11) {
      alert('رقم الهاتف يجب أن يكون مكوناً من 11 رقماً');
      return;
    }

    if (!form.name || !form.admin || !form.center || !form.national_id || !form.registry_no) {
      alert('الرجاء ملء الحقول المطلوبة');
      return;
    }

    // Check duplicate national ID
    const duplicateCoordinator = coordinators.find(c => 
      String(c.national_id).trim() === String(form.national_id).trim() && 
      (!isEditing || String(c.id) !== String(coordinatorId))
    );
    if (duplicateCoordinator) {
      alert('خطأ: الرقم القومي مسجل بالفعل لمنسق آخر.');
      return;
    }

    const finalForm = {
      ...form,
      username: form.national_id,
      password: form.registry_no
    };
    
    const computedRole = form.specialization === 'إداري' ? 'branch_admin_coordinator' : 'branch_scientific_coordinator';
    const existingUser = users.find(u => u.national_id === form.national_id || u.email === form.national_id);
    
    if (isEditing) {
      updateCoordinator(String(coordinatorId), finalForm);
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
          role: computedRole,
          national_id: form.national_id,
          record_number: form.registry_no,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || ''
        });
      }
      alert('تم تحديث المنسق بنجاح');
    } else {
      addCoordinator(finalForm);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          role: computedRole,
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
          role: computedRole,
          national_id: form.national_id,
          record_number: form.registry_no,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || ''
        });
      }
      alert('تم إضافة المنسق بنجاح');
    }
    const redirectPath = searchParams.get('redirect');
    if (redirectPath) {
      navigate(redirectPath);
    } else {
      navigate('/coordinators');
    }
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>{isEditing ? 'تعديل المنسق' : 'إضافة منسق جديد'}</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>المعلومات الأساسية</h3>
        
        <div className="form-grid" style={{ marginBottom: '30px' }}>
          <div className="form-group">
            <label>الاسم <span className="req">*</span></label>
            <input name="name" type="text" className="form-input" placeholder="أدخل الاسم الكامل" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>البريد الإلكتروني <span className="req">*</span></label>
            <input name="email" type="email" className="form-input" placeholder="example@email.com" value={form.email} onChange={handleChange} dir="ltr" />
          </div>
          
          <div className="form-group">
            <label>رقم الهاتف <span className="req">*</span></label>
            <div style={{ display: 'flex' }}>
               <span style={{ padding: '0 10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderLeft: 'none', borderRadius: '0 6px 6px 0', display: 'flex', alignItems: 'center', direction: 'ltr' }}>+20 <img src="https://flagcdn.com/w20/eg.png" alt="Egypt" style={{ marginLeft: '5px' }}/></span>
               <input name="phone" type="text" className="form-input" placeholder="أدخل رقم الهاتف" value={form.phone} onChange={handleChange} style={{ borderRadius: '6px 0 0 6px', flex: 1 }} dir="ltr" maxLength="11" />
            </div>
          </div>
          <div className="form-group">
            <label>الرقم القومي <span className="req">*</span></label>
            <input name="national_id" type="text" className="form-input" placeholder="أدخل الرقم القومي" value={form.national_id} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>التخصص <span className="req">*</span></label>
            <select name="specialization" className="form-select" value={form.specialization} onChange={handleChange}>
              <option value="">اختار التخصص</option>
              <option value="إداري">إداري</option>
              <option value="علمي">علمي</option>
            </select>
          </div>
          <div className="form-group">
            <label>رقم السجل <span className="req">*</span></label>
            <input name="registry_no" type="number" className="form-input" placeholder="أدخل رقم السجل" value={form.registry_no} onChange={handleChange} />
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
            <label>رقم القرار <span className="req">*</span></label>
            <input name="decision_no" type="text" className="form-input" placeholder="أدخل رقم القرار" value={form.decision_no} onChange={handleChange} />
          </div>
        </div>

        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>معلومات الموقع</h3>

        <div className="form-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="form-group">
            <label>إدارة <span className="req">*</span></label>
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
        </div>
        <div className="form-group" style={{ marginBottom: '20px' }}>
           <label>العنوان <span className="req">*</span></label>
           <textarea name="address" className="form-input textarea" placeholder="أدخل العنوان التفصيلي" value={form.address} onChange={handleChange}></textarea>
        </div>

      </div>

      <div className="form-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSubmit}>حفظ المنسق</button>
        <Link to={searchParams.get('redirect') || "/coordinators"} className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 40px' }}>إلغاء</Link>
      </div>

    </div>
  );
}

export default CoordinatorsCreate;
