import React from 'react';
import HeroBanner from '../components/HeroBanner';
import StatsCards from '../components/StatsCards';
import VisionMission from '../components/VisionMission';
import Footer from '../components/Footer';
import { useAppData } from '../context/AppDataContext';

function Dashboard() {
  const { branches, coordinators, mohfezs, sessions, students, applicants, managers } = useAppData();

  const dynamicStats = [
    { id: 1, title: 'المنسقين', value: coordinators?.length || 0, iconColor: '#a855f7', iconType: 'graduation-cap' },
    { id: 2, title: 'المحفظين', value: mohfezs?.length || 0, iconColor: '#eab308', iconType: 'users' },
    { id: 3, title: 'الحلقات', value: sessions?.length || 0, iconColor: '#3b82f6', iconType: 'book' },
    { id: 4, title: 'الفروع', value: branches?.length || 0, iconColor: '#f97316', iconType: 'graduation-cap' },
    { id: 5, title: 'طلبات التقديم', value: applicants?.length || 0, iconColor: '#22c55e', iconType: 'user-check' },
    { id: 6, title: 'الدارسين', value: students?.length || 0, iconColor: '#eab308', iconType: 'book-open' },
    { id: 7, title: 'أعضاء الإدارة', value: managers?.length || 0, iconColor: '#ec4899', iconType: 'users' },
  ];

  return (
    <div className="dashboard-page">
      <HeroBanner />
      <StatsCards stats={dynamicStats} />
      <VisionMission />
      <Footer />
    </div>
  );
}

export default Dashboard;
