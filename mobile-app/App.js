import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme';
import SplashScreen from './src/screens/SplashScreen';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar 
              barStyle="dark-content" 
              backgroundColor="#FFFFFF" 
            />
            <AppNavigator />
            <Toast />
          </NavigationContainer>
        </PaperProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;
