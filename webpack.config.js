const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: '[name].[contenthash].js',
		clean: true,
  	},
  	mode: isDevelopment ? 'development' : 'production',
  	devtool: isDevelopment ? 'cheap-module-source-map' : 'source-map',
	devServer: {
		static: {
    		directory: path.join(__dirname, 'public'),
    	},
    	hot: true,
    	historyApiFallback: true,
    	port: 3000,
  	},
	module: {
		rules: [
		{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					configFile: path.resolve(__dirname, 'babel.config.js'),
				},
			},
		},
		{
			test: /\.css$/,
			use: ['style-loader', 'css-loader', 'sass-loader'],
		},
		{
			test: /\.svg$/,
			issuer: /\.[jt]sx?$/,
				use: [
					{
						loader: '@svgr/webpack',
						options: {
							svgoConfig: {
								plugins: [
									{
										name: 'preset-default',
										params: {
											overrides: {
											removeViewBox: false
											},
										},
									},
								]
							},
						},
					},
				'file-loader',
			],
		},		  
		{
			test: /\.(png|jpe?g|gif|webp)$/i,
			type: 'asset',
		},
		],
	},
	resolve: {
		extensions: ['.js', '.jsx'],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './public/index.html',
			favicon: './public/favicon.ico',
		}),
		isDevelopment && new ReactRefreshWebpackPlugin(),
	].filter(Boolean),
	optimization: {
		splitChunks: {
			chunks: 'all',
		},
		runtimeChunk: {
			name: 'runtime',
		},
	},
};