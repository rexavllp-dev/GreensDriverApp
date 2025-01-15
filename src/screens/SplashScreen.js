import React, { useEffect, useRef } from 'react';
import { View, ImageBackground, StyleSheet, Animated, Image } from 'react-native';

const SplashScreen = () => {
    const scaleAnim = useRef(new Animated.Value(0)).current; // Scale animation
    const opacityAnim = useRef(new Animated.Value(0)).current; // Opacity animation

    useEffect(() => {
        // Sequential animation: Zoom in and then zoom out
        Animated.sequence([
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 1.2, // Zoom in slightly
                    duration: 700, // Duration in milliseconds
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1, // Fade in
                    duration: 700, // Match the scale duration
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(scaleAnim, {
                toValue: 1, // Zoom out to normal size
                duration: 300, // Smooth zoom-out duration
                useNativeDriver: true,
            }),
        ]).start();
    }, [scaleAnim, opacityAnim]);

    return (
        <ImageBackground
            source={require("../Images/orders-bg.png")}
            style={styles.background}
        >
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    },
                ]}
            >
                <Image
                    source={require("../Images/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 250,
        height: 250,
    },
});

export default SplashScreen;
