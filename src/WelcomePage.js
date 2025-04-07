import React, { useState } from 'react';
import { auth } from './firebase-config'; // Предполагается, что у вас есть файл с настройками Firebase
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  GlobalStyle,
  AppContainer,
  Header,
  Title,
  HeaderButton,
  FormGroup,
  FormLabel,
  FormInput,
  ControlButton,
  ModalContent,
  ModalTitle
} from './styles/styles';

const WelcomePage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Вход
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Регистрация
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Неверный формат email';
      case 'auth/user-disabled':
        return 'Пользователь заблокирован';
      case 'auth/user-not-found':
        return 'Пользователь не найден';
      case 'auth/wrong-password':
        return 'Неверный пароль';
      case 'auth/email-already-in-use':
        return 'Email уже используется';
      case 'auth/weak-password':
        return 'Пароль должен содержать минимум 6 символов';
      default:
        return 'Ошибка аутентификации';
    }
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Title>Productivity App</Title>
        </Header>

        <ModalContent style={{ maxWidth: '400px', margin: '50px auto' }}>
          <ModalTitle>{isLogin ? 'Вход' : 'Регистрация'}</ModalTitle>
          
          {error && <div style={{ color: '#ff6464', marginBottom: '15px' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel>Email</FormLabel>
              <FormInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Пароль</FormLabel>
              <FormInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
                minLength="6"
              />
            </FormGroup>
            
            <ControlButton 
              type="submit" 
              primary 
              disabled={loading}
              style={{ width: '100%', marginTop: '15px' }}
            >
              {loading ? (
                'Загрузка...'
              ) : isLogin ? (
                'Войти'
              ) : (
                'Зарегистрироваться'
              )}
            </ControlButton>
          </form>
          
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#c6d4df' }}>
            {isLogin ? (
              <>
                Нет аккаунта?{' '}
                <button 
                  onClick={() => setIsLogin(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#67c1f5',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button 
                  onClick={() => setIsLogin(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#67c1f5',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Войти
                </button>
              </>
            )}
          </div>
        </ModalContent>
      </AppContainer>
    </>
  );
};

export default WelcomePage;