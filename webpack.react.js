const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const Dotenv = require('dotenv-webpack');

const rootPath = path.resolve(__dirname, "");

// interface Configuration extends WebpackConfiguration {
//   devServer?: WebpackDevServerConfiguration;
// }

module.exports = {
  node: { global: true, },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    mainFields: ["main", "module", "browser"],
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  },
  entry: path.resolve(rootPath, "src/index.tsx"),
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
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          // publicPath: "images",
          // outputPath: "images",
          // filename: '[name][ext][query]'
          filename: (name) => {
            /**
             * @description Remove first & last item from ${path} array.
             * @example
             *      Orginal Path: 'src/images/avatar/image.jpg'
             *      Changed To: 'images/avatar'
             */
            const path = name.filename.split("/").slice(2, -1).join("/");
            return `${path}[name][ext]`;
          },
        }
      },
      // {
      //   test: /\.svg$/,
      //   use: [
      //     {
      //       loader: "@svgr/webpack",
      //       options: {
      //         native: true,
      //       },
      //     },
      //   ],
      // },
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
