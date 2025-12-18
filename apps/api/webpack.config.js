const { NxAppWebpackPlugin } = require("@nx/webpack/app-plugin");
const { join } = require("path");

module.exports = {
  output: {
    path: join(__dirname, "../../dist/apps/api"),
    devtoolModuleFilenameTemplate: "[absolute-resource-path]"
  },
  externalsPresets: { node: true },
  externals: {
    "@node-rs/argon2": "commonjs @node-rs/argon2",
    "*.node": "commonjs *.node"
  },
  devtool: "source-map",
  plugins: [
    new NxAppWebpackPlugin({
      target: "node",
      compiler: "tsc",
      main: "./src/main.ts",
      tsConfig: "./tsconfig.app.json",
      assets: [],
      optimization: false,
      outputHashing: "none",
      generatePackageJson: true
    })
  ],
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: "node-loader"
      }
    ]
  }
};
