// ==============================================================================
// CASHIFY CLIENT API CONFIGURATION
// Paste Cashify key in Secrets as CASHIFY_CLIENT_KEY
// ==============================================================================

/**
 * Cashify Client Configuration
 *
 * NOTE: The client API key is read from server environment variables (process.env.CASHIFY_CLIENT_KEY)
 * or client environment (VITE_CASHIFY_CLIENT_KEY).
 * To configure: Paste Cashify key in Secrets as CASHIFY_CLIENT_KEY.
 */
export const CASHIFY_CONFIG = {
  keyName: 'CASHIFY_CLIENT_KEY',
  apiProxyUrl: '/api/cashify/estimate',
  statusUrl: '/api/cashify/status',
  createPaymentUrl: '/api/cashify/payment/create-order',
  verifyPaymentUrl: '/api/cashify/payment/verify',
  // Official Cashify partner endpoint URL for reference
  officialBaseUrl: 'https://api.cashify.in',
  // Supported mobile device brands for old phone trade-in / valuation
  supportedBrands: [
    'Apple',
    'Samsung',
    'OnePlus',
    'Xiaomi',
    'Redmi',
    'Realme',
    'Vivo',
    'OPPO',
    'Motorola',
    'Google',
    'POCO',
    'iQOO'
  ] as const,
  // Device conditions for price calculation
  conditionGrades: [
    { id: 'flawless', label: 'Flawless / Like New (No scratches, all functions work)' },
    { id: 'good', label: 'Good (Minor body scuffs, screen 100% working)' },
    { id: 'average', label: 'Average (Visible signs of usage, functional battery)' }
  ]
};

export interface CashifyEstimateRequest {
  brand: string;
  model: string;
  variant?: string;
  storage?: string;
  physicalCondition?: 'flawless' | 'good' | 'average' | string;
  screenCondition?: 'flawless' | 'scratched' | 'cracked' | string;
  batteryHealth?: string;
  functionalIssues?: string;
  accessories?: string[];
}

export interface CashifyEstimateResponse {
  success: boolean;
  isKeyMissing?: boolean;
  provider?: string;
  estimatedValue: number;
  currency: string;
  brand: string;
  model: string;
  condition: string;
  friendlyMessage?: string;
  error?: string;
  rawQuote?: any;
}
