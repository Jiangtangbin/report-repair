<template>
    <div ref="wrapper" class="scroll-wrapper">
        <div class="scroll-content" :style="direction === 'horizontal' ? { minWidth: '100%', display: 'inline-block' } : ''">
            <slot name="pulldown"
                :pullDownRefresh="pullDownRefresh"
                :pullDownStyle="pullDownStyle"
                :beforePullDown="beforePullDown"
                :isPullingDown="isPullingDown"
            >
                <div ref="pulldown" class="pulldown-wrapper" :style="pullDownStyle" v-if="pullDownRefresh">
                    <div class="before-trigger" v-if="beforePullDown">
                        <span v-if="pullDownThreshold">松开刷新</span>
                        <span v-else>下拉刷新</span>
                    </div>
                    <div class="after-trigger" v-else>
                        <div v-if="isPullingDown" class="loading">
                            <span>正在刷新...</span>
                        </div>
                        <div v-else><span>{{refreshTxt}}</span></div>
                    </div>
                </div>
            </slot>
            <div :style="listWrapStyle" class="list-wrapper" ref="listWrapper">
                <slot>
                    <ul class="list-content">
                        <li v-for="(item, index) of data" :key="index" @click="$emit('click', item, $event)" class="list-item">{{item}}</li>
                    </ul>
                </slot>
            </div>
            <slot
                v-if="pullUpLoad"
                :pullUpLoad="pullUpLoad"
                :isPulling="isPullingUp"
                name="pullup"
            >
                <div class="pullup-wrapper">
                    <div v-if="isPullingUp || complete" class="after-trigger">
                        <span>{{pullUpTxt}}</span>
                    </div>
                    <div v-else class="before-trigger">
                        <span>{{ isPullingDown ? '正在刷新列表' : '上拉加载更多' }}</span>
                    </div>
                </div>
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import BScroll from '@better-scroll/core';
import MouseWheel from '@/scroll/mouse-wheel/index';
import Scrollbar from '@/scroll/scroll-bar/index';
import Pullup from '@better-scroll/pull-up';
import pullDown from '@better-scroll/pull-down';
import ObserveDom from '@better-scroll/observe-dom';

BScroll.use(MouseWheel);
BScroll.use(Scrollbar);
BScroll.use(Pullup);
BScroll.use(pullDown);
BScroll.use(ObserveDom);

function getRect(el: HTMLElement) {
    if (el instanceof (window as any).SVGElement) {
        let rect = el.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        };
    } else {
        return {
            top: el.offsetTop,
            left: el.offsetLeft,
            width: el.offsetWidth,
            height: el.offsetHeight,
        };
    }
}

const DIRECTION_H = 'horizontal';
const DIRECTION_V = 'vertical';
const blackEvents = ['pullingUp', 'pullingDown'];
const TIME_BOUNCE = 800;
const THRESHOLD = 90;

interface POS {
    x: number;
    y: number;
}

/**
 * @description:
 * $emit('scroll'): 触发滚动事件
 * $emit('scroll-end'): 触发滚动完成事件
 * $emit('beforeScrollStart'): 滚动事件前触发
 * $emit('scroll-start'): 滚动开始触发
 * $emit('pullingDown'): 下拉刷新
 * $emit('pullingUp'): 上滑加载
 */
@Component
export default class Scroll extends Vue {
    $refs!: {
        wrapper: HTMLElement;
        listWrapper: HTMLElement;
    }

    // 参考文档: https://better-scroll.github.io/docs/zh-CN/guide/
    @Prop({ type: Number, default: 1 })
    probeType!: 1 | 2 | 3;
    // // 点击事件
    // @Prop({ type: Boolean, default: appModule.device !== deviceType.Desktop })
    // click!: boolean;
    // 是否监听鼠标滚动事件
    @Prop({ type: Boolean, default: false })
    mouseWheel!: boolean;
    // 自适应出现纵向横向滚动条
    @Prop(Boolean)
    freeScroll!: boolean;
    // 上拉加载
    @Prop({ type: Boolean, default: false })
    pullUpLoad!: boolean;
    // 下拉刷新
    @Prop({ type: [Boolean, Object], default: false })
    pullDownRefresh!: boolean | object;
    // 是否全部加载完毕 -> 存在上拉或下拉时启用
    @Prop({ type: Boolean, default: false })
    complete!: boolean;
    // 滚动条
    @Prop({ type: [Boolean, Object], default: false })
    scrollbar!: boolean;
    // 是否阻止默认事件
    @Prop({ type: Boolean, default: false })
    preventDefault!: boolean;
    // 是否自动更新高度
    @Prop({ type: Boolean, default: false })
    observeDOM!: boolean;
    // 是否可点击
    @Prop({ type: Boolean, default: false })
    clickable!: boolean;
    // 滚动方向
    @Prop({ type: String, default: DIRECTION_V })
    direction!: 'horizontal' | 'vertical';
    // // 刷新延时
    @Prop({ type: Number, default: 20 })
    refreshDelay!: number;
    // // 上拉加载中的高度
    @Prop({ type: Number, default: 53 })
    pullUpHeight!: number;
    @Prop({ type: Array, default: () => ([]) })
    data!: any[];
    @Prop(String)
    pullUpTxt!: string;
    @Prop({ type: String, default: '刷新成功' })
    refreshTxt!: string;
    // 是否处于上拉状态
    isPullingUp = false;
    // // 是否未进入下拉刷新
    beforePullDown = true;
    // // 是否达到触发下拉刷新的阈值
    pullDownThreshold = false;
    // 是否处于下拉状态
    isPullingDown = false;
    // better-scroll 实例
    scroll: null | BScroll = null;
    // 列表容器的最小高度
    listWrapMinHeight = 0;

    get pullDownStyle() {
        return {};
    }
    get listWrapStyle() {
        const { listWrapMinHeight } = this;
        return { minHeight: `${listWrapMinHeight}px` };
    }
    
    mounted() {
        this.calculateMinHeight();
        setTimeout(() => {
            this.initScroll();
        }, 20);
    }
    beforeDestroy() {
        this.destroy();
    }


    @Watch('data')
    dataUpdate() {
        const { isPullingUp, isPullingDown, refreshDelay, observeDOM } = this;
        if (isPullingUp) {
            this.finishPullUp();
        }
        else if (isPullingDown) {
            this.finishPullDown();
        }
        else {
            observeDOM || setTimeout(this.refresh, refreshDelay);
        }
    }
    @Watch('pullUpLoad')
    pullUpChange(val: boolean) {
        this.togglePullingUp(!!val);
    }
    @Watch('pullDownRefresh')
    pullDownChange(val: boolean) {
        this.togglePullingDown(!!val);
    }

    // 初始化滚动列表
    initScroll() {
        const { probeType, freeScroll, direction, preventDefault, scrollbar, mouseWheel, pullUpLoad, pullDownRefresh, clickable, observeDOM, $attrs } = this;
        if (!this.$refs.wrapper) {
            return;
        }
        let options = {
            probeType,
            scrollY: freeScroll || direction === DIRECTION_V,
            scrollX: freeScroll || direction === DIRECTION_H,
            preventDefault,
            scrollbar,
            mouseWheel,
            pullUpLoad,
            pullDownRefresh: pullDownRefresh === true
                ? {
                    threshold: THRESHOLD,
                }
                : pullDownRefresh,
            click: clickable,
            observeDOM,
            ...$attrs,
        };
        this.scroll = new BScroll(this.$refs.wrapper, options);
        // 绑定事件
        Object.keys(this.$listeners).every(k => {
            blackEvents.includes(k) || this.scroll!.on(k, (...args: any[]) => {
                this.$emit(k, ...args);
            });
            return true;
        });
        pullUpLoad && this.togglePullingUp(true);
        pullDownRefresh && this.togglePullingDown(true);
    }
    // 重新计算 better-scroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常
    refresh() {
        if (this.scroll) {
            this.calculateMinHeight();
            this.scroll.refresh();
        }
    }
    // 滚动到指定的位置
    scrollTo(x: number, y: number, time: number, easing: object) {
        this.scroll && this.scroll.scrollTo(x, y, time, easing);
    }
    // 滚动到指定的目标元素
    scrollToElement(el: HTMLElement | string, time: number, offsetX: number | boolean, offsetY: number | boolean, easing: object) {
        this.scroll && this.scroll.scrollToElement(el, time, offsetX, offsetY, easing);
    }
    // 销毁 better-scroll 实例
    destroy() {
        this.scroll && this.scroll.destroy();
    }
    /**
     * @description: 计算容器的最小高度
     */
    calculateMinHeight() {
        const { pullUpLoad, pullDownRefresh, complete } = this;
        const { wrapper } = this.$refs;
        let minHeight = 0;
        if (pullDownRefresh || pullUpLoad) {
            const wrapperHeight = getRect(wrapper).height;
            minHeight = wrapperHeight + 1;
            if (complete) {
                // 当内容的高度不大于包装高度时
                minHeight -= this.pullUpHeight;
            }
        }
        this.listWrapMinHeight = minHeight;
    }
    /**
     * @description: 绑定(销毁)上拉事件
     * @param {Boolean} flag: true 绑定事件，false 销毁事件
     */
    togglePullingUp(flag: boolean) {
        if (!this.scroll) return;
        flag
            ? this.scroll.on('pullingUp', () => {
                const { isPullingUp, isPullingDown, complete } = this;
                if (isPullingDown || isPullingUp || complete) return;
                this.isPullingUp = true;
                this.$emit('pullingUp');
            })
            : this.scroll.off('pullingUp');
    }
    /**
     * @description: 绑定(销毁)下拉事件
     * @param {Boolean} flag: true 绑定事件，false 销毁事件
     */
    togglePullingDown(flag: boolean) {
        if (!this.scroll) return;
        flag
            ? this.scroll.on('scroll', this.scrollHandle)
            : this.scroll.off('scroll', this.scrollHandle);
        flag
            ? this.scroll.on('pullingDown', () => {
                const { isPullingDown, isPullingUp } = this;
                if (isPullingUp || isPullingDown) return;
                this.beforePullDown = false;
                this.isPullingDown = true;
                this.$emit('pullingDown');
            })
            : this.scroll.off('pullingDown');
    }
    /**
     * @description: 滚动事件
     * @param {Object} pos: 坐标
     */
    scrollHandle(pos: POS) {
        this.pullDownThreshold = pos.y >= THRESHOLD;
    }
    /**
     * @description: 结束上拉加载
     */
    finishPullUp() {
        const { refreshDelay, observeDOM } = this;
        if (!this.scroll) return;
        this.isPullingUp = false;
        this.scroll.finishPullUp();
        // 防止在上拉加载时触发到下拉刷新事件
        setTimeout(() => {
            this.scroll.finishPullDown();
        }, TIME_BOUNCE);
        observeDOM || setTimeout(this.refresh, refreshDelay);
    }
    /**
     * @description: 结束下拉刷新
     */
    finishPullDown() {
        const { refreshDelay, observeDOM } = this;
        if (!this.scroll) return;
        this.isPullingDown = false;
        setTimeout(() => {
            if (!this.scroll) return;
            this.scroll.finishPullUp();
            // 防止在下拉刷新时触发到上拉加载事件
            this.scroll.finishPullDown();
            setTimeout(() => {
                this.beforePullDown = true;
                observeDOM || this.refresh();
            }, refreshDelay);
        }, TIME_BOUNCE);
    }

}
</script>

<style scoped lang="scss">
    .scroll-wrapper {
        width: 100%; height: 100%;
        position: relative;
        z-index: 0;
        overflow: hidden;
        .scroll-content {
            position: relative;
            z-index: 1;
        }
        .list-content {
            position: relative;
            z-index: 10;
            .list-item {
                height: 60px;
                line-height: 60px;
                font-size: 18px;
                padding-left: 20px;
            }
        }
        .pulldown-wrapper {
            width: 100%;
            height: 40px;
            position: absolute;
            left: 0;
            transition: all;
            transform: translateY(-100%) translateZ(0);
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .pullup-wrapper {
            width: 100%;
            padding: 16px 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
</style>