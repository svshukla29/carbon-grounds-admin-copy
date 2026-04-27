const bcrypt = require('bcrypt');
const { Client } = require('pg');

const c = new Client({
  host: 'rds-prof-harshit-lakra.cvs75htsmowj.ap-south-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'postresearch321',
  database: 'carbon_grounds',
  ssl: { rejectUnauthorized: false },
});

c.connect().then(async () => {
  const hash = await bcrypt.hash('Admin@123', 10);
  await c.query(
    'UPDATE users SET password=$1, "isActive"=true WHERE email=$2',
    [hash, 'admin@carbongrounds.com']
  );
  console.log('✅ Password updated! Login with: admin@carbongrounds.com / Admin@123');
  c.end();
}).catch(e => {
  console.error('❌ Error:', e.message);
  c.end();
});
