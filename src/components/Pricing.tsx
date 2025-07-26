import React from 'react';
import { CheckCircle2, Star, Zap, Crown, Heart, Sparkles } from 'lucide-react';

interface PricingProps {
  isDarkMode?: boolean;
}

export function Pricing({ isDarkMode = true }: PricingProps) {
  const containerClasses = isDarkMode
    ? 'h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col'
    : 'h-full bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex flex-col';

  const headerClasses = isDarkMode
    ? 'h-12 bg-black/20 backdrop-blur-sm border-b border-gray-700 flex items-center px-4'
    : 'h-12 bg-white/20 backdrop-blur-sm border-b border-gray-300 flex items-center px-4';

  const cardClasses = isDarkMode
    ? 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8'
    : 'bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-8 shadow-lg';

  const betaCardClasses = isDarkMode
    ? 'bg-gradient-to-br from-green-900/30 to-blue-900/30 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8'
    : 'bg-gradient-to-br from-green-50 to-blue-50 backdrop-blur-sm border border-green-200 rounded-2xl p-8 shadow-lg';

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={headerClasses}>
        <Crown className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
        <span className="text-sm font-medium">Pricing</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Pricing Plans
              </h1>
            </div>
            <p className={`text-xl mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose the perfect plan for your productivity journey
            </p>
            
            {/* Beta Notice */}
            <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full ${
              isDarkMode 
                ? 'bg-green-900/30 border border-green-500/30 text-green-300' 
                : 'bg-green-100 border border-green-300 text-green-700'
            }`}>
              <Star className="w-5 h-5" />
              <span className="font-medium">Currently in Beta - Free Access for Everyone!</span>
            </div>
          </div>

          {/* Beta Card */}
          <div className="mb-12">
            <div className={betaCardClasses}>
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Heart className={`w-12 h-12 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Beta Access
                </h2>
                <div className="mb-6">
                  <span className={`text-5xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    FREE
                  </span>
                  <span className={`text-xl ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    during beta
                  </span>
                </div>
                <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  We're currently in beta phase! Enjoy full access to all features while we perfect the experience. 
                  Your feedback helps us build the best productivity platform possible.
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {[
                    'Unlimited Projects & Tasks',
                    'AI-Powered Task Generation',
                    'Pomodoro Timer & Analytics',
                    'Calendar Integration',
                    'Project Sharing',
                    'Cross-Device Sync',
                    'Motivation Center',
                    'Export & Backup',
                    'Priority Support',
                    'Early Access to New Features'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105">
                  Get Started Free
                </button>
              </div>
            </div>
          </div>

          {/* Future Plans Preview */}
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Coming Soon: Flexible Plans for Everyone
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              We're designing pricing plans that work for individuals, teams, and enterprises
            </p>
          </div>

          {/* Future Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className={cardClasses}>
              <div className="text-center">
                <Zap className={`w-10 h-10 mx-auto mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Starter
                </h3>
                <div className="mb-4">
                  <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    $9
                  </span>
                  <span className={`text-gray-500 ml-1`}>/month</span>
                </div>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Perfect for individuals getting started with productivity
                </p>
                
                <div className="space-y-3 mb-6">
                  {[
                    'Up to 10 Projects',
                    'Basic AI Features',
                    'Standard Support',
                    'Mobile & Web Access'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle2 className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button className={`w-full py-2 px-4 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-400 hover:border-gray-500' 
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className={`${cardClasses} relative`}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <Crown className={`w-10 h-10 mx-auto mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Pro
                </h3>
                <div className="mb-4">
                  <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    $19
                  </span>
                  <span className={`text-gray-500 ml-1`}>/month</span>
                </div>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Advanced features for power users and small teams
                </p>
                
                <div className="space-y-3 mb-6">
                  {[
                    'Unlimited Projects',
                    'Advanced AI Features',
                    'Team Collaboration',
                    'Priority Support',
                    'Advanced Analytics',
                    'Custom Integrations'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle2 className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button className={`w-full py-2 px-4 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-400 hover:border-gray-500' 
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className={cardClasses}>
              <div className="text-center">
                <Star className={`w-10 h-10 mx-auto mb-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Enterprise
                </h3>
                <div className="mb-4">
                  <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Custom
                  </span>
                </div>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tailored solutions for large organizations
                </p>
                
                <div className="space-y-3 mb-6">
                  {[
                    'Custom Deployment',
                    'Advanced Security',
                    'Dedicated Support',
                    'Custom Features',
                    'SLA Guarantee',
                    'Training & Onboarding'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle2 className={`w-4 h-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button className={`w-full py-2 px-4 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-400 hover:border-gray-500' 
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>
                  Contact Sales
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className={`text-2xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  How long will the beta be free?
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  We'll provide at least 30 days notice before transitioning to paid plans. Beta users will receive special early-bird pricing.
                </p>
              </div>
              <div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Will my data be preserved?
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Absolutely! All your projects, tasks, and settings will be preserved when we transition to the full release.
                </p>
              </div>
              <div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Can I provide feedback?
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Yes! We actively encourage feedback. Use the contact form or reach out directly - your input shapes our development.
                </p>
              </div>
              <div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  What happens after beta?
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Beta users will have the option to continue with a free tier or upgrade to premium plans with additional features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}