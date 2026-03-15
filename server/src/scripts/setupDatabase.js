import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from server/.env
dotenv.config({ path: path.join(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..', '..');

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Essential for running full SQL scripts
  });

  try {
    const dbName = process.env.DB_NAME || 'elective_assistant';
    console.log(`Checking/Creating database: ${dbName}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`);
    await connection.query(`USE ${dbName};`);

    // Disable foreign key checks to avoid dependency issues during setup
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 1. Run Migrations
    const migrationsDir = path.join(rootDir, 'database', 'migrations');
    const migrationFiles = (await fs.readdir(migrationsDir)).sort();
    
    console.log('\nRunning Migrations...');
    for (const file of migrationFiles) {
      if (file.endsWith('.sql')) {
        console.log(`Executing: ${file}`);
        const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
        await connection.query(sql);
      }
    }

    // 2. Run Seeds
    const seedsDir = path.join(rootDir, 'database', 'seeds');
    const seedFiles = (await fs.readdir(seedsDir)).sort();
    
    console.log('\nRunning Seeds...');
    for (const file of seedFiles) {
      if (file.endsWith('.sql')) {
        console.log(`Executing: ${file}`);
        const sql = await fs.readFile(path.join(seedsDir, file), 'utf8');
        await connection.query(sql);
      }
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('\nDatabase setup completed successfully!');
  } catch (error) {
    console.error('\nDatabase setup failed:');
    console.error(error.message);
  } finally {
    await connection.end();
  }
}

setupDatabase();
