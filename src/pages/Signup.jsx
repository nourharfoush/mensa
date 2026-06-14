import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, X } from 'lucide-react';
import './Auth.css';

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    arabicName: '',
    password: '',
    confirmPassword: '',
    branch: '',
    terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'الاسم بالإنجليزية مطلوب';
    }
    
    if (!formData.arabicName.trim()) {
      errors.arabicName = 'الاسم بالعربية مطلوب';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'رقم الهاتف مطلوب';
    } else if (formData.phone.trim().length !== 11) {
      errors.phone = 'رقم الهاتف يجب أن يكون مكوناً من 11 رقماً';
    }
    
    if (!formData.branch) {
      errors.branch = 'اختيار الفرع مطلوب';
    }
    
    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'كلمات المرور غير متطابقة';
    }
    
    if (!formData.terms) {
      errors.terms = 'يجب الموافقة على الشروط والأحكام';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setLoading(true);

    try {
      // محاكاة API call
      setTimeout(() => {
        console.log('Signup:', formData);
        setLoading(false);
        navigate('/login');
      }, 1000);
    } catch {
      setError('فشل إنشاء الحساب');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      
      <div className="auth-content">
        <div className="auth-card signup-card">
          <div className="auth-header">
            <h1>منصة الجامع الأزهر</h1>
            <p>إنشاء حساب جديد</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="أدخل الاسم بالإنجليزية"
                  className={validationErrors.name ? 'error-input' : ''}
                />
                {validationErrors.name && (
                  <div className="field-error">
                    <X size={14} />
                    {validationErrors.name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="arabicName">الاسم بالعربية</label>
                <input
                  type="text"
                  id="arabicName"
                  name="arabicName"
                  value={formData.arabicName}
                  onChange={handleChange}
                  placeholder="أدخل الاسم بالعربية"
                  className={validationErrors.arabicName ? 'error-input' : ''}
                />
                {validationErrors.arabicName && (
                  <div className="field-error">
                    <X size={14} />
                    {validationErrors.arabicName}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="أدخل البريد الإلكتروني"
                  className={validationErrors.email ? 'error-input' : ''}
                />
                {validationErrors.email && (
                  <div className="field-error">
                    <X size={14} />
                    {validationErrors.email}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">رقم الهاتف</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  maxLength={11}
                  onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="أدخل رقم الهاتف (11 رقم)"
                  className={validationErrors.phone ? 'error-input' : ''}
                />
                {validationErrors.phone && (
                  <div className="field-error">
                    <X size={14} />
                    {validationErrors.phone}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="branch">اختر الفرع</label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className={validationErrors.branch ? 'error-input' : ''}
              >
                <option value="">-- اختر الفرع --</option>
                <option value="cairo">القاهرة</option>
                <option value="giza">الجيزة</option>
                <option value="alexandria">الإسكندرية</option>
                <option value="mansoura">المنصورة</option>
                <option value="tanta">طنطا</option>
              </select>
              {validationErrors.branch && (
                <div className="field-error">
                  <X size={14} />
                  {validationErrors.branch}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">كلمة المرور</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="أدخل كلمة المرور"
                    className={validationErrors.password ? 'error-input' : ''}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {validationErrors.password && (
                  <div className="field-error">
                    <X size={14} />
                    {validationErrors.password}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="أعد إدخال كلمة المرور"
                    className={validationErrors.confirmPassword ? 'error-input' : ''}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <div className="field-error">
                    <X size={14} />
                    {validationErrors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
              <label htmlFor="terms">
                أوافق على <Link to="#">الشروط والأحكام</Link> والسياسة الخصوصية
              </label>
              {validationErrors.terms && (
                <div className="field-error" style={{ marginLeft: '30px' }}>
                  {validationErrors.terms}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </form>

          <div className="auth-footer">
            <span>هل لديك حساب بالفعل؟</span>
            <Link to="/login">تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
