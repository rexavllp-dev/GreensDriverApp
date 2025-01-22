import React, { useState, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppStack from '../navigators/AppStack';
import AuthStack from '../navigators/AuthStack';
import { AuthContext } from '../providers/AuthProvider';
import ProgressLoader from 'rn-progress-loader';
import SplashScreen from '../screens/SplashScreen';

const Routes = () => {


    const { loggedin, spinner, checkLoggin } = useContext(AuthContext);

    const [isSplashVisible, setIsSplashVisible] = useState(true);

    useEffect(() => {
        // Simulate splash screen duration and check login status
        const timer = setTimeout(() => {
            setIsSplashVisible(false);
            checkLoggin(); // Perform the login check after the splash screen
        }, 700);

        return () => clearTimeout(timer); // Clean up the timer
    }, [checkLoggin]);

    // Show the splash screen if it is visible
    if (isSplashVisible) {
        return <SplashScreen />;
    }



    return (

        <NavigationContainer>
            <ProgressLoader
                visible={spinner}
                isModal={true} isHUD={true}
                hudColor={"#ffff"}
                color={"#000"} />
            {(!loggedin) ? <AuthStack /> : <AppStack />}
        </NavigationContainer>
    );
}

export default Routes;