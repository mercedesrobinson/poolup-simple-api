import { StripeProvider, useStripe, isPlatformPaySupported } from '@stripe/stripe-react-native';

// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_default';

// Apple Pay configuration
export const APPLE_PAY_MERCHANT_ID = 'merchant.com.poolup.app';

export interface PaymentResult {
  success: boolean;
  paymentMethod?: any;
  error?: string;
}

export const useApplePay = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const checkApplePaySupport = async () => {
    try {
      return await isPlatformPaySupported();
    } catch (error) {
      console.error('Error checking Apple Pay support:', error);
      return false;
    }
  };

  const initializeApplePay = async (clientSecret: string) => {
    try {
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'PoolUp',
        paymentIntentClientSecret: clientSecret,
        applePay: {
          merchantCountryCode: 'US',
        },
        style: 'alwaysDark',
        returnURL: 'poolup://payment-success',
      });

      if (error) {
        console.error('Error initializing payment sheet:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in initializeApplePay:', error);
      return false;
    }
  };

  const presentApplePay = async (): Promise<PaymentResult> => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Payment failed',
      };
    }
  };

  return {
    initializeApplePay,
    presentApplePay,
    checkApplePaySupport,
  };
};
