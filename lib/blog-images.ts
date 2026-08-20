/**
 * Curated pool of high-quality tech stock images from Unsplash.
 * No API key required — these are direct CDN URLs.
 * Categorized by topic so the cron generator can match them to blog content.
 */

export interface CoverImage {
  url: string;
  category: string;
  credit: string; // photographer name
}

const COVER_IMAGES: CoverImage[] = [
  // ── AI / Machine Learning ──────────────────────────────────────────
  { url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=630&fit=crop", category: "AI", credit: "Google DeepMind" },
  { url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=630&fit=crop", category: "AI", credit: "Andrea De Santis" },
  { url: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1200&h=630&fit=crop", category: "AI", credit: "Google DeepMind" },
  { url: "https://images.unsplash.com/photo-1684369175833-4b445ad6bfb5?w=1200&h=630&fit=crop", category: "AI", credit: "Google DeepMind" },
  { url: "https://images.unsplash.com/photo-1694903089438-bf1e2d8b4d4c?w=1200&h=630&fit=crop", category: "AI", credit: "Steve Johnson" },
  { url: "https://images.unsplash.com/photo-1717501218636-a390f9ac5957?w=1200&h=630&fit=crop", category: "AI", credit: "Google DeepMind" },

  // ── Web Development / Frontend ─────────────────────────────────────
  { url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&h=630&fit=crop", category: "Web Development", credit: "Gabriel Heinzer" },
  { url: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&h=630&fit=crop", category: "Web Development", credit: "Firmbee" },
  { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop", category: "Web Development", credit: "Carlos Muza" },
  { url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop", category: "Web Development", credit: "Christopher Gower" },
  { url: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=1200&h=630&fit=crop", category: "Web Development", credit: "Emile Perron" },

  // ── Backend / System Design ────────────────────────────────────────
  { url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop", category: "System Design", credit: "Taylor Vick" },
  { url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&h=630&fit=crop", category: "System Design", credit: "Thomas Jensen" },
  { url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop", category: "System Design", credit: "NASA" },
  { url: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&h=630&fit=crop", category: "System Design", credit: "Markus Spiske" },

  // ── Cloud / DevOps ─────────────────────────────────────────────────
  { url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&h=630&fit=crop", category: "Cloud", credit: "Growtika" },
  { url: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=1200&h=630&fit=crop", category: "Cloud", credit: "Sai Kiran Anagani" },
  { url: "https://images.unsplash.com/photo-1607799279861-4dd421887fc9?w=1200&h=630&fit=crop", category: "Cloud", credit: "Claudio Schwarz" },
  { url: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=630&fit=crop", category: "Cloud", credit: "Sigmund" },

  // ── Cybersecurity ──────────────────────────────────────────────────
  { url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=630&fit=crop", category: "Cybersecurity", credit: "Adi Goldstein" },
  { url: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=1200&h=630&fit=crop", category: "Cybersecurity", credit: "Towfiqu barbhuiya" },
  { url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=630&fit=crop", category: "Cybersecurity", credit: "Markus Spiske" },

  // ── Data / Analytics ───────────────────────────────────────────────
  { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop", category: "Data", credit: "Luke Chesser" },
  { url: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&h=630&fit=crop", category: "Data", credit: "Isaac Smith" },
  { url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=630&fit=crop", category: "Data", credit: "fabio" },

  // ── Mobile / Apps ──────────────────────────────────────────────────
  { url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=630&fit=crop", category: "Mobile", credit: "Rami Al-zayat" },
  { url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=630&fit=crop", category: "Mobile", credit: "Rami Al-zayat" },

  // ── Programming / Coding (General) ─────────────────────────────────
  { url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop", category: "Programming", credit: "Luca Bravo" },
  { url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&h=630&fit=crop", category: "Programming", credit: "Florian Olivo" },
  { url: "https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=1200&h=630&fit=crop", category: "Programming", credit: "Chris Ried" },
  { url: "https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?w=1200&h=630&fit=crop", category: "Programming", credit: "AltumCode" },
  { url: "https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=1200&h=630&fit=crop", category: "Programming", credit: "Gabriel Heinzer" },

  // ── Blockchain / Web3 ──────────────────────────────────────────────
  { url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop", category: "Blockchain", credit: "Shubham Dhage" },
  { url: "https://images.unsplash.com/photo-1644143379190-243a2f1eeea1?w=1200&h=630&fit=crop", category: "Blockchain", credit: "Shubham Dhage" },

  // ── Tech Industry / Startups ───────────────────────────────────────
  { url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=630&fit=crop", category: "Tech Industry", credit: "Marvin Meyer" },
  { url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop", category: "Tech Industry", credit: "Jason Goodman" },
  { url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=630&fit=crop", category: "Tech Industry", credit: "Austin Distel" },

  // ── Hardware / IoT ─────────────────────────────────────────────────
  { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop", category: "Hardware", credit: "Alexandre Debiève" },
  { url: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=1200&h=630&fit=crop", category: "Hardware", credit: "Robin Glauser" },
];

// Category aliases: map blog categories to image categories
const CATEGORY_ALIASES: Record<string, string> = {
  "Artificial Intelligence": "AI",
  "Machine Learning": "AI",
  "Deep Learning": "AI",
  "LLM": "AI",
  "Natural Language Processing": "AI",
  "Computer Vision": "AI",
  "Frontend": "Web Development",
  "React": "Web Development",
  "Next.js": "Web Development",
  "JavaScript": "Programming",
  "TypeScript": "Programming",
  "Python": "Programming",
  "Rust": "Programming",
  "Go": "Programming",
  "Java": "Programming",
  "Backend": "System Design",
  "Microservices": "System Design",
  "Architecture": "System Design",
  "Distributed Systems": "System Design",
  "Database": "System Design",
  "AWS": "Cloud",
  "Azure": "Cloud",
  "GCP": "Cloud",
  "Docker": "Cloud",
  "Kubernetes": "Cloud",
  "DevOps": "Cloud",
  "CI/CD": "Cloud",
  "Security": "Cybersecurity",
  "API Security": "Cybersecurity",
  "Analytics": "Data",
  "Big Data": "Data",
  "Data Engineering": "Data",
  "iOS": "Mobile",
  "Android": "Mobile",
  "React Native": "Mobile",
  "Flutter": "Mobile",
  "Web3": "Blockchain",
  "Crypto": "Blockchain",
  "Career": "Tech Industry",
  "Tech News": "Tech Industry",
  "Startups": "Tech Industry",
  "Tech Market": "Tech Industry",
  "Layoffs": "Tech Industry",
  "Hiring": "Tech Industry",
  "IoT": "Hardware",
  "Embedded": "Hardware",
  "Robotics": "Hardware",
};

/**
 * Get a relevant cover image for a blog post based on its category/tags.
 * Uses category matching with aliases, falls back to random tech images.
 */
export function getCoverImage(category: string, tags: string[] = []): CoverImage {
  // Try exact category match first
  let matchCategory = CATEGORY_ALIASES[category] || category;
  let candidates = COVER_IMAGES.filter(img => img.category === matchCategory);

  // Try matching against tags if no category match
  if (candidates.length === 0) {
    for (const tag of tags) {
      const aliasedCategory = CATEGORY_ALIASES[tag];
      if (aliasedCategory) {
        candidates = COVER_IMAGES.filter(img => img.category === aliasedCategory);
        if (candidates.length > 0) break;
      }
      // Direct tag match
      candidates = COVER_IMAGES.filter(img => img.category.toLowerCase() === tag.toLowerCase());
      if (candidates.length > 0) break;
    }
  }

  // Fallback: pick from all images
  if (candidates.length === 0) {
    candidates = COVER_IMAGES;
  }

  // Return a random image from candidates
  return candidates[Math.floor(Math.random() * candidates.length)];
}
