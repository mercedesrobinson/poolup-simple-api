import { Pool } from '../types/index';

export interface ProgressVisualization {
  progressPercent: number;
  visualType: 'destination' | 'milestone' | 'achievement';
  imagePrompt: string;
  celebrationLevel: 'low' | 'medium' | 'high' | 'complete';
  badgeUnlocked?: AchievementBadge;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: number; // Progress percentage when unlocked
}

export class AIVisualizer {
  private static readonly ACHIEVEMENT_BADGES: AchievementBadge[] = [
    {
      id: 'first_step',
      name: 'First Step',
      description: 'Made your first contribution!',
      icon: '🌱',
      rarity: 'common',
      unlockedAt: 1
    },
    {
      id: 'quarter_master',
      name: 'Quarter Master',
      description: 'Reached 25% of your goal!',
      icon: '🎯',
      rarity: 'common',
      unlockedAt: 25
    },
    {
      id: 'halfway_hero',
      name: 'Halfway Hero',
      description: 'You\'re halfway there!',
      icon: '⭐',
      rarity: 'rare',
      unlockedAt: 50
    },
    {
      id: 'three_quarter_champion',
      name: 'Champion',
      description: '75% complete - almost there!',
      icon: '🏆',
      rarity: 'epic',
      unlockedAt: 75
    },
    {
      id: 'goal_crusher',
      name: 'Goal Crusher',
      description: 'Achieved your savings goal!',
      icon: '💎',
      rarity: 'legendary',
      unlockedAt: 100
    },
    {
      id: 'consistency_king',
      name: 'Consistency King',
      description: 'Saved for 4 weeks straight!',
      icon: '👑',
      rarity: 'rare',
      unlockedAt: 30
    },
    {
      id: 'big_saver',
      name: 'Big Saver',
      description: 'Made a contribution over $100!',
      icon: '💰',
      rarity: 'epic',
      unlockedAt: 20
    }
  ];

  public static generateProgressVisualization(pool: Pool): ProgressVisualization {
    const progressPercent = Math.min((pool.saved_cents / pool.goal_cents) * 100, 100);
    const celebrationLevel = this.getCelebrationLevel(progressPercent);
    const imagePrompt = this.generateImagePrompt(pool, progressPercent);
    const badgeUnlocked = this.checkForNewBadge(progressPercent);

    return {
      progressPercent,
      visualType: progressPercent >= 90 ? 'achievement' : progressPercent >= 50 ? 'milestone' : 'destination',
      imagePrompt,
      celebrationLevel,
      badgeUnlocked
    };
  }

  private static generateImagePrompt(pool: Pool, progressPercent: number): string {
    const destination = pool.destination?.toLowerCase() || 'travel destination';
    const basePrompt = this.getDestinationImagePrompt(destination);
    
    if (progressPercent >= 90) {
      return `${basePrompt}, vibrant and exciting, golden hour lighting, celebration mood, highly detailed, photorealistic`;
    } else if (progressPercent >= 75) {
      return `${basePrompt}, bright and colorful, beautiful lighting, inspiring atmosphere, detailed`;
    } else if (progressPercent >= 50) {
      return `${basePrompt}, warm lighting, inviting atmosphere, travel photography style`;
    } else if (progressPercent >= 25) {
      return `${basePrompt}, soft lighting, dreamy atmosphere, aspirational mood`;
    } else {
      return `${basePrompt}, gentle lighting, peaceful atmosphere, travel inspiration`;
    }
  }

  private static getDestinationImagePrompt(destination: string): string {
    const prompts = {
      'tokyo': 'Tokyo skyline with Mount Fuji, cherry blossoms, neon lights, traditional temples',
      'paris': 'Eiffel Tower, charming cafes, Seine river, classic Parisian architecture',
      'bali': 'Rice terraces, tropical beaches, Hindu temples, lush jungle landscapes',
      'italy': 'Colosseum, Venice canals, Tuscan countryside, Italian coastal towns',
      'thailand': 'Buddhist temples, tropical beaches, floating markets, limestone cliffs',
      'greece': 'Santorini white buildings, blue domes, Mediterranean sea, ancient ruins',
      'spain': 'Barcelona architecture, flamenco dancers, Spanish beaches, historic plazas',
      'france': 'French countryside, wine vineyards, châteaux, lavender fields',
      'japan': 'Traditional Japanese gardens, bullet trains, Mount Fuji, cherry blossoms',
      'mexico': 'Mayan pyramids, colorful markets, tropical beaches, colonial architecture',
      'new york': 'Manhattan skyline, Central Park, Brooklyn Bridge, yellow taxis',
      'los angeles': 'Hollywood sign, palm trees, beaches, sunset boulevard',
      'london': 'Big Ben, red double-decker buses, Thames river, royal palaces',
      'rome': 'Colosseum, Vatican City, Roman fountains, ancient architecture',
      'amsterdam': 'Canal houses, bicycles, tulip fields, historic bridges',
      'barcelona': 'Sagrada Familia, Park Güell, Gothic Quarter, Mediterranean coast',
      'default': 'Beautiful travel destination, scenic landscape, vacation paradise'
    };

    return prompts[destination] || prompts['default'];
  }

  private static getCelebrationLevel(progressPercent: number): 'low' | 'medium' | 'high' | 'complete' {
    if (progressPercent >= 100) return 'complete';
    if (progressPercent >= 75) return 'high';
    if (progressPercent >= 50) return 'medium';
    return 'low';
  }

  private static checkForNewBadge(progressPercent: number): AchievementBadge | undefined {
    // In a real app, you'd track which badges the user already has
    // For now, return badge if they just hit a milestone
    return this.ACHIEVEMENT_BADGES.find(badge => 
      Math.floor(progressPercent) === badge.unlockedAt
    );
  }

  public static generateProgressAnimation(progressPercent: number): string {
    if (progressPercent >= 90) {
      return 'celebration'; // Confetti, sparkles, bouncing
    } else if (progressPercent >= 75) {
      return 'excited'; // Pulsing, glowing effects
    } else if (progressPercent >= 50) {
      return 'steady'; // Smooth filling animation
    } else if (progressPercent >= 25) {
      return 'growing'; // Gentle growth animation
    } else {
      return 'starting'; // Subtle pulse animation
    }
  }

  public static getProgressMessage(pool: Pool, progressPercent: number): string {
    const destination = pool.destination || 'your goal';
    const remaining = ((pool.goal_cents - pool.saved_cents) / 100).toFixed(0);

    if (progressPercent >= 100) {
      return `🎉 Goal achieved! Time to book your trip to ${destination}!`;
    } else if (progressPercent >= 90) {
      return `🚀 ${progressPercent.toFixed(0)}% complete! Your ${destination} adventure is almost here!`;
    } else if (progressPercent >= 75) {
      return `⭐ ${progressPercent.toFixed(0)}% saved! You can practically see ${destination} from here!`;
    } else if (progressPercent >= 50) {
      return `🎯 Halfway to ${destination}! You're building something amazing!`;
    } else if (progressPercent >= 25) {
      return `🌟 ${progressPercent.toFixed(0)}% progress! Your ${destination} fund is growing strong!`;
    } else {
      return `🌱 Every dollar saved brings ${destination} closer to reality!`;
    }
  }

  public static getAllBadges(): AchievementBadge[] {
    return [...this.ACHIEVEMENT_BADGES];
  }

  public static getBadgesByRarity(rarity: 'common' | 'rare' | 'epic' | 'legendary'): AchievementBadge[] {
    return this.ACHIEVEMENT_BADGES.filter(badge => badge.rarity === rarity);
  }

  // Generate dynamic destination facts based on progress
  public static getProgressBasedFact(pool: Pool, progressPercent: number): string {
    const destination = pool.destination?.toLowerCase() || '';
    
    if (progressPercent >= 75) {
      return this.getAlmostThereFacts(destination);
    } else if (progressPercent >= 50) {
      return this.getHalfwayFacts(destination);
    } else {
      return this.getMotivationalFacts(destination);
    }
  }

  private static getAlmostThereFacts(destination: string): string {
    const facts = {
      'tokyo': "You're so close! Did you know Tokyo has vending machines that sell hot ramen? 🍜",
      'paris': "Almost there! The Louvre has 35,000 artworks - you'll need weeks to see them all! 🎨",
      'bali': "Nearly ready! Bali has over 20,000 temples - each one more beautiful than the last! 🏛️",
      'italy': "So close! Italy has more UNESCO sites than any other country - 58 amazing places! 🏛️",
      'default': "You're almost there! Your dream destination is within reach! ✈️"
    };
    return facts[destination] || facts['default'];
  }

  private static getHalfwayFacts(destination: string): string {
    const facts = {
      'tokyo': "Halfway there! Tokyo's Shibuya crossing sees 3 million people daily - you'll be one of them! 🚶‍♀️",
      'paris': "50% saved! Paris has 1,800 monuments and 470 parks - endless exploration awaits! 🌳",
      'bali': "Halfway to paradise! Bali's rice terraces are 2,000 years old and still growing rice! 🌾",
      'italy': "Midway milestone! Italy invented gelato, pizza, and espresso - your taste buds will thank you! 🍕",
      'default': "You're halfway there! Your adventure is taking shape! 🗺️"
    };
    return facts[destination] || facts['default'];
  }

  private static getMotivationalFacts(destination: string): string {
    const facts = {
      'tokyo': "Keep going! Tokyo has more neon signs than anywhere else - it's a city that never sleeps! 🌃",
      'paris': "Building momentum! Paris has 37 bridges crossing the Seine - each with its own story! 🌉",
      'bali': "Growing strong! Bali means 'offering' in Sanskrit - it truly is a gift to visitors! 🎁",
      'italy': "Making progress! Italy's boot shape is 1,200 miles long - so much to explore! 👢",
      'default': "Every contribution counts! Your dream destination has amazing surprises waiting! 🌟"
    };
    return facts[destination] || facts['default'];
  }
}
