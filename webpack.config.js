/* eslint-disable node/exports-style */

const HtmlWebPackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
  entry: './client/script.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg|png|jpeg|jpg|tif|gif|ico)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './client/login.html',
      filename: './login.html',
      favicon: './node_modules/@first-lego-league/user-interface/current/assets/img/first-favicon.ico',
      inject: 'head'
    })
  ],
  devServer: {
    hot: true
  }
}
