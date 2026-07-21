/**
 * Create admin user in LOCAL PostgreSQL database.
 * Run: node seed-admin-local.js
 */
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres123',
  database: 'carbon_grounds',
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to local database');

    // Check if admin already exists
    const check = await client.query(
      `SELECT id FROM "users" WHERE email = 'admin@carbongrounds.com'`
    );

    if (check.rows.length > 0) {
      console.log('Admin user already exists!');
      console.log('   Email:    admin@carbongrounds.com');
      console.log('   Password: Admin@123');
      await client.end();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Insert admin user
    await client.query(
      `INSERT INTO "users" (id, name, email, password, role, "isActive", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), 'Super Admin', 'admin@carbongrounds.com', $1, 'ADMIN', true, NOW(), NOW())`,
      [hashedPassword]
    );

    console.log('Admin user created successfully!');
    console.log('   Email:    admin@carbongrounds.com');
    console.log('   Password: Admin@123');

    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    await client.end();
  }
}

run();
