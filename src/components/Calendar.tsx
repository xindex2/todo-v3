import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, X, Save, Edit2, Trash2, Palette } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { useSupabaseEvents } from '../hooks/useSupabaseEvents';
import { useAuth } from '../hooks/useAuth';

interface CalendarProps {
  content: string;
  onContentChange?: (newContent: string) => void;
  isDarkMode?: boolean;
}

interface ScheduledEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'task' | 'event';
  color?: string;
  description?: string;
}

const eventColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

export function Calendar({ content, onContentChange, isDarkMode = true }: CalendarProps) {
  const { user } = useAuth();
  const { events, createEvent, updateEvent, deleteEvent } = useSupabaseEvents();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    description: '',
    color: eventColors[0]
  });

  const extractScheduledEvents = (content: string): ScheduledEvent[] => {
    const events: ScheduledEvent[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const scheduleMatch = line.match(/@(\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?)/);
      if (scheduleMatch) {
        const dateTime = scheduleMatch[1];
        const date = new Date(dateTime);
        const title = line.replace(scheduleMatch[0], '').replace(/^[-\s]*/, '').trim();
        
        // Extract color from line if present
        const colorMatch = line.match(/color:(\#[0-9a-fA-F]{6})/);
        const color = colorMatch ? colorMatch[1] : eventColors[index % eventColors.length];
        
        events.push({
          id: `task-${index}`,
          title: title || 'Untitled Task',
          date,
          time: dateTime.includes(':') ? dateTime.split(' ')[1] : undefined,
          type: 'task',
          color
        });
      }
    });
    
    return events;
  };

  const taskEvents = extractScheduledEvents(content);
  const dbEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    date: event.date,
    time: format(event.date, 'HH:mm'),
    type: 'event' as const,
    color: event.color,
    description: event.description
  }));
  
  const allEvents = [...taskEvents, ...dbEvents];
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getEventsForDate = (date: Date) => {
    return allEvents.filter(event => isSameDay(event.date, date));
  };

  const selectedEvents = getEventsForDate(selectedDate);

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) return;

    if (user) {
      // Save to database
      const eventDate = new Date(selectedDate);
      if (newEvent.time) {
        const [hours, minutes] = newEvent.time.split(':');
        eventDate.setHours(parseInt(hours), parseInt(minutes));
      }
      
      await createEvent(
        newEvent.title,
        eventDate,
        newEvent.description,
        newEvent.color
      );
    } else if (onContentChange) {
      // Save to markdown content
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const timeStr = newEvent.time ? ` ${newEvent.time}` : '';
      const colorStr = newEvent.color !== eventColors[0] ? ` color:${newEvent.color}` : '';
      const eventLine = `- ${newEvent.title} @${dateStr}${timeStr}${colorStr}`;
      
      const newContent = content ? `${content}\n${eventLine}` : eventLine;
      onContentChange(newContent);
    }
    
    setNewEvent({ title: '', time: '', description: '', color: eventColors[0] });
    setShowAddEvent(false);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      time: event.time || '',
      description: event.description || '',
      color: event.color || eventColors[0]
    });
    setShowAddEvent(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    if (user && editingEvent.type === 'event') {
      // Update database event
      const eventDate = new Date(selectedDate);
      if (newEvent.time) {
        const [hours, minutes] = newEvent.time.split(':');
        eventDate.setHours(parseInt(hours), parseInt(minutes));
      }
      
      await updateEvent(editingEvent.id, {
        title: newEvent.title,
        date: eventDate,
        description: newEvent.description,
        color: newEvent.color
      });
    } else if (onContentChange && editingEvent.type === 'task') {
      // Update markdown content
      const lines = content.split('\n');
      const eventIndex = parseInt(editingEvent.id.replace('task-', ''));
      
      if (lines[eventIndex]) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const timeStr = newEvent.time ? ` ${newEvent.time}` : '';
        const colorStr = newEvent.color !== eventColors[0] ? ` color:${newEvent.color}` : '';
        lines[eventIndex] = `- ${newEvent.title} @${dateStr}${timeStr}${colorStr}`;
        
        onContentChange(lines.join('\n'));
      }
    }
    
    setEditingEvent(null);
    setNewEvent({ title: '', time: '', description: '', color: eventColors[0] });
    setShowAddEvent(false);
  };

  const handleDeleteEvent = async (event: any) => {
    if (user && event.type === 'event') {
      await deleteEvent(event.id);
    } else if (onContentChange && event.type === 'task') {
      const lines = content.split('\n');
      const eventIndex = parseInt(event.id.replace('task-', ''));
      
      if (lines[eventIndex]) {
        lines.splice(eventIndex, 1);
        onContentChange(lines.join('\n'));
      }
    }
  };

  const containerClasses = isDarkMode
    ? 'h-full bg-gray-900 flex flex-col md:flex-row'
    : 'h-full bg-white flex flex-col md:flex-row';

  const headerClasses = isDarkMode
    ? 'h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4'
    : 'h-12 bg-gray-100 border-b border-gray-300 flex items-center justify-between px-4';

  const sidebarClasses = isDarkMode
    ? 'w-full md:w-80 bg-gray-800 border-t md:border-t-0 md:border-l border-gray-700 flex flex-col order-first md:order-last'
    : 'w-full md:w-80 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-300 flex flex-col order-first md:order-last';

  const modalClasses = isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-300';

  return (
    <div className={containerClasses}>
      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className={headerClasses}>
          <div className="flex items-center space-x-2">
            <CalendarIcon className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className="text-sm font-medium">Schedule</span>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium min-w-20 md:min-w-24 text-center">
              {format(currentDate, 'MMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 p-2 md:p-4 overflow-auto">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={`p-1 md:p-2 text-center text-xs font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map(day => {
              const dayEvents = getEventsForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);
              
              let dayClasses = 'aspect-square p-1 md:p-2 rounded-lg flex flex-col items-center justify-start text-xs md:text-sm transition-all duration-200 cursor-pointer ';
              
              if (isSelected) {
                dayClasses += 'bg-blue-600 text-white';
              } else if (isCurrentDay) {
                dayClasses += isDarkMode 
                  ? 'bg-blue-900 text-blue-300 border border-blue-600'
                  : 'bg-blue-100 text-blue-700 border border-blue-400';
              } else {
                dayClasses += isDarkMode
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700';
              }
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={dayClasses}
                >
                  <span className="font-medium">{format(day, 'd')}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {dayEvents.slice(0, 2).map((event, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-xs">+{dayEvents.length - 2}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Details Sidebar */}
      <div className={sidebarClasses}>
        {/* Header */}
        <div className={`h-12 flex items-center justify-between px-4 ${
          isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-300'
        }`}>
          <span className="text-sm font-medium">
            {format(selectedDate, 'EEE, MMM d')}
          </span>
          <button 
            onClick={() => setShowAddEvent(true)}
            className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Events */}
        <div className="flex-1 overflow-auto p-4">
          {selectedEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedEvents.map(event => (
                <div
                  key={event.id}
                  className={`group p-3 rounded-lg border-l-4 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-white hover:bg-gray-50 shadow-sm'
                  } transition-colors`}
                  style={{ borderLeftColor: event.color }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium mb-1 truncate ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {event.title}
                      </div>
                      {event.time && (
                        <div className={`flex items-center space-x-1 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      <div className={`text-xs mt-2 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {event.type === 'task' ? 'Task' : 'Event'}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className={`p-1 rounded ${
                          isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        }`}
                        title="Edit Event"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this event?')) {
                            handleDeleteEvent(event);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-600 text-red-400 hover:text-white"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center h-full ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <CalendarIcon className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm text-center">No events scheduled for this day</p>
              <p className="text-xs text-center mt-1">
                Click the + button to add an event
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className={`p-4 space-y-2 ${
          isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-300'
        }`}>
          <div className="flex justify-between text-sm">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>This Month</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{allEvents.length} events</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Upcoming</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {allEvents.filter(e => e.date > new Date()).length} tasks
            </span>
          </div>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-6 w-full max-w-md border ${modalClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingEvent ? 'Edit Event' : 'Add Event'} - {format(selectedDate, 'MMM d, yyyy')}
              </h3>
              <button
                onClick={() => {
                  setShowAddEvent(false);
                  setEditingEvent(null);
                  setNewEvent({ title: '', time: '', description: '', color: eventColors[0] });
                }}
                className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter event title..."
                  autoFocus
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Time (Optional)
                </label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Palette className="w-4 h-4 inline mr-1" />
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {eventColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewEvent({ ...newEvent, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newEvent.color === color
                          ? 'border-white scale-110 shadow-lg'
                          : isDarkMode 
                          ? 'border-gray-600 hover:border-gray-400'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
                disabled={!newEvent.title.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingEvent ? 'Update' : 'Add'} Event</span>
              </button>
              <button
                onClick={() => {
                  setShowAddEvent(false);
                  setEditingEvent(null);
                  setNewEvent({ title: '', time: '', description: '', color: eventColors[0] });
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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
    </div>
  );
}