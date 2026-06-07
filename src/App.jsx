import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AppDataProvider } from './context/AppDataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import PlatformDashboard from './pages/PlatformDashboard';
import ManagementList from './pages/ManagementList';
import ManagementCreate from './pages/ManagementCreate';
import StatisticsList from './pages/StatisticsList';
import MonthlyReportList from './pages/MonthlyReportList';
import MonthlyReportCreate from './pages/MonthlyReportCreate';
import MonthlyReportEdit from './pages/MonthlyReportEdit';
import FollowUpReportCreate from './pages/FollowUpReportCreate';
import FollowUpReportPreview from './pages/FollowUpReportPreview';
import FollowUpReportConfirm from './pages/FollowUpReportConfirm';
import BranchesList from './pages/BranchesList';
import BranchesCreate from './pages/BranchesCreate';
import CoordinatorsList from './pages/CoordinatorsList';
import CoordinatorsCreate from './pages/CoordinatorsCreate';
import MohfezList from './pages/MohfezList';
import MohfezCreate from './pages/MohfezCreate';
import SessionsList from './pages/SessionsList';
import SessionsCreate from './pages/SessionsCreate';
import SessionAttendance from './pages/SessionAttendance';
import SessionAttendanceAdd from './pages/SessionAttendanceAdd';
import SessionReports from './pages/SessionReports';
import SessionReportsAdd from './pages/SessionReportsAdd';
import StudentsList from './pages/StudentsList';
import StudentsCreate from './pages/StudentsCreate';
import ApplicantsList from './pages/ApplicantsList';
import ApplicantsCreate from './pages/ApplicantsCreate';

// Platform Components
import PlatformTopManagementList from './pages/PlatformTopManagementList';
import PlatformTopManagementCreate from './pages/PlatformTopManagementCreate';
import PlatformSupervisorsList from './pages/PlatformSupervisorsList';
import PlatformSupervisorsCreate from './pages/PlatformSupervisorsCreate';
import PlatformCoordinatorsList from './pages/PlatformCoordinatorsList';
import PlatformCoordinatorsCreate from './pages/PlatformCoordinatorsCreate';
import PlatformMohfezsList from './pages/PlatformMohfezsList';
import PlatformMohfezsCreate from './pages/PlatformMohfezsCreate';
import PlatformSessionsList from './pages/PlatformSessionsList';
import PlatformSessionsCreate from './pages/PlatformSessionsCreate';
import PlatformStudentsList from './pages/PlatformStudentsList';
import PlatformStudentsCreate from './pages/PlatformStudentsCreate';
import PlatformApplicantsList from './pages/PlatformApplicantsList';
import PlatformApplicantsCreate from './pages/PlatformApplicantsCreate';

// Sharia & Arabic Sciences Components
import ShariaDashboard from './pages/ShariaDashboard';
import ShariaCourses from './pages/ShariaCourses';
import ShariaTeachers from './pages/ShariaTeachers';
import ShariaStudents from './pages/ShariaStudents';
import ShariaSessions from './pages/ShariaSessions';

import AdministrationsList from './pages/AdministrationsList';
import RowaqsList from './pages/RowaqsList';
import RowaqsCreate from './pages/RowaqsCreate';
import UsersList from './pages/UsersList';
import PermissionsManagement from './pages/PermissionsManagement';
import ApplicantBranchesList from './pages/ApplicantBranchesList';
import ApplicantBranchesCreate from './pages/ApplicantBranchesCreate';
import WatchtowerList from './pages/WatchtowerList';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import PublicHome from './pages/PublicHome';
import PublicQuran from './pages/PublicQuran';
import PublicIslamicStudies from './pages/PublicIslamicStudies';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SelectSection from './pages/SelectSection';

const initialDashboardData = {
  stats: [
    { id: 1, title: 'الحلقات', value: 0, iconColor: '#3b82f6', iconType: 'book' },
    { id: 2, title: 'المحفظين', value: 0, iconColor: '#eab308', iconType: 'users' },
    { id: 3, title: 'المنسقين', value: 0, iconColor: '#a855f7', iconType: 'graduation-cap' },
    { id: 4, title: 'الدارسين', value: 0, iconColor: '#eab308', iconType: 'book-open' },
    { id: 5, title: 'طلبات التقديم', value: 0, iconColor: '#22c55e', iconType: 'user-check' },
    { id: 6, title: 'الفروع', value: 0, iconColor: '#f97316', iconType: 'graduation-cap' },
  ]
};

function DashboardLayout() {
  const [dashboardData] = useState(initialDashboardData);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const activeSection = sessionStorage.getItem('activeSection');

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!activeSection) {
    return <Navigate to="/select-section" replace />;
  }

  const getRedirectPath = (section) => {
    if (section === 'platform') return '/platform-dashboard';
    if (section === 'sharia_arabic') return '/sharia-dashboard';
    return '/dashboard';
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
      
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <div className="content-scroll-area" style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Navigate to={getRedirectPath(activeSection)} replace />} />
            <Route path="/dashboard" element={<Dashboard data={dashboardData} />} />
            <Route path="/platform-dashboard" element={<PlatformDashboard />} />
            <Route path="/sharia-dashboard" element={<ShariaDashboard />} />
            
            {/* System Administration */}
            <Route path="/management" element={<ManagementList />} />
            <Route path="/management/create" element={<ManagementCreate />} />
            <Route path="/statistics" element={<StatisticsList />} />
            <Route path="/monthlyreport" element={<MonthlyReportList />} />
            <Route path="/monthlyreport/create" element={<MonthlyReportCreate />} />
            <Route path="/monthlyreport/:id/edit" element={<MonthlyReportEdit />} />
            <Route path="/monthlyreport/:reportId/branches/:branchId/report" element={<FollowUpReportCreate />} />
            <Route path="/monthlyreport/:reportId/branches/:branchId/preview" element={<FollowUpReportPreview />} />
            <Route path="/monthlyreport/:reportId/branches/:branchId/confirm" element={<FollowUpReportConfirm />} />
            
            {/* Rowaq Statistics */}
            <Route path="/branches" element={<BranchesList />} />
            <Route path="/branches/create" element={<BranchesCreate />} />
            <Route path="/coordinators" element={<CoordinatorsList />} />
            <Route path="/coordinators/create" element={<CoordinatorsCreate />} />
            <Route path="/mohfez" element={<MohfezList />} />
            <Route path="/mohfez/create" element={<MohfezCreate />} />
            <Route path="/sessions" element={<SessionsList />} />
            <Route path="/sessions/create" element={<SessionsCreate />} />
            <Route path="/sessions/:id/attendance" element={<SessionAttendance />} />
            <Route path="/sessions/:id/attendance/add" element={<SessionAttendanceAdd />} />
            <Route path="/sessions/:id/reports" element={<SessionReports />} />
            <Route path="/sessions/:id/reports/add" element={<SessionReportsAdd />} />
            <Route path="/students" element={<StudentsList />} />
            <Route path="/students/create" element={<StudentsCreate />} />
            <Route path="/applicants" element={<ApplicantsList />} />
            <Route path="/applicants/create" element={<ApplicantsCreate />} />
            
            {/* System Settings */}
            <Route path="/administrations" element={<AdministrationsList />} />
            <Route path="/riwaqs" element={<RowaqsList />} />
            <Route path="/riwaqs/create" element={<RowaqsCreate />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/permissions" element={<PermissionsManagement />} />
            <Route path="/applicant-branches" element={<ApplicantBranchesList />} />
            <Route path="/applicant-branches/create" element={<ApplicantBranchesCreate />} />
            <Route path="/towers" element={<WatchtowerList />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />

            {/* Platform Routes */}
            <Route path="/platform-top-management" element={<PlatformTopManagementList />} />
            <Route path="/platform-top-management/create" element={<PlatformTopManagementCreate />} />
            <Route path="/platform-supervisors" element={<PlatformSupervisorsList />} />
            <Route path="/platform-supervisors/create" element={<PlatformSupervisorsCreate />} />
            <Route path="/platform-coordinators" element={<PlatformCoordinatorsList />} />
            <Route path="/platform-coordinators/create" element={<PlatformCoordinatorsCreate />} />
            <Route path="/platform-mohfez" element={<PlatformMohfezsList />} />
            <Route path="/platform-mohfez/create" element={<PlatformMohfezsCreate />} />
            <Route path="/platform-sessions" element={<PlatformSessionsList />} />
            <Route path="/platform-sessions/create" element={<PlatformSessionsCreate />} />
            <Route path="/platform-sessions/:id/attendance" element={<SessionAttendance />} />
            <Route path="/platform-sessions/:id/attendance/add" element={<SessionAttendanceAdd />} />
            <Route path="/platform-sessions/:id/reports" element={<SessionReports />} />
            <Route path="/platform-sessions/:id/reports/add" element={<SessionReportsAdd />} />
            <Route path="/platform-students" element={<PlatformStudentsList />} />
            <Route path="/platform-students/create" element={<PlatformStudentsCreate />} />
            <Route path="/platform-applicants" element={<PlatformApplicantsList />} />
            <Route path="/platform-applicants/create" element={<PlatformApplicantsCreate />} />

            {/* Sharia & Arabic Sciences Routes */}
            <Route path="/sharia-courses" element={<ShariaCourses />} />
            <Route path="/sharia-teachers" element={<ShariaTeachers />} />
            <Route style={{ direction: 'rtl' }} path="/sharia-students" element={<ShariaStudents />} />
            <Route path="/sharia-sessions" element={<ShariaSessions />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppDataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/quran" element={<PublicQuran />} />
          <Route path="/IslamicStudies" element={<PublicIslamicStudies />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          <Route path="/select-section" element={<SelectSection />} />
          <Route path="/*" element={<DashboardLayout />} />
        </Routes>
      </Router>
    </AppDataProvider>
  );
}

export default App;
