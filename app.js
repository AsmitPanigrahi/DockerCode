require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'studentdb'
};

// Create database connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    return false;
  }
}

// Create students table if not exists
async function createTable() {
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        student_name VARCHAR(100) NOT NULL,
        course VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableSQL);
    console.log('Students table created or already exists');
    return true;
  } catch (error) {
    console.error('Error creating table:', error);
    return false;
  }
}

// Initialize database connection and create table
async function initializeDatabase() {
  let retries = 5;
  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      console.log('Successfully connected to the database');
      connection.release();
      
      // Create table
      const tableCreated = await createTable();
      if (tableCreated) {
        console.log('Database initialization completed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Database connection failed, retrying... (${retries} attempts left)`);
      retries--;
      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  console.error('Failed to initialize database after multiple attempts');
  return false;
}

// Initialize the database when the server starts
initializeDatabase().then(success => {
  if (!success) {
    console.error('Failed to initialize database, some features may not work');
  }
});

// Routes
// Create a new student
app.post('/student', async (req, res) => {
  try {
    const { studentID, studentName, course } = req.body;
    
    // Validate required fields
    if (!studentID || !studentName || !course) {
      return res.status(400).json({ 
        error: 'Missing required fields: studentID, studentName, course' 
      });
    }

    // Check if student already exists
    const [existing] = await pool.query(
      'SELECT * FROM students WHERE student_id = ?', 
      [studentID]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        message: 'Student already exists',
        student: {
          studentID: existing[0].student_id,
          studentName: existing[0].student_name,
          course: existing[0].course,
          presentDate: existing[0].created_at
        }
      });
    }

    // Insert new student
    const [result] = await pool.query(
      'INSERT INTO students (student_id, student_name, course) VALUES (?, ?, ?)',
      [studentID, studentName, course]
    );

    const [newStudent] = await pool.query(
      'SELECT * FROM students WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Student created successfully',
      student: {
        studentID: newStudent[0].student_id,
        studentName: newStudent[0].student_name,
        course: newStudent[0].course,
        presentDate: newStudent[0].created_at
      }
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all students
app.get('/students', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT * FROM students');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
