import { fetchAuthSession } from '@aws-amplify/auth';

const API_BASE = import.meta.env.VITE_API_BASE;

const getAuthHeader = async () => {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`,
  };
};

// GET: /todos
export const fetchTodosFromDynamo = async (params = {}) => {
  const headers = await getAuthHeader();
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });
  const suffix = query.toString() ? `?${query.toString()}` : '';

  const res = await fetch(`${API_BASE}/todos${suffix}`, {
    method: 'GET',
    headers,
  });
  return res.json();
};

// POST: /todos
export const addTodoToDynamo = async (title, fields = {}) => {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title, ...fields }),
  });
  return res.json();
};

// PUT: /todos/{id}
export const updateTodoInDynamo = async (id, payload) => {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  return res.json();
};

// Backward-compatible helper
export const updateTodoStatusInDynamo = async (id, completed) =>
  updateTodoInDynamo(id, { completed });

// DELETE: /todos/{id}
export const deleteTodoFromDynamo = async (id) => {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'DELETE',
    headers,
  });
  return res.json();
};
