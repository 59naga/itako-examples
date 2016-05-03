import webpack from 'webpack'

const config = {
  entry: './src',
  output: {
    path: `${__dirname}/release/`,
    filename: 'index.min.js'
    // libraryTarget: 'iife'
  },
  devServer: {
    contentBase: 'release',
    noInfo: true,
    quiet: true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel']
      }
    ]
  },

  devtool: '#source-map'
}

switch (process.env.NODE_ENV) {
  case 'production':
    config.plugins = [
      new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
    ]

    config.devtool = '#source-map'
    break

  default:
    config.devtool = 'inline-source-map'
}

export default config
