import './App.css';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@aws-amplify/auth';
import { DynamoTodo } from './dynamo/DynamoTodo';
import { Login } from './components/Login';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const appClass = user ? 'App' : 'App App--center';

  return (
    <div className={appClass}>
      {user ? (
        <DynamoTodo user={user} />
      ) : (
        <div className="login-card">
          <Login onLogin={setUser} />
        </div>
      )}
    </div>
  );
}

export default App;
