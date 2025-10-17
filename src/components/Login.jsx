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
    <>
      <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>
        {formType === 'signIn'
          ? 'ログイン'
          : formType === 'signUp'
          ? '新規登録'
          : '確認コード入力'}
      </h2>

      <input
        id="email"
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="login-input"
      />

      <input
        id="password"
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="login-input"
      />

      {formType === 'confirm' && (
        <input
          id="confirmationCode"
          type="text"
          placeholder="確認コード"
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
          className="login-input"
        />
      )}

      {formType === 'signIn' && (
        <button onClick={handleSignIn} className="login-btn">ログイン</button>
      )}
      {formType === 'signUp' && (
        <button onClick={handleSignUp} className="login-btn">登録</button>
      )}
      {formType === 'confirm' && (
        <button onClick={handleConfirmSignUp} className="login-btn">確認</button>
      )}

      <p style={{ textAlign: 'center', marginTop: '10px' }}>
        {formType === 'signIn' ? (
          <span onClick={() => setFormType('signUp')} className="login-link">
            新規登録はこちら
          </span>
        ) : (
          <span onClick={() => setFormType('signIn')} className="login-link">
            ログインはこちら
          </span>
        )}
      </p>

      {message && <p style={{ color: 'red', textAlign: 'center' }}>{message}</p>}
    </>
  );
};
