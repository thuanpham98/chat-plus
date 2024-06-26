const path = require('path');
const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    // Khai báo mục tiêu là electron-main
    target: 'electron-main',
    devtool: "eval-source-map",

    // Đường dẫn tới tệp entry của Electron main process
    entry: {
        main: './src/main.ts', // Entry point cho main.ts
        preload: './src/preload.ts', // Entry point cho preload.ts
        renderer: './src/renderer.ts', // Entry point cho renderer.ts
        "worker_process_image": "./src/infrastructure/processing-image/processing-image-worker.ts"
    },

    output: {
        path: path.resolve(__dirname, 'dist/app'),
        filename: '[name].js',
        clean: true,
        publicPath: "auto",
    },

    module: {
        rules: [
            {
                test: /\.(ts|js|tsx|jsx)$/,
                exclude: /node_modules/,
                use: { loader: 'ts-loader' },
            },
            {
                test: /\.css$/,
                use: [{ loader: "style-loader" }, { loader: "css-loader" }],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/i,
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
                        return path ? `${path}/[name][ext]` : `[name][ext]`;
                    },
                }
            },
        ],
    },

    resolve: {
        extensions: ['.ts', '.js', '.jsx', '.tsx'],
        alias: {
            "@": path.resolve(__dirname, "src/")
        }
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({ template: path.resolve(__dirname, "index.html") }),
        new ModuleFederationPlugin({
            name: "webpackHost",
            filename: "remoteEntry.js",
            remotes: {
                MiniAppChatWithWorld: `promise import("http://localhost:5000/mini_app_chat_with_world.js")`,
            },
        }),
    ],
};