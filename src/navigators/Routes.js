import React, {useState, useContext, useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppStack from '../navigators/AppStack';
import AuthStack from '../navigators/AuthStack';
import { AuthContext } from '../providers/AuthProvider';
import ProgressLoader from 'rn-progress-loader';

const Routes = () =>{
    

    const {loggedin, spinner, checkLoggin} = useContext(AuthContext);

    useEffect(() => {

        checkLoggin();

    }, []);

    return(
        
       <NavigationContainer>
            <ProgressLoader
                visible={spinner}
                isModal={true} isHUD={true}
                hudColor={"#ffff"}
                color={"#000"} />
            {(!loggedin) ? <AuthStack/> : <AppStack/>}
       </NavigationContainer>
    );
}

export default Routes;