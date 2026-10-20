const webpack = require('webpack');

const path = require('path');
const modules_path = path.resolve('./public/lib/apm');
const entry_path = path.resolve('./src/apm/index.js');

webpack({
  mode: 'production',
  target: 'web',
  entry: entry_path,
  output: {
    filename: 'web.js',
    path: modules_path,
  },

  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
}, (error, stats) => {
  if (error) {
    console.error(error);
    process.exit(0);
  }
  if (stats.compilation.errors.length) {
    console.error(stats.compilation.errors);
    process.exit(0);
  }
});
