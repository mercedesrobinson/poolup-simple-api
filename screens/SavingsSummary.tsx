import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { colors, radius } from '../theme';
import { api } from '../services/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type SavingsSummaryNavigationProp = StackNavigationProp<RootStackParamList, 'SavingsSummary'>;
type SavingsSummaryRouteProp = RouteProp<RootStackParamList, 'SavingsSummary'>;

interface Props {
  navigation: SavingsSummaryNavigationProp;
  route: SavingsSummaryRouteProp;
}

interface SummaryData {
  totalSaved: number;
  activeGoals: number;
  completedGoals: number;
  currentStreak: number;
  monthlyAverage: number;
  savingsRate: number;
  nextMilestone: {
    amount: number;
    daysLeft: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color: (opacity?: number) => string;
    strokeWidth: number;
  }>;
}

type TimeframeType = 'week' | 'month' | '3months' | '6months' | 'year';

const screenWidth = Dimensions.get('window').width;

export default function SavingsSummary({ navigation, route }: Props): React.JSX.Element {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeType>('6months');
  const userId = (route.params as any)?.userId || '1756612920173';

  useEffect(() => {
    loadSummaryData();
  }, [timeframe]);

  const getChartLabels = (timeframe: TimeframeType): string[] => {
    switch (timeframe) {
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case '3months':
        return ['Month 1', 'Month 2', 'Month 3'];
      case '6months':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      case 'year':
        return ['Q1', 'Q2', 'Q3', 'Q4'];
      default:
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    }
  };

  const getChartData = (timeframe: TimeframeType, transactions: any[]): number[] => {
    if (!transactions || transactions.length === 0) {
      // Return zeros for empty state
      switch (timeframe) {
        case 'week':
          return [0, 0, 0, 0, 0, 0, 0];
        case 'month':
          return [0, 0, 0, 0];
        case '3months':
          return [0, 0, 0];
        case '6months':
          return [0, 0, 0, 0, 0, 0];
        case 'year':
          return [0, 0, 0, 0];
        default:
          return [0, 0, 0, 0, 0, 0];
      }
    }

    // Calculate real cumulative savings from transactions
    const sortedTransactions = transactions.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    switch (timeframe) {
      case 'week':
        // Last 7 days cumulative
        const weekData = Array(7).fill(0);
        let weekSum = 0;
        sortedTransactions.slice(-7).forEach((t, i) => {
          weekSum += t.amount;
          weekData[i] = weekSum / 100; // Convert to dollars
        });
        return weekData;
      case 'month':
        // Last 4 weeks cumulative
        const monthData = Array(4).fill(0);
        let monthSum = 0;
        sortedTransactions.slice(-4).forEach((t, i) => {
          monthSum += t.amount;
          monthData[i] = monthSum / 100;
        });
        return monthData;
      case '3months':
        // Last 3 months cumulative
        const quarterData = Array(3).fill(0);
        let quarterSum = 0;
        sortedTransactions.slice(-3).forEach((t, i) => {
          quarterSum += t.amount;
          quarterData[i] = quarterSum / 100;
        });
        return quarterData;
      case '6months':
        // Last 6 months cumulative
        const sixMonthData = Array(6).fill(0);
        let sixMonthSum = 0;
        sortedTransactions.slice(-6).forEach((t, i) => {
          sixMonthSum += t.amount;
          sixMonthData[i] = sixMonthSum / 100;
        });
        return sixMonthData;
      case 'year':
        // Last 4 quarters cumulative
        const yearData = Array(4).fill(0);
        let yearSum = 0;
        sortedTransactions.slice(-4).forEach((t, i) => {
          yearSum += t.amount;
          yearData[i] = yearSum / 100;
        });
        return yearData;
      default:
        // Default to 6 months
        const defaultData = Array(6).fill(0);
        let defaultSum = 0;
        sortedTransactions.slice(-6).forEach((t, i) => {
          defaultSum += t.amount;
          defaultData[i] = defaultSum / 100;
        });
        return defaultData;
    }
  };

  const loadSummaryData = async () => {
    try {
      const userId = (route.params as any)?.user?.id || '1';
      
      // Get user's pools and transactions
      const userPools = await api.getUserPools(userId);
      const userTransactions = await api.getUserTransactions(userId);
      
      // Calculate real summary data
      const totalSaved = userTransactions.reduce((sum, t) => sum + t.amount, 0);
      const activeGoals = userPools.filter(p => p.status === 'active').length;
      const completedGoals = userPools.filter(p => p.status === 'completed').length;
      
      // Calculate real savings rate from user income (if available) or estimate
      const estimatedMonthlyIncome = 500000; // $5000 - TODO: Get from user profile
      const actualSavingsRate = totalSaved > 0 ? Math.min(1, totalSaved / (estimatedMonthlyIncome * 6)) : 0;

      const realSummary = {
        totalSaved,
        activeGoals,
        completedGoals,
        currentStreak: 0, // TODO: Calculate from transaction history
        monthlyAverage: totalSaved / 6, // Rough estimate
        savingsRate: actualSavingsRate,
        nextMilestone: { amount: totalSaved + 50000, daysLeft: 30 }
      };

      const realChartData = {
        labels: getChartLabels(timeframe),
        datasets: [{
          data: getChartData(timeframe, userTransactions),
          color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
          strokeWidth: 3
        }]
      };

      setSummaryData(realSummary);
      setChartData(realChartData);
      
    } catch (error) {
      console.error('Failed to load real data:', error);
      
      // Fallback to empty state
      const emptySummary = {
        totalSaved: 0,
        activeGoals: 0,
        completedGoals: 0,
        currentStreak: 0,
        monthlyAverage: 0,
        savingsRate: 0,
        nextMilestone: { amount: 0, daysLeft: 0 }
      };

      const emptyChartData = {
        labels: getChartLabels(timeframe),
        datasets: [{
          data: getChartData(timeframe, []),
          color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
          strokeWidth: 3
        }]
      };

      setSummaryData(emptySummary);
      setChartData(emptyChartData);
    }
  };

  const getEquivalent = (amountInCents): { threshold: number; text: string; icon: string } => {
    const amountInDollars = amountInCents / 100;
    
    const equivalents = [
      { threshold: 2000, text: `${Math.floor(amountInDollars / 500)} round-trip flights to Mexico`, icon: '✈️' },
      { threshold: 1000, text: `${Math.floor(amountInDollars / 200)} weekend getaways`, icon: '🏖️' },
      { threshold: 500, text: `${Math.floor(amountInDollars / 150)} concert tickets`, icon: '🎵' },
      { threshold: 200, text: `${Math.floor(amountInDollars / 50)} fancy dinners`, icon: '🍽️' },
      { threshold: 100, text: `${Math.floor(amountInDollars / 25)} movie nights`, icon: '🎬' },
      { threshold: 0, text: `${Math.floor(amountInDollars / 5)} coffee runs`, icon: '☕' }
    ];

    const found = equivalents.find(eq => amountInDollars >= eq.threshold);
    return found || equivalents[equivalents.length - 1];
  };

  const getCheekyFact = (summaryData) => {
    const totalSaved = summaryData.totalSaved || 0;
    const facts = [
      `You've saved enough to skip ${Math.floor(totalSaved / 500)} lattes! ☕`,
      `That's ${Math.floor(totalSaved / 1200)} fewer Uber rides! 🚗`,
      `You could buy ${Math.floor(totalSaved / 3000)} avocado toasts... but you're saving instead! 🥑`,
      `${Math.floor(totalSaved / 1500)} fewer impulse Amazon purchases = one amazing trip! 📦`,
      `You've resisted ${Math.floor(totalSaved / 800)} "treat yourself" moments! 💅`,
      `At this rate, you'll have $${(totalSaved * 2 / 100).toFixed(0)} saved by next year! 📈`,
      `You've avoided ${Math.floor(totalSaved / 2000)} expensive dinners out! 🍽️`,
      `That's ${Math.floor(totalSaved / 4000)} designer handbags you didn't buy! 👜`
    ];
    
    return facts[Math.floor(Math.random() * facts.length)];
  };

  if (!summaryData || !chartData) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: colors.textSecondary }}>Loading your savings summary...</Text>
      </View>
    );
  }

  const equivalent = getEquivalent(summaryData.totalSaved);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ 
        backgroundColor: 'white', 
        paddingHorizontal: 20, 
        paddingTop: 60, 
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{ marginRight: 16, padding: 8 }}
          >
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: '700', 
            color: colors.text,
            flex: 1
          }}>
            Savings Summary
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Total Savings Hero */}
        <View style={{
          backgroundColor: colors.primary,
          margin: 20,
          padding: 24,
          borderRadius: radius.medium,
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
            Total Saved
          </Text>
          <Text style={{ fontSize: 48, fontWeight: '700', color: 'white', marginBottom: 16 }}>
            ${(summaryData.totalSaved / 100).toFixed(2)}
          </Text>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>{equivalent.icon}</Text>
            <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>
              {equivalent.text}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <View style={{
              backgroundColor: 'white',
              flex: 1,
              padding: 16,
              borderRadius: radius.medium,
              marginRight: 6,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>🎯</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                {summaryData.activeGoals}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Active Goals
              </Text>
            </View>

            <View style={{
              backgroundColor: 'white',
              flex: 1,
              padding: 16,
              borderRadius: radius.medium,
              marginLeft: 6,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>🔥</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                {summaryData.currentStreak}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Day Streak
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{
              backgroundColor: 'white',
              flex: 1,
              padding: 16,
              borderRadius: radius.medium,
              marginRight: 6,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>📈</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                ${(summaryData.monthlyAverage / 100).toFixed(0)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Monthly Avg
              </Text>
            </View>

            <View style={{
              backgroundColor: 'white',
              flex: 1,
              padding: 16,
              borderRadius: radius.medium,
              marginLeft: 6,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>💪</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                {(summaryData.savingsRate * 100).toFixed(0)}%
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Savings Rate
              </Text>
            </View>
          </View>
        </View>

        {/* Savings Chart */}
        <View style={{
          backgroundColor: 'white',
          margin: 20,
          padding: 20,
          borderRadius: radius.medium,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: colors.text,
            marginBottom: 16
          }}>
            Savings Progress
          </Text>

          {/* Timeframe Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row' }}>
              {[
                { key: 'week', label: '1W' },
                { key: 'month', label: '1M' },
                { key: '3months', label: '3M' },
                { key: '6months', label: '6M' },
                { key: 'year', label: '1Y' }
              ].map((period) => (
                <TouchableOpacity
                  key={period.key}
                  onPress={() => setTimeframe(period.key as any)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    marginRight: 8,
                    borderRadius: 16,
                    backgroundColor: timeframe === period.key ? colors.primary : colors.background,
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: timeframe === period.key ? 'white' : colors.textSecondary
                  }}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Proper Line Chart */}
          <View style={{
            backgroundColor: 'white',
            margin: 20,
            padding: 20,
            borderRadius: 16,
            height: 260,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <View style={{ flex: 1, position: 'relative' }}>
              
              {/* Y-axis labels */}
              <View style={{ position: 'absolute', left: 0, top: 0, bottom: 30, width: 40 }}>
                <Text style={{ position: 'absolute', top: '0%', right: 5, fontSize: 11, color: '#ccc', textAlign: 'right' }}>1250</Text>
                <Text style={{ position: 'absolute', top: '20%', right: 5, fontSize: 11, color: '#ccc', textAlign: 'right' }}>988</Text>
                <Text style={{ position: 'absolute', top: '40%', right: 5, fontSize: 11, color: '#ccc', textAlign: 'right' }}>725</Text>
                <Text style={{ position: 'absolute', top: '60%', right: 5, fontSize: 11, color: '#ccc', textAlign: 'right' }}>463</Text>
                <Text style={{ position: 'absolute', top: '80%', right: 5, fontSize: 11, color: '#ccc', textAlign: 'right' }}>200</Text>
              </View>

              {/* Chart area */}
              <View style={{ marginLeft: 45, flex: 1, marginBottom: 30, position: 'relative' }}>
                
                {/* Smooth area fill using many small vertical bars */}
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0 }}>
                  {/* Create smooth area fill using many thin vertical bars */}
                  {Array.from({ length: 100 }, (_, i) => {
                    const progress = i / 99;
                    
                    // Calculate smooth curve height for each bar
                    let heightPercent;
                    if (progress <= 0.2) {
                      heightPercent = 20 + (progress / 0.2) * 20; // 20% to 40%
                    } else if (progress <= 0.4) {
                      heightPercent = 40 + ((progress - 0.2) / 0.2) * 20; // 40% to 60%
                    } else if (progress <= 0.6) {
                      heightPercent = 60 + ((progress - 0.4) / 0.2) * 20; // 60% to 80%
                    } else if (progress <= 0.8) {
                      heightPercent = 80 + ((progress - 0.6) / 0.2) * 5; // 80% to 85%
                    } else {
                      heightPercent = 85 + ((progress - 0.8) / 0.2) * 10; // 85% to 95%
                    }
                    
                    return (
                      <View
                        key={i}
                        style={{
                          position: 'absolute',
                          left: `${progress * 100}%`,
                          bottom: 0,
                          width: '1%',
                          height: `${heightPercent}%`,
                          backgroundColor: 'rgba(66, 133, 244, 0.15)',
                        }}
                      />
                    );
                  })}
                </View>

                {/* Smooth connecting line using multiple small segments */}
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%' }}>
                  {/* Create smooth curve using many small line segments */}
                  {Array.from({ length: 50 }, (_, i) => {
                    const progress = i / 49;
                    const x = progress * 100;
                    
                    // Calculate smooth curve points
                    let y;
                    if (progress <= 0.2) {
                      y = 20 + (progress / 0.2) * 20; // 20% to 40%
                    } else if (progress <= 0.4) {
                      y = 40 + ((progress - 0.2) / 0.2) * 20; // 40% to 60%
                    } else if (progress <= 0.6) {
                      y = 60 + ((progress - 0.4) / 0.2) * 20; // 60% to 80%
                    } else if (progress <= 0.8) {
                      y = 80 + ((progress - 0.6) / 0.2) * 5; // 80% to 85%
                    } else {
                      y = 85 + ((progress - 0.8) / 0.2) * 10; // 85% to 95%
                    }
                    
                    return (
                      <View
                        key={i}
                        style={{
                          position: 'absolute',
                          left: `${x}%`,
                          bottom: `${y}%`,
                          width: 2,
                          height: 2,
                          backgroundColor: '#4285F4',
                          borderRadius: 1,
                        }}
                      />
                    );
                  })}
                </View>

                {/* Data points */}
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%' }}>
                  <View style={{ position: 'absolute', left: '0%', bottom: '20%', marginLeft: -4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4285F4', borderWidth: 2, borderColor: 'white' }} />
                  </View>
                  <View style={{ position: 'absolute', left: '20%', bottom: '40%', marginLeft: -4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4285F4', borderWidth: 2, borderColor: 'white' }} />
                  </View>
                  <View style={{ position: 'absolute', left: '40%', bottom: '60%', marginLeft: -4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4285F4', borderWidth: 2, borderColor: 'white' }} />
                  </View>
                  <View style={{ position: 'absolute', left: '60%', bottom: '80%', marginLeft: -4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4285F4', borderWidth: 2, borderColor: 'white' }} />
                  </View>
                  <View style={{ position: 'absolute', left: '80%', bottom: '85%', marginLeft: -4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4285F4', borderWidth: 2, borderColor: 'white' }} />
                  </View>
                  <View style={{ position: 'absolute', left: '100%', bottom: '95%', marginLeft: -4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4285F4', borderWidth: 2, borderColor: 'white' }} />
                  </View>
                </View>

                {/* X-axis labels */}
                <View style={{ position: 'absolute', bottom: -25, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 0 }}>
                  <Text style={{ fontSize: 11, color: '#999', textAlign: 'center', flex: 1 }}>Jan</Text>
                  <Text style={{ fontSize: 11, color: '#999', textAlign: 'center', flex: 1 }}>Feb</Text>
                  <Text style={{ fontSize: 11, color: '#999', textAlign: 'center', flex: 1 }}>Mar</Text>
                  <Text style={{ fontSize: 11, color: '#999', textAlign: 'center', flex: 1 }}>Apr</Text>
                  <Text style={{ fontSize: 11, color: '#999', textAlign: 'center', flex: 1 }}>May</Text>
                  <Text style={{ fontSize: 11, color: '#999', textAlign: 'center', flex: 1 }}>Jun</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Fun Facts */}
        <View style={{
          backgroundColor: 'white',
          margin: 20,
          padding: 20,
          borderRadius: radius.medium,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: colors.text,
            marginBottom: 16
          }}>
            💡 Did You Know?
          </Text>

          <View style={{
            backgroundColor: colors.primaryLight,
            padding: 16,
            borderRadius: radius.medium,
            marginBottom: 12,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary
          }}>
            <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
              {getCheekyFact(summaryData)}
            </Text>
          </View>

          <View style={{
            backgroundColor: '#e8f5e8',
            padding: 16,
            borderRadius: radius.medium,
            borderLeftWidth: 4,
            borderLeftColor: colors.success
          }}>
            <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
              🎯 You're <Text style={{ fontWeight: '700' }}>
                ${((summaryData.nextMilestone.amount - summaryData.totalSaved) / 100).toFixed(2)}
              </Text> away from your next milestone! At your current rate, you'll reach it in{' '}
              <Text style={{ fontWeight: '700' }}>{summaryData.nextMilestone.daysLeft} days</Text>.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ padding: 20, paddingBottom: 40 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("TransactionHistory" as any, { userId })}
            style={{
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: radius.medium,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 8 }}>📊</Text>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: 'white'
            }}>
              View Transaction History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePool')}
            style={{
              backgroundColor: 'white',
              padding: 16,
              borderRadius: radius.medium,
              borderWidth: 2,
              borderColor: colors.primary,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 8 }}>🎯</Text>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.primary
            }}>
              Start New Savings Goal
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
