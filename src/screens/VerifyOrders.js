import React from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground, Dimensions, TouchableOpacity } from 'react-native';
import { Colors } from "../constants";
import SwipeItem from "../components/SwipeItem";

// Get screen dimensions for responsiveness
const { width, height } = Dimensions.get('window');

const VerifyOrders = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.Greens_Red} translucent />

            {/* Header Section with Background Image */}
            <ImageBackground
                source={require("../Images/orders-bg.png")}
                style={styles.welcomeContainer}
                resizeMode="cover"
            >
                <View style={styles.headerOverlay}>
                    <Text style={styles.headerText}>Verify Orders</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            {/* Content Section */}
            <View style={styles.contentHolder}>
                <SwipeItem />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    welcomeContainer: {
        height: height * 0.4,  // Adjusted header height based on screen size
        width: '100%',
        justifyContent: 'center',
        position: 'relative',
    },
    headerOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: height > 700 ? 50 : 30,  // Adjust padding based on screen size
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay for better text visibility
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerText: {
        color: Colors.Greens_White,
        fontSize: width > 400 ? 36 : 28,  // Responsive font size for title
        fontWeight: "700",
        textAlign: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 50,
    },
    backButtonText: {
        color: Colors.Greens_White,
        fontSize: 16,
        fontWeight: "600",
    },
    contentHolder: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        marginTop: -20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 20,
    },
});

export default VerifyOrders;
