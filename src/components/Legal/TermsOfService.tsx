import React from 'react';
import { X, FileText, AlertTriangle, CheckCircle, XCircle, Scale } from 'lucide-react';

interface TermsOfServiceProps {
  onClose: () => void;
  isDarkMode?: boolean;
}

export function TermsOfService({ onClose, isDarkMode = true }: TermsOfServiceProps) {
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
            <FileText className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Terms of Service
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
              Welcome to Todo.is! These terms govern your use of our productivity platform. By using our service, you agree to these terms.
            </p>
          </div>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Acceptance of Terms
              </h3>
            </div>
            <p className={`text-sm ${mutedTextClasses}`}>
              By accessing and using Todo.is, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Service Description
              </h3>
            </div>
            <p className={`text-sm ${mutedTextClasses} mb-3`}>
              Todo.is is a productivity platform that provides:
            </p>
            <ul className={`list-disc list-inside space-y-1 text-sm ${mutedTextClasses}`}>
              <li>Task and project management tools</li>
              <li>AI-powered task generation</li>
              <li>Pomodoro timer and productivity tracking</li>
              <li>Calendar integration and scheduling</li>
              <li>Cross-device synchronization</li>
              <li>Project sharing and collaboration features</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <Scale className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                User Responsibilities
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Account Security
                </h4>
                <ul className={`list-disc list-inside space-y-1 text-sm ${mutedTextClasses}`}>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Use strong, unique passwords</li>
                  <li>Log out from shared or public devices</li>
                </ul>
              </div>
              <div>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Acceptable Use
                </h4>
                <ul className={`list-disc list-inside space-y-1 text-sm ${mutedTextClasses}`}>
                  <li>Use the service for lawful purposes only</li>
                  <li>Respect intellectual property rights</li>
                  <li>Do not attempt to disrupt or harm the service</li>
                  <li>Do not share inappropriate or harmful content</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <XCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Prohibited Activities
              </h3>
            </div>
            <p className={`text-sm ${mutedTextClasses} mb-3`}>
              You may not use Todo.is to:
            </p>
            <ul className={`list-disc list-inside space-y-1 text-sm ${mutedTextClasses}`}>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malicious code or viruses</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for spam or unsolicited communications</li>
              <li>Reverse engineer or attempt to extract source code</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Intellectual Property
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Content
                </h4>
                <p className={`text-sm ${mutedTextClasses}`}>
                  You retain ownership of all content you create using Todo.is. By using our service, you grant us a limited license to store, process, and display your content solely for the purpose of providing the service.
                </p>
              </div>
              <div>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Our Service
                </h4>
                <p className={`text-sm ${mutedTextClasses}`}>
                  Todo.is and all related trademarks, logos, and intellectual property are owned by us. You may not use our intellectual property without explicit permission.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Disclaimers and Limitations
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Service Availability
                </h4>
                <p className={`text-sm ${mutedTextClasses}`}>
                  We strive to maintain high availability but cannot guarantee uninterrupted service. We may perform maintenance, updates, or experience technical issues that temporarily affect service availability.
                </p>
              </div>
              <div>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Limitation of Liability
                </h4>
                <p className={`text-sm ${mutedTextClasses}`}>
                  Todo.is is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <Scale className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Termination
              </h3>
            </div>
            <p className={`text-sm ${mutedTextClasses}`}>
              You may terminate your account at any time by contacting us. We may terminate or suspend your account if you violate these terms. 
              Upon termination, your access to the service will cease, and we may delete your data according to our data retention policy.
            </p>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Changes to Terms
              </h3>
            </div>
            <p className={`text-sm ${mutedTextClasses}`}>
              We may update these terms from time to time. We will notify you of significant changes via email or through the application. 
              Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-3">
              <Scale className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Contact Information
              </h3>
            </div>
            <p className={`text-sm ${mutedTextClasses}`}>
              If you have questions about these Terms of Service, please contact us:
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
            isDarkMode ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200'
          }`}>
            <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
              <strong>Thank you</strong> for using Todo.is! We're committed to providing you with the best productivity experience while respecting your rights and privacy.
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