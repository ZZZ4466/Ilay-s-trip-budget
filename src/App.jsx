import { useState } from 'react';
import { useTripData } from './hooks/useTripData';
import TripTab from './components/TripTab';
import SummaryTab from './components/SummaryTab';
import { TRIPS } from './data/initialData';
import './App.css';

const TABS = [
  { id: 'east', label: '🌏 מזרח אסיה' },
  { id: 'southAmerica', label: '🌎 דרום אמריקה' },
  { id: 'summary', label: '📊 סיכום' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('east');
  const {
    state,
    addExpense,
    updateExpense,
    deleteExpense,
    setBudget,
    setExchangeRate,
    setBaseCurrency,
    toBase,
    totalForTrip,
  } = useTripData();

  const trip = TRIPS[activeTab];

  return (
    <div className="app" dir="rtl">
      <header className="app-header">
        <h1 className="app-title">✈️ תקציב הטיול של איילי</h1>
        <p className="app-subtitle">חצי שנה בעולם · מזרח אסיה + דרום אמריקה</p>
      </header>

      <nav className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id && TRIPS[tab.id]
              ? { borderBottomColor: TRIPS[tab.id].color, color: TRIPS[tab.id].color }
              : {}}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {activeTab !== 'summary' ? (
          <TripTab
            key={activeTab}
            trip={trip}
            tripData={state[activeTab]}
            onAdd={partial => addExpense(activeTab, partial)}
            onUpdate={(id, updated) => updateExpense(activeTab, id, updated)}
            onDelete={id => deleteExpense(activeTab, id)}
            onBudgetChange={budget => setBudget(activeTab, budget)}
            toBase={toBase}
            baseCurrency={state.baseCurrency}
          />
        ) : (
          <SummaryTab
            state={state}
            toBase={toBase}
            totalForTrip={totalForTrip}
            setExchangeRate={setExchangeRate}
            setBaseCurrency={setBaseCurrency}
          />
        )}
      </main>
    </div>
  );
}
