export const EXPENSE_CATEGORIES = {
  flights: { label: 'טיסות', icon: '✈️', color: '#6366f1' },
  accommodation: { label: 'לינה', icon: '🏨', color: '#0ea5e9' },
  transport: { label: 'תחבורה מקומית', icon: '🚌', color: '#f59e0b' },
  carRental: { label: 'רכב שכור', icon: '🚗', color: '#f97316' },
  food: { label: 'אוכל ושתייה', icon: '🍜', color: '#10b981' },
  activities: { label: 'פעילויות ואטרקציות', icon: '🎭', color: '#8b5cf6' },
  trekking: { label: 'טרקים והרפתקאות', icon: '🥾', color: '#84cc16' },
  tours: { label: 'טיולים מאורגנים', icon: '🗺️', color: '#06b6d4' },
  visas: { label: 'ויזות וביטוח', icon: '📋', color: '#ec4899' },
  shopping: { label: 'קניות וסובנירים', icon: '🛍️', color: '#f43f5e' },
  health: { label: 'בריאות ורפואה', icon: '💊', color: '#14b8a6' },
  communication: { label: 'תקשורת וסים', icon: '📱', color: '#a78bfa' },
  other: { label: 'שונות', icon: '💸', color: '#94a3b8' },
};

export const CURRENCIES = ['USD', 'ILS', 'EUR', 'THB', 'JPY', 'VND', 'BRL', 'COP', 'PEN', 'ARS'];

export const TRIPS = {
  east: {
    id: 'east',
    name: 'מזרח אסיה',
    emoji: '🌏',
    color: '#f97316',
    gradient: 'from-orange-500 to-red-500',
  },
  southAmerica: {
    id: 'southAmerica',
    name: 'דרום אמריקה',
    emoji: '🌎',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
  },
};

export const createEmptyExpense = () => ({
  id: crypto.randomUUID(),
  category: 'other',
  description: '',
  amount: '',
  currency: 'USD',
  date: new Date().toISOString().split('T')[0],
  notes: '',
  // flight-specific
  fromCity: '',
  toCity: '',
  // accommodation-specific
  location: '',
  nights: '',
  pricePerNight: '',
  // trekking/tour-specific
  duration: '',
  // car rental
  days: '',
});

export const DEFAULT_EXCHANGE_RATES = {
  USD: 1,
  ILS: 3.7,
  EUR: 0.92,
  THB: 35,
  JPY: 150,
  VND: 25000,
  BRL: 5,
  COP: 4000,
  PEN: 3.8,
  ARS: 900,
};
