import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LogInScreen from '../screens/LogInScreen';



const Stack = createStackNavigator()


const AuthStack = () => {
    return (
            
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" component={LogInScreen} />
            </Stack.Navigator>
        
    );
};

export default AuthStack;