import { Pool, User } from '../types/index';

export interface SavingsInsight {
  type: 'motivation' | 'tip' | 'warning' | 'celebration' | 'adjustment';
  title: string;
  message: string;
  icon: string;
  actionable?: boolean;
  suggestedAction?: string;
}

export interface GoalAdjustment {
  currentGoal: number;
  suggestedGoal: number;
  reason: string;
  confidence: number;
  timeframe: string;
}

export class AICoach {
  private static generateMotivationalMessage(pool: Pool, progressPercent: number): SavingsInsight {
    const remaining = pool.goal_cents - pool.saved_cents;
    const remainingDollars = remaining / 100;
    
    if (progressPercent >= 90) {
      return {
        type: 'celebration',
        title: 'Almost There! 🎉',
        message: `You're ${progressPercent.toFixed(0)}% to your ${pool.destination || 'goal'}! Just $${remainingDollars.toFixed(2)} left!`,
        icon: '🚀',
        actionable: true,
        suggestedAction: 'Make one final push this week!'
      };
    }
    
    if (progressPercent >= 75) {
      return {
        type: 'motivation',
        title: 'Incredible Progress! 💪',
        message: `Your ${pool.destination || 'savings goal'} is ${progressPercent.toFixed(0)}% funded! You can almost taste those ${pool.destination ? this.getDestinationTreat(pool.destination) : 'dreams'}!`,
        icon: '⭐',
        actionable: true,
        suggestedAction: `Save $${(remainingDollars / 4).toFixed(2)} per week to finish strong!`
      };
    }
    
    if (progressPercent >= 50) {
      return {
        type: 'motivation',
        title: 'Halfway Hero! 🌟',
        message: `You've saved ${progressPercent.toFixed(0)}% for ${pool.destination || 'your goal'}! ${this.getProgressEquivalent(pool.saved_cents)}`,
        icon: '🎯',
        actionable: true,
        suggestedAction: 'Keep the momentum going!'
      };
    }
    
    if (progressPercent >= 25) {
      return {
        type: 'motivation',
        title: 'Building Momentum! 🔥',
        message: `${progressPercent.toFixed(0)}% saved! You're proving that ${pool.destination || 'your dreams'} aren't just wishes—they're plans in action!`,
        icon: '💫',
        actionable: true,
        suggestedAction: `Try saving $${(remainingDollars * 0.1).toFixed(2)} extra this week!`
      };
    }
    
    return {
      type: 'motivation',
      title: 'Every Journey Starts Here! ✨',
      message: `Your ${pool.destination || 'goal'} fund is growing! ${this.getStarterMotivation(pool.destination)}`,
      icon: '🌱',
      actionable: true,
      suggestedAction: 'Set up a small daily savings habit!'
    };
  }

  private static getDestinationTreat(destination: string): string {
    const treats = {
      'tokyo': 'authentic ramen and sushi',
      'paris': 'fresh croissants and café au lait',
      'italy': 'gelato and pasta',
      'bali': 'tropical smoothies and nasi goreng',
      'thailand': 'pad thai and mango sticky rice',
      'mexico': 'tacos and margaritas',
      'greece': 'gyros and baklava',
      'spain': 'tapas and sangria',
      'france': 'wine and cheese',
      'japan': 'sushi and matcha',
      'default': 'local delicacies'
    };
    
    const key = destination.toLowerCase();
    return treats[key] || treats['default'];
  }

  private static getProgressEquivalent(savedCents: number): string {
    const amount = savedCents / 100;
    
    if (amount >= 2000) return "That's enough for a luxury hotel stay!";
    if (amount >= 1000) return "That's several round-trip flights!";
    if (amount >= 500) return "That's a week of amazing meals!";
    if (amount >= 200) return "That's multiple fun activities!";
    return "Every dollar brings you closer!";
  }

  private static getStarterMotivation(destination?: string): string {
    if (!destination) return "Small steps lead to big adventures!";
    
    const motivations = {
      'tokyo': "Soon you'll be walking through Shibuya crossing!",
      'paris': "The Eiffel Tower is waiting for you!",
      'bali': "Those rice terraces and beaches are calling!",
      'italy': "The Colosseum and canals await!",
      'thailand': "Temples and beaches are in your future!",
      'default': "Your adventure is already beginning!"
    };
    
    const key = destination.toLowerCase();
    return motivations[key] || motivations['default'];
  }

  public static generateSavingsTip(pool: Pool, recentContributions: number[]): SavingsInsight {
    const avgContribution = recentContributions.length > 0 
      ? recentContributions.reduce((a, b) => a + b, 0) / recentContributions.length 
      : 0;
    
    const progressPercent = (pool.saved_cents / pool.goal_cents) * 100;
    
    // Generate smart tips based on patterns
    if (avgContribution > 0 && avgContribution < 2000) { // Less than $20 average
      return {
        type: 'tip',
        title: 'Micro-Savings Magic! ✨',
        message: `Try the "Round-Up Rule": Round up every purchase to the nearest $5 and save the difference. You could save an extra $50-100/month!`,
        icon: '💡',
        actionable: true,
        suggestedAction: 'Enable round-up savings'
      };
    }
    
    if (recentContributions.length > 3 && this.isInconsistentSaving(recentContributions)) {
      return {
        type: 'tip',
        title: 'Consistency is Key! 📅',
        message: `Your contributions vary a lot. Try saving the same amount weekly—it's easier to budget and builds a strong habit!`,
        icon: '🎯',
        actionable: true,
        suggestedAction: `Set up $${(avgContribution / 100).toFixed(2)} weekly auto-save`
      };
    }
    
    return {
      type: 'tip',
      title: 'Smart Savings Strategy! 🧠',
      message: `The 50/30/20 rule: 50% needs, 30% wants, 20% savings. You're building wealth while living your life!`,
      icon: '📊',
      actionable: false
    };
  }

  public static suggestGoalAdjustment(pool: Pool, monthlyIncome: number, recentContributions: number[]): GoalAdjustment | null {
    if (recentContributions.length < 4) return null; // Need enough data
    
    const avgMonthlyContribution = recentContributions.reduce((a, b) => a + b, 0) / recentContributions.length * 4.33; // Weekly to monthly
    const currentGoal = pool.goal_cents / 100;
    const remaining = (pool.goal_cents - pool.saved_cents) / 100;
    
    // Calculate realistic timeline based on current saving rate
    const monthsToComplete = remaining / (avgMonthlyContribution / 100);
    
    // If taking longer than 2 years, suggest adjustment
    if (monthsToComplete > 24) {
      const realisticGoal = Math.round(currentGoal * 0.75); // 25% reduction
      return {
        currentGoal,
        suggestedGoal: realisticGoal,
        reason: `At your current saving rate, this goal would take ${monthsToComplete.toFixed(1)} months. A $${realisticGoal.toLocaleString()} goal is more achievable!`,
        confidence: 0.8,
        timeframe: `${Math.round(remaining * 0.75 / (avgMonthlyContribution / 100))} months`
      };
    }
    
    // If saving too fast (more than 30% of income), suggest increasing goal
    if (monthlyIncome > 0 && (avgMonthlyContribution / monthlyIncome) > 0.3) {
      const ambitiousGoal = Math.round(currentGoal * 1.3); // 30% increase
      return {
        currentGoal,
        suggestedGoal: ambitiousGoal,
        reason: `You're saving aggressively! Consider upgrading to a $${ambitiousGoal.toLocaleString()} goal for an even better ${pool.destination || 'experience'}!`,
        confidence: 0.7,
        timeframe: `${Math.round(remaining * 1.3 / (avgMonthlyContribution / 100))} months`
      };
    }
    
    return null;
  }

  public static generateProgressInsight(pool: Pool, recentContributions: number[]): SavingsInsight {
    const progressPercent = (pool.saved_cents / pool.goal_cents) * 100;
    return this.generateMotivationalMessage(pool, progressPercent);
  }

  private static isInconsistentSaving(contributions: number[]): boolean {
    if (contributions.length < 3) return false;
    
    const avg = contributions.reduce((a, b) => a + b, 0) / contributions.length;
    const variance = contributions.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / contributions.length;
    const stdDev = Math.sqrt(variance);
    
    // If standard deviation is more than 50% of average, it's inconsistent
    return stdDev > (avg * 0.5);
  }

  public static generateWeeklyChallenge(pool: Pool): SavingsInsight {
    const challenges = [
      {
        title: 'Coffee Shop Challenge ☕',
        message: `Skip 2 coffee shop visits this week and save $12 toward ${pool.destination || 'your goal'}!`,
        icon: '☕'
      },
      {
        title: 'Lunch Pack Challenge 🥪',
        message: `Pack lunch 3 times this week instead of buying out. Save $25 for ${pool.destination || 'your dreams'}!`,
        icon: '🥪'
      },
      {
        title: 'Streaming Audit Challenge 📺',
        message: `Cancel one unused subscription this month. That's $10-15 more for ${pool.destination || 'your adventure'}!`,
        icon: '📺'
      },
      {
        title: 'Walk & Save Challenge 🚶‍♀️',
        message: `Walk instead of rideshare twice this week. Save $20 and get healthier for ${pool.destination || 'your trip'}!`,
        icon: '🚶‍♀️'
      }
    ];
    
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    return {
      type: 'tip',
      title: randomChallenge.title,
      message: randomChallenge.message,
      icon: randomChallenge.icon,
      actionable: true,
      suggestedAction: 'Accept this week\'s challenge!'
    };
  }
}
