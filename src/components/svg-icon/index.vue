<template>
    <svg :class="svgClass" aria-hidden="true" v-on="$listeners">
        <use :xlink:href="iconName" />
    </svg>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

// https://github.com/PanJiaChen/vue-element-admin/blob/master/src/views/svg-icons/require-icons.js
@Component
export default class SvgIcon extends Vue {
    @Prop() private iconClass!: string;
    @Prop({
        type: String,
        default: '',
    })

    public className!: string;

    // 获取图标名称
    get iconName(): string {
        return `#icon-${this.iconClass}`;
    }
    // 设置图标的 className
    get svgClass(): string {
        return this.className
            ? `svg-icon-item ${this.className}`
            : 'svg-icon-item c-p';
    }
}
</script>

<style scoped lang="scss">
    .svg-icon-item {
        width: 1em;
        height: 1em;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
    }
</style>