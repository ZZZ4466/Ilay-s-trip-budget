import { useMemo } from 'react';
import { EXPENSE_CATEGORIES, CURRENCIES, TRIPS, DEFAULT_EXCHANGE_RATES } from '../data/initialData';

export default function SummaryTab({ state, toBase, totalForTrip, setExchangeRate, setBaseCurrency }) {
  const eastTotal = totalForTrip('east');
  const saTotal = totalForTrip('southAmerica');
  const grandTotal = eastTotal + saTotal;
  const grandBudget = state.east.budget + state.southAmerica.budget;
  const { baseCurrency, exchangeRates } = state;

  function fmt(n) {
    return n.toLocaleString('he-IL', { maximumFractionDigits: 0 });
  }

  const combined = useMemo(() => {
    const map = {};
    ['east', 'southAmerica'].forEach(tripId => {
      state[tripId].expenses.forEach(e => {
        const amt = e.category === 'accommodation' && e.nights && e.pricePerNight
          ? Number(e.nights) * Number(e.pricePerNight)
          : Number(e.amount) || 0;
        map[e.category] = (map[e.category] || 0) + toBase(amt, e.currency);
      });
    });
    return map;
  }, [state, toBase]);

  const topExpenses = useMemo(() => {
    const all = [];
    ['east', 'southAmerica'].forEach(tripId => {
      state[tripId].expenses.forEach(e => {
        const amt = e.category === 'accommodation' && e.nights && e.pricePerNight
          ? Number(e.nights) * Number(e.pricePerNight)
          : Number(e.amount) || 0;
        const base = toBase(amt, e.currency);
        if (base > 0) all.push({ ...e, baseAmount: base, tripId });
      });
    });
    return all.sort((a, b) => b.baseAmount - a.baseAmount).slice(0, 10);
  }, [state, toBase]);

  return (
    <div className="summary-tab">
      {/* Grand total cards */}
      <div className="summary-cards">
        <div className="summary-card total-card">
          <div className="summary-card-title">סה"כ כל הטיולים</div>
          <div className="summary-card-amount">{fmt(grandTotal)} {baseCurrency}</div>
          <div className="summary-card-sub">מתוך תקציב {fmt(grandBudget)} {baseCurrency}</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div
              className={`progress-fill ${grandTotal / grandBudget > 0.9 ? 'danger' : grandTotal / grandBudget > 0.7 ? 'warning' : 'ok'}`}
              style={{ width: `${Math.min((grandTotal / grandBudget) * 100, 100)}%` }}
            />
          </div>
        </div>
        {Object.entries(TRIPS).map(([id, trip]) => {
          const total = id === 'east' ? eastTotal : saTotal;
          const budget = state[id].budget;
          const pct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;
          return (
            <div key={id} className="summary-card trip-card" style={{ borderTopColor: trip.color }}>
              <div className="summary-card-title">{trip.emoji} {trip.name}</div>
              <div className="summary-card-amount" style={{ color: trip.color }}>{fmt(total)} {baseCurrency}</div>
              <div className="summary-card-sub">מתוך {fmt(budget)} {baseCurrency}</div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div
                  className={`progress-fill ${pct > 90 ? 'danger' : pct > 70 ? 'warning' : 'ok'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="summary-card-count">{state[id].expenses.length} פריטים</div>
            </div>
          );
        })}
      </div>

      {/* Combined category breakdown */}
      <div className="section-header">התפלגות לפי קטגוריה — כל הטיולים</div>
      <div className="cat-table">
        {Object.entries(combined).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
          const info = EXPENSE_CATEGORIES[cat];
          const pct = grandTotal > 0 ? (amt / grandTotal) * 100 : 0;
          return (
            <div key={cat} className="cat-table-row">
              <span className="cat-table-icon">{info.icon}</span>
              <span className="cat-table-label">{info.label}</span>
              <div className="cat-table-bar-wrap">
                <div className="cat-table-bar" style={{ width: `${pct}%`, background: info.color }} />
              </div>
              <span className="cat-table-pct">{pct.toFixed(1)}%</span>
              <span className="cat-table-amt">{fmt(amt)} {baseCurrency}</span>
            </div>
          );
        })}
        {Object.keys(combined).length === 0 && <p className="empty-hint">עדיין אין נתונים</p>}
      </div>

      {/* Top expenses */}
      {topExpenses.length > 0 && (
        <>
          <div className="section-header">10 ההוצאות הגדולות ביותר</div>
          <div className="top-expenses">
            {topExpenses.map((e, i) => {
              const cat = EXPENSE_CATEGORIES[e.category];
              const trip = TRIPS[e.tripId];
              return (
                <div key={e.id} className="top-expense-row">
                  <span className="top-rank">#{i + 1}</span>
                  <span className="top-icon">{cat.icon}</span>
                  <div className="top-info">
                    <span className="top-desc">
                      {e.category === 'flights'
                        ? `${e.fromCity || '?'} → ${e.toCity || '?'}`
                        : e.description || e.location || cat.label}
                    </span>
                    <span className="top-meta">{trip.emoji} {trip.name} · {e.date}</span>
                  </div>
                  <span className="top-amount">{fmt(e.baseAmount)} {baseCurrency}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Exchange rates editor */}
      <div className="section-header">שערי חליפין ומטבע בסיס</div>
      <div className="rates-section">
        <div className="base-currency-row">
          <label>מטבע בסיס:</label>
          <select value={baseCurrency} onChange={e => setBaseCurrency(e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="rates-grid">
          {CURRENCIES.filter(c => c !== 'USD').map(c => (
            <div key={c} className="rate-row">
              <span className="rate-label">1 USD =</span>
              <input
                type="number"
                step="0.01"
                value={exchangeRates[c]}
                onChange={e => setExchangeRate(c, e.target.value)}
              />
              <span className="rate-currency">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
