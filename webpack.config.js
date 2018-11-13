const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const dist = 'dist';

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: '[name]-[hash:6].js',
        path: path.resolve(__dirname, dist)
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    devtool: 'source-map',
    devServer: {
        contentBase: `./${dist}`
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'public', to: '' },
        ]),
        new HtmlWebpackPlugin({
            title: 'Output Management'
        }),
        new CleanWebpackPlugin([dist]),
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    }
};
