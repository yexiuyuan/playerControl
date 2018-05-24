var webpack = require('webpack')

module.exports = {
  mode: 'development',
  entry: __dirname + '/src/entry/pgcplayer.js',
  output: {
    path: __dirname + '/dist',
    publicPath: "/dist/",
    filename: 'pgcplayer.js',
  },
  devServer: {
    port: 9090,
  },
  resolve: {
    extensions: ['*', '.js', '.styl']
  },
  module: {
    rules: [{
        test: /\.js$/,
        loaders: ["babel-loader"],
        include: /src/
      },
      {
        test: /\.styl$/,
        loaders: ['style-loader', 'css-loader', 'stylus-loader'],
      },
      {
        test: /\.css/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader",
          options: {
            modules: false
          }
        }]
      },
      {
        test: /\.html/,
        loaders: ['html-loader']
      },
      {　　　　　
        test: /\.(png|jpg)$/,
        loader: 'url-loader?limit=8192'　　　
      }
    ],

  },
};