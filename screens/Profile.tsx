import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors, radius } from '../theme';
import { api } from '../services/api';

function StatCard({ title, value, subtitle, color = colors.blue }) {
  return (
    <View style={{ backgroundColor: 'white', padding: 16, borderRadius: radius.medium, flex: 1, marginHorizontal: 4 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color, textAlign: 'center' }}>{value}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, textAlign: 'center', marginTop: 4 }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 2 }}>{subtitle}</Text>}
    </View>
  );
}

function BadgeCard({ badge, earned = true }) {
  const rarityColors = {
    common: '#4CAF50',
    uncommon: '#2196F3',
    rare: '#9C27B0',
    epic: '#FF5722',
    legendary: '#FF9800'
  };

  const badgeColor = rarityColors[badge.rarity] || rarityColors.common;

  return (
    <View style={{ 
      backgroundColor: earned ? badgeColor + '20' : '#f5f5f5',
      borderRadius: radius.medium,
      padding: 16,
      alignItems: 'center',
      minHeight: 120,
      flex: 1,
      marginHorizontal: 4,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: earned ? badgeColor : '#e0e0e0'
    }}>
      {earned && (
        <View style={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: colors.green,
          borderRadius: 10,
          width: 20,
          height: 20,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>✓</Text>
        </View>
      )}
      
      <Text style={{ fontSize: 32, marginBottom: 8 }}>{badge.icon}</Text>
      
      <Text style={{ 
        fontSize: 14, 
        fontWeight: '700', 
        color: colors.text, 
        textAlign: 'center',
        marginBottom: 4
      }}>
        {badge.name}
      </Text>
      
      <Text style={{ 
        fontSize: 10, 
        color: badgeColor, 
        textTransform: 'uppercase', 
        fontWeight: '700',
        backgroundColor: badgeColor + '40',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8
      }}>
        {badge.rarity || 'COMMON'}
      </Text>
    </View>
  );
}

const styles = {
  avatarSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatarText: {
    fontSize: 32,
    color: 'white',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.blue,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadgeText: {
    fontSize: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  customizeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  customizeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
};

export default function Profile({ navigation, route }: any) {
  const { user } = route?.params || {};
  const [profile, setProfile] = useState({
    name: 'Mercedes',
    xp: 150,
    total_points: 250,
    current_streak: 3,
    badge_count: 2,
    avatar_type: 'default',
    avatar_data: null
  });
  const [badges, setBadges] = useState([
    { id: 1, name: 'First Pool', icon: '🎯', earned_at: '2024-01-15' },
    { id: 2, name: 'Streak Master', icon: '🔥', earned_at: '2024-01-20' }
  ]);
  const [card, setCard] = useState({
    last_four: '4242',
    balance_cents: 15000,
    status: 'active'
  });

  const loadProfile = async () => {
    try {
      // Profile data is already set in state, no need to load
      return;
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const createCard = async () => {
    try {
      const newCard = await api.createDebitCard(user.id, user.name);
      setCard(newCard);
      Alert.alert('Success!', 'Your PoolUp debit card has been created! 🎉');
    } catch (error) {
      Alert.alert('Error', 'Failed to create debit card');
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Always show profile with mock data if no user
  const displayProfile = user || {
    id: '1756612920173',
    name: 'Mercedes',
    email: 'mercedes@example.com'
  };

  const ProfileOption = ({ icon, title, subtitle, onPress }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'white',
        padding: 16,
        borderRadius: radius.medium,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 24, marginRight: 16 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          {subtitle}
        </Text>
      </View>
      <Text style={{ fontSize: 16, color: '#999' }}>›</Text>
    </TouchableOpacity>
  );

  // Always show profile with displayProfile data
  const showProfile = () => {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#FAFCFF' }}>
        {/* Hero Header with Gradient */}
        <View style={{
          backgroundColor: colors.primary,
          padding: 24,
          paddingTop: 80,
          alignItems: 'center',
          position: 'relative'
        }}>
          {/* Decorative elements */}
          <View style={{
            position: 'absolute',
            top: 60,
            right: 20,
            opacity: 0.1
          }}>
            <Text style={{ fontSize: 60, color: 'white' }}>🎯</Text>
          </View>
          <View style={{
            position: 'absolute',
            top: 120,
            left: 30,
            opacity: 0.1
          }}>
            <Text style={{ fontSize: 40, color: 'white' }}>💰</Text>
          </View>
          
          <View style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: 'rgba(255,255,255,0.25)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            borderWidth: 3,
            borderColor: 'rgba(255,255,255,0.3)'
          }}>
            <Text style={{ fontSize: 36, color: 'white' }}>
              {displayProfile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <Text style={{ fontSize: 26, fontWeight: '800', color: 'white', marginBottom: 6 }}>
            {displayProfile.name}
          </Text>
          
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            marginBottom: 8
          }}>
            <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>
              Level 3 Saver 🌟
            </Text>
          </View>
          
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
            Member since Jan 2024
          </Text>
        </View>

        <View style={{ padding: 16 }}>
          {/* Achievement Stats with Visual Flair */}
          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: radius.medium, 
            padding: 20,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16, textAlign: 'center' }}>
              🎉 Your Achievements
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  backgroundColor: colors.primary + '20',
                  borderRadius: 30,
                  width: 60,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: colors.primary }}>3</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>Active</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>Pools</Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  backgroundColor: colors.coral + '20',
                  borderRadius: 30,
                  width: 60,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 20 }}>🔥</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>14 Day</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>Streak</Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  backgroundColor: colors.green + '20',
                  borderRadius: 30,
                  width: 60,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: colors.green }}>2</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>Badges</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>Earned</Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  backgroundColor: colors.purple + '20',
                  borderRadius: 30,
                  width: 60,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: colors.purple }}>$2.1k</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>Total</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>Saved</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Grid */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
              ⚡ Quick Actions
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Pools" as any, { user: displayProfile })}
                style={{
                  backgroundColor: colors.primary + '15',
                  borderRadius: radius.medium,
                  padding: 16,
                  width: '48%',
                  alignItems: 'center',
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.primary + '30'
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 8 }}>💰</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>My Pools</Text>
                <Text style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>View savings goals</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => navigation.navigate("DebitCard" as any, { user: displayProfile })}
                style={{
                  backgroundColor: colors.green + '15',
                  borderRadius: radius.medium,
                  padding: 16,
                  width: '48%',
                  alignItems: 'center',
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.green + '30'
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 8 }}>💳</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Debit Card</Text>
                <Text style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>Manage your card</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => navigation.navigate("Badges" as any, { user: displayProfile })}
                style={{
                  backgroundColor: colors.coral + '15',
                  borderRadius: radius.medium,
                  padding: 16,
                  width: '48%',
                  alignItems: 'center',
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.coral + '30'
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🏆</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Badges</Text>
                <Text style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>View achievements</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => navigation.navigate("Settings" as any, { user: displayProfile })}
                style={{
                  backgroundColor: colors.blue + '15',
                  borderRadius: radius.medium,
                  padding: 16,
                  width: '48%',
                  alignItems: 'center',
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.blue + '30'
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 8 }}>⚙️</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Settings</Text>
                <Text style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>App preferences</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  if (!profile) {
    // Show loading state with basic user info
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#FAFCFF' }}>
        <View style={{ padding: 24, backgroundColor: colors.purple, paddingTop: 80 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 32, color: 'white' }}>👤</Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: 'white', marginBottom: 8 }}>{displayProfile.name}</Text>
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>Level 1</Text>
          </View>
        </View>
        
        <View style={{ padding: 24 }}>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <View style={{ backgroundColor: 'white', padding: 16, borderRadius: radius.medium, flex: 1, marginHorizontal: 4 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: colors.purple, textAlign: 'center' }}>0</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, textAlign: 'center', marginTop: 4 }}>Points</Text>
            </View>
            <View style={{ backgroundColor: 'white', padding: 16, borderRadius: radius.medium, flex: 1, marginHorizontal: 4 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: colors.coral, textAlign: 'center' }}>0🔥</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, textAlign: 'center', marginTop: 4 }}>Streak</Text>
            </View>
            <View style={{ backgroundColor: 'white', padding: 16, borderRadius: radius.medium, flex: 1, marginHorizontal: 4 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: colors.green, textAlign: 'center' }}>0</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, textAlign: 'center', marginTop: 4 }}>Badges</Text>
            </View>
          </View>
          
          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: radius.medium }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>Quick Actions</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate("Pools" as any, { user: displayProfile })}
              style={{ backgroundColor: colors.green, padding: 12, borderRadius: radius.medium, marginBottom: 8 }}
            >
              <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center' }}>View Pools</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate("CreatePool" as any, { user: displayProfile })}
              style={{ backgroundColor: colors.purple, padding: 12, borderRadius: radius.medium }}
            >
              <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center' }}>Create New Pool</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  const level = Math.floor((profile?.xp || 0) / 100) + 1;
  const xpProgress = ((profile?.xp || 0) % 100) / 100;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFCFF' }}>
      {/* Header */}
      <View style={{ padding: 24, backgroundColor: colors.purple, paddingTop: 80 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: 'white', fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Settings" as any, { userId: user.id })}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.avatarSection as any}>
          <View style={styles.avatar as any}>
            <Text style={styles.avatarText}>👤</Text>
            <TouchableOpacity style={styles.editBadge as any} onPress={() => navigation.navigate('ProfilePhotoUpload')}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName as any}>{profile.name}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
          <Text style={{ fontSize: 18, color: 'white', opacity: 0.9 }}>Level {level}</Text>
          <View style={{ 
            height: 8, 
            backgroundColor: 'rgba(255,255,255,0.3)', 
            borderRadius: 4, 
            flex: 1, 
            marginLeft: 12,
            overflow: 'hidden'
          }}>
            <View style={{ 
              width: `${xpProgress * 100}%`, 
              backgroundColor: 'white', 
              height: '100%' 
            }} />
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={{ padding: 24, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <StatCard title="Points" value={profile?.total_points || 0} subtitle="" color={colors.purple} />
          <StatCard title="Streak" value={`${profile?.current_streak || 0}🔥`} subtitle="days" color={colors.coral} />
          <StatCard title="Badges" value={profile?.badge_count || 0} subtitle="" color={colors.green} />
        </View>


        {/* Badges Section */}
        <View style={{ backgroundColor: 'white', padding: 16, borderRadius: radius.medium, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 8 }}>🏆</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                Your Badges
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate("Badges" as any, { user, badges })}
              style={{
                backgroundColor: colors.blue + '20',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16
              }}
            >
              <Text style={{ color: colors.blue, fontWeight: '600', fontSize: 12 }}>View All →</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={{ 
            fontSize: 14, 
            color: '#666', 
            marginBottom: 12,
            textAlign: 'center'
          }}>
            {badges.length}/12 Earned
          </Text>
          
          {badges.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {badges.slice(0, 2).map(badge => (
                <BadgeCard key={badge.id} badge={badge} earned={true} />
              ))}
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <View style={{
                backgroundColor: '#f5f5f5',
                borderRadius: radius.medium,
                padding: 20,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#e0e0e0',
                borderStyle: 'dashed'
              }}>
                <Text style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>🎯</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>No badges yet</Text>
                <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
                  Complete your first goal to earn badges!
                </Text>
              </View>
            </View>
          )}
        </View>

      {/* Savings Summary */}
      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: radius.medium, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
            💰 Savings Summary
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SavingsSummary" as any, { user })}>
            <Text style={{ color: colors.blue, fontWeight: '600' }}>View Details →</Text>
          </TouchableOpacity>
        </View>
        
        {/* Total Saved Card */}
        <View style={{ 
          backgroundColor: colors.primary, 
          padding: 16, 
          borderRadius: radius.medium, 
          marginBottom: 12,
          alignItems: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 14, opacity: 0.9 }}>Total Saved</Text>
          <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>$1,250.00</Text>
          <Text style={{ color: 'white', fontSize: 12, opacity: 0.8 }}>🏖️ 6 weekend getaways</Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, backgroundColor: '#f8f9fa', padding: 12, borderRadius: radius.medium, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>🎯</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>3</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Active Goals</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#f8f9fa', padding: 12, borderRadius: radius.medium, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>🔥</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>14</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Day Streak</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#f8f9fa', padding: 12, borderRadius: radius.medium, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>💪</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>23%</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Savings Rate</Text>
          </View>
        </View>
      </View>

      {/* Transaction History */}
      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: radius.medium, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
            📊 Recent Activity
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("TransactionHistory" as any, { user })}>
            <Text style={{ color: colors.blue, fontWeight: '600' }}>View All →</Text>
          </TouchableOpacity>
        </View>
        
        {/* Recent Transactions */}
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>💰</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Contribution</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>Bali Adventure • 2 days ago</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.success }}>+$150.00</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Contribution</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>Tokyo Trip • 5 days ago</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.success }}>+$250.00</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Penalty</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>Missed weekly contribution</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.coral }}>$50.00</Text>
          </View>
        </View>
      </View>  
        {/* Projection */}
        <View style={{ backgroundColor: colors.blue + '10', padding: 12, borderRadius: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
            📈 12-Month Projection
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            At your current pace, you'll save <Text style={{ fontWeight: '700', color: colors.green }}>$6,000</Text> by next year
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: radius.medium, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          Quick Actions
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => navigation.navigate("CreatePool" as any, { user })} style={{ backgroundColor: colors.green, padding: 12, borderRadius: radius.medium, flex: 1, marginRight: 8, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>New Pool</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('SoloSavings')} style={{ backgroundColor: colors.blue, padding: 12, borderRadius: radius.medium, flex: 1, marginLeft: 8, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Solo Goal</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Settings" as any, { user })} style={{ backgroundColor: colors.gray, padding: 12, borderRadius: radius.medium, alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
