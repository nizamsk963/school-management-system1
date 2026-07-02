require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const marksRoutes = require('./routes/marks');
const attendanceRoutes = require('./routes/attendance');
const homeworkRoutes = require('./routes/homework');
const remarksRoutes = require('./routes/remarks');
const examsRoutes = require('./routes/exams');
const eventsRoutes = require('./routes/events');
const feesRoutes = require('./routes/fees');
const classesRoutes = require('./routes/classes');

const app = express();

const startServer = async () => {
  try {
    await connectDB();

    // Sync Class model indexes to remove any stale collection index definitions.
    const Class = require('./models/Class');
    await Class.syncIndexes();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/students', studentRoutes);
    app.use('/api/teachers', teacherRoutes);
    app.use('/api/marks', marksRoutes);
    app.use('/api/attendance', attendanceRoutes);
    app.use('/api/homework', homeworkRoutes);
    app.use('/api/remarks', remarksRoutes);
    app.use('/api/exams', examsRoutes);
    app.use('/api/events', eventsRoutes);
    app.use('/api/fees', feesRoutes);
    app.use('/api/classes', classesRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ message: 'Server is running' });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
