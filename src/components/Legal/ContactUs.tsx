import React, { useState } from 'react';
import { X, Mail, Send, MessageCircle, HelpCircle, Bug, Lightbulb } from 'lucide-react';

interface ContactUsProps {
  onClose: () => void;
  isDarkMode?: boolean;
}

export function ContactUs({ onClose, isDarkMode = true }: ContactUsProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });

  const modalClasses = isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-300';

  const inputClasses = isDarkMode
    ? 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const textClasses = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedTextClasses = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const subject = encodeURIComponent(`[${formData.category.toUpperCase()}] ${formData.subject}`);
    const body = encodeURIComponent(`
Name: ${formData.name}
Email: ${formData.email}
Category: ${formData.category}

Message:
${formData.message}
    `);
    
    window.location.href = `mailto:hello@todo.is?subject=${subject}&body=${body}`;
  };

  const categories = [
    { value: 'general', label: 'General Inquiry', icon: MessageCircle },
    { value: 'support', label: 'Technical Support', icon: HelpCircle },
    { value: 'bug', label: 'Bug Report', icon: Bug },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 w-full max-w-2xl mx-4 border ${modalClasses} max-h-[90vh] overflow-auto`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Mail className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Contact Us
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
            <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-600'}`}>
              We'd love to hear from you! Whether you have questions, feedback, or need support, 
              we're here to help. Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>

          {/* Quick Contact Info */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Direct Contact
            </h3>
            <div className="flex items-center space-x-2">
              <Mail className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <a 
                href="mailto:hello@todo.is" 
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                hello@todo.is
              </a>
            </div>
            <p className={`text-xs mt-2 ${mutedTextClasses}`}>
              We typically respond within 24 hours during business days.
            </p>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClasses}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClasses}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = formData.category === category.value;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: category.value })}
                      className={`p-3 rounded-lg border transition-all text-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600/20'
                          : isDarkMode
                          ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${
                        isSelected ? 'text-blue-400' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <span className={`text-xs ${
                        isSelected ? 'text-blue-300' : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {category.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={inputClasses}
                placeholder="Brief description of your inquiry"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`${inputClasses} resize-none`}
                rows={6}
                placeholder="Please provide as much detail as possible..."
                required
              />
            </div>

            <div className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-yellow-900/20 border-yellow-700/30' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <p className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                <strong>Note:</strong> This form will open your default email client. If you prefer, 
                you can also send us an email directly at hello@todo.is
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>

          {/* FAQ Section */}
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Frequently Asked Questions
            </h3>
            <div className="space-y-2">
              <details className={`${mutedTextClasses}`}>
                <summary className="cursor-pointer text-sm font-medium">How do I reset my password?</summary>
                <p className="text-xs mt-1 pl-4">
                  Use the "Forgot Password" link on the sign-in page, or contact us for assistance.
                </p>
              </details>
              <details className={`${mutedTextClasses}`}>
                <summary className="cursor-pointer text-sm font-medium">Can I export my data?</summary>
                <p className="text-xs mt-1 pl-4">
                  Yes! You can export your projects and tasks from the Projects tab using the export button.
                </p>
              </details>
              <details className={`${mutedTextClasses}`}>
                <summary className="cursor-pointer text-sm font-medium">Is my data secure?</summary>
                <p className="text-xs mt-1 pl-4">
                  Absolutely. We use industry-standard encryption and security practices to protect your data.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}