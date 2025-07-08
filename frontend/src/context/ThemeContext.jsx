import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Recuperar tema del localStorage o usar preferencias del sistema
    const savedTheme = localStorage.getItem('gym-theme');
    if (savedTheme) return savedTheme;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('gym-primary-color') || '#3b82f6';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('gym-theme', newTheme);
  };

  const updatePrimaryColor = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('gym-primary-color', color);
    
    // Actualizar CSS custom properties
    document.documentElement.style.setProperty('--primary-color', color);
  };

  useEffect(() => {
    // Aplicar tema al documento
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Aplicar color primario
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }, [theme, primaryColor]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      primaryColor, 
      updatePrimaryColor 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};