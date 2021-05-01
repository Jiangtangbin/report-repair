<template>
    <div v-on="$listeners" @mousedown="mousedown" @mouseup="end" @mouseleave="end" class="ripple-wrapper" ref="holder">
        <ripple v-for="i of ripples" :key="i" :merge-style="rippleStyle" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Ripple from './ripple.vue';
import { getOffset } from '@/utils/dom';

@Component({
    components: {
        Ripple,
    },
})
export default class RippleWrapper extends Vue {
    private hover = false;
    private rippleStyle: Dictionary<any> = {};

    get ripples(): number[] {
        return this.hover ? [1] : [];
    }

    /**
     * @description: 鼠标按下事件
     * @param {Event}} event: 事件
     */
    mousedown(event: MouseEvent) {
        this.hover = true;
        const style = this.getRippleStyle(event);
        this.rippleStyle = style || {};
        this.$emit('mousedown', event);
    }
    /**
     * @description: 删除波纹效果
     * @param {Event}} event: 事件
     */
    end(event: MouseEvent) {
        this.hover = false;
        this.$emit(event.type, event);
    }
    /**
     * @description: 获取 ripple 样式
     * @param {Event}} event: 事件
     */
    getRippleStyle(event: MouseEvent | TouchEvent) {
        const el = (this.$refs.holder as HTMLElement);
        if (!el) return;
        const offset = getOffset(el);
        const elHeight = el.offsetHeight;
        const elWidth = el.offsetWidth;
        const isTouchEvent = (event as TouchEvent).touches && (event as TouchEvent).touches.length;
        const pageX = isTouchEvent ? (event as TouchEvent).touches[0].pageX : (event as MouseEvent).pageX;
        const pageY = isTouchEvent ? (event as TouchEvent).touches[0].pageY : (event as MouseEvent).pageY;
        const pointerX = pageX - offset.left;
        const pointerY = pageY - offset.top;
        const topLeftDiag = this.calcDiag(pointerX, pointerY);
        const topRightDiag = this.calcDiag(elWidth - pointerX, pointerY);
        const botRightDiag = this.calcDiag(elWidth - pointerX, elHeight - pointerY);
        const botLeftDiag = this.calcDiag(pointerX, elHeight - pointerY);
        const rippleRadius = Math.max(topLeftDiag, topRightDiag, botRightDiag, botLeftDiag);
        const rippleSize = rippleRadius * 2;
        const left = pointerX - rippleRadius;
        const top = pointerY - rippleRadius;
        return {
            directionInvariant: true,
            height: rippleSize + 'px',
            width: rippleSize + 'px',
            top: top + 'px',
            left: left + 'px',
        };
    }
    /**
     * @description: 计算
     * @param {Number} a: 坐标值
     * @param {Number} b: 坐标值
     */
    calcDiag(a: number, b: number) {
        return Math.sqrt((a * a) + (b * b));
    }
}
</script>

<style scoped lang="scss">
    .ripple-wrapper {
        width: 100%; height: 100%;
        border-radius: inherit;
        position: absolute;
        top: 0; left: 0;
        overflow: hidden;
    }
</style>