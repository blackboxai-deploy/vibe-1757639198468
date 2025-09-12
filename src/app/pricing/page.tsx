"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Building, Sparkles } from "lucide-react";
// Pricing configurations moved to component for demo
const PRICING_PLANS = {
  FREE: {
    name: 'Free Demo',
    credits: 10,
    dailyLimit: 10,
    price: 0,
    features: [
      '10 generations (demo)',
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

const CREDIT_PACKAGES = {
  SMALL: {
    credits: 50,
    price: 499, // $4.99
    savings: 0,
  },
  MEDIUM: {
    credits: 150,
    price: 1299, // $12.99 (15% discount)
    savings: 15,
  },
  LARGE: {
    credits: 300,
    price: 2299, // $22.99 (25% discount)
    savings: 25,
  },
  BULK: {
    credits: 1000,
    price: 6999, // $69.99 (30% discount)
    savings: 30,
  },
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'credits'>('monthly');

  const planIcons = {
    FREE: Sparkles,
    STARTER: Zap,
    PRO: Crown,
    ENTERPRISE: Building,
  };

  const handleSubscribe = async (planKey: string) => {
    try {
      // For demo, redirect to sign-up
      window.location.href = '/auth/signin?redirect=pricing&plan=' + planKey;
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const handleBuyCredits = async (packageKey: string) => {
    try {
      // For demo, redirect to sign-up
      window.location.href = '/auth/signin?redirect=pricing&credits=' + packageKey;
    } catch (error) {
      console.error('Credit purchase error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock the full potential of AI image generation with flexible pricing options designed for creators of all levels
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'outline'}
              onClick={() => setBillingCycle('monthly')}
              className="px-8"
            >
              Monthly Plans
            </Button>
            <Button
              variant={billingCycle === 'credits' ? 'default' : 'outline'}
              onClick={() => setBillingCycle('credits')}
              className="px-8"
            >
              Buy Credits
            </Button>
          </div>
        </div>

        {/* Monthly Plans */}
        {billingCycle === 'monthly' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Object.entries(PRICING_PLANS).map(([planKey, plan]) => {
              const IconComponent = planIcons[planKey as keyof typeof planIcons];
              const isPopular = planKey === 'PRO';
              
              return (
                <Card 
                  key={planKey} 
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    isPopular ? 'ring-2 ring-purple-500 shadow-lg' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  
                  <CardHeader className={`text-center space-y-4 ${isPopular ? 'pt-8' : ''}`}>
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-purple-600" />
                    </div>
                    
                    <div className="space-y-2">
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-3xl font-bold">
                          ${plan.price === 0 ? '0' : (plan.price / 100).toFixed(2)}
                        </span>
                        {plan.price > 0 && <span className="text-gray-600">/month</span>}
                      </div>
                      
                      {planKey !== 'FREE' && (
                        <Badge variant="secondary" className="text-xs">
                          {'monthlyCredits' in plan 
                            ? (plan.monthlyCredits === -1 ? 'Unlimited' : `${plan.monthlyCredits} generations`)
                            : `${plan.credits} credits`
                          }
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        isPopular 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                          : ''
                      }`}
                      variant={planKey === 'FREE' ? 'outline' : 'default'}
                      onClick={() => handleSubscribe(planKey)}
                      disabled={planKey === 'FREE'}
                    >
                      {planKey === 'FREE' ? 'Current Plan' : 'Get Started'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Credit Packages */}
        {billingCycle === 'credits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Object.entries(CREDIT_PACKAGES).map(([packageKey, pkg]) => {
              const isPopular = packageKey === 'LARGE';
              
              return (
                <Card 
                  key={packageKey}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    isPopular ? 'ring-2 ring-purple-500 shadow-lg' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-medium">
                      Best Value
                    </div>
                  )}
                  
                  <CardHeader className={`text-center space-y-4 ${isPopular ? 'pt-8' : ''}`}>
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div className="space-y-2">
                      <CardTitle className="text-2xl font-bold">
                        {pkg.credits} Credits
                      </CardTitle>
                      <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-3xl font-bold">
                          ${(pkg.price / 100).toFixed(2)}
                        </span>
                      </div>
                      
                      {pkg.savings > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Save {pkg.savings}%
                        </Badge>
                      )}
                      
                      <p className="text-sm text-gray-500">
                        ${((pkg.price / 100) / pkg.credits).toFixed(3)} per credit
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Perfect for {pkg.credits} high-quality AI-generated images
                      </p>
                      
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center justify-center space-x-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Never expires</span>
                        </li>
                        <li className="flex items-center justify-center space-x-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>HD quality</span>
                        </li>
                        <li className="flex items-center justify-center space-x-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Commercial license</span>
                        </li>
                      </ul>
                    </div>

                    <Button
                      className={`w-full ${
                        isPopular 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                          : ''
                      }`}
                      onClick={() => handleBuyCredits(packageKey)}
                    >
                      Purchase Credits
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Frequently Asked Questions
          </h2>
          
          <div className="grid gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">What happens to unused credits?</h3>
                <p className="text-gray-600">
                  Credits purchased as one-time packages never expire. Monthly subscription credits reset each billing cycle.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your subscription at any time. Changes take effect at your next billing cycle.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Do you offer refunds?</h3>
                <p className="text-gray-600">
                  We offer a 30-day money-back guarantee on all subscriptions. Credit packages are non-refundable once purchased.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">What image formats are supported?</h3>
                <p className="text-gray-600">
                  We generate high-quality PNG and JPEG images. All plans include commercial usage rights for generated images.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Amazing Art?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of creators using AI to bring their imagination to life
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            Start Creating Now
          </Button>
        </div>
      </div>
    </div>
  );
}