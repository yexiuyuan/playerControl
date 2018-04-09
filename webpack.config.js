var webpack = require('webpack')

module.exports = {
  mode: 'development',
  entry: __dirname + '/src/index.js',
  output: {
    path: __dirname + '/builds',
    filename: 'bundle.js',
  },
  devServer: {
    inline: true,
    contentBase: __dirname + '/dist',
    port: 300
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
      }
    ],

  },
};