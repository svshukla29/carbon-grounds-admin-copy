const { Client } = require('pg');

const client = new Client({
  host: 'rds-prof-harshit-lakra.cvs75htsmowj.ap-south-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'postresearch321',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => client.query('CREATE DATABASE carbon_grounds'))
  .then(() => {
    console.log('✅ Database carbon_grounds created!');
    client.end();
  })
  .catch((err) => {
    if (err.code === '42P04') {
      console.log('✅ Database carbon_grounds already exists!');
    } else {
      console.error('❌ Error:', err.message);
    }
    client.end();
  });
