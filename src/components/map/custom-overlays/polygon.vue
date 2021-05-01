<template>
    <h-polyline
        v-bind="$attrs"
        v-on="$listeners"
        :styles="finalStyle"
        :shape="finalShape"
        :opts="finalOpts"
        isClosing
    />
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import HPolyline from './polyline.vue';

/**
 * @description: 自定义折线渲染组件
 * 触发事件 events
 * $emit(event, data, i, event) 只能触发 ZRender 提供的事件
 * @param {Datum} data: 提供的参数
 * @param {Number} i: 该标点的下标
 * @param {ZRender.event} event: ZRender 包装后的 event 对象
 */
@Component({
    components: {
        HPolyline,
    },
})
export default class HPolygon extends Vue {
    // 参考 https://ecomfe.github.io/zrender-doc/public/api.html#zrenderpolygon
    @Prop({ type: Object })
    styles: Record<string, any>;
    @Prop({ type: Object })
    shape: Record<string, any>;
    @Prop({ type: Object })
    opts: Record<string, any>;

    normalOpts = {
    };
    normalStyle = {
        fill: 'rgba(255, 255, 255, 0.65)',
        stroke: 'rgba(58, 107, 219, 0.65)',
        lineWidth: 5,
    };
    normalShape = {
        smooth: 0,
    };

    // 合并后传递的公共参数
    get finalOpts() {
        const { opts, normalOpts } = this;

        return opts
            ? { ...normalOpts, ...opts }
            : normalOpts;
    }
    // 合并后显示的样式
    get finalStyle() {
        const { styles, normalStyle } = this;

        return styles
            ? { ...normalStyle, ...styles }
            : normalStyle;
    }
    // 合并后显示的形状
    get finalShape() {
        const { shape, normalShape } = this;

        return shape
            ? { ...normalShape, ...shape }
            : normalShape;
    }
}
</script>