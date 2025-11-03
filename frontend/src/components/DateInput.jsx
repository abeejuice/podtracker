import React from 'react';
import { theme } from '../styles/theme.js';

export function DateInput({ value, onChange, label, required }) {
  return (
    <label style={{ color: theme.colors.text, display: 'block' }}>
      <div style={{ marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
        {label} {required && <span style={{ color: theme.colors.danger }}>*</span>}
      </div>
      <input
        type="date"
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
