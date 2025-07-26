import React, { useState } from 'react';
import { X, Copy, Share2, MessageCircle, Mail, Facebook, Twitter, CheckCircle } from 'lucide-react';

interface ProjectShareModalProps {
  projectName: string;
  shareUrl: string;
  onClose: () => void;
  isDarkMode?: boolean;
}

export function ProjectShareModal({ projectName, shareUrl, onClose, isDarkMode = true }: ProjectShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (execError) {
        console.error('Copy failed:', execError);
        alert('Failed to copy. Please copy the URL manually.');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`Check out my project "${projectName}" on Todo.is: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`Check out my project "${projectName}" on Todo.is`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out my project: ${projectName}`);
    const body = encodeURIComponent(`I wanted to share my project "${projectName}" with you.\n\nYou can view it here: ${shareUrl}\n\nCreated with Todo.is - Your Productivity Command Center`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const modalClasses = isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-300';

  const inputClasses = isDarkMode
    ? 'flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'flex-1 px-3 py-2 bg-white border border-gray-300 rounded-l-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 w-full max-w-md mx-4 border ${modalClasses}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Share2 className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Share Project
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Project Info */}
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {projectName}
            </p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Anyone with this link can view your project
            </p>
          </div>

          {/* Copy Link */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Share Link
            </label>
            <div className="flex">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className={inputClasses}
              />
              <button
                onClick={handleCopy}
                className={`px-3 py-2 rounded-r-lg border border-l-0 transition-colors ${
                  copied
                    ? 'bg-green-600 border-green-600 text-white'
                    : isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 border-gray-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 border-gray-300 text-white'
                }`}
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-xs mt-1">Link copied to clipboard!</p>
            )}
          </div>

          {/* Social Sharing */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Share via
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareToWhatsApp}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">WhatsApp</span>
              </button>

              <button
                onClick={shareViaEmail}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Mail className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Email</span>
              </button>

              <button
                onClick={shareToFacebook}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Facebook</span>
              </button>

              <button
                onClick={shareToTwitter}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Twitter className="w-4 h-4 text-sky-500" />
                <span className="text-sm">Twitter</span>
              </button>
            </div>
          </div>

          {/* Native Share (if available) */}
          {navigator.share && (
            <button
              onClick={() => {
                navigator.share({
                  title: `Project: ${projectName}`,
                  text: `Check out my project "${projectName}" on Todo.is!`,
                  url: shareUrl
                }).catch(console.error);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via System</span>
            </button>
          )}
        </div>

        <div className={`mt-6 p-3 rounded-lg border ${
          isDarkMode ? 'bg-blue-900/20 border-blue-700/30' : 'bg-blue-50 border-blue-200'
        }`}>
          <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            <strong>Note:</strong> Shared projects are read-only. Viewers can see your tasks and content but cannot make changes.
          </p>
        </div>
      </div>
    </div>
  );
}