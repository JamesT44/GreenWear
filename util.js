import React from 'react';

import {getMaterialScore} from './data';

const percentColors = [
  {pct: 0.0, color: {r: 0xff, g: 0x00, b: 0}},
  {pct: 0.5, color: {r: 0xff, g: 0xa5, b: 0}},
  {pct: 1.0, color: {r: 0x00, g: 0xff, b: 0}},
];

export const getColorForPercentage = pct => {
  let i;
  for (i = 1; i < percentColors.length - 1; i++) {
    if (pct < percentColors[i].pct) {
      break;
    }
  }
  let lower = percentColors[i - 1];
  let upper = percentColors[i];
  let range = upper.pct - lower.pct;
  let rangePct = (pct - lower.pct) / range;
  let pctLower = 1 - rangePct;
  let pctUpper = rangePct;
  let color = {
    r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
    g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
    b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper),
  };
  return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
};

// find distance between two coords on sphere
export const haversineDistance = (coords1, coords2) => {
  const toRad = x => (x * Math.PI) / 180;

  const lon1 = coords1[0];
  const lat1 = coords1[1];
  const lon2 = coords2[0];
  const lat2 = coords2[1];

  const R = 6371; // km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.floor(d);
};

export const getUri = response => {
  if (response.assets) {
    return response.assets[0].uri;
  }
  return null;
};

export const calculateOverallScore = (materials, distance) => {
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
};
