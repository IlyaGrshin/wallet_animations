const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { RelativeCiAgentWebpackPlugin } = require('@relative-ci/agent');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

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
					presets: [
						["@babel/preset-env", { modules: false }],
						["@babel/preset-react", { runtime: "automatic", importSource: "react" }]
					],
					plugins: [
						"@babel/plugin-transform-runtime",
						["transform-react-remove-prop-types", { "removeImport": true }],
						isDevelopment && "react-refresh/babel"
					].filter(Boolean)
				},
			},
		},
		{
			test: /\.css$/,
			use: ['style-loader', 'css-loader', 'sass-loader'],
		},
		{
			test: /\.module\.scss$/,
			use: [
				'style-loader',
				{
					loader: 'css-loader',
					options: {
						modules: {
							localIdentName: isDevelopment
							? '[name]__[local]__[hash:base64:5]'
							: '[hash:base64:5]', 
						},
					},
				},
				'sass-loader',
			],
		},
		{
			test: /\.scss$/, 
			exclude: /\.module\.scss$/, 
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
                alias: {
                        'lottie-web': 'lottie-web/build/player/lottie_light',
                },
        },
	plugins: [
		new HtmlWebpackPlugin({
			template: './public/index.html',
			favicon: './public/favicon.ico',
		}),
		isDevelopment && new ReactRefreshWebpackPlugin(),
		new RelativeCiAgentWebpackPlugin(),
		new CaseSensitivePathsPlugin(),
	].filter(Boolean),
	optimization: {
		runtimeChunk: 'single',
	
		splitChunks: {
		  cacheGroups: {
			react: {                       
			  test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
			  name: 'react',
			  chunks: 'all',
			  priority: 20,
			  enforce: true,
			},
                        reactVendors: {
                          test: /[\\/]node_modules[\\/](react-dom[\\/]client|scheduler)[\\/]/,
                          name: 'react-vendors',
                          chunks: 'all',
                          priority: 25,
                          enforce: true,
                        },
                        vendors: {
                          test: /[\\/]node_modules[\\/](?!(react|react-dom)[\\/])/, 
                          name: 'vendors',
                          chunks: 'all',
                          priority: 10,
			},
		  },
		},
		
		minimizer: [
			new TerserPlugin({
			  terserOptions: {
				compress: { 
				  drop_console: true, 
				  drop_debugger: true,
				  pure_funcs: ['console.log', 'console.info', 'console.debug'],
				  passes: 2,
				},
				mangle: {
				  safari10: true,
				},
			  },
			  extractComments: false,
			}),
			new CssMinimizerPlugin(),
		],
	}
};