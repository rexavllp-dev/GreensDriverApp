import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../instance/axios-instance';
import { showMessage } from 'react-native-flash-message';
import DeviceInfo from 'react-native-device-info';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  // console.log('user: ', user);
  const [unverifiedorders, setUnverifiedorders] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const [loggedin, setLoggedin] = useState(null);
  const [pendingcount, setPendingcount] = useState(0);
  const [onGoingCount, setOnGoingCount] = useState(0);
  const [deliveryReturnCount, setDeliveryReturnCount] = useState(0);




  const signin = async (email, password) => {
    setSpinner(true);
    try {
      const response = await axios.post('driver/driver_login', {
        usr_email: email,
        usr_password: password,
        device_name: DeviceInfo.getDeviceId(),
      });

      // console.log("response data", response.data);

      if (response.data.success) {
        setUser(response.data.result.user);
        setLoggedin(1);
        await AsyncStorage.setItem('userSession', response.data.result.token);
        await AsyncStorage.setItem('userDetails', JSON.stringify(response.data.result.user.usr_firstname));
        await AsyncStorage.setItem('userId', JSON.stringify(response.data.result.user.id));
        await AsyncStorage.setItem('email', JSON.stringify(email));
        await AsyncStorage.setItem('password', JSON.stringify(password));
      } else {
        alert(response.data.message);
        // showMessage({
        //   message: '',
        //   description: response.data.message,
        //   type: response.data.status,
        // });
      }
    } catch (error) {
      showMessage({
        message: 'Something went wrong',
        description: 'Network Error!!!',
        type: 'danger',
      });
    } finally {
      setSpinner(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userSession');
      await AsyncStorage.removeItem('userDetails');
      await AsyncStorage.removeItem('userId');

      setUser(null);
      setLoggedin(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const checkLoggin = async () => {
    try {
      const token = await AsyncStorage.getItem('userSession');

      const userdata = await AsyncStorage.getItem('userDetails');
      const usid = await AsyncStorage.getItem('userId');

      if (!token || !usid) {
        setLoggedin(null);
      } else {
        setLoggedin(1);
        setUser({ first_name: userdata });
      }
    } catch (error) {
      console.error('Error checking login:', error);
    }
  };

  const getUnverifiedorders = async () => {
    setSpinner(true);
    try {
      const token = await AsyncStorage.getItem('userSession');
      if (!token) {
        setLoggedin(null);
        return;
      }

      const response = await axios.get('/driver_unverified_orders/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUnverifiedorders(response.data);
    } catch (error) {
      console.error('Error fetching unverified orders:', error);
    } finally {
      setSpinner(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        spinner,
        loggedin,
        pendingcount,
        onGoingCount,
        deliveryReturnCount,
        unverifiedorders,
        setLoggedin,
        setPendingcount,
        setOnGoingCount,
        setDeliveryReturnCount,
        setSpinner,
        signin,
        logout,
        checkLoggin,
        getUnverifiedorders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
