
export const formatLatLng = (value: String, pos: any): number => {
  const indexOfDot: number = value.indexOf('.');

  const valueWithoutDot = value.replace('.', '');

  if (indexOfDot === 7 || value.length === 7) {
    value =
      valueWithoutDot.substring(0, 2) + '.' + valueWithoutDot.substring(2);
  } else if (indexOfDot === 6 || value.length === 6) {
    value =
      valueWithoutDot.substring(0, 1) + '.' + valueWithoutDot.substring(1);
  } else {
    console.log(pos);
    throw 'Index out of bounds';
  }

 
  return Number(value);
};
