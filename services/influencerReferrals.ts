export interface InfluencerCode {
  id: string;
  code: string;
  influencerName: string;
  influencerId: string;
  revenueShare: number; // Percentage (e.g., 5 for 5%)
  isActive: boolean;
  createdAt: string;
  totalEarnings: number;
  totalReferrals: number;
}

export interface ReferralTransaction {
  id: string;
  influencerCode: string;
  userId: string;
  amount: number; // Amount uploaded by user in cents
  commission: number; // Commission earned by influencer in cents
  timestamp: string;
  status: 'pending' | 'completed' | 'paid';
}

export interface UserReferral {
  userId: string;
  referralCode?: string;
  referredBy?: string;
  signupDate: string;
  totalUploaded: number;
  commissionGenerated: number;
}

export class InfluencerReferralService {
  private static readonly DEFAULT_REVENUE_SHARE = 5; // 5% default

  public static generateReferralCode(influencerName: string): string {
    // Generate a unique code based on influencer name
    const cleanName = influencerName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${cleanName.substring(0, 6)}${randomSuffix}`;
  }

  public static createInfluencerCode(
    influencerName: string,
    influencerId: string,
    customCode?: string,
    revenueShare?: number
  ): InfluencerCode {
    const code = customCode || this.generateReferralCode(influencerName);
    
    return {
      id: `inf_${Date.now()}`,
      code: code.toUpperCase(),
      influencerName,
      influencerId,
      revenueShare: revenueShare || this.DEFAULT_REVENUE_SHARE,
      isActive: true,
      createdAt: new Date().toISOString(),
      totalEarnings: 0,
      totalReferrals: 0
    };
  }

  public static validateReferralCode(code: string): boolean {
    // In a real app, this would check against a database
    // For now, return true if code follows the pattern
    return /^[A-Z0-9]{6,10}$/.test(code.toUpperCase());
  }

  public static calculateCommission(uploadAmount: number, revenueShare: number): number {
    return Math.floor((uploadAmount * revenueShare) / 100);
  }

  public static processReferralTransaction(
    userId: string,
    uploadAmount: number,
    influencerCode: InfluencerCode
  ): ReferralTransaction {
    const commission = this.calculateCommission(uploadAmount, influencerCode.revenueShare);
    
    return {
      id: `ref_${Date.now()}`,
      influencerCode: influencerCode.code,
      userId,
      amount: uploadAmount,
      commission,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
  }

  public static getInfluencerEarnings(
    influencerCode: string,
    transactions: ReferralTransaction[]
  ): {
    totalEarnings: number;
    totalReferrals: number;
    monthlyEarnings: number;
    recentTransactions: ReferralTransaction[];
  } {
    const influencerTransactions = transactions.filter(
      t => t.influencerCode === influencerCode && t.status === 'completed'
    );

    const totalEarnings = influencerTransactions.reduce((sum, t) => sum + t.commission, 0);
    const totalReferrals = new Set(influencerTransactions.map(t => t.userId)).size;

    // Calculate monthly earnings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyEarnings = influencerTransactions
      .filter(t => new Date(t.timestamp) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + t.commission, 0);

    const recentTransactions = influencerTransactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return {
      totalEarnings,
      totalReferrals,
      monthlyEarnings,
      recentTransactions
    };
  }

  public static generateInfluencerDashboardData(
    influencerCode: InfluencerCode,
    transactions: ReferralTransaction[]
  ) {
    const earnings = this.getInfluencerEarnings(influencerCode.code, transactions);
    
    return {
      code: influencerCode.code,
      name: influencerCode.influencerName,
      revenueShare: influencerCode.revenueShare,
      isActive: influencerCode.isActive,
      stats: {
        totalEarnings: earnings.totalEarnings,
        totalReferrals: earnings.totalReferrals,
        monthlyEarnings: earnings.monthlyEarnings,
        conversionRate: this.calculateConversionRate(influencerCode.code, transactions),
        averageUpload: this.calculateAverageUpload(influencerCode.code, transactions)
      },
      recentActivity: earnings.recentTransactions,
      shareableLink: `https://poolup.app/signup?ref=${influencerCode.code}`,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://poolup.app/signup?ref=${influencerCode.code}`
    };
  }

  private static calculateConversionRate(
    influencerCode: string,
    transactions: ReferralTransaction[]
  ): number {
    // This would need signup tracking vs. actual uploads
    // For now, return a mock conversion rate
    const referralTransactions = transactions.filter(t => t.influencerCode === influencerCode);
    return referralTransactions.length > 0 ? 15.5 : 0; // Mock 15.5% conversion rate
  }

  private static calculateAverageUpload(
    influencerCode: string,
    transactions: ReferralTransaction[]
  ): number {
    const referralTransactions = transactions.filter(t => t.influencerCode === influencerCode);
    if (referralTransactions.length === 0) return 0;
    
    const totalAmount = referralTransactions.reduce((sum, t) => sum + t.amount, 0);
    return Math.floor(totalAmount / referralTransactions.length);
  }

  public static generateReferralBonuses(): {
    userBonus: number;
    influencerBonus: number;
    description: string;
  }[] {
    return [
      {
        userBonus: 500, // $5 in cents
        influencerBonus: 1000, // $10 in cents
        description: "First-time user uploads $25+ using your code"
      },
      {
        userBonus: 0,
        influencerBonus: 500, // $5 in cents
        description: "User reaches their first savings goal"
      },
      {
        userBonus: 1000, // $10 in cents
        influencerBonus: 2000, // $20 in cents
        description: "User saves $500+ in their first month"
      }
    ];
  }

  public static formatEarnings(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  public static generateInfluencerOnboardingFlow() {
    return {
      steps: [
        {
          title: "Create Your Code",
          description: "Choose a custom referral code or let us generate one",
          action: "code_creation"
        },
        {
          title: "Set Revenue Share",
          description: "Negotiate your commission percentage (default 5%)",
          action: "revenue_negotiation"
        },
        {
          title: "Get Your Links",
          description: "Receive shareable links and QR codes",
          action: "link_generation"
        },
        {
          title: "Start Promoting",
          description: "Share PoolUp with your audience and earn",
          action: "promotion"
        }
      ],
      requirements: [
        "Minimum 1,000 followers on primary platform",
        "Content aligned with financial wellness/lifestyle",
        "Agreement to PoolUp brand guidelines"
      ]
    };
  }
}
