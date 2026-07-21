/**
 * Reset admin password to Admin@123
 * Run: node reset-admin.js
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

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const result = await client.query(
      `UPDATE "users" SET password = $1, "isActive" = true, role = 'ADMIN' WHERE email = 'admin@carbongrounds.com' RETURNING id`,
      [hashedPassword]
    );

    if (result.rows.length > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('   Email:    admin@carbongrounds.com');
      console.log('   Password: Admin@123');
    } else {
      console.log('❌ Admin user not found');
    }

    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
