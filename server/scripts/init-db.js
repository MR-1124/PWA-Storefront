const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    // Connect without specifying database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('Connected to MySQL server');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema...');
    await connection.query(schema);
    console.log('Schema created successfully');

    // Read and execute seeds
    const seedsPath = path.join(__dirname, '../database/seeds.sql');
    const seeds = fs.readFileSync(seedsPath, 'utf8');
    
    console.log('Executing seeds...');
    await connection.query(seeds);
    console.log('Seeds inserted successfully');

    await connection.end();
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
