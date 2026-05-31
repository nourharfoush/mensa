import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';

function RowaqsCreate() {
  const { addRowaq, updateRowaq, rowaqs } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rowaqId = searchParams.get('id');
  const isEditing = !!rowaqId;
  
  const [form, setForm] = useState({
    name: '', memorization_level: '', age_min: '', age_max: '', levels: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    if (isEditing && rowaqId) {
      const rowaqToEdit = rowaqs.find(r => String(r.id) === String(rowaqId));
      if (rowaqToEdit) {
        setForm({
          name: rowaqToEdit.name || '',
          memorization_level: rowaqToEdit.memorization_level || '',
          age_min: rowaqToEdit.age_min || '',
          age_max: rowaqToEdit.age_max || '',
          levels: rowaqToEdit.levels || ''
        });
      }
    }
  }, [isEditing, rowaqId, rowaqs]);

  const handleSubmit = () => {
    if (!form.name || !form.memorization_level || !form.levels) {
      alert('الرجاء ملء الحقول الإجبارية');
      return;
    }
    
    if (isEditing) {
      updateRowaq(rowaqId, form);
      alert('تم تحديث الرواق بنجاح');
    } else {
      addRowaq(form);
      alert('تم إضافة الرواق بنجاح');
    }
    navigate('/riwaqs');
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>{isEditing ? 'تعديل الرواق' : 'إضافة رواق جديد'}</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>الاسم <span className="req">*</span></label>
          <input name="name" type="text" className="form-input" placeholder="اسم الرواق" value={form.name} onChange={handleChange} />
        </div>

        <div className="form-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group">
            <label>مستوى الحفظ <span className="req">*</span></label>
            <select name="memorization_level" className="form-select" value={form.memorization_level} onChange={handleChange}>
              <option value="">اختار مستوى الحفظ</option>
              <option value="الكل">الكل</option>
              <option value="تحديد السورة">تحديد السورة</option>
            </select>
          </div>
          <div className="form-group">
            <label>عدد المستويات <span className="req">*</span></label>
            <input name="levels" type="number" className="form-input" placeholder="أدخل عدد المستويات" value={form.levels} onChange={handleChange} />
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group">
            <label>الحد الأدنى للعمر (اختياري)</label>
            <input name="age_min" type="number" className="form-input" placeholder="مثال: 5" value={form.age_min} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>الحد الأقصى للعمر (اختياري)</label>
            <input name="age_max" type="number" className="form-input" placeholder="مثال: 22" value={form.age_max} onChange={handleChange} />
          </div>
        </div>

      </div>

      <div className="form-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSubmit}>حفظ</button>
        <Link to="/riwaqs" className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 40px' }}>إلغاء</Link>
      </div>
    </div>
  );
}

export default RowaqsCreate;
