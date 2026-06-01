import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, Users, FileText, Calendar, GitBranch, 
  BookOpen, Building, MapPin, UserPlus, FilePlus, Settings, User, LogOut, Shield
} from 'lucide-react';
import './Sidebar.css';

const menuGroups = [
  {
    isAlwaysVisible: true,
    items: [
      { name: 'لوحة تحكم المنصة', icon: Home, path: '/platform-dashboard' },
      { name: 'لوحة تحكم شؤون الأروقة', icon: Home, path: '/dashboard' },
    ]
  },
  {
    title: 'إدارة النظام',
    isRowaqOnly: true,
    items: [
      { name: 'أعضاء الإدارة', icon: Users, path: '/management' },
      { name: 'إحصاء التقارير', icon: FileText, path: '/statistics' },
      { name: 'المتابعات الشهرية', icon: Calendar, path: '/monthlyreport' },
    ]
  },
  {
    title: 'إحصائيات الأروقة',
    isRowaqOnly: true,
    items: [
      { name: 'الفروع', icon: GitBranch, path: '/branches' },
      { name: 'المنسقين', icon: User, path: '/coordinators' },
      { name: 'المحفظين', icon: Users, path: '/mohfez' },
      { name: 'الحلقات', icon: Users, path: '/sessions' },
      { name: 'الدارسين', icon: BookOpen, path: '/students' },
      { name: 'المتقدمين الجدد', icon: UserPlus, path: '/applicants' },
    ]
  },
  {
    title: 'إعدادات النظام',
    items: [
      { name: 'الإدارات', icon: Building, path: '/administrations', isRowaqOnly: true },
      { name: 'الأروقة', icon: MapPin, path: '/riwaqs', isRowaqOnly: true },
      { name: 'المستخدمين', icon: Users, path: '/users', isSettingsStaff: true },
      { name: 'صلاحيات المستخدمين', icon: Shield, path: '/permissions', isSettingsStaff: true },
      { name: 'فروع طلبات التقديم', icon: FilePlus, path: '/applicant-branches', isRowaqOnly: true },
      { name: 'برج المراقبة', icon: Settings, path: '/towers', isRowaqOnly: true },
      { name: 'الاعدادات', icon: Settings, path: '/settings', isSettingsStaff: true },
      { name: 'الملف الشخصي', icon: User, path: '/profile' },
    ]
  },
  {
    title: 'إدارة المنصة',
    isPlatformOnly: true,
    items: [
      { name: 'الإدارة العليا', icon: Building, path: '/platform-top-management' },
      { name: 'المشرفين', icon: Users, path: '/platform-supervisors' },
      { name: 'المنسقين', icon: User, path: '/platform-coordinators' },
      { name: 'المحفظين', icon: Users, path: '/platform-mohfez' },
      { name: 'الحلقات', icon: GitBranch, path: '/platform-sessions' },
      { name: 'الدارسين', icon: BookOpen, path: '/platform-students' },
      { name: 'المتقدمين الجدد', icon: UserPlus, path: '/platform-applicants' },
    ]
  }
];

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  const handleLinkClick = () => {
    if (window.innerWidth < 992 && toggleSidebar) {
      toggleSidebar();
    }
  };
  
  // Get current user and role
  let role = '';
  try {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.role) {
      role = currentUser.role;
    }
  } catch (e) {
    console.error('Error parsing currentUser in Sidebar', e);
  }

  const isPathAllowed = (path, userRole) => {
    // Super Admin can access everything
    if (userRole === 'admin') return true;

    // 1. platform_admin / platform_supervisor
    if (['platform_admin', 'platform_supervisor'].includes(userRole)) {
      const allowed = [
        '/platform-dashboard',
        '/platform-top-management',
        '/platform-supervisors',
        '/platform-coordinators',
        '/platform-mohfez',
        '/platform-sessions',
        '/platform-students',
        '/platform-applicants',
        '/users',
        '/permissions',
        '/settings',
        '/profile'
      ];
      return allowed.includes(path);
    }

    // 2. platform_coordinator
    if (userRole === 'platform_coordinator') {
      const allowed = [
        '/platform-dashboard',
        '/platform-coordinators',
        '/platform-mohfez',
        '/platform-sessions',
        '/platform-students',
        '/platform-applicants',
        '/profile'
      ];
      return allowed.includes(path);
    }

    // 3. platform_mohfez
    if (userRole === 'platform_mohfez') {
      const allowed = [
        '/platform-dashboard',
        '/platform-sessions',
        '/platform-students'
      ];
      return allowed.includes(path);
    }

    // 4. student
    if (userRole === 'student') {
      return ['/platform-dashboard', '/profile'].includes(path);
    }

    // 5. rowaq_admin / rowaq_manager
    if (['rowaq_admin', 'rowaq_manager'].includes(userRole)) {
      const forbidden = [
        '/platform-dashboard',
        '/platform-top-management',
        '/platform-supervisors',
        '/platform-coordinators',
        '/platform-mohfez',
        '/platform-sessions',
        '/platform-students',
        '/platform-applicants'
      ];
      return !forbidden.includes(path);
    }

    // 6. rowaq_tech / rowaq_member
    if (['rowaq_tech', 'rowaq_member'].includes(userRole)) {
      const forbidden = [
        '/platform-dashboard',
        '/platform-top-management',
        '/platform-supervisors',
        '/platform-coordinators',
        '/platform-mohfez',
        '/platform-sessions',
        '/platform-students',
        '/platform-applicants',
        '/users',
        '/permissions',
        '/settings',
        '/towers'
      ];
      return !forbidden.includes(path);
    }

    // 7. branch_admin_coordinator (منسق إداري لفرع)
    if (userRole === 'branch_admin_coordinator') {
      const allowed = [
        '/dashboard',
        '/branches',
        '/sessions',
        '/students',
        '/applicants',
        '/profile'
      ];
      return allowed.includes(path);
    }

    // 8. branch_scientific_coordinator (منسق علمي لفرع)
    if (userRole === 'branch_scientific_coordinator') {
      const allowed = [
        '/dashboard',
        '/sessions',
        '/students',
        '/profile'
      ];
      return allowed.includes(path);
    }

    // 9. mohfez (محفظ شؤون الأروقة)
    if (userRole === 'mohfez') {
      const allowed = [
        '/dashboard',
        '/sessions'
      ];
      return allowed.includes(path);
    }

    return false;
  };

  // Filter groups based on path visibility rules
  const filteredGroups = menuGroups.map(group => {
    const items = group.items.filter(item => isPathAllowed(item.path, role));
    if (items.length === 0) return null;
    return { ...group, items };
  }).filter(Boolean);

  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={toggleSidebar}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="Logo" className="logo" />
          <div className="header-titles">
            <h3>لوحة التحكم</h3>
            <p>إدارة النظام</p>
          </div>
        </div>
        
        <div className="sidebar-menu">
          {filteredGroups.map((group, idx, arr) => (
            <div key={idx} className="menu-group">
              {group.title && <div className="menu-group-title">{group.title}</div>}
              {group.items.map((item, idy) => {
                const Icon = item.icon;
                return (
                  <NavLink 
                    to={item.path} 
                    key={idy} 
                    className={({ isActive }) => `menu-item ${isActive && item.path !== '#' ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <Icon size={18} className="menu-icon" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
              {idx < arr.length - 1 && <hr className="menu-divider" />}
            </div>
          ))}
          
          <div className="menu-group logout-group">
             <hr className="menu-divider" />
             <NavLink to="#" className="menu-item logout-btn" onClick={() => {
               sessionStorage.removeItem('currentUser');
               window.location.href = '/login';
             }}>
                <LogOut size={18} className="menu-icon" />
                <span>تسجيل الخروج</span>
             </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
