import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Disable buffering to prevent serverless function timeouts on connection issues
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', false);

// Mongoose query middleware plugin to handle queries searching by custom 'id' field
// that might actually be MongoDB's native '_id'.
mongoose.plugin((schema) => {
  schema.pre(['find', 'findOne', 'findOneAndDelete', 'findOneAndUpdate', 'deleteOne', 'deleteMany', 'updateOne', 'updateMany'], function (next) {
    if (typeof this.getQuery === 'function') {
      const query = this.getQuery();
      if (query && query.id) {
        const idVal = query.id;
        if (idVal && mongoose.Types.ObjectId.isValid(idVal)) {
          const idStr = idVal.toString();
          delete query.id;
          query.$or = [{ _id: new mongoose.Types.ObjectId(idStr) }, { id: idStr }];
        }
      }
    }
    next();
  });

  // Automatically track and synchronize changes to non-schema fields when strict: false is used.
  // This prevents edits to fields not defined in the schema from being silently ignored on document.save().
  schema.pre('save', function (next) {
    if (schema.options.strict === false) {
      const docKeys = Object.keys(this._doc);
      const objKeys = Object.keys(this);
      const allKeys = new Set([...docKeys, ...objKeys]);
      for (const key of allKeys) {
        if (!schema.paths[key] && key !== '_id' && key !== '__v' && !key.startsWith('$') && !key.startsWith('_')) {
          if (this[key] !== undefined) {
            this._doc[key] = this[key];
          }
          this.markModified(key);
        }
      }
    }
    next();
  });
});

// Import routes
import managerRoutes from './routes/managers.js';
import coordinatorRoutes from './routes/coordinators.js';
import mohfezRoutes from './routes/mohfezs.js';
import studentRoutes from './routes/students.js';
import branchRoutes from './routes/branches.js';
import sessionRoutes from './routes/sessions.js';
import userRoutes from './routes/users.js';

import monthlyReportRoutes from './routes/monthlyreports.js';
import followUpReportRoutes from './routes/followupreports.js';
import applicantRoutes from './routes/applicants.js';
import rowaqRoutes from './routes/rowaqs.js';
import applicantBranchRoutes from './routes/applicantbranches.js';
import sessionReportRoutes from './routes/sessionreports.js';
import platformTopManagementRoutes from './routes/platformtopmanagement.js';
import platformSupervisorRoutes from './routes/platformsupervisors.js';
import platformCoordinatorRoutes from './routes/platformcoordinators.js';
import platformMohfezRoutes from './routes/platformmohfezs.js';
import platformSessionRoutes from './routes/platformsessions.js';
import platformStudentRoutes from './routes/platformstudents.js';
import platformApplicantRoutes from './routes/platformapplicants.js';
import platformRowaqRoutes from './routes/platformrowaqs.js';
import administrationRoutes from './routes/administrations.js';
import rolePermissionRoutes from './routes/rolepermissions.js';

import shariaCourseRoutes from './routes/shariacourses.js';
import shariaBranchRoutes from './routes/shariabranches.js';
import shariaStudentRoutes from './routes/shariastudents.js';
import shariaTeacherRoutes from './routes/shariateachers.js';
import shariaLiveRoutes from './routes/sharialives.js';
import shariaDailyReportRoutes from './routes/shariadailyreports.js';
import shariaNewsRoutes from './routes/sharianews.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import User from './models/User.js';

// MongoDB Connection configuration
let cachedConnection = null;

async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ $or: [{ username: 'admin' }, { national_id: 'admin' }] });
    if (!adminExists) {
      const defaultAdmin = new User({
        name: 'Admin',
        username: 'admin',
        email: 'admin',
        national_id: 'admin',
        password: '123',
        record_number: '123',
        role: 'admin',
        created_at: new Date()
      });
      await defaultAdmin.save();
      console.log('✓ Default admin user seeded in MongoDB');
    }
  } catch (error) {
    console.error('✗ Error seeding default admin:', error.message);
  }
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  
  if (!cachedConnection) {
    cachedConnection = mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(async (conn) => {
      console.log('✓ MongoDB connected successfully');
      await seedAdmin();
      return conn;
    }).catch(err => {
      cachedConnection = null;
      console.error('✗ MongoDB connection error:', err.message);
      throw err;
    });
  }
  return cachedConnection;
}

// Middleware to ensure database connection is ready for all API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// Generic Delete All endpoint
app.delete('/api/:collection/all', async (req, res) => {
  const { collection } = req.params;
  try {
    let modelName = '';
    switch (collection.toLowerCase()) {
      case 'managers': modelName = 'Manager'; break;
      case 'coordinators': modelName = 'Coordinator'; break;
      case 'mohfezs': modelName = 'Mohfez'; break;
      case 'students': modelName = 'Student'; break;
      case 'branches': modelName = 'Branch'; break;
      case 'sessions': modelName = 'Session'; break;
      case 'users': modelName = 'User'; break;
      case 'monthlyreports': modelName = 'MonthlyReport'; break;
      case 'followupreports': modelName = 'FollowUpReport'; break;
      case 'applicants': modelName = 'Applicant'; break;
      case 'rowaqs': modelName = 'Rowaq'; break;
      case 'applicantbranches': modelName = 'ApplicantBranch'; break;
      case 'sessionreports': modelName = 'SessionReport'; break;
      case 'platformtopmanagement': modelName = 'PlatformTopManagement'; break;
      case 'platformsupervisors': modelName = 'PlatformSupervisor'; break;
      case 'platformcoordinators': modelName = 'PlatformCoordinator'; break;
      case 'platformmohfezs': modelName = 'PlatformMohfez'; break;
      case 'platformsessions': modelName = 'PlatformSession'; break;
      case 'platformstudents': modelName = 'PlatformStudent'; break;
      case 'platformapplicants': modelName = 'PlatformApplicant'; break;
      case 'platformrowaqs': modelName = 'PlatformRowaq'; break;
      case 'administrations': modelName = 'Administration'; break;
      case 'rolepermissions': modelName = 'RolePermission'; break;
      case 'shariacourses': modelName = 'ShariaCourse'; break;
      case 'shariabranches': modelName = 'ShariaBranch'; break;
      case 'shariastudents': modelName = 'ShariaStudent'; break;
      case 'shariateachers': modelName = 'ShariaTeacher'; break;
      case 'sharialives': modelName = 'ShariaLive'; break;
      case 'shariadailyreports': modelName = 'ShariaDailyReport'; break;
      default:
        return res.status(400).json({ message: 'Invalid collection name' });
    }
    
    const Model = mongoose.model(modelName);
    await Model.deleteMany({});
    res.json({ message: `All items in ${collection} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes
app.use('/api/managers', managerRoutes);
app.use('/api/coordinators', coordinatorRoutes);
app.use('/api/mohfezs', mohfezRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);

app.use('/api/monthlyreports', monthlyReportRoutes);
app.use('/api/followupreports', followUpReportRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/rowaqs', rowaqRoutes);
app.use('/api/applicantbranches', applicantBranchRoutes);
app.use('/api/sessionreports', sessionReportRoutes);
app.use('/api/platformtopmanagement', platformTopManagementRoutes);
app.use('/api/platformsupervisors', platformSupervisorRoutes);
app.use('/api/platformcoordinators', platformCoordinatorRoutes);
app.use('/api/platformmohfezs', platformMohfezRoutes);
app.use('/api/platformsessions', platformSessionRoutes);
app.use('/api/platformstudents', platformStudentRoutes);
app.use('/api/platformapplicants', platformApplicantRoutes);
app.use('/api/platformrowaqs', platformRowaqRoutes);
app.use('/api/administrations', administrationRoutes);
app.use('/api/rolepermissions', rolePermissionRoutes);

app.use('/api/shariacourses', shariaCourseRoutes);
app.use('/api/shariabranches', shariaBranchRoutes);
app.use('/api/shariastudents', shariaStudentRoutes);
app.use('/api/shariateachers', shariaTeacherRoutes);
app.use('/api/sharialives', shariaLiveRoutes);
app.use('/api/shariadailyreports', shariaDailyReportRoutes);
app.use('/api/sharianews', shariaNewsRoutes);

// Debug database endpoint
app.get('/api/debug-db', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const result = [];
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      result.push({ name: coll.name, count });
    }
    res.json({
      database: db.databaseName,
      collections: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ API endpoints available at http://localhost:${PORT}/api`);
  });
}

export default app;

