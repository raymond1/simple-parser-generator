const path = require('path')
const webConfig = {
	target: 'web',
	mode: 'none',
	context: path.resolve(__dirname, 'code'),
	entry: {
		web_parser: "./parser.js",
	},
	output: {
		filename: '[name].js',
		path: __dirname + '/releases'
	}
}

const nodeConfig = {
	target: 'node',
	mode: 'none',
	context: path.resolve(__dirname, 'code'),
	entry: {
		node_parser: "./parser.js",
	},
	output: {
		filename: '[name].js',
		path: __dirname + '/releases'
	}
}
module.exports = [ nodeConfig, webConfig ];