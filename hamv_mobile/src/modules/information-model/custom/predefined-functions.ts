export const functionMap = {
  tempCelsius: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '-- °C',
        icon: 'temperatur-icon',
      };
    }
    return {
      value: val,
      text: round(val, 2) + ' °C',
      icon: 'temperatur-icon',
    };
  },
  tempCelsiusToFahrenheit: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '-- °F',
        icon: 'thermostat',
      };
    }
    return {
      value: val,
      text: round(val * (9 / 5) + 32, 2) + ' °F',
      icon: 'thermostat',
    };
  },
  tempFahrenheit: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '-- °F',
        icon: 'thermostat',
      };
    }
    return {
      value: val,
      text: round(val, 2) + ' °F',
      icon: 'thermostat',
    };
  },
  tempFahrenheitToCelsius: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '-- °C',
        icon: 'temperatur-icon',
      };
    }
    return {
      value: val,
      text: round((val - 32) * 5 / 9, 2) + ' °C',
      icon: 'temperatur-icon',
    };
  },
  humidity: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '-- %',
        icon: 'humidity-icon',
      };
    }
    return {
      value: val,
      text: round(val, 2) + ' %',
      icon: 'humidity-icon',
    };
  },
  timer: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '--:--',
        icon: 'timer',
      };
    }
    let hour = val / 60 | 0;
    let min = val % 60;
    let hourS = hour < 10 ? '0' + hour : hour + '';
    let minS = min < 10 ? '0' + min : min + '';
    return {
      value: val,
      text: hourS + ':' + minS,
      icon: 'timer',
    };
  },
  text: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '--',
      };
    }
    return {
      value: val,
      text: round(val, 2) + '',
    };
  },
  pm25: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '-- μg/m³',
        icon: 'pm25-icon',
      };
    }
    return {
      value: val,
      text: round(val, 2) + ' μg/m³',
      icon: 'pm25-icon',
    };
  },
  pm10: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '-- μg/m³',
        icon: 'pm10-icon',
      };
    }
    return {
      value: val,
      text: round(val, 2) + ' μg/m³',
      icon: 'pm10-icon',
    };
  },
  co: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '-- ppm',
        icon: 'co-icon',
      };
    }
    return {
      value: val,
      text: round(val, 2) + ' ppm',
      icon: 'co-icon',
    };
  },
  co2: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '-- ppm',
        icon: 'co2-icon',
      };
    }
    return {
      value: val,
      text: round(val, 2) + ' ppm',
      icon: 'co2-icon',
    };
  },
  tvoc: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '-- ppm',
        icon: 'tvoc-icon',
      };
    }
    return {
      value: val,
      text: round(val / 1000, 3) + ' ppm',
      icon: 'tvoc-icon',
    };
  },
  hcho: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '-- ppm',
        icon: 'hcho-icon',
      };
    }
    return {
      value: val,
      text: round(val / 1000, 3) + ' ppm',
      icon: 'hcho-icon',
    };
  },
  o3: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '-- ppm',
        icon: 'o3-icon',
      };
    }
    return {
      value: val,
      text: round(val / 1000, 3) + ' ppm',
      icon: 'o3-icon',
    };
  },
  par: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '-- μmol/m²s',
        icon: 'par-icon',
      };
    }
    return {
      value: val,
      text: round(val / 1000, 3) + ' μmol/m²s',
      icon: 'par-icon',
    };
  },
  time: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '--',
      };
    }

    return {
      value: val,
      text: getTime(val) + '',
    };
  },
  aqi: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '--',
      };
    }
    if (val >= 0 && val <= 50) {
      return {
        value: val,
        text: round(val, 2) + '',
        icon: 'green-icon',
        fontColor: '#00E800',
      };
    }
    else if (val >= 51 && val <= 100) {
      return {
        value: val,
        text: round(val, 2) + '',
        icon: 'yellow-icon',
        fontColor: '#FFFF00',
      };
    }
    else if (val >= 101 && val <= 150) {
      return {
        value: val,
        text: round(val, 2) + '',
        icon: 'orange-icon',
        fontColor: '#FF7E00',
      };
    }
    else if (val >= 151 && val <= 200) {
      return {
        value: val,
        text: round(val, 2) + '',
        icon: 'red-icon',
        fontColor: '#FF0000',
      };
    }
    else if (val >= 201 && val <= 300) {
      return {
        value: val,
        text: round(val, 2) + '',
        icon: 'purple-icon',
        fontColor: '#8F3F97',
      };
    }
    else if (val >= 301) {
      return {
        value: val,
        text: round(val, 2) + '',
        icon: 'maroon-icon',
        fontColor: '',
      };
    }
    return {
      value: val,
      text: round(val, 2) + '',
    };
  },
  //create more from here
};

function round(value: number, precision: number) {
  const base = 10 ** precision;
  return Math.round(value * base) / base;
}

function getTime(value: number) {
  const currentDate: Date = new Date();
  currentDate.setTime(value * 1000);
  const year = currentDate.getFullYear();
  const month = getTimeString(currentDate.getMonth() + 1);
  const date = getTimeString(currentDate.getDate());
  const hour = getTimeString(currentDate.getHours());
  const minute = getTimeString(currentDate.getMinutes());
  const secound = getTimeString(currentDate.getSeconds());
  const fulldate = `${year}-${month}-${date} ${hour}:${minute}:${secound}`;
  return fulldate;
}

function getTimeString(value: number) {
  let timeString = `${value}`;
  if (timeString.length == 1) {
    timeString = '0' + timeString;
  }
  return timeString;
}