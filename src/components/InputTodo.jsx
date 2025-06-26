export const InputTodo = (props) => {
  const { todoText, onChange, onClick } = props;

  return (
    <div className="input-area">
      <div className="input-controls">
        <input
          placeholder="TODOを入力"
          value={todoText}
          onChange={onChange}
        />
        <button className="add-button" onClick={onClick}>
          追加
        </button>
      </div>
    </div>
  );
};
