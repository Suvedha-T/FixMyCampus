// ============================================================
// services/api.js - Frontend API Service using native fetch()
//
// Beginner note:
// Having a centralized API file means our React components don't
// need to repeat HTTP headers, base URLs, or error parsing.
// ============================================================

const BASE_URL = 'http://localhost:5000/api';

/**
 * Reusable wrapper around native fetch() that:
 * 1. Automatically attaches the JWT Bearer token if logged in.
 * 2. Sets Content-Type to application/json.
 * 3. Parses JSON responses and catches API errors.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred while communicating with the server.');
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
}

// ============================================================
// Authentication API
// ============================================================

export async function loginUser(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export async function registerUser(name, email, password) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });

  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export async function getProfile() {
  return request('/auth/me');
}

export async function updateProfile(name, password) {
  const data = await request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name, password })
  });

  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// ============================================================
// Issues API (Used in Stages 5 - 9)
// ============================================================

export async function fetchAllIssues(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.category) params.append('category', filters.category);
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  return request(`/issues${queryStr}`);
}

export async function fetchMyIssues() {
  return request('/my-issues');
}

export async function fetchIssueById(id) {
  return request(`/issues/${id}`);
}

export async function createIssue(issueData) {
  return request('/issues', {
    method: 'POST',
    body: JSON.stringify(issueData)
  });
}

export async function updateIssueStatus(id, status, comment) {
  return request(`/issues/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, comment })
  });
}

export async function assignIssueDepartment(id, department, comment) {
  return request(`/issues/${id}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ department, comment })
  });
}

// ============================================================
// Users & Statistics API (Used in Stages 6 - 8)
// ============================================================

export async function fetchAllUsers() {
  return request('/users');
}

export async function fetchStudentStats() {
  return request('/stats/student');
}

export async function fetchAdminStats() {
  return request('/stats/admin');
}
