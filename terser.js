module.exports = {
    terserOptions: {
        compress: {
            arrows: false,
            collapse_vars: false,
            comparisons: false,
            computed_props: false,
            hoist_funs: false,
            hoist_props: false,
            hoist_vars: false,
            inline: false,
            loops: false,
            negate_iife: false,
            properties: false,
            reduce_funcs: false,
            reduce_vars: false,
            switches: false,
            toplevel: false,
            typeofs: false,
            booleans: true,
            if_return: true,
            sequences: true,
            unused: true,
            conditionals: true,
            dead_code: true,
            evaluate: true,
            drop_console: false,
            drop_debugger: true,
        },
        keep_fnames: true, // 修复：组件名称默认为 class name 导致 vue-create-api 创建的全局方法在 build 时候被混淆，全局获取不到
        mangle: {
            safari10: true,
        },
    },
    // reset options.productionSourceMap
    sourceMap: false,
    cache: true,
    // reset options.parallel
    parallel: true,
};