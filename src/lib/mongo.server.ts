// MongoDB Node Driver wrapper — server-only
// Replaces deprecated Data API
import { MongoClient, ObjectId, Document } from "mongodb";

const URI = () => process.env.MONGODB_URI!;
const DATABASE = () => process.env.MONGODB_DATABASE!;

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getClient(): Promise<MongoClient> {
  const uri = URI();
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (client) {
    return client;
  }

  if (!clientPromise) {
    const clientInstance = new MongoClient(uri);
    clientPromise = clientInstance.connect();
  }

  try {
    client = await clientPromise;
  } catch (e) {
    clientPromise = null;
    throw e;
  }

  return client;
}

async function getDb() {
  const dbClient = await getClient();
  const dbName = DATABASE();
  if (!dbName) {
    throw new Error("MONGODB_DATABASE is not configured");
  }
  return dbClient.db(dbName);
}

type ActionBody = Record<string, unknown>;

export const mongo = {
  find: async <T>(collection: string, filter: ActionBody = {}, opts: ActionBody = {}) => {
    const db = await getDb();
    if (filter._id && typeof filter._id === 'object' && filter._id !== null && '$oid' in filter._id) {
       filter._id = new ObjectId((filter._id as any).$oid);
    }
    const documents = await db.collection(collection).find(filter, opts).toArray();
    // Convert ObjectId to string for Seroval serialization
    const mappedDocuments = documents.map(doc => ({
      ...doc,
      _id: doc._id.toString()
    }));
    return { documents: mappedDocuments as unknown as T[] };
  },
  findOne: async <T>(collection: string, filter: ActionBody = {}) => {
    const db = await getDb();
    if (filter._id && typeof filter._id === 'object' && filter._id !== null && '$oid' in filter._id) {
       filter._id = new ObjectId((filter._id as any).$oid);
    }
    const document = await db.collection(collection).findOne(filter);
    if (!document) return { document: null };
    
    // Convert ObjectId to string for Seroval serialization
    const mappedDocument = {
      ...document,
      _id: document._id.toString()
    };
    return { document: mappedDocument as unknown as T };
  },
  insertOne: async (collection: string, document: ActionBody) => {
    const db = await getDb();
    const result = await db.collection(collection).insertOne(document);
    return { insertedId: result.insertedId.toString() };
  },
  updateOne: async (collection: string, filter: ActionBody, update: ActionBody, upsert = false) => {
    const db = await getDb();
    if (filter._id && typeof filter._id === 'object' && filter._id !== null && '$oid' in filter._id) {
       filter._id = new ObjectId((filter._id as any).$oid);
    }
    const result = await db.collection(collection).updateOne(filter, update, { upsert });
    return { 
      matchedCount: result.matchedCount, 
      modifiedCount: result.modifiedCount, 
      upsertedId: result.upsertedId?.toString() 
    };
  },
  deleteOne: async (collection: string, filter: ActionBody) => {
    const db = await getDb();
    if (filter._id && typeof filter._id === 'object' && filter._id !== null && '$oid' in filter._id) {
       filter._id = new ObjectId((filter._id as any).$oid);
    }
    const result = await db.collection(collection).deleteOne(filter);
    return { deletedCount: result.deletedCount };
  },
};

export const COLLECTIONS = {
  deviceStates: "device_states",
  automations: "automations",
} as const;
