const { override, addBabelPlugin, addWebpackModuleRule } = require('customize-cra');

module.exports = override(
  addWebpackModuleRule({
    test: /\.mjs/,
    include: /node_modules/,
    type: 'javascript/auto',
  },),
  addBabelPlugin([
    'babel-plugin-root-import',
    {
      paths: [
        {
          rootPathSuffix: 'src',
        },
      ],
    },
  ]),
);
