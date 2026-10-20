import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import './theme-toggle.scss';

export const ThemeToggle = ({ variant = 'icon', className = '' }) => {
  const { isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div className={`theme-segmented-switch ${className}`}>
        <button
          type="button"
          className={`theme-option-btn ${isDark ? 'active' : ''}`}
          onClick={() => setTheme('dark')}
          aria-label="Dark Mode"
        >
          <FiMoon size={15} className="moon-icon" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          className={`theme-option-btn ${!isDark ? 'active' : ''}`}
          onClick={() => setTheme('light')}
          aria-label="Light Mode"
        >
          <FiSun size={15} className="sun-icon" />
          <span>Light</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`theme-toggle-icon-btn ${className}`}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      {isDark ? (
        <FiSun size={18} className="theme-icon sun-icon" />
      ) : (
        <FiMoon size={18} className="theme-icon moon-icon" />
      )}
    </button>
  );
};

export default ThemeToggle;
