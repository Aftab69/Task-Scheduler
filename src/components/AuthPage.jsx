import { useState } from 'react';
import Login from './Login';
import Register from './Register';

function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const switchToRegister = () => {
    setIsLoginMode(false);
  };

  const switchToLogin = () => {
    setIsLoginMode(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-content">
          {isLoginMode ? (
            <Login onSwitchToRegister={switchToRegister} />
          ) : (
            <Register onSwitchToLogin={switchToLogin} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;