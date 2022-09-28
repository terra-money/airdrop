const webpack = require('webpack');
module.exports = function override(config) {

    config.plugins.push(new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }))

    config.plugins.push(new webpack.ProvidePlugin({
        process: 'process/browser',
    }))

    config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer'),
        stream: require.resolve("stream-browserify"),
        path: require.resolve("path-browserify"),
        crypto: require.resolve("crypto-browserify"),
    }
    
    config.ignoreWarnings = [/Failed to parse source map/];
    return config;
}