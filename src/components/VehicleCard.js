import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function VehicleCard({ vehicle, selected, onSelect }) {
  return (
    <TouchableOpacity 
      onPress={() => onSelect(vehicle)}
      className={`p-3 rounded-xl border-2 flex-1 items-center justify-center m-1 ${
        selected 
        ? `${vehicle.border} ${vehicle.bg}` 
        : 'border-transparent bg-white shadow-sm'
      }`}
    >
      {/* Icon Container */}
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-2">
        <FontAwesome5 name={vehicle.icon} size={18} color="#0F766E" />
      </View>
      
      {/* Vehicle Name - Applied 'font-inter' */}
      <Text className="text-xs font-semibold text-gray-600 text-center font-inter">
        {vehicle.name}
      </Text>
      
      {/* Price - Applied 'font-roboto' */}
      <Text className="text-[10px] text-gray-400 font-roboto">
        Base: ₱{vehicle.base}
      </Text>
    </TouchableOpacity>
  );
}