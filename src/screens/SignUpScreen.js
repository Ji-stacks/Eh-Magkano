import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen({ onSignUp, onNavigateLogin }) {
  // Sign Up Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSignUpInit = () => {
    if (!firstName || !lastName || !email || !password) {
        Alert.alert("Missing Fields", "Please fill in all required fields.");
        return;
    }
    if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match!");
        return;
    }
    // Proceed to OTP screen
    setShowOtp(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
        Alert.alert("Invalid Code", "Please enter the 6-digit code sent to your email.");
        return;
    }
    // Finalize signup
    onSignUp();
  };

  // Render OTP Verification Screen
  if (showOtp) {
    return (
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-secondary"
        >
          <StatusBar style="light" />
          <View className="flex-1 items-center justify-center pt-10 px-6">
            
            {/* Icon */}
            <View className="w-20 h-20 bg-white/10 rounded-full items-center justify-center mb-6">
                <Ionicons name="mail-open" size={40} color="white" />
            </View>

            <Text className="text-3xl font-bold text-white font-inter text-center">Verify Email</Text>
            <Text className="text-teal-100 font-roboto mt-2 text-center text-sm px-8">
                We sent a 6-digit confirmation code to <Text className="font-bold text-white">{email}</Text>
            </Text>

            {/* OTP Input Card */}
            <View className="bg-white w-full rounded-3xl p-8 mt-8 shadow-lg">
                <Text className="text-gray-500 font-roboto text-xs uppercase text-center mb-6">Enter Code</Text>
                
                {/* 6-Digit Input Container */}
                <View className="relative mb-8 h-14 justify-center">
                    {/* Visual Boxes */}
                    <View className="flex-row justify-between w-full absolute top-0 bottom-0 pointer-events-none">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <View 
                                key={index} 
                                className={`w-10 h-14 rounded-xl border-2 items-center justify-center ${
                                    otp.length === index ? 'border-primary bg-teal-50' : // Focused
                                    otp.length > index ? 'border-primary bg-white' : // Filled
                                    'border-gray-200 bg-gray-50' // Empty
                                }`}
                            >
                                <Text className="text-2xl font-bold text-gray-800 font-inter">
                                    {otp[index] || ''}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Hidden Actual Input */}
                    <TextInput
                        className="opacity-0 w-full h-full font-bold text-transparent"
                        value={otp}
                        onChangeText={(text) => setOtp(text.slice(0, 6))} // Limit to 6 chars
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus={true}
                        caretHidden={true}
                    />
                </View>

                {/* Verify Button */}
                <TouchableOpacity 
                    onPress={handleVerifyOtp}
                    className={`w-full py-4 rounded-2xl shadow-lg active:opacity-90 ${
                        otp.length === 6 ? 'bg-primary shadow-teal-900/20' : 'bg-gray-300'
                    }`}
                    disabled={otp.length !== 6}
                >
                    <Text className="text-white text-center font-bold font-inter text-lg">Verify & Create Account</Text>
                </TouchableOpacity>

                {/* Resend & Back */}
                <View className="flex-row justify-between items-center mt-6">
                    <TouchableOpacity onPress={() => setShowOtp(false)}>
                        <Text className="text-gray-400 font-inter text-xs">← Back to Sign Up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text className="text-primary font-bold font-inter text-xs">Resend Code</Text>
                    </TouchableOpacity>
                </View>
            </View>
          </View>
        </KeyboardAvoidingView>
    );
  }

  // Render Sign Up Form
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-secondary"
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        
        {/* Top Section: Branding (Compact for Signup) */}
        <View className="items-center justify-center py-8">
            <Text className="text-3xl font-bold text-white font-inter tracking-wider">Eh Magkano?</Text>
            <Text className="text-teal-200 font-roboto mt-1">Join the Community.</Text>
        </View>

        {/* Bottom Section: Form */}
        <View className="bg-background rounded-t-[40px] px-8 pt-8 pb-10 shadow-inner flex-1">
            <Text className="text-2xl font-bold text-gray-800 font-inter mb-6">Create Account</Text>

            {/* Split Name Fields */}
            <View className="flex-row justify-between mb-4 space-x-3">
                {/* First Name */}
                <View className="flex-1">
                    <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">First Name</Text>
                    <View className="bg-surface rounded-2xl flex-row items-center px-4 py-3 border border-gray-100 shadow-sm">
                        <TextInput 
                            className="flex-1 font-roboto text-gray-700"
                            placeholder="Juan"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>
                </View>

                {/* Last Name */}
                <View className="flex-1">
                    <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Last Name</Text>
                    <View className="bg-surface rounded-2xl flex-row items-center px-4 py-3 border border-gray-100 shadow-sm">
                        <TextInput 
                            className="flex-1 font-roboto text-gray-700"
                            placeholder="Dela Cruz"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                </View>
            </View>

            {/* Birthdate Input */}
            <View className="mb-4">
                <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Birthdate</Text>
                <TouchableOpacity className="bg-surface rounded-2xl flex-row items-center px-4 py-3 border border-gray-100 shadow-sm">
                    <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                    <TextInput 
                        className="flex-1 ml-3 font-roboto text-gray-700"
                        placeholder="YYYY-MM-DD"
                        value={birthDate}
                        onChangeText={setBirthDate}
                        keyboardType="numeric"
                    />
                </TouchableOpacity>
            </View>

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
            <View className="mb-4">
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
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
                <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Confirm Password</Text>
                <View className={`bg-surface rounded-2xl flex-row items-center px-4 py-3 border shadow-sm ${
                    confirmPassword && password !== confirmPassword ? 'border-red-300' : 'border-gray-100'
                }`}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                    <TextInput 
                        className="flex-1 ml-3 font-roboto text-gray-700"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                {confirmPassword && password !== confirmPassword && (
                    <Text className="text-red-500 text-[10px] ml-4 mt-1">Passwords do not match</Text>
                )}
            </View>

            {/* Sign Up Button (Proceeds to OTP) */}
            <TouchableOpacity 
                onPress={handleSignUpInit}
                className="bg-primary w-full py-4 rounded-2xl shadow-lg shadow-teal-900/20 active:opacity-90"
            >
                <Text className="text-white text-center font-bold font-inter text-lg">Sign Up</Text>
            </TouchableOpacity>

            {/* Navigation Link Back to Login */}
            <View className="flex-row justify-center mt-6 mb-4">
                <Text className="text-gray-500 font-roboto">Already have an account? </Text>
                <TouchableOpacity onPress={onNavigateLogin}>
                    <Text className="text-primary font-bold font-inter">Log In</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}