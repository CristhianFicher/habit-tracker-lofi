
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import TasksScreen from '../screens/TasksScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import MusicScreen from '../screens/MusicScreen';
import DiaryScreen from '../screens/DiaryScreen'; 
import SettingsScreen from '../screens/SettingsScreen';


export type RootStackParamList = {
  Home: undefined;
  Tasks: undefined;
  Pomodoro: undefined;
  Music: undefined;
  Diary: undefined; 
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tasks" component={TasksScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Pomodoro" component={PomodoroScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Music" component={MusicScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Diary" component={DiaryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }}
/>
    </Stack.Navigator>
  );
}
