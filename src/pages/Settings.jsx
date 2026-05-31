import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import '../components/Management.css';

function Settings() {
  const [isLinkOpen, setIsLinkOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const applicationLink = 'https://alazhar.epream.net/offline-application';

  const handleCopy = () => {
    navigator.clipboard.writeText(applicationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px' }}>إعدادات طلبات الالتحاق</h2>
      </div>

      <div className="box-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
        <h3 style={{ marginBottom: '30px', color: 'var(--text-primary)', fontSize: '18px', display: 'flex', justifyContent: 'flex-start' }}>
          إعدادات رابط التقديم (للزوار)
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', width: '120px', textAlign: 'right' }}>رابط التقديم</label>
            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                value={applicationLink} 
                readOnly 
                style={{ direction: 'ltr', paddingLeft: '45px', background: 'rgba(255,255,255,0.02)', borderColor: 'var(--accent-gold)' }}
              />
              <button 
                onClick={handleCopy}
                style={{ 
                  position: 'absolute', left: '5px', top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: copied ? '#22c55e' : 'var(--text-muted)',
                  cursor: 'pointer', padding: '5px'
                }}
                title="نسخ الرابط"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', width: '120px', textAlign: 'right' }}>حالة رابط التقديم</label>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: isLinkOpen ? '#22c55e' : 'var(--text-muted)', fontWeight: 'bold' }}>
                  {isLinkOpen ? 'مفتوح' : 'مغلق'}
                </span>
                
                {/* Toggle Switch */}
                <div 
                  onClick={() => setIsLinkOpen(!isLinkOpen)}
                  style={{ 
                    width: '50px', height: '26px', borderRadius: '13px', 
                    background: isLinkOpen ? '#22c55e' : 'var(--bg-lighter)',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                    position: 'absolute', top: '3px', transition: 'all 0.3s',
                    left: isLinkOpen ? '27px' : '3px'
                  }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Settings;
