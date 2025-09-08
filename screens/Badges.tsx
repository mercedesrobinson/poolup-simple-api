import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors, radius } from '../theme';
import { BadgeSystem, Badge as SystemBadge } from '../services/badgeSystem';
import { api } from '../services/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { useUser } from '../contexts/UserContext';

type BadgesNavigationProp = StackNavigationProp<RootStackParamList, 'Badges'>;
type BadgesRouteProp = RouteProp<RootStackParamList, 'Badges'>;

interface Props {
  navigation: BadgesNavigationProp;
  route: BadgesRouteProp;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points_required?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earned_at?: string;
}

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
}

function BadgeCard({ badge, earned = false }: BadgeCardProps): React.JSX.Element {
  const rarityColors = {
    common: '#95a5a6',
    uncommon: '#3498db',
    rare: '#9b59b6',
    epic: '#e74c3c',
    legendary: '#f39c12'
  };

  return (
    <View style={{ 
      backgroundColor: earned ? 'white' : '#f8f9fa',
      paddingVertical: 6,
      paddingHorizontal: 8, 
      borderRadius: radius.small, 
      marginBottom: 3,
      borderWidth: 1,
      borderColor: earned ? rarityColors[badge.rarity] : '#e9ecef',
      opacity: earned ? 1 : 0.7,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 44
    }}>
      <Text style={{ fontSize: 18, marginRight: 8 }}>{badge.icon}</Text>
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 1 }}>
          {badge.name}
        </Text>
        <Text style={{ fontSize: 11, color: '#666', lineHeight: 13 }}>
          {badge.description}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        {earned && (
          <Text style={{ fontSize: 12, color: colors.green, fontWeight: '600', marginBottom: 2 }}>
            ✓
          </Text>
        )}
        <Text style={{ 
          fontSize: 8, 
          color: rarityColors[badge.rarity], 
          textTransform: 'uppercase', 
          fontWeight: '700',
          backgroundColor: `${rarityColors[badge.rarity]}20`,
          paddingHorizontal: 3,
          paddingVertical: 1,
          borderRadius: 4,
          marginBottom: 1
        }}>
          {badge.rarity}
        </Text>
        {badge.points_required > 0 && (
          <Text style={{ fontSize: 9, color: '#666' }}>
            {badge.points_required}pts
          </Text>
        )}
      </View>
    </View>
  );
}

export default function Badges({ navigation, route }: Props): React.JSX.Element {
  const { user } = useUser();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setError(null);
      // Load all available badges from BadgeSystem
      const systemBadges = BadgeSystem.getAllBadges();
      
      // Convert system badges to match our interface
      const allBadges: Badge[] = systemBadges.map(badge => ({
        ...badge,
        points_required: (badge as any).points_required || 0
      }));
      
      // Load user's earned badges from API
      let earnedBadgeIds: string[] = [];
      if (user?.id) {
        try {
          const userBadges = await api.getUserBadges(user.id);
          // Ensure userBadges is an array before mapping
          if (Array.isArray(userBadges)) {
            earnedBadgeIds = userBadges.map(b => b.id);
          } else {
            console.warn('getUserBadges returned non-array:', userBadges);
            earnedBadgeIds = [];
          }
        } catch (error) {
          console.error('Failed to load user badges:', error);
          // Don't set error state for badges API failure, just continue with empty badges
          earnedBadgeIds = [];
        }
      }
      
      setBadges(allBadges);
      setEarnedBadges(earnedBadgeIds);
    } catch (error) {
      console.error('Error loading badges:', error);
      setError('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      console.error('Error:', error);
    }
  }, [error]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFCFF', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: colors.text }}>Loading badges...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFCFF', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 8, textAlign: 'center' }}>Unable to load badges</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity 
          onPress={loadBadges}
          style={{ backgroundColor: colors.primary, padding: 12, borderRadius: radius.medium }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const earnedCount = earnedBadges.length;
  const totalCount = badges.length;
  const progress = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFCFF' }}>
      {/* Header */}
      <View style={{ padding: 24, backgroundColor: colors.purple, paddingTop: 80 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
          <Text style={{ color: 'white', fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: '800', color: 'white', textAlign: 'center' }}>
          🏆 Badge Collection
        </Text>
        <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 8 }}>
          {earnedCount} of {totalCount} badges earned
        </Text>
        <View style={{ 
          height: 8, 
          backgroundColor: 'rgba(255,255,255,0.3)', 
          borderRadius: 4, 
          marginTop: 12,
          overflow: 'hidden'
        }}>
          <View style={{ 
            width: `${progress}%`, 
            backgroundColor: 'white', 
            height: '100%' 
          }} />
        </View>
      </View>

      {/* Badge Categories */}
      <View style={{ padding: 16 }}>
        {earnedCount > 0 && (
          <>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
              ✨ Your Badges
            </Text>
            {badges.filter(b => earnedBadges.includes(b.id)).map(badge => (
              <BadgeCard key={badge.id} badge={badge} earned={true} />
            ))}
          </>
        )}

        {/* Friends Badges */}
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8, marginTop: earnedCount > 0 ? 24 : 0 }}>
          👥 Friends & Social
        </Text>
        <View style={{ height: 2, backgroundColor: colors.primary, borderRadius: 1, marginBottom: 12, opacity: 0.3 }} />
        {badges.filter(b => !earnedBadges.includes(b.id) && b.category === 'friends').map(badge => (
          <BadgeCard key={badge.id} badge={badge} earned={false} />
        ))}

        {/* Pool Badges */}
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8, marginTop: 24 }}>
          🎯 Pool Goals
        </Text>
        <View style={{ height: 2, backgroundColor: colors.green, borderRadius: 1, marginBottom: 12, opacity: 0.3 }} />
        {badges.filter(b => !earnedBadges.includes(b.id) && b.category === 'pools').map(badge => (
          <BadgeCard key={badge.id} badge={badge} earned={false} />
        ))}

        {/* Savings Badges */}
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8, marginTop: 24 }}>
          💰 Savings Milestones
        </Text>
        <View style={{ height: 2, backgroundColor: colors.orange, borderRadius: 1, marginBottom: 12, opacity: 0.3 }} />
        {badges.filter(b => !earnedBadges.includes(b.id) && b.category === 'savings').map(badge => (
          <BadgeCard key={badge.id} badge={badge} earned={false} />
        ))}

        {earnedCount === 0 && (
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: radius.medium, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🎯</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 }}>
              Start Your Badge Journey!
            </Text>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
              Make your first contribution to earn your first badge and start climbing the leaderboards!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
