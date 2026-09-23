// ---------------------------------------------------------------------------
// CREST CECT Data Layer
// Connected directly to the Express + Prisma (SQLite) Backend API via Axios.
// ---------------------------------------------------------------------------

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Intercept requests to attach auth token if present
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('crest_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch {
    // ignore
  }
  return config;
});

// ---------------------------------------------------------------------------
// Research Papers
// ---------------------------------------------------------------------------

export async function getPapers(filters = {}) {
  const params = {};
  if (filters.search) params.search = filters.search;
  if (filters.program && filters.program !== 'all' && filters.program !== 'All CECT') params.program = filters.program;
  if (filters.category) params.category = filters.category;
  if (filters.year) params.year = filters.year;
  if (filters.status) params.status = filters.status;
  if (filters.author) params.author = filters.author;

  const res = await api.get('/papers', { params });
  return res.data;
}

export async function getPaperById(id) {
  const res = await api.get(`/papers/${id}`);
  return res.data;
}

export async function getRelatedPapers(paper, limit = 3) {
  if (!paper) return [];
  const res = await api.get('/papers', {
    params: {
      category: paper.category,
      status: 'approved',
    },
  });
  return res.data.filter((p) => p.id !== paper.id).slice(0, limit);
}

export async function submitPaper(data) {
  const res = await api.post('/papers', data);
  return res.data;
}

export async function updatePaper(id, patch) {
  const res = await api.patch(`/papers/${id}`, patch);
  return res.data;
}

export async function updatePaperStatus(id, status, reviewer = 'Admin', note) {
  const res = await api.patch(`/papers/${id}/status`, { status, reviewer, note });
  return res.data;
}

export async function archivePaper(id, reviewer = 'Administrator') {
  const res = await api.patch(`/papers/${id}/archive`, { reviewer });
  return res.data.ok;
}

// ---------------------------------------------------------------------------
// File Uploads
// ---------------------------------------------------------------------------

export async function uploadPdf(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/upload/pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(filters = {}) {
  const params = {};
  if (filters.program && filters.program !== 'all' && filters.program !== 'All CECT') {
    params.program = filters.program;
  }
  const res = await api.get('/categories', { params });
  return res.data;
}

export async function addCategory(category) {
  const res = await api.post('/categories', category);
  return res.data;
}

export async function deleteCategory(id) {
  try {
    const res = await api.delete(`/categories/${id}`);
    return res.data.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Faculty
// ---------------------------------------------------------------------------

export async function getFaculty() {
  const res = await api.get('/faculty');
  return res.data;
}

export async function getFacultyById(id) {
  const res = await api.get(`/faculty/${id}`);
  return res.data;
}

export async function addFaculty(faculty) {
  const res = await api.post('/faculty', faculty);
  return res.data;
}

export async function updateFaculty(id, patch) {
  const res = await api.patch(`/faculty/${id}`, patch);
  return res.data;
}

export async function deleteFaculty(id) {
  const res = await api.delete(`/faculty/${id}`);
  return res.data.ok;
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

export async function getStudents(filters = {}) {
  const params = {};
  if (filters.accountStatus) params.accountStatus = filters.accountStatus;
  const res = await api.get('/students', { params });
  return res.data;
}

export async function updateStudentAccountStatus(id, accountStatus, reviewer) {
  const res = await api.patch(`/students/${id}/status`, { accountStatus, reviewer });
  return res.data;
}

export async function addStudent(student) {
  const res = await api.post('/students', student);
  return res.data;
}

export async function deleteStudent(id) {
  const res = await api.delete(`/students/${id}`);
  return res.data.ok;
}

export async function getFacultyAccounts(filters = {}) {
  const params = {};
  if (filters.accountStatus) params.accountStatus = filters.accountStatus;
  const res = await api.get('/faculty/accounts', { params });
  return res.data;
}

export async function updateFacultyAccountStatus(id, accountStatus, reviewer) {
  const res = await api.patch(`/faculty/accounts/${id}/status`, { accountStatus, reviewer });
  return res.data;
}

// ---------------------------------------------------------------------------
// Analytics & Activity Feed
// ---------------------------------------------------------------------------

export async function getAnalytics() {
  const res = await api.get('/analytics');
  return res.data;
}

export async function getActivities(limit = 12) {
  const res = await api.get('/analytics/activities', { params: { limit } });
  return res.data;
}

// ---------------------------------------------------------------------------
// Drafts
// ---------------------------------------------------------------------------

export async function saveDraft(draft) {
  const res = await api.post('/drafts', draft);
  return res.data;
}

export async function getDrafts(email) {
  if (!email) return [];
  const res = await api.get('/drafts', { params: { email } });
  return res.data;
}

export async function deleteDraft(id) {
  const res = await api.delete(`/drafts/${id}`);
  return res.data.ok;
}
