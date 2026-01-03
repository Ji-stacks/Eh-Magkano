import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
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

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert("Missing Fields", "Please enter your email and password.");
        return;
    }

    setIsLoading(true);

    try {
        // Authenticate with Firebase
        await signInWithEmailAndPassword(auth, email, password);
        // Successful login triggers onAuthStateChanged in App.js
    } catch (error) {
        let msg = error.message;
        // User-friendly error messages
        if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
            msg = "Invalid email or password.";
        } else if (msg.includes('invalid-email')) {
            msg = "Please enter a valid email address.";
        } else if (msg.includes('too-many-requests')) {
            msg = "Too many failed attempts. Please try again later.";
        }
        Alert.alert("Login Failed", msg);
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

            {/* Email Input */}
            <View className="mb-4">
                <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Email Address</Text>
                <View className="bg-surface rounded-2xl flex-row items-center px-4 py-3 border border-gray-100 shadow-sm">
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                    <TextInput 
                        className="flex-1 ml-3 font-roboto text-gray-700"
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
                <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Password</Text>
                <View className="bg-surface rounded-2xl flex-row items-center px-4 py-3 border border-gray-100 shadow-sm">
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                    <TextInput 
                        className="flex-1 ml-3 font-roboto text-gray-700"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity className="items-end mt-2">
                    <Text className="text-primary font-bold font-inter text-xs">Forgot Password?</Text>
                </TouchableOpacity>
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

            {/* Divider */}
            <View className="flex-row items-center my-6">
                <View className="flex-1 h-[1px] bg-gray-300" />
                <Text className="mx-4 text-gray-400 font-roboto text-xs">OR</Text>
                <View className="flex-1 h-[1px] bg-gray-300" />
            </View>

            {/* Google/Social Placeholder */}
            <TouchableOpacity className="bg-white border border-gray-200 w-full py-3 rounded-2xl flex-row items-center justify-center mb-6">
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text className="text-gray-700 font-bold font-inter ml-2">Continue with Google</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center">
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