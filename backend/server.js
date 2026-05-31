import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✓ MongoDB connected successfully'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    console.log('⚠ Server running without active MongoDB connection. Please check your DB connection.');
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

