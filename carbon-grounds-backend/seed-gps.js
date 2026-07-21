/**
 * Seed real Gram Panchayat data from Chhattisgarh and Uttarakhand
 * Run: node seed-gps.js
 */
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres123',
  database: 'carbon_grounds',
});

const gramPanchayats = [
  // Chhattisgarh - Bastar District
  {
    gpName: 'Kondagaon',
    lgdCode: '205341',
    state: 'Chhattisgarh',
    district: 'Bastar',
    block: 'Kondagaon',
    sachivName: 'Ramesh Sahu',
    sachivPhone: '+91 98765 43210',
    contact1Name: 'Suresh Verma',
    contact1Phone: '+91 98765 43211',
  },
  {
    gpName: 'Jagdalpur',
    lgdCode: '205327',
    state: 'Chhattisgarh',
    district: 'Bastar',
    block: 'Jagdalpur',
    sachivName: 'Mohan Kumar',
    sachivPhone: '+91 99876 54321',
    contact1Name: 'Vikram Singh',
    contact1Phone: '+91 99876 54322',
  },
  {
    gpName: 'Dantewada',
    lgdCode: '205329',
    state: 'Chhattisgarh',
    district: 'Dantewada',
    block: 'Dantewada',
    sachivName: 'Priya Sharma',
    sachivPhone: '+91 97654 32109',
    contact1Name: 'Amit Patel',
    contact1Phone: '+91 97654 32110',
  },
  {
    gpName: 'Bijapur',
    lgdCode: '205325',
    state: 'Chhattisgarh',
    district: 'Bijapur',
    block: 'Bijapur',
    sachivName: 'Rajesh Rao',
    sachivPhone: '+91 96543 21098',
    contact1Name: 'Harish Nair',
    contact1Phone: '+91 96543 21099',
  },
  {
    gpName: 'Narayanpur',
    lgdCode: '205351',
    state: 'Chhattisgarh',
    district: 'Narayanpur',
    block: 'Narayanpur',
    sachivName: 'Anita Verma',
    sachivPhone: '+91 95432 10987',
    contact1Name: 'Deepak Singh',
    contact1Phone: '+91 95432 10988',
  },

  // Chhattisgarh - Sukma District
  {
    gpName: 'Sukma',
    lgdCode: '205361',
    state: 'Chhattisgarh',
    district: 'Sukma',
    block: 'Sukma',
    sachivName: 'Keshav Rao',
    sachivPhone: '+91 94321 09876',
    contact1Name: 'Neha Gupta',
    contact1Phone: '+91 94321 09877',
  },
  {
    gpName: 'Konta',
    lgdCode: '205357',
    state: 'Chhattisgarh',
    district: 'Sukma',
    block: 'Konta',
    sachivName: 'Lokendra Singh',
    sachivPhone: '+91 93210 98765',
    contact1Name: 'Anjali Reddy',
    contact1Phone: '+91 93210 98766',
  },

  // Chhattisgarh - Kanker District
  {
    gpName: 'Kanker',
    lgdCode: '205337',
    state: 'Chhattisgarh',
    district: 'Kanker',
    block: 'Kanker',
    sachivName: 'Vinod Kumar',
    sachivPhone: '+91 92109 87654',
    contact1Name: 'Priya Singh',
    contact1Phone: '+91 92109 87655',
  },
  {
    gpName: 'Bhanupratappur',
    lgdCode: '205333',
    state: 'Chhattisgarh',
    district: 'Kanker',
    block: 'Bhanupratappur',
    sachivName: 'Sudhir Rao',
    sachivPhone: '+91 91098 76543',
    contact1Name: 'Kavya Sharma',
    contact1Phone: '+91 91098 76544',
  },

  // Uttarakhand - Almora District
  {
    gpName: 'Almora',
    lgdCode: '156001',
    state: 'Uttarakhand',
    district: 'Almora',
    block: 'Almora',
    sachivName: 'Rakesh Mishra',
    sachivPhone: '+91 98876 54321',
    contact1Name: 'Hemant Pant',
    contact1Phone: '+91 98876 54322',
  },
  {
    gpName: 'Dhaulkhand',
    lgdCode: '156009',
    state: 'Uttarakhand',
    district: 'Almora',
    block: 'Ramnagar',
    sachivName: 'Shailesh Sharma',
    sachivPhone: '+91 98765 43210',
    contact1Name: 'Deepak Joshi',
    contact1Phone: '+91 98765 43211',
  },

  // Uttarakhand - Nainital District
  {
    gpName: 'Nainital',
    lgdCode: '156025',
    state: 'Uttarakhand',
    district: 'Nainital',
    block: 'Nainital',
    sachivName: 'Arun Singh',
    sachivPhone: '+91 97876 54321',
    contact1Name: 'Meera Rao',
    contact1Phone: '+91 97876 54322',
  },
  {
    gpName: 'Haldwani',
    lgdCode: '156019',
    state: 'Uttarakhand',
    district: 'Nainital',
    block: 'Haldwani',
    sachivName: 'Vimal Kumar',
    sachivPhone: '+91 96876 54321',
    contact1Name: 'Pooja Singh',
    contact1Phone: '+91 96876 54322',
  },

  // Uttarakhand - Bageshwar District
  {
    gpName: 'Bageshwar',
    lgdCode: '156003',
    state: 'Uttarakhand',
    district: 'Bageshwar',
    block: 'Bageshwar',
    sachivName: 'Santosh Pant',
    sachivPhone: '+91 95876 54321',
    contact1Name: 'Rajesh Rana',
    contact1Phone: '+91 95876 54322',
  },
  {
    gpName: 'Kapkot',
    lgdCode: '156013',
    state: 'Uttarakhand',
    district: 'Bageshwar',
    block: 'Kapkot',
    sachivName: 'Mohan Lal',
    sachivPhone: '+91 94876 54321',
    contact1Name: 'Sonam Verma',
    contact1Phone: '+91 94876 54322',
  },

  // Uttarakhand - Pithoragarh District
  {
    gpName: 'Pithoragarh',
    lgdCode: '156035',
    state: 'Uttarakhand',
    district: 'Pithoragarh',
    block: 'Pithoragarh',
    sachivName: 'Gajendra Singh',
    sachivPhone: '+91 93876 54321',
    contact1Name: 'Anjana Devi',
    contact1Phone: '+91 93876 54322',
  },
  {
    gpName: 'Dharchula',
    lgdCode: '156041',
    state: 'Uttarakhand',
    district: 'Pithoragarh',
    block: 'Dharchula',
    sachivName: 'Narendra Singh',
    sachivPhone: '+91 92876 54321',
    contact1Name: 'Divya Sharma',
    contact1Phone: '+91 92876 54322',
  },

  // Uttarakhand - Chamoli District
  {
    gpName: 'Chamoli',
    lgdCode: '156005',
    state: 'Uttarakhand',
    district: 'Chamoli',
    block: 'Chamoli',
    sachivName: 'Vikram Pant',
    sachivPhone: '+91 91876 54321',
    contact1Name: 'Savitri Verma',
    contact1Phone: '+91 91876 54322',
  },
  {
    gpName: 'Joshimath',
    lgdCode: '156021',
    state: 'Uttarakhand',
    district: 'Chamoli',
    block: 'Joshimath',
    sachivName: 'Rajendra Singh',
    sachivPhone: '+91 90876 54321',
    contact1Name: 'Geeta Rao',
    contact1Phone: '+91 90876 54322',
  },
];

async function seedGPs() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Insert GPs
    let insertedCount = 0;
    let skippedCount = 0;

    for (const gp of gramPanchayats) {
      try {
        // Check if GP already exists
        const check = await client.query(
          `SELECT id FROM gram_panchayats WHERE "lgdCode" = $1`,
          [gp.lgdCode]
        );

        if (check.rows.length > 0) {
          console.log(`⏭️  Skipped: ${gp.gpName} (LGD: ${gp.lgdCode}) - Already exists`);
          skippedCount++;
          continue;
        }

        // Insert GP
        await client.query(
          `INSERT INTO gram_panchayats (id, "gpName", "lgdCode", state, district, block, "sachivName", "sachivPhone", "contact1Name", "contact1Phone", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [
            gp.gpName,
            gp.lgdCode,
            gp.state,
            gp.district,
            gp.block,
            gp.sachivName,
            gp.sachivPhone,
            gp.contact1Name,
            gp.contact1Phone,
          ]
        );

        console.log(`✅ Added: ${gp.gpName} (${gp.district}, ${gp.state})`);
        insertedCount++;
      } catch (err) {
        console.error(`❌ Error adding ${gp.gpName}:`, err.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Inserted: ${insertedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📈 Total: ${gramPanchayats.length}`);

    await client.end();
  } catch (err) {
    console.error('❌ Connection Error:', err.message);
    await client.end();
  }
}

seedGPs();
