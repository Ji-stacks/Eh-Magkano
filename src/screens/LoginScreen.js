import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Firebase Imports
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export default function LoginScreen({ onLogin, onNavigateSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
      className="flex-1 bg-secondary"
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        
        {/* Top Section: Branding */}
        <View className="flex-1 items-center justify-center py-10">
            <View className="w-24 h-24 bg-white rounded-2xl p-2 justify-between shadow-2xl mb-6">
                <View className="w-full h-10 bg-secondary rounded-lg opacity-80" />
                <View className="flex-row justify-between items-center px-1">
                    <View className="w-4 h-4 bg-yellow-400 rounded-full" />
                    <View className="h-2 w-8 bg-gray-200 rounded-full opacity-50" />
                    <View className="w-4 h-4 bg-yellow-400 rounded-full" />
                </View>
                <View className="absolute -bottom-3 left-2 w-5 h-5 bg-gray-900 rounded-full" />
                <View className="absolute -bottom-3 right-2 w-5 h-5 bg-gray-900 rounded-full" />
            </View>

            <Text className="text-4xl font-bold text-white font-inter tracking-wider">Eh Magkano?</Text>
            <Text className="text-teal-200 font-roboto mt-2">Smart Commuting. Better Savings.</Text>
        </View>

        {/* Bottom Section: Form */}
        <View className="bg-background rounded-t-[40px] px-8 pt-10 pb-10 shadow-inner h-auto">
            <Text className="text-2xl font-bold text-gray-800 font-inter mb-6">Welcome Back</Text>

            {/* General Error Message (for network issues/too many attempts) */}
            {errors.general && (
                <View className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4 flex-row items-center">
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <Text className="text-red-500 text-xs font-bold ml-2 flex-1">{errors.general}</Text>
                </View>
            )}

            {/* Email Input */}
            <View className="mb-4">
                <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Email Address</Text>
                <View className={`bg-surface rounded-2xl flex-row items-center px-4 py-3 border shadow-sm ${
                    errors.email ? 'border-red-500' : 'border-gray-100'
                }`}>
                    <Ionicons name="mail-outline" size={20} color={errors.email ? "#EF4444" : "#9CA3AF"} />
                    <TextInput 
                        className="flex-1 ml-3 font-roboto text-gray-700"
                        placeholder="you@example.com"
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
                <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Password</Text>
                <View className={`bg-surface rounded-2xl flex-row items-center px-4 py-3 border shadow-sm ${
                    errors.password ? 'border-red-500' : 'border-gray-100'
                }`}>
                    <Ionicons name="lock-closed-outline" size={20} color={errors.password ? "#EF4444" : "#9CA3AF"} />
                    <TextInput 
                        className="flex-1 ml-3 font-roboto text-gray-700"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={(text) => { setPassword(text); clearError('password'); }}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                
                {errors.password ? (
                    <Text className="text-red-500 text-[10px] ml-4 mt-1 font-medium">{errors.password}</Text>
                ) : (
                    <TouchableOpacity className="items-end mt-2">
                        <Text className="text-primary font-bold font-inter text-xs">Forgot Password?</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Login Button */}
            <TouchableOpacity 
                onPress={handleLogin}
                disabled={isLoading}
                className={`w-full py-4 rounded-2xl shadow-lg flex-row justify-center items-center ${
                    isLoading ? 'bg-secondary' : 'bg-primary shadow-teal-900/20 active:opacity-90'
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
                <Text className="text-gray-500 font-roboto">Don't have an account? </Text>
                <TouchableOpacity onPress={onNavigateSignUp}>
                    <Text className="text-primary font-bold font-inter">Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}