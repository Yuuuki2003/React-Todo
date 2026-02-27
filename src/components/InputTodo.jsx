export const InputTodo = ({
  title,
  dueDate,
  priority,
  onTitleChange,
  onDueDateChange,
  onPriorityChange,
  onSubmit,
  disabled,
}) => {
  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="input-area">
      <div className="quick-add">
        <input
          className="quick-add__title"
          placeholder="例) レポート"
          value={title}
          onChange={onTitleChange}
          onKeyDown={onKeyDown}
          disabled={disabled}
        />
        <input
          className="quick-add__date"
          type="date"
          value={dueDate}
          onChange={onDueDateChange}
          disabled={disabled}
        />
        <select
          className="quick-add__priority"
          value={priority}
          onChange={onPriorityChange}
          disabled={disabled}
        >
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
          <option value="urgent">最優先</option>
        </select>
        <button className="add-button" onClick={onSubmit} disabled={disabled}>
          {disabled ? '追加中...' : '追加'}
        </button>
      </div>
    </div>
  );
};
