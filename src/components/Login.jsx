import { useState } from 'react';
import { signIn, confirmSignUp, signUp } from '@aws-amplify/auth';

export const Login = ({ onLogin }) => {
  const [formType, setFormType] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [message, setMessage] = useState('');

  const handleSignIn = async () => {
    try {
      const user = await signIn({ username: email, password });
      onLogin(user);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp({ username: email, password });
      setFormType('confirm');
      setMessage('確認コードを入力してください。');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleConfirmSignUp = async () => {
    try {
      await confirmSignUp({ username: email, confirmationCode });
      setFormType('signIn');
      setMessage('サインアップが完了しました。ログインしてください。');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '40px' }}>
      <div style={{
        width: '320px',
        padding: '30px',
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center' }}>
          {formType === 'signIn' ? 'ログイン' : formType === 'signUp' ? '新規登録' : '確認コード入力'}
        </h2>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '6px', border: '1px solid #ccc' }}
        />

        <input
          id="password"
          name="password"
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '6px', border: '1px solid #ccc' }}
        />

        {formType === 'confirm' && (
          <input
            id="confirmationCode"
            name="confirmationCode"
            type="text"
            placeholder="確認コード"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        )}

        {formType === 'signIn' && <button onClick={handleSignIn} style={buttonStyle}>ログイン</button>}
        {formType === 'signUp' && <button onClick={handleSignUp} style={buttonStyle}>登録</button>}
        {formType === 'confirm' && <button onClick={handleConfirmSignUp} style={buttonStyle}>確認</button>}

        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          {formType === 'signIn' ? (
            <span onClick={() => setFormType('signUp')} style={{ color: 'blue', cursor: 'pointer' }}>
              新規登録はこちら
            </span>
          ) : (
            <span onClick={() => setFormType('signIn')} style={{ color: 'blue', cursor: 'pointer' }}>
              ログインはこちら
            </span>
          )}
        </p>

        {message && <p style={{ color: 'red', textAlign: 'center' }}>{message}</p>}
      </div>
    </div>
  );
};

const buttonStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#5a4bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '10px'
};
