import React from 'react';
import './VisionMission.css';

function VisionMission() {
  return (
    <section className="vision-mission-section">
      <h2 className="section-title">رسالتنا ورؤيتنا</h2>
      <div className="cards-wrapper">
        <div className="vision-card">
          <h3 className="text-gold">رؤيتنا</h3>
          <p>
            للجامع الأزهر مَسئُوليّتهُ التّاريخيّة غيرِ المُشاركَة في الحفاظِ على الهُويّة الإسْلاميّة، والعَربِيّة، والوَطنِيّةِ، وريادتهُ في الوُقوفِ ضدّ تَيّارات التطَرّف والإلْحَاد والعُنْف، وعَرضهِ الدّائِمِ عَلى التّفاعُلِ المُجتمَعِي، ومُناقشةِ قَضاياهُ ومشَاكلِهِ، وإيجَادِ الحُلول المُنَاسبَة لَها.
          </p>
        </div>
        
        <div className="mission-card">
          <h3 className="text-gold">رسالتنا</h3>
          <p>
            تخريج دَارِسين قَادرِين علَى الوقوفِ في وجهِ التّيّارات والأفكار المُتَطرّفة عَنْ صَحيح الدين ومُريحَة. -1 تَخريج دارِسين عَلى إلمامِ كَافٍ بأمور دينهِم؛ لِكي يَتَمكّنُوا مِنْ تَطبيق تَعاليْمِهِ في حَيَاتهم؛ فتَسْتَقيم بها دُنياهُم، ويَسعَدُوا بِهَا في أُخراهُم 2.
          </p>
        </div>
      </div>
    </section>
  );
}

export default VisionMission;
