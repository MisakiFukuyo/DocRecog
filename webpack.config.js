var path = require('path');
module.exports = {
    entry: './es6/main.es6',
    output: {
        path: path.join(__dirname,'javascripts'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            { test: path.join(__dirname, 'es6'),
              loader: 'babel-loader' }
        ]
    }
};
