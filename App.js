import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';

import HomeScreen from './src/screens/HomeScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import WelcomeScreen from './src/screens/WelcomeScreen'; // <--- Imported
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import { ThemeProvider } from './src/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

function MainApp() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  
  // NEW: State to track if the welcome animation has finished
  const [welcomeShown, setWelcomeShown] = useState(false);
  
  // NEW: Locks the screen on Signup until verification is done
  const [isRegistering, setIsRegistering] = useState(false);

  function onAuthStateChangedHandler(currentUser) {
    setUser(currentUser);
    
    // If user logs out, reset the welcome screen so it shows next time they log in
    if (!currentUser) {
      setWelcomeShown(false);
    }

    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, onAuthStateChangedHandler);
    
    async function prepare() {
      try {
        await Font.loadAsync({
          'Inter': Inter_400Regular,
          'Inter-Bold': Inter_700Bold, 
          'Roboto': Roboto_400Regular,
          'Roboto-Bold': Roboto_700Bold,
        });
        await SplashScreen.hideAsync();
        await new Promise(resolve => setTimeout(resolve, 2000)); 
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
    return unsubscribe;
  }, []);

  if (!appIsReady || initializing) {
    return <LoadingScreen />;
  }

  // 1. If we are in the middle of registering, FORCE show SignUpScreen
  // This prevents App.js from switching to Home before data is saved
  if (isRegistering) {
    return (
      <SignUpScreen 
        onNavigateLogin={() => {
            setIsRegistering(false);
            setAuthMode('login');
        }}
        // When verification finishes, we turn this off to allow Home Screen
        onSignUpSuccess={() => setIsRegistering(false)}
        setIsRegistering={setIsRegistering}
      />
    );
  }

  // 2. Authenticated Flow
  if (user) {
    // NEW: Check if we have shown the welcome screen yet
    if (!welcomeShown) {
      return (
        <WelcomeScreen 
          user={user} 
          onFinish={() => setWelcomeShown(true)} 
        />
      );
    }

    // Normal Home Screen
    return (
      <View className="flex-1">
        <HomeScreen />
        <StatusBar style="auto" />
      </View>
    );
  }

  // 3. Auth Flow (Login/Signup/Forgot Password)
  if (authMode === 'signup') {
    return (
      <SignUpScreen 
        onNavigateLogin={() => setAuthMode('login')}
        onSignUpSuccess={() => setIsRegistering(false)}
        setIsRegistering={setIsRegistering}
      />
    );
  }

  if (authMode === 'forgot_password') {
    return (
      <ForgotPasswordScreen 
        onNavigateLogin={() => setAuthMode('login')}
      />
    );
  }

  return (
    <LoginScreen 
      onNavigateSignUp={() => setAuthMode('signup')} 
      onNavigateForgotPassword={() => setAuthMode('forgot_password')}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}