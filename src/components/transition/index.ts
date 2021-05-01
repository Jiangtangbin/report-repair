import { VNode } from 'vue';

const Transition = {
    beforeEnter(el: HTMLElement) {
        if (!el.dataset) (el as any).dataset = {};
        el.classList.add('collapse-transition');
        el.dataset.oldPaddingTop = el.style.paddingTop!;
        el.dataset.oldPaddingBottom = el.style.paddingBottom!;
        el.style.height = '0';
        el.style.paddingTop = '0';
        el.style.paddingBottom = '0';
    },
    enter(el: HTMLElement) {
        el.dataset.oldOverflow = el.style.overflow!;
        el.style.height = el.scrollHeight !== 0 ? el.scrollHeight + 'px' : '';
        el.style.paddingTop = el.dataset.oldPaddingTop!;
        el.style.paddingBottom = el.dataset.oldPaddingBottom!;
        el.style.overflow = 'hidden';
    },
    afterEnter(el: HTMLElement) {
        el.classList.remove('collapse-transition');
        el.style.overflow = el.dataset.oldOverflow!;
        el.style.height = '';
    },
    beforeLeave(el: HTMLElement) {
        if (!el.dataset) (el as any).dataset = {};
        el.dataset.oldPaddingTop = el.style.paddingTop!;
        el.dataset.oldPaddingBottom = el.style.paddingBottom!;
        el.dataset.oldOverflow = el.style.overflow!;
        el.style.overflow = 'hidden';
        el.style.height = el.scrollHeight + 'px';
    },
    leave(el: HTMLElement) {
        if (el.scrollHeight !== 0) {
            el.classList.add('collapse-transition');
            el.style.height = '0';
            el.style.paddingTop = '0';
            el.style.paddingBottom = '0';
        }
    },
    afterLeave(el: HTMLElement) {
        el.style.height = '';
        el.style.overflow = el.dataset.oldOverflow!;
        el.style.paddingTop = el.dataset.oldPaddingTop!;
        el.style.paddingBottom = el.dataset.oldPaddingBottom!;
        el.classList.remove('collapse-transition');
    },
};

export default {
    name: 'CollapseTransition',
    functional: true,
    props: {
        appear: Boolean,
    },
    render(h: CreateElement, { children, props }: { children: VNode[]; props: Dictionary<any> }) {
        const data = {
            on: Transition,
            props: {
                appear: props.appear,
            },
        };
        return h('transition', data, children);
    },
};