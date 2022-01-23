import React, {useRef} from 'react';

import {View} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Provider,
  Card,
  Title,
  Paragraph,
} from 'react-native-paper';
import {launchImageLibrary} from 'react-native-image-picker';
import vision from '@react-native-firebase/ml-vision';

import Toolbar from './components/toolbar';
import Camera from './components/camera';
import RetrySnackbar from './components/retrySnackbar';
import TotalScore from './components/totalScore';
import {
  getColorForPercentage,
  haversineDistance,
  getUri,
  calculateOverallScore,
} from './util';
import {
  getMaterialDescription,
  getCountryCoordinates,
  getMaterialScore,
  materialNames,
  currCoordinates
} from './data.js';

async function extractLines(localPath) {
  const processed = await vision().textRecognizerProcessImage(localPath);
  let lines = [];
  processed.blocks.forEach(block => {
    block.lines.forEach(line => {
      lines.push(line.text);
    });
  });
  return lines;
}

const matchCountry = lines => {
  let re = /made in ([a-z]+)/;
  for (const line of lines) {
    let matches = re.exec(line.toLowerCase());
    if (matches !== null) {
      return matches[1];
    }
  }

  return null;
};
const matchMaterials = lines => {
  let re = new RegExp('(\\d+) ?% (' + materialNames.join('|') + ')');
  let materials = {};
  let totalWeight = 0;
  for (const line of lines) {
    let matches = re.exec(line.toLowerCase());
    if (matches !== null) {
      if (matches[2] in materials) {
        materials[matches[2]] += parseInt(matches[1]);
        totalWeight += parseInt(matches[1]);
      } else {
        materials[matches[2]] = parseInt(matches[1]);
        totalWeight += parseInt(matches[1]);
      }
    }
  }
  if (totalWeight === 0) {
    return {};
  }

  for (const material in materials) {
    materials[material] /= totalWeight;
  }

  return materials;
};

const getGalleryImage = callback => {
  console.log('Getting image from gallery');
  launchImageLibrary({mediaType: 'photo'}, callback);
};

const capitalizeFirstLetter = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const App = () => {
  const [helpVisible, setHelpVisible] = React.useState(false);
  const [resVisible, setResVisible] = React.useState(false);
  const [materials, setMaterials] = React.useState({});
  const [country, setCountry] = React.useState(null);
  const [distance, setDistance] = React.useState(0);
  const [distanceTitleColor, setDistanceTitleColor] = React.useState('green');
  const [distanceMsg, setDistanceMsg] = React.useState('Good job!');
  const [errorVisible, setErrorVisible] = React.useState(false);

  const cameraRef = useRef();

  const showHelpModal = () => setHelpVisible(true);
  const hideHelpModal = () => setHelpVisible(false);
  const showResModal = () => setResVisible(true);
  const hideResModal = () => setResVisible(false);
  const containerStyle = {backgroundColor: 'grey', padding: 20, margin: 15};

  const imageCallback = uri => {
    if (uri) {
      extractLines(uri).then(lines => {
        console.log('Extracted lines: ', lines);
        let materialsRes = matchMaterials(lines);
        setMaterials(materialsRes);
        let countryRes = matchCountry(lines);
        setCountry(countryRes);

        if (
          (!materialsRes || Object.keys(materialsRes).length === 0) &&
          countryRes == null
        ) {
          setErrorVisible(true);
          return;
        }

        if (countryRes) {
          let distanceRes = haversineDistance(
            currCoordinates,
            getCountryCoordinates(country),
          );
          setDistance(distanceRes);

          if (distanceRes >= 2500) {
            setDistanceTitleColor('red');
            setDistanceMsg(
              'This item has a very high carbon footprint. Try considering other options.',
            );
          } else if (distanceRes >= 500) {
            setDistanceTitleColor('orange');
            setDistanceMsg('Not bad but could be better.');
          } else {
            setDistanceTitleColor('green');
            setDistanceMsg('Good job!');
          }
        }
        showResModal();
      });
    }
  };

  return (
    <View style={{flex: 1}}>
      <Provider>
        {!resVisible && <Camera ref={cameraRef} />}
        <Portal>
          <Modal
            visible={helpVisible}
            onDismiss={hideHelpModal}
            contentContainerStyle={containerStyle}>
            <Text>
              To use this app, simply point your camera at a garment's materials
              label and press the camera icon below. Alternatively, you can
              choose an image from your device storage by pressing the gallery
              icon.
            </Text>
          </Modal>
          <Modal visible={resVisible} contentContainerStyle={{margin: 10}}>
            {Object.entries(materials)
              .sort((a, b) => {
                let x = a[1];
                let y = b[1];
                return x - y;
              })
              .map(([material, proportion]) => {
                let titleColor = getColorForPercentage(
                  getMaterialScore(material),
                );
                return (
                  <Card style={{margin: 5}}>
                    <Card.Content>
                      <Title style={{color: titleColor}}>
                        {Math.floor(proportion * 100)}%{' '}
                        {capitalizeFirstLetter(material)}
                      </Title>
                      <Paragraph>{getMaterialDescription(material)}</Paragraph>
                    </Card.Content>
                  </Card>
                );
              })}
            {country && <View style={{height: 15}} />}
            {country && (
              <Card style={{margin: 5}}>
                <Card.Content>
                  <Title style={{color: distanceTitleColor}}>
                    Country of origin: {capitalizeFirstLetter(country)}
                  </Title>
                  <Paragraph>
                    This product travelled {distance}km. {distanceMsg}
                  </Paragraph>
                </Card.Content>
              </Card>
            )}
            <TotalScore
              percentage={calculateOverallScore(materials, distance)}
            />
            <View style={{height: 40}} />
          </Modal>
        </Portal>
      </Provider>
      <RetrySnackbar
        errorVisible={errorVisible}
        setErrorVisible={setErrorVisible}
      />
      <Toolbar
        onPressCamera={() =>
          cameraRef.current.takePicture().then(imageCallback)
        }
        onPressGallery={() =>
          getGalleryImage(res => imageCallback(getUri(res)))
        }
        onPressHelp={showHelpModal}
        onReturn={hideResModal}
        resVisible={resVisible}
      />
    </View>
  );
};

export default App;
