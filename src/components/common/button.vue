<template>
    <button :class="classes" class="btn-wrapper c-p" type="button" ref="button">
        <ripple-wrapper v-on="events" @click="handle" />
        <half-circle-spinner v-if="loading" :animation-duration="1000" :size="15" class="btn-icon" />
        <svg-icon :icon-class="icon" class="btn-icon" v-if="icon && !loading" />
        <slot />
    </button>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import RippleWrapper from '../ripple/index.vue';
import { HalfCircleSpinner } from 'epic-spinners';

const btnSize = ['small', 'default', 'large'];

@Component({
    inheritAttrs: false,
    components: {
        RippleWrapper,
        HalfCircleSpinner,
    },
})
export default class Button extends Vue {
    @Prop({ type: String, default: 'primary' })
    type!: string;
    @Prop({ type: String, default: 'default' })
    size!: string;
    @Prop({ type: Boolean, default: false })
    disabled!: boolean;
    @Prop({ type: Boolean, default: false })
    loading!: boolean;
    // 按钮形状(只支持圆形)
    @Prop({ type: String, default: '' })
    shape!: string;
    @Prop({ type: String, default: '' })
    icon!: string;

    get classes() {
        const { type, loading, shape, size, disabled } = this;
        return [
            type,
            shape,
            btnSize.includes(size) ? size : 'default',
            {
                disabled,
                loading,
            },
        ];
    }
    // 拦截点击事件，防止 loading 状态重复触发
    get events() {
        const { $listeners } = this;
        const a = { ...$listeners };
        a.click && delete a.click;
        return a;
    }

    // 点击后波纹效果
    handle(event: MouseEvent) {
        if (!this.loading) this.$emit('click', event);
    }

}
</script>

<style scoped lang="scss">
.btn-wrapper {
    border: 1px solid transparent;
    outline: none;
    line-height: 1.5;
    transition: $--box-shadow-transition-base;
    position: relative;
    z-index: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    .btn-icon {
        margin-right: 5px;
    }
    // 默认主题
    &.primary {
        color: $--white;
        background-color: $--primary-color;
    }
    // 成功主题
    &.success {
        color: $--white;
        background-color: $--success-color;
    }
    // 信息主题
    &.info {
        color: $--white;
        background-color: $--info-color;
    }
    // 警告主题
    &.warn {
        color: $--white;
        background-color: $--warn-color;
    }
    // 禁用主题
    &.disabled {
        color: $--white;
        background-color: $--disabled-color;
    }
    // 默认大小
    &.default {
        padding: 4px 26px 5px;
        border-radius: 3px;
        &.circle {
            border-radius: 16px;
        }
    }
    // 小
    &.small {
        padding: 2px 8px 3px;
        font-size: 0.12rem;
        border-radius: 2px;
        &.circle {
            border-radius: 20px
        }
    }
    // 大
    &.large {
        padding: 6px 30px;
        font-size: 0.18rem;
        border-radius: 4px;
        &.circle {
            border-radius: 30px;
        }
    }
    // 加载动画
    &.loading {
        cursor: wait;
    }
}
</style>