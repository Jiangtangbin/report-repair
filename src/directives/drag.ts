import { DirectiveOptions, VNodeDirective } from 'vue';

interface Binding extends VNodeDirective {
    value?: string | { handle: string, darg: string };
}

// 获取原有属性 ie dom 元素，currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
const getStyle = (function () {
    if ((window.document as any).currentStyle) {
        return (dom: HTMLElement, attr: keyof CSSStyleDeclaration) => (dom as any).currentStyle[attr];
    } else {
        return (dom: HTMLElement, attr: keyof CSSStyleDeclaration) => getComputedStyle(dom, null)[attr];
    }
})();
const delayTime = 500;
let delayTimer = 0;

/**
 * @description: binding
 * @param {String} value?: 拖拽的元素
 * @param {Object} value?: 对拖拽的配置
 * @param {String} value.handle?: 拖拽的元素
 * @param {String} value.darg?: 移动的元素
 */
const drag: DirectiveOptions = {
    bind(el, binding: Binding, vnode) {
        const handleStr = binding.value && (typeof binding.value === 'string' ? binding.value : binding.value.handle);
        const dialogHeaderEl = handleStr ? (el.querySelector(handleStr) as HTMLElement | null) : el;
        const dragDom = typeof binding.value === 'object' && binding.value.darg
            ? (el.querySelector(binding.value.darg) as HTMLElement | null)
            : el;
        if (!(dialogHeaderEl && dragDom)) return;
        dialogHeaderEl.style.cssText += ';cursor:move;';
        const isEqual = dialogHeaderEl === dragDom;
        let isDelay = binding.modifiers && binding.modifiers.delay;
        let timestamp: number;
        dialogHeaderEl.onmousedown = (e: MouseEvent) => {
            e.preventDefault();
            isDelay && (timestamp = e.timeStamp);
            // 鼠标按下，计算当前元素距离可视区的距离
            let isMove = false;
            const disX = e.clientX - dialogHeaderEl.offsetLeft;
            const disY = e.clientY - dialogHeaderEl.offsetTop;
            const dragDomWidth = dragDom.offsetWidth;
            const dragDomHeight = dragDom.offsetHeight;
            const screenWidth = (dragDom.offsetParent || document.body).clientWidth;
            const screenHeight = (dragDom.offsetParent || document.body).clientHeight;
            const minDragDomLeft = isEqual ? 0 : dragDom.offsetLeft;
            const maxDragDomLeft = screenWidth - minDragDomLeft - dragDomWidth;
            const minDragDomTop = isEqual ? 0 : dragDom.offsetTop;
            const maxDragDomTop = screenHeight - minDragDomTop - dragDomHeight;
            // 获取到的值带 px 正则匹配替换
            let styL = isEqual ? `0` : getStyle(dragDom, 'left');
            let styT = isEqual ? `0` : getStyle(dragDom, 'top');
            if (styL.includes('%')) {
                styL = Number(screenWidth) * (Number(styL.replace(/\%/g, '')) / 100);
                styT = Number(screenHeight) * (Number(styT.replace(/\%/g, '')) / 100);
            } else {
                styL = Number(styL.replace(/\px/g, ''));
                styT = Number(styT.replace(/\px/g, ''));
            }
            function mousemove(e: MouseEvent) {
                if (isDelay && (!timestamp || (e.timeStamp - timestamp < delayTime))) return;
                isMove = true;
                // 通过事件委托，计算移动的距离
                let left = e.clientX - disX;
                let top = e.clientY - disY;
                // 边界处理
                if (-(left) > minDragDomLeft) {
                    left = -minDragDomLeft;
                } else if (left > maxDragDomLeft) {
                    left = maxDragDomLeft;
                }
                if (-(top) > minDragDomTop) {
                    top = -minDragDomTop;
                } else if (top > maxDragDomTop) {
                    top = maxDragDomTop;
                }
                // 移动当前元素
                dragDom!.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`;
                // emit onDrag event -> ref: https://github.com/vuejs/vue/blob/dev/src/core/vdom/vnode.js
                (vnode as any).context.$emit('move');
            }
            function mouseout() {
                if (!isMove) {
                    timestamp = 0;
                    clearTimeout(delayTimer);
                }
            }
            function mouseup(e: MouseEvent) {
                timestamp = 0;
                isMove && e.stopPropagation();
                isMove = false;
                dragDom!.classList.remove('move_dom');
                document.removeEventListener('mousemove', mousemove);
                isDelay && document.removeEventListener('mouseout', mouseout);
                document.removeEventListener('mouseup', mouseup);
            }
            clearTimeout(delayTimer);
            isDelay && (delayTimer = window.setTimeout(() => {
                dragDom!.classList.add('move_dom');
            }, delayTime));
            document.addEventListener('mousemove', mousemove);
            isDelay && document.addEventListener('mouseout', mouseout);
            document.addEventListener('mouseup', mouseup, true);
        };
    },
};

export default drag;