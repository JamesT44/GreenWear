import React, { useRef } from 'react';

import { View } from 'react-native';
import { Modal, Portal, Text, Provider, Card, Title, Paragraph, Snackbar } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import ProgressCircle from 'react-native-progress-circle'
import vision from '@react-native-firebase/ml-vision';

import Toolbar from './toolbar';
import Camera from './components/camera';

const materialsData = require('./data/materials.json');
const materialNames = materialsData.map(item => item.material);

const countriesData = require('./data/countries.json');

// find distance between two coords on sphere
const haversineDistance = (coords1, coords2) => {
  const toRad = x => x * Math.PI / 180;

  const lon1 = coords1[0];
  const lat1 = coords1[1];
  const lon2 = coords2[0];
  const lat2 = coords2[1];

  const R = 6371; // km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.floor(d);
}


const percentColors = [
  { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
  { pct: 0.5, color: { r: 0xff, g: 0xa5, b: 0 } },
  { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } } ];

const getColorForPercentage = pct => {
  for (var i = 1; i < percentColors.length - 1; i++) {
      if (pct < percentColors[i].pct) {
          break;
      }
  }
  var lower = percentColors[i - 1];
  var upper = percentColors[i];
  var range = upper.pct - lower.pct;
  var rangePct = (pct - lower.pct) / range;
  var pctLower = 1 - rangePct;
  var pctUpper = rangePct;
  var color = {
      r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
      g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
      b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
  };
  return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
};

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
}
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
}

const getMaterialDescription = material => {
  for (const materialObj of materialsData) {
    if (materialObj.material === material) {
      return materialObj.description;
    }
  }
}

const getMaterialScore = material => {
  for (const materialObj of materialsData) {
    if (materialObj.material === material) {
      return materialObj.score;
    }
  }
}

const getCountryCoordinates = country => {
  for (const countryObj of countriesData) {
    if (countryObj.name.toLowerCase() == country) {
      return [countryObj.longitude, countryObj.latitude];
    }
  }
  return [0, 0];
}

const currCoordinates = getCountryCoordinates("united kingdom");

const calculateOverallScore = (materials, distance) => {
  let res = 0;
  if (Object.keys(materials).length === 0) {
    res = 50;
  } else {
    for (const [material, proportion] of Object.entries(materials)) {
      res += proportion * getMaterialScore(material);
    }
  }

  if (distance <= 500) {
    res += 0.1;
    if (res > 1) {
      res = 1;
    }
  } else if (distance >= 2500) {
    res -= 0.1;
    if (res < 0) {
      res = 0;
    }
  }

  return Math.round(res * 100);
}

const getGalleryImage = (callback) => {
  console.log('Getting image from gallery');
  launchImageLibrary({mediaType: 'photo'}, callback);
}

const getUri = (response) => {
  if (response.assets) {
    return response.assets[0].uri;
  }
  return null;
}

const capitalizeFirstLetter = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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
        
        if ((!materialsRes || Object.keys(materialsRes).length === 0) && countryRes == null) {
          setErrorVisible(true);
          return;
        }

        if (countryRes) {
          let distanceRes = haversineDistance(currCoordinates, getCountryCoordinates(country));
          setDistance(distanceRes);

          if (distanceRes >= 2500) {
            setDistanceTitleColor('red');
            setDistanceMsg('This item has a very high carbon footprint. Try considering other options.');
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
  }

  return (
    <View style={{flex: 1}}>
      <Provider>
        {!resVisible && <Camera ref={cameraRef} />}
        <Portal>
          <Modal visible={helpVisible} onDismiss={hideHelpModal} contentContainerStyle={containerStyle}>
            <Text>To use this app, simply point your camera at a garment's materials label and press the camera icon below. Alternatively, you can choose an image from your device storage by pressing the gallery icon.</Text>
          </Modal>
          <Modal visible={resVisible} contentContainerStyle={{ margin: 10}}>
            {Object.entries(materials).sort((a, b) => {
                let x = a[1];
                let y = b[1];
                return x - y;
              }).map(([material, proportion]) => {
                let titleColor = getColorForPercentage(getMaterialScore(material));
                return (
                  <Card style={{margin: 5}}>
                    <Card.Content>
                      <Title style={{color: titleColor}}>{Math.floor(proportion * 100)}% {capitalizeFirstLetter(material)}</Title>
                      <Paragraph>{getMaterialDescription(material)}</Paragraph>
                    </Card.Content>
                  </Card>
                );
            })}
            {country && <View style={{height: 15}}/>}
            {country && <Card style={{margin: 5}}>
              <Card.Content>
                <Title style={{color: distanceTitleColor}}>Country of origin: {capitalizeFirstLetter(country)}</Title>
                <Paragraph>This product travelled {distance}km. {distanceMsg}</Paragraph>
              </Card.Content>
            </Card>}
            <View style={{marginTop: 30, alignSelf: 'center', marginBottom: 20, flexDirection: 'row'}}>
              <View style={{alignSelf: 'center',flexDirection: 'row', paddingBottom: 3, paddingRight: 20}}>
                <Text style={{fontSize: 20}}>Eco-score: </Text>
              </View>
              <ProgressCircle
                  percent={calculateOverallScore(materials)}
                  radius={50}
                  borderWidth={8}
                  color={getColorForPercentage(calculateOverallScore(materials) / 100)}
                  shadowColor="#AAA"
                  bgColor="#222"
              >
                <Text style={{ fontSize: 18 }}>{calculateOverallScore(materials, distance) + '%'}</Text>
              </ProgressCircle>
            </View>
            <View style={{height: 40}}/>
          </Modal>
        </Portal>
      </Provider>
      <Snackbar
        style={{marginBottom: 70, backgroundColor: '#777'}}
        visible={errorVisible}
        onDismiss={() => setErrorVisible(false)}
        duration={3000}>
        Poor image quality. Please try again.
      </Snackbar>
      <Toolbar onPressCamera={() => cameraRef.current.takePicture().then(imageCallback)} onPressGallery={() => getGalleryImage((res) => imageCallback(getUri(res)))} onPressHelp={showHelpModal} onReturn={hideResModal} resVisible={resVisible}/>
    </View>
  );
};
export default App;