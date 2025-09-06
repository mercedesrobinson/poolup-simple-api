import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, radius } from '../theme';
import { AIVisualizer, ProgressVisualization as ProgressViz, AchievementBadge } from '../services/aiVisualizer';
import { Pool } from '../types/index';

interface ProgressVisualizationProps {
  pool: Pool;
  showBadges?: boolean;
}

export const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  pool,
  showBadges = true
}) => {
  const [visualization, setVisualization] = useState<ProgressViz | null>(null);
  const [progressAnim] = useState(new Animated.Value(0));
  const [badgeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const viz = AIVisualizer.generateProgressVisualization(pool);
    setVisualization(viz);
    
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: viz.progressPercent / 100,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Animate badge if unlocked
    if (viz.badgeUnlocked) {
      Animated.sequence([
        Animated.delay(1000),
        Animated.spring(badgeAnim, {
          toValue: 1,
          useNativeDriver: true,
        })
      ]).start();
    }

    // Pulse animation for celebration
    if (viz.celebrationLevel === 'high' || viz.celebrationLevel === 'complete') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pool]);

  if (!visualization) return null;

  const progressMessage = AIVisualizer.getProgressMessage(pool, visualization.progressPercent);
  const progressFact = AIVisualizer.getProgressBasedFact(pool, visualization.progressPercent);

  const getProgressBarColor = () => {
    if (visualization.progressPercent >= 90) return colors.green;
    if (visualization.progressPercent >= 75) return colors.blue;
    if (visualization.progressPercent >= 50) return colors.purple;
    return colors.coral;
  };

  const getCelebrationEmoji = () => {
    switch (visualization.celebrationLevel) {
      case 'complete': return '🎉🎊✨';
      case 'high': return '🚀⭐🔥';
      case 'medium': return '🎯💪⚡';
      default: return '🌟💫🌱';
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <Animated.View style={[styles.header, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.progressText}>{progressMessage}</Text>
        <Text style={styles.celebrationEmoji}>{getCelebrationEmoji()}</Text>
      </Animated.View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: getProgressBarColor(),
              }
            ]}
          />
        </View>
        <Text style={styles.percentageText}>
          {visualization.progressPercent.toFixed(0)}%
        </Text>
      </View>

      {/* Amount Progress */}
      <View style={styles.amountContainer}>
        <Text style={styles.savedAmount}>
          ${(pool.saved_cents / 100).toLocaleString()}
        </Text>
        <Text style={styles.goalAmount}>
          of ${(pool.goal_cents / 100).toLocaleString()}
        </Text>
      </View>

      {/* AI-Generated Destination Visualization */}
      <View style={styles.destinationContainer}>
        <Text style={styles.destinationTitle}>
          {pool.destination ? `Your ${pool.destination} Adventure` : 'Your Dream Goal'}
        </Text>
        <View style={styles.imageContainer}>
          <Text style={styles.imagePlaceholder}>
            🖼️ AI-Generated Image
          </Text>
          <Text style={styles.imagePrompt}>
            {visualization.imagePrompt.substring(0, 100)}...
          </Text>
        </View>
      </View>

      {/* Progress-Based Fun Fact */}
      <View style={styles.factContainer}>
        <Text style={styles.factText}>{progressFact}</Text>
      </View>

      {/* Achievement Badge */}
      {showBadges && visualization.badgeUnlocked && (
        <Animated.View 
          style={[
            styles.badgeContainer,
            {
              opacity: badgeAnim,
              transform: [
                {
                  scale: badgeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            }
          ]}
        >
          <BadgeDisplay badge={visualization.badgeUnlocked} />
        </Animated.View>
      )}
    </View>
  );
};

const BadgeDisplay: React.FC<{ badge: AchievementBadge }> = ({ badge }) => {
  const getBadgeColor = () => {
    switch (badge.rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9B59B6';
      case 'rare': return '#3498DB';
      default: return '#95A5A6';
    }
  };

  return (
    <View style={[styles.badge, { borderColor: getBadgeColor() }]}>
      <Text style={styles.badgeIcon}>{badge.icon}</Text>
      <Text style={styles.badgeName}>{badge.name}</Text>
      <Text style={styles.badgeDescription}>{badge.description}</Text>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: radius.medium,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationEmoji: {
    fontSize: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#E9ECEF',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    minWidth: 45,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  savedAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.green,
  },
  goalAmount: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  destinationContainer: {
    marginBottom: 16,
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  imageContainer: {
    backgroundColor: colors.blue + '10',
    borderRadius: radius.medium,
    padding: 16,
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 48,
    marginBottom: 8,
  },
  imagePrompt: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  factContainer: {
    backgroundColor: colors.purple + '10',
    borderRadius: radius.small,
    padding: 12,
    marginBottom: 16,
  },
  factText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  badgeContainer: {
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: radius.medium,
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
