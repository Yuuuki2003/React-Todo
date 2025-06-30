export const TodoItem = ({ todo, onComplete, onDelete, onBack }) => {
  return (
    <li>
      <div className="list-row">
        <p className="todo-item">{todo.title}</p>
        {!todo.completed && <button onClick={() => onComplete(todo.id)}>完了</button>}
        {todo.completed && <button onClick={() => onBack(todo.id)}>戻す</button>}
        <button onClick={() => onDelete(todo.id)}>削除</button>
      </div>
    </li>
  );
};
