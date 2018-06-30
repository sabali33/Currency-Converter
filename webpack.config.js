const path = require('path');

module.exports = {
    entry: ['./Currency-Converter/app.js'],
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
     module: {
        rules: [
            {
                loader: 'babel-loader',
                test: /\.js$/,
                exclude: [
                    path.resolve(__dirname, "/node_modules/")
                ],
                include: [
                    path.resolve(__dirname, "app")
                ],
                options: {
                    presets: ["es2015"]
                }
            }
        ],
        
    },
    devServer: {
        port: 3000
     },
     mode: 'production'
};