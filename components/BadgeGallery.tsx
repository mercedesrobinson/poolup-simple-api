import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors, radius } from '../theme';
import { BadgeSystem, Badge, UserBadgeProgress } from '../services/badgeSystem';

interface BadgeGalleryProps {
  userId: string;
  onBadgePress?: (badge: Badge) => void;
}

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({
  userId,
  onBadgePress
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Badge['category'] | 'all'>('all');
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        setLoading(true);
        // Force fresh load of badges from BadgeSystem
        const allBadges = BadgeSystem.getAllBadges();
        console.log('BadgeGallery loading badges:', allBadges.slice(0, 2).map(b => ({ name: b.name, description: b.description })));
        
        // Mark first 2 badges as earned for demo
        const badgesWithEarnedStatus = allBadges.map((badge, index) => ({
          ...badge,
          earned: index < 2,
          earnedAt: index < 2 ? new Date().toISOString() : undefined
        }));
        
        setAllBadges(badgesWithEarnedStatus);
      } catch (error) {
        console.error('Failed to load badges:', error);
        setAllBadges(BadgeSystem.getAllBadges());
      } finally {
        setLoading(false);
      }
    };
    loadBadges();
  }, [userId]);

  const filteredBadges = selectedCategory === 'all' 
    ? allBadges.filter(badge => badge.earned) // Only show earned badges on homepage
    : allBadges.filter(badge => badge.category === selectedCategory && badge.earned);

  const categories = [
    { key: 'all' as const, name: 'All', icon: '🏆' },
    { key: 'invite' as const, name: 'Invites', icon: '🤝' },
    { key: 'pools' as const, name: 'Pools', icon: '🎯' },
    { key: 'savings' as const, name: 'Savings', icon: '💰' },
    { key: 'group' as const, name: 'Groups', icon: '👥' }
  ];

  const earnedCount = filteredBadges.filter(b => b.earned).length;
  const totalCount = filteredBadges.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Badge Collection</Text>
        <Text style={styles.progress}>
          {earnedCount}/{totalCount} Earned
        </Text>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.key && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Badge Grid */}
      <ScrollView style={styles.badgeGrid}>
        <View style={styles.badgeRow}>
          {filteredBadges.map((badge, index) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              onPress={() => onBadgePress?.(badge)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

interface BadgeCardProps {
  badge: Badge;
  onPress: () => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onPress }) => {
  const getBadgeProgress = (badge: Badge) => {
    // Mock user progress - in real app this would come from props or API
    const mockProgress = {
      friendsInvited: 2,
      poolsCreated: 1,
      totalSaved: 50000, // $500 in cents
      largestGroupSize: 3,
      totalGroupSavings: 150000 // $1500 in cents
    };
    return BadgeSystem.getBadgeProgress(badge, mockProgress);
  };

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return {
          gradient: ['#4CAF50', '#66BB6A'],
          iconBg: '#E8F5E8',
          iconBorder: '#C8E6C9',
          shimmer: '#81C784'
        };
      case 'rare':
        return {
          gradient: ['#2196F3', '#42A5F5'],
          iconBg: '#E3F2FD',
          iconBorder: '#BBDEFB',
          shimmer: '#64B5F6'
        };
      case 'epic':
        return {
          gradient: ['#9C27B0', '#BA68C8'],
          iconBg: '#F3E5F5',
          iconBorder: '#E1BEE7',
          shimmer: '#CE93D8'
        };
      case 'legendary':
        return {
          gradient: ['#FF9800', '#FFB74D'],
          iconBg: '#FFF3E0',
          iconBorder: '#FFCC02',
          shimmer: '#FFD54F'
        };
      default:
        return {
          gradient: ['#9E9E9E', '#BDBDBD'],
          iconBg: '#F5F5F5',
          iconBorder: '#E0E0E0',
          shimmer: '#EEEEEE'
        };
    }
  };

  const progress = getBadgeProgress(badge);
  const rarityColors = getRarityColors(badge.rarity);

  return (
    <TouchableOpacity
      style={[
        styles.badgeCard,
        !badge.earned && styles.badgeCardFaded,
        badge.earned && {
          backgroundColor: `${rarityColors.gradient[0]}15`,
          borderWidth: 2,
          borderColor: rarityColors.gradient[0],
        }
      ]}
      onPress={onPress}
    >
      {/* Gradient Background for Earned Badges */}
      {badge.earned && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: rarityColors.gradient[0],
        }} />
      )}

      <View style={styles.badgeIconContainer}>
        <Text style={[
          styles.badgeIcon,
          !badge.earned && styles.badgeIconFaded
        ]}>
          {badge.icon}
        </Text>

        {badge.earned && (
          <View style={[styles.earnedIndicator, { backgroundColor: rarityColors.gradient[0] }]}>
            <Text style={styles.earnedCheck}>✓</Text>
          </View>
        )}
      </View>
      
      <Text style={[
        styles.badgeName,
        !badge.earned && styles.badgeTextFaded
      ]}>
        {badge.name}
      </Text>
      
      <Text style={[
        styles.badgeDescription,
        !badge.earned && styles.badgeTextFaded
      ]}>
        {badge.description}
      </Text>

      {!badge.earned && (
        <View style={[styles.progressContainer, { paddingHorizontal: 12, width: '100%' }]}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${progress.percentage}%`,
                  backgroundColor: rarityColors.gradient[0]
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {badge.requirementType === 'total_saved' || badge.requirementType === 'group_savings'
              ? `$${(progress.current / 100).toLocaleString()} / $${(progress.required / 100).toLocaleString()}`
              : `${progress.current} / ${progress.required}`
            }
          </Text>
        </View>
      )}

      {badge.earned && (
        <View style={[styles.rarityBadge, { backgroundColor: rarityColors.gradient[0] }]}>
          <Text style={styles.rarityText}>{badge.rarity.toUpperCase()}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = '100%'; // Use percentage width to stay within container

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFCFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  progress: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.medium,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  categoryButtonActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryTextActive: {
    color: 'white',
  },
  badgeGrid: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 0,
    marginBottom: 16,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 140,
    width: '48%',
    position: 'relative',
    overflow: 'hidden',
  },
  badgeCardFaded: {
    opacity: 0.6,
  },
  badgeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 16,
    position: 'relative',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  badgeIcon: {
    fontSize: 40,
  },
  badgeIconFaded: {
    opacity: 0.5,
  },
  earnedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  earnedCheck: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  badgeDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  badgeTextFaded: {
    opacity: 0.7,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'left',
  },
  rarityBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
