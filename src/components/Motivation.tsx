import React, { useState } from 'react';
import { Heart, Quote, Music, Star, Plus, X, Sparkles, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { useSupabaseMedia } from '../hooks/useSupabaseMedia';

const motivationalQuotes = [
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
  },
  {
    text: "It's not about perfect. It's about effort.",
    author: "Jillian Michaels"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  }
];

interface MediaItem {
  id: string;
  title: string;
  type: 'music' | 'video';
  url: string;
  thumbnail?: string;
  duration?: string;
  artist?: string;
}

interface MotivationProps {
  isDarkMode?: boolean;
}

export function Motivation({ isDarkMode = true }: MotivationProps) {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [activeTab, setActiveTab] = useState<'quotes' | 'media'>('quotes');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [newMediaForm, setNewMediaForm] = useState({
    title: '',
    url: '',
    type: 'music' as 'music' | 'video',
    artist: ''
  });
  const [isGeneratingQuotes, setIsGeneratingQuotes] = useState(false);
  const [generatedQuotes, setGeneratedQuotes] = useState<Array<{text: string; author: string}>>([]);

  const { generateTasks, isLoading, checkApiKeyAvailable } = useAI();
  const { customMusic, customVideos, aiQuotes, addCustomMedia, removeCustomMedia, addAIQuotes, updateCustomMedia } = useSupabaseMedia();

  const nextQuote = () => {
    const allQuotes = [...motivationalQuotes, ...aiQuotes];
    setCurrentQuote((prev) => (prev + 1) % allQuotes.length);
  };

  const generateAIQuotes = async () => {
    setIsGeneratingQuotes(true);
    setGeneratedQuotes([]);
    
    try {
      const apiKeyAvailable = await checkApiKeyAvailable();
      if (!apiKeyAvailable) {
        alert('AI quote generation is not available. Please contact the administrator to configure the API key.');
        return;
      }

      console.log('🤖 Generating AI quotes...');
      const result = await generateTasks("Generate 5 inspirational and motivational quotes for productivity and success. Format each quote exactly like this:\n\n\"Quote text here\" - Author Name\n\"Another quote here\" - Another Author\n\nMake sure each quote is on its own line and follows this exact format with quotes around the text and a dash before the author name.");
      
      if (result.error) {
        console.error('❌ AI quote generation error:', result.error);
        alert(result.error);
      } else if (result.tasks && result.tasks[0]) {
        console.log('✅ AI quotes generated:', result.tasks[0]);
        const quotesText = result.tasks[0];
        
        // Parse the quotes more carefully
        const lines = quotesText.split('\n').filter(line => line.trim());
        const quotes: Array<{text: string; author: string}> = [];
        
        for (const line of lines) {
          // Look for patterns like "Quote text" - Author or "Quote text" — Author
          const match = line.match(/[""]([^"""]+)[""][\s]*[-—][\s]*(.+)/);
          if (match) {
            const text = match[1].trim();
            const author = match[2].trim();
            if (text && author) {
              quotes.push({ text, author });
            }
          } else {
            // Fallback: try to split on dash
            const dashIndex = line.lastIndexOf(' - ');
            if (dashIndex > 0) {
              const text = line.substring(0, dashIndex).replace(/^[""]|[""]$/g, '').trim();
              const author = line.substring(dashIndex + 3).trim();
              if (text && author) {
                quotes.push({ text, author });
              }
            }
          }
        }
        
        console.log('📝 Parsed quotes:', quotes);
        
        if (quotes.length > 0) {
          setGeneratedQuotes(quotes);
          addAIQuotes(quotes);
        } else {
          console.warn('⚠️ No quotes could be parsed from AI response');
          alert('Generated quotes but could not parse them properly. Please try again.');
        }
      } else {
        console.warn('⚠️ No AI response received');
        alert('No quotes were generated. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error generating AI quotes:', error);
      alert('Failed to generate quotes. Please try again.');
    } finally {
      setIsGeneratingQuotes(false);
    }
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0`;
    }
    return url;
  };

  const handleAddMedia = () => {
    if (!newMediaForm.title || !newMediaForm.url) return;

    // Validate YouTube URL
    if (!getYouTubeVideoId(newMediaForm.url)) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    if (editingMedia) {
      // Update existing media
      updateCustomMedia(editingMedia.id, {
        title: newMediaForm.title,
        url: newMediaForm.url,
        type: newMediaForm.type,
        artist: newMediaForm.artist || undefined
      });
    } else {
      // Add new media
      addCustomMedia({
        title: newMediaForm.title,
        url: newMediaForm.url,
        type: newMediaForm.type,
        artist: newMediaForm.artist || undefined
      });
    }

    setNewMediaForm({ title: '', url: '', type: 'music', artist: '' });
    setShowAddForm(false);
    setEditingMedia(null);
  };

  const handleEditMedia = (media: MediaItem) => {
    setEditingMedia(media);
    setNewMediaForm({
      title: media.title,
      url: media.url,
      type: media.type,
      artist: media.artist || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteMedia = (mediaId: string, type: 'music' | 'video') => {
    if (confirm('Are you sure you want to delete this media item?')) {
      removeCustomMedia(mediaId, type);
    }
  };

  // Only show custom media, no default examples
  const allMedia = [...customMusic, ...customVideos];
  const allQuotes = [...motivationalQuotes, ...aiQuotes];

  const containerClasses = isDarkMode
    ? 'h-full bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 flex flex-col'
    : 'h-full bg-gradient-to-br from-purple-100 via-gray-50 to-blue-100 flex flex-col';

  const headerClasses = isDarkMode
    ? 'h-12 bg-black/20 backdrop-blur-sm border-b border-gray-700 flex items-center px-4'
    : 'h-12 bg-white/20 backdrop-blur-sm border-b border-gray-300 flex items-center px-4';

  const navClasses = isDarkMode
    ? 'border-b border-gray-700/50 px-4 py-3'
    : 'border-b border-gray-300/50 px-4 py-3';

  const modalClasses = isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-300';

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={headerClasses}>
        <Heart className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} />
        <span className="text-sm font-medium">Motivation Center</span>
      </div>

      {/* Navigation */}
      <div className={navClasses}>
        <nav className="flex space-x-3 md:space-x-6 overflow-x-auto">
          {[
            { id: 'quotes', label: 'Quotes', icon: Quote },
            { id: 'media', label: 'Media', icon: Music }
          ].map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const buttonClasses = isDarkMode
              ? `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-white/10 text-white backdrop-blur'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              : `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-white/50 text-gray-900 backdrop-blur'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/20'
                }`;

            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={buttonClasses}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {activeTab === 'quotes' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h2 className={`text-xl md:text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Daily Inspiration
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Fuel your productivity with powerful words ({allQuotes.length} quotes available)
              </p>
            </div>

            <div className={`rounded-xl p-6 md:p-8 mb-6 border ${
              isDarkMode 
                ? 'bg-white/5 backdrop-blur-sm border-white/10' 
                : 'bg-white/50 backdrop-blur-sm border-white/20'
            }`}>
              <Quote className={`w-6 md:w-8 h-6 md:h-8 mb-4 mx-auto ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <blockquote className={`text-lg md:text-xl font-medium text-center mb-4 leading-relaxed ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                "{allQuotes[currentQuote]?.text}"
              </blockquote>
              <cite className={`block text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                — {allQuotes[currentQuote]?.author}
              </cite>
            </div>

            <div className="text-center space-y-4">
              <button
                onClick={nextQuote}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                Next Quote
              </button>
              
              <div>
                <button
                  onClick={generateAIQuotes}
                  disabled={isLoading || isGeneratingQuotes}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isLoading || isGeneratingQuotes ? 'Generating...' : 'Generate AI Quotes'}</span>
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Generate personalized motivational quotes using AI
                </p>

                {/* Display Generated Quotes */}
                {generatedQuotes.length > 0 && (
                  <div className={`mt-6 p-4 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-green-900/20 border-green-700/30' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <h4 className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                        Generated {generatedQuotes.length} New Quotes!
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {generatedQuotes.map((quote, index) => (
                        <div key={index} className={`p-3 rounded border ${
                          isDarkMode 
                            ? 'bg-gray-800/50 border-gray-600' 
                            : 'bg-white border-gray-200'
                        }`}>
                          <p className={`text-sm italic ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            "{quote.text}"
                          </p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            — {quote.author}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className={`text-xs mt-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      These quotes have been added to your collection and will appear in the rotation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <h2 className={`text-xl md:text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Focus & Motivation Media
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your personal collection of YouTube music and videos
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto md:mx-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add YouTube Media</span>
              </button>
            </div>

            {allMedia.length > 0 ? (
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {allMedia.map((item) => (
                  <div
                    key={item.id}
                    className={`group rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10' 
                        : 'bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70'
                    }`}
                  >
                    <div
                      className="w-full h-32 md:h-40 bg-cover bg-center relative bg-gradient-to-br from-purple-600 to-blue-600"
                      onClick={() => setSelectedMedia(item)}
                    >
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {item.type === 'music' ? (
                          <Music className="w-8 md:w-12 h-8 md:h-12 text-white" />
                        ) : (
                          <div className="w-8 md:w-12 h-8 md:h-12 text-white flex items-center justify-center">
                            ▶
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {item.type === 'music' ? 'Music' : 'Video'}
                      </div>
                      
                      {/* Edit/Delete buttons */}
                      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMedia(item);
                          }}
                          className="p-1 bg-blue-600 hover:bg-blue-700 rounded-full text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedia(item.id, item.type);
                          }}
                          className="p-1 bg-red-600 hover:bg-red-700 rounded-full text-white"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className={`font-medium mb-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.artist || 'No artist'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  No media added yet
                </h3>
                <p className="text-sm mb-4">
                  Add your favorite YouTube music and videos to create your personal motivation collection
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                >
                  Add Your First Media
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Media Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-6 w-full max-w-md border ${modalClasses}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {editingMedia ? 'Edit YouTube Media' : 'Add YouTube Media'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Type</label>
                <select
                  value={newMediaForm.type}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, type: e.target.value as 'music' | 'video' })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="music">Music</option>
                  <option value="video">Video</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Title</label>
                <input
                  type="text"
                  value={newMediaForm.title}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter title..."
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>YouTube URL</label>
                <input
                  type="url"
                  value={newMediaForm.url}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, url: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Paste any YouTube URL (watch, share, or embed format)
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {newMediaForm.type === 'music' ? 'Artist' : 'Creator'}
                </label>
                <input
                  type="text"
                  value={newMediaForm.artist}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, artist: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Optional..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddMedia}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                {editingMedia ? 'Update' : 'Add'} {newMediaForm.type === 'music' ? 'Music' : 'Video'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMedia(null);
                  setNewMediaForm({ title: '', url: '', type: 'music', artist: '' });
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Embed Player */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg overflow-hidden w-full max-w-4xl mx-4 border border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedMedia.title}</h3>
                {selectedMedia.artist && (
                  <p className="text-sm text-gray-400">{selectedMedia.artist}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* YouTube Embed */}
            <div className="relative">
              <iframe
                src={getYouTubeEmbedUrl(selectedMedia.url)}
                className="w-full h-96"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedMedia.title}
              />
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-900 text-center">
              <p className="text-sm text-gray-400">
                {selectedMedia.type === 'music' ? '🎵' : '🎬'} {selectedMedia.type === 'music' ? 'Music' : 'Video'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}