
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.dev');

var devServer = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  proxy: {
    '/api/*': 'http://localhost:8080/'
  }
}).listen(3000, 'localhost', function(err, result) {
  if (err) {
    return console.error(err)
  }
  console.log('Listening at http://localhost:3000/')
})