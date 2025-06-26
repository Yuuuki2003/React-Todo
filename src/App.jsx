import './App.css';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Login } from './Login';
import { Todo } from './Todo';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ログイン中のユーザーを取得
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // 認証状態の変化を監視
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // クリーンアップ
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="App">
      {user ? <Todo user={user} /> : <Login />}
    </div>
  );
}

export default App;
