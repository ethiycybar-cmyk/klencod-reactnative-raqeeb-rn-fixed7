module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    // must stay last
    'react-native-worklets/plugin',
  ],
};
