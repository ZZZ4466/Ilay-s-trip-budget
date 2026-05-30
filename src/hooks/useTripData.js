import { useState, useEffect } from 'react';
import { createEmptyExpense, DEFAULT_EXCHANGE_RATES } from '../data/initialData';

const STORAGE_KEY = 'ilay-trip-budget';

const defaultState = {
  east: { expenses: [], budget: 15000 },
  southAmerica: { expenses: [], budget: 15000 },
  exchangeRates: DEFAULT_EXCHANGE_RATES,
  baseCurrency: 'USD',
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

export function useTripData() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function updateTrip(tripId, updater) {
    setState(prev => ({
      ...prev,
      [tripId]: updater(prev[tripId]),
    }));
  }

  function addExpense(tripId, partial = {}) {
    const expense = { ...createEmptyExpense(), ...partial };
    updateTrip(tripId, trip => ({ ...trip, expenses: [...trip.expenses, expense] }));
    return expense.id;
  }

  function updateExpense(tripId, id, changes) {
    updateTrip(tripId, trip => ({
      ...trip,
      expenses: trip.expenses.map(e => (e.id === id ? { ...e, ...changes } : e)),
    }));
  }

  function deleteExpense(tripId, id) {
    updateTrip(tripId, trip => ({
      ...trip,
      expenses: trip.expenses.filter(e => e.id !== id),
    }));
  }

  function setBudget(tripId, budget) {
    updateTrip(tripId, trip => ({ ...trip, budget: Number(budget) }));
  }

  function setExchangeRate(currency, rate) {
    setState(prev => ({
      ...prev,
      exchangeRates: { ...prev.exchangeRates, [currency]: Number(rate) },
    }));
  }

  function setBaseCurrency(currency) {
    setState(prev => ({ ...prev, baseCurrency: currency }));
  }

  function toBase(amount, currency) {
    const rates = state.exchangeRates;
    const inUsd = Number(amount) / (rates[currency] || 1);
    const baseRate = rates[state.baseCurrency] || 1;
    return inUsd * baseRate;
  }

  function totalForTrip(tripId) {
    return state[tripId].expenses.reduce((sum, e) => {
      const amt = e.category === 'accommodation' && e.nights && e.pricePerNight
        ? Number(e.nights) * Number(e.pricePerNight)
        : Number(e.amount) || 0;
      return sum + toBase(amt, e.currency);
    }, 0);
  }

  return {
    state,
    addExpense,
    updateExpense,
    deleteExpense,
    setBudget,
    setExchangeRate,
    setBaseCurrency,
    toBase,
    totalForTrip,
  };
}
