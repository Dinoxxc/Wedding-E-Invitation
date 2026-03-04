require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDatabase() {
  try {
    // Connect without database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'wedding_invitation';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✓ Database '${dbName}' created or already exists`);

    // Use the database
    await connection.query(`USE \`${dbName}\``);

    // Create RSVP table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rsvp (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guest_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        attendance ENUM('attending', 'not_attending') NOT NULL,
        number_of_guests INT DEFAULT 1,
        dietary_restrictions TEXT,
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_attendance (attendance)
      )
    `);
    console.log('✓ RSVP table created');

    // Create messages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guest_name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        approved BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_approved (approved),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ Messages table created');

    // Create admin table (for authentication)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Admin users table created');

    await connection.end();
    console.log('\n✓ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Copy .env.example to .env and update database credentials');
    console.log('2. Run: npm install');
    console.log('3. Run: npm start');

  } catch (error) {
    console.error('✗ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
