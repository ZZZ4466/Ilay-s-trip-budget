import { useState, useMemo } from 'react';
import ExpenseForm from './ExpenseForm';
import { EXPENSE_CATEGORIES, CURRENCIES } from '../data/initialData';

export default function TripTab({ trip, tripData, onAdd, onUpdate, onDelete, onBudgetChange, toBase, baseCurrency }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(tripData.budget);

  const total = useMemo(() => tripData.expenses.reduce((sum, e) => {
    const amt = e.category === 'accommodation' && e.nights && e.pricePerNight
      ? Number(e.nights) * Number(e.pricePerNight)
      : Number(e.amount) || 0;
    return sum + toBase(amt, e.currency);
  }, 0), [tripData.expenses, toBase]);

  const budget = tripData.budget;
  const remaining = budget - total;
  const pct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;

  const byCategory = useMemo(() => {
    const map = {};
    tripData.expenses.forEach(e => {
      const amt = e.category === 'accommodation' && e.nights && e.pricePerNight
        ? Number(e.nights) * Number(e.pricePerNight)
        : Number(e.amount) || 0;
      map[e.category] = (map[e.category] || 0) + toBase(amt, e.currency);
    });
    return map;
  }, [tripData.expenses, toBase]);

  const filtered = useMemo(() => {
    let list = filterCategory === 'all' ? tripData.expenses : tripData.expenses.filter(e => e.category === filterCategory);
    if (sortBy === 'date') list = [...list].sort((a, b) => a.date.localeCompare(b.date));
    if (sortBy === 'amount') list = [...list].sort((a, b) => {
      const getAmt = e => e.category === 'accommodation' && e.nights && e.pricePerNight
        ? Number(e.nights) * Number(e.pricePerNight) : Number(e.amount) || 0;
      return toBase(getAmt(b), b.currency) - toBase(getAmt(a), a.currency);
    });
    if (sortBy === 'category') list = [...list].sort((a, b) => a.category.localeCompare(b.category));
    return list;
  }, [tripData.expenses, filterCategory, sortBy, toBase]);

  function fmt(n) {
    return n.toLocaleString('he-IL', { maximumFractionDigits: 0 });
  }

  return (
    <div className="trip-tab">
      {/* Budget bar */}
      <div className="budget-section">
        <div className="budget-header">
          <div className="budget-info">
            <span className="budget-label">תקציב:</span>
            {editingBudget ? (
              <form onSubmit={e => { e.preventDefault(); onBudgetChange(budgetInput); setEditingBudget(false); }} style={{ display: 'inline-flex', gap: 6 }}>
                <input
                  className="budget-input-inline"
                  type="number"
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn-sm btn-primary">שמור</button>
              </form>
            ) : (
              <button className="budget-value-btn" onClick={() => { setBudgetInput(budget); setEditingBudget(true); }}>
                {fmt(budget)} {baseCurrency}
              </button>
            )}
          </div>
          <div className="budget-stats">
            <span className="stat spent">הוצא: {fmt(total)} {baseCurrency}</span>
            <span className={`stat remaining ${remaining < 0 ? 'negative' : ''}`}>
              נותר: {fmt(remaining)} {baseCurrency}
            </span>
          </div>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${pct > 90 ? 'danger' : pct > 70 ? 'warning' : 'ok'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="progress-pct">{pct.toFixed(1)}% מהתקציב</div>
      </div>

      {/* Category breakdown */}
      <div className="category-breakdown">
        {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
          const info = EXPENSE_CATEGORIES[cat];
          return (
            <div key={cat} className="cat-chip" style={{ background: info.color + '22', borderColor: info.color }}>
              <span>{info.icon}</span>
              <span className="cat-chip-label">{info.label}</span>
              <span className="cat-chip-amount">{fmt(amt)} {baseCurrency}</span>
            </div>
          );
        })}
        {Object.keys(byCategory).length === 0 && (
          <p className="empty-hint">עדיין אין הוצאות — לחץ על + כדי להתחיל</p>
        )}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="filter-select">
            <option value="all">כל הקטגוריות</option>
            {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select">
            <option value="date">מיון לפי תאריך</option>
            <option value="amount">מיון לפי סכום</option>
            <option value="category">מיון לפי קטגוריה</option>
          </select>
        </div>
        <div className="add-buttons">
          {Object.entries(EXPENSE_CATEGORIES).slice(0, 6).map(([k, v]) => (
            <button key={k} className="add-cat-btn" style={{ background: v.color }} onClick={() => onAdd({ category: k })}>
              {v.icon}
            </button>
          ))}
          <button className="btn-primary add-main-btn" onClick={() => onAdd({})}>+ הוסף הוצאה</button>
        </div>
      </div>

      {/* Expense list */}
      <div className="expense-list">
        {filtered.length === 0 && filterCategory !== 'all' && (
          <p className="empty-hint">אין הוצאות בקטגוריה זו</p>
        )}
        {filtered.map(expense => (
          <ExpenseForm
            key={expense.id}
            expense={expense}
            onChange={updated => onUpdate(expense.id, updated)}
            onDelete={() => onDelete(expense.id)}
            tripColor={trip.color}
          />
        ))}
      </div>

      {/* Quick-add bottom */}
      <div className="quick-add-bar">
        <span>הוסף במהירות:</span>
        {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
          <button key={k} className="quick-add-btn" onClick={() => onAdd({ category: k })}>
            {v.icon} {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
