import React, { useState, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList, TouchableWithoutFeedback, Switch, Animated, Dimensions, TextInput, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; 
import { signOut, updateProfile, updatePassword } from 'firebase/auth';
import { auth } from '../config/firebase';

// Imports from our other files
import { VEHICLES, LOCATIONS } from '../constants/fareMatrix';
import { calculateFare } from '../utils/calculateFare';
import VehicleCard from '../components/VehicleCard';
import FareResult from '../components/FareResult';
import GuidesTab from '../components/GuidesTab'; 
import { ThemeContext } from '../context/ThemeContext';

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

  // --- NEW STATES FOR HAMBURGER MENU & LOGOUT ---
  const [menuVisible, setMenuVisible] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false); // Profile State
  const [personalInfoModalVisible, setPersonalInfoModalVisible] = useState(false); // NEW: Personal Info State
  const [editableName, setEditableName] = useState(auth.currentUser?.displayName || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [birthday, setBirthday] = useState(''); // TODO: Fetch birthday from Firestore/Database on load

  // Animation Refs
  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useRef(new Animated.Value(300)).current; // Start off-screen (width of drawer)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // --- Animation Functions ---
  const openMenu = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300, // Slide back out
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => setMenuVisible(false));
  };

  // --- Theme Toggle Function ---
  // (Uses global toggleTheme from context)

  // --- Logout Functions ---
  const handleLogoutPress = () => {
    // Close the side menu first, then show confirmation
    closeMenu();
    setTimeout(() => {
        setLogoutModalVisible(true);
    }, 300);
  };

  const confirmLogout = async () => {
    try {
      setLogoutModalVisible(false);
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await updateProfile(auth.currentUser, { displayName: editableName });
      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
      }
      // TODO: Save birthday to Firestore
      
      setNewPassword('');
      setPersonalInfoModalVisible(false);
    } catch (error) {
      console.error("Error updating profile: ", error);
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          "Re-authentication Required",
          "This action requires a recent login. Please log out and log back in to change your password."
        );
      } else {
        Alert.alert("Error", error.message || "Failed to update profile.");
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Profile Function ---
  const handleProfilePress = () => {
    closeMenu();
    setTimeout(() => {
        setProfileModalVisible(true);
    }, 300);
  };

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
      {/* Header */}
      <View className={`${isDarkMode ? 'bg-slate-800' : 'bg-secondary'} pt-16 pb-10 px-6 shadow-lg z-10 relative overflow-hidden transition-colors`}>
        {/* Flex Row with Justify Between to separate Logo/Text from Hamburger */}
        <View className="flex-row items-center justify-between">
            {/* Left Side: Logo and App Name */}
            <View className="flex-row items-center">
                {/* Mini Bus Logo */}
                <View className="mr-3 items-center">
                    <View className="w-8 h-8 bg-white rounded-lg p-1 justify-between shadow-sm">
                        <View className={`w-full h-3 ${isDarkMode ? 'bg-slate-700' : 'bg-secondary'} rounded-sm opacity-80`} />
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

            {/* Right Side: Hamburger Icon - Trigger Animation */}
            <TouchableOpacity onPress={openMenu} className="p-1">
                <Ionicons name="menu" size={30} color="white" />
            </TouchableOpacity>
        </View>
        
        <Text className="text-teal-100 text-sm font-roboto mt-2">Smart Commuting. Better Savings.</Text>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        
        {/* Route Selector Card */}
        <View className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-surface border-gray-100'} rounded-xl shadow-sm border p-5 mb-6`}>
            <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'} font-semibold mb-4 text-xs uppercase tracking-wider font-inter`}>Plan your trip</Text>
            
            <View className="relative mb-6">
                {/* Dotted Line */}
                <View className={`absolute left-3 top-5 bottom-5 border-l-2 border-dashed ${isDarkMode ? 'border-slate-600' : 'border-gray-300'} z-0`} />

                {/* Origin Input */}
                <View className="mb-4">
                    <Text className="text-xs text-gray-400 font-medium ml-9 mb-1 font-roboto">From</Text>
                    <View className="flex-row items-center">
                        <View className={`mr-3 z-10 ${isDarkMode ? 'bg-slate-800' : 'bg-surface'} rounded-full`}>
                            <Ionicons name="navigate-circle" size={24} color="#0F766E" />
                        </View>
                        <TouchableOpacity 
                            onPress={() => handleOpenModal('origin')}
                            className={`flex-1 p-3 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} border rounded-lg`}
                        >
                            <Text className={`${origin ? (isDarkMode ? "text-white" : "text-gray-800") : "text-gray-400"} font-roboto`}>
                                {origin || "Select Origin"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Destination Input */}
                <View>
                    <Text className="text-xs text-gray-400 font-medium ml-9 mb-1 font-roboto">To</Text>
                    <View className="flex-row items-center">
                        <View className={`mr-3 z-10 ${isDarkMode ? 'bg-slate-800' : 'bg-surface'} rounded-full`}>
                            <Ionicons name="location" size={24} color="#115E59" />
                        </View>
                        <TouchableOpacity 
                            onPress={() => handleOpenModal('destination')}
                            className={`flex-1 p-3 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} border rounded-lg`}
                        >
                            <Text className={`${destination ? (isDarkMode ? "text-white" : "text-gray-800") : "text-gray-400"} font-roboto`}>
                                {destination || "Select Destination"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Vehicle Selection */}
            <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-bold mb-3 font-inter`}>Choose Transport</Text>
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
                            isDarkMode={isDarkMode} // Passing prop if VehicleCard supports it
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
                    ? (isDarkMode ? 'bg-slate-600' : 'bg-gray-300')
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
    <View className={`flex-1 items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-background'} p-6`}>
        <View className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} p-6 rounded-full mb-4 shadow-sm`}>
            <Ionicons name="time-outline" size={48} color={isDarkMode ? "#64748B" : "#CBD5E1"} />
        </View>
        <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-inter font-bold text-lg`}>Trip History</Text>
        <Text className="text-gray-400 font-roboto text-center mt-2 text-sm px-6">
            Your recent fare calculations will appear here. Feature coming soon!
        </Text>
    </View>
  );

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-background'}`}>
      <StatusBar style={isDarkMode ? "light" : "light"} />
      
      {/* Main Content Area */}
      <View className="flex-1">
        {activeTab === 'fares' && renderFaresContent()}
        {activeTab === 'history' && renderHistoryContent()}
        {activeTab === 'guides' && <GuidesTab isDarkMode={isDarkMode} />} 
      </View>

      {/* Bottom Navigation Bar */}
      <View className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} flex-row justify-around py-3 pb-6 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]`}>
          {/* Fares Tab */}
          <TouchableOpacity onPress={() => setActiveTab('fares')} className="items-center w-1/3">
              <Ionicons 
                name={activeTab === 'fares' ? "calculator" : "calculator-outline"} 
                size={24} 
                color={activeTab === 'fares' ? "#0F766E" : (isDarkMode ? "#64748B" : "#9CA3AF")} 
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
                color={activeTab === 'history' ? "#0F766E" : (isDarkMode ? "#64748B" : "#9CA3AF")} 
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
                color={activeTab === 'guides' ? "#0F766E" : (isDarkMode ? "#64748B" : "#9CA3AF")} 
              />
              <Text className={`text-[10px] mt-1 font-inter ${activeTab === 'guides' ? "text-primary font-bold" : "text-gray-400 font-medium"}`}>
                  Guides
              </Text>
          </TouchableOpacity>
      </View>

      {/* --- ALL MODALS --- */}

      {/* NEW: Profile Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <View className="flex-row items-center p-6 pt-12 pb-4">
                <TouchableOpacity 
                    onPress={() => setProfileModalVisible(false)}
                    className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}
                >
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
                <Text className={`ml-4 text-xl font-bold font-inter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile</Text>
            </View>

            <ScrollView className="flex-1 px-6">
                {/* Profile Card */}
                <View className={`p-6 rounded-2xl mb-6 items-center ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                    <View className="w-24 h-24 rounded-full bg-teal-100 items-center justify-center mb-4 border-4 border-white shadow-sm">
                            <Text className="text-4xl font-bold text-teal-700">
                            {auth.currentUser?.email ? auth.currentUser.email[0].toUpperCase() : 'U'}
                            </Text>
                    </View>
                    <Text className={`text-xl font-bold font-inter mb-1 capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {auth.currentUser?.displayName || 'Commuter'}
                    </Text>
                    <Text className={`text-sm font-inter ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {auth.currentUser?.email}
                    </Text>
                    
                    <TouchableOpacity 
                        onPress={() => setPersonalInfoModalVisible(true)}
                        className="mt-5 px-6 py-2 bg-primary rounded-full shadow-sm"
                    >
                        <Text className="text-white font-bold text-sm font-inter">Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Settings / Info Section */}
                <Text className={`mb-3 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Account Settings</Text>
                
                <View className={`rounded-xl overflow-hidden mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                    {['Personal Information', 'Saved Places', 'Privacy & Security'].map((item, index) => (
                        <TouchableOpacity 
                            key={item} 
                            onPress={() => {
                                if (item === 'Personal Information') {
                                    setPersonalInfoModalVisible(true);
                                }
                            }}
                            className={`flex-row items-center justify-between p-4 ${index !== 2 ? (isDarkMode ? 'border-b border-slate-700' : 'border-b border-gray-50') : ''}`}
                        >
                            <Text className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-inter`}>{item}</Text>
                            <Ionicons name="chevron-forward" size={18} color={isDarkMode ? "#64748B" : "#CBD5E1"} />
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </View>
      </Modal>

      {/* NEW: Personal Information Modal */}
      <Modal
        visible={personalInfoModalVisible}
        animationType="slide"
        onRequestClose={() => setPersonalInfoModalVisible(false)}
      >
        <View className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <View className="flex-row items-center p-6 pt-12 pb-4">
                <TouchableOpacity 
                    onPress={() => setPersonalInfoModalVisible(false)}
                    className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}
                >
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
                <Text className={`ml-4 text-xl font-bold font-inter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Personal Information</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-2">
                
                {/* Form Fields */}
                <View className="space-y-5">
                    {/* Name */}
                    <View>
                        <Text className={`text-xs font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</Text>
                        <View className={`flex-row items-center p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                            <Ionicons name="person-outline" size={20} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                            <TextInput 
                                placeholder="Enter your full name"
                                placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                                value={editableName}
                                onChangeText={setEditableName}
                                style={{ flex: 1, marginLeft: 12, color: isDarkMode ? 'white' : 'black', fontFamily: 'Inter' }}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View>
                        <Text className={`text-xs font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</Text>
                        <View className={`flex-row items-center p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-100 border-gray-200'}`}>
                            <Ionicons name="mail-outline" size={20} color={isDarkMode ? "#6B7280" : "#9CA3AF"} />
                            <TextInput 
                                editable={false}
                                defaultValue={auth.currentUser?.email || ''}
                                style={{ flex: 1, marginLeft: 12, color: isDarkMode ? '#9CA3AF' : '#6B7280', fontFamily: 'Inter' }}
                            />
                            <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? "#6B7280" : "#9CA3AF"} />
                        </View>
                        <Text className="text-[10px] text-gray-400 mt-1 ml-1">Email cannot be changed</Text>
                    </View>

                    {/* Phone */}
                    <View>
                        <Text className={`text-xs font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone Number</Text>
                        <View className={`flex-row items-center p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                            <Ionicons name="call-outline" size={20} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                            <TextInput 
                                placeholder="+63 900 000 0000"
                                placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                                keyboardType="phone-pad"
                                style={{ flex: 1, marginLeft: 12, color: isDarkMode ? 'white' : 'black', fontFamily: 'Inter' }}
                            />
                        </View>
                    </View>

                    {/* Birthday */}
                    <View>
                        <Text className={`text-xs font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Birthday</Text>
                        <View className={`flex-row items-center p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                            <Ionicons name="calendar-outline" size={20} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                            <TextInput 
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                                value={birthday}
                                onChangeText={setBirthday}
                                style={{ flex: 1, marginLeft: 12, color: isDarkMode ? 'white' : 'black', fontFamily: 'Inter' }}
                            />
                        </View>
                    </View>

                    {/* Change Password */}
                    <View>
                        <Text className={`text-xs font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Change Password</Text>
                        <View className={`flex-row items-center p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                            <Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                            <TextInput 
                                placeholder="Enter new password"
                                placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                                secureTextEntry={true}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                style={{ flex: 1, marginLeft: 12, color: isDarkMode ? 'white' : 'black', fontFamily: 'Inter' }}
                            />
                        </View>
                    </View>

                </View>

                {/* Save Button */}
                <TouchableOpacity 
                    onPress={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="mt-10 bg-primary py-4 rounded-xl shadow-lg shadow-teal-200 mb-10"
                >
                    {isSavingProfile ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg font-inter">Save Changes</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </View>
      </Modal>

      {/* NEW: Custom Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
            {/* Modal Container with Border Radius and Explicit Shadow */}
            <View 
                className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-[85%] max-w-xs rounded-2xl p-5 items-center`}
                style={{
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.30,
                    shadowRadius: 4.65,
                    elevation: 10,
                }}
            >
                
                <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-3">
                    <Ionicons name="log-out" size={24} color="#EF4444" />
                </View>

                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} font-inter mb-1`}>
                    Log Out
                </Text>
                
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-inter text-center mb-6`}>
                    Are you sure you want to log out of your account?
                </Text>

                <View className="flex-row w-full space-x-3">
                    {/* Cancel Button - Neutral */}
                    <TouchableOpacity 
                        onPress={() => setLogoutModalVisible(false)}
                        className={`flex-1 py-3 rounded-xl border ${isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-200 bg-gray-50'} items-center`}
                    >
                        <Text className={`text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-inter`}>
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    {/* Confirm Logout Button - Secondary Color */}
                    <TouchableOpacity 
                        onPress={confirmLogout}
                        className={`flex-1 py-3 rounded-xl ${isDarkMode ? 'bg-secondary' : 'bg-secondary'} items-center shadow-md`}
                    >
                        <Text className="text-sm font-bold text-white font-inter">
                            Log Out
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      {/* NEW: Sliding Side Menu */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="none" // We handle animation manually
        onRequestClose={closeMenu}
      >
        <View className="flex-1">
            {/* Backdrop with Fade Animation */}
            <TouchableOpacity 
                activeOpacity={1} 
                onPress={closeMenu} 
                className="absolute inset-0 w-full h-full"
            >
                <Animated.View 
                    style={{ opacity: fadeAnim }} 
                    className="absolute inset-0 bg-black/40 w-full h-full" 
                />
            </TouchableOpacity>

            {/* Sliding Drawer */}
            <Animated.View 
                style={{ 
                    transform: [{ translateX: slideAnim }],
                    shadowColor: "#000",
                    shadowOffset: {
                        width: -10,
                        height: 0,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 15,
                    elevation: 10,
                }}
                className={`absolute right-0 top-0 w-60 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} pt-10 pb-6 rounded-l-2xl`}
            >
                <View className="px-5 mb-4">
                    <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} font-inter`}>Menu</Text>
                </View>

                {/* Profile */}
                <TouchableOpacity 
                    onPress={handleProfilePress}
                    className={`flex-row items-center px-5 py-3 ${isDarkMode ? 'active:bg-slate-700 border-slate-700' : 'active:bg-gray-50 border-gray-50'} border-b`}
                >
                    <View className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-teal-50'} items-center justify-center mr-3`}>
                        <Ionicons name="person" size={16} color={isDarkMode ? "#2DD4BF" : "#0F766E"} />
                    </View>
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-inter`}>Profile</Text>
                </TouchableOpacity>

                {/* Dark Mode Toggle */}
                <View className={`flex-row items-center justify-between px-5 py-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-50'}`}>
                    <View className="flex-row items-center">
                        <View className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'} items-center justify-center mr-3`}>
                             <Ionicons name={isDarkMode ? "moon" : "sunny"} size={16} color={isDarkMode ? "#E2E8F0" : "#4B5563"} />
                        </View>
                        <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-inter`}>
                            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#E5E7EB", true: "#0F766E" }}
                        thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
                        onValueChange={toggleTheme}
                        value={isDarkMode}
                        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity onPress={handleLogoutPress} className={`flex-row items-center px-5 py-3 ${isDarkMode ? 'active:bg-red-900/20 border-slate-700' : 'active:bg-red-50 border-gray-50'} border-t mt-2`}>
                    <View className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} items-center justify-center mr-3`}>
                        <Ionicons name="log-out" size={18} color="#EF4444" />
                    </View>
                    <Text className="text-sm font-medium text-red-500 font-inter">Logout</Text>
                </TouchableOpacity>

                {/* Close Button Inside Drawer (Optional, but good UX) */}
                <TouchableOpacity 
                    onPress={closeMenu}
                    className="absolute top-10 right-4 p-2"
                >
                    <Ionicons name="close" size={20} color={isDarkMode ? "#9CA3AF" : "#9CA3AF"} />
                </TouchableOpacity>

            </Animated.View>
        </View>
      </Modal>

      {/* Location Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
            <View className={`${isDarkMode ? 'bg-slate-800' : 'bg-surface'} rounded-t-3xl h-[50%] p-6`}>
                <View className="flex-row justify-between items-center mb-4">
                    <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} font-inter`}>
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
                            className={`p-4 border-b ${isDarkMode ? 'border-slate-700 active:bg-slate-700' : 'border-gray-100 active:bg-teal-50'}`}
                        >
                            <Text className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-roboto`}>{item}</Text>
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
                <View className={`w-full ${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-2xl relative`}>
                    <TouchableOpacity 
                        onPress={() => setFareModalVisible(false)}
                        className={`absolute top-3 right-3 z-20 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} rounded-full p-2`}
                    >
                        <Ionicons name="close" size={20} color={isDarkMode ? "#E2E8F0" : "#666"} />
                    </TouchableOpacity>

                    {!showResult ? (
                        <View className="py-2">
                            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} font-inter mb-4 text-center mt-2`}>
                                Who is riding?
                            </Text>
                            <View className="space-y-3">
                                <TouchableOpacity 
                                    onPress={() => setDiscountType('regular')}
                                    className={`p-4 rounded-xl border-2 flex-row items-center justify-between ${
                                        discountType === 'regular' 
                                            ? 'border-primary bg-teal-50' 
                                            : (isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white')
                                    }`}
                                >
                                    <View className="flex-row items-center space-x-3">
                                        <Ionicons name="person" size={20} color={discountType === 'regular' ? '#0F766E' : '#9CA3AF'} />
                                        <Text className={`font-inter font-semibold ${discountType === 'regular' ? 'text-gray-800' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>Regular</Text>
                                    </View>
                                    <Text className="font-roboto text-gray-400 text-xs">Full Fare</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    onPress={() => setDiscountType('student')}
                                    className={`p-4 rounded-xl border-2 flex-row items-center justify-between ${
                                        discountType === 'student' 
                                            ? 'border-primary bg-teal-50' 
                                            : (isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white')
                                    }`}
                                >
                                    <View className="flex-row items-center space-x-3">
                                        <Ionicons name="school" size={20} color={discountType === 'student' ? '#0F766E' : '#9CA3AF'} />
                                        <Text className={`font-inter font-semibold ${discountType === 'student' ? 'text-gray-800' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>Student</Text>
                                    </View>
                                    <View className="bg-red-100 px-2 py-1 rounded">
                                        <Text className="font-bold text-red-600 text-[10px]">-20%</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    onPress={() => setDiscountType('senior')}
                                    className={`p-4 rounded-xl border-2 flex-row items-center justify-between ${
                                        discountType === 'senior' 
                                            ? 'border-primary bg-teal-50' 
                                            : (isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white')
                                    }`}
                                >
                                    <View className="flex-row items-center space-x-3">
                                        <Ionicons name="accessibility" size={20} color={discountType === 'senior' ? '#0F766E' : '#9CA3AF'} />
                                        <Text className={`font-inter font-semibold ${discountType === 'senior' ? 'text-gray-800' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>Senior / PWD</Text>
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
                            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} font-inter mb-4 text-center mt-2`}>
                                Trip Summary
                            </Text>
                            <View className="flex-row justify-center items-center mb-4 space-x-2">
                                <Text className={`font-roboto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-bold`}>{origin}</Text>
                                <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                                <Text className={`font-roboto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-bold`}>{destination}</Text>
                            </View>
                            {discountType !== 'regular' && (
                                <View className="self-center bg-teal-100 px-3 py-1 rounded-full mb-2">
                                    <Text className="text-teal-800 text-xs font-bold font-inter uppercase">
                                        {discountType} Discount Applied
                                    </Text>
                                </View>
                            )}
                            {fare !== null && (
                                <FareResult fare={fare} distance={distance} isDarkMode={isDarkMode} />
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