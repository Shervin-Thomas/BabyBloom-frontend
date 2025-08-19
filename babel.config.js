module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      ['module-resolver', {
        alias: {
          // This alias helps Metro resolve the internal 'resources' path within the openai package
          './resources/moderations.js': './node_modules/openai/resources/moderations.js',
          './resources/images.js': './node_modules/openai/resources/images.js',
          './resources/models.js': './node_modules/openai/resources/models.js',
          './resources/webhooks.js': './node_modules/openai/resources/webhooks.js',
          './resources/audio/audio.js': './node_modules/openai/resources/audio/audio.js',
          './resources/beta/beta.js': './node_modules/openai/resources/beta/beta.js',
          // Add other problematic resources here if more errors appear
        },
      }],
    ],
  };
};