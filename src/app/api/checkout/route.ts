import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { stripe, createStripeCustomer, createSubscriptionCheckout, createCreditsCheckout, PRICING_PLANS, CREDIT_PACKAGES } from '@/lib/stripe';
import { UserService } from '@/lib/user-service';

export async function POST(request: NextRequest) {
  try {
    const { type, planKey, userId } = await request.json();

    if (!type || !planKey || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await UserService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let customerId = user.customer_id;
    if (!customerId) {
      const customer = await createStripeCustomer(
        user.email,
        user.name || undefined,
        user.id
      );
      customerId = customer.id;
      
      // Update user with customer ID
      await UserService.updateUser(user.id, { customer_id: customerId });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard?success=true`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;

    let session;

    if (type === 'subscription') {
      const plan = PRICING_PLANS[planKey as keyof typeof PRICING_PLANS];
      if (!plan || !('priceId' in plan)) {
        return NextResponse.json(
          { error: 'Invalid plan' },
          { status: 400 }
        );
      }

      session = await createSubscriptionCheckout(
        customerId,
        plan.priceId,
        successUrl,
        cancelUrl,
        userId
      );
    } else if (type === 'credits') {
      const creditPackage = CREDIT_PACKAGES[planKey as keyof typeof CREDIT_PACKAGES];
      if (!creditPackage) {
        return NextResponse.json(
          { error: 'Invalid credit package' },
          { status: 400 }
        );
      }

      session = await createCreditsCheckout(
        customerId,
        creditPackage.priceId,
        creditPackage.credits,
        successUrl,
        cancelUrl,
        userId
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid checkout type' },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}