import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Colors } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";
import { showMessage, hideMessage } from "react-native-flash-message";
import QRCodeScanner from 'react-native-qrcode-scanner';
import { AuthContext } from '../providers/AuthProvider';
import { SCLAlert, SCLAlertButton } from 'react-native-scl-alert';

const QrScan = ({ route, navigation }) => {

  const { setSpinner } = useContext(AuthContext);
  const [scanner, setScanner] = useState();
  const [bottommsg, setBottommsg] = useState();
  const [alertshow, setAlertshow] = useState(false);
  const [amount, setAmount] = useState(0);
  const [rvnumber, setRvnumber] = useState(0);


  useEffect(() => {

    const abortController = new AbortController();

    const checkScannedStatus = async () => {

      let signal = abortController.signal;
      setSpinner(true);
      const token = await AsyncStorage.getItem('userSession');
      await axios.get('/check_scanned/' + route.params.order.id, { signal: signal }, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
        .then(function (response) {

          if (response.data == 1) {
            navigation.replace('orders');
          }

          if (response.data == 2) {

            setAlertshow(true);
          }
          setSpinner(false);

        })
        .catch(function (error) {

          console.log(error);
          setSpinner(false);

        });
    }


    checkScannedStatus();

    return () => { abortController.abort() }

  }, []);

  const handleStatusClose = async () => {
    setAlertshow(true);
  }


  const cashReceived = async () => {

    const cashcontroller = new AbortController();
    if (amount != '' && rvnumber != '') {

      setSpinner(true);
      const token = await AsyncStorage.getItem('userSession');
      await axios.get('/cash_recieved/' + route.params.order.id + '/' + amount + '/' + rvnumber, { signal: cashcontroller.signal }, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
        .then(function (response) {

          setSpinner(false);
          setAlertshow(false);
          navigation.replace('orders');

        })
        .catch(function (error) {

          console.log(error);

        });
    } else {

      alert('Enter Amount / Rv Number');
    }
    return () => cashcontroller.abort()
  }

  const onSuccess = async (e) => {


    setSpinner(true);
    const token = await AsyncStorage.getItem('userSession');
    const user_id = await AsyncStorage.getItem('userId');

    const verifycontroller = new AbortController();

    await axios.get('/check_qr/' + route.params.order.id + '/' + e.data + '/' + user_id, { signal: verifycontroller.signal }, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(function (response) {

        setSpinner(false);


        setBottommsg('');
        setBottommsg(response.data.msg);
        showMessage({

          message: "",
          description: response.data.msg,
          type: response.data.status,
          fontStyle: { fontSize: 20 }

        });

        if (response.data.status == 'success') {

          if (route.params.order.payment_method == 'Cash On Delivery' && route.params.order.cash_received == 0) {

            setAlertshow(true);

          } else {

            setTimeout(() => {
              navigation.replace('orders');
            }, 1000);

          }

        } else {

          scanner.reactivate();
        }

      })
      .catch(function (error) {

        console.log(error);
        showMessage({

          message: "",
          description: 'Invalid QR code',
          type: 'error',
          style: { fontSize: 30 }


        });
        setBottommsg('Invalid QR code');
        setSpinner(false);
        scanner.reactivate();

      });

    return () => verifycontroller.abort()

  }


  return (

    <View style={styles.container}>

      {/* Alerts */}

      <SCLAlert
        theme="info"
        show={alertshow}
        onRequestClose={handleStatusClose}
        title="Cash On Delivery"
        subtitleStyle={{ fontWeight: 'bold', fontSize: 25 }}
        subtitle={route.params.order.total.formatted}
      >

        <Text style={{ color: Colors.Greens_Black, marginTop: 15 }}>Amount</Text>
        <TextInput
          onChangeText={setAmount}
          placeholder="Enter Amount"
          placeholderTextColor={Colors.Greens_Black}
          value={amount}
          style={styles.inputText}
        />

        <Text style={{ color: Colors.Greens_Black, marginTop: 15 }}>RV Number</Text>
        <TextInput
          onChangeText={setRvnumber}
          placeholder="Enter RV Number"
          placeholderTextColor={Colors.Greens_Black}
          value={rvnumber}
          style={styles.inputText}
        />


        <SCLAlertButton theme="success" onPress={() => cashReceived()}>Proceed</SCLAlertButton>
      </SCLAlert>

      {/* End Alerts */}

      <QRCodeScanner

        showMarker={true}
        ref={(node) => { setScanner(node) }}
        onRead={onSuccess}
        topContent={
          <Text style={styles.centerText}>
            Scan and Verify
          </Text>
        }
        bottomContent={
          <Text style={styles.bottomText}>{bottommsg}</Text>
        }
      />


    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
  },
  orderDetail: {
    padding: 10,
    top: 25,
    bottom: 25,
  },
  spacing: {
    marginTop: 85,
    marginBottom: 30
  },
  headText: {
    fontSize: 25,
    fontWeight: '600',
    textAlign: 'center',
    top: 85,
  },
  signinButton: {
    backgroundColor: Colors.Greens_Green,
    borderRadius: 20,
    marginHorizontal: 20,
    width: 220,
    height: 50,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
    borderColor: Colors.Greens_Green,
    borderWidth: 1,

  },
  signinButtonText: {
    fontWeight: "600",
    fontSize: 20,
    color: Colors.Greens_White,
    textAlign: 'center',
  },

  inputContainer: {

    paddingHorizontal: 0,
    marginHorizontal: 50,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.Greens_Green,
    justifyContent: "center",
    marginBottom: 15,
    width: 280,
    backgroundColor: Colors.Greens_White,
  },
  inputSubcontainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputText: {
    fontSize: 14,
    fontWeight: "300",
    color: Colors.Greens_Black,
    width: '100%',
    alignSelf: 'flex-start',
    borderColor: '#bdbdbd',
    borderWidth: 1
  },

  centerText: {

    color: Colors.Greens_Black,
    fontSize: 30,
    fontWeight: "600",
  },

});
export default QrScan;
