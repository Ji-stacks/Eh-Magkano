import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; 

// Imports from our other files
import { VEHICLES, LOCATIONS } from '../constants/fareMatrix';
import { calculateFare } from '../utils/calculateFare';
import VehicleCard from '../components/VehicleCard';
import FareResult from '../components/FareResult';
import GuidesTab from '../components/GuidesTab'; 

export default function HomeScreen() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fare, setFare] = useState(null);
  const [distance, setDistance] = useState(0);
  
  // State for Navigation Tabs
  const [activeTab, setActiveTab] = useState('fares'); // 'fares', 'history', 'guides'

  // State for the custom dropdown modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState('origin'); 
  
  // New States for Fare Result Modal & Discount Logic
  const [fareModalVisible, setFareModalVisible] = useState(false);
  const [discountType, setDiscountType] = useState('regular'); // 'regular', 'student', 'senior'
  const [showResult, setShowResult] = useState(false); // Controls which view to show in modal

  const handleOpenModal = (type) => {
    setSelectingFor(type);
    setModalVisible(true);
  };

  const handleSelectLocation = (loc) => {
    if (selectingFor === 'origin') setOrigin(loc);
    else setDestination(loc);
    setModalVisible(false);
  };

  // Helper to get a consistent "fake" distance based on location names
  const getConsistentDistance = (from, to) => {
    const combined = `${from}${to}`;
    let total = 0;
    for (let i = 0; i < combined.length; i++) {
        total += combined.charCodeAt(i);
    }
    return (total % 26) + 2; 
  };

  const handleCalculate = () => {
    if (!origin || !destination || !selectedVehicle) return;
    
    // 1. Generate Consistent Distance instead of Random
    const dist = getConsistentDistance(origin, destination);
    setDistance(dist);
    
    // 2. Reset Flow: Show Discount Selection first
    setDiscountType('regular');
    setShowResult(false);
    
    // 3. Open Modal
    setFareModalVisible(true);
  };

  const handleConfirmDiscount = () => {
    // Calculate base fare using the utility
    let finalPrice = calculateFare(distance, selectedVehicle);

    // Apply 20% Discount for Student/Senior
    if (discountType === 'student' || discountType === 'senior') {
        finalPrice = Math.round(finalPrice * 0.80);
    }

    setFare(finalPrice);
    setShowResult(true); // Reveal the result
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  // --- Content Renderers ---

  const renderFaresContent = () => (
    <>
      {/* Header - Square Corners (removed rounded-b-3xl) */}
      <View className="bg-secondary pt-16 pb-10 px-6 shadow-lg z-10 relative overflow-hidden">
        <View className="flex-row items-center">
            {/* Mini Bus Logo */}
            <View className="mr-3 items-center">
                <View className="w-8 h-8 bg-white rounded-lg p-1 justify-between shadow-sm">
                    <View className="w-full h-3 bg-secondary rounded-sm opacity-80" />
                    <View className="flex-row justify-between items-center px-0.5">
                        <View className="w-1 h-1 bg-yellow-400 rounded-full" />
                        <View className="h-0.5 w-2 bg-gray-200 rounded-full opacity-50" />
                        <View className="w-1 h-1 bg-yellow-400 rounded-full" />
                    </View>
                </View>
                <View className="flex-row w-8 justify-between -mt-1 px-1">
                    <View className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
                    <View className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
                </View>
            </View>

            <Text className="text-2xl font-bold text-white font-inter">Eh Magkano?</Text>
        </View>
        <Text className="text-teal-100 text-sm font-roboto mt-2">Smart Commuting. Better Savings.</Text>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        
        {/* Route Selector Card */}
        <View className="bg-surface rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
            <Text className="text-gray-800 font-semibold mb-4 text-xs uppercase tracking-wider font-inter">Plan your trip</Text>
            
            <View className="relative mb-6">
                {/* Dotted Line */}
                <View className="absolute left-3 top-5 bottom-5 border-l-2 border-dashed border-gray-300 z-0" />

                {/* Origin Input */}
                <View className="mb-4">
                    <Text className="text-xs text-gray-400 font-medium ml-9 mb-1 font-roboto">From</Text>
                    <View className="flex-row items-center">
                        <View className="mr-3 z-10 bg-surface rounded-full">
                            <Ionicons name="navigate-circle" size={24} color="#0F766E" />
                        </View>
                        <TouchableOpacity 
                            onPress={() => handleOpenModal('origin')}
                            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                            <Text className={`${origin ? "text-gray-800" : "text-gray-400"} font-roboto`}>
                                {origin || "Select Origin"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Destination Input */}
                <View>
                    <Text className="text-xs text-gray-400 font-medium ml-9 mb-1 font-roboto">To</Text>
                    <View className="flex-row items-center">
                        <View className="mr-3 z-10 bg-surface rounded-full">
                            <Ionicons name="location" size={24} color="#115E59" />
                        </View>
                        <TouchableOpacity 
                            onPress={() => handleOpenModal('destination')}
                            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                            <Text className={`${destination ? "text-gray-800" : "text-gray-400"} font-roboto`}>
                                {destination || "Select Destination"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Vehicle Selection */}
            <Text className="text-gray-700 font-bold mb-3 font-inter">Choose Transport</Text>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="mb-4"
            >
                {VEHICLES.map((v) => (
                    <View key={v.id} className="w-28 mr-1">
                        <VehicleCard 
                            vehicle={v} 
                            selected={selectedVehicle?.id === v.id} 
                            onSelect={handleVehicleSelect}
                        />
                    </View>
                ))}
            </ScrollView>

            {/* Check Fare Button */}
            <TouchableOpacity 
                onPress={handleCalculate}
                disabled={!origin || !destination || !selectedVehicle}
                className={`w-full py-4 rounded-xl shadow-sm ${
                    !origin || !destination || !selectedVehicle
                    ? 'bg-gray-300' 
                    : 'bg-primary'
                }`}
            >
                <Text className="text-white text-center font-bold text-lg font-inter">Check Fare</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );

  const renderHistoryContent = () => (
    <View className="flex-1 items-center justify-center bg-background p-6">
        <View className="bg-white p-6 rounded-full mb-4 shadow-sm">
            <Ionicons name="time-outline" size={48} color="#CBD5E1" />
        </View>
        <Text className="text-gray-500 font-inter font-bold text-lg">Trip History</Text>
        <Text className="text-gray-400 font-roboto text-center mt-2 text-sm px-6">
            Your recent fare calculations will appear here. Feature coming soon!
        </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Main Content Area */}
      <View className="flex-1">
        {activeTab === 'fares' && renderFaresContent()}
        {activeTab === 'history' && renderHistoryContent()}
        {activeTab === 'guides' && <GuidesTab />} 
      </View>

      {/* Bottom Navigation Bar */}
      <View className="bg-white flex-row justify-around py-3 pb-6 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {/* Fares Tab */}
          <TouchableOpacity onPress={() => setActiveTab('fares')} className="items-center w-1/3">
              <Ionicons 
                name={activeTab === 'fares' ? "calculator" : "calculator-outline"} 
                size={24} 
                color={activeTab === 'fares' ? "#0F766E" : "#9CA3AF"} 
              />
              <Text className={`text-[10px] mt-1 font-inter ${activeTab === 'fares' ? "text-primary font-bold" : "text-gray-400 font-medium"}`}>
                  Fares
              </Text>
          </TouchableOpacity>

          {/* History Tab */}
          <TouchableOpacity onPress={() => setActiveTab('history')} className="items-center w-1/3">
              <Ionicons 
                name={activeTab === 'history' ? "time" : "time-outline"} 
                size={24} 
                color={activeTab === 'history' ? "#0F766E" : "#9CA3AF"} 
              />
              <Text className={`text-[10px] mt-1 font-inter ${activeTab === 'history' ? "text-primary font-bold" : "text-gray-400 font-medium"}`}>
                  History
              </Text>
          </TouchableOpacity>

          {/* Guides Tab */}
          <TouchableOpacity onPress={() => setActiveTab('guides')} className="items-center w-1/3">
              <Ionicons 
                name={activeTab === 'guides' ? "book" : "book-outline"} 
                size={24} 
                color={activeTab === 'guides' ? "#0F766E" : "#9CA3AF"} 
              />
              <Text className={`text-[10px] mt-1 font-inter ${activeTab === 'guides' ? "text-primary font-bold" : "text-gray-400 font-medium"}`}>
                  Guides
              </Text>
          </TouchableOpacity>
      </View>

      {/* --- ALL MODALS --- */}

      {/* Location Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
            <View className="bg-surface rounded-t-3xl h-[50%] p-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-gray-800 font-inter">
                        Select {selectingFor === 'origin' ? 'Origin' : 'Destination'}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Text className="text-primary font-bold font-inter">Close</Text>
                    </TouchableOpacity>
                </View>
                <FlatList 
                    data={LOCATIONS.filter(l => l !== (selectingFor === 'origin' ? destination : origin))}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            onPress={() => handleSelectLocation(item)}
                            className="p-4 border-b border-gray-100 active:bg-teal-50"
                        >
                            <Text className="text-lg text-gray-700 font-roboto">{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>

      {/* Fare Flow Modal */}
      <Modal 
        visible={fareModalVisible} 
        animationType="fade" 
        transparent={true}
        onRequestClose={() => setFareModalVisible(false)}
      >
        <TouchableOpacity 
            className="flex-1 justify-center items-center bg-black/70 px-6"
            activeOpacity={1}
            onPress={() => setFareModalVisible(false)}
        >
            <TouchableWithoutFeedback>
                <View className="w-full bg-white rounded-2xl p-4 shadow-2xl relative">
                    <TouchableOpacity 
                        onPress={() => setFareModalVisible(false)}
                        className="absolute top-3 right-3 z-20 bg-gray-100 rounded-full p-2"
                    >
                        <Ionicons name="close" size={20} color="#666" />
                    </TouchableOpacity>

                    {!showResult ? (
                        <View className="py-2">
                            <Text className="text-xl font-bold text-gray-800 font-inter mb-4 text-center mt-2">
                                Who is riding?
                            </Text>
                            <View className="space-y-3">
                                <TouchableOpacity 
                                    onPress={() => setDiscountType('regular')}
                                    className={`p-4 rounded-xl border-2 flex-row items-center justify-between ${
                                        discountType === 'regular' ? 'border-primary bg-teal-50' : 'border-gray-100 bg-white'
                                    }`}
                                >
                                    <View className="flex-row items-center space-x-3">
                                        <Ionicons name="person" size={20} color={discountType === 'regular' ? '#0F766E' : '#9CA3AF'} />
                                        <Text className={`font-inter font-semibold ${discountType === 'regular' ? 'text-gray-800' : 'text-gray-500'}`}>Regular</Text>
                                    </View>
                                    <Text className="font-roboto text-gray-400 text-xs">Full Fare</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    onPress={() => setDiscountType('student')}
                                    className={`p-4 rounded-xl border-2 flex-row items-center justify-between ${
                                        discountType === 'student' ? 'border-primary bg-teal-50' : 'border-gray-100 bg-white'
                                    }`}
                                >
                                    <View className="flex-row items-center space-x-3">
                                        <Ionicons name="school" size={20} color={discountType === 'student' ? '#0F766E' : '#9CA3AF'} />
                                        <Text className={`font-inter font-semibold ${discountType === 'student' ? 'text-gray-800' : 'text-gray-500'}`}>Student</Text>
                                    </View>
                                    <View className="bg-red-100 px-2 py-1 rounded">
                                        <Text className="font-bold text-red-600 text-[10px]">-20%</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    onPress={() => setDiscountType('senior')}
                                    className={`p-4 rounded-xl border-2 flex-row items-center justify-between ${
                                        discountType === 'senior' ? 'border-primary bg-teal-50' : 'border-gray-100 bg-white'
                                    }`}
                                >
                                    <View className="flex-row items-center space-x-3">
                                        <Ionicons name="accessibility" size={20} color={discountType === 'senior' ? '#0F766E' : '#9CA3AF'} />
                                        <Text className={`font-inter font-semibold ${discountType === 'senior' ? 'text-gray-800' : 'text-gray-500'}`}>Senior / PWD</Text>
                                    </View>
                                    <View className="bg-red-100 px-2 py-1 rounded">
                                        <Text className="font-bold text-red-600 text-[10px]">-20%</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity 
                                onPress={handleConfirmDiscount}
                                className="mt-6 w-full bg-primary py-3 rounded-xl"
                            >
                                <Text className="text-white text-center font-bold font-inter text-lg">Done</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <Text className="text-xl font-bold text-gray-800 font-inter mb-4 text-center mt-2">
                                Trip Summary
                            </Text>
                            <View className="flex-row justify-center items-center mb-4 space-x-2">
                                <Text className="font-roboto text-gray-600 font-bold">{origin}</Text>
                                <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                                <Text className="font-roboto text-gray-600 font-bold">{destination}</Text>
                            </View>
                            {discountType !== 'regular' && (
                                <View className="self-center bg-teal-100 px-3 py-1 rounded-full mb-2">
                                    <Text className="text-teal-800 text-xs font-bold font-inter uppercase">
                                        {discountType} Discount Applied
                                    </Text>
                                </View>
                            )}
                            {fare !== null && (
                                <FareResult fare={fare} distance={distance} />
                            )}
                        </>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}