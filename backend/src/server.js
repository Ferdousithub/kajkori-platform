const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'kajkori-secret-2024';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const result = await db.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'KajKori API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      jobs: 'GET /api/jobs',
      createJob: 'POST /api/jobs',
      apply: 'POST /api/applications',
      profile: 'GET /api/users/profile/:id'
    }
  });
});

// ==================== AUTH ROUTES ====================

// Register new user
app.post('/api/auth/register', [
  body('phone_number').isMobilePhone(),
  body('name').isLength({ min: 2 }),
  body('password').isLength({ min: 6 }),
  body('user_type').isIn(['job_seeker', 'employer'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone_number, name, email, password, user_type } = req.body;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phone_number]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this phone number' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      `INSERT INTO users (phone_number, name, email, password, user_type) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, phone_number, name, email, user_type, created_at`,
      [phone_number, name, email, hashedPassword, user_type]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        phone_number: user.phone_number,
        name: user.name,
        email: user.email,
        user_type: user.user_type
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login
app.post('/api/auth/login', [
  body('phone_number').isMobilePhone(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone_number, password } = req.body;

    // Find user
    const result = await db.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phone_number]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        phone_number: user.phone_number,
        name: user.name,
        email: user.email,
        user_type: user.user_type
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// ==================== JOB ROUTES ====================

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const { district, job_type, min_salary, max_salary, limit = 20 } = req.query;

    let query = `
      SELECT j.*, u.name as employer_name, ep.business_name
      FROM jobs j
      LEFT JOIN users u ON j.employer_id = u.id
      LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
      WHERE j.status = 'active'
    `;
    const params = [];
    let paramCount = 1;

    if (district) {
      query += ` AND j.district = $${paramCount}`;
      params.push(district);
      paramCount++;
    }

    if (job_type) {
      query += ` AND j.job_type = $${paramCount}`;
      params.push(job_type);
      paramCount++;
    }

    if (min_salary) {
      query += ` AND j.salary_max >= $${paramCount}`;
      params.push(min_salary);
      paramCount++;
    }

    query += ` ORDER BY j.created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await db.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      jobs: result.rows
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
  }
});

// Create new job
app.post('/api/jobs', [
  body('title').isLength({ min: 3 }),
  body('category').exists(),
  body('salary_min').isNumeric(),
  body('salary_max').isNumeric(),
  body('district').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      employer_id,
      title,
      category,
      description,
      required_skills,
      salary_min,
      salary_max,
      positions,
      job_type,
      shift,
      district,
      benefits
    } = req.body;

    const result = await db.query(
      `INSERT INTO jobs (
        employer_id, title, category, description, required_skills,
        salary_min, salary_max, positions, job_type, shift, district, benefits
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        employer_id, title, category, description, required_skills || [],
        salary_min, salary_max, positions || 1, job_type || 'full_time',
        shift || 'day', district, benefits || []
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: result.rows[0]
    });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job', details: error.message });
  }
});

// Get single job
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT j.*, u.name as employer_name, ep.business_name, ep.business_type
       FROM jobs j
       LEFT JOIN users u ON j.employer_id = u.id
       LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment view count
    await db.query(
      'UPDATE jobs SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      job: result.rows[0]
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job', details: error.message });
  }
});

// ==================== APPLICATION ROUTES ====================

// Apply to job
app.post('/api/applications', [
  body('job_id').isUUID(),
  body('worker_id').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { job_id, worker_id, cover_letter } = req.body;

    // Get job details
    const jobResult = await db.query('SELECT * FROM jobs WHERE id = $1', [job_id]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobResult.rows[0];

    // Check if already applied
    const existingApp = await db.query(
      'SELECT * FROM applications WHERE job_id = $1 AND worker_id = $2',
      [job_id, worker_id]
    );

    if (existingApp.rows.length > 0) {
      return res.status(400).json({ error: 'Already applied to this job' });
    }

    // Create application
    const result = await db.query(
      `INSERT INTO applications (job_id, worker_id, employer_id, cover_letter, status)
       VALUES ($1, $2, $3, $4, 'applied')
       RETURNING *`,
      [job_id, worker_id, job.employer_id, cover_letter]
    );

    // Update job application count
    await db.query(
      'UPDATE jobs SET application_count = application_count + 1 WHERE id = $1',
      [job_id]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: result.rows[0]
    });

  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ error: 'Failed to submit application', details: error.message });
  }
});

// Get user applications
app.get('/api/applications/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `SELECT a.*, j.title as job_title, j.category, j.salary_min, j.salary_max,
              u.name as employer_name, ep.business_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON a.employer_id = u.id
       LEFT JOIN employer_profiles ep ON a.employer_id = ep.user_id
       WHERE a.worker_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      applications: result.rows
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications', details: error.message });
  }
});

// ==================== USER ROUTES ====================

// Get user profile
app.get('/api/users/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, phone_number, name, email, user_type, is_verified, created_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

// ==================== STATS ROUTES ====================

// Get platform stats
app.get('/api/stats', async (req, res) => {
  try {
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const jobsCount = await db.query("SELECT COUNT(*) FROM jobs WHERE status = 'active'");
    const applicationsCount = await db.query('SELECT COUNT(*) FROM applications');

    res.json({
      success: true,
      stats: {
        total_users: parseInt(usersCount.rows[0].count),
        active_jobs: parseInt(jobsCount.rows[0].count),
        total_applications: parseInt(applicationsCount.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KajKori Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});
```

---

## ✅ **Step 4: Create the config folder structure**

Create this folder if it doesn't exist:
```
backend/src/config/
```

---

## ✅ **Step 5: Update Environment Variables on Render**

1. Go to Render Dashboard
2. Click on **kajkori-backend**
3. Click **"Environment"** (left sidebar)
4. Make sure you have:
```
DATABASE_URL=postgresql://kajkori_user:V8OUND66IIy51TQ5BrURxHJmfb8P5IEV@dpg-d4mbffqdbo4c73aj1k8g-a.frankfurt-postgres.render.com/kajkori
JWT_SECRET=kajkori-secret-key-2024
NODE_ENV=production
PORT=10000