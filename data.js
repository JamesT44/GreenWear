import react from 'react';

export const materialsData = require('./data/materials.json');
export const materialNames = materialsData.map(item => item.material);
export const countriesData = require('./data/countries.json');

export const getMaterialDescription = material => {
  for (const materialObj of materialsData) {
    if (materialObj.material === material) {
      return materialObj.description;
    }
  }
};

export const getMaterialScore = material => {
  for (const materialObj of materialsData) {
    if (materialObj.material === material) {
      return materialObj.score;
    }
  }
};

export const getCountryCoordinates = country => {
  for (const countryObj of countriesData) {
    if (countryObj.name.toLowerCase() == country) {
      return [countryObj.longitude, countryObj.latitude];
    }
  }
  return [0, 0];
};

export const currCoordinates = getCountryCoordinates('united kingdom');
