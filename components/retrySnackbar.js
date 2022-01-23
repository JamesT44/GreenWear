import React from 'react';
import {Snackbar} from 'react-native-paper';

const RetrySnackbar = ({errorVisible, setErrorVisible}) => {
  return (
    <Snackbar
      style={{marginBottom: 70, backgroundColor: '#777'}}
      visible={errorVisible}
      onDismiss={() => setErrorVisible(false)}
      duration={3000}>
      Poor image quality. Please try again.
    </Snackbar>
  );
};

export default RetrySnackbar;
