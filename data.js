'use strict';

const CATEGORIES = [
  { id: 'rest',    label: 'Rest',    emoji: '💤', color: '#6366F1', productive: false },
  { id: 'edu',     label: 'Education', emoji: '🎓', color: '#00D4FF', productive: true },
  { id: 'work',    label: 'Work',    emoji: '💼', color: '#F59E0B', productive: true },
  { id: 'health',  label: 'Health',  emoji: '🏃', color: '#10B981', productive: true },
  { id: 'ent',     label: 'Fun',     emoji: '🎮', color: '#F43F5E', productive: false },
  { id: 'social',  label: 'Social',  emoji: '👥', color: '#A78BFA', productive: false },
  { id: 'travel',  label: 'Travel',  emoji: '🚆', color: '#FB923C', productive: false },
  { id: 'other',   label: 'Other',   emoji: '📌', color: '#94A3B8', productive: false },
];

const TEMPLATES = [
  {
    name: 'College Day',
    emoji: '🎓',
    desc: '8h sleep · 6h college · study + travel',
    activities: [
      { name: 'Sleep',    hours: 8, mins: 0, cat: 'rest',   startTime: '23:00' },
      { name: 'College',  hours: 6, mins: 0, cat: 'edu',    startTime: '08:00' },
      { name: 'Travel',   hours: 2, mins: 0, cat: 'travel', startTime: '07:00' },
      { name: 'Study',    hours: 3, mins: 0, cat: 'edu',    startTime: '17:00' },
      { name: 'Exercise', hours: 1, mins: 0, cat: 'health', startTime: '20:00' },
    ]
  },
  {
    name: 'Developer Day',
    emoji: '💻',
    desc: '8h sleep · 5h coding · study + work',
    activities: [
      { name: 'Sleep',  hours: 8, mins: 0, cat: 'rest',   startTime: '23:00' },
      { name: 'Coding', hours: 5, mins: 0, cat: 'work',   startTime: '09:00' },
      { name: 'Study',  hours: 3, mins: 0, cat: 'edu',    startTime: '14:00' },
      { name: 'Work',   hours: 4, mins: 0, cat: 'work',   startTime: '17:00' },
      { name: 'Break',  hours: 1, mins: 0, cat: 'health', startTime: '13:00' },
    ]
  },
  {
    name: 'Balanced Day',
    emoji: '🧘',
    desc: '8h sleep · 7h work · health + social',
    activities: [
      { name: 'Sleep',    hours: 8, mins: 0, cat: 'rest',   startTime: '22:30' },
      { name: 'Work',     hours: 7, mins: 0, cat: 'work',   startTime: '09:00' },
      { name: 'Exercise', hours: 1, mins: 0, cat: 'health', startTime: '07:00' },
      { name: 'Study',    hours: 2, mins: 0, cat: 'edu',    startTime: '19:00' },
      { name: 'Social',   hours: 2, mins: 0, cat: 'social', startTime: '21:00' },
    ]
  },
];

const STATE = {
  activities: [],
  selectedCat: 'other',
  nextId: 1,

  addActivity(act) {
    act.id = this.nextId++;
    this.activities.push(act);
  },
  removeActivity(id) {
    this.activities = this.activities.filter(a => a.id !== id);
  },
  clearActivities() {
    this.activities = [];
  },
  totalMinutes() {
    return this.activities.reduce((sum, a) => sum + a.totalMins, 0);
  },
  getCat(id) {
    return CATEGORIES.find(c => c.id === id) || CATEGORIES[7];
  },
};
