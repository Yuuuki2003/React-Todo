export const AuthForm = ({ email, password, onEmailChange, onPasswordChange, onSubmit, isLogin }) => {
  return (
    <>
      <h2>{isLogin ? 'ログイン' : '新規登録'}</h2>
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={onEmailChange}
        style={styles.input}
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={onPasswordChange}
        style={styles.input}
      />
      <button onClick={onSubmit} style={styles.button}>
        {isLogin ? 'ログイン' : '登録'}
      </button>
    </>
  );
};

const styles = {
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
};
