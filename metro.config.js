const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)
 
// Add this to handle .mjs and other potential extensions from node_modules
config.resolver.sourceExts.push('mjs');
config.resolver.sourceExts.push('cjs');
config.resolver.sourceExts.push('json');
 
module.exports = withNativeWind(config, { input: './global.css' })