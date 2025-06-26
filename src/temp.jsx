import { useEffect, useState } from 'react';
import { InputTodo } from './components/InputTodo';
import { supabase } from './lib/supabaseClient';

export const Todo = ({ user }) => {
  const [todoText, setTodoText] = useState('');
  const [incompleteTodos, setIncompleteTodos] = useState([]);
  const [completeTodos, setCompleteTodos] = useState([]);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('取得失敗:', error);
    } else {
      setIncompleteTodos(data.filter((todo) => !todo.completed));
      setCompleteTodos(data.filter((todo) => todo.completed));
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const onChangeTodoText = (e) => setTodoText(e.target.value);

  const onClickAdd = async () => {
    if (todoText === '') return;
    const { error } = await supabase.from('todos').insert([
      {
        title: todoText,
        completed: false,
        user_id: user.id,
      },
    ]);
    if (!error) {
      setTodoText('');
      fetchTodos();
    }
  };

  const onClickDelete = async (id) => {
    await supabase.from('todos').delete().eq('id', id);
    fetchTodos();
  };

  const onClickComplete = async (id) => {
    await supabase.from('todos').update({ completed: true }).eq('id', id);
    fetchTodos();
  };

  const onClickBack = async (id) => {
    await supabase.from('todos').update({ completed: false }).eq('id', id);
    fetchTodos();
  };

  return (
    <>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.reload();
        }}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '8px 16px',
          backgroundColor: '#f87171',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ログアウト
      </button>

      <InputTodo
        todoText={todoText}
        onChange={onChangeTodoText}
        onClick={onClickAdd}
      />

      <div className="incomplete-area">
        <p className="title">未完了のToDo</p>
        <ul>
          {incompleteTodos.map((todo) => (
            <li key={todo.id}>
              <div className="list-row">
                <p className="todo-item">{todo.title}</p>
                <button onClick={() => onClickComplete(todo.id)}>完了</button>
                <button onClick={() => onClickDelete(todo.id)}>削除</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="complete-area">
        <p className="title">完了のToDo</p>
        <ul>
          {completeTodos.map((todo) => (
            <li key={todo.id}>
              <div className="list-row">
                <p className="todo-item">{todo.title}</p>
                <button onClick={() => onClickBack(todo.id)}>戻す</button>
                <button onClick={() => onClickDelete(todo.id)}>削除</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
