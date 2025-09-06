import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors, radius } from '../theme';
import { AICoach, SavingsInsight } from '../services/aiCoach';
import { Pool } from '../types/index';

interface AICoachCardProps {
  pool: Pool;
  recentContributions?: number[];
  onActionPress?: (action: string) => void;
}

export const AICoachCard: React.FC<AICoachCardProps> = ({
  pool,
  recentContributions = [],
  onActionPress
}) => {
  const [insight, setInsight] = useState<SavingsInsight | null>(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    generateInsight();
  }, [pool, recentContributions]);

  useEffect(() => {
    if (insight) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [insight]);

  const generateInsight = () => {
    const progressInsight = AICoach.generateProgressInsight(pool, recentContributions);
    setInsight(progressInsight);
  };

  const showWeeklyChallenge = () => {
    const challenge = AICoach.generateWeeklyChallenge(pool);
    setInsight(challenge);
    setShowChallenge(true);
  };

  const showSavingsTip = () => {
    const tip = AICoach.generateSavingsTip(pool, recentContributions);
    setInsight(tip);
    setShowChallenge(false);
  };

  if (!insight) return null;

  const getCardStyle = () => {
    switch (insight.type) {
      case 'celebration':
        return [styles.card, styles.celebrationCard];
      case 'motivation':
        return [styles.card, styles.motivationCard];
      case 'tip':
        return [styles.card, styles.tipCard];
      case 'warning':
        return [styles.card, styles.warningCard];
      default:
        return [styles.card];
    }
  };

  return (
    <Animated.View style={[getCardStyle(), { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{insight.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{insight.title}</Text>
          <Text style={styles.aiLabel}>AI Coach</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={showSavingsTip} style={styles.actionButton}>
            <Text style={styles.actionText}>💡</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={showWeeklyChallenge} style={styles.actionButton}>
            <Text style={styles.actionText}>🎯</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.message}>{insight.message}</Text>
      
      {insight.actionable && insight.suggestedAction && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onActionPress?.(insight.suggestedAction!)}
        >
          <Text style={styles.actionButtonText}>{insight.suggestedAction}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: radius.medium,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  celebrationCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
    backgroundColor: colors.green + '10',
  },
  motivationCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.blue,
    backgroundColor: colors.blue + '10',
  },
  tipCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.purple,
    backgroundColor: colors.purple + '10',
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.coral,
    backgroundColor: colors.coral + '10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  aiLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: colors.blue,
    borderRadius: radius.small,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
