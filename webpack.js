const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  target: "web",
  entry: path.resolve(__dirname, './src/index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist', 'browser'),
    filename: "browser.js",
    libraryTarget: 'window'
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      'crypto': path.resolve(__dirname, 'node_modules', 'crypto-browserify', 'index.js'),
      'https': path.resolve(__dirname, 'node_modules', 'https-browserify', 'index.js'),
      'os': path.resolve(__dirname, 'node_modules', 'os-browserify', 'main.js'),
      'stream': path.resolve(__dirname, 'node_modules', 'stream-browserify', 'index.js'),
    },
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer")
  }
  },
  module: {
    rules: [
      { test: /\.ts?$/, loader: "ts-loader", exclude: /node_modules/ }
    ]
  },
  optimization: {
    minimize: false,
  },
  externals: {
  
  },
  plugins: [
    new webpack.ProvidePlugin(
      {
        process: 'process/browser'
      }
    ),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
  }),
  ]
}