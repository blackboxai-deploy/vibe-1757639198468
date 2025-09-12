import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

// Pricing configurations
export const PRICING_PLANS = {
  FREE: {
    name: 'Free',
    credits: 5,
    dailyLimit: 5,
    price: 0,
    features: [
      '5 generations per day',
      'Standard quality (1024x1024)',
      'Basic templates',
      'Community support'
    ],
  },
  STARTER: {
    name: 'Starter',
    credits: 100,
    monthlyCredits: 100,
    price: 999, // $9.99 in cents
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    features: [
      '100 generations per month',
      'HD quality (up to 2048x2048)',
      'No watermarks',
      'Premium templates',
      'Email support',
      'Basic commercial license'
    ],
  },
  PRO: {
    name: 'Pro',
    credits: 500,
    monthlyCredits: 500,
    price: 2999, // $29.99 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    features: [
      '500 generations per month',
      'Ultra-HD quality (up to 4096x4096)',
      'Priority generation queue',
      'Advanced editing tools',
      'All templates and styles',
      'Priority support',
      'Full commercial license'
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    credits: -1, // Unlimited
    monthlyCredits: -1,
    price: 9999, // $99.99 in cents
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    features: [
      'Unlimited generations',
      'API access',
      'Custom model training',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee'
    ],
  },
};

// Credit packages for one-time purchases
export const CREDIT_PACKAGES = {
  SMALL: {
    credits: 50,
    price: 499, // $4.99
    priceId: process.env.STRIPE_CREDITS_50_PRICE_ID || 'price_credits_50',
    savings: 0,
  },
  MEDIUM: {
    credits: 150,
    price: 1299, // $12.99 (15% discount)
    priceId: process.env.STRIPE_CREDITS_150_PRICE_ID || 'price_credits_150',
    savings: 15,
  },
  LARGE: {
    credits: 300,
    price: 2299, // $22.99 (25% discount)
    priceId: process.env.STRIPE_CREDITS_300_PRICE_ID || 'price_credits_300',
    savings: 25,
  },
  BULK: {
    credits: 1000,
    price: 6999, // $69.99 (30% discount)
    priceId: process.env.STRIPE_CREDITS_1000_PRICE_ID || 'price_credits_1000',
    savings: 30,
  },
};

// Create Stripe customer
export async function createStripeCustomer(email: string, name?: string, userId?: string) {
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId: userId || '',
      source: 'ai_image_generator',
    },
  });
  return customer;
}

// Create checkout session for subscription
export async function createSubscriptionCheckout(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  userId: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    metadata: {
      type: 'subscription',
      userId: userId,
    },
  });
  return session;
}

// Create checkout session for credit purchase
export async function createCreditsCheckout(
  customerId: string,
  priceId: string,
  credits: number,
  successUrl: string,
  cancelUrl: string,
  userId: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'credits',
      credits: credits.toString(),
      userId: userId,
    },
  });
  return session;
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

// Construct webhook event
export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }
  
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Get customer by user ID
export async function getCustomerByUserId(userId: string) {
  const customers = await stripe.customers.search({
    query: `metadata['userId']:'${userId}'`,
    limit: 1,
  });
  
  return customers.data[0] || null;
}