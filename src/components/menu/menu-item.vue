<script lang="ts">
import { Prop, Watch, Inject, Component, Vue } from 'vue-property-decorator';
import Ripple from '../ripple/index.vue';
import CollapseTransition from '../transition/index';
import { findComponentUpward, findComponentsUpward } from '@/utils/assist';
import PopperJs from 'popper.js';
import transferDom from '@/directives/transfer-dom';
import Menu, { IData } from './index.vue';
import { VNode } from 'vue';
import { isMatch } from '@/utils/index';

@Component({
    name: 'MenuItem',
    directives: {
        transferDom,
    },
})
export default class MenuItem extends Vue {
    $refs!: {
        menuItem: MenuItem[];
        reference: Element;
        menu: Element;
    }

    @Inject('rootMenu')
    rootMenu!: Menu;

    @Prop(Boolean)
    accordion!: boolean;
    @Prop(String)
    activeName!: string;
    @Prop(Boolean)
    appendToBody!: boolean;
    @Prop(Boolean)
    collapse!: boolean;
    @Prop(Object)
    data!: IData;
    @Prop(Number)
    space!: number;
    @Prop(String)
    trigger!: string;
    @Prop(Number)
    timeout!: number;

    public expand = (this.$parent as Menu).isRootMenu === this.rootMenu.isRootMenu
        ? this.collapse ? false : this.isNeedExpand()
        : this.isNeedExpand(); // 首层菜单且是浮层显示时为 false，否则根据激活项来判断是否展开
    private timer = 0; // 关闭延时
    private openTimer = 0; // 展开延时
    private popperJs: PopperJs | null = null; // 弹窗
    private allowClose = true; // 是否允许关闭，防止被冒泡事件影响

    // 获取触发事件名称
    get eventName() {
        return this.hasChildren && this.trigger === 'hover' ? 'mouseenter' : 'click';
    }
    // 获取弹层容器事件
    get wrapperOn(): Dictionary<Function> {
        const { trigger } = this;
        return trigger === 'hover' ? { mouseenter: this.wrapperEnter, mouseleave: this.wrapperLeave } : {};
    }
    // 获取 menuItem 事件
    get menuItemOn(): Dictionary<Function> {
        const { hasChildren, trigger } = this;
        return hasChildren && trigger === 'hover' ? { hide: this.hide, stopHide: this.stopHide, mouseleave: () => this.hide(false) } : {};
    }
    // 获取 menu 层级
    get parentsNum(): number {
        return findComponentsUpward(this, 'MenuItem').length;
    }
    // 是否是首层 menu
    get isFirstLevel(): boolean {
        return (this.$parent as Menu).isRootMenu === this.rootMenu.isRootMenu;
    }
    /**
     * @description: 是否将弹出层防止 body
     */
    get isPopupWrapper() {
        const { appendToBody, isFirstLevel, collapse } = this;
        return collapse && isFirstLevel && appendToBody;
    }
    // 是否存在子级
    get hasChildren(): boolean {
        return !!(this.data.children && this.data.children.length);
    }
    // 距离左侧的距离
    get styles() {
        const { collapse, isFirstLevel, parentsNum, space } = this;
        return {
            paddingLeft: collapse
                ? (isFirstLevel ? 0 : `${space}px`)
                : `${parentsNum * space + space}px`,
        };
    }

    // 生命周期
    beforeDestroy() {
        this.popperJs && this.popperJs.destroy();
    }

    // render
    render(h: CreateElement): VNode {
        const { genTitleWrapper, genPopupWrapper, collapse, isFirstLevel, menuItemOn } = this;

        return h(
            'ul',
            { class: ['sub-menu', { 'popup-wrapper': collapse, 'popup-wrapper--first': collapse && isFirstLevel }], on: menuItemOn },
            [genTitleWrapper(), genPopupWrapper()]
        );
    }

    /**
     * @description: collapse 模式切换事件
     */
    @Watch('collapse')
    changeCollapse(status: boolean) {
        if (status) {
            this.expand = false;
        }
    }

    /**
     * @description: 返回 title 元素
     * @returns {VNode}
     */
    genTitleWrapper() {
        const { data, styles, hasChildren, expand, activeName, eventName } = this;
        const h = this.$createElement;
        const svgIcon = data.icon && h('svg-icon', { class: 'sub-menu__title--icon', props: { iconClass: data.icon }});
        const title = h('span', this.$te(data.title) ? this.$t(data.title) as string : data.title);
        const svgIconArrow = hasChildren && h('svg-icon', { style: { transform: `rotate(${Number(!expand) || 90}deg)` }, class: 'sub-menu__icon-arrow', props: { iconClass: 'angle-right' }});
        const on = { [eventName]: this.handle };
        const isActive = data.value === activeName || (hasChildren && isMatch(data.children!, { value: activeName }));
        return h('li', { style: styles, on, class: ['sub-menu__title', { 'sub-menu__title--active': isActive, 'sub-menu__title--sub-menu': hasChildren }], ref: 'reference' }, [svgIcon, title, svgIconArrow, h(Ripple)]);
    }
    /**
     * @description: 返回弹出层元素
     * @returns {VNode}
     */
    genPopupWrapper() {
        const { data, isPopupWrapper, hasChildren, expand, collapse, wrapperOn } = this;
        const h = this.$createElement;
        const tag = isPopupWrapper ? 'div' : 'li';
        const popupEle = hasChildren && expand
            ? h(
                tag,
                {
                    class: { 'sub-menu__popup-wrapper': collapse },
                    directives: [{ name: 'transfer-dom' }],
                    attrs: { 'data-transfer': isPopupWrapper, 'is-popup': isPopupWrapper },
                    on: wrapperOn,
                    ref: 'menu',
                },
                (data.children as IData[]).map((data, i) => h(
                    MenuItem,
                    {
                        props: { ...this.$props, data },
                        // nativeOn: menuItemOn,
                        key: `${data.value}${i}`,
                        ref: 'menuItem',
                        refInFor: true,
                    }
                )),
            )
            : undefined;
        return isPopupWrapper
            ? h('transition', { props: { name: 'fade', appear: true }}, [popupEle])
            : collapse
                ? h('transition', { props: { name: 'fade', appear: true }}, [popupEle])
                : h(CollapseTransition, { props: { appear: true }}, [popupEle]);
    }
    /**
     * @description: 是否需要展开列表
     */
    isNeedExpand(): boolean {
        const { data, activeName } = this;
        return data.value === activeName
            || !!(data.children && data.children.length && isMatch(data.children, { value: activeName }));
    }
    // 列表项点击事件
    handle(event: MouseEvent) {
        if (this.expand) {
            if (event.type === 'click') {
                this.expand = false;
            }
            // 如果当前是展开的状态，则不处理
            this.stopHide();
            return;
        }
        event.type === 'click'
            ? this.handlePayload()
            : this.openTimer = window.setTimeout(this.handlePayload, this.timeout);
    }
    /**
     * @description: 列表展开事件
     */
    handlePayload() {
        // this.stopHide(false);
        const { collapse, expand, data, data: { value, children }, accordion, activeName } = this;
        const $parent = findComponentUpward(this, 'Menu');
        if (!$parent) return console.log('父级查找失败');
        if (children && children.length) {
            if (accordion) {
                // 开启手风琴模式，父级和子级全部重置展开收缩状态
                const instanceArr = (this.$parent as MenuItem).$refs.menuItem.concat(this.$refs.menuItem && !expand ? this.$refs.menuItem : []);
                instanceArr.some(v => {
                    v.expand = false;
                    return false;
                });
            }
            // 展开子菜单，作为弹窗则永远为真，否则取反
            this.expand = collapse || !expand;
            ($parent as Menu).openChange({ ...data, _expand: this.expand });
            this.setPosition();
        } else {
            // 将点击的子菜单 name 返出去
            value !== activeName && ($parent as Menu).selected({ ...data, _expand: this.expand });
        }
    }
    /**
     * @description: 设置弹窗展开的位置
     */
    setPosition() {
        const { isPopupWrapper } = this;
        if (!isPopupWrapper) return;
        this.$nextTick(() => {
            if (!(this.$el && this.$refs.menu)) return;
            this.popperJs = new PopperJs(this.$el, this.$refs.menu, { placement: 'bottom', eventsEnabled: true, modifiers: { preventOverflow: { boundariesElement: undefined }}});
            // this.popperJs = new PopperJs(this.$el, this.$refs.menu, { placement: 'right-start', eventsEnabled: true, modifiers: { preventOverflow: { boundariesElement: this.$el }}});
        });
    }
    // 弹出容器 enter 事件
    wrapperEnter() {
        this.allowClose = false;
        this.stopHide();
    }
    // 弹出容器 leave 事件
    wrapperLeave() {
        this.allowClose = true;
        this.hide(true);
    }
    /**
     * @description: 隐藏
     * @param {Boolean} isBubbling: 是否通过 emit 往上触发
     */
    hide(isBubbling: boolean = true) {
        if (!this.hasChildren || this.trigger === 'click' || !this.allowClose) return;
        this.timer && clearTimeout(this.timer);
        // 防止进入二级子菜单时，触碰到了其它菜单(如果在 N ms 内移出，等于借道，则不展开该子级菜单)
        this.openTimer && clearTimeout(this.openTimer);
        this.timer = window.setTimeout(() => {
            this.expand = false;
            isBubbling && this.$emit('hide', true);
        }, 300);
    }
    /**
     * @description: 阻止关闭弹窗
     * @param {Boolean} isBubbling: 是否通过 emit 往上触发
     */
    stopHide(isBubbling: boolean = true) {
        if (!this.hasChildren || this.trigger !== 'hover' || !this.expand) return;
        clearTimeout(this.timer);
        this.expand = true;
        isBubbling && this.$emit('stopHide', true);
    }
}
</script>

<style scoped lang="scss">
    @include utils-b(sub-menu) {
        background-color: $--menu-sub-color;
        // 标题
        @include utils-e(title) {
            height: 50px;
            color: $--black2;
            cursor: pointer;
            padding-right: 10px;
            border-right: {
                color: transparent;
                style: solid;
                width: 2px;
            }
            transition: background-color $--transition-time ease-in-out, color $--transition-time ease-in-out;
            position: relative;
            display: flex;
            align-items: center;
            @include utils-m(icon) {
                margin-right: 5px;
                font-size: .2rem;
            }
            // 标题中的箭头
            @include utils-e(icon-arrow) {
                margin-left: auto;
                transition: transform $--transition-time ease-in-out;
            }
        }
        // 子菜单容器
        // @include utils-e(popup-wrapper) {
        //     min-width: 200px;
        //     position: absolute;
        //     top: 0; left: calc(100% + 4px);
        // }
        // 弹出层样式
        &.popup-wrapper {
            position: relative;
            @include utils-e(title) {
                padding-right: 6px;
            }
        }
    }
    // 子菜单容器
    .sub-menu__popup-wrapper {
        &[is-popup=true] {
            margin-top: 4px;
        }
        min-width: 200px;
        position: absolute;
        top: 0; left: calc(100% + 4px);
    }
    // 弹出层首层样式
    .popup-wrapper--first > .sub-menu__title {
        padding-right: 0 !important;
        justify-content: center;
        & > .sub-menu__title--icon {
            margin-right: 0;
        }
    }
</style>