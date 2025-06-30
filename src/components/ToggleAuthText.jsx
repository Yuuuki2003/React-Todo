export const ToggleAuthText = ({ isLogin, onToggle }) => {
  return (
    <p onClick={onToggle} style={styles.link}>
      {isLogin ? '新規登録はこちら' : 'ログインはこちら'}
    </p>
  );
};

const styles = {
  link: {
    marginTop: '18px',
    color: '#4f46e5',
    fontWeight: '500',
    fontSize: '14px',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};
