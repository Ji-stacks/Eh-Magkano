import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@theme_isDarkMode');
        if (storedTheme !== null) {
          setIsDarkMode(storedTheme === 'true');
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      } finally {
        setIsThemeLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('@theme_isDarkMode', newTheme.toString());
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  // Optionally prevent rendering children until theme is loaded to avoid flicker
  if (!isThemeLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
