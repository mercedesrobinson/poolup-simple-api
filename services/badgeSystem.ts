export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'invite' | 'pools' | 'savings' | 'group' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: number;
  requirementType: 'friends_invited' | 'pools_created' | 'total_saved' | 'group_size' | 'group_savings' | 'special';
  earned?: boolean;
  earnedAt?: string;
}

export interface UserBadgeProgress {
  friendsInvited: number;
  poolsCreated: number;
  totalSaved: number;
  largestGroupSize: number;
  totalGroupSavings: number;
}

export class BadgeSystem {
  private static readonly BADGES: Badge[] = [
    // 🎖 Invite Badges
    {
      id: 'pool_buddy',
      name: 'Pool Buddy',
      description: "🤝 1 FRIEND • You've got company! Saving is better together.",
      icon: '🤝',
      category: 'invite',
      rarity: 'common',
      requirement: 1,
      requirementType: 'friends_invited'
    },
    {
      id: 'squad_builder',
      name: 'Squad Builder',
      description: "👯‍♀️ 3 FRIENDS • Now it's a squad goal — literally.",
      icon: '👯‍♀️',
      category: 'invite',
      rarity: 'common',
      requirement: 3,
      requirementType: 'friends_invited'
    },
    {
      id: 'money_magnet',
      name: 'Money Magnet',
      description: "💸 5 FRIENDS • Your friends can't resist pooling up with you.",
      icon: '💸',
      category: 'invite',
      rarity: 'rare',
      requirement: 5,
      requirementType: 'friends_invited'
    },
    {
      id: 'pool_party_starter',
      name: 'Pool Party Starter',
      description: '🎉 10 FRIENDS • You just turned saving into a party.',
      icon: '🎉',
      category: 'invite',
      rarity: 'epic',
      requirement: 10,
      requirementType: 'friends_invited'
    },
    {
      id: 'super_connector',
      name: 'Super Connector',
      description: '🌟 15 FRIENDS • The ultimate hype saver — you bring everyone along.',
      icon: '🌟',
      category: 'invite',
      rarity: 'legendary',
      requirement: 15,
      requirementType: 'friends_invited'
    },

    // 🎖 Multiple Pool Badges
    {
      id: 'double_dipper',
      name: 'Double Dipper',
      description: "🍦 2 POOLS • You're saving for more than one dream at a time.",
      icon: '🍦',
      category: 'pools',
      rarity: 'common',
      requirement: 2,
      requirementType: 'pools_created'
    },
    {
      id: 'triple_threat',
      name: 'Triple Threat',
      description: '🎬 3 POOLS • Juggling goals like a pro.',
      icon: '🎬',
      category: 'pools',
      rarity: 'common',
      requirement: 3,
      requirementType: 'pools_created'
    },
    {
      id: 'saver_supreme',
      name: 'Saver Supreme',
      description: '👑 5 POOLS • Master of multitasking your money.',
      icon: '👑',
      category: 'pools',
      rarity: 'rare',
      requirement: 5,
      requirementType: 'pools_created'
    },
    {
      id: 'lucky_saver',
      name: 'Lucky Saver',
      description: "🍀 7 POOLS • Seven pools? You're chasing all the good things in life.",
      icon: '🍀',
      category: 'pools',
      rarity: 'epic',
      requirement: 7,
      requirementType: 'pools_created'
    },
    {
      id: 'goal_getter',
      name: 'Goal Getter',
      description: '🚀 10 POOLS • Nothing can stop you — every dream gets a pool.',
      icon: '🚀',
      category: 'pools',
      rarity: 'legendary',
      requirement: 10,
      requirementType: 'pools_created'
    },

    // 🎖 Savings Milestone Badges
    {
      id: 'starter_stack',
      name: 'Starter Stack',
      description: '💵 $100 • Your first step into saving — small but mighty.',
      icon: '💵',
      category: 'savings',
      rarity: 'common',
      requirement: 10000, // $100 in cents
      requirementType: 'total_saved'
    },
    {
      id: 'quarter_saver',
      name: 'Quarter Saver',
      description: "🪙 $250 • You've stacked a solid quarter grand.",
      icon: '🪙',
      category: 'savings',
      rarity: 'common',
      requirement: 25000, // $250 in cents
      requirementType: 'total_saved'
    },
    {
      id: 'half_stack_hero',
      name: 'Half-Stack Hero',
      description: '💪 $500 • Halfway to your first thousand — consistency pays off.',
      icon: '💪',
      category: 'savings',
      rarity: 'rare',
      requirement: 50000, // $500 in cents
      requirementType: 'total_saved'
    },
    {
      id: 'four_digit_club',
      name: '4-Digit Club',
      description: '🔑 $1,000 • Welcome to the club — four digits strong.',
      icon: '🔑',
      category: 'savings',
      rarity: 'rare',
      requirement: 100000, // $1,000 in cents
      requirementType: 'total_saved'
    },
    {
      id: 'momentum_maker',
      name: 'Momentum Maker',
      description: '⚡ $2,500 • Your discipline is starting to snowball.',
      icon: '⚡',
      category: 'savings',
      rarity: 'epic',
      requirement: 250000, // $2,500 in cents
      requirementType: 'total_saved'
    },
    {
      id: 'goal_crusher',
      name: 'Goal Crusher',
      description: '🎯 $5,000 • Big milestone achieved — dreams within reach.',
      icon: '🎯',
      category: 'savings',
      rarity: 'epic',
      requirement: 500000, // $5,000 in cents
      requirementType: 'total_saved'
    },
    {
      id: 'money_master',
      name: 'Money Master',
      description: "🏆 $10,000 • Five figures saved — you've mastered the art of Pooling Up.",
      icon: '🏆',
      category: 'savings',
      rarity: 'legendary',
      requirement: 1000000, // $10,000 in cents
      requirementType: 'total_saved'
    },

    // 🎖 Group Perks Badges
    {
      id: 'big_group_leader',
      name: 'Big Pool Energy',
      description: '🌊 10+ FRIENDS • Your pool is making waves — everyone wants in!',
      icon: '🌊',
      category: 'group',
      rarity: 'epic',
      requirement: 10,
      requirementType: 'group_size'
    },
    {
      id: 'collective_crusher',
      name: 'Collective Champions',
      description: '🏅 $5,000+ GROUP • Together you\'ve achieved something amazing!',
      icon: '🏅',
      category: 'group',
      rarity: 'epic',
      requirement: 500000, // $5,000 in cents
      requirementType: 'group_savings'
    }
  ];

  public static getAllBadges(): Badge[] {
    return [...this.BADGES];
  }

  public static getBadgesByCategory(category: Badge['category']): Badge[] {
    return this.BADGES.filter(badge => badge.category === category);
  }

  public static getBadgesByRarity(rarity: Badge['rarity']): Badge[] {
    return this.BADGES.filter(badge => badge.rarity === rarity);
  }

  public static checkEarnedBadges(progress: UserBadgeProgress): Badge[] {
    const earnedBadges: Badge[] = [];

    this.BADGES.forEach(badge => {
      let hasEarned = false;

      switch (badge.requirementType) {
        case 'friends_invited':
          hasEarned = progress.friendsInvited >= badge.requirement;
          break;
        case 'pools_created':
          hasEarned = progress.poolsCreated >= badge.requirement;
          break;
        case 'total_saved':
          hasEarned = progress.totalSaved >= badge.requirement;
          break;
        case 'group_size':
          hasEarned = progress.largestGroupSize >= badge.requirement;
          break;
        case 'group_savings':
          hasEarned = progress.totalGroupSavings >= badge.requirement;
          break;
      }

      if (hasEarned) {
        earnedBadges.push({
          ...badge,
          earned: true,
          earnedAt: new Date().toISOString()
        });
      }
    });

    return earnedBadges;
  }

  public static getNewlyEarnedBadges(
    previousProgress: UserBadgeProgress,
    currentProgress: UserBadgeProgress
  ): Badge[] {
    const previousEarned = this.checkEarnedBadges(previousProgress);
    const currentEarned = this.checkEarnedBadges(currentProgress);

    const previousIds = new Set(previousEarned.map(b => b.id));
    return currentEarned.filter(badge => !previousIds.has(badge.id));
  }

  public static getBadgeProgress(badge: Badge, progress: UserBadgeProgress): {
    current: number;
    required: number;
    percentage: number;
  } {
    let current = 0;

    switch (badge.requirementType) {
      case 'friends_invited':
        current = progress.friendsInvited;
        break;
      case 'pools_created':
        current = progress.poolsCreated;
        break;
      case 'total_saved':
        current = progress.totalSaved;
        break;
      case 'group_size':
        current = progress.largestGroupSize;
        break;
      case 'group_savings':
        current = progress.totalGroupSavings;
        break;
    }

    return {
      current,
      required: badge.requirement,
      percentage: Math.min((current / badge.requirement) * 100, 100)
    };
  }

  public static getBadgeRarityColor(rarity: Badge['rarity']): string {
    switch (rarity) {
      case 'common': return '#95A5A6';
      case 'rare': return '#3498DB';
      case 'epic': return '#9B59B6';
      case 'legendary': return '#F1C40F';
      default: return '#95A5A6';
    }
  }

  public static formatRequirement(badge: Badge): string {
    switch (badge.requirementType) {
      case 'friends_invited':
        return `Invite ${badge.requirement} friend${badge.requirement > 1 ? 's' : ''}`;
      case 'pools_created':
        return `Create ${badge.requirement} pool${badge.requirement > 1 ? 's' : ''}`;
      case 'total_saved':
        return `Save $${(badge.requirement / 100).toLocaleString()}`;
      case 'group_size':
        return `Lead a group of ${badge.requirement}+ members`;
      case 'group_savings':
        return `Group saves $${(badge.requirement / 100).toLocaleString()}+`;
      default:
        return 'Complete special requirement';
    }
  }
}
