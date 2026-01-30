// App.js — Leeo Lugano Veggas
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CustomTabBar from './Components/CustomTabBar';

// Flow screens
import LoaderScreen from './Components/Loader';
import OnboardingScreen from './Components/OnboardingScreen';

// Tabs screens
import AboutScreen from './Components/AboutScreen';
import MapScreen from './Components/MapScreen';
import QuizScreen from './Components/QuizScreen';
import QuizResultsScreen from './Components/QuizResultsScreen';
import SavedScreen from './Components/SavedScreen';

// Places (stack inside tab)
import CategoriesScreen from './Components/CategoriesScreen';
import PlacesListScreen from './Components/PlacesListScreen';
import LocationScreen from './Components/LocationScreen';

// Notes
import AddNoteScreen from './Components/AddNoteScreen';


const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const PlacesStack = createNativeStackNavigator();
const QuizStack = createNativeStackNavigator();

function PlacesNavigator() {
  return (
    <PlacesStack.Navigator screenOptions={{ headerShown: false }}>
      <PlacesStack.Screen name="Categories" component={CategoriesScreen} />
      <PlacesStack.Screen name="PlacesList" component={PlacesListScreen} />
      <PlacesStack.Screen name="Location" component={LocationScreen} />
    
    </PlacesStack.Navigator>
  );
}

function QuizNavigator() {
  return (
    <QuizStack.Navigator screenOptions={{ headerShown: false }}>
      <QuizStack.Screen name="QuizMain" component={QuizScreen} />
      <QuizStack.Screen name="QuizResults" component={QuizResultsScreen} />
    </QuizStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="About" component={AboutScreen} />
      <Tab.Screen name="Places" component={PlacesNavigator} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen 
        name="Quiz" 
        component={QuizNavigator}
        options={{ tabBarStyle: { display: 'none' } }}
      />
      <Tab.Screen name="Saved" component={SavedScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Loader">
        {/* Loader сам решает: onboarding или tabs (например через AsyncStorage) */}
        <RootStack.Screen name="Loader" component={LoaderScreen} />
        <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        <RootStack.Screen name="Main" component={MainTabs} />
        <RootStack.Screen name="AddNote" component={AddNoteScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
