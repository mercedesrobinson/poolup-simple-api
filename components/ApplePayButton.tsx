import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useApplePay } from '../services/stripe';
import { api } from '../services/api';

interface ApplePayButtonProps {
  amount: number;
  poolId?: string;
  onSuccess?: (paymentResult: any) => void;
  onError?: (error: string) => void;
  style?: any;
}

export const ApplePayButton: React.FC<ApplePayButtonProps> = ({
  amount,
  poolId,
  onSuccess,
  onError,
  style
}) => {
  const [loading, setLoading] = useState(false);
  const { initializeApplePay, presentApplePay, checkApplePaySupport } = useApplePay();

  const handleApplePayPress = async () => {
    try {
      setLoading(true);

      // Check if Apple Pay is supported
      const supported = await checkApplePaySupport();
      if (!supported) {
        Alert.alert('Apple Pay Not Available', 'Apple Pay is not supported on this device.');
        return;
      }

      // Create payment intent on backend
      const paymentIntentResponse = await api.post('/payments/create-intent', {
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        poolId,
      });

      if (!paymentIntentResponse.data.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Initialize Apple Pay
      const initialized = await initializeApplePay(paymentIntentResponse.data.clientSecret);
      if (!initialized) {
        throw new Error('Failed to initialize Apple Pay');
      }

      // Present Apple Pay
      const result = await presentApplePay();
      
      if (result.success) {
        // Add money to pool
        if (poolId) {
          await api.post(`/pools/${poolId}/add-money`, {
            amount: amount * 100,
            paymentMethod: 'apple_pay',
            paymentIntentId: paymentIntentResponse.data.id,
          });
        }

        Alert.alert('Success!', `$${amount} has been added to your pool via Apple Pay.`);
        onSuccess?.(result);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      Alert.alert('Payment Failed', errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.applePayButton, style]}
      onPress={handleApplePayPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <View style={styles.buttonContent}>
          <Text style={styles.applePayIcon}>🍎</Text>
          <Text style={styles.applePayText}>Pay</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  applePayButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applePayIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  applePayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
