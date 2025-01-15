import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PendingScreen from './PendingScreen';
import OngoingScreen from './OngoingScreen';
import CompletedScreen from './CompletedScreen';
import { AuthContext } from '../providers/AuthProvider';
import { Colors } from "../constants";


const Tab = createMaterialTopTabNavigator()

const TabNavigator = () => {

    const { pendingcount, onGoingCount } = useContext(AuthContext);

    return <View style={styles.container}>
        <Tab.Navigator screenOptions={{
            tabBarLabelStyle: { fontSize: 12 },
        }} >
            <Tab.Screen name='Pending' component={PendingScreen} options={{
                tabBarBadge: () => { return (<Text style={{ marginTop: 10, textAlign: 'center', width: 25, height: 25, padding: 2, fontWeight: 'bold', color: Colors.Greens_White, fontSize: 15, borderRadius: 20, backgroundColor: 'red' }}>{pendingcount}</Text>) }
            }} />
            <Tab.Screen
                name='Ongoing' component={OngoingScreen} options={{
                    tabBarBadge: () => { return (<Text style={{ marginTop: 10, textAlign: 'center', width: 25, height: 25, padding: 2, fontWeight: 'bold', color: Colors.Greens_White, fontSize: 15, borderRadius: 20, backgroundColor: 'red' }}>{onGoingCount}</Text>) }
                }}

            />

            <Tab.Screen
                name='Completed' component={CompletedScreen} />
        </Tab.Navigator>
    </View>
}


const styles = StyleSheet.create({
    container: {
        flex: 4, top: -10
    },
});




export default TabNavigator;