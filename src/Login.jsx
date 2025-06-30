import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { AuthForm } from './components/AuthForm';
import { ToggleAuthText } from './components/ToggleAuthText';

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
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
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
      <AuthForm
        email={email}
        password={password}
        onEmailChange={(e) => setEmail(e.target.value)}
        onPasswordChange={(e) => setPassword(e.target.value)}
        onSubmit={handleAuth}
        isLogin={isLogin}
      />
      <ToggleAuthText isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />
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
};
