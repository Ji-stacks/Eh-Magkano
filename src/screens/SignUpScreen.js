import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Firebase Imports
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export default function SignUpScreen({ onSignUp, onNavigateLogin, onSignUpSuccess, setIsRegistering }) {
  // Sign Up Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification State
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUpInit = async () => {
    if (!firstName || !lastName || !email || !password) {
        Alert.alert("Missing Fields", "Please fill in all required fields.");
        return;
    }
    if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match!");
        return;
    }

    setIsLoading(true);
    // 1. Lock the screen via App.js state so navigation doesn't happen yet
    if(setIsRegistering) setIsRegistering(true);

    try {
        // 2. Create User in Authentication ONLY
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. Update Profile Name
        await updateProfile(user, { displayName: `${firstName} ${lastName}` });

        // 4. Send Verification Email
        await sendEmailVerification(user);

        // 5. Show Verification Screen (Database NOT touched yet)
        setShowVerification(true);
        Alert.alert("Verification Sent", `A verification email has been sent to ${email}. Please check your inbox.`);

    } catch (error) {
        let errorMessage = error.message;
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email address is already in use.';
        }
        Alert.alert("Registration Failed", errorMessage);
        if(setIsRegistering) setIsRegistering(false); // Unlock if error
        setShowVerification(false);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsLoading(true);
    try {
        // Reload user to get latest emailVerified status from Firebase servers
        if (auth.currentUser) {
            await auth.currentUser.reload();
            
            if (auth.currentUser.emailVerified) {
                // 6. SUCCESS: User verified, NOW we save to Firestore
                await setDoc(doc(db, "users", auth.currentUser.uid), {
                    firstName,
                    lastName,
                    email,
                    birthDate,
                    createdAt: new Date().toISOString(),
                    role: 'commuter',
                    emailVerified: true
                });

                Alert.alert("Success", "Email verified! Welcome to Eh Magkano?", [
                    { 
                        text: "Let's Go", 
                        onPress: () => {
                            // Tell App.js we are done registering, allow transition to Home
                            if(onSignUpSuccess) onSignUpSuccess();
                            // Fallback if prop not passed (though App.js handles user state automatically)
                            if(onSignUp) onSignUp();
                        } 
                    }
                ]);
            } else {
                Alert.alert("Not Verified", "We haven't received the confirmation yet. Please click the link in your email and try again.");
            }
        } else {
             Alert.alert("Error", "No user found. Please try signing in again.");
             if(setIsRegistering) setIsRegistering(false);
             setShowVerification(false);
        }
    } catch (error) {
        Alert.alert("Error", error.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
      setIsLoading(true);
      try {
          if (auth.currentUser) {
              await sendEmailVerification(auth.currentUser);
              Alert.alert("Email Sent", "A new verification link has been sent.");
          }
      } catch (error) {
          Alert.alert("Error", error.message);
      } finally {
          setIsLoading(false);
      }
  };

  // Render "Check Email" Screen
  if (showVerification) {
    return (
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-secondary"
        >
          <StatusBar style="light" />
          <View className="flex-1 items-center justify-center pt-10 px-6">
            
            <View className="w-20 h-20 bg-white/10 rounded-full items-center justify-center mb-6">
                <Ionicons name="mail-unread" size={40} color="white" />
            </View>

            <Text className="text-3xl font-bold text-white font-inter text-center">Verify Email</Text>
            <Text className="text-teal-100 font-roboto mt-2 text-center text-sm px-4">
                We sent a verification link to <Text className="font-bold text-white">{email}</Text>. Please click the link in that email to continue.
            </Text>

            <View className="bg-white w-full rounded-3xl p-8 mt-8 shadow-lg">
                <Text className="text-gray-500 font-roboto text-xs uppercase text-center mb-6">Step 2 of 2</Text>
                
                <View className="items-center mb-8">
                    <Text className="text-gray-800 text-center font-inter mb-2">Waiting for confirmation...</Text>
                    {isLoading ? <ActivityIndicator size="small" color="#0F766E" /> : null}
                </View>

                {/* "I've Verified" Button */}
                <TouchableOpacity 
                    onPress={handleCheckVerification}
                    disabled={isLoading}
                    className="w-full bg-primary py-4 rounded-2xl shadow-lg shadow-teal-900/20 active:opacity-90 mb-4"
                >
                    <Text className="text-white text-center font-bold font-inter text-lg">I have verified my email</Text>
                </TouchableOpacity>

                {/* Resend */}
                <TouchableOpacity onPress={handleResendEmail} className="items-center py-2" disabled={isLoading}>
                    <Text className="text-primary font-bold font-inter text-xs">Resend Link</Text>
                </TouchableOpacity>
                
                 {/* Back to Signup (Cancel) */}
                 <TouchableOpacity 
                    onPress={() => {
                        if(setIsRegistering) setIsRegistering(false);
                        setShowVerification(false);
                    }} 
                    className="items-center py-2 mt-2" 
                    disabled={isLoading}
                >
                    <Text className="text-gray-400 font-inter text-xs">Cancel & Return</Text>
                </TouchableOpacity>
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
        
        {/* Top Section: Branding */}
        <View className="items-center justify-center py-8">
            <Text className="text-3xl font-bold text-white font-inter tracking-wider">Eh Magkano?</Text>
            <Text className="text-teal-200 font-roboto mt-1">Join the Community.</Text>
        </View>

        {/* Bottom Section: Form */}
        <View className="bg-background rounded-t-[40px] px-8 pt-8 pb-10 shadow-inner flex-1">
            <Text className="text-2xl font-bold text-gray-800 font-inter mb-6">Create Account</Text>

            {/* Split Name Fields */}
            <View className="flex-row justify-between mb-4 space-x-3">
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

            {/* Birthdate */}
            <View className="mb-4">
                <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Birthdate</Text>
                <View className="bg-surface rounded-2xl flex-row items-center px-4 py-3 border border-gray-100 shadow-sm">
                    <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                    <TextInput 
                        className="flex-1 ml-3 font-roboto text-gray-700"
                        placeholder="YYYY-MM-DD"
                        value={birthDate}
                        onChangeText={setBirthDate}
                    />
                </View>
            </View>

            {/* Email */}
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

            {/* Password */}
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

            {/* Confirm Password */}
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
                disabled={isLoading}
                className="bg-primary w-full py-4 rounded-2xl shadow-lg shadow-teal-900/20 active:opacity-90 flex-row justify-center items-center"
            >
                {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-bold font-inter text-lg">Sign Up</Text>}
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