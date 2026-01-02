import React from 'react';
import { View, Text } from 'react-native';

export default function FareResult({ fare, distance }) {
  if (fare === null) return null;

  return (
    <View className="bg-secondary rounded-2xl p-6 shadow-xl mt-6 relative overflow-hidden">
      {/* Decorative circle */}
      <View className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full" />
      
      <View className="flex-row justify-between items-end mb-2">
        <Text className="text-teal-100 text-sm font-inter">Estimated Fare</Text>
        <Text className="text-teal-100 text-sm font-roboto">{distance} km</Text>
      </View>
      
      <View className="flex-row items-start">
        <Text className="text-2xl text-white mt-2 font-bold font-inter">₱</Text>
        {/* Big Price: Roboto */}
        <Text className="text-6xl font-bold text-white font-roboto">{fare}</Text>
      </View>
      
      <Text className="text-xs text-teal-200 mt-2 italic font-roboto">
        *Fares are estimates based on LTFRB matrix.
      </Text>
    </View>
  );
}