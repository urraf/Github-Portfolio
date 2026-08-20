/**
 * Pexels API integration for fetching relevant blog cover images.
 * 
 * Free tier: 200 requests/month (more than enough for 2 blogs/day = ~60/month)
 * Sign up: https://www.pexels.com/api/ (instant, no credit card)
 * 
 * Falls back to curated Unsplash pool if no API key is configured.
 */

import { getCoverImage } from '@/lib/blog-images';

interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    landscape: string;
  };
  photographer: string;
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
}

/**
 * Search Pexels for a relevant image based on the AI-generated query.
 * Falls back to curated pool if Pexels API key is not configured or search fails.
 */
export async function searchCoverImage(
  imageQuery: string,
  category: string,
  tags: string[] = []
): Promise<{ url: string; credit: string }> {
  const pexelsKey = process.env.PEXELS_API_KEY;

  // If we have a Pexels API key, search for a relevant image
  if (pexelsKey && imageQuery) {
    try {
      const searchQuery = encodeURIComponent(imageQuery + ' technology');
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=5&orientation=landscape&size=large`,
        {
          headers: { Authorization: pexelsKey },
        }
      );

      if (res.ok) {
        const data: PexelsResponse = await res.json();
        if (data.photos && data.photos.length > 0) {
          // Pick a random photo from the top 5 results for variety
          const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
          console.log(`[Image] Pexels match for "${imageQuery}": ${photo.alt || photo.photographer}`);
          return {
            url: photo.src.landscape || photo.src.large,
            credit: photo.photographer,
          };
        }
      }
      console.warn(`[Image] Pexels search returned no results for "${imageQuery}", falling back to pool`);
    } catch (err) {
      console.warn('[Image] Pexels API error, falling back to curated pool:', err);
    }
  }

  // Fallback: use curated Unsplash pool
  const fallback = getCoverImage(category, tags);
  return { url: fallback.url, credit: fallback.credit };
}
