import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { EditorPage } from './pages/EditorPage';
import { StudioPage } from './pages/StudioPage';
import { ImageStudioPage } from './pages/ImageStudioPage';
import { LoginPage } from './pages/LoginPage';
import { getAuthState } from './services/authService';
import './styles/index.css';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const state = getAuthState();
    if (state.isAuthenticated) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<CreateProjectPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/image-studio" element={<ImageStudioPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
