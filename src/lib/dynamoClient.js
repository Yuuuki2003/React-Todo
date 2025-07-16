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
export const fetchTodosFromDynamo = async () => {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/todos`, {
    method: 'GET',
    headers,
  });
  return res.json();
};

// POST: /todos
export const addTodoToDynamo = async (title) => {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title }),
  });
  return res.json();
};

// PUT: /todos/{id}
export const updateTodoStatusInDynamo = async (id, completed) => {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ completed }),
  });
  return res.json();
};

// DELETE: /todos/{id}
export const deleteTodoFromDynamo = async (id) => {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'DELETE',
    headers,
  });
  return res.json();
};
