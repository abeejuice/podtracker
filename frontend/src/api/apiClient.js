import axios from 'axios';

/**
 * API Client Configuration
 *
 * baseURL behavior:
 * - Development (local): Set VITE_API_BASE_URL=http://localhost:4000 in .env
 * - Production (Netlify): Empty string '' uses relative paths
 *
 * Since all API calls include '/api/patients', we need:
 * - Local: 'http://localhost:4000' + '/api/patients' = http://localhost:4000/api/patients ✅
 * - Netlify: '' + '/api/patients' = /api/patients (caught by netlify.toml redirect) ✅
 *
 * IMPORTANT: Do NOT use '/api' as baseURL, or you'll get '/api/api/patients' ❌
 */
const baseURL = import.meta.env?.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout for requests
});

export async function fetchPatients() {
  const { data } = await api.get('/api/patients');
  return data;
}

export async function createPatient(payload) {
  const { data } = await api.post('/api/patients', payload);
  return data;
}

export async function updatePatient(id, payload) {
  const { data } = await api.put(`/api/patients/${id}`, payload);
  return data;
}

export async function deletePatient(id) {
  const { data } = await api.delete(`/api/patients/${id}`);
  return data;
}

