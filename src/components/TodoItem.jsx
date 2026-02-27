const PRIORITY_LABEL = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '最優先',
};

const STATUS_LABEL = {
  todo: '未着手',
  in_progress: '進行中',
  done: '完了',
};

const formatDueDate = (dueAt) => {
  if (!dueAt) return '期限なし';
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return '期限なし';
  return date.toLocaleDateString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
  });
};

export const TodoItem = ({ todo, onComplete, onDelete, onBack }) => {
  const priority = PRIORITY_LABEL[todo.priority] || '中';
  const status = STATUS_LABEL[todo.status] || (todo.completed ? '完了' : '未着手');

  return (
    <li>
      <div className="list-row">
        <div className="todo-item">
          <p className="todo-item__title">{todo.title}</p>
          <div className="todo-item__meta">
            <span className={`badge badge--priority badge--priority-${todo.priority || 'medium'}`}>
              優先度: {priority}
            </span>
            <span className="badge badge--status">{status}</span>
            <span className="badge badge--due">期限: {formatDueDate(todo.dueAt)}</span>
          </div>
        </div>
        <div className="todo-actions">
          {!todo.completed && <button onClick={() => onComplete(todo.id)}>完了</button>}
          {todo.completed && <button onClick={() => onBack(todo.id)}>戻す</button>}
          <button onClick={() => onDelete(todo.id)}>削除</button>
        </div>
      </div>
    </li>
  );
};
