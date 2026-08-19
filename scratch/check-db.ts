import { MongoClient } from 'mongodb';

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://shoaibm125:LpTvsZSTvGk0G2Q3@cluster0.n1p6h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('github_portfolio');
    const collections = await db.listCollections().toArray();
    console.log("Collections:");
    console.log(collections.map(c => c.name).join(', '));
  } finally {
    await client.close();
  }
}
run().catch(console.error);
