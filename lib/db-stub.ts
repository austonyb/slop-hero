import { createClient } from "@/utils/supabase/client"

export interface ImagePair {
  id: number
  leftImage: string
  rightImage: string
  aiSide: "left" | "right"
  category: string
}

export interface LeaderboardEntry {
  id: number
  playerName: string
  score: number
  accuracy: number
  createdAt: Date
}

interface Image {
  id: string
  url: string
  is_ai: boolean
  source: string | null
}

/**
 * Fetch image pairs from database
 * Pairs one real image with one AI-generated image
 */
export async function fetchImagePairs(): Promise<ImagePair[]> {
  try {
    const supabase = createClient()
    
    // Fetch all images from Supabase
    const { data: images, error } = await supabase
      .from("images")
      .select("id, url, is_ai, source")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching images from Supabase:", error)
      return []
    }

    if (!images || images.length === 0) {
      console.warn("No images found in database")
      return []
    }

    // Separate real and AI images
    const realImages = images.filter((img: Image) => !img.is_ai)
    const aiImages = images.filter((img: Image) => img.is_ai)

    if (realImages.length === 0 || aiImages.length === 0) {
      console.warn("Need both real and AI images to create pairs")
      return []
    }

    // Create pairs by matching real and AI images
    // Take the minimum of both arrays to ensure we can pair them all
    const pairCount = Math.min(realImages.length, aiImages.length)
    const pairs: ImagePair[] = []

    for (let i = 0; i < pairCount; i++) {
      const realImg = realImages[i]
      const aiImg = aiImages[i]

      // Randomly decide which side the AI image is on
      const aiSide = Math.random() < 0.5 ? "left" : "right"

      // Extract category from source or use a default
      const category = extractCategory(realImg.source || aiImg.source || "General")

      // Ensure URLs are properly formatted
      let realUrl = realImg.url
      let aiUrl = aiImg.url

      // For Unsplash URLs, ensure they're direct image URLs
      if (realUrl.includes("unsplash.com") && !realUrl.includes("?")) {
        realUrl = `${realUrl}?w=800&h=800&fit=crop`
      }
      if (aiUrl.includes("unsplash.com") && !aiUrl.includes("?")) {
        aiUrl = `${aiUrl}?w=800&h=800&fit=crop`
      }

      pairs.push({
        id: i + 1,
        leftImage: aiSide === "left" ? aiUrl : realUrl,
        rightImage: aiSide === "right" ? aiUrl : realUrl,
        aiSide,
        category,
      })
    }

    console.log(`[fetchImagePairs] Created ${pairs.length} image pairs`)
    return pairs
  } catch (error) {
    console.error("Error in fetchImagePairs:", error)
    return []
  }
}

/**
 * Extract category from source string or return default
 */
function extractCategory(source: string): string {
  const lowerSource = source.toLowerCase()
  
  if (lowerSource.includes("landscape") || lowerSource.includes("nature") || lowerSource.includes("forest") || lowerSource.includes("mountain") || lowerSource.includes("lake")) {
    return "Landscape"
  }
  if (lowerSource.includes("portrait") || lowerSource.includes("person")) {
    return "Portrait"
  }
  if (lowerSource.includes("animal")) {
    return "Animal"
  }
  if (lowerSource.includes("food")) {
    return "Food"
  }
  if (lowerSource.includes("architecture") || lowerSource.includes("building")) {
    return "Architecture"
  }
  
  return "General"
}

/**
 * Save player score to leaderboard
 * TODO: Implement with Supabase insert
 */
export async function saveScore(playerName: string, score: number, accuracy: number): Promise<void> {
  console.log("[v0] Stub: saveScore() - Will save to Supabase", {
    playerName,
    score,
    accuracy,
  })
}

/**
 * Fetch top scores from leaderboard
 * TODO: Implement with Supabase query
 */
export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  console.log("[v0] Stub: fetchLeaderboard() - Will fetch from Supabase")
  return []
}
