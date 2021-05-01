/**
 * 参考 YDui 可伸缩布局方案
 *  [地址](!https://github.com/ydcss/vue-ydui/blob/master/src/ydui.flexible.js)
 * rem计算方式：设计图尺寸px / 100 = 实际 rem，例: 100px = 1rem
 */

(function (window) {
    /* 设计图文档宽度 */
    var docWidth = 720;
    var doc = window.document;
    var docEl = doc.documentElement;
    var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
    var recalc = (function refreshRem() {
        var clientWidth = docEl.getBoundingClientRect().width;
        docEl.style.fontSize = Math.max(Math.min(20 * (clientWidth / docWidth), 20), 8.55) * 5 + 'px';
        return refreshRem;
    })();
    // 添加倍屏标识，安卓倍屏为 1
    docEl.setAttribute('data-dpr', window.navigator.appVersion.match(/iphone/gi) ? window.devicePixelRatio : 1);
    if (/iP(hone|od|ad)/.test(window.navigator.userAgent)) {
        // 添加 IOS 标识
        doc.documentElement.classList.add('ios');
        // IOS8 以上给 html 添加 hairline 样式，以便特殊处理
        if (parseInt(window.navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/)[1], 10) >= 8) doc.documentElement.classList.add('hairline');
    }
    if (!doc.addEventListener) return;
    window.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
})(window);