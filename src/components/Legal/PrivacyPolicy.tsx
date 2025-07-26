import React from 'react';
import { X, Shield, Eye, Lock, Database, Mail } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
  isDarkMode?: boolean;
}

export function PrivacyPolicy({ onClose, isDarkMode = true }: PrivacyPolicyProps) {
  const modalClasses = isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-300';

  const textClasses = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedTextClasses = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 w-full max-w-4xl mx-4 border ${modalClasses} max-h-[90vh] overflow-auto`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Privacy Policy
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`space-y-6 ${textClasses}`}>
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-blue-900/20 border-blue-700/30' : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-600'}`}>
              At Todo.is, we take your privacy seriously. This policy explains how we collect, use, and protect your information.
            </p>
          </div>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <Database className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Information We Collect
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Account Information
                </h4>
                <ul className={`list-disc list-inside space-y-1 text-sm ${mutedTextClasses}`}>
                  <li>Email address (for account creation and authentication)</li>
                  <li>Full name (for personalization)</li>
                  <li>Profile information you choose to provide</li>
                </ul>
              </div>
              <div>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Usage Data
                </h4>
                <ul className={`list-disc list-inside space-y-1 text-sm ${mutedTextClasses}`}>
                  <li>Tasks, projects, and notes you create</li>
                  <li>Timer sessions and productivity analytics</li>
                  <li>Calendar events and schedules</li>
                  <li>Application usage patterns and preferences</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <Eye className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                How We Use Your Information
              </h3>
            </div>
            <ul className={`list-disc list-inside space-y-2 text-sm ${mutedTextClasses}`}>
              <li>Provide and maintain the Todo.is service</li>
              <li>Sync your data across devices</li>
              <li>Generate AI-powered task suggestions (when enabled)</li>
              <li>Analyze usage patterns to improve our service</li>
              <li>Send important service updates and notifications</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <Lock className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Data Security
              </h3>
            </div>
            <div className="space-y-3">
              <p className={`text-sm ${mutedTextClasses}`}>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className={`list-disc list-inside space-y-1 text-sm ${mutedTextClasses}`}>
                <li>All data is encrypted in transit and at rest</li>
                <li>Secure authentication using Supabase Auth</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and monitoring</li>
                <li>Data backups and recovery procedures</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <Shield className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Your Rights
              </h3>
            </div>
            <ul className={`list-disc list-inside space-y-2 text-sm ${mutedTextClasses}`}>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a standard format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <Database className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Data Sharing
              </h3>
            </div>
            <p className={`text-sm ${mutedTextClasses} mb-3`}>
              We do not sell, trade, or rent your personal information. We may share data only in these limited circumstances:
            </p>
            <ul className={`list-disc list-inside space-y-1 text-sm ${mutedTextClasses}`}>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>With trusted service providers (under strict agreements)</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <Mail className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Contact Us
              </h3>
            </div>
            <p className={`text-sm ${mutedTextClasses}`}>
              If you have questions about this Privacy Policy or want to exercise your rights, contact us at:
            </p>
            <div className={`mt-2 p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Email: <a href="mailto:hello@todo.is" className="text-blue-400 hover:text-blue-300">hello@todo.is</a>
              </p>
            </div>
          </section>

          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-yellow-900/20 border-yellow-700/30' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
              <strong>Note:</strong> This privacy policy may be updated from time to time. We will notify you of any significant changes via email or through the application.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}