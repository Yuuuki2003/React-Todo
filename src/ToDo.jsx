import { useState } from 'react';
import './App.css';
import { InputTodo } from './components/InputTodo';

export const ToDo = () => {
  const [todoText, setTodoText] = useState("");
  const [incompleteTodos, setIncompleteTodos] = useState([]);
  const [completeTodos, setCompleteTodos] = useState([]);

  const onChangeTodoText = (event) => setTodoText(event.target.value);

  const onClickAdd = () => {
    if (todoText === "") return;
    const newTodos = [...incompleteTodos, todoText];
    setIncompleteTodos(newTodos);
    setTodoText("");
  };

  const onClickDelete = (index) => {
    const newTodos = [...incompleteTodos];
    newTodos.splice(index, 1);
    setIncompleteTodos(newTodos);
  };

  const onClickComplete = (index) => {
    const newIncompleteTodos = [...incompleteTodos];
    newIncompleteTodos.splice(index,1);

    const newCompleteTodos = [...completeTodos,incompleteTodos[index]];
    setIncompleteTodos(newIncompleteTodos);
    setCompleteTodos(newCompleteTodos);
  };

  const onClickBack = (index) => {
    const newCompleteTodos = [...completeTodos];
    newCompleteTodos.splice(index,1);

    const newIncompleteTodos = [...incompleteTodos,completeTodos[index]]
    setIncompleteTodos(newIncompleteTodos);
    setCompleteTodos(newCompleteTodos);
  }

 const onClickDeleteComplete = (index) => {
    const newCompleteTodos = [...completeTodos];
    newCompleteTodos.splice(index, 1);
    setCompleteTodos(newCompleteTodos);
  };

  return (
    <>
      <InputTodo 
        todoText={todoText} 
        onChange={onChangeTodoText} 
        onClick={onClickAdd}
      />
      <div className="incomplete-area">
        <p className='title'>未完了のToDo</p>
        <ul>
          {incompleteTodos.map((todo, index) => (
            <li key={index}>
              <div className='list-row'>
                <p className='todo-item'>{todo}</p>
                <button onClick={() => onClickComplete(index)}>完了</button>
                <button onClick={() => onClickDelete(index)}>削除</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 完了のToDo */}
      <div className="complete-area">
        <p className='title'>完了のToDo</p>
        <ul>
          {completeTodos.map((todo, index) => (
            <li key={index}>
              <div className='list-row'>
                <p className='todo-item'>{todo}</p>
                <button onClick={() => onClickBack(index)}>戻す</button>
                <button onClick={() => onClickDeleteComplete(index)}>削除</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
