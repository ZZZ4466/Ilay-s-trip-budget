import { useState } from 'react';
import { EXPENSE_CATEGORIES, CURRENCIES } from '../data/initialData';

function Field({ label, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export default function ExpenseForm({ expense, onChange, onDelete, tripColor }) {
  const [expanded, setExpanded] = useState(!expense.description && !expense.amount);
  const cat = EXPENSE_CATEGORIES[expense.category];

  const effectiveAmount = expense.category === 'accommodation' && expense.nights && expense.pricePerNight
    ? (Number(expense.nights) * Number(expense.pricePerNight)).toFixed(2)
    : expense.amount;

  function set(field, value) {
    onChange({ ...expense, [field]: value });
  }

  return (
    <div className="expense-card" style={{ borderLeftColor: cat.color }}>
      <div className="expense-header" onClick={() => setExpanded(e => !e)}>
        <span className="expense-icon">{cat.icon}</span>
        <div className="expense-summary">
          <span className="expense-title">
            {expense.description || expense.fromCity
              ? (expense.category === 'flights'
                  ? `${expense.fromCity || '?'} → ${expense.toCity || '?'}`
                  : expense.description || cat.label)
              : cat.label}
          </span>
          {expense.date && <span className="expense-date">{expense.date}</span>}
        </div>
        <div className="expense-amount-preview">
          {effectiveAmount
            ? `${Number(effectiveAmount).toLocaleString()} ${expense.currency}`
            : '—'}
        </div>
        <button
          className="delete-btn"
          onClick={e => { e.stopPropagation(); onDelete(); }}
          title="מחק"
        >✕</button>
        <span className="toggle-arrow">{expanded ? '▲' : '▽'}</span>
      </div>

      {expanded && (
        <div className="expense-body">
          <div className="form-row">
            <Field label="קטגוריה">
              <select value={expense.category} onChange={e => set('category', e.target.value)}>
                {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </Field>
            <Field label="תאריך">
              <input type="date" value={expense.date} onChange={e => set('date', e.target.value)} />
            </Field>
          </div>

          {expense.category === 'flights' && (
            <div className="form-row">
              <Field label="מ-">
                <input placeholder="תל אביב" value={expense.fromCity} onChange={e => set('fromCity', e.target.value)} />
              </Field>
              <Field label="אל">
                <input placeholder="בנגקוק" value={expense.toCity} onChange={e => set('toCity', e.target.value)} />
              </Field>
            </div>
          )}

          {expense.category === 'accommodation' && (
            <>
              <Field label="מיקום / שם המקום">
                <input placeholder="הוסטל בצ'יאנג מאי" value={expense.location} onChange={e => set('location', e.target.value)} />
              </Field>
              <div className="form-row">
                <Field label="מספר לילות">
                  <input type="number" min="1" placeholder="5" value={expense.nights} onChange={e => set('nights', e.target.value)} />
                </Field>
                <Field label="מחיר ללילה">
                  <input type="number" min="0" placeholder="20" value={expense.pricePerNight} onChange={e => set('pricePerNight', e.target.value)} />
                </Field>
              </div>
            </>
          )}

          {['trekking', 'tours', 'activities'].includes(expense.category) && (
            <Field label="משך (ימים / שעות)">
              <input placeholder="3 ימים" value={expense.duration} onChange={e => set('duration', e.target.value)} />
            </Field>
          )}

          {expense.category === 'carRental' && (
            <Field label="מספר ימי השכרה">
              <input type="number" min="1" placeholder="7" value={expense.days} onChange={e => set('days', e.target.value)} />
            </Field>
          )}

          <Field label="תיאור">
            <input
              placeholder={expense.category === 'flights' ? 'El Al TLV→BKK' : 'תיאור קצר'}
              value={expense.description}
              onChange={e => set('description', e.target.value)}
            />
          </Field>

          {expense.category !== 'accommodation' && (
            <div className="form-row">
              <Field label="סכום">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={expense.amount}
                  onChange={e => set('amount', e.target.value)}
                />
              </Field>
              <Field label="מטבע">
                <select value={expense.currency} onChange={e => set('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          )}

          {expense.category === 'accommodation' && (
            <Field label="מטבע">
              <select value={expense.currency} onChange={e => set('currency', e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          )}

          <Field label="הערות">
            <textarea
              rows={2}
              placeholder="הערות נוספות..."
              value={expense.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </Field>

          {expense.category === 'accommodation' && expense.nights && expense.pricePerNight && (
            <div className="accommodation-total">
              סה"כ: {(Number(expense.nights) * Number(expense.pricePerNight)).toLocaleString()} {expense.currency}
              ({expense.nights} לילות × {expense.pricePerNight} {expense.currency})
            </div>
          )}
        </div>
      )}
    </div>
  );
}
