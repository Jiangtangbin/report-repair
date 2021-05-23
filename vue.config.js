const TerserOptions = require('./terser');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const resolve = dir => path.join(__dirname, dir);

// 配置多页面主函数
const pages = {
    // pc 主函数
    index: {
        entry: 'src/main.ts',
        template: 'public/index.html',
        filename: 'index.html',
        chunks: ['chunk-libs', 'chunk-vendors', 'chunk-common', 'chunk-commons', 'runtime', 'index', 'index~mini', 'manifest'],
    },
    // mobile 主函数
    mini: {
        entry: 'src/mobile-main.ts',
        template: 'public/index.html',
        filename: 'mini.html',
        chunks: ['chunk-libs', 'chunk-vendors', 'chunk-common', 'chunk-commons', 'runtime', 'mini', 'index~mini', 'manifest'],
    },
};

module.exports = {
    outputDir: `../../dist/dist_ggj/dist`,
    // 对 node-modules 里的文件做兼容处理
    transpileDependencies: [
        'vue-echarts',
        'resize-detector',
        'vuex-module-decorators',
    ],
    productionSourceMap: false,
    // 多页面
    pages,
    // 不开启 eslint 模式
    lintOnSave: false,
    // 运行时编译
    // runtimeCompiler: true,
    css: {
        loaderOptions: {
            sass: {
                // 配置全局 scss 变量
                prependData: [
                    `@import "~@/assets/scss/variable.scss";`,
                    `@import "~@/assets/scss/utils.scss";`,
                ].join('\n'),
            },
        },
    },
    chainWebpack(config) {
        // 配置 svg 雪碧图 set svg-sprite-loader
        config.module
            .rule('svg')
            .exclude.add(resolve('src/assets/icons'))
            .end();
        config.module
            .rule('icons')
            .test(/\.svg$/)
            .include.add(resolve('src/assets/icons'))
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]',
            })
            .end();
        // 开发环境生成简短的 source-map
        config
            .when(
                process.env.NODE_ENV === 'development',
                config => config.devtool('cheap-source-map')
            );
        config
            .when(
                process.env.NODE_ENV !== 'development',
                config => {
                    config
                        .plugin('ScriptExtHtmlWebpackPlugin')
                        .after('html')
                        .use('script-ext-html-webpack-plugin', [{
                            // runtime 必须与 runtimeChunk 名称相同，默认值为 runtime
                            inline: /runtime\..*\.js$/,
                        }])
                        .end();
                    config
                        .optimization.splitChunks({
                            chunks: 'all',
                            cacheGroups: {
                                libs: {
                                    name: 'chunk-libs',
                                    test: /[\\/]node_modules[\\/]/,
                                    priority: 10,
                                    chunks: 'initial', // 仅包装最初依赖的第三方
                                },
                                commons: {
                                    name: 'chunk-commons',
                                    test: resolve('src/components'), // 自定义规则
                                    minChunks: 3, // 最低限度
                                    priority: 5,
                                    reuseExistingChunk: true,
                                },
                            },
                        });
                    config.optimization.runtimeChunk('single');
                }
            );
        config.when(
            process.env.NODE_ENV === 'production',
            config => {
                /**
                 * 生产环境去掉console.log、debugger、注释
                 * 修改 TerserOptions keep_fnnames
                 * 此处修改导致 vue.config.js 的配置项
                 * productionSourceMap 失效
                 * parallel 失效
                 * 如需修改请修改 terser.js
                 */
                config.optimization
                    .minimizer('terser')
                    .use(TerserPlugin, [TerserOptions]);

            }
        );
        // 删除多页面构建的预加载插件以防止无限递归 https://github.com/vuejs/vue-cli/issues/2463
        Object.keys(pages).forEach(page => {
            config.plugins.delete(`preload-${page}`);
            config.plugins.delete(`prefetch-${page}`);
        });
        config
            .plugin('fork-ts-checker')
            // 引进 fork-ts-checker-webpack-plugin 专门在一个进程中进行类型检查
            .use(require('fork-ts-checker-webpack-plugin'), [{
                // 终端 ts 是否进行提示
                silent: true,
            }]);
        // 生成包分析服务
        // config
        //   .plugin('webpack-bundle-analyzer')
        //   .use(BundleAnalyzerPlugin)
        //   .init(Plugin => new Plugin({
        //     analyzerPort: 8456
        //   }))
    },
    // 配置代理服务器
    devServer: {
        port: 8522,
        // 开发环境
        // proxy: 'http://192.168.4.132:9851',
        // 生产环境
        // proxy: 'http://122.112.176.222:8558/apis/',
        proxy: 'http://122.112.176.222:9605',
        // 允许通过本地域名访问
        disableHostCheck: true,
    },
};
