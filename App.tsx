import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { HabitProvider } from './src/contexts/HabitContext';
import { PomodoroProvider } from './src/contexts/PomodoroContext';
import { MusicProvider } from './src/contexts/MusicContext';

export default function App() {
  return (
    <HabitProvider>
      <PomodoroProvider>
        <MusicProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </MusicProvider>
      </PomodoroProvider>
    </HabitProvider>
  );
}