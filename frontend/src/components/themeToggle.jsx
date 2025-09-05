import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  
  console.log('ThemeToggle - isDark:', isDark);

  return (
    <button
      onClick={() => {
        console.log('Theme toggle clicked, current isDark:', isDark);
        console.log('HTML has dark class:', document.documentElement.classList.contains('dark'));
        toggleTheme();
        setTimeout(() => {
          console.log('After toggle - isDark:', !isDark);
          console.log('After toggle - HTML has dark class:', document.documentElement.classList.contains('dark'));
        }, 100);
      }}
      className={`p-2 rounded-full transition-colors duration-300 ${
        isDark ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;