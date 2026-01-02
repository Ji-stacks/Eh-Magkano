import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GuidesTab() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);

  const guides = [
    {
      id: 1,
      title: "Setting Your Route",
      desc: "How to select your Origin and Destination.",
      fullText: "Tap on the 'From' box to select where you are coming from. Then, tap the 'To' box to select where you are going. You need to select both locations so the app can calculate the distance accurately.",
      icon: "map",
      color: "bg-blue-100",
      iconColor: "#1d4ed8"
    },
    {
      id: 2,
      title: "Selecting Transport",
      desc: "Choosing between Jeepneys and Buses.",
      fullText: "Swipe left or right on the vehicle cards to see all options. Tap a card to select it. We support Traditional Jeeps, Modern Jeeps, Ordinary Buses, and Aircon Buses. Each has a different fare matrix.",
      icon: "bus",
      color: "bg-orange-100",
      iconColor: "#c2410c"
    },
    {
      id: 3,
      title: "Applying Discounts",
      desc: "How to apply Student/PWD discounts.",
      fullText: "After you tap 'Check Fare', a popup will ask who is riding. Select 'Student' or 'Senior / PWD' to automatically apply the mandated 20% discount to your total fare.",
      icon: "pricetag",
      color: "bg-teal-100",
      iconColor: "#0f766e"
    },
    {
      id: 4,
      title: "Understanding Results",
      desc: "Reading the fare breakdown.",
      fullText: "The result card shows the estimated fare and total distance. Remember that these are estimates based on the official LTFRB matrix and might vary slightly due to traffic or specific route changes.",
      icon: "analytics",
      color: "bg-purple-100",
      iconColor: "#7e22ce"
    }
  ];

  const handleOpenGuide = (guide) => {
    setSelectedGuide(guide);
    setModalVisible(true);
  };

  return (
    <>
      {/* Guides Header - Full width, square corners, docked to top */}
      <View className="bg-secondary pt-16 pb-10 px-6 shadow-lg z-10 relative overflow-hidden">
        
        <View className="flex-row items-center relative z-10">
          {/* Library Icon - Size 22 (Medium) */}
          <View className="mr-3 bg-white/10 p-2 rounded-xl">
             <Ionicons name="library" size={22} color="white" />
          </View>
          {/* Text - 2xl (Medium) */}
          <Text className="text-2xl font-bold text-white font-inter tracking-tight">App Guide</Text>
        </View>
        <Text className="text-teal-50 text-sm font-roboto mt-1 opacity-90 relative z-10">Learn how to use Eh Magkano?</Text>
      </View>

      {/* Guides List */}
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {guides.map((guide) => (
          <TouchableOpacity 
            key={guide.id} 
            onPress={() => handleOpenGuide(guide)}
            className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100 flex-row items-center active:bg-gray-50"
          >
            <View className={`w-12 h-12 rounded-full ${guide.color} items-center justify-center mr-4`}>
              <Ionicons name={guide.icon} size={24} color={guide.iconColor} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-gray-800 font-inter text-base">{guide.title}</Text>
              <Text className="text-gray-500 font-roboto text-xs mt-1 leading-4">{guide.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        ))}
        <View className="h-6" />
      </ScrollView>

      {/* Guide Details Modal */}
      <Modal 
        visible={modalVisible} 
        animationType="fade" 
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* View used to disable background click dismissal */}
        <View className="flex-1 justify-center items-center bg-black/70 px-6">
            <View className="w-full bg-white rounded-2xl p-6 shadow-2xl relative items-center">
                
                {/* Close Button (X icon) REMOVED */}

                {selectedGuide && (
                    <>
                        {/* Large Icon */}
                        <View className={`w-20 h-20 rounded-full ${selectedGuide.color} items-center justify-center mb-4`}>
                            <Ionicons name={selectedGuide.icon} size={40} color={selectedGuide.iconColor} />
                        </View>

                        {/* Title */}
                        <Text className="text-xl font-bold text-gray-800 font-inter text-center mb-2">
                            {selectedGuide.title}
                        </Text>

                        {/* Content */}
                        <Text className="text-gray-600 font-roboto text-center leading-6 text-base px-2">
                            {selectedGuide.fullText}
                        </Text>

                        {/* Close Action - Primary Button (Only way to close) */}
                        <TouchableOpacity 
                            onPress={() => setModalVisible(false)}
                            className="mt-6 bg-primary px-8 py-3 rounded-full"
                        >
                            <Text className="font-bold text-white font-inter">Close Guide</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
      </Modal>
    </>
  );
}