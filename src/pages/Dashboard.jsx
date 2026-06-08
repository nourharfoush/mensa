import React from 'react';
import HeroBanner from '../components/HeroBanner';
import StatsCards from '../components/StatsCards';
import VisionMission from '../components/VisionMission';
import Footer from '../components/Footer';
import { useAppData } from '../context/AppDataContext';

function Dashboard() {
  const { branches, coordinators, mohfezs, sessions, students, applicants, managers } = useAppData();

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const role = currentUser ? currentUser.role : '';
  const isAdmin = ['admin', 'rowaq_admin', 'rowaq_manager', 'rowaq_tech'].includes(role);
  const isBranchCoordinator = ['branch_admin_coordinator', 'branch_scientific_coordinator'].includes(role);

  const normalizeArabic = (str) => {
    if (!str) return '';
    return str
      .toString()
      .trim()
      .normalize('NFKD')
      .normalize('NFC')
      .replace(/ً/g, '')
      .replace(/ٌ/g, '')
      .replace(/ٍ/g, '')
      .replace(/َ/g, '')
      .replace(/ُ/g, '')
      .replace(/ِ/g, '')
      .replace(/ّ/g, '')
      .replace(/ْ/g, '')
      .replace(/[أإآا]/g, 'ا')
      .replace(/[ىي]/g, 'ي')
      .replace(/[ة]/g, 'ه')
      .replace(/[ـ]/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim();
  };

  const nationalId = currentUser ? String(currentUser.national_id || currentUser.username || '').trim() : '';
  let userAdmin = currentUser ? currentUser.userAdmin : '';
  let userCenter = currentUser ? currentUser.userCenter : '';
  let userBranch = currentUser ? currentUser.userBranch : '';

  if (isBranchCoordinator && (!userAdmin || !userCenter || !userBranch)) {
    const matchedCoord = coordinators?.find(c => String(c.national_id || '').trim() === nationalId);
    if (matchedCoord) {
      userAdmin = userAdmin || matchedCoord.admin || '';
      userCenter = userCenter || matchedCoord.center || '';
      userBranch = userBranch || matchedCoord.branch || '';
    }
  }

  let filteredCoordinators = coordinators || [];
  let filteredMohfezs = mohfezs || [];
  let filteredSessions = sessions || [];
  let filteredBranches = branches || [];
  let filteredApplicants = applicants || [];
  let filteredStudents = students || [];
  let filteredManagers = managers || [];

  if (isBranchCoordinator && userBranch) {
    const branchNorm = normalizeArabic(userBranch);
    filteredCoordinators = (coordinators || []).filter(c => normalizeArabic(c.branch) === branchNorm);
    filteredMohfezs = (mohfezs || []).filter(m => normalizeArabic(m.branch) === branchNorm);
    filteredSessions = (sessions || []).filter(s => normalizeArabic(s.branch) === branchNorm);
    filteredBranches = (branches || []).filter(b => normalizeArabic(b.name) === branchNorm);
    filteredApplicants = (applicants || []).filter(a => normalizeArabic(a.branch) === branchNorm);
    filteredStudents = (students || []).filter(s => normalizeArabic(s.branch) === branchNorm);
    filteredManagers = [];
  }

  const dynamicStats = [
    { id: 1, title: 'المنسقين', value: filteredCoordinators.length, iconColor: '#a855f7', iconType: 'graduation-cap' },
    { id: 2, title: 'المحفظين', value: filteredMohfezs.length, iconColor: '#eab308', iconType: 'users' },
    { id: 3, title: 'الحلقات', value: filteredSessions.length, iconColor: '#3b82f6', iconType: 'book' },
    { id: 4, title: 'الفروع', value: filteredBranches.length, iconColor: '#f97316', iconType: 'graduation-cap' },
    { id: 5, title: 'طلبات التقديم', value: filteredApplicants.length, iconColor: '#22c55e', iconType: 'user-check' },
    { id: 6, title: 'الدارسين', value: filteredStudents.length, iconColor: '#eab308', iconType: 'book-open' },
    ...(isAdmin ? [{ id: 7, title: 'أعضاء الإدارة', value: filteredManagers.length, iconColor: '#ec4899', iconType: 'users' }] : []),
  ];

  const showStats = isAdmin || isBranchCoordinator;

  return (
    <div className="dashboard-page">
      <HeroBanner />
      {showStats && <StatsCards stats={dynamicStats} />}
      <VisionMission />
      <Footer />
    </div>
  );
}

export default Dashboard;
