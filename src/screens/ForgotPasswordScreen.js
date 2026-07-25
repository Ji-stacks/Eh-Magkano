import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Firebase Imports
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function ForgotPasswordScreen({ onNavigateLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessModalVisible(true);
    } catch (err) {
      let msg = err.message;
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError(msg || 'An error occurred. Please try again.');
      }
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
                disabled={isLoading}
                className={`w-full py-4 rounded-2xl shadow-lg bg-primary shadow-teal-900/20 active:opacity-90 flex-row justify-center items-center mb-6 ${
                    isLoading ? 'opacity-70' : ''
                }`}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-center font-bold font-inter text-lg">Send Reset Link</Text>
                )}
            </TouchableOpacity>

            {/* Back to Login */}
            <View className="flex-row justify-center">
                <TouchableOpacity onPress={onNavigateLogin}>
                    <Text className="text-primary font-bold font-inter">Back to Login</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>

      {/* Custom Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
            <View 
                className="w-[85%] max-w-xs bg-surface rounded-2xl p-6 items-center"
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
                <View className="w-12 h-12 bg-teal-50 rounded-full items-center justify-center mb-3">
                    <Ionicons name="checkmark-circle-outline" size={28} color="#0F766E" />
                </View>

                <Text className="text-lg font-bold text-gray-800 font-inter mb-1 text-center">
                    Email Sent!
                </Text>
                
                <Text className="text-sm text-gray-500 font-inter text-center mb-6 leading-5">
                    Check your inbox for the reset link.
                </Text>

                <TouchableOpacity 
                    onPress={() => setSuccessModalVisible(false)}
                    className="w-full py-3 bg-primary rounded-xl items-center shadow-md active:opacity-90"
                >
                    <Text className="text-sm font-bold text-white font-inter">
                        OK
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
