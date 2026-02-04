
import React, { useState } from 'react';
import { Check, Shield, Globe, Zap, Heart, Star, Sparkles, ArrowRight } from 'lucide-react';
import Logo from './Logo';

interface PricingProps {
  onBack: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onBack }) => {
  const [billingCycle, setBillingCycle] = useState<'1' | '12'>('1');

  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Start your discovery journey.',
      icon: <Heart className="text-pink-500" />,
      features: [
        '5 Lifetime searches',
        'Basic AI market analysis',
        'Public discovery feed',
        'Standard response time',
        'Community support'
      ],
      buttonText: 'Current Plan',
      recommended: false,
    },
    {
      name: 'Lite',
      price: billingCycle === '1' ? '9.99' : '7.99',
      description: 'Ideal for serious founders.',
      icon: <Zap className="text-yellow-500" />,
      features: [
        '50 Monthly searches',
        'Full AI Market Thesis',
        'Historical trend charts',
        'Detailed market signals',
        'Email support'
      ],
      buttonText: 'Upgrade to Lite',
      recommended: true,
      badge: 'Most Popular'
    },
    {
      name: 'Pro',
      price: billingCycle === '1' ? '50' : '40',
      description: 'The ultimate research engine.',
      icon: <Star className="text-indigo-500" />,
      features: [
        'Unlimited searches',
        'CSV/PDF Data exports',
        'Early access to niches',
        'Deep competitive dives',
        'Priority AI processing',
        '1-on-1 Strategy session'
      ],
      buttonText: 'Go Pro',
      recommended: false,
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf7] pt-20 pb-32 px-4 font-sans selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-10">
            <Logo size="lg" iconOnly />
          </div>
          <h1 className="text-5xl font-black text-[#1a1a1a] mb-6 tracking-tight">
            An intelligence engine that puts <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              your growth first
            </span>
          </h1>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest mb-12">
            <div className="flex items-center gap-2">
              <Shield size={18} /> AI-Powered
            </div>
            <div className="flex items-center gap-2">
              <Globe size={18} /> Global Data
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} /> Smart Insights
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-gray-100 rounded-2xl mb-4">
            <button 
              onClick={() => setBillingCycle('1')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === '1' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('12')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === '12' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={plan.name}
              className={`relative bg-white rounded-[3.5rem] p-10 flex flex-col transition-all duration-300 ${
                plan.recommended 
                  ? 'ring-4 ring-indigo-500/10 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.1)] scale-105 z-10' 
                  : 'border border-gray-100 shadow-sm hover:shadow-xl'
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-sm font-medium">{plan.description}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                  {plan.icon}
                </div>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-gray-400">US$</span>
                  <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                  {plan.price !== '0' && (
                    <span className="text-gray-400 font-bold">/mo</span>
                  )}
                </div>
                {billingCycle === '12' && plan.price !== '0' && (
                  <p className="text-emerald-500 text-xs font-bold mt-2">Billed annually</p>
                )}
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm font-medium text-gray-600">
                    <div className="mt-0.5 text-emerald-500 bg-emerald-50 p-0.5 rounded-full">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => alert(`Redirecting to payment for ${plan.name} plan... (Coming Soon)`)}
                className={`w-full py-5 rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  plan.recommended 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : plan.name === 'Free'
                      ? 'bg-gray-50 text-gray-400 cursor-default'
                      : 'bg-[#140b20] text-white hover:bg-[#201530]'
                }`}
              >
                {plan.buttonText}
                {plan.name !== 'Free' && <ArrowRight size={20} />}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-20 text-center">
          <p className="text-gray-400 text-sm font-medium">
            Need a custom plan for your agency? 
            <button className="ml-1 text-indigo-600 font-bold hover:underline">Talk to Sales</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
