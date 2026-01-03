import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

export default function LoadingScreen() {
  // FIXED: Use useRef so values don't reset on re-renders
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-secondary items-center justify-center">
      <Animated.View 
        style={{ 
          opacity: fadeAnim, 
          transform: [{ scale: scaleAnim }],
          alignItems: 'center'
        }}
      >
        {/* Bus Icon */}
        <View className="mb-6 items-center">
            <View className="w-24 h-24 bg-white rounded-2xl p-2 justify-between shadow-lg">
                <View className="w-full h-10 bg-secondary rounded-lg opacity-80" />
                <View className="flex-row justify-between items-center px-1">
                    <View className="w-4 h-4 bg-yellow-400 rounded-full" />
                    <View className="h-2 w-8 bg-gray-200 rounded-full opacity-50" />
                    <View className="w-4 h-4 bg-yellow-400 rounded-full" />
                </View>
            </View>
            <View className="flex-row w-24 justify-between -mt-3 px-2">
                <View className="w-5 h-5 bg-gray-900 rounded-full" />
                <View className="w-5 h-5 bg-gray-900 rounded-full" />
            </View>
        </View>

        {/* Brand Name - FIXED: Removed 'font-inter' to ensure visibility */}
        <Text className="text-4xl font-bold text-white tracking-wider">
          Eh Magkano?
        </Text>
        
        {/* Tagline - FIXED: Removed 'font-roboto' */}
        <Text className="text-teal-200 text-sm mt-2 tracking-widest uppercase">
          Smart Commuting. Better Savings.
        </Text>

        {/* Loading Dots */}
        <View className="flex-row mt-12 space-x-2">
           <View className="w-2 h-2 bg-white rounded-full opacity-50" />
           <View className="w-2 h-2 bg-white rounded-full opacity-80" />
           <View className="w-2 h-2 bg-white rounded-full" />
        </View>
      </Animated.View>

      <View className="absolute bottom-10">
        <Text className="text-teal-800 text-xs font-semibold">v1.0.0</Text>
      </View>
    </View>
  );
}