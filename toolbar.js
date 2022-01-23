import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Toolbar = ({onPressGallery, onPressHelp}) => (
 <Appbar style={styles.toolbar}>
   <Appbar.Action
     icon={() => <MaterialIcons name='photo-camera' size={25}/>}
     onPress={() => console.log('Pressed snapshot')}
    />
    <Appbar.Action
     icon={() => <MaterialIcons name='photo-library' size={25}/>}
     onPress={onPressGallery} />
     <Appbar.Content />
     <Appbar.Action
      icon={() => <MaterialIcons name='help' size={25}/>}
      onPress={onPressHelp} />
  </Appbar>
 );

export default Toolbar

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#0079c1',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  }
});