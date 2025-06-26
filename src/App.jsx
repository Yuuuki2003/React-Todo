import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Login } from './Login';
import { Todo } from './Todo';


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

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