import { useEffect, useState } from 'react';
import { InputTodo } from './components/InputTodo';
import { TodoList } from './components/TodoList';
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
    if (!todoText) return;
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
        <button
          className="logout-button"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.reload();
          }}
        >
          ログアウト
        </button>
      </div>
    </>
  );
};
