import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AIResponse {
  tasks: string[];
  error?: string;
}

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);

  const getAdminApiKey = async (): Promise<string | null> => {
    try {
      console.log('🔍 Checking for admin API key...');
      
      // First try to get from environment variables (.env file)
      const envApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (envApiKey && envApiKey.trim() && envApiKey.length > 10 && envApiKey !== 'your_openrouter_api_key_here') {
        console.log('✅ Using API key from environment variables');
        return envApiKey;
      }
      
      // Then try to get API key from admin settings using service role
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('openrouter_api_key')
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('❌ Error fetching admin API key from database:', error);
        } else if (data?.openrouter_api_key && data.openrouter_api_key.trim() && data.openrouter_api_key.length > 10) {
          console.log('✅ Admin API key found in database');
          return data.openrouter_api_key;
        }
      } catch (dbError) {
        console.error('❌ Database error when fetching API key:', dbError);
      }

      console.log('ℹ️ No valid API key found in environment or admin settings');
      return null;
    } catch (error) {
      console.error('❌ Error fetching admin API key:', error);
      return null;
    }
  };

  const generateTasks = async (prompt: string): Promise<AIResponse> => {
    setIsLoading(true);
    
    try {
      console.log('🤖 Starting AI task generation...');
      const apiKey = await getAdminApiKey();
      
      if (!apiKey) {
        console.log('❌ No API key available');
        return { 
          tasks: [], 
          error: 'AI task generation is not available. Please add your OpenRouter API key to the .env file (VITE_OPENROUTER_API_KEY=your_key_here) or configure it in admin settings.' 
        };
      }

      console.log('🚀 Making request to OpenRouter API...');
      
      // Use deepseek/deepseek-chat as specified
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Todo.is - AI Task Generator',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat', // Updated to use the correct model
          messages: [
            {
              role: 'system',
              content: `You are a productivity assistant that creates detailed, actionable task lists. Follow these formatting rules:

1. Start with a relevant headline using # (e.g., "# Project Planning Tasks")
2. Create main tasks using "- " prefix
3. Add sub-tasks using "-- " prefix (double dash)
4. Use checkboxes "- [ ]" for trackable items
5. Add priorities: 🔥 High, ⚡ Medium, 📝 Low
6. Include schedules using @YYYY-MM-DD format when relevant
7. Add descriptions for complex tasks using "Description: ..." on the next line
8. Group related tasks under ## subheadings when appropriate

Example format:
# Project Setup Tasks

## Planning Phase
- [ ] Define project scope 🔥 High @2024-01-15
  Description: Clearly outline what the project will and won't include
  -- Research similar projects
  -- Identify key stakeholders
  -- Set initial timeline
- [ ] Create project roadmap ⚡ Medium
  -- Break down into phases
  -- Set milestones
  -- Assign responsibilities

## Development Phase
- Set up development environment 📝 Low
  Description: Configure all necessary tools and dependencies
  -- Install required software
  -- Set up version control
  -- Configure IDE

Keep tasks specific, actionable, and well-organized. Limit to 8-12 main tasks maximum.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter API error:', response.status, errorText);
        
        // Provide more specific error messages
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenRouter API key configuration.');
        } else if (response.status === 404) {
          throw new Error('Model not available. Please try again or contact support.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        } else if (response.status >= 500) {
          throw new Error('OpenRouter service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ AI response received');
      
      const content = data.choices?.[0]?.message?.content || '';
      
      if (!content.trim()) {
        throw new Error('Empty response from AI service');
      }
      
      // Return the full formatted content as a single string
      return { tasks: [content.trim()] };
    } catch (error) {
      console.error('❌ AI generation error:', error);
      
      // Provide helpful error messages
      let errorMessage = 'Failed to generate tasks. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('API key')) {
          errorMessage = 'Invalid API key. Please check your OpenRouter API key configuration.';
        } else if (error.message.includes('Rate limit')) {
          errorMessage = 'Too many requests. Please wait a few minutes and try again.';
        } else if (error.message.includes('Model not available')) {
          errorMessage = 'AI model temporarily unavailable. Please try again in a moment.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        tasks: [], 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const checkApiKeyAvailable = async (): Promise<boolean> => {
    try {
      const apiKey = await getAdminApiKey();
      const isAvailable = !!apiKey;
      console.log('🔑 API key available:', isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('❌ Error checking API key availability:', error);
      return false;
    }
  };

  return {
    generateTasks,
    isLoading,
    checkApiKeyAvailable,
    hasApiKey: true, // Always show as available, will check when generating
  };
}