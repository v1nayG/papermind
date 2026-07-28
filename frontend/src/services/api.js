const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// We keep a reference to the silentRefresh function from AuthContext
// It's set once on app load via setRefreshHandler()
let refreshHandler = null;
export const setRefreshHandler = (fn) => { refreshHandler = fn; };

// ── Core fetch wrapper with auto token refresh ───────────────
// Every API call goes through here.
// If the server returns 401 (access token expired):
//   1. Calls silentRefresh to get a new access token
//   2. Retries the original request once with the new token
//   3. If refresh also fails → user gets logged out automatically
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response = await fetch(url, { ...options, headers });

  // Access token expired — try to silently refresh
  if (response.status === 401 && refreshHandler) {
    const newToken = await refreshHandler();

    if (newToken) {
      // Retry original request with the new access token
      response = await fetch(url, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      });
    }
  }

  return response;
};

// ── API Methods ──────────────────────────────────────────────
export const api = {
  // Auth (these don't need the authFetch wrapper — no token required)
  register: (email, password) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json()),

  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json()),

  // History (protected — uses authFetch for auto token refresh)
  getHistory: () =>
    authFetch(`${API_BASE}/research/history`).then((r) => r.json()),

  getSession: (id) =>
    authFetch(`${API_BASE}/research/session/${id}`).then((r) => r.json()),

  // Export URLs — opened as downloads, token passed via fetch in ReportView
  getMarkdownUrl: (sessionId) => `${API_BASE}/export/markdown/${sessionId}`,
};
