
import { createClient } from '@libsql/client';

const URL = "libsql://greenvalleyseeds-hashspider.aws-ap-south-1.turso.io";
const TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc1ODQ5NDYsImlkIjoiZTE1ODBkNzYtMjkzYi00NjhiLTk3MWQtNDBhOTVjODc4MmM4IiwicmlkIjoiNWNjMWY2NGItZjU4My00ZDIyLWExMjItYTVjZjc2MGJlNzQ4In0.vU6JeKE8X1pfkidDMHmT6XFRKGY35AwugB-MRIgWMhiRCAtpTyqE6i5Dis2t8pahFFyrCKGyize-wvXYNgI0BQ";

const client = createClient({
  url: URL,
  authToken: TOKEN,
});

async function testConnection() {
  console.log('Testing connection to old Turso database...');
  try {
    const result = await client.execute('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('Connection successful!');
    console.log('Found tables:', result.rows.map(r => r.name).join(', '));
  } catch (error: any) {
    console.error('Failed to connect to old database:');
    console.error(error.message);
    if (error.message.includes('limit') || error.message.includes('quota')) {
      console.error('--- ALERT: YOUR ACCOUNT IS COMPLETELY LOCKED BY READ LIMITS ---');
    }
  }
}

testConnection();
