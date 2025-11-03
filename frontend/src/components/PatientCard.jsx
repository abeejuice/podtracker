import React from 'react';
import { theme } from '../styles/theme.js';

export function PatientCard({ patient, onDelete }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      style={{
        background: theme.card.background,
        border: theme.card.border,
        borderRadius: theme.card.radius,
        padding: 20,
        marginBottom: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'transform 0.2s',
        cursor: 'default'
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ color: theme.colors.text, fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
          {patient.name}
        </div>
        <div style={{ color: theme.colors.muted, fontSize: 14, marginBottom: 4 }}>
          MRN: {patient.mrn}
        </div>
        {patient.surgeryType && (
          <div style={{ color: theme.colors.muted, fontSize: 14, marginBottom: 4 }}>
            {patient.surgeryType}
          </div>
        )}
        <div style={{ color: theme.colors.muted, fontSize: 14 }}>
          OT Date: {formatDate(patient.otDate)}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            color: '#fff',
            background: theme.colors.success,
            padding: '10px 16px',
            borderRadius: 8,
            minWidth: 80,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 16
          }}
        >
          POD {patient.pod}
        </div>
        <button
          onClick={onDelete}
          style={{
            background: theme.colors.danger,
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
