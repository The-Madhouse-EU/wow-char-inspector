/* eslint-disable @typescript-eslint/no-var-requires,import/no-extraneous-dependencies */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/renderer.tsx',
  target: 'web',
  devtool: 'source-map',
  performance: {
    hints: false,
  },
  devServer: {
    static: path.join(__dirname, '..', '/electron/res/ui/renderer.js'),
    compress: true,
    port: 9000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        include: /src/,
        use: [{ loader: 'ts-loader' }],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              // Needed for carbon deprecated function can be removed on carbon update
              sassOptions: {
                quietDeps: true,
              },
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  output: {
    path: `${__dirname}/../electron/res/ui`,
    filename: 'renderer.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      meta: {},
    }),
  ],
};
