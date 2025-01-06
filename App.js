import React, {useState} from 'react';
import Routes from './src/navigators/Routes';
import { AuthProvider } from './src/providers/AuthProvider';
import FlashMessage from "react-native-flash-message";
const App = () => {



return (
      <AuthProvider>
        <Routes/>
        <FlashMessage position="top"/>
      </AuthProvider>

  );
};


export default App;
