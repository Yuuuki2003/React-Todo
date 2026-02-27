import { useCallback, useEffect, useMemo, useState } from 'react';
import { signOut } from '@aws-amplify/auth';
import { InputTodo } from '../components/InputTodo';
import { TodoList } from '../components/TodoList';
import {
  addTodoToDynamo,
  deleteTodoFromDynamo,
  fetchTodosFromDynamo,
  updateTodoInDynamo,
} from '../lib/dynamoClient';

export const DynamoTodo = () => {
  const [quickAdd, setQuickAdd] = useState({
    title: '',
    dueDate: '',
    priority: 'medium',
  });
  const [filters, setFilters] = useState({
    q: '',
    status: 'all',
    priority: 'all',
    sort: 'manual',
  });
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const queryParams = useMemo(
    () => ({
      q: filters.q.trim() || undefined,
      status: filters.status === 'all' ? undefined : filters.status,
      priority: filters.priority === 'all' ? undefined : filters.priority,
      sort: filters.sort,
    }),
    [filters]
  );

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await fetchTodosFromDynamo(queryParams);
      if (!Array.isArray(data)) {
        setErrorMessage('ToDo一覧の取得に失敗しました。');
        return;
      }
      setTodos(data);
    } catch (_error) {
      setErrorMessage('ToDo一覧の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  const resetQuickAdd = () => {
    setQuickAdd({
      title: '',
      dueDate: '',
      priority: 'medium',
    });
  };

  useEffect(() => {
    const timer = setTimeout(fetchTodos, filters.q ? 220 : 0);
    return () => clearTimeout(timer);
  }, [fetchTodos, filters.q]);

  const incompleteTodos = todos.filter((todo) => !todo.completed);
  const completeTodos = todos.filter((todo) => todo.completed);

  const onChangeTitle = (event) => {
    setQuickAdd((current) => ({ ...current, title: event.target.value }));
  };

  const onChangeDueDate = (event) => {
    setQuickAdd((current) => ({ ...current, dueDate: event.target.value }));
  };

  const onChangePriority = (event) => {
    setQuickAdd((current) => ({ ...current, priority: event.target.value }));
  };

  const onChangeFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const onClickAdd = async () => {
    const title = quickAdd.title.trim();
    if (!title) return;

    const dueAt = quickAdd.dueDate
      ? new Date(`${quickAdd.dueDate}T23:59:00`).toISOString()
      : null;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await addTodoToDynamo(title, {
        priority: quickAdd.priority,
        dueAt,
        status: 'todo',
      });
      resetQuickAdd();
      await fetchTodos();
    } catch (_error) {
      setErrorMessage('ToDoの追加に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onClickDelete = async (id) => {
    const confirmed = window.confirm('このToDoを削除しますか？');
    if (!confirmed) return;
    setErrorMessage('');
    try {
      await deleteTodoFromDynamo(id);
      await fetchTodos();
    } catch (_error) {
      setErrorMessage('ToDoの削除に失敗しました。');
    }
  };

  const onClickComplete = async (id) => {
    setErrorMessage('');
    try {
      await updateTodoInDynamo(id, { status: 'done' });
      await fetchTodos();
    } catch (_error) {
      setErrorMessage('ToDoの更新に失敗しました。');
    }
  };

  const onClickBack = async (id) => {
    setErrorMessage('');
    try {
      await updateTodoInDynamo(id, { status: 'todo' });
      await fetchTodos();
    } catch (_error) {
      setErrorMessage('ToDoの更新に失敗しました。');
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <>
      <div className="list-header">
        <h1>Todo</h1>
      </div>
      <InputTodo
        title={quickAdd.title}
        dueDate={quickAdd.dueDate}
        priority={quickAdd.priority}
        onTitleChange={onChangeTitle}
        onDueDateChange={onChangeDueDate}
        onPriorityChange={onChangePriority}
        onSubmit={onClickAdd}
        disabled={isSubmitting}
      />
      <div className="list-controls">
        <input
          name="q"
          value={filters.q}
          onChange={onChangeFilter}
          placeholder="検索（タイトル / ノート）"
        />
        <select name="status" value={filters.status} onChange={onChangeFilter}>
          <option value="all">状態: すべて</option>
          <option value="todo">状態: 未着手</option>
          <option value="in_progress">状態: 進行中</option>
          <option value="done">状態: 完了</option>
        </select>
        <select name="priority" value={filters.priority} onChange={onChangeFilter}>
          <option value="all">優先度: すべて</option>
          <option value="low">優先度: 低</option>
          <option value="medium">優先度: 中</option>
          <option value="high">優先度: 高</option>
          <option value="urgent">優先度: 最優先</option>
        </select>
        <select name="sort" value={filters.sort} onChange={onChangeFilter}>
          <option value="manual">並び順: 追加順</option>
          <option value="due_asc">並び順: 期限が近い順</option>
          <option value="priority_desc">並び順: 優先度が高い順</option>
          <option value="created_desc">並び順: 新しい順</option>
        </select>
      </div>
      {errorMessage && <p className="banner banner--error">{errorMessage}</p>}
      {isLoading && <p className="banner banner--loading">読み込み中...</p>}
      <TodoList
        title="未完了のToDo"
        todos={incompleteTodos}
        onComplete={onClickComplete}
        onDelete={onClickDelete}
        variant="incomplete"
      />
      <TodoList
        title="完了のToDo"
        todos={completeTodos}
        onBack={onClickBack}
        onDelete={onClickDelete}
        variant="complete"
      />
      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          ログアウト
        </button>
      </div>
    </>
  );
};
