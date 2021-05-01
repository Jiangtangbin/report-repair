const req: __WebpackModuleApi.RequireContext = require.context('@/assets/icons/svg', false, /\.svg$/);
const req2: __WebpackModuleApi.RequireContext = require.context('@/assets/icons/colours-svg', false, /\.svg$/);
const requireAll = (requireContext: __WebpackModuleApi.RequireContext) => requireContext.keys();

const re = /\.\/(.*)\.svg/;

const svgIcons: string[] = requireAll(req).concat(requireAll(req2)).map(i => {
    const iconName = i.match(re);
    return iconName ? iconName[1] : '';
}).filter(Boolean);

export default svgIcons;