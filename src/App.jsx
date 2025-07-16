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

  return (
    <div className="App">
      {user ? <DynamoTodo user={user} /> : <Login onLogin={setUser} />}
    </div>
  );
}

export default App;
