import React from 'react';
import { X, CheckSquare, Calendar, Clock, Flame, Image, Link } from 'lucide-react';

interface TaskGuideProps {
  onClose: () => void;
}

export function TaskGuide({ onClose }: TaskGuideProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 border border-gray-700 max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Task Writing Guide</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-gray-300">
          {/* Basic Tasks */}
          <section>
            <h4 className="text-lg font-medium text-white mb-3 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-blue-400" />
              Basic Tasks
            </h4>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-900 p-3 rounded font-mono">
                <div>- Complete project proposal</div>
                <div>-- Research competitors</div>
                <div>-- Write executive summary</div>
                <div>- [ ] Review budget</div>
                <div>- [x] Send emails</div>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Use <code>-</code> for regular tasks</li>
                <li>Use <code>--</code> for subtasks (indented)</li>
                <li>Use <code>- [ ]</code> for checkbox tasks</li>
                <li>Use <code>- [x]</code> for completed tasks</li>
              </ul>
            </div>
          </section>

          {/* Scheduling */}
          <section>
            <h4 className="text-lg font-medium text-white mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-400" />
              Scheduling
            </h4>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-900 p-3 rounded font-mono">
                <div>- Team meeting @2024-01-15 14:00</div>
                <div>- Submit report @2024-01-16</div>
                <div>- Call client @today 15:30</div>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Use <code>@YYYY-MM-DD HH:MM</code> for specific date and time</li>
                <li>Use <code>@YYYY-MM-DD</code> for date only</li>
                <li>Use <code>@today</code>, <code>@tomorrow</code> for relative dates</li>
              </ul>
            </div>
          </section>

          {/* Priorities */}
          <section>
            <h4 className="text-lg font-medium text-white mb-3 flex items-center">
              <Flame className="w-5 h-5 mr-2 text-red-400" />
              Priorities
            </h4>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-900 p-3 rounded font-mono">
                <div>- Fix critical bug 🔥 High</div>
                <div>- Update documentation ⚡ Medium</div>
                <div>- Organize desk 📝 Low</div>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>🔥 High priority (urgent/important)</li>
                <li>⚡ Medium priority (important)</li>
                <li>📝 Low priority (nice to have)</li>
              </ul>
            </div>
          </section>

          {/* Headers and Organization */}
          <section>
            <h4 className="text-lg font-medium text-white mb-3">Headers & Organization</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-900 p-3 rounded font-mono">
                <div># Today's Goals</div>
                <div>## Work Tasks</div>
                <div>### Project Alpha</div>
                <div>- Complete feature X</div>
                <div></div>
                <div>## Personal</div>
                <div>- Exercise for 30 minutes</div>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Use <code>#</code> for main headers</li>
                <li>Use <code>##</code> for sub-headers</li>
                <li>Use <code>###</code> for sub-sub-headers</li>
              </ul>
            </div>
          </section>

          {/* Advanced Features */}
          <section>
            <h4 className="text-lg font-medium text-white mb-3">Advanced Features</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-900 p-3 rounded font-mono">
                <div>- Review presentation</div>
                <div>  Description: Final review before client meeting</div>
                <div>  Image: /path/to/screenshot.png</div>
                <div>  Link: https://docs.google.com/presentation</div>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Add descriptions with <code>Description:</code></li>
                <li>Attach images with <code>Image:</code></li>
                <li>Add links with <code>Link:</code></li>
              </ul>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h4 className="text-lg font-medium text-white mb-3">Keyboard Shortcuts</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div><kbd className="bg-gray-700 px-2 py-1 rounded">Tab</kbd> - Indent (add spaces)</div>
                <div><kbd className="bg-gray-700 px-2 py-1 rounded">Ctrl+1</kbd> - Switch to Editor</div>
                <div><kbd className="bg-gray-700 px-2 py-1 rounded">Ctrl+2</kbd> - Switch to Calendar</div>
              </div>
              <div className="space-y-1">
                <div><kbd className="bg-gray-700 px-2 py-1 rounded">Ctrl+3</kbd> - Switch to Motivation</div>
                <div><kbd className="bg-gray-700 px-2 py-1 rounded">Ctrl+Shift+T</kbd> - Toggle Timer</div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}