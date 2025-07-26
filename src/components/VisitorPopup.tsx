import React from 'react';
import { X, UserPlus, LogIn, CheckSquare2 } from 'lucide-react';

interface VisitorPopupProps {
  onClose: () => void;
  onAuthRequired: (action: 'signin' | 'signup') => void;
  isDarkMode?: boolean;
}

export function VisitorPopup({ onClose, onAuthRequired, isDarkMode = true }: VisitorPopupProps) {
  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-4xl mx-4 animate-slideInUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <CheckSquare2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Welcome to Todo.is
              </h2>
              <p className="text-sm text-gray-400">
                Your Productivity Command Center
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-gray-700 text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video */}
        <div className="mb-8">
          <div className="relative">
            <iframe
              src={getYouTubeEmbedUrl('https://youtu.be/HtjztJtPtwY')}
              className="w-full h-80 rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Todo.is Demo Video"
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to boost your productivity?
          </h3>
          <p className="text-lg text-gray-300 mb-6">
            Join thousands of users who have transformed their workflow with Todo.is
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => {
              onAuthRequired('signup');
              onClose();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Start Free</span>
          </button>
          
          <button
            onClick={() => {
              onAuthRequired('signin');
              onClose();
            }}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            No credit card required • Free during beta • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}