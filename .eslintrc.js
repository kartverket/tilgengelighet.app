const fs = require('fs');
const path = require('path');



module.exports = {
  root: true,
  extends: [
    '@react-native-community/eslint-config',
    'eslint-config-prettier',
  ],
  rules: {
    'prettier/prettier': 0,
  },
};
