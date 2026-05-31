import React, { useState, useEffect } from 'react';
import { Shield, Save, CheckCircle, Info, RefreshCw, Check, X } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';

const modules = [
  { key: 'sessions', label: 'الحلقات' },
  { key: 'mohfezs', label: 'المحفظين' },
  { key: 'coordinators', label: 'المنسقين' },
  { key: 'students', label: 'الدارسين' },
  { key: 'reports', label: 'التقارير اليومية' },
  { key: 'branches', label: 'الفروع' },
];

const actions = [
  { key: 'view', label: 'عرض' },
  { key: 'add', label: 'إضافة' },
  { key: 'edit', label: 'تعديل' },
  { key: 'delete', label: 'حذف' },
];

const rowaqRoles = [
  { key: 'admin', label: 'أدمن (Admin)', desc: 'يمتلك مدير النظام الصلاحيات الكاملة افتراضياً لإدارة جميع الإعدادات والمستخدمين.' },
  { key: 'rowaq_admin', label: 'أدمن شؤون الأروقة', desc: 'يمتلك مدير شؤون الأروقة الصلاحيات الكاملة لإدارة فروع وحلقات ومستخدمي الأروقة.' },
  { key: 'rowaq_manager', label: 'مدير إدارة', desc: 'مسؤول إدارة شؤون الأروقة وله الصلاحية للتحكم بالعمليات اليومية وتعديل البيانات.' },
  { key: 'rowaq_tech', label: 'تقني إدارة', desc: 'مسؤول تقني عن الأروقة يمتلك صلاحيات إدارة وإدخال البيانات الأساسية.' },
  { key: 'rowaq_member', label: 'عضو إدارة', desc: 'عضو إدارة شؤون الأروقة يمتلك صلاحيات العرض وإدخال تقارير المتابعة.' },
  { key: 'branch_admin_coordinator', label: 'منسق إداري لفرع', desc: 'منسق إداري للفرع يمتلك صلاحية إدارة الحلقات والدارسين والتقارير داخل الفرع الخاص به.' },
  { key: 'branch_scientific_coordinator', label: 'منسق علمي لفرع', desc: 'منسق علمي للفرع يمتلك صلاحيات عرض البيانات وإدخال التقارير العلمية اليومية.' },
  { key: 'mohfez', label: 'محفظ الأروقة', desc: 'محفظ الحلقات يمتلك صلاحية عرض الحلقات الخاصة به وإدخال تقارير غياب وحفظ الدارسين.' },
];

const platformRoles = [
  { key: 'admin', label: 'أدمن (Admin)', desc: 'يمتلك مدير النظام الصلاحيات الكاملة افتراضياً لإدارة جميع الإعدادات والمستخدمين.' },
  { key: 'platform_admin', label: 'أدمن المنصة', desc: 'يمتلك مدير المنصة الصلاحيات الكاملة لإدارة حلقات ومحفظي ودارسي المنصة.' },
  { key: 'platform_supervisor', label: 'مشرف المنصة', desc: 'مشرف عام على المنصة له صلاحيات كاملة لمتابعة كافة حلقات ودارسي المنصة وتعديلها.' },
  { key: 'platform_coordinator', label: 'منسق المنصة', desc: 'منسق حلقات المنصة يمتلك صلاحية إضافة الحلقات والدارسين وإعداداتها.' },
  { key: 'platform_mohfez', label: 'محفظ المنصة', desc: 'محفظ على المنصة يمتلك صلاحية متابعة حلقاته وإدخال تقارير الحضور والغياب.' },
  { key: 'student', label: 'دارس المنصة', desc: 'دارس مسجل على المنصة يمتلك صلاحيات عرض ملفه الشخصي ومواعيد حلقاته فقط.' },
];

function PermissionsManagement() {
  const { rolePermissions, updateRolePermissions } = useAppData();
  
  // Get current user and role
  let currentUserRole = 'admin';
  try {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.role) {
      currentUserRole = currentUser.role;
    }
  } catch (e) {
    console.error('Error parsing currentUser in PermissionsManagement', e);
  }

  const isSuperAdmin = currentUserRole === 'admin';
  const isRowaqAdmin = currentUserRole === 'rowaq_admin';
  const isRowaqManager = currentUserRole === 'rowaq_manager';
  const isPlatformAdmin = currentUserRole === 'platform_admin';
  const isPlatformSupervisor = currentUserRole === 'platform_supervisor';

  const hasAccess = isSuperAdmin || isRowaqAdmin || isRowaqManager || isPlatformAdmin || isPlatformSupervisor;

  // Determine allowed tab groups
  const allowedTabGroups = [];
  if (isSuperAdmin) {
    allowedTabGroups.push('rowaq', 'platform');
  } else if (isRowaqAdmin || isRowaqManager) {
    allowedTabGroups.push('rowaq');
  } else if (isPlatformAdmin || isPlatformSupervisor) {
    allowedTabGroups.push('platform');
  }

  // Determine default tab group and active role
  const defaultTab = allowedTabGroups[0] || 'rowaq';
  const getDefaultRole = (tab) => {
    if (tab === 'rowaq') {
      if (isRowaqManager) return 'rowaq_member';
      if (isRowaqAdmin) return 'rowaq_manager';
      return 'rowaq_manager';
    } else {
      if (isPlatformSupervisor) return 'platform_coordinator';
      return 'platform_supervisor';
    }
  };

  const [activeTabGroup, setActiveTabGroup] = useState(defaultTab);
  const [activeRole, setActiveRole] = useState(() => getDefaultRole(defaultTab));
  const [localPermissions, setLocalPermissions] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Filter roles to display
  const getFilteredRoles = () => {
    if (activeTabGroup === 'rowaq') {
      if (isSuperAdmin) return rowaqRoles;
      if (isRowaqAdmin) return rowaqRoles.filter(r => r.key !== 'admin' && r.key !== 'rowaq_admin');
      if (isRowaqManager) return rowaqRoles.filter(r => ['rowaq_member', 'branch_admin_coordinator', 'branch_scientific_coordinator', 'mohfez'].includes(r.key));
      return [];
    } else {
      if (isSuperAdmin) return platformRoles;
      if (isPlatformAdmin) return platformRoles.filter(r => r.key !== 'admin' && r.key !== 'platform_admin');
      if (isPlatformSupervisor) return platformRoles.filter(r => ['platform_coordinator', 'platform_mohfez', 'student'].includes(r.key));
      return [];
    }
  };

  // Synchronize local permissions state with context state
  useEffect(() => {
    if (rolePermissions) {
      setLocalPermissions(JSON.parse(JSON.stringify(rolePermissions)));
    }
  }, [rolePermissions]);

  // Auto select valid role if activeRole is not in filtered roles
  useEffect(() => {
    const roles = getFilteredRoles();
    if (roles.length > 0 && !roles.some(r => r.key === activeRole)) {
      setActiveRole(roles[0].key);
    }
  }, [activeTabGroup, currentUserRole, activeRole]);

  if (!hasAccess) {
    return (
      <div className="management-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="box-card" style={{ borderLeft: '4px solid #ef4444', textAlign: 'center', padding: '30px' }}>
          <X size={48} style={{ color: '#ef4444', marginBottom: '15px' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>عذراً، ليس لديك صلاحية</h3>
          <p style={{ color: 'var(--text-secondary)' }}>لا تمتلك الحسابات ذات الدور الخاص بك صلاحيات كافية لإدارة الصلاحيات للمستخدمين.</p>
        </div>
      </div>
    );
  }

  if (!localPermissions) {
    return (
      <div className="management-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RefreshCw className="animate-spin" size={24} />
          <span>جاري تحميل الصلاحيات...</span>
        </div>
      </div>
    );
  }

  const handleToggle = (moduleKey, actionKey) => {
    setLocalPermissions(prev => {
      const copy = { ...prev };
      if (!copy[activeRole]) copy[activeRole] = {};
      if (!copy[activeRole][moduleKey]) copy[activeRole][moduleKey] = {};
      
      copy[activeRole][moduleKey][actionKey] = !copy[activeRole][moduleKey][actionKey];
      return copy;
    });
  };

  const handleToggleAll = (enable) => {
    setLocalPermissions(prev => {
      const copy = { ...prev };
      if (!copy[activeRole]) copy[activeRole] = {};
      
      modules.forEach(m => {
        if (!copy[activeRole][m.key]) copy[activeRole][m.key] = {};
        actions.forEach(a => {
          copy[activeRole][m.key][a.key] = enable;
        });
      });
      return copy;
    });
  };

  const handleSave = () => {
    updateRolePermissions(localPermissions);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const currentRoles = getFilteredRoles();
  const currentRoleObj = currentRoles.find(r => r.key === activeRole) || currentRoles[0];

  return (
    <div className="management-page" style={{ position: 'relative' }}>
      
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#10b981',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 1100,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'float-slow-1 3s ease-in-out infinite'
        }}>
          <CheckCircle size={18} />
          <span style={{ fontWeight: '600' }}>تم حفظ تعديلات الصلاحيات بنجاح!</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div></div>
        <div className="title-section" style={{ textAlign: 'right' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
            <Shield size={24} className="text-gold" />
            إدارة صلاحيات المستخدمين
          </h2>
          <p>تعديل وتخصيص صلاحيات العمليات للأدوار المختلفة في شؤون الأروقة والمنصة</p>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Informational Box */}
        <div className="box-card" style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', borderLeft: '4px solid var(--accent-gold)' }}>
          <Info size={24} style={{ color: 'var(--accent-gold)', marginTop: '2px', flexShrink: 0 }} />
          <div style={{ textAlign: 'right' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '5px', fontSize: '15px' }}>ملاحظة هامة للنظام</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6' }}>
              تطبق الصلاحيات التي يتم تعيينها هنا بشكل فوري وتلقائي على كافة لوحات التحكم. يتم إخفاء أزرار الإضافة والتعديل والحذف بشكل ديناميكي من الصفحات للمستخدمين الذين لا يملكون الصلاحية المحددة.
            </p>
          </div>
        </div>

        {/* Tab Group Selector */}
        {allowedTabGroups.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'flex',
              background: 'var(--bg-card)',
              padding: '5px',
              borderRadius: '30px',
              border: '1px solid var(--border-subtle)',
              gap: '5px'
            }}>
              {allowedTabGroups.includes('rowaq') && (
                <button
                  onClick={() => { setActiveTabGroup('rowaq'); setActiveRole('rowaq_manager'); }}
                  style={{
                    background: activeTabGroup === 'rowaq' ? 'var(--accent-gold)' : 'transparent',
                    color: activeTabGroup === 'rowaq' ? '#000' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '10px 24px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '14.5px'
                  }}
                >
                  أدوار شؤون الأروقة
                </button>
              )}
              {allowedTabGroups.includes('platform') && (
                <button
                  onClick={() => { setActiveTabGroup('platform'); setActiveRole('platform_supervisor'); }}
                  style={{
                    background: activeTabGroup === 'platform' ? 'var(--accent-gold)' : 'transparent',
                    color: activeTabGroup === 'platform' ? '#000' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '10px 24px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '14.5px'
                  }}
                >
                  أدوار المنصة
                </button>
              )}
            </div>
          </div>
        )}

        {/* Roles Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1px', gap: '8px', overflowX: 'auto', paddingRight: '5px' }}>
          {currentRoles.map(role => (
            <button
              key={role.key}
              onClick={() => setActiveRole(role.key)}
              style={{
                background: activeRole === role.key ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                border: 'none',
                borderBottom: activeRole === role.key ? '3px solid var(--accent-gold)' : '3px solid transparent',
                color: activeRole === role.key ? 'var(--accent-gold)' : 'var(--text-secondary)',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderRadius: '8px 8px 0 0',
                whiteSpace: 'nowrap'
              }}
            >
              {role.label}
            </button>
          ))}
        </div>

        {/* Selected Role Card Info */}
        <div className="box-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase' }}>الدور المختار حالياً</span>
            <h3 style={{ color: 'var(--text-primary)', marginTop: '2px', fontSize: '17px' }}>
              {currentRoleObj?.label}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '5px', lineHeight: '1.5' }}>
              {currentRoleObj?.desc}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-outline"
              onClick={() => handleToggleAll(false)}
              style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <X size={14} />
              تعطيل الكل
            </button>
            <button 
              className="btn btn-gold-outline"
              onClick={() => handleToggleAll(true)}
              style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Check size={14} />
              تمكين الكل
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="table-wrapper box-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="management-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'right', width: '25%', padding: '18px' }}>القسم / الموديل</th>
                {actions.map(action => (
                  <th key={action.key} style={{ textAlign: 'center', width: '18.75%', padding: '18px' }}>
                    {action.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(m => {
                const modulePerms = localPermissions[activeRole]?.[m.key] || {};
                return (
                  <tr key={m.key} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ textAlign: 'right', padding: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {m.label}
                    </td>
                    {actions.map(action => {
                      const hasPerm = !!modulePerms[action.key];
                      return (
                        <td key={action.key} style={{ textAlign: 'center', padding: '18px' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {/* Toggle Switch */}
                            <div 
                              onClick={() => handleToggle(m.key, action.key)}
                              style={{ 
                                width: '48px', height: '24px', borderRadius: '12px', 
                                background: hasPerm ? '#10b981' : 'rgba(255,255,255,0.06)',
                                border: hasPerm ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                                position: 'relative', cursor: 'pointer', transition: 'all 0.25s ease'
                              }}
                            >
                              <div style={{
                                width: '18px', height: '18px', borderRadius: '50%', 
                                background: hasPerm ? '#fff' : 'var(--text-secondary)',
                                position: 'absolute', top: '2px', transition: 'all 0.25s ease',
                                left: hasPerm ? '26px' : '2px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                              }} />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            style={{ 
              padding: '12px 30px', 
              fontSize: '15px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.15)'
            }}
          >
            <Save size={18} />
            حفظ صلاحيات الدور
          </button>
        </div>

      </div>
    </div>
  );
}

export default PermissionsManagement;
