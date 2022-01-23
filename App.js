import React from 'react';
import Camera from './components/Camera';

import { View } from 'react-native';
import { Modal, Portal, Text, Button, Provider } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import vision from '@react-native-firebase/ml-vision';

import Toolbar from './toolbar';

const mockData = [["Skoljka Kabuk Material exterior/ Külső", "reteg/ /Buitenkant/ MeMopana", "lepiBAnua/ páälinen / Skal /Plst", "Virspuse 1Virsutinis sluoksnis /l-parti ta", "bara OCHOBHa TKaHHHa /Ljuska / Skelet", "(guackee)", "64% Viscose / Viskose Viscosa fWokno", "wiskozowe Viskoos / Bucaxosa Viskoza", "Viskoz /Váscoza Viszkóz 3 /BOKOTn", "(TEVnToueTdE)/ Viskoosi / Viskos", "Viskoza /Viskoze/Viskozé/Visk/ Bicxosa /", "Material viskoz", "31% Polyester/Polieéster/ Poliester/", "Poliestere/ Polūester/ Nonaoup", "Poliészter/ flonnectep", "TTOAUEOTEtpaç/ Polyesteri/ Poliesteris", "TaniecTep/Poliestër", "5% Elastane/Elastan/Elastano/Elasthan/", "Elastaan / Élastharne/3nacraH/Elasztán", "/Eracra/EaoToLEpns", "moAUOupEedvn/Elastaani/ Elastāns", "Elastanas", "exclusive of decoration/gamiture non", "comprise"],
["STrLE NO JP-56", "SHELL 100% NYLON", "BODY HOOD LINING", "100% POLYESTER", "SLEEVE LINING", "100% POLYESTER", "SITENO", "JP 56", "RESIN OATED"],
["SHELL/ENVELOPPE/BUITENK", "EXTERIOR/HEJ/PLAST/SVRCH", "EXTERIOR/YTRA BYROI/WARS", "ETRZNA/AUSSENMATERIAL", "RIVESTIMENTO ESTERNO/KES", "ISORINIS SLUOKSNIS:", "100 % NYLON/NYLON/NYLON", "NYLON/NEJLON/NYLON", "NYLON/NÆLON/NYLON", "NAIAON/NYLON/NAILON/", "NAILONAS", "LINING/DOUBLURE/VOERING/POD", "FORRO/BELES/PODSIVKA/PODSIVK", "REVESTIMENTO/FOdUR/MATERIAŁ", "SCIOŁKI/FUTTER/DOAPA/FODERA/", "VOODER/ODERE/PAMUSALAS:", "100 % POLYESTER/POLYESTER/POLY", "POLIESTER/POLIESTER/POLIES", "POLYESTER/POLYESTER/POLIÉ-", "PÓLYESTER/POLIESTER/POLYES", "nOAYEETEPAZ/POLIESTERE", "POLUESTER/POLIESTERS", "POLIESTERIS."],
["ONLY a SONS", "ONLY &sONS", "ww.onlyandsons.con", "le name/Nom de style", "onsTONY CARGO SHORTS AOP GW 9923", "Dessin/Modele 22009923", "on MypkGKon", "arerapns lopTbi", "EU Size: 32 Taille EU 32", "EU VELICINA: 32/32", "OVR number: 88216512", "CA number/Numéro de TVA: 57831", "RN number 149349", "WUx coN", "Made in China / Hergestellt in", "China abricado en China /", "Fabricado na China /Prodotto in", "Cina ( Wyprodukowano w Chiny", "Fremstileti Kina / Walmistatud", "Hinas / Fabrigué en Chine", "enaHo Kran / lzradenou Kini", "arejen na KitajskemCin'de", "edmistir 1 Fabricat In China", "2armazasi hely Kina/ Dibuat d", "nal Vervaardigd", "ina pouanoAaHO R Kra", "dapEudiera any Ka", "ainistiuomaa Kina/ Tilverka", "na / Vyroban0 V Cnehaut", "Mna PRgrnlmo dalia a", "Maghmil io Cn/Vrabgnd y"],
["karrimor", "S", "KEEP AWAY FROM FIRE", "TENIR ELOIGNE DES FLAMMES.uT DE", "BUURT VAN VUURLES.UIT DE", "PRIBLIZUJTE OGNJU.MAEN.NE", "ALEJADO DEL FUEGO.TARTSNER", "ATUZTOL.DRZTE V DOSAHUOO", "CHRANTE PRED OHNEM.MANTEA", "AFASTAD0 DO FOGO.HALDIo FJARRI", "ELDI.PRZECHOWYNAC Z DALA OD", "OGNIA VON FEUER FERNHALTEN.", "MAKPIA ANO TH OIA.TENERE", "LONTAN0 DAL FUOCO.HDA TULEST", "EEMALSARGAT NO UGUNS.", "SAUGOKITE NUG UGNIES", "MADE IN MYANMAR/FABRIQUE EN BIRM-", "ANIE/GEMAAKT IN MYANMAR/1ZDELANO-", "V MIANMARU/ARTICULO FABRICADO EN-", "BIRMANIA/MYANMARBAN GYARTVA/VYR-", "OBENE V MJANMARSKU/VYR0BENO V M-", "YANMARŲ/FABRICADO EM MANMAR/FR-", "AMLEITT I BURMA/WYPRODUKOWANO W-", "BIRMIE/HERGESTELLT IN MYANMAR/KATAZ-", "AP/PRODOTTO IN M-", "URMAS/RAZOTS", "NMARE", "KEYAZETA", "YAM"],
["VIero |", "SHELL:1", "100% Polyester", "SHELL:2", "100% Polyester", "367", "MADE IN TURKEY"]]

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

const materialNames = ['cotton', 'viscose', 'polyester', 'elastane', 'wool', 'silk', 'leather', 'nylon', 'acetate', 'acrylic', 'hemp'];

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

// console.log(matchMaterials(mockData[0]));

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

const App = () => {
    
  const [visible, setVisible] = React.useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {backgroundColor: 'grey', padding: 20, margin: 15};

  const imageCallback = response => {
    let uri = getUri(response);
    if (uri) {
      extractLines(uri).then(lines => {
        console.log('Extracted lines: ', lines);
        let materials = matchMaterials(lines);
        let country = matchCountry(lines);
        console.log([materials, country]);
      });
    }
  }

  return (
    <View style={{flex: 1}}>
      <Provider>
        <Portal>
          <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
            <Text>To use this app, simply point your camera at a clothing label and press the camera icon below. You can also choose an image from your device by pressing the gallery icon.</Text>
          </Modal>
        </Portal>
      </Provider>

      <Toolbar onPressGallery={() => getGalleryImage(imageCallback)} onPressHelp={showModal}/>
    </View>
  );
};
export default App;