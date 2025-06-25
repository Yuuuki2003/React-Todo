import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    setEmail('');
    setPassword('');
  }, [isLogin]);

  const handleAuth = async () => {
    if (!email || !password) {
      alert('メールアドレスとパスワードを入力してください');
      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert('ログイン失敗: ' + error.message);
      }
    } else {
      // ユーザー登録（メール認証不要）
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        // 既に登録済みの場合
        if (signUpError.message.includes('already registered')) {
          alert('このメールアドレスはすでに登録されています');
        } else {
          alert('登録失敗: ' + signUpError.message);
        }
        return;
      }

      alert('登録に成功しました。自動的にログインされました');
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isLogin ? 'ログイン' : '新規登録'}</h2>
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleAuth} style={styles.button}>
        {isLogin ? 'ログイン' : '登録'}
      </button>
      <p onClick={() => setIsLogin(!isLogin)} style={styles.link}>
        {isLogin ? '新規登録はこちら' : 'ログインはこちら'}
      </p>
    </div>
  );
};

const styles = {
  container: {
    width: '320px',
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: '#f4f4f4',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    textAlign: 'center',

    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  input: {
    display: 'block',
    margin: '12px auto',
    width: '90%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box', 
  },
  button: {
    display: 'block',
    margin: '16px auto 0',
    width: '90%',
    padding: '12px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  link: {
    marginTop: '18px',
    color: '#4f46e5',
    fontWeight: '500',
    fontSize: '14px',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};
