import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Sun, Users, Share2, Star, ChevronLeft, ChevronRight } from 'lucide-react';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vzgcnmcmxanssmepxvsj.supabase.co';
const supabaseKey = 'sb_publishable_cLB6htLo_poFdFy6ElWOdA_nsgdz1WA';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SummerPlanner() {
  const [familyMembers] = useState([
    { id: 1, name: 'Mom', color: 'bg-purple-100 border-purple-300 text-purple-800', avatar: '👩' },
    { id: 2, name: 'Dad', color: 'bg-blue-100 border-blue-300 text-blue-800', avatar: '👨' },
    { id: 3, name: 'Sydney', color: 'bg-pink-100 border-pink-300 text-pink-800', avatar: '🧒' },
    { id: 4, name: 'Avery', color: 'bg-green-100 border-green-300 text-green-800', avatar: '👧' }
  ]);

const [activities, setActivities] = useState([]);
const [loading, setLoading] = useState(true);
  
  const [newActivity, setNewActivity] = useState({ 
    title: '', 
    date: '2026-05-31', 
    endDate: '2026-05-31',
    emoji: '☀️',
    attendees: [],
    confirmed: true
  });
  
  const [view, setView] = useState('all');
  const [viewMode, setViewMode] = useState('summer');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [editingActivity, setEditingActivity] = useState(null);
  const [addingToWeek, setAddingToWeek] = useState(null);
  const [gridViewType, setGridViewType] = useState('week'); // 'week' or 'day'

  const emojis = ['☀️', '🏖️', '🎵', '🚗', '🎨', '🍦', '🏕️', '🎆', '🌊', '🎡', '🍽️', '⚽', '🎭', '🎪', '🎬', '🏊'];

useEffect(() => {
  loadActivities();
}, []);

const loadActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: true });
    if (error) throw error;
   
const mappedData = (data || []).map(activity => ({
  ...activity,
  endDate: activity.end_date
}));

setActivities(mappedData);
  } catch (error) {
    console.error('Error loading activities:', error);
  } finally {
    setLoading(false);
  }
};

const addActivity = async () => {
  if (newActivity.title && newActivity.date) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          title: newActivity.title,
          date: newActivity.date,
          end_date: newActivity.endDate || null,
          emoji: newActivity.emoji,
          attendees: newActivity.attendees,
          confirmed: newActivity.confirmed,
          created_at: new Date().toISOString()
        }])
        .select();
      if (error) throw error;
      setActivities([...activities, ...data]);
      setNewActivity({ title: '', date: '', endDate: '', emoji: '☀️', attendees: [1, 2, 3, 4], confirmed: true });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add activity');
    }
  }
};

const deleteActivity = async (id) => {
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setActivities(activities.filter(a => a.id !== id));
  } catch (error) {
    console.error('Error:', error);
  }
};

const toggleConfirmed = async (id) => {
  const activity = activities.find(a => a.id === id);
  if (!activity) return;
  try {
    const { error } = await supabase
      .from('activities')
      .update({ confirmed: !activity.confirmed })
      .eq('id', id);
    if (error) throw error;
    setActivities(activities.map(a => 
      a.id === id ? { ...a, confirmed: !a.confirmed } : a
    ));
  } catch (error) {
    console.error('Error:', error);
  }
};

const startEditActivity = (activity) => {
  setEditingActivity({ 
    ...activity, 
    endDate: activity.end_date || '',
    attendees: activity.attendees || []
  });
};

const saveEditActivity = async () => {
  try {
    const { error } = await supabase
      .from('activities')
      .update({
        title: editingActivity.title,
        date: editingActivity.date,
        end_date: editingActivity.endDate || null,
        emoji: editingActivity.emoji,
        attendees: editingActivity.attendees,
        confirmed: editingActivity.confirmed
      })
      .eq('id', editingActivity.id);
    if (error) throw error;
    setActivities(activities.map(a => 
      a.id === editingActivity.id ? editingActivity : a
    ));
    setEditingActivity(null);
  } catch (error) {
    console.error('Error:', error);
  }
};

  const cancelEditActivity = () => {
    setEditingActivity(null);
  };

const updateEditField = (field, value) => {
  console.log('UPDATE:', field, '=', value);
  console.log('Before:', editingActivity[field]);
  setEditingActivity({ ...editingActivity, [field]: value });
  console.log('After should be:', value);
};

  const toggleEditAttendee = (memberId) => {
    if (editingActivity.attendees.includes(memberId)) {
      updateEditField('attendees', editingActivity.attendees.filter(id => id !== memberId));
    } else {
      updateEditField('attendees', [...editingActivity.attendees, memberId]);
    }
  };

  const startAddToWeek = (weekStart) => {
    const defaultDate = weekStart.toISOString().split('T')[0];
    setAddingToWeek({
      title: '',
      date: defaultDate,
      endDate: '',
      emoji: '☀️',
      attendees: [1, 2, 3, 4],
      confirmed: true
    });
  };

const saveWeekActivity = async () => {
  if (addingToWeek.title && addingToWeek.date) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          title: addingToWeek.title,
          date: addingToWeek.date,
          end_date: addingToWeek.endDate || null,
          emoji: addingToWeek.emoji,
          attendees: addingToWeek.attendees,
          confirmed: addingToWeek.confirmed, 
          created_at: new Date().toISOString()
        }])
        .select();
      if (error) throw error;
      setActivities([...activities, ...data]);
      setAddingToWeek(null);
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

  const cancelWeekActivity = () => {
    setAddingToWeek(null);
  };

  const updateWeekField = (field, value) => {
    setAddingToWeek({ ...addingToWeek, [field]: value });
  };

  const toggleWeekAttendee = (memberId) => {
    if (addingToWeek.attendees.includes(memberId)) {
      updateWeekField('attendees', addingToWeek.attendees.filter(id => id !== memberId));
    } else {
      updateWeekField('attendees', [...addingToWeek.attendees, memberId]);
    }
  };

  const toggleAttendee = (memberId) => {
    if (newActivity.attendees.includes(memberId)) {
      setNewActivity({
        ...newActivity,
        attendees: newActivity.attendees.filter(id => id !== memberId)
      });
    } else {
      setNewActivity({
        ...newActivity,
        attendees: [...newActivity.attendees, memberId]
      });
    }
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    const target = new Date(date);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getFilteredActivities = () => {
    if (view === 'all') return activities;
    if (view === 'potential') return activities.filter(a => !a.confirmed);
    if (view === 'confirmed') return activities.filter(a => a.confirmed);
    return activities.filter(a => a.attendees.includes(parseInt(view)));
  };

  const getWeekStart = (offset = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (offset * 7);
    return new Date(today.setDate(diff));
  };

  const getWeekDays = (weekStart) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getActivitiesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return getFilteredActivities().filter(a => {
      const activityStart = new Date(a.date);
      const activityEnd = a.endDate ? new Date(a.endDate) : activityStart;
      const checkDate = new Date(dateStr);
      return checkDate >= activityStart && checkDate <= activityEnd;
    });
  };

  const getSummerWeeks = () => {
    const summerStart = new Date('2026-06-01');
    const summerEnd = new Date('2026-08-31');
    
    const firstDay = new Date(summerStart);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay());
    
    const weeks = [];
    let currentWeekStart = new Date(firstDay);
    
    while (currentWeekStart <= summerEnd) {
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStart);
        day.setDate(currentWeekStart.getDate() + i);
        weekDays.push(day);
      }
      
      const weekActivities = [...new Map(
weekDays.flatMap(day => getActivitiesForDate(day))
    .map(a => [a.id, a])
).values()];
      
      weeks.push({
        start: new Date(currentWeekStart),
        days: weekDays,
        activities: weekActivities
      });
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    return weeks;
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (end) {
      const startStr = start.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
      return startStr + ' - ' + endStr;
    } else {
      return start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };

  const getShareLink = () => {
    const data = {
      activities: activities.map(a => ({
        title: a.title,
        date: a.date,
        emoji: a.emoji,
        confirmed: a.confirmed,
        attendees: a.attendees.map(id => familyMembers.find(m => m.id === id)?.name)
      }))
    };
    return window.location.origin + '?data=' + btoa(JSON.stringify(data));
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareLink());
    alert('Share link copied! Send this to family members to view the schedule.');
  };

  const weekStart = getWeekStart(currentWeekOffset);
  const weekDays = getWeekDays(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <Sun className="w-16 h-16 text-teal-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading summer plans...</p>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sun className="w-10 h-10 text-teal-500" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Family Summer 2026
            </h1>
          </div>
          <p className="text-gray-600">Everyone's summer plans in one place</p>
        </div>

        <div className="flex gap-2 mb-4 justify-center flex-wrap">
          <button
            onClick={() => setViewMode('summer')}
            className={'px-4 py-2 rounded-lg font-medium transition ' + (viewMode === 'summer' ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')}
          >
            Summer Overview
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={'px-4 py-2 rounded-lg font-medium transition ' + (viewMode === 'grid' ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={'px-4 py-2 rounded-lg font-medium transition ' + (viewMode === 'week' ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')}
          >
            Week View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={'px-4 py-2 rounded-lg font-medium transition ' + (viewMode === 'list' ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')}
          >
            List View
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border-2 border-teal-200">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setView('all')}
              className={'px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ' + (view === 'all' ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
            >
              <Users className="w-4 h-4" />
              Everyone
            </button>
            <button
              onClick={() => setView('confirmed')}
              className={'px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ' + (view === 'confirmed' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
            >
              ✓ Confirmed
            </button>
            <button
              onClick={() => setView('potential')}
              className={'px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ' + (view === 'potential' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
            >
              <Star className="w-4 h-4" />
              Ideas
            </button>
            {familyMembers.map(member => (
              <button
                key={member.id}
                onClick={() => setView(member.id.toString())}
                className={'px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ' + (view === member.id.toString() ? member.color : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
              >
                <span className="text-lg">{member.avatar}</span>
                {member.name}
              </button>
            ))}
            <button
              onClick={() => setShareModalOpen(true)}
              className="px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-teal-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Add Summer Activity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Activity name..."
              value={newActivity.title}
              onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none"
            />
            <select
              value={newActivity.emoji}
              onChange={(e) => setNewActivity({ ...newActivity, emoji: e.target.value })}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none text-2xl"
            >
              {emojis.map(emoji => (
                <option key={emoji} value={emoji}>{emoji}</option>
              ))}
            </select>
            <input
              type="date"
              value={newActivity.date}
              onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
              placeholder="Start date"
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none"
            />
            <input
              type="date"
              value={newActivity.endDate}
              onChange={(e) => setNewActivity({ ...newActivity, endDate: e.target.value })}
              placeholder="End date (optional)"
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newActivity.confirmed}
                onChange={(e) => setNewActivity({ ...newActivity, confirmed: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Confirmed activity
              </span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Who's going?</label>
            <div className="flex flex-wrap gap-2">
              {familyMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => toggleAttendee(member.id)}
                  className={'px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ' + (newActivity.attendees.includes(member.id) ? member.color : 'bg-gray-100 text-gray-400 hover:bg-gray-200')}
                >
                  <span className="text-lg">{member.avatar}</span>
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addActivity}
            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add to Family Calendar
          </button>
        </div>

        {viewMode === 'summer' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-teal-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Summer 2026 at a Glance
            </h2>
            
            <div className="space-y-4">
              {getSummerWeeks().map((week, weekIndex) => {
                const weekEnd = new Date(week.start);
                weekEnd.setDate(week.start.getDate() + 6);
                const isCurrentWeek = new Date() >= week.start && new Date() <= weekEnd;
                
                return (
                  <div
                    key={weekIndex}
                    className={'border-2 rounded-xl p-4 transition hover:shadow-md ' + (isCurrentWeek ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-teal-300')}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">
                          Week of {week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {isCurrentWeek && (
                          <span className="px-3 py-1 bg-teal-500 text-white rounded-full text-xs font-medium">
                            This Week
                          </span>
                        )}
                      </div>
                    </div>

                    {week.activities.length > 0 ? (
                      <div className="space-y-2">
                        {week.activities.map(activity => {
                          const activityDate = new Date(activity.date);
                          const activityEndDate = activity.end_date ? new Date(activity.end_date) : null;
                          const dayName = activityDate.toLocaleDateString('en-US', { weekday: 'short' });
                          
                          let dateDisplay;
                          if (activityEndDate) {
                            const endDayName = activityEndDate.toLocaleDateString('en-US', { weekday: 'short' });
                            dateDisplay = dayName + '-' + endDayName + ', ' + activityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '-' + activityEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                          } else {
                            dateDisplay = dayName + ', ' + activityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          }
                          
                          // Determine colors based on attendees
                          let bgColor = '#dbeafe'; // default blue
                          let borderColor = '#93c5fd'; // default blue
                          
                          if (activity.attendees.length === 1) {
                            const member = familyMembers.find(m => m.id === activity.attendees[0]);
                            if (member) {
                              if (member.id === 1) { // Mom - purple
                                bgColor = '#f3e8ff';
                                borderColor = '#d8b4fe';
                              } else if (member.id === 2) { // Dad - blue
                                bgColor = '#dbeafe';
                                borderColor = '#93c5fd';
                              } else if (member.id === 3) { // Sydney - pink
                                bgColor = '#fce7f3';
                                borderColor = '#f9a8d4';
                              } else if (member.id === 4) { // Avery - green
                                bgColor = '#d1fae5';
                                borderColor = '#6ee7b7';
                              }
                            }
                          } else if (!activity.confirmed) {
                            // Multi-person ideas get amber
                            bgColor = '#fef3c7';
                            borderColor = '#fcd34d';
                          }
                          
                          return (
                            <div
                              key={activity.id}
                              className={'flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:shadow-md transition ' + (activity.confirmed ? 'border-2' : 'border-2 border-dashed')}
                              style={{
                                backgroundColor: bgColor,
                                borderColor: borderColor
                              }}
                              onClick={() => startEditActivity(activity)}
                            >
                              <div className="text-2xl">{activity.emoji}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{activity.title}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {dateDisplay}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {activity.attendees.slice(0, 4).map(attendeeId => {
                                  const member = familyMembers.find(m => m.id === attendeeId);
                                  return member ? (
                                    <span key={member.id} className="text-lg" title={member.name}>
                                      {member.avatar}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteActivity(activity.id);
                                }}
                                className="text-red-500 hover:text-red-700 transition p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div 
                        onClick={() => startAddToWeek(week.start)}
                        className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                      >
                        <p className="text-sm">No activities planned this week</p>
                        <p className="text-xs mt-1">Click to add something fun!</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-teal-200 overflow-x-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Family Grid View</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setGridViewType('week')}
                  className={'px-3 py-1 rounded-lg text-sm font-medium transition ' + (gridViewType === 'week' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                >
                  By Week
                </button>
                <button
                  onClick={() => setGridViewType('day')}
                  className={'px-3 py-1 rounded-lg text-sm font-medium transition ' + (gridViewType === 'day' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                >
                  By Day
                </button>
              </div>
            </div>

            {gridViewType === 'week' ? (
              <div className="min-w-max">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-2 border-gray-300 p-3 bg-gray-50 text-left font-bold sticky left-0 z-10">Person</th>
                      {getSummerWeeks().map((week, idx) => (
                        <th key={idx} className="border-2 border-gray-300 p-3 bg-gray-50 text-center text-sm min-w-32">
                          <div className="font-bold">Week {idx + 1}</div>
                          <div className="text-xs text-gray-500 font-normal">
                            {week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {familyMembers.map(member => (
                      <tr key={member.id}>
                        <td className={'border-2 border-gray-300 p-3 font-semibold sticky left-0 z-10 ' + member.color.split(' ')[0]}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{member.avatar}</span>
                            <span>{member.name}</span>
                          </div>
                        </td>
                        {getSummerWeeks().map((week, weekIdx) => {
                          const weekActivities = week.activities.filter(a => a.attendees.includes(member.id));
                          const weekEnd = new Date(week.start);
                          weekEnd.setDate(week.start.getDate() + 6);
                          
                          return (
                            <td key={weekIdx} className="border-2 border-gray-300 p-2 align-top">
                              {weekActivities.length > 0 ? (
                                <div className="space-y-1">
                                  {weekActivities.map(activity => {
                                    let bgColor = member.id === 1 ? '#f3e8ff' : member.id === 2 ? '#dbeafe' : member.id === 3 ? '#fce7f3' : '#d1fae5';
                                    let borderColor = member.id === 1 ? '#d8b4fe' : member.id === 2 ? '#93c5fd' : member.id === 3 ? '#f9a8d4' : '#6ee7b7';
                                    
                                    return (
                                      <div
                                        key={activity.id}
                                        className={'text-xs p-1.5 rounded cursor-pointer hover:shadow-md transition ' + (activity.confirmed ? 'border' : 'border border-dashed')}
                                        style={{ backgroundColor: bgColor, borderColor: borderColor }}
                                        onClick={() => startEditActivity(activity)}
                                      >
                                        <div className="font-medium">{activity.emoji} {activity.title}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div 
                                  className="text-xs text-gray-300 text-center py-2 cursor-pointer hover:bg-gray-50 rounded transition"
                                  onClick={() => startAddToWeek(week.start)}
                                >
                                  +
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="min-w-max">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-2 border-gray-300 p-3 bg-gray-50 text-left font-bold sticky left-0 z-10">Person</th>
                      {getSummerWeeks().flatMap(week => {
                        const days = [];
                        for (let i = 0; i < 7; i++) {
                          const day = new Date(week.start);
                          day.setDate(week.start.getDate() + i);
                          days.push(day);
                        }
                        return days;
                      }).map((day, idx) => (
                        <th key={idx} className="border-2 border-gray-300 p-2 bg-gray-50 text-center text-xs min-w-16">
                          <div className="font-bold">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div className="text-xs text-gray-500 font-normal">
                            {day.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {familyMembers.map(member => (
                      <tr key={member.id}>
                        <td className={'border-2 border-gray-300 p-3 font-semibold sticky left-0 z-10 ' + member.color.split(' ')[0]}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{member.avatar}</span>
                            <span>{member.name}</span>
                          </div>
                        </td>
                        {getSummerWeeks().flatMap(week => {
                          const days = [];
                          for (let i = 0; i < 7; i++) {
                            const day = new Date(week.start);
                            day.setDate(week.start.getDate() + i);
                            days.push(day);
                          }
                          return days;
                        }).map((day, dayIdx) => {
                          const dayActivities = getActivitiesForDate(day).filter(a => a.attendees.includes(member.id));
                          
                          return (
                            <td key={dayIdx} className="border-2 border-gray-300 p-1 align-top">
                              {dayActivities.length > 0 ? (
                                <div className="space-y-1">
                                  {dayActivities.map(activity => {
                                    let bgColor = member.id === 1 ? '#f3e8ff' : member.id === 2 ? '#dbeafe' : member.id === 3 ? '#fce7f3' : '#d1fae5';
                                    let borderColor = member.id === 1 ? '#d8b4fe' : member.id === 2 ? '#93c5fd' : member.id === 3 ? '#f9a8d4' : '#6ee7b7';
                                    
                                    return (
                                      <div
                                        key={activity.id}
                                        className={'text-xs p-1 rounded cursor-pointer hover:shadow-md transition ' + (activity.confirmed ? 'border' : 'border border-dashed')}
                                        style={{ backgroundColor: bgColor, borderColor: borderColor }}
                                        onClick={() => startEditActivity(activity)}
                                        title={activity.title}
                                      >
                                        <div className="text-center">{activity.emoji}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="h-8"></div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {viewMode === 'week' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-teal-200">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
              {weekDays.map((day, index) => {
                const dayActivities = getActivitiesForDate(day);
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={'border-2 rounded-lg p-3 min-h-32 ' + (isToday ? 'border-teal-400 bg-teal-50' : 'border-gray-200')}
                  >
                    <div className="text-center mb-2">
                      <div className="text-xs font-medium text-gray-500">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={'text-lg font-bold ' + (isToday ? 'text-teal-600' : 'text-gray-800')}>
                        {day.getDate()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {dayActivities.map(activity => (
                        <div
                          key={activity.id}
                          className={'p-2 rounded-lg text-xs ' + (activity.confirmed ? 'bg-blue-100 border-blue-300 border' : 'bg-amber-50 border-amber-300 border')}
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{activity.emoji}</span>
                            <span className="font-medium truncate">{activity.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            {getFilteredActivities().sort((a, b) => new Date(a.date) - new Date(b.date)).map(activity => {
              const daysUntil = getDaysUntil(activity.date);
              
              return (
                <div
                  key={activity.id}
                  className={'border-2 rounded-2xl p-6 shadow-md hover:shadow-xl transition ' + (activity.confirmed ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-300')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">{activity.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{activity.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm mb-2 text-gray-700">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateRange(activity.date, activity.end_date)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {activity.attendees.map(attendeeId => {
                            const member = familyMembers.find(m => m.id === attendeeId);
                            return member ? (
                              <div key={member.id} className={member.color + ' px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1'}>
                                <span>{member.avatar}</span>
                                <span>{member.name}</span>
                              </div>
                            ) : null;
                          })}
                        </div>

                        <div className="flex gap-2 items-center flex-wrap">
                          {daysUntil >= 0 ? (
                            <div className="inline-block px-3 py-1 bg-white bg-opacity-70 rounded-full text-sm font-medium">
                              {daysUntil === 0 ? '🎉 Today!' : daysUntil + ' days away'}
                            </div>
                          ) : (
                            <div className="inline-block px-3 py-1 bg-gray-200 rounded-full text-sm font-medium text-gray-600">
                              Completed
                            </div>
                          )}
                          <button
                            onClick={() => toggleConfirmed(activity.id)}
                            className="px-3 py-1 bg-white bg-opacity-70 rounded-full text-sm font-medium hover:bg-opacity-100 transition"
                          >
                            {activity.confirmed ? 'Mark as idea' : 'Confirm'}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteActivity(activity.id)}
                      className="text-red-500 hover:text-red-700 transition p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {getFilteredActivities().length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Sun className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">
              {view === 'potential' 
                ? 'No potential ideas yet. Add some activities and mark them as ideas!'
                : view === 'confirmed'
                ? 'No confirmed activities yet. Add some and mark them as confirmed!'
                : view === 'all' 
                ? 'No summer plans yet. Start adding some!'
                : 'No activities scheduled for ' + familyMembers.find(m => m.id === parseInt(view))?.name + ' yet.'
              }
            </p>
          </div>
        )}

        {addingToWeek && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">Add Activity</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Name</label>
                  <input
                    type="text"
                    value={addingToWeek.title}
                    onChange={(e) => updateWeekField('title', e.target.value)}
                    placeholder="What's the activity?"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={addingToWeek.date}
                      onChange={(e) => updateWeekField('date', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date (optional)</label>
                    <input
                      type="date"
                      value={addingToWeek.endDate || ''}
                      onChange={(e) => updateWeekField('endDate', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                  <select
                    value={addingToWeek.emoji}
                    onChange={(e) => updateWeekField('emoji', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none text-2xl"
                  >
                    {emojis.map(emoji => (
                      <option key={emoji} value={emoji}>{emoji}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addingToWeek.confirmed}
                      onChange={(e) => updateWeekField('confirmed', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Confirmed activity
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Who's going?</label>
                  <div className="flex flex-wrap gap-2">
                    {familyMembers.map(member => (
                      <button
                        key={member.id}
                        onClick={() => toggleWeekAttendee(member.id)}
                        className={'px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ' + (addingToWeek.attendees.includes(member.id) ? member.color : 'bg-gray-100 text-gray-400 hover:bg-gray-200')}
                      >
                        <span className="text-lg">{member.avatar}</span>
                        {member.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={saveWeekActivity}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition"
                >
                  Add Activity
                </button>
                <button
                  onClick={cancelWeekActivity}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {editingActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">Edit Activity</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Name</label>
                  <input
                    type="text"
                    value={editingActivity.title}
                    onChange={(e) => updateEditField('title', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={editingActivity.date}
                      onChange={(e) => updateEditField('date', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date (optional)</label>
                    <input
                      type="date"
                      value={editingActivity.end_date || ''}
                      onChange={(e) => updateEditField('endDate', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                  <select
                    value={editingActivity.emoji}
                    onChange={(e) => updateEditField('emoji', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none text-2xl"
                  >
                    {emojis.map(emoji => (
                      <option key={emoji} value={emoji}>{emoji}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingActivity.confirmed}
                      onChange={(e) => updateEditField('confirmed', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Confirmed activity
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Who's going?</label>
                  <div className="flex flex-wrap gap-2">
                    {familyMembers.map(member => (
                      <button
                        key={member.id}
                        onClick={() => toggleEditAttendee(member.id)}
                        className={'px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ' + (editingActivity.attendees.includes(member.id) ? member.color : 'bg-gray-100 text-gray-400 hover:bg-gray-200')}
                      >
                        <span className="text-lg">{member.avatar}</span>
                        {member.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={saveEditActivity}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={cancelEditActivity}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {shareModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Share Family Schedule</h3>
              <p className="text-gray-600 mb-4">
                Copy this link and share it with family members so they can view everyone's summer plans!
              </p>
              <div className="bg-gray-100 p-3 rounded-lg mb-4 break-all text-sm text-gray-700">
                {getShareLink()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyShareLink}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}