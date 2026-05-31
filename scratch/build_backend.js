import fs from 'fs';
import path from 'path';

const BACKEND_DIR = 'f:/myprog/menasa/rowaq-app/backend';

// List of new models to create with strict: false
const newModels = [
  { name: 'MonthlyReport', routeName: 'monthlyreports', controllerName: 'monthlyReport' },
  { name: 'FollowUpReport', routeName: 'followupreports', controllerName: 'followUpReport' },
  { name: 'Applicant', routeName: 'applicants', controllerName: 'applicant' },
  { name: 'Rowaq', routeName: 'rowaqs', controllerName: 'rowaq' },
  { name: 'ApplicantBranch', routeName: 'applicantbranches', controllerName: 'applicantBranch' },
  { name: 'SessionReport', routeName: 'sessionreports', controllerName: 'sessionReport' },
  { name: 'PlatformTopManagement', routeName: 'platformtopmanagement', controllerName: 'platformTopManagement' },
  { name: 'PlatformSupervisor', routeName: 'platformsupervisors', controllerName: 'platformSupervisor' },
  { name: 'PlatformCoordinator', routeName: 'platformcoordinators', controllerName: 'platformCoordinator' },
  { name: 'PlatformMohfez', routeName: 'platformmohfezs', controllerName: 'platformMohfez' },
  { name: 'PlatformSession', routeName: 'platformsessions', controllerName: 'platformSession' },
  { name: 'PlatformStudent', routeName: 'platformstudents', controllerName: 'platformStudent' },
  { name: 'PlatformApplicant', routeName: 'platformapplicants', controllerName: 'platformApplicant' },
  { name: 'PlatformRowaq', routeName: 'platformrowaqs', controllerName: 'platformRowaq' },
  { name: 'Administration', routeName: 'administrations', controllerName: 'administration' },
  { name: 'RolePermission', routeName: 'rolepermissions', controllerName: 'rolePermission' }
];

// 1. Update existing models to include custom string id field
const existingModels = ['Branch.js', 'Coordinator.js', 'Manager.js', 'Mohfez.js', 'Session.js', 'Student.js', 'User.js'];
existingModels.forEach(file => {
  const filePath = path.join(BACKEND_DIR, 'models', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('id:')) {
      // Inject id schema field right after const schemaNameSchema = new mongoose.Schema( {
      content = content.replace(/new\s+mongoose\.Schema\(\s*\{/, 'new mongoose.Schema(\n  {\n    id: { type: String, required: true, unique: true, sparse: true },');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated model ${file} with custom ID field`);
    }
  }
});

// 2. Update existing controllers to query by custom id
const existingControllers = [
  'branchController.js', 'coordinatorController.js', 'managerController.js', 
  'mohfezController.js', 'sessionController.js', 'studentController.js', 'userController.js'
];
existingControllers.forEach(file => {
  const filePath = path.join(BACKEND_DIR, 'controllers', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace findById -> findOne({ id: ... })
    content = content.replace(/findById\(req\.params\.id\)/g, 'findOne({ id: req.params.id })');
    // Replace findByIdAndDelete -> findOneAndDelete({ id: ... })
    content = content.replace(/findByIdAndDelete\(req\.params\.id\)/g, 'findOneAndDelete({ id: req.params.id })');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated controller ${file} to query by custom ID`);
  }
});

// 3. Create all new models, controllers, and routes
newModels.forEach(m => {
  // Model
  const modelPath = path.join(BACKEND_DIR, 'models', `${m.name}.js`);
  const modelContent = `import mongoose from 'mongoose';

const ${m.controllerName}Schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('${m.name}', ${m.controllerName}Schema);
`;
  fs.writeFileSync(modelPath, modelContent, 'utf8');
  console.log(`✓ Created Model: ${m.name}.js`);

  // Controller
  const controllerPath = path.join(BACKEND_DIR, 'controllers', `${m.controllerName}Controller.js`);
  const controllerContent = `import ${m.name} from '../models/${m.name}.js';

export const getItems = async (req, res) => {
  try {
    const items = await ${m.name}.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getItem = async (req, res) => {
  try {
    const item = await ${m.name}.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createItem = async (req, res) => {
  const item = new ${m.name}(req.body);
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await ${m.name}.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    Object.assign(item, req.body);
    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await ${m.name}.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportItems = async (req, res) => {
  try {
    const items = req.body.items || req.body.${m.routeName} || [];
    const inserted = await ${m.name}.insertMany(items, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
`;
  fs.writeFileSync(controllerPath, controllerContent, 'utf8');
  console.log(`✓ Created Controller: ${m.controllerName}Controller.js`);

  // Route
  const routePath = path.join(BACKEND_DIR, 'routes', `${m.routeName}.js`);
  const routeContent = `import express from 'express';
import { getItems, getItem, createItem, updateItem, deleteItem, bulkImportItems } from '../controllers/${m.controllerName}Controller.js';

const router = express.Router();

router.get('/', getItems);
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.post('/bulk-import', bulkImportItems);

export default router;
`;
  fs.writeFileSync(routePath, routeContent, 'utf8');
  console.log(`✓ Created Route: ${m.routeName}.js`);
});

// 4. Update server.js to register all new routes
const serverPath = path.join(BACKEND_DIR, 'server.js');
if (fs.existsSync(serverPath)) {
  let serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Build imports
  let importsStr = '';
  let usageStr = '';
  newModels.forEach(m => {
    importsStr += `import ${m.controllerName}Routes from './routes/${m.routeName}.js';\n`;
    usageStr += `app.use('/api/${m.routeName}', ${m.controllerName}Routes);\n`;
  });

  // Inject imports right before app instantiation
  serverContent = serverContent.replace("const app = express();", `${importsStr}\nconst app = express();`);
  
  // Inject app.use routes right before Health Check
  serverContent = serverContent.replace("// Health check", `${usageStr}\n// Health check`);

  fs.writeFileSync(serverPath, serverContent, 'utf8');
  console.log('✓ Registered all routes in server.js');
}
