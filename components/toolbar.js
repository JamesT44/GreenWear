import React from 'react';
import {Appbar, Button} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Toolbar = ({
  onPressCamera,
  onPressGallery,
  onPressHelp,
  onReturn,
  resVisible,
}) => {
  return (
    <Appbar style={styles.toolbar}>
      {!resVisible && (
        <React.Fragment>
          <Appbar.Action
            icon={() => (
              <MaterialIcons name="photo-camera" size={25} color="#ddd" />
            )}
            onPress={onPressCamera}
          />
          <Appbar.Action
            icon={() => (
              <MaterialIcons name="photo-library" size={25} color="#ddd" />
            )}
            onPress={onPressGallery}
          />
          <Appbar.Content />
          <Appbar.Action
            icon={() => <MaterialIcons name="help" size={25} color="#ddd" />}
            onPress={onPressHelp}
          />
        </React.Fragment>
      )}

      {resVisible && (
        <React.Fragment>
          <Button
            mode="contained"
            style={{backgroundColor: '#333', flex: 1, marginHorizontal: 15}}
            onPress={onReturn}>
            Return
          </Button>
        </React.Fragment>
      )}
    </Appbar>
  );
};

export default Toolbar;

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#777',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
