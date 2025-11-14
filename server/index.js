const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting - General API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // increased from 100 to 200 requests per windowMs
  trustProxy: true,
  message: 'Too many API requests from this IP, please try again later.'
});

// Rate limiting - Images (more generous)
const imageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 image requests per 15 minutes
  trustProxy: true,
  message: 'Too many image requests from this IP, please try again later.'
});

// Apply general rate limiting to API routes
app.use('/api', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files with proper MIME types and rate limiting
app.use('/uploads', imageLimiter, express.static('uploads'));

// Serve images with correct content type and generous rate limiting
app.use('/images', imageLimiter, express.static('uploads/images', {
  setHeaders: (res, path) => {
    if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Initialize database on first run
async function initializeDatabaseIfNeeded() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'pwa_ecommerce',
      multipleStatements: true
    });

    // Check if tables exist
    const [tables] = await connection.query("SHOW TABLES");
    
    if (tables.length === 0) {
      console.log('No tables found. Initializing database...');
      
      // Read and execute schema
      const schemaPath = path.join(__dirname, 'database/schema.sql');
      let schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Remove CREATE DATABASE and USE statements
      schema = schema.replace(/CREATE DATABASE IF NOT EXISTS.*?;/gi, '');
      schema = schema.replace(/USE .*?;/gi, '');
      
      await connection.query(schema);
      console.log('✓ Schema created');

      // Read and execute seeds
      const seedsPath = path.join(__dirname, 'database/seeds.sql');
      let seeds = fs.readFileSync(seedsPath, 'utf8');
      
      // Remove USE statements
      seeds = seeds.replace(/USE .*?;/gi, '');
      
      await connection.query(seeds);
      console.log('✓ Sample data inserted');
      
      console.log('Database initialization complete!');
    } else {
      console.log('Database already initialized');
    }

    await connection.end();
  } catch (error) {
    console.error('Database initialization check failed:', error.message);
  }
}

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  // Initialize database if needed
  await initializeDatabaseIfNeeded();
});