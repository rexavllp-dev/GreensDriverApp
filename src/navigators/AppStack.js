import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LogInScreen from '../screens/LogInScreen';
import Orders from '../screens/Orders';
import OrderDetail from '../screens/OrderDetail';
import QrScan from '../screens/QrscanScreen';
import QrVerifyBox from '../screens/QrVerifyBoxScreen';
import UserLanding from '../screens/UserLanding';

import Upload from '../screens/Upload';
import VerifyOrders from '../screens/VerifyOrders';
import DeliveryReturn from '../screens/DeliveryReturn';
import SearchResults from '../screens/SearchResults';

const Stack = createStackNavigator()


const AppStack = () => {
    return (

        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="userlanding" component={UserLanding} />
            <Stack.Screen name="verifyorders" component={VerifyOrders} />
            <Stack.Screen name="orders" component={Orders} />
            <Stack.Screen name="delivery_returns" component={DeliveryReturn} />
            <Stack.Screen name="orderdetails" component={OrderDetail} />
            <Stack.Screen name="upload" component={Upload} />
            <Stack.Screen name="qrscan" component={QrScan} />
            <Stack.Screen name="qrverifybox" component={QrVerifyBox} />
            <Stack.Screen name="searchresults" component={SearchResults} />


        </Stack.Navigator>

    );
};

export default AppStack;