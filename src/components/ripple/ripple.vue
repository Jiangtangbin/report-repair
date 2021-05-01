<template>
    <transition name="ripple" appear>
        <div class="circle-ripple" :style="styles"></div>
    </transition>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';

@Component
export default class Ripple extends Vue {
    @Prop({ type: String, default: '' })
    color!: string;
    @Prop({ type: Number, default: 0.1 })
    opacity!: number;
    @Prop({ type: Object, default: () => ({}) })
    mergeStyle!: object;

    get styles(): object {
        const { color, opacity, mergeStyle } = this;
        return { color, opacity, ...mergeStyle };
    }
}
</script>

<style scoped lang="scss">
    .ripple-enter-active, .ripple-leave-active {
        transition: opacity 2s $--ease-out-function, transform .45s $--ease-out-function;
    }
    .ripple-enter {
        transform: scale(0);
    }
    .ripple-leave-active {
        opacity: 0 !important;
    }

    .circle-ripple {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        pointer-events: none;
        user-select: none;
        border-radius: 50%;
        background-color: currentColor;
        background-clip: padding-box;
        opacity: 0.1;
    }
</style>
