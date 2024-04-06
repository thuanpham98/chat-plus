// const { ModuleFederationPlugin } = require('webpack').container;
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const path = require('path');
// const Dotenv = require('dotenv-webpack');


// const rootPath = path.resolve(__dirname, "");

// module.exports = {
//     node: {
//         __dirname: false,
//         __filename: false
//     },
//     resolve: {
//         extensions: ['.js', '.jsx', '.ts', '.tsx'],
//         // mainFields: ["main", "module", "browser"],
//         alias: {
//             "@": path.resolve(__dirname, "src/")
//         },

//     },
//     entry: {
//         main: './src/main.ts', // Entry point cho main.ts
//         preload: './src/preload.ts', // Entry point cho preload.ts
//         renderer: './src/renderer.ts', // Entry point cho renderer.ts
//     },
//     target: "electron-main",
//     devtool: "eval-source-map",
//     module: {
//         rules: [
//             {
//                 test: /\.(js|ts|tsx|jsx)$/,
//                 exclude: /node_modules/,
//                 include: /src/,
//                 use: {
//                     loader: 'ts-loader'
//                 },
//             },
// {
//     test: /\.(png|svg|jpg|jpeg|gif)$/i,
//     type: "asset/resource",
// },
// {
//     test: /\.svg$/,
//     use: [
//         {
//             loader: "@svgr/webpack",
//             options: {
//                 native: true,
//             },
//         },
//     ],
// },
//             {
//                 test: /\.css$/,
//                 use: [{ loader: "style-loader" }, { loader: "css-loader" }],
//             },
//         ],
//     },
//     output: {
//         path: path.resolve(rootPath, "dist/app"),
//         filename: "[name].js",
//         clean: true,
//     },
//     plugins: [
//         new Dotenv(),
//         new HtmlWebpackPlugin({ template: path.resolve(rootPath, "index.html") }),
//         new ModuleFederationPlugin({
//             name: "webpackHost",
//             filename: "remoteEntry.js",
//             remotes: {
//                 MiniAppChatWithWorld: `promise import("http://localhost:5000/mini_app_chat_with_world.js")`,
//             },
//         }),
//     ],
// };


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
    },

    output: {
        path: path.resolve(__dirname, 'dist/app'),
        filename: '[name].js',
        clean: true,
        publicPath: "auto",
        // assetModuleFilename: '[name][ext][query]'
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
                        return `${path}/[name][ext]`;
                    },
                }
            },
            // {
            //     test: /\.svg$/,
            //     use: [
            //         {
            //             loader: "@svgr/webpack",
            //             options: {
            //                 native: true,
            //             },
            //         },
            //     ],
            // },
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