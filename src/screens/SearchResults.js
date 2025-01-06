import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView,  ImageBackground, Alert } from "react-native";
import { Colors } from "../constants";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from '../providers/AuthProvider';


import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../instance/axios-instance";

const SearchResults = ({route, navigation}) => {

    const {logout} = useContext(AuthContext);
    const [searchresults, setSearchresults]   = useState([]);
    const {setSpinner}                        = useContext(AuthContext);
    const [resultmsg, setResultmsg]           = useState('Searching...');

    useEffect(() =>{

        const abortController = new AbortController();

        const getSearchResult = async() =>{

                let signal = abortController.signal;    
                 setSpinner(true);
                 const token = await AsyncStorage.getItem('userSession');
                  axios.get('/search_orders/'+route.params.query, { signal: signal },{
                    headers: {
                      'Authorization': 'Bearer '+token
                    }
                  })
                  .then(function (response) { 
                    if(response.data.length == 0){
                        setResultmsg('No result found!');
                    }
                    setSearchresults(response.data);
                    setSpinner(false);

                  })
                  .catch(function (error) {
              
                    console.log(error);
              
                  });

        }
        getSearchResult();

        const unsubscribe = navigation.addListener('tabPress', e => {
            getSearchResult();
        });
        return () => { abortController.abort(), unsubscribe}

    }, []);


    const setStatus = async(order) => {
           
        setSpinner(true);
        const token = await AsyncStorage.getItem('userSession');
        const source = axios.get('/accept_delivery/'+order, {
          headers: {
            'Authorization': 'Bearer '+token
          }
        })
        .then(function (response) { 

          setPendingorders(response.data);
          setSpinner(false);
          
        })
        .catch(function (error) {
    
          console.log(error);
    
        });

        return () =>  source.cancel();

    }


    const setDeliveryStatus = async(order) => {

        Alert.alert(
           "Are your sure?",
           "Press YES to move this to out for delivery",
           [
             // The "Yes" button
             {
               text: "Yes",
               onPress: () => {
                   setStatus(order);
               },
             },
             // The "No" button
             // Does nothing but dismiss the dialog when tapped
             {
               text: "No",
             },
           ]
         );
   }
   

    const handleCurrentStatus = async(status, order) => {

        Alert.alert(
           "Notify customer the "+status+" status",
           "",
           [
             // The "Yes" button
             {
               text: "Yes",
               onPress: async () => {


                        if(status == 'delay'){

                                const token = await AsyncStorage.getItem('userSession');
                                axios.get('/order_postponed/'+order, {
                                headers: {
                                    'Authorization': 'Bearer '+token
                                }
                                })
                                .then(function (response) { 
                                    
                                    showMessage({

                                        message: "",
                                        description: 'Notified Customer',
                                        type: 'success',
                                        fontStyle:{fontSize:20}
                            
                            
                                    });
                                })  
                                .catch(function (error) {
                            
                                    console.log(error);
                            
                                });
                        }

                        if(status == 'arrived'){

                            const token = await AsyncStorage.getItem('userSession');
                            axios.get('/notifyarrival/'+order, {
                            headers: {
                                'Authorization': 'Bearer '+token
                            }
                            })
                            .then(function (response) { 
                                
                                showMessage({

                                    message: "",
                                    description: 'Notified Customer',
                                    type: 'success',
                                    fontStyle:{fontSize:20}        
                        
                                });
                            })
                            .catch(function (error) {
                        
                                console.log(error);
                        
                            });
                        }

               },
             },
             // The "No" button
             // Does nothing but dismiss the dialog when tapped
             {
               text: "No",
             },
           ]
         );
   }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.Greens_Red} translucent />

            <ImageBackground source={require("../Images/orders-bg.png")} style={styles.welcomeContainer}>
                <View style={styles.TextHolder}>
                
                    <Text style={styles.UserTxt}>Search Results</Text>
                </View>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <TouchableOpacity style={styles.signinButton} onPress={logout}>
                        <Icon size={28} color="white" name="logout" />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            
            <View style={styles.ContentHolder}>
            <ScrollView  
  showsVerticalScrollIndicator={true}>
            <View>
            { 
                (searchresults.length > 0) ?

                searchresults?.map((item) => {

                return <View key={item.id}>
                <View   style={styles.orders}>
                    <View style={styles.greenbox}>
                        <Text style={styles.ordertxt}>Order ID</Text>
                        <Text style={styles.ordertxt}># {item.id}</Text>
                        <View style={styles.payment}>
                            <Icon size={24} color="black" name="cash" />
                            <View style={styles.payment_content}>
                                <Text style={styles.typtxt}>{(item.payment_method == 'Cash On Delivery')? item.payment_method : 'Card Payment'}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.content_box}>
                        <View style={styles.viewmain}>
                            <TouchableOpacity
                                style={styles.viewButton}
                                onPress={() => navigation.navigate('orderdetails', {order:item})}
                            >
                                <Icon size={18} color="white" name="eye" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.customerDetail}>
                            <Text style={{color:Colors.Greens_Black}}>{item.customer_first_name}</Text>
                            <Text style={{color:Colors.Greens_Black}}>Phone: {item.customer_phone}</Text>
                            <Text style={styles.orderPrice}>{item.total.formatted }</Text>
                        </View>
                    </View>

                </View>


                {(item.status == 'ready_to_dispatch')? 

                <TouchableOpacity
                    style={styles.statusButton}
                    onPress={() => setDeliveryStatus(item.id)}
                    >
                    <Text style={styles.statusButtonText}>Out for Delivery</Text>
                    
                </TouchableOpacity>

                : (item.status == 'out_for_delivery') ?
                
                
                <View style={{ flexDirection:"row" }}>
                <View style={{ flex:1 }}>
                    <TouchableOpacity
                        style={styles.statusButtonDelay}
                        onPress={() => handleCurrentStatus('delay', item.id)}
                        >
                        <Text style={styles.statusButtonText}>Delay</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex:1 }}>
                    <TouchableOpacity
                        style={styles.statusButtonArrival}
                        onPress={() => handleCurrentStatus('arrived', item.id)}
                        >
                        <Text style={styles.statusButtonText}>Arrival</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex:1 }}>
                    <TouchableOpacity
                        style={styles.statusButtonCompleted}
                        onPress={() => navigation.replace('qrscan', {order:item})}
                        >
                        <Text style={styles.statusButtonText}>Complete</Text>
                    </TouchableOpacity>
                </View>
                </View>

                :


                <View></View> 
                
                }

            


                </View>
                }) 


            : 
            
            <View><Text style={{ alignSelf:'center', fontSize:20, color:Colors.Greens_Black }}>{resultmsg}</Text></View>

        }
        
            </View>
            </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        flex: 1,
    },
    UserTxt: {
        color: Colors.Greens_White,
        fontSize: 34,
        fontWeight: "600",
        bottom: 5,
    },
    TextHolder: {
        top: 100,
        left: 30,
    },
    signinButton: {
        borderRadius: 20,
        marginHorizontal: 20,
        width: '100%',
        height: 50,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    signinButtonText: {
        fontWeight: "600",
        fontSize: 20,
        color: Colors.Greens_Black,
    },
    welcomeContainer: {
        flex: 1,
        height: 200,
    },
    ContentHolder: {
        flex: 3,
        flexDirection: "column",
        padding: 10,
        height:'100%'
    },
    OrderNo: {
        padding: 25,
        backgroundColor: "#dadbdc",
        borderRadius: 10,
        marginTop: 5,
        flexDirection: "row",
    },
    bgrey: {

        padding: 15,
        paddingBottom:0,
        borderRadius:20
    },
    orders: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 10,
        marginBottom: 15,
        marginTop: 15,
        flexDirection: "row",
        shadowColor:Colors.Greens_Black,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 1,
        shadowRadius: 9.51,
        elevation: 4,
    },
    greenbox: {
        backgroundColor: Colors.Greens_Red,
        height: 100,
        width: 140,
        borderRadius: 10,
    },
    ordertxt: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        top: 10,
        fontWeight:'bold'
    },
    statusButton: {
        backgroundColor: '#c61116',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderColor: '#c61116',
        top: -14,
    },
    statusButtonText: {
        fontWeight: "600",
        fontSize: 16,
        color: '#fff',
    },
    payment: {
        backgroundColor: '#fff',
        borderRadius: 10,
        top: 20,
        flexDirection: "row",
        padding: 5,
        marginLeft: 3,
        marginRight: 3,
    },
    pmtxt: {
        fontSize: 10,
        textAlign: 'center',
    },
    typtxt: {
        fontSize: 12,
        color: '#c61116',
        fontWeight: "600",
        textAlign: 'center',
    },
    payment_content: {
        marginLeft: 5,
    },
    content_box: {
        marginLeft: 10,
        width:'58%'
    },
    viewButton: {

        backgroundColor: '#327F40',
        height: 30,
        width: 30,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50,
        right:10,
    },
    viewmain: {
        alignItems: 'flex-end',
    },
    customerDetail: {
        maxWidth: 140,
        bottom: 15,
    },
    orderPrice: {
        fontSize: 20,
        fontWeight: '600',
        top: 10,
        color:Colors.Greens_Black
    },
    screen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2f2f2",
        width: 200,
        alignSelf: "flex-end",
    },
    picker: {
        width: 200,
        height: 30,
        bottom: 20,
        marginTop: 30,
    },

    statusButtonDelay: {
        backgroundColor:Colors.Greens_Red,
        borderBottomLeftRadius: 20,
        // borderBottomRightRadius: 20,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderColor: '#00A300',
        top: -14,
    },

    statusButtonArrival: {

        backgroundColor:'#FAD02C',
        //borderBottomLeftRadius: 20,
        // borderBottomRightRadius: 20,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderColor: '#00A300',
        top: -14,
    },

    statusButtonCompleted: {
        backgroundColor: '#00A300',
        //borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderColor: '#00A300',
        top: -14,
    },

    
});

export default SearchResults;
