import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

import HomeScreen from './src/screens/HomeScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';

// Prevent the native splash from hiding automatically
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  
  // Auth State
  const [user, setUser] = useState(null); // null = not logged in
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  useEffect(() => {
    async function prepare() {
      try {
        // Load Fonts
        await Font.loadAsync({
          'Inter': Inter_400Regular,
          'Inter-Bold': Inter_700Bold, 
          'Roboto': Roboto_400Regular,
          'Roboto-Bold': Roboto_700Bold,
        });

        await SplashScreen.hideAsync();
        // Artificial delay for custom splash
        await new Promise(resolve => setTimeout(resolve, 2000)); 

      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        setShowCustomSplash(false);
      }
    }

    prepare();
  }, []);

  if (showCustomSplash) {
    return <LoadingScreen />;
  }

  // Auth Logic
  if (!user) {
    if (authMode === 'signup') {
      return (
        <SignUpScreen 
          onSignUp={() => setUser({ name: 'New User' })} 
          onNavigateLogin={() => setAuthMode('login')} 
        />
      );
    }
    return (
      <LoginScreen 
        onLogin={() => setUser({ name: 'Commuter' })} 
        onNavigateSignUp={() => setAuthMode('signup')} 
      />
    );
  }

  // If user exists, show Home Screen
  return (
    <View className="flex-1">
      <HomeScreen />
      <StatusBar style="auto" />
    </View>
  );
}