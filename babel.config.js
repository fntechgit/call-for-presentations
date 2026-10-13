// Shared by jest (babel-jest), eslint (@babel/eslint-parser) and webpack's babel-loader,
// which passes the same presets inline.
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-react",
    "@babel/preset-flow"
  ]
};
