import React from 'react';
import { User, Shield, Lock, CheckCircle, Clock } from 'lucide-react';
import '../components/Management.css';

function Profile() {
  const profileData = {
    name: 'انور حسن حرفوش',
    email: 'harfoush@gmail.com',
    phone: '01064620018',
    role: 'أدمن',
    joinedSinceText: 'عضو منذ منذ شهران',
    registerDate: '27 يناير 2024'
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px', flexDirection: 'row-reverse', display: 'flex', justifyContent: 'flex-start' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', gap: '8px', flexDirection: 'row-reverse' }}>
          <span>الرئيسية</span>
          <span>&lt;</span>
          <span>dashboardoffline</span>
          <span>&lt;</span>
          <span style={{ color: 'var(--accent-gold)' }}>الملف الشخصي</span>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header Card */}
        <div className="box-card" style={{ padding: '20px 30px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', color: 'var(--text-primary)' }}>{profileData.name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <span>{profileData.role}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {profileData.joinedSinceText} <Clock size={12} />
              </span>
            </div>
          </div>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
            <User size={24} />
          </div>
        </div>

        {/* Personal Info Section */}
        <div className="box-card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: 'var(--text-primary)' }}>المعلومات الشخصية</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>تفاصيل حسابك ومعلوماتك</p>
            </div>
            <User size={20} color="var(--accent-gold)" />
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div className="form-group">
              <label style={{ textAlign: 'right', display: 'block' }}>الاسم بالكامل</label>
              <input type="text" className="form-input" value={profileData.name} readOnly style={{ background: 'transparent' }} />
            </div>
            <div className="form-group">
              <label style={{ textAlign: 'right', display: 'block' }}>البريد الإلكتروني</label>
              <input type="text" className="form-input" value={profileData.email} readOnly style={{ direction: 'ltr', background: 'transparent' }} />
            </div>
            <div className="form-group">
               <label style={{ textAlign: 'right', display: 'block' }}>الدور</label>
               <input type="text" className="form-input" value={profileData.role} readOnly style={{ background: 'transparent' }} />
            </div>
            <div className="form-group">
              <label style={{ textAlign: 'right', display: 'block' }}>رقم الهاتف</label>
              <input type="text" className="form-input" value={profileData.phone} readOnly style={{ direction: 'ltr', background: 'transparent' }} />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="box-card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: 'var(--text-primary)' }}>الأمان والحساب</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>إدارة إعدادات أمان حسابك</p>
            </div>
            <Shield size={20} color="var(--accent-gold)" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '15px 20px', marginBottom: '15px' }}>
            <button className="btn" style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 20px', fontSize: '13px' }}>
              تغيير كلمة المرور
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexDirection: 'row-reverse' }}>
              <Lock size={20} color="var(--text-muted)" />
              <div style={{ textAlign: 'right' }}>
                 <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>تغيير كلمة المرور</div>
                 <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>تحديث كلمة مرور حسابك</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            
            <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '15px' }}>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>تاريخ التسجيل</div>
                 <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{profileData.registerDate}</div>
              </div>
              <Clock size={20} color="var(--text-muted)" />
            </div>

            <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '15px' }}>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>التحقق من البريد الإلكتروني</div>
                 <div style={{ color: '#22c55e', fontSize: '12px' }}>تم التحقق من البريد الإلكتروني</div>
              </div>
              <CheckCircle size={20} color="#22c55e" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
