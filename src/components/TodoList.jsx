import { TodoItem } from './TodoItem';

export const TodoList = ({ title, todos, onComplete, onDelete, onBack, variant }) => {
  return (
    <div className={variant === 'incomplete' ? 'incomplete-area' : 'complete-area'}>
      <p className="title">{title}</p>
      {todos.length === 0 ? (
        <p className="empty-message">該当するToDoはありません。</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onComplete={onComplete}
              onDelete={onDelete}
              onBack={onBack}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
