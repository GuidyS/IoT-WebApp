import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(process.env.MONGODB_URI as string);
  
  try {
    await client.connect();
    console.log("Connected successfully!");
    
    const db = client.db(process.env.MONGODB_DATABASE);
    const collection = db.collection('device_states');
    
    // Insert dummy data
    const result = await collection.insertOne({
      deviceId: 'floor_pad_test_01',
      state: true,
      temperature: 24.5,
      updatedAt: new Date().toISOString(),
      source: 'test_script'
    });
    
    console.log("Successfully inserted test data with id:", result.insertedId);
  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    await client.close();
  }
}

run();
