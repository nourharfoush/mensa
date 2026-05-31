const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'pages');

const mapping = [
  { source: 'Coordinators', target: 'PlatformCoordinators', stateName: 'platformCoordinators', addName: 'addPlatformCoordinator', updateName: 'updatePlatformCoordinator', deleteName: 'deletePlatformCoordinator', title: 'المنسقين الإداريين' },
  { source: 'Mohfez', target: 'PlatformMohfezs', stateName: 'platformMohfezs', addName: 'addPlatformMohfez', updateName: 'updatePlatformMohfez', deleteName: 'deletePlatformMohfez', title: 'المحفظين' },
  { source: 'Students', target: 'PlatformStudents', stateName: 'platformStudents', addName: 'addPlatformStudent', updateName: 'updatePlatformStudent', deleteName: 'deletePlatformStudent', title: 'الدارسين' },
  { source: 'Applicants', target: 'PlatformApplicants', stateName: 'platformApplicants', addName: 'addPlatformApplicant', updateName: 'updatePlatformApplicant', deleteName: 'deletePlatformApplicant', title: 'المتقدمين الجدد' },
  { source: 'Sessions', target: 'PlatformSessions', stateName: 'platformSessions', addName: 'addPlatformSession', updateName: 'updatePlatformSession', deleteName: 'deletePlatformSession', title: 'الحلقات' },
];

// Special mappings for Top Management and Supervisors since they don't have a 1:1 match
// We'll base Top Management and Supervisors on Coordinators for now, since they are basically users
mapping.push({ source: 'Coordinators', target: 'PlatformTopManagement', stateName: 'platformTopManagement', addName: 'addPlatformTopManagement', updateName: 'updatePlatformTopManagement', deleteName: 'deletePlatformTopManagement', title: 'الإدارة العليا' });
mapping.push({ source: 'Coordinators', target: 'PlatformSupervisors', stateName: 'platformSupervisors', addName: 'addPlatformSupervisor', updateName: 'updatePlatformSupervisor', deleteName: 'deletePlatformSupervisor', title: 'المشرفين' });

mapping.forEach(m => {
  // LIST FILE
  const listSrcFile = path.join(srcDir, m.source + 'List.jsx');
  const listTargetFile = path.join(srcDir, m.target + 'List.jsx');
  if (fs.existsSync(listSrcFile)) {
    let content = fs.readFileSync(listSrcFile, 'utf8');
    
    // Replace names
    content = content.replace(new RegExp(m.source + 'List', 'g'), m.target + 'List');
    content = content.replace(new RegExp(m.source.toLowerCase() + 's', 'g'), m.stateName); // simple heuristic
    if (m.source === 'Mohfez') content = content.replace(/mohfezs/g, m.stateName);
    
    content = content.replace(/add[A-Za-z0-9_]+/g, match => match.startsWith('add') && content.includes(match) ? m.addName : match);
    content = content.replace(/delete[A-Za-z0-9_]+/g, match => match.startsWith('delete') && content.includes(match) ? m.deleteName : match);

    // Remove admin/center
    content = content.replace(/<th>الإدارة<\/th>/g, '');
    content = content.replace(/<th>المركز<\/th>/g, '');
    content = content.replace(/<td>\{[a-z]\.admin\}<\/td>/g, '');
    content = content.replace(/<td>\{[a-z]\.center\}<\/td>/g, '');
    
    // Replace link paths
    content = content.replace(new RegExp(`/${m.source.toLowerCase()}`, 'gi'), `/${m.target.toLowerCase()}`);
    content = content.replace(new RegExp(`/${m.source.toLowerCase()}s`, 'gi'), `/${m.target.toLowerCase()}`);

    fs.writeFileSync(listTargetFile, content);
  }

  // CREATE FILE
  const createSrcFile = path.join(srcDir, m.source + 'Create.jsx');
  const createTargetFile = path.join(srcDir, m.target + 'Create.jsx');
  if (fs.existsSync(createSrcFile)) {
    let content = fs.readFileSync(createSrcFile, 'utf8');
    
    content = content.replace(new RegExp(m.source + 'Create', 'g'), m.target + 'Create');
    content = content.replace(new RegExp(m.source.toLowerCase() + 's', 'g'), m.stateName);
    if (m.source === 'Mohfez') content = content.replace(/mohfezs/g, m.stateName);
    
    content = content.replace(/add[A-Za-z0-9_]+/g, match => match.startsWith('add') && content.includes(match) ? m.addName : match);
    content = content.replace(/update[A-Za-z0-9_]+/g, match => match.startsWith('update') && content.includes(match) ? m.updateName : match);

    // Remove admin/center from state and JSX
    content = content.replace(/admin:\s*'([^']*)',/g, '');
    content = content.replace(/center:\s*'([^']*)',/g, '');
    content = content.replace(/<div className="form-group">\s*<label>الإدارة[\s\S]*?<\/div>/g, '');
    content = content.replace(/<div className="form-group">\s*<label>المركز[\s\S]*?<\/div>/g, '');
    
    // Replace link paths
    content = content.replace(new RegExp(`/${m.source.toLowerCase()}`, 'gi'), `/${m.target.toLowerCase()}`);
    content = content.replace(new RegExp(`/${m.source.toLowerCase()}s`, 'gi'), `/${m.target.toLowerCase()}`);

    fs.writeFileSync(createTargetFile, content);
  }
});

console.log("Generated platform files");
