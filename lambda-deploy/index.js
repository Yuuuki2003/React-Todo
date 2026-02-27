const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TODO_TABLE_NAME || 'todos';

const ALLOWED_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const ALLOWED_STATUS = ['todo', 'in_progress', 'done'];
const PRIORITY_WEIGHT = { low: 1, medium: 2, high: 3, urgent: 4 };

class ValidationError extends Error {}

exports.handler = async (event) => {
  const method = (event.httpMethod || '').toUpperCase();
  const path = normalizePath(event.path);
  const user = getUserFromEvent(event);

  if (!method || !path || !user) {
    console.error('Invalid request context:', JSON.stringify(event));
    return response(400, { error: 'Invalid request context' });
  }

  try {
    if (method === 'GET' && path === '/todos') {
      const query = event.queryStringParameters || {};
      return await handleGetTodos(user, query);
    }

    if (method === 'POST' && path === '/todos') {
      const payload = parseJsonBody(event.body);
      return await handleCreateTodo(user, payload);
    }

    const todoId = extractTodoId(path);

    if (method === 'PUT' && todoId) {
      const payload = parseJsonBody(event.body);
      return await handleUpdateTodo(user, todoId, payload);
    }

    if (method === 'DELETE' && todoId) {
      return await handleDeleteTodo(user, todoId);
    }

    return response(400, { error: 'Unsupported operation' });
  } catch (error) {
    if (error instanceof ValidationError) {
      return response(400, { error: error.message });
    }

    console.error('Unhandled error:', error);
    return response(500, { error: error.message || 'Internal server error' });
  }
};

async function handleGetTodos(user, query) {
  const data = await docClient
    .query({
      TableName: TABLE_NAME,
      KeyConditionExpression: '#u = :u',
      ExpressionAttributeNames: {
        '#u': 'user',
      },
      ExpressionAttributeValues: {
        ':u': user,
      },
    })
    .promise();

  let items = (data.Items || []).map((item) => normalizeTodoRecord(item));

  items = filterByStatus(items, query.status);
  items = filterByPriority(items, query.priority);
  items = filterByTag(items, query.tag);
  items = filterBySearch(items, query.q);
  items = filterByDueRange(items, query.due || query.dueRange);
  items = sortTodos(items, query.sort || 'manual');

  return response(200, items);
}

async function handleCreateTodo(user, payload) {
  const now = new Date().toISOString();
  const title = parseTitle(payload.title);

  const statusFromBody = parseStatus(payload.status, 'todo');
  const completedFromBody = parseOptionalBoolean(payload.completed);
  const status =
    completedFromBody === null
      ? statusFromBody
      : completedFromBody
      ? 'done'
      : 'todo';

  const item = normalizeTodoRecord({
    user,
    id: buildTodoId(),
    title,
    note: parseNote(payload.note, ''),
    tags: parseTags(payload.tags, []),
    priority: parsePriority(payload.priority, 'medium'),
    status,
    dueAt: parseDueAt(payload.dueAt, null),
    estimatedMin: parseNonNegativeNumber(payload.estimatedMin, 0, 'estimatedMin'),
    order: parseNonNegativeNumber(payload.order, Date.now(), 'order'),
    createdAt: now,
    updatedAt: now,
    completedAt: status === 'done' ? now : null,
  });

  await docClient
    .put({
      TableName: TABLE_NAME,
      Item: item,
    })
    .promise();

  return response(200, item);
}

async function handleUpdateTodo(user, id, payload) {
  const current = await docClient
    .get({
      TableName: TABLE_NAME,
      Key: { user, id },
    })
    .promise();

  if (!current.Item) {
    return response(404, { error: 'Todo not found' });
  }

  const base = normalizeTodoRecord(current.Item);
  const now = new Date().toISOString();

  const next = {
    ...base,
    title: parseTitle(payload.title, base.title),
    note: parseNote(payload.note, base.note),
    tags: parseTags(payload.tags, base.tags),
    priority: parsePriority(payload.priority, base.priority),
    status: parseStatus(payload.status, base.status),
    dueAt: parseDueAt(payload.dueAt, base.dueAt),
    estimatedMin: parseNonNegativeNumber(
      payload.estimatedMin,
      base.estimatedMin,
      'estimatedMin'
    ),
    order: parseNonNegativeNumber(payload.order, base.order, 'order'),
    updatedAt: now,
  };

  const completedFromBody = parseOptionalBoolean(payload.completed);
  if (completedFromBody !== null) {
    next.status = completedFromBody ? 'done' : 'todo';
  }

  if (next.status === 'done') {
    next.completedAt = base.status === 'done' ? base.completedAt || now : now;
  } else {
    next.completedAt = null;
  }

  const normalized = normalizeTodoRecord(next);

  await docClient
    .put({
      TableName: TABLE_NAME,
      Item: normalized,
    })
    .promise();

  return response(200, normalized);
}

async function handleDeleteTodo(user, id) {
  await docClient
    .delete({
      TableName: TABLE_NAME,
      Key: { user, id },
    })
    .promise();

  return response(200, { id });
}

function normalizeTodoRecord(item) {
  const fallbackTimestamp = inferTimestampFromId(item.id);
  const createdAt = isIsoDate(item.createdAt)
    ? item.createdAt
    : new Date(fallbackTimestamp).toISOString();
  const updatedAt = isIsoDate(item.updatedAt) ? item.updatedAt : createdAt;

  let status = ALLOWED_STATUS.includes(item.status)
    ? item.status
    : item.completed === true
    ? 'done'
    : 'todo';

  let completedAt = isIsoDate(item.completedAt) ? item.completedAt : null;
  if (status === 'done' && !completedAt) {
    completedAt = updatedAt;
  }
  if (status !== 'done') {
    completedAt = null;
  }

  return {
    user: String(item.user || ''),
    id: String(item.id || buildTodoId()),
    title: parseTitle(item.title, 'Untitled task'),
    note: parseNote(item.note, ''),
    tags: parseTags(item.tags, []),
    priority: parsePriority(item.priority, 'medium'),
    status,
    dueAt: parseDueAt(item.dueAt, null),
    estimatedMin: parseNonNegativeNumber(item.estimatedMin, 0, 'estimatedMin'),
    order: parseNonNegativeNumber(item.order, fallbackTimestamp, 'order'),
    createdAt,
    updatedAt,
    completedAt,
    completed: status === 'done',
  };
}

function filterByStatus(items, statusParam) {
  if (!statusParam) return items;
  const statusSet = new Set(
    String(statusParam)
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0)
  );

  for (const status of statusSet) {
    if (!ALLOWED_STATUS.includes(status)) {
      throw new ValidationError(`Invalid status filter: ${status}`);
    }
  }

  return items.filter((item) => statusSet.has(item.status));
}

function filterByPriority(items, priorityParam) {
  if (!priorityParam) return items;

  const prioritySet = new Set(
    String(priorityParam)
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0)
  );

  for (const priority of prioritySet) {
    if (!ALLOWED_PRIORITIES.includes(priority)) {
      throw new ValidationError(`Invalid priority filter: ${priority}`);
    }
  }

  return items.filter((item) => prioritySet.has(item.priority));
}

function filterByTag(items, tagParam) {
  if (!tagParam) return items;
  const tag = String(tagParam).trim().toLowerCase();
  if (!tag) return items;

  return items.filter((item) =>
    item.tags.some((candidate) => candidate.toLowerCase() === tag)
  );
}

function filterBySearch(items, queryParam) {
  if (!queryParam) return items;

  const keyword = String(queryParam).trim().toLowerCase();
  if (!keyword) return items;

  return items.filter((item) => {
    const title = item.title.toLowerCase();
    const note = item.note.toLowerCase();
    return title.includes(keyword) || note.includes(keyword);
  });
}

function filterByDueRange(items, dueRange) {
  if (!dueRange) return items;

  const mode = String(dueRange).trim().toLowerCase();
  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);
  const startOfNextWeek = new Date(startOfToday);
  startOfNextWeek.setUTCDate(startOfNextWeek.getUTCDate() + 7);

  if (mode === 'overdue') {
    return items.filter((item) => item.dueAt && new Date(item.dueAt) < startOfToday);
  }

  if (mode === 'today') {
    return items.filter(
      (item) =>
        item.dueAt &&
        new Date(item.dueAt) >= startOfToday &&
        new Date(item.dueAt) < startOfTomorrow
    );
  }

  if (mode === 'this_week') {
    return items.filter(
      (item) =>
        item.dueAt &&
        new Date(item.dueAt) >= startOfToday &&
        new Date(item.dueAt) < startOfNextWeek
    );
  }

  if (mode === 'no_due') {
    return items.filter((item) => !item.dueAt);
  }

  throw new ValidationError(`Invalid due range filter: ${mode}`);
}

function sortTodos(items, sortKey) {
  const result = [...items];

  if (sortKey === 'created_desc') {
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (sortKey === 'priority_desc') {
    return result.sort((a, b) => {
      const weightDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      if (weightDiff !== 0) return weightDiff;
      return b.order - a.order;
    });
  }

  if (sortKey === 'due_asc') {
    return result.sort((a, b) => {
      if (!a.dueAt && !b.dueAt) return a.order - b.order;
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      const dueDiff = new Date(a.dueAt) - new Date(b.dueAt);
      if (dueDiff !== 0) return dueDiff;
      return a.order - b.order;
    });
  }

  if (sortKey === 'manual') {
    return result.sort((a, b) => {
      const orderDiff = a.order - b.order;
      if (orderDiff !== 0) return orderDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  throw new ValidationError(`Invalid sort option: ${sortKey}`);
}

function normalizePath(path) {
  if (!path) return '';
  return String(path).split('?')[0];
}

function extractTodoId(path) {
  const match = path.match(/^\/todos\/([^/]+)$/);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}

function getUserFromEvent(event) {
  return (
    event.requestContext?.authorizer?.claims?.sub ||
    event.requestContext?.authorizer?.jwt?.claims?.sub ||
    null
  );
}

function parseJsonBody(body) {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch (_error) {
    throw new ValidationError('Invalid JSON body');
  }
}

function parseOptionalBoolean(value) {
  if (value === undefined) return null;
  if (typeof value !== 'boolean') {
    throw new ValidationError('completed must be boolean when provided');
  }
  return value;
}

function parseTitle(value, fallback) {
  if (value === undefined) {
    if (fallback !== undefined) return fallback;
    throw new ValidationError('title is required');
  }

  if (typeof value !== 'string') {
    throw new ValidationError('title must be a string');
  }

  const title = value.trim();
  if (!title) {
    throw new ValidationError('title is required');
  }

  if (title.length > 120) {
    throw new ValidationError('title must be 120 characters or less');
  }

  return title;
}

function parseNote(value, fallback) {
  if (value === undefined) return fallback;
  if (value === null) return '';
  if (typeof value !== 'string') {
    throw new ValidationError('note must be a string');
  }
  return value.slice(0, 2000);
}

function parseTags(value, fallback) {
  if (value === undefined) return fallback;
  if (value === null) return [];
  if (!Array.isArray(value)) {
    throw new ValidationError('tags must be an array');
  }

  return value
    .filter((tag) => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 10)
    .map((tag) => tag.slice(0, 20));
}

function parsePriority(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string') {
    throw new ValidationError('priority must be a string');
  }

  const priority = value.toLowerCase().trim();
  if (!ALLOWED_PRIORITIES.includes(priority)) {
    throw new ValidationError(`priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}`);
  }

  return priority;
}

function parseStatus(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string') {
    throw new ValidationError('status must be a string');
  }

  const status = value.toLowerCase().trim();
  if (!ALLOWED_STATUS.includes(status)) {
    throw new ValidationError(`status must be one of: ${ALLOWED_STATUS.join(', ')}`);
  }

  return status;
}

function parseDueAt(value, fallback) {
  if (value === undefined) return fallback;
  if (value === null || value === '') return null;
  if (typeof value !== 'string' || !isIsoDate(value)) {
    throw new ValidationError('dueAt must be ISO-8601 datetime or null');
  }
  return value;
}

function parseNonNegativeNumber(value, fallback, fieldName) {
  if (value === undefined || value === null || value === '') return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new ValidationError(`${fieldName} must be a non-negative number`);
  }
  return Math.floor(numeric);
}

function isIsoDate(value) {
  if (typeof value !== 'string') return false;
  const time = Date.parse(value);
  return Number.isFinite(time);
}

function buildTodoId() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function inferTimestampFromId(id) {
  const raw = String(id || '');
  const first13 = raw.slice(0, 13);
  const parsed = Number(first13);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return Date.now();
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}
