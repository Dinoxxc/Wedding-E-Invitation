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

    // Create guest list table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS guest_list (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        invitation_type ENUM('VIP', 'Regular') DEFAULT 'Regular',
        max_guests INT DEFAULT 1,
        qr_code VARCHAR(255),
        unique_code VARCHAR(255) UNIQUE NOT NULL,
        table_number INT,
        checked_in BOOLEAN DEFAULT FALSE,
        check_in_time DATETIME,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_unique_code (unique_code),
        INDEX idx_email (email),
        INDEX idx_checked_in (checked_in)
      )
    `);
    console.log('✓ Guest list table created');

    // Create photos table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        path VARCHAR(500) NOT NULL,
        uploaded_by VARCHAR(255) DEFAULT 'Anonymous',
        caption TEXT,
        approved BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_approved (approved),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ Photos table created');

    // Create gifts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guest_name VARCHAR(255) NOT NULL,
        gift_type ENUM('cash', 'physical', 'other') DEFAULT 'physical',
        amount DECIMAL(10, 2),
        description TEXT,
        received_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_gift_type (gift_type),
        INDEX idx_received_date (received_date)
      )
    `);
    console.log('✓ Gifts table created');

    // Create seating tables table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS seating_tables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_number INT UNIQUE NOT NULL,
        table_name VARCHAR(255),
        capacity INT DEFAULT 10,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_table_number (table_number)
      )
    `);
    console.log('✓ Seating tables table created');

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
