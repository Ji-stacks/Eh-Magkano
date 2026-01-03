import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Firebase Imports
// ADDED: deleteUser
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, deleteUser } from "firebase/auth";
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

  // Error State for Inline Validation
  const [errors, setErrors] = useState({});

  // --- Input Handlers ---

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNameChange = (text, setter, field) => {
    const cleaned = text.replace(/[^a-zA-Z\s]/g, '');
    setter(cleaned);
    clearError(field);
  };

  const handleBirthDateChange = (text) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length > 4) {
        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    }
    if (cleaned.length > 7) {
        cleaned = cleaned.slice(0, 7) + '-' + cleaned.slice(7);
    }
    if (cleaned.length > 10) {
        cleaned = cleaned.slice(0, 10);
    }
    setBirthDate(cleaned);
    clearError('birthDate');
  };

  const handleSignUpInit = async () => {
    // Reset errors
    let newErrors = {};
    let hasError = false;

    // 1. Basic Field Check
    if (!firstName) { newErrors.firstName = "Required"; hasError = true; }
    if (!lastName) { newErrors.lastName = "Required"; hasError = true; }
    if (!birthDate) { newErrors.birthDate = "Required"; hasError = true; }
    else if (birthDate.length !== 10) { newErrors.birthDate = "Format: YYYY-MM-DD"; hasError = true; }

    // 2. Email Validation (@gmail.com only)
    if (!email) {
        newErrors.email = "Required"; hasError = true;
    } else if (!email.trim().toLowerCase().endsWith('@gmail.com')) {
        newErrors.email = "Must be a valid @gmail.com address"; hasError = true;
    }

    // 3. Password Complexity Check
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!password) {
        newErrors.password = "Required"; hasError = true;
    } else if (!passwordRegex.test(password)) {
        newErrors.password = "Min 8 chars, 1 Uppercase, 1 Number, 1 Special char"; hasError = true;
    }

    // 4. Password Match Check
    if (!confirmPassword) {
        newErrors.confirmPassword = "Required"; hasError = true;
    } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"; hasError = true;
    }

    if (hasError) {
        setErrors(newErrors);
        return;
    }

    setIsLoading(true);
    if(setIsRegistering) setIsRegistering(true);

    try {
        // Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        try {
            // Update Profile & Send Email
            await updateProfile(user, { displayName: `${firstName} ${lastName}` });
            await sendEmailVerification(user);
        } catch (innerError) {
            // CRITICAL: If sending email fails, delete the user immediately
            // so we don't leave a half-created account in Auth.
            await deleteUser(user);
            throw innerError;
        }

        setShowVerification(true);
        Alert.alert("Verification Sent", `A verification email has been sent to ${email}. Please check your inbox.`);

    } catch (error) {
        let errorMessage = error.message;
        if (error.code === 'auth/email-already-in-use') {
            setErrors({ email: 'This email is already in use.' });
        } else {
            Alert.alert("Registration Failed", errorMessage);
        }
        
        if(setIsRegistering) setIsRegistering(false); 
        setShowVerification(false);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsLoading(true);
    try {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            
            if (auth.currentUser.emailVerified) {
                // Save to Firestore ONLY after successful verification
                await setDoc(doc(db, "users", auth.currentUser.uid), {
                    firstName,
                    lastName,
                    email,
                    birthDate,
                    createdAt: new Date().toISOString(),
                    role: 'commuter',
                    emailVerified: true
                });

                // Sign out to force user to log in again
                await signOut(auth);

                if(onNavigateLogin) onNavigateLogin();
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

  const handleCancelRegistration = async () => {
      setIsLoading(true);
      try {
          // DELETE the user from Firebase Auth if they cancel
          // This ensures the email is NOT registered if they back out
          if (auth.currentUser) {
              await deleteUser(auth.currentUser);
          }
      } catch (error) {
          // Fallback: If delete fails (rare on fresh account), sign out
          await signOut(auth);
      } finally {
          setIsLoading(false);
          // Unlock App.js state
          if(setIsRegistering) setIsRegistering(false);
          // Go back to form
          setShowVerification(false);
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

                <TouchableOpacity 
                    onPress={handleCheckVerification}
                    disabled={isLoading}
                    className="w-full bg-primary py-4 rounded-2xl shadow-lg shadow-teal-900/20 active:opacity-90 mb-4"
                >
                    <Text className="text-white text-center font-bold font-inter text-lg">I have verified my email</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleResendEmail} className="items-center py-2" disabled={isLoading}>
                    <Text className="text-primary font-bold font-inter text-xs">Resend Link</Text>
                </TouchableOpacity>
                
                 {/* CANCEL & RETURN: Deletes the unverified user */}
                 <TouchableOpacity 
                    onPress={handleCancelRegistration} 
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
        
        <View className="items-center justify-center py-8">
            <Text className="text-3xl font-bold text-white font-inter tracking-wider">Eh Magkano?</Text>
            <Text className="text-teal-200 font-roboto mt-1">Join the Community.</Text>
        </View>

        <View className="bg-background rounded-t-[40px] px-8 pt-8 pb-10 shadow-inner flex-1">
            <Text className="text-2xl font-bold text-gray-800 font-inter mb-6">Create Account</Text>

            {/* Split Name Fields */}
            <View className="flex-row justify-between mb-4 space-x-3">
                <View className="flex-1">
                    <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">First Name</Text>
                    <View className={`bg-surface rounded-2xl flex-row items-center px-4 py-3 border shadow-sm ${errors.firstName ? 'border-red-500' : 'border-gray-100'}`}>
                        <TextInput 
                            className="flex-1 font-roboto text-gray-700"
                            placeholder="Juan"
                            value={firstName}
                            onChangeText={(text) => handleNameChange(text, setFirstName, 'firstName')}
                        />
                    </View>
                    {errors.firstName && <Text className="text-red-500 text-[10px] ml-4 mt-1">{errors.firstName}</Text>}
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Last Name</Text>
                    <View className={`bg-surface rounded-2xl flex-row items-center px-4 py-3 border shadow-sm ${errors.lastName ? 'border-red-500' : 'border-gray-100'}`}>
                        <TextInput 
                            className="flex-1 font-roboto text-gray-700"
                            placeholder="Dela Cruz"
                            value={lastName}
                            onChangeText={(text) => handleNameChange(text, setLastName, 'lastName')}
                        />
                    </View>
                    {errors.lastName && <Text className="text-red-500 text-[10px] ml-4 mt-1">{errors.lastName}</Text>}
                </View>
            </View>

            {/* Birthdate */}
            <View className="mb-4">
                <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Birthdate</Text>
                <View className={`bg-surface rounded-2xl flex-row items-center px-4 py-3 border shadow-sm ${errors.birthDate ? 'border-red-500' : 'border-gray-100'}`}>
                    <Ionicons name="calendar-outline" size={20} color={errors.birthDate ? "#EF4444" : "#9CA3AF"} />
                    <TextInput 
                        className="flex-1 ml-3 font-roboto text-gray-700"
                        placeholder="YYYY-MM-DD"
                        value={birthDate}
                        onChangeText={handleBirthDateChange}
                        keyboardType="numeric"
                        maxLength={10}
                    />
                </View>
                {errors.birthDate && <Text className="text-red-500 text-[10px] ml-4 mt-1">{errors.birthDate}</Text>}
            </View>

            {/* Email */}
            <View className="mb-4">
                <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Email Address</Text>
                <View className={`bg-surface rounded-2xl flex-row items-center px-4 py-3 border shadow-sm ${errors.email ? 'border-red-500' : 'border-gray-100'}`}>
                    <Ionicons name="mail-outline" size={20} color={errors.email ? "#EF4444" : "#9CA3AF"} />
                    <TextInput 
                        className="flex-1 ml-3 font-roboto text-gray-700"
                        placeholder="you@gmail.com"
                        value={email}
                        onChangeText={(text) => { setEmail(text); clearError('email'); }}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
                {errors.email && <Text className="text-red-500 text-[10px] ml-4 mt-1">{errors.email}</Text>}
            </View>

            {/* Password */}
            <View className="mb-4">
                <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Password</Text>
                <View className={`bg-surface rounded-2xl flex-row items-center px-4 py-3 border shadow-sm ${errors.password ? 'border-red-500' : 'border-gray-100'}`}>
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
                {errors.password && <Text className="text-red-500 text-[10px] ml-4 mt-1">{errors.password}</Text>}
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
                <Text className="text-gray-500 font-roboto text-xs ml-4 mb-2 uppercase">Confirm Password</Text>
                <View className={`bg-surface rounded-2xl flex-row items-center px-4 py-3 border shadow-sm ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-100'
                }`}>
                    <Ionicons name="lock-closed-outline" size={20} color={errors.confirmPassword ? "#EF4444" : "#9CA3AF"} />
                    <TextInput 
                        className="flex-1 ml-3 font-roboto text-gray-700"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={(text) => { setConfirmPassword(text); clearError('confirmPassword'); }}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text className="text-red-500 text-[10px] ml-4 mt-1">{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity 
                onPress={handleSignUpInit}
                disabled={isLoading}
                className="bg-primary w-full py-4 rounded-2xl shadow-lg shadow-teal-900/20 active:opacity-90 flex-row justify-center items-center"
            >
                {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-bold font-inter text-lg">Sign Up</Text>}
            </TouchableOpacity>

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