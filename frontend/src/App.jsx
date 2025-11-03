import React, { useEffect, useState } from 'react';
import { PatientListScreen } from './screens/PatientListScreen.jsx';
import { AddPatientScreen } from './screens/AddPatientScreen.jsx';
import { theme } from './styles/theme.js';

export default function App() {
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial';
    document.body.style.background = theme.colors.background;
  }, []);

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ color: theme.colors.primary, margin: 0 }}>POD Tracker</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            background: theme.colors.primary,
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}
        >
          {showAdd ? '← View Patients' : '+ Add Patient'}
        </button>
      </header>
      <main>
        {showAdd ? <AddPatientScreen onDone={() => setShowAdd(false)} /> : <PatientListScreen />}
      </main>
    </div>
  );
}
