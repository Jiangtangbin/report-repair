import { DirectiveFunction } from 'vue';

// Thanks to: https://github.com/airyland/vux/blob/v2/src/directives/transfer-dom/index.js
// Thanks to: https://github.com/calebroseland/vue-dom-portal

type TargetType = HTMLElement | string | boolean;
type SaveOptions = {
    parentNode: Node & ParentNode;
    home: Comment;
    target: Node;
    hasMovedOut: boolean;
}

interface customOption extends HTMLElement {
    __transferDomData: {
        parentNode: Node & ParentNode;
        home: Comment;
        target: Node;
        hasMovedOut: boolean;
    }
}

/**
 * Get target DOM Node
 * @param {(Node|string|Boolean)} [node=document.body] DOM Node, CSS selector, or Boolean
 * @return {Node} The target that the el will be appended to
 */
function getTarget(node: TargetType) {
    let _node = node;
    if (_node === undefined) {
        _node = document.body;
    }
    if (_node === true) { return document.body }
    return _node instanceof Node ? _node : document.querySelector((_node as string))!;
}

const directive: Dictionary<DirectiveFunction> = {
    inserted(el, { value }) {
        if (el.dataset && el.dataset.transfer !== 'true') return false;
        el.className = el.className ? el.className + ' v-transfer-dom' : 'v-transfer-dom';
        const parentNode = el.parentNode;
        if (!parentNode) return;
        const home = document.createComment('');
        let hasMovedOut = false;

        if (value !== false) {
            parentNode.replaceChild(home, el); // moving out, el is no longer in the document
            getTarget(value).appendChild(el); // moving into new place
            hasMovedOut = true;
        }
        if (!(el as customOption).__transferDomData) {
            (el as customOption).__transferDomData = {
                parentNode: parentNode,
                home: home,
                target: getTarget(value),
                hasMovedOut: hasMovedOut,
            };
        }
    },
    componentUpdated(el, { value }) {
        if (el.dataset && el.dataset.transfer !== 'true') return false;
        // need to make sure children are done updating (vs. `update`)
        const ref$1 = (el as customOption).__transferDomData;
        if (!ref$1) return;
        // homes.get(el)
        const parentNode = ref$1.parentNode;
        const home = ref$1.home;
        const hasMovedOut = ref$1.hasMovedOut; // recall where home is

        if (!hasMovedOut && value) {
            // remove from document and leave placeholder
            parentNode.replaceChild(home, el);
            // append to target
            getTarget(value).appendChild(el);
            (el as customOption).__transferDomData = { ...(el as customOption).__transferDomData, hasMovedOut: true, target: getTarget(value) };
        } else if (hasMovedOut && value === false) {
            // previously moved, coming back home
            parentNode.replaceChild(el, home);
            (el as customOption).__transferDomData = { ...(el as customOption).__transferDomData, hasMovedOut: false, target: getTarget(value) };
        } else if (value) {
            // already moved, going somewhere else
            getTarget(value).appendChild(el);
        }
    },
    unbind(el) {
        if (el.dataset && el.dataset.transfer !== 'true') return false;
        el.className = el.className.replace('v-transfer-dom', '');
        const ref$1 = (el as customOption).__transferDomData;
        if (!ref$1) return;
        if ((el as customOption).__transferDomData.hasMovedOut === true) {
            (el as customOption).__transferDomData.parentNode && (el as customOption).__transferDomData.parentNode.appendChild(el);
        }
        (el as any).__transferDomData = null;
        // delete (el as customOption).__transferDomData;
    },
};

export default directive;