import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ onNavigateLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

  const handleResetPassword = () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    setError(null);
    // Firebase auth backend logic is not implemented yet as per request
    console.log('Reset link requested for:', email);
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
            <Text className="text-2xl font-bold text-gray-800 font-inter mb-4">Reset Password</Text>
            <Text className="text-gray-500 font-roboto text-sm mb-6 leading-5">
                Enter the email address associated with your account and we'll send you a link to reset your password.
            </Text>

            {/* Email Input */}
            <View className="mb-6">
                <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Email Address</Text>
                <View className={`bg-surface rounded-2xl flex-row items-center px-4 py-3 border shadow-sm ${
                    error ? 'border-red-500' : 'border-gray-100'
                }`}>
                    <Ionicons name="mail-outline" size={20} color={error ? "#EF4444" : "#9CA3AF"} />
                    <TextInput 
                        className="flex-1 ml-3 font-roboto text-gray-700"
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={(text) => { setEmail(text); setError(null); }}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
                {error && (
                    <Text className="text-red-500 text-[10px] ml-4 mt-1 font-medium">{error}</Text>
                )}
            </View>

            {/* Send Reset Link Button */}
            <TouchableOpacity 
                onPress={handleResetPassword}
                className="w-full py-4 rounded-2xl shadow-lg bg-primary shadow-teal-900/20 active:opacity-90 flex-row justify-center items-center mb-6"
            >
                <Text className="text-white text-center font-bold font-inter text-lg">Send Reset Link</Text>
            </TouchableOpacity>

            {/* Back to Login */}
            <View className="flex-row justify-center">
                <TouchableOpacity onPress={onNavigateLogin}>
                    <Text className="text-primary font-bold font-inter">Back to Login</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
