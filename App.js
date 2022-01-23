import React from 'react';
import { View } from 'react-native';
import { Modal, Portal, Text, Provider, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import ProgressCircle from 'react-native-progress-circle'
import vision from '@react-native-firebase/ml-vision';

import Toolbar from './toolbar';

const data = require('./data.json');
const materialNames = data.map(item => item.material);


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
    console.lof
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

  for (const material in materials) {
    materials[material] /= totalWeight;
  }

  return materials;
}

const getMaterialDescription = material => {
  for (const materialObj of data) {
    if (materialObj.material === material) {
      return materialObj.description;
    }
  }
}

const getMaterialScore = material => {
  for (const materialObj of data) {
    if (materialObj.material === material) {
      return materialObj.score;
    }
  }
}

const getGalleryImage = (callback) => {
  console.log('Getting image from gallery');
  launchImageLibrary({mediaType: 'photo'}, callback);
}

const getUri = (response) => {
  if (response.assets.length) {
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

  const showHelpModal = () => setHelpVisible(true);
  const hideHelpModal = () => setHelpVisible(false);
  const showResModal = () => setResVisible(true);
  const hideResModal = () => setResVisible(false);
  const containerStyle = {backgroundColor: 'grey', padding: 20, margin: 15};

  const imageCallback = response => {
    let uri = getUri(response);
    if (uri) {
      extractLines(uri).then(lines => {
        console.log('Extracted lines: ', lines);
        setMaterials(matchMaterials(lines));
        setCountry(matchCountry(lines));
        console.log([materials, country]);
        showResModal();
      });
    }
  }

  return (
    <View style={{flex: 1}}>
      <Provider>
        <Portal>
          <Modal visible={helpVisible} onDismiss={hideHelpModal} contentContainerStyle={containerStyle}>
            <Text>To use this app, simply point your camera at a clothing label and press the camera icon below. You can also choose an image from your device by pressing the gallery icon.</Text>
          </Modal>
          <Modal visible={resVisible} contentContainerStyle={{ margin: 10}}>
            {Object.entries(materials).sort((a, b) => {
                let x = a[1];
                let y = b[1];
                return x - y;
              }).map(([material, proportion]) => {
                let bgColor = getMaterialScore(material) > 0.5 ? 'green' : 'red';
                return (
                  <Card style={{margin: 5}}>
                    <Card.Content>
                      <Title style={{color: bgColor}}>{Math.floor(proportion * 100)}% {capitalizeFirstLetter(material)}</Title>
                      <Paragraph>{getMaterialDescription(material)}</Paragraph>
                    </Card.Content>
                  </Card>
                );
            })}
            {country && <View style={{height: 15}}/>}
            {country && <Card style={{margin: 5}}>
              <Card.Content>
                <Title style={{color: 'orange'}}>Country of origin: {capitalizeFirstLetter(country)}</Title>
                <Paragraph>1200 air miles. Not bad, but could be better.</Paragraph>
              </Card.Content>
            </Card>}
            <View style={{marginTop: 30, alignSelf: 'center', marginBottom: 20, flexDirection: 'row'}}>
              <View style={{alignSelf: 'center',flexDirection: 'row', paddingBottom: 3, paddingRight: 20}}>
                <Text style={{fontSize: 20}}>Overall score: </Text>
              </View>
              <ProgressCircle
                  percent={45}
                  radius={50}
                  borderWidth={8}
                  color="orange"
                  shadowColor="#AAA"
                  bgColor="#222"
              >
                <Text style={{ fontSize: 18 }}>{'45%'}</Text>
              </ProgressCircle>
            </View>
            <View style={{height: 40}}/>
          </Modal>
        </Portal>
      </Provider>

      <Toolbar onPressGallery={() => getGalleryImage(imageCallback)} onPressHelp={showHelpModal} onReturn={hideResModal} resVisible={resVisible}/>
    </View>
  );
};
export default App;
