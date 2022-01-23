import React from 'react';
import {StyleSheet, View} from 'react-native';
import {RNCamera} from 'react-native-camera';

export default class CameraScreen extends React.Component {
  state = {
    type: 'back'
  };

  takePicture = async function () {
    if (this.camera) {
      const data = await this.camera.takePictureAsync();
      return data.uri;
    }
  };

  renderCamera() {
    return (
      <RNCamera
        ref={ref => {
          this.camera = ref;
        }}
        captureAudio={false}
        style={{
          flex: 1,
          justifyContent: 'space-between',
        }}>
      </RNCamera>
    );
  }

  render() {
    return <View style={styles.container}>{this.renderCamera()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#000',
  },
});
