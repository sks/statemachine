const path = require('path'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    WorkboxPlugin = require('workbox-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    webpack = require('webpack');

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
            template: 'public/index.html'
        }),
        new CleanWebpackPlugin([dist]),
        new webpack.HotModuleReplacementPlugin(),
        new WorkboxPlugin.GenerateSW()
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
