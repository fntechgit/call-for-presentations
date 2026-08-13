// Babel config used by jest (babel-jest). It is scoped to the "test" env so the
// webpack build is left untouched: webpack.common.js configures babel-loader
// with inline presets, and for non-test envs this file contributes nothing.
module.exports = {
    env: {
        test: {
            presets: [
                ['@babel/preset-env', { targets: { node: 'current' } }],
                '@babel/preset-react',
                '@babel/preset-flow'
            ]
        }
    }
};
