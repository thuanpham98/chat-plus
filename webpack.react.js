const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const Dotenv = require('dotenv-webpack');

const rootPath = path.resolve(__dirname, "");

module.exports = {
  node: { global: true, },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    mainFields: ["main", "module", "browser"],
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  },
  entry: {
    index: path.resolve(rootPath, "src/index.tsx"),
    "worker_process_image": path.resolve(rootPath, 'src/infrastructure/processing-image/processing-image-worker.ts')
  },
  target: "web",
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        include: /src/,
        use: {
          loader: "ts-loader",
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: (name) => {
            const path = name.filename.split("/").slice(2, -1).join("/");
            return path ? `${path}/[name][ext]` : `[name][ext]`;
          },
        }
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.resolve(rootPath, "dist/renderer"),
      publicPath: "/",
    },
    port: 8080,
    historyApiFallback: true,
    compress: true,
  },
  output: {
    path: path.resolve(rootPath, "dist/web"),
    filename: "[name].js",
    clean: true,
  },
  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({ template: path.resolve(rootPath, "index.html") }),
    new ModuleFederationPlugin({
      name: "webpackHost",
      filename: "remoteEntry.js",
      remotes: {
        MiniAppChatWithWorld: `promise import("http://localhost:5000/mini_app_chat_with_world.js")`,
      },
    }),
  ],
};
