import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
// import DateTimePickerModal from "react-native-modal-datetime-picker";

const DatePicker = () => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    hideDatePicker();
  };

  return (
    <View>
        <TouchableOpacity
          style={styles.FilterButton}
          onPress={showDatePicker}
        >
          <Text style={styles.FilterButtonText}>Date</Text>
        </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};
const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        flex: 1,
    },
    FilterDiv: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: "flex-end",
        alignItems: "flex-end",
        backgroundColor: "#f2f2f2",
        width: 200,
        alignSelf: "flex-end",
        padding: 10,
    },
    FilterTxt: {
        fontWeight: '400',
        color: "#000",
        fontSize: 18,
    },
    FilterContent: {
        flex: 1,
        padding: 15,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    FilterButton: {
        padding: 10,
        backgroundColor: '#ccc6',
        borderRadius: 10,
        marginLeft: 5,
        top: 10,
    },
    FilterButtonText: {
        color: '#0006',
        fontSize: 12,
    }
});


export default DatePicker;