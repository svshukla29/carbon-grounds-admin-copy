/**
 * One-time script to create admin user in the database.
 * Run: node seed-admin.js
 */
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: 'rds-prof-harshit-lakra.cvs75htsmowj.ap-south-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'postresearch321',
  database: 'carbon_grounds',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('✅ Connected to database');

  // Check if admin already exists
  const check = await client.query(
    `SELECT id FROM "user" WHERE email = 'admin@carbongrounds.com'`
  );

  if (check.rows.length > 0) {
    console.log('✅ Admin user already exists!');
    await client.end();
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // Insert admin user
  await client.query(
    `INSERT INTO "user" (id, name, email, password, role, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), 'Super Admin', 'admin@carbongrounds.com', $1, 'ADMIN', NOW(), NOW())`,
    [hashedPassword]
  );

  console.log('✅ Admin user created!');
  console.log('   Email:    admin@carbongrounds.com');
  console.log('   Password: Admin@123');

  await client.end();
}

run().catch((err) => {
  console.error('❌ Error:', err.message);
  client.end();
});
