import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Please add your Mongo URI to .env.local");
  process.exit(1);
}

const client = new MongoClient(uri);

const pypiPackages = [
  {
    projectName: "langchain-playstore",
    repoUrl: "https://pypi.org/project/langchain-playstore/",
    prUrl: "",
    description: "LangChain retriever integration for Google Play Store — fetch app details and retrieve user reviews.",
    contributionType: "Package",
    status: "Published",
    techStack: ["Python", "LangChain", "Google Play"],
    stars: 0,
    createdAt: new Date("2026-08-28T12:00:00Z")
  },
  {
    projectName: "langchain-reddit",
    repoUrl: "https://pypi.org/project/langchain-reddit/",
    prUrl: "",
    description: "LangChain retriever integration for Reddit — search posts, fetch subreddit feeds, and retrieve full comment trees using PRAW.",
    contributionType: "Package",
    status: "Published",
    techStack: ["Python", "LangChain", "PRAW", "Reddit API"],
    stars: 0,
    createdAt: new Date("2026-08-28T12:00:00Z")
  },
  {
    projectName: "langchain-stackoverflow",
    repoUrl: "https://pypi.org/project/langchain-stackoverflow/",
    prUrl: "",
    description: "LangChain retriever integration for Stack Overflow — search questions and retrieve full answers from the Stack Exchange network.",
    contributionType: "Package",
    status: "Published",
    techStack: ["Python", "LangChain", "StackExchange API"],
    stars: 0,
    createdAt: new Date("2026-08-28T12:00:00Z")
  },
  {
    projectName: "langchain-hackernews",
    repoUrl: "https://pypi.org/project/langchain-hackernews/",
    prUrl: "",
    description: "LangChain retriever integration for Hacker News — search stories, fetch the front page, and retrieve full comment threads without API keys.",
    contributionType: "Package",
    status: "Published",
    techStack: ["Python", "LangChain", "HackerNews API"],
    stars: 0,
    createdAt: new Date("2026-08-28T12:00:00Z")
  },
  {
    projectName: "langchain-youtube",
    repoUrl: "https://pypi.org/project/langchain-youtube/",
    prUrl: "",
    description: "LangChain retriever integration for YouTube — search videos, fetch playlists, extract transcripts, retrieve video metadata, and fetch comments.",
    contributionType: "Package",
    status: "Published",
    techStack: ["Python", "LangChain", "YouTube Data API"],
    stars: 0,
    createdAt: new Date("2026-08-28T12:00:00Z")
  }
];

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const appDb = client.db();
    
    for (const pkg of pypiPackages) {
      const exists = await appDb.collection('openSourceContributions').findOne({ projectName: pkg.projectName });
      if (!exists) {
        await appDb.collection('openSourceContributions').insertOne(pkg);
        console.log(`Inserted ${pkg.projectName}`);
      } else {
        console.log(`${pkg.projectName} already exists, skipping.`);
      }
    }
    
    console.log("Successfully seeded PyPI packages!");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
