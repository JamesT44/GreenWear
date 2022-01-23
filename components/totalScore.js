import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import ProgressCircle from 'react-native-progress-circle';

import {getColorForPercentage} from '../util';

const TotalScore = ({percentage}) => {
  return (
    <View
      style={{
        marginTop: 10,
        alignSelf: 'center',
        marginBottom: 20,
        flexDirection: 'row',
      }}>
      <View
        style={{
          alignSelf: 'center',
          flexDirection: 'row',
          paddingBottom: 3,
          paddingRight: 20,
        }}>
        <Text style={styles.text}>Eco-score: </Text>
      </View>
      <ProgressCircle
        percent={percentage}
        radius={50}
        borderWidth={8}
        color={getColorForPercentage(percentage) / 100}
        shadowColor="#AAA"
        bgColor="#222">
        <Text style={styles.text}>{percentage + '%'}</Text>
      </ProgressCircle>
    </View>
  );
};

export default TotalScore;

const styles = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: 20,
  },
});
