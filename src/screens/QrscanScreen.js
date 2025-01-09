import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";
import { showMessage } from "react-native-flash-message";
import QRCodeScanner from 'react-native-qrcode-scanner';
import { AuthContext } from '../providers/AuthProvider';

const QrScan = ({ route, navigation }) => {

  const { setSpinner } = useContext(AuthContext);
  const [scanner, setScanner] = useState(null);
  const [bottommsg, setBottommsg] = useState('');

  const resetScanner = () => {
    if (scanner) {
      scanner.reactivate();
      setBottommsg('You are not entered the payment amount or rv number please scan again'); 
    }
  };

    // Listen for the custom event
    useEffect(() => {
      const unsubscribe = navigation.addListener('resetScanner', () => {
      resetScanner();
    });

    return unsubscribe;
  }, [navigation, scanner]);

  const checkScannedStatus = async () => {
    try {
      console.log('checking ORDER ID ', route.params.order.orderId);

      setSpinner(true);

      const token = await AsyncStorage.getItem('userSession');
      const response = await axios.post(
        `driver/check_scanned/${route.params.order.orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('response qr', response.data);

      if (response.data === 1) {
        navigation.replace('orders');
      } else if (response.data === 2) {
        navigation.navigate('cashpayment', {
          orderId: route.params.order.orderId,
          total: route.params.order.ord_grand_total,
          onScanReset: resetScanner,
        });
      } else {
        setBottommsg(response.data.message);
        showMessage({
          message: "",
          description: response.data.message,
          type: "warning",
          fontStyle: { fontSize: 20 },
        });
      }

    } catch (error) {
      console.error(error);
      showMessage({
        message: "",
        description: "Error checking the scan status",
        type: "danger",
        fontStyle: { fontSize: 20 },
      });
    } finally {
      setSpinner(false);
    }
  };

  const onSuccess = async (e) => {
    try {
      setSpinner(true);
      const token = await AsyncStorage.getItem('userSession');

      const response = await axios.post(
        `driver/check_qr_code/${route.params.order.orderId}`,
        { qrCode: e.data },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBottommsg(response.data.message);
      alert(response.data.message);

      // showMessage({
      //   message: "",
      //   description: response.data.message,
      //   type: response.data.success ? 'success' : 'error',
      //   fontStyle: { fontSize: 20 },
      // });

      if (response.data.success) {
        if (route.params.order.ord_payment_method === 'Cash on Delivery' && !route.params.order.ord_cash_received) {
          navigation.navigate('cashpayment', {
            orderId: route.params.order.orderId,
            total: route.params.order.ord_grand_total,
            onScanReset: resetScanner,
          });
        } else {
          alert('Order completed successfully');
          setTimeout(() => navigation.replace('orders'), 1000);
        }
      } else {
        scanner.reactivate();
      }
    } catch (error) {
      console.error(error);
      showMessage({
        message: "",
        description: 'Invalid QR code',
        type: 'error',
        style: { fontSize: 30 },
      });
      setBottommsg('Invalid QR code');
      scanner.reactivate();
    } finally {
      setSpinner(false);
    }
  };

  useEffect(() => {

    checkScannedStatus();

    const unsubscribeFocus = navigation.addListener('focus', () => {
      resetScanner();
      checkScannedStatus();
    });

    const unsubscribeTabPress = navigation.addListener('tabPress', checkScannedStatus);

    return () => {
      unsubscribeFocus();
      unsubscribeTabPress();
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <QRCodeScanner
        showMarker={true}
        ref={node => setScanner(node)}
        onRead={onSuccess}
        topContent={<Text style={styles.centerText}>Scan and Verify</Text>}
        bottomContent={<Text style={styles.bottomText}>{bottommsg}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "column", flex: 1 },
  centerText: { color: Colors.Greens_Black, fontSize: 30, fontWeight: "600" },
  bottomText: { color: Colors.Greens_Black },
});

export default QrScan;
