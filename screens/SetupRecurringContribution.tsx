import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { colors, radius } from '../theme';
import { api } from '../services/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type SetupRecurringContributionNavigationProp = StackNavigationProp<RootStackParamList, 'SetupRecurringContribution'>;
type SetupRecurringContributionRouteProp = RouteProp<RootStackParamList, 'SetupRecurringContribution'>;

interface Props {
  navigation: SetupRecurringContributionNavigationProp;
  route: SetupRecurringContributionRouteProp;
}

const DAYS_OF_WEEK = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 }
];

export default function SetupRecurringContribution({ navigation, route }: Props): React.JSX.Element {
  const [amount, setAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1); // Monday default
  const [selectedDayOfMonth, setSelectedDayOfMonth] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [loading, setLoading] = useState<boolean>(false);

  const poolId = (route.params as any)?.poolId;
  const poolName = (route.params as any)?.poolName || 'Pool';
  const userId = (route.params as any)?.userId || '1';

  const frequencies = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Bi-weekly', value: 'biweekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  const paymentMethods = [
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Debit Card', value: 'debit_card' },
    { label: 'Venmo', value: 'venmo' },
    { label: 'Cash App', value: 'cash_app' }
  ];

  const handleSetupRecurring = async (): Promise<void> => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid contribution amount');
      return;
    }

    setLoading(true);
    try {
      const recurringData = {
        poolId,
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        frequency,
        dayOfWeek: frequency === 'weekly' || frequency === 'biweekly' ? selectedDayOfWeek : undefined,
        dayOfMonth: frequency === 'monthly' ? selectedDayOfMonth : undefined,
        paymentMethod
      };

      await api.setupRecurringContribution(userId, recurringData);
      
      Alert.alert(
        'Success!',
        `Recurring contribution of $${amount} ${frequency} has been set up for ${poolName}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Failed to setup recurring contribution:', error);
      Alert.alert('Error', 'Failed to setup recurring contribution. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDaySelector = () => {
    if (frequency === 'weekly' || frequency === 'biweekly') {
      return (
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Day of the week
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  onPress={() => setSelectedDayOfWeek(day.value)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: radius.md,
                    backgroundColor: selectedDayOfWeek === day.value ? colors.primary : colors.cardBg,
                    borderWidth: 1,
                    borderColor: selectedDayOfWeek === day.value ? colors.primary : colors.border
                  }}
                >
                  <Text style={{
                    color: selectedDayOfWeek === day.value ? 'white' : colors.text,
                    fontWeight: selectedDayOfWeek === day.value ? '600' : '400',
                    fontSize: 14
                  }}>
                    {day.label.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      );
    }

    if (frequency === 'monthly') {
      return (
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Day of the month
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: colors.textSecondary }}>Day</Text>
            <TextInput
              value={selectedDayOfMonth.toString()}
              onChangeText={(text) => {
                const day = parseInt(text) || 1;
                setSelectedDayOfMonth(Math.min(Math.max(day, 1), 31));
              }}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.sm,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: colors.cardBg,
                color: colors.text,
                width: 60,
                textAlign: 'center'
              }}
            />
            <Text style={{ color: colors.textSecondary }}>of each month</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>
          Setup Recurring Contribution
        </Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 32 }}>
          Automate your savings for {poolName}
        </Text>

        {/* Amount Input */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Contribution Amount
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, color: colors.text, marginRight: 8 }}>$</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: colors.cardBg,
                color: colors.text,
                fontSize: 18
              }}
            />
          </View>
        </View>

        {/* Frequency Selection */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Frequency
          </Text>
          <View style={{ gap: 8 }}>
            {frequencies.map((freq) => (
              <TouchableOpacity
                key={freq.value}
                onPress={() => setFrequency(freq.value as any)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderRadius: radius.md,
                  backgroundColor: frequency === freq.value ? colors.primary + '20' : colors.cardBg,
                  borderWidth: 1,
                  borderColor: frequency === freq.value ? colors.primary : colors.border
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: frequency === freq.value ? colors.primary : colors.border,
                  backgroundColor: frequency === freq.value ? colors.primary : 'transparent',
                  marginRight: 12
                }} />
                <Text style={{
                  color: frequency === freq.value ? colors.primary : colors.text,
                  fontWeight: frequency === freq.value ? '600' : '400'
                }}>
                  {freq.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Day Selector */}
        {renderDaySelector()}

        {/* Payment Method */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Payment Method
          </Text>
          <View style={{ gap: 8 }}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.value}
                onPress={() => setPaymentMethod(method.value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderRadius: radius.md,
                  backgroundColor: paymentMethod === method.value ? colors.primary + '20' : colors.cardBg,
                  borderWidth: 1,
                  borderColor: paymentMethod === method.value ? colors.primary : colors.border
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: paymentMethod === method.value ? colors.primary : colors.border,
                  backgroundColor: paymentMethod === method.value ? colors.primary : 'transparent',
                  marginRight: 12
                }} />
                <Text style={{
                  color: paymentMethod === method.value ? colors.primary : colors.text,
                  fontWeight: paymentMethod === method.value ? '600' : '400'
                }}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Setup Button */}
        <TouchableOpacity
          onPress={handleSetupRecurring}
          disabled={loading}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: radius.md,
            alignItems: 'center',
            opacity: loading ? 0.7 : 1
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {loading ? 'Setting up...' : 'Setup Recurring Contribution'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
