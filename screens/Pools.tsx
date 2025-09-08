import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { colors, radius, shadow } from '../theme';
import { api } from '../services/api';
import { PoolCardSkeleton } from '../components/LoadingSkeleton';
import { GoalCategoryBadge } from '../components/GoalCategories';
import { BadgeGallery } from '../components/BadgeGallery';
import { useUser } from '../contexts/UserContext';

function PoolCard({ item, onPress }){
  // Handle pools without goals (open-ended saving)
  const hasGoal = item.goal_cents && item.goal_cents > 0;
  const pct = hasGoal ? Math.min(100, Math.round((item.saved_cents / item.goal_cents)*100)) : 0;
  
  // Calculate time to goal completion
  const getTimeToGoal = () => {
    if (!hasGoal || pct >= 100) return null;
    
    const remaining = item.goal_cents - item.saved_cents;
    const weeklyContribution = 5000; // $50/week estimate
    const weeksLeft = Math.ceil(remaining / weeklyContribution);
    
    if (weeksLeft <= 4) return `${weeksLeft} weeks left`;
    if (weeksLeft <= 52) return `${Math.ceil(weeksLeft / 4)} months left`;
    return `${Math.ceil(weeksLeft / 52)} years left`;
  };

  const getProgressColor = () => {
    if (pct >= 75) return '#34A853'; // Green
    if (pct >= 50) return '#FBBC04'; // Yellow
    if (pct >= 25) return '#FF6B35'; // Orange
    return colors.blue; // Blue
  };
  
  return (
    <TouchableOpacity onPress={onPress} style={{ 
      backgroundColor:'white', 
      marginBottom:12, 
      padding:16, 
      borderRadius: radius.medium,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text style={{ fontSize:18, fontWeight:'700', color: colors.text, flex: 1 }}>{item.name}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {item.category && <GoalCategoryBadge category={item.category} />}
          {item.destination && (
            <Text style={{ fontSize: 12, color: colors.blue, backgroundColor: colors.blue + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
              🌍 {item.destination}
            </Text>
          )}
        </View>
      </View>
      
      {hasGoal && (
        <>
          <View style={{ height:12, backgroundColor:'#e6eef7', borderRadius:8, overflow:'hidden', marginTop:8 }}>
            <View style={{ 
              width:`${pct}%`, 
              backgroundColor: getProgressColor(), 
              height:'100%',
              borderRadius: 8
            }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <View>
              <Text style={{ color:'#556', fontSize: 14 }}>${(item.saved_cents/100).toFixed(2)} of ${(item.goal_cents/100).toFixed(2)}</Text>
              {getTimeToGoal() && (
                <Text style={{ color: colors.blue, fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                  ⏰ {getTimeToGoal()}
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: getProgressColor(), fontSize: 16, fontWeight: '700' }}>{pct}%</Text>
              {pct >= 100 && (
                <Text style={{ fontSize: 12, color: '#34A853' }}>🎉 Complete!</Text>
              )}
            </View>
          </View>
        </>
      )}
      
      {!hasGoal && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ color:'#556', fontSize: 16, fontWeight: '600' }}>
            ${(item.saved_cents/100).toFixed(2)} saved
          </Text>
          <Text style={{ color: colors.green, fontSize: 12, marginTop: 2 }}>
            💰 Open savings pot
          </Text>
        </View>
      )}
      
      {item.bonus_pot_cents > 0 && (
        <Text style={{ color: colors.green, fontSize: 12, marginTop: 4 }}>
          🎁 Bonus: ${(item.bonus_pot_cents/100).toFixed(2)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function Pools({ navigation, route }) {
  const { user } = useUser();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadPools = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      const userPools = await api.getUserPools(user.id);
      // Filter out any mock data (pools with "Vacation Fund" name or mock IDs)
      const realPools = (userPools || []).filter(pool => 
        pool.name !== 'Vacation Fund' && 
        pool.id !== 'pool1' && 
        pool.id !== '1'
      );
      setPools(realPools);
    } catch (error) {
      console.error('Error loading pools:', error);
      setError('Failed to load pools. Please try again.');
      setPools([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPools();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, []);

  useEffect(() => {
    const s = navigation.addListener('focus', loadPools);
    return s;
  }, [navigation]);

  // Listen for refresh parameter
  useEffect(() => {
    if ((route.params as any)?.refresh) {
      loadPools();
    }
  }, [(route.params as any)?.refresh]);

  const getSavingsEquivalent = (amount) => {
    const amountInDollars = amount / 100;
    
    // Show motivational message for zero savings
    if (amountInDollars === 0) {
      return { text: `Start your savings journey today!`, icon: '🚀' };
    }
    
    const equivalents = [
      { threshold: 8000, text: `1 luxury trip to Medellin, Colombia`, icon: '🇨🇴' },
      { threshold: 6000, text: `1 week in Costa Rica paradise`, icon: '🌴' },
      { threshold: 5000, text: `1 epic European adventure`, icon: '✈️' },
      { threshold: 4000, text: `1 weekend in Napa Valley wine country`, icon: '🍷' },
      { threshold: 3500, text: `1 long weekend in Las Vegas`, icon: '🎰' },
      { threshold: 3000, text: `${Math.floor(amountInDollars / 600)} round-trip flights to Japan`, icon: '🇯🇵' },
      { threshold: 2500, text: `1 romantic getaway to Cartagena`, icon: '🏰' },
      { threshold: 2000, text: `${Math.floor(amountInDollars / 400)} flights to LA`, icon: '🌴' },
      { threshold: 1500, text: `${Math.floor(amountInDollars / 500)} flights to Mexico`, icon: '🇲🇽' },
      { threshold: 1000, text: `${Math.floor(amountInDollars / 200)} weekend getaways`, icon: '🏖️' },
      { threshold: 500, text: `${Math.floor(amountInDollars / 150)} concert tickets`, icon: '🎵' },
      { threshold: 200, text: `${Math.floor(amountInDollars / 50)} fancy dinners`, icon: '🍽️' },
      { threshold: 1, text: `${Math.floor(amountInDollars / 5)} coffee runs`, icon: '☕' }
    ];
    return equivalents.find(eq => amountInDollars >= eq.threshold) || { text: `Start saving today!`, icon: '🚀' };
  };


  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFCFF', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: colors.text }}>Loading your pools...</Text>
      </View>
    );
  }

  if (error && pools.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFCFF', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 8, textAlign: 'center' }}>Unable to load pools</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity 
          onPress={loadPools}
          style={{ backgroundColor: colors.primary, padding: 12, borderRadius: radius.medium, marginBottom: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CreatePool', { user })}
          style={{ backgroundColor: colors.green, padding: 12, borderRadius: radius.medium }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Create Your First Pool</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex:1, backgroundColor: '#FAFCFF' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Savings Summary Hero */}
      <View style={{ backgroundColor: colors.primary, paddingTop: 80, paddingBottom: 30, paddingHorizontal: 24 }}>
        <Text style={{ color: 'white', fontSize: 16, opacity: 0.9, marginBottom: 8, textAlign: 'center' }}>
          Total Saved
        </Text>
        <Text style={{ color: 'white', fontSize: 48, fontWeight: '700', textAlign: 'center', marginBottom: 16 }}>
          ${(pools.reduce((sum, pool) => sum + (pool.saved_cents || 0), 0) / 100).toFixed(2)}
        </Text>
        
        {(() => {
          const totalSaved = pools.reduce((sum, pool) => sum + (pool.saved_cents || 0), 0);
          const equivalent = getSavingsEquivalent(totalSaved);
          return (
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center'
            }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>{equivalent.icon}</Text>
              <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>
                {equivalent.text}
              </Text>
            </View>
          );
        })()}
      </View>

      {/* Quick Stats */}
      <View style={{ paddingHorizontal: 20, marginTop: -20, marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{
            backgroundColor: 'white',
            flex: 1,
            padding: 16,
            borderRadius: radius.medium,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <Text style={{ fontSize: 24, marginBottom: 4 }}>🎯</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
              {pools.filter(p => p.status === 'active').length}
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
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <Text style={{ fontSize: 24, marginBottom: 4 }}>🔥</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
              0
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Day Streak
            </Text>
          </View>

          <View style={{
            backgroundColor: 'white',
            flex: 1,
            padding: 16,
            borderRadius: radius.medium,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <Text style={{ fontSize: 24, marginBottom: 4 }}>💪</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
              0%
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Goal Progress
            </Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {/* Quick Actions */}
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <Text style={{ fontSize:18, fontWeight:'700', color: colors.text }}>Quick Actions</Text>
          <TouchableOpacity onPress={()=>navigation.navigate("Profile" as any, { user })} style={{ backgroundColor: colors.green, paddingVertical:8, paddingHorizontal:12, borderRadius:12 }}>
            <Text style={{ color:'white', fontWeight:'600', fontSize: 12 }}>👤 Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', marginBottom: 16, gap: 12 }}>
          <TouchableOpacity 
            onPress={()=>navigation.navigate("CreatePool" as any, { user })} 
            style={{ flex: 1, backgroundColor: colors.green, padding: 16, borderRadius: radius.medium, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 18, marginBottom: 4 }}>🎯</Text>
            <Text style={{ color:'white', fontWeight:'600', fontSize: 16 }}>New Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={()=>navigation.navigate("SoloSavings" as any, { user })} 
            style={{ flex: 1, backgroundColor: colors.purple, padding: 16, borderRadius: radius.medium, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 18, marginBottom: 4 }}>💰</Text>
            <Text style={{ color:'white', fontWeight:'600', fontSize: 16 }}>Friends Feed</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Actions */}
        <View style={{ flexDirection: 'row', marginBottom: 20, gap: 12 }}>
          <TouchableOpacity 
            onPress={()=>navigation.navigate("Badges" as any, { user })} 
            style={{ flex: 1, backgroundColor: '#FF6B6B', padding: 16, borderRadius: radius.medium, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 18, marginBottom: 4 }}>🏆</Text>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Badges</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={()=>navigation.navigate("SavingsSummary" as any, { userId: user.id })} 
            style={{ flex: 1, backgroundColor: colors.coral, padding: 16, borderRadius: radius.medium, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 18, marginBottom: 4 }}>📊</Text>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Savings Summary</Text>
          </TouchableOpacity>
        </View>

        {/* Pools List */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
            Your Pools
          </Text>
          {loading ? (
            <>
              <PoolCardSkeleton />
              <PoolCardSkeleton />
            </>
          ) : pools.length > 0 ? (
            <FlatList 
              data={pools} 
              keyExtractor={i=>i.id} 
              renderItem={({item})=>(
                <PoolCard item={item} onPress={()=>navigation.navigate("PoolDetail" as any, { user, poolId: item.id })} />
              )}
              scrollEnabled={false}
            />
          ) : (
            <View style={{ backgroundColor: 'white', padding: 24, borderRadius: radius.medium, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🎯</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 }}>
                Ready to Start Saving?
              </Text>
              <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 }}>
                Create your first pool and start earning points, badges, and rewards!
              </Text>
              <TouchableOpacity 
                onPress={()=>navigation.navigate("CreatePool" as any, { user })}
                style={{ backgroundColor: colors.purple, padding: 12, borderRadius: radius.medium, paddingHorizontal: 24 }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Create First Pool</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Badge Gallery */}
        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>🏆 Your Badges</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate("Badges" as any, { user })}
              style={{ backgroundColor: colors.purple + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
            >
              <Text style={{ color: colors.purple, fontSize: 14, fontWeight: '600' }}>View All →</Text>
            </TouchableOpacity>
          </View>
          
          <BadgeGallery 
            userId={user.id}
            onBadgePress={(badge) => {
              Alert.alert(
                badge.name,
                badge.description,
                [{ text: 'OK' }]
              );
            }}
          />
        </View>
        
        {/* Group Activity - Real Data */}
        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>🔥 Group Activity</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate("GroupActivity" as any, { user })}
              style={{ backgroundColor: colors.blue + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
            >
              <Text style={{ color: colors.blue, fontSize: 14, fontWeight: '600' }}>View All →</Text>
            </TouchableOpacity>
          </View>
          
          {/* Show empty state when no group activity */}
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: radius.medium + 4, marginBottom: 12, ...shadow }}>
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>👥</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                No Group Activity Yet
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
                Join or create a group to see activity from friends!
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={{ 
              backgroundColor: colors.blue + '10', 
              padding: 16, 
              borderRadius: radius.medium, 
              borderWidth: 1, 
              borderColor: colors.blue + '30',
              alignItems: 'center',
              marginTop: 8
            }}
            onPress={() => navigation.navigate("GroupActivity" as any, { user })}
          >
            <Text style={{ color: colors.blue, fontSize: 14, fontWeight: '600' }}>
              See more group activity 👥
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  quickStats: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: radius.medium,
    marginTop: 16,
  },
  quickStatsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.blue,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.blue + '20',
    minHeight: 48,
    ...shadow,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
