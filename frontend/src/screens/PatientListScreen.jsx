import React, { useEffect, useState } from 'react';
import { fetchPatients, deletePatient } from '../api/apiClient.js';
import { PatientCard } from '../components/PatientCard.jsx';
import { theme } from '../styles/theme.js';

export function PatientListScreen() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchPatients();
      setPatients(data);
    } catch (e) {
      setError('Failed to load patients. Make sure the backend is running on port 4000.');
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Refresh every 30 seconds to update POD
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    try {
      await deletePatient(id);
      await load();
    } catch (e) {
      alert('Failed to delete patient');
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div style={{ color: theme.colors.text, textAlign: 'center', padding: 40 }}>
        Loading patients...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          color: theme.colors.danger,
          padding: 20,
          background: theme.card.background,
          borderRadius: theme.card.radius,
          border: theme.card.border
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div>
      {patients.length === 0 ? (
        <div
          style={{
            color: theme.colors.muted,
            textAlign: 'center',
            padding: 40,
            background: theme.card.background,
            borderRadius: theme.card.radius,
            border: theme.card.border
          }}
        >
          No patients yet. Click "+ Add Patient" to get started.
        </div>
      ) : (
        <>
          <div style={{ color: theme.colors.muted, marginBottom: 16, fontSize: 14 }}>
            {patients.length} patient{patients.length !== 1 ? 's' : ''} found
          </div>
          {patients.map((p) => (
            <PatientCard key={p._id} patient={p} onDelete={() => handleDelete(p._id)} />
          ))}
        </>
      )}
    </div>
  );
}
