import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen({ onFinish, user }) {
  useEffect(() => {
    // Show the welcome screen for 3 seconds, then navigate home
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <StatusBar style="dark" />
      
      {/* Decorative Circle/Icon using Primary Color */}
      <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-6 shadow-lg shadow-gray-200">
         <ActivityIndicator size="large" color="white" />
      </View>

      <Text className="text-2xl font-bold text-gray-800 mb-2 font-Inter-Bold">
        Welcome Back
      </Text>
      
      {/* Show user email or name if available with first letter capitalized */}
      <Text className="text-base text-gray-500 text-center font-Inter capitalize">
        {user?.displayName || user?.email || 'Traveler'}
      </Text>

      <View className="mt-10">
        <Text className="text-xs text-primary font-Inter-Bold uppercase tracking-widest">
          Syncing your dashboard...
        </Text>
      </View>
    </View>
  );
}