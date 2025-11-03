import React, { useState } from 'react';
import { createPatient } from '../api/apiClient.js';
import { DateInput } from '../components/DateInput.jsx';
import { theme } from '../styles/theme.js';

export function AddPatientScreen({ onDone }) {
  const [name, setName] = useState('');
  const [mrn, setMrn] = useState('');
  const [surgeryType, setSurgeryType] = useState('');
  const [otDate, setOtDate] = useState('');
  const [surgeon, setSurgeon] = useState('');
  const [unit, setUnit] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await createPatient({ name, mrn, surgeryType, otDate, surgeon, unit });
      // Reset form
      setName('');
      setMrn('');
      setSurgeryType('');
      setOtDate('');
      setSurgeon('');
      setUnit('');
      onDone?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient. Please try again.');
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        background: theme.card.background,
        border: theme.card.border,
        borderRadius: theme.card.radius,
        padding: 24,
        maxWidth: 600
      }}
    >
      <h2 style={{ color: theme.colors.text, marginTop: 0, marginBottom: 20 }}>Add New Patient</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div
            style={{
              color: theme.colors.danger,
              padding: 12,
              background: '#dc262620',
              borderRadius: 8,
              fontSize: 14
            }}
          >
            {error}
          </div>
        )}
        <Input label="Name" value={name} onChange={setName} required />
        <Input label="MRN" value={mrn} onChange={setMrn} required />
        <Input label="Surgery Type" value={surgeryType} onChange={setSurgeryType} />
        <DateInput label="OT Date" value={otDate} onChange={setOtDate} required />
        <Input label="Surgeon" value={surgeon} onChange={setSurgeon} />
        <Input label="Unit" value={unit} onChange={setUnit} />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            disabled={saving || !name || !mrn || !otDate}
            style={{
              background: theme.colors.primary,
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              cursor: saving || !name || !mrn || !otDate ? 'not-allowed' : 'pointer',
              opacity: saving || !name || !mrn || !otDate ? 0.6 : 1,
              fontSize: 14,
              fontWeight: 500,
              flex: 1
            }}
          >
            {saving ? 'Saving...' : 'Save Patient'}
          </button>
          <button
            type="button"
            onClick={onDone}
            style={{
              background: 'transparent',
              color: theme.colors.text,
              border: `1px solid ${theme.card.border}`,
              padding: '12px 24px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, required }) {
  return (
    <label style={{ color: theme.colors.text, display: 'block' }}>
      <div style={{ marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
        {label} {required && <span style={{ color: theme.colors.danger }}>*</span>}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          padding: '12px 14px',
          borderRadius: 8,
          border: `1px solid ${theme.card.border}`,
          background: '#0f1430',
          color: theme.colors.text,
          width: '100%',
          fontSize: 14,
          boxSizing: 'border-box'
        }}
      />
    </label>
  );
}
