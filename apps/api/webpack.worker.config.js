const path = require("path");

module.exports = {
  target: "node",
  mode: "production",
  entry: {
    "check-pass.worker": path.resolve(
      __dirname,
      "src/app/infrastructure/worker/check-pass.worker.ts"
    )
  },
  output: {
    path: path.resolve(__dirname, "../../dist/apps/api-worker"),
    filename: "[name].js",
    libraryTarget: "commonjs2"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  }
};
