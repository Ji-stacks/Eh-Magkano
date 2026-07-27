import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Firebase Imports
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export default function LoginScreen({ onLogin, onNavigateSignUp, onNavigateForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Inline Error State
  const [errors, setErrors] = useState({});

  const clearError = (field) => {
    if (errors[field] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: null, general: null }));
    }
  };

  const handleLogin = async () => {
    let newErrors = {};
    let hasError = false;

    // 1. Basic Validation
    if (!email) {
        newErrors.email = "Email is required";
        hasError = true;
    }
    if (!password) {
        newErrors.password = "Password is required";
        hasError = true;
    }

    if (hasError) {
        setErrors(newErrors);
        return;
    }

    setIsLoading(true);

    try {
        await signInWithEmailAndPassword(auth, email.trim(), password);        // Success listener in App.js handles navigation
    } catch (error) {
        let msg = error.message;
        let fieldErrors = {};

        // Map Firebase errors to fields
        if (msg.includes('user-not-found') || msg.includes('invalid-email')) {
            fieldErrors.email = "Account not found or invalid email.";
        } else if (msg.includes('wrong-password') || msg.includes('invalid-credential')) {
            fieldErrors.password = "Incorrect password.";
        } else if (msg.includes('too-many-requests')) {
            fieldErrors.general = "Too many failed attempts. Try again later.";
        } else {
            fieldErrors.general = "Login failed. Please check your connection.";
        }
        setErrors(fieldErrors);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-secondary'}`}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Theme Toggle Container */}
      <View className="absolute top-12 right-6 flex-row items-center z-50">
        <Ionicons 
          name={isDarkMode ? "moon" : "sunny"} 
          size={20} 
          color={isDarkMode ? "#E2E8F0" : "#FFFFFF"} 
          style={{ marginRight: 8 }}
        />
        <Switch
          trackColor={{ false: "#E5E7EB", true: "#0F766E" }}
          thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
          onValueChange={() => setIsDarkMode(prev => !prev)}
          value={isDarkMode}
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        
        {/* Top Section: Branding */}
        <View className="flex-1 items-center justify-center py-10">
            <View className="w-24 h-24 bg-white rounded-2xl p-2 justify-between shadow-2xl mb-6">
                <View className={`w-full h-10 rounded-lg opacity-80 ${isDarkMode ? 'bg-slate-700' : 'bg-secondary'}`} />
                <View className="flex-row justify-between items-center px-1">
                    <View className="w-4 h-4 bg-yellow-400 rounded-full" />
                    <View className="h-2 w-8 bg-gray-200 rounded-full opacity-50" />
                    <View className="w-4 h-4 bg-yellow-400 rounded-full" />
                </View>
                <View className="absolute -bottom-3 left-2 w-5 h-5 bg-gray-900 rounded-full" />
                <View className="absolute -bottom-3 right-2 w-5 h-5 bg-gray-900 rounded-full" />
            </View>

            <Text className="text-4xl font-bold text-white font-inter tracking-wider">Eh Magkano?</Text>
            <Text className={`font-roboto mt-2 ${isDarkMode ? 'text-slate-400' : 'text-teal-200'}`}>Smart Commuting. Better Savings.</Text>
        </View>

        {/* Bottom Section: Form */}
        <View className={`rounded-t-[40px] px-8 pt-10 pb-10 shadow-inner h-auto ${isDarkMode ? 'bg-slate-800' : 'bg-background'}`}>
            <Text className={`text-2xl font-bold font-inter mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Welcome Back</Text>

            {/* General Error Message (for network issues/too many attempts) */}
            {errors.general && (
                <View className={`p-3 rounded-xl mb-4 flex-row items-center border ${isDarkMode ? 'bg-red-950/20 border-red-900/50' : 'bg-red-50 border-red-200'}`}>
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <Text className="text-red-500 text-xs font-bold ml-2 flex-1">{errors.general}</Text>
                </View>
            )}

            {/* Email Input */}
            <View className="mb-4">
                <Text className={`font-roboto text-xs ml-4 mb-2 uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</Text>
                <View className={`rounded-2xl flex-row items-center px-4 py-3 border shadow-sm ${
                    isDarkMode ? 'bg-slate-700' : 'bg-surface'
                } ${
                    errors.email ? 'border-red-500' : (isDarkMode ? 'border-slate-600' : 'border-gray-100')
                }`}>
                    <Ionicons name="mail-outline" size={20} color={errors.email ? "#EF4444" : "#9CA3AF"} />
                    <TextInput 
                        className={`flex-1 ml-3 font-roboto ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
                        placeholder="you@example.com"
                        placeholderTextColor={isDarkMode ? "#9CA3AF" : "#9CA3AF"}
                        value={email}
                        onChangeText={(text) => { setEmail(text); clearError('email'); }}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
                {errors.email && (
                    <Text className="text-red-500 text-[10px] ml-4 mt-1 font-medium">{errors.email}</Text>
                )}
            </View>

            {/* Password Input */}
            <View className="mb-6">
                <Text className={`font-roboto text-xs ml-4 mb-2 uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Password</Text>
                <View className={`rounded-2xl flex-row items-center px-4 py-3 border shadow-sm ${
                    isDarkMode ? 'bg-slate-700' : 'bg-surface'
                } ${
                    errors.password ? 'border-red-500' : (isDarkMode ? 'border-slate-600' : 'border-gray-100')
                }`}>
                    <Ionicons name="lock-closed-outline" size={20} color={errors.password ? "#EF4444" : "#9CA3AF"} />
                    <TextInput 
                        className={`flex-1 ml-3 font-roboto ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
                        placeholder="••••••••"
                        placeholderTextColor={isDarkMode ? "#9CA3AF" : "#9CA3AF"}
                        value={password}
                        onChangeText={(text) => { setPassword(text); clearError('password'); }}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                
                {errors.password && (
                    <Text className="text-red-500 text-[10px] ml-4 mt-1 font-medium">{errors.password}</Text>
                )}
                <TouchableOpacity onPress={onNavigateForgotPassword} className="items-end mt-2">
                    <Text className={`font-bold font-inter text-xs ${isDarkMode ? 'text-teal-400' : 'text-primary'}`}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
                onPress={handleLogin}
                disabled={isLoading}
                className={`w-full py-4 rounded-2xl shadow-lg flex-row justify-center items-center ${
                    isLoading 
                    ? (isDarkMode ? 'bg-slate-700' : 'bg-secondary') 
                    : 'bg-primary shadow-teal-900/20 active:opacity-90'
                }`}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-center font-bold font-inter text-lg">Log In</Text>
                )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-8">
                <Text className={`font-roboto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Don't have an account? </Text>
                <TouchableOpacity onPress={onNavigateSignUp}>
                    <Text className={`font-bold font-inter ${isDarkMode ? 'text-teal-400' : 'text-primary'}`}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}