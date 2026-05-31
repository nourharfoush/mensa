import React from 'react';
import { Book, Users, GraduationCap, UserCheck, BookOpen } from 'lucide-react';
import './StatsCards.css';

// Using a small mapping for icons since standard lucide icons might differ
const IconMap = {
  'book': Book,
  'book-open': BookOpen,
  'users': Users,
  'graduation-cap': GraduationCap,
  'user-check': UserCheck
};

function StatsCards({ stats }) {
  return (
    <section className="stats-section">
      <h2 className="section-title text-gold">إحصائيات الأروقة</h2>
      <div className="stats-grid">
        {stats.map((stat) => {
          const IconComponent = IconMap[stat.iconType] || Users;
          return (
            <div key={stat.id} className="stat-card">
              <div className="stat-icon-wrapper">
                <IconComponent size={24} style={{ color: stat.iconColor }} strokeWidth={1.5} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{stat.value.toLocaleString('en-US').replace(/,/g, '')}</span>
                <span className="stat-title">{stat.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default StatsCards;
