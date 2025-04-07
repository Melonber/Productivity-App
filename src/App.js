import React, { useState, useEffect } from 'react';
import { auth } from './firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import MainPage from './MainPage';
import WelcomePage from './WelcomePage';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    setUser(null); // Сбрасываем состояние пользователя
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? (
    <MainPage onLogout={handleLogout} />
  ) : (
    <WelcomePage onLoginSuccess={() => setUser(auth.currentUser)} />
  );
};

export default App;