import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

import HomeScreen from './src/screens/HomeScreen';
import LoadingScreen from './src/screens/LoadingScreen';

// Prevent the native splash from hiding automatically
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Load Fonts
        await Font.loadAsync({
          'Inter': Inter_400Regular, // Regular maps to 'font-inter'
          'Inter-Bold': Inter_700Bold, 
          'Roboto': Roboto_400Regular, // Regular maps to 'font-roboto'
          'Roboto-Bold': Roboto_700Bold,
        });

        // Hide native splash immediately
        await SplashScreen.hideAsync();

        // Artificial delay for the custom loading screen
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

  return (
    <View className="flex-1">
      <HomeScreen />
      <StatusBar style="auto" />
    </View>
  );
}