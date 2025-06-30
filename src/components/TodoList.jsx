import { TodoItem } from './TodoItem';

export const TodoList = ({ title, todos, onComplete, onDelete, onBack }) => {
  return (
    <div className={title.includes('未完了') ? 'incomplete-area' : 'complete-area'}>
      <p className="title">{title}</p>
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
    </div>
  );
};
