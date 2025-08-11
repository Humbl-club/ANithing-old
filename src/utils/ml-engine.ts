import type { UserPreference } from "@/types/ml";

// Client-side ML utilities (FREE!)
export class AnimeMLEngine {
  // Cosine similarity calculation
  static cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  // Create genre vector from user preferences
  static createGenreVector(preferences: UserPreference[], allGenres: string[]): number[] {
    return allGenres.map(genre => {
      const pref = preferences.find(p => p.genre === genre);
      return pref ? pref.weight * pref.confidence : 0;
    });
  }

  // Predict rating using collaborative filtering
  static predictRating(
    userRatings: Map<string, number>, 
    similarUsers: Array<{userId: string, similarity: number, ratings: Map<string, number>}>,
    titleId: string
  ): number {
    let weightedSum = 0;
    let similaritySum = 0;

    similarUsers.forEach(({similarity, ratings}) => {
      if (ratings.has(titleId) && similarity > 0.1) {
        weightedSum += similarity * ratings.get(titleId)!;
        similaritySum += Math.abs(similarity);
      }
    });

    return similaritySum > 0 ? weightedSum / similaritySum : 0;
  }

  // Analyze user behavior patterns
  static analyzeViewingPatterns(userRatings: Array<{title_id: string, rating: number, created_at: string}>): {
    averageRating: number;
    ratingVariance: number;
    recentTrend: 'up' | 'down' | 'stable';
    preferredTimeframe: string;
  } {
    if (userRatings.length === 0) return {
      averageRating: 0,
      ratingVariance: 0, 
      recentTrend: 'stable',
      preferredTimeframe: 'unknown'
    };

    const ratings = userRatings.map(r => r.rating);
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / ratings.length;

    // Analyze recent trend (last 10 ratings vs previous)
    const recent = userRatings.slice(-10).map(r => r.rating);
    const previous = userRatings.slice(-20, -10).map(r => r.rating);
    
    const recentAvg = recent.reduce((sum, r) => sum + r, 0) / recent.length;
    const previousAvg = previous.length > 0 ? previous.reduce((sum, r) => sum + r, 0) / previous.length : recentAvg;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvg > previousAvg + 0.5) trend = 'up';
    else if (recentAvg < previousAvg - 0.5) trend = 'down';

    return {
      averageRating: avg,
      ratingVariance: variance,
      recentTrend: trend,
      preferredTimeframe: 'recent' // Could be enhanced with time analysis
    };
  }
}