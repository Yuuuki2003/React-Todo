import { useState, useEffect } from 'react';
import { signOut } from '@aws-amplify/auth';
import { InputTodo } from '../components/InputTodo';
import { TodoList } from '../components/TodoList';
import {
  fetchTodosFromDynamo,
  addTodoToDynamo,
  deleteTodoFromDynamo,
  updateTodoStatusInDynamo,
} from '../lib/dynamoClient';

export const DynamoTodo = () => {
  const [todoText, setTodoText] = useState('');
  const [incompleteTodos, setIncompleteTodos] = useState([]);
  const [completeTodos, setCompleteTodos] = useState([]);

  const fetchTodos = async () => {
    const data = await fetchTodosFromDynamo();
    if (!Array.isArray(data)) return;
    setIncompleteTodos(data.filter((todo) => !todo.completed));
    setCompleteTodos(data.filter((todo) => todo.completed));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const onChangeTodoText = (e) => setTodoText(e.target.value);

  const onClickAdd = async () => {
    if (!todoText) return;
    await addTodoToDynamo(todoText);
    setTodoText('');
    fetchTodos();
  };

  const onClickDelete = async (id) => {
    await deleteTodoFromDynamo(id);
    fetchTodos();
  };

  const onClickComplete = async (id) => {
    await updateTodoStatusInDynamo(id, true);
    fetchTodos();
  };

  const onClickBack = async (id) => {
    await updateTodoStatusInDynamo(id, false);
    fetchTodos();
  };

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <>
      <InputTodo
        todoText={todoText}
        onChange={onChangeTodoText}
        onClick={onClickAdd}
      />
      <TodoList
        title="未完了のToDo"
        todos={incompleteTodos}
        onComplete={onClickComplete}
        onDelete={onClickDelete}
      />
      <TodoList
        title="完了のToDo"
        todos={completeTodos}
        onBack={onClickBack}
        onDelete={onClickDelete}
      />
      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          ログアウト
        </button>
      </div>
    </>
  );
};
