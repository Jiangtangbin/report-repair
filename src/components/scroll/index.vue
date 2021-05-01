<template>
    <base-scroll
        v-on="$listeners"
        v-bind="$attrs"
        :clickable="clickable"
        :mouseWheel="mouseWheel"
        :preventDefault="preventDefault"
        :scrollbar="scrollbar"
    >
        <template v-if="$slots.pulldown" #pulldown="slotProps">
            <slot v-bind="slotProps" name="pulldown" />
        </template>
        <slot />
        <template v-if="$slots.pullup" #pullup="slotProps">
            <slot v-bind="slotProps" name="pullup" />
        </template>
    </base-scroll>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import BaseScroll from '@/components/common/scroll.vue';
import { appModule } from '@/store/index';
import { deviceType } from '@/store/modules/app';

const scrollbarNormal = () => ({ fade: false, interactive: true });

@Component({
    components: {
        BaseScroll,
    },
})
export default class Scroll extends Vue {
    // 是否监听鼠标滚动事件, 默认根据平台(Mobile | Desktop)来确定是否显示滚轮
    @Prop({ type: Boolean, default: appModule.device === deviceType.Desktop })
    mouseWheel!: boolean;
    // 滚动条   默认根据平台(Mobile | Desktop)来确定是否显示滚动条
    @Prop({ type: [Boolean, Object], default: appModule.device === deviceType.Desktop && scrollbarNormal })
    scrollbar!: boolean;
    // 是否阻止默认事件   默认根据平台(Mobile | Desktop)来确定是否阻止默认事件, 防止手机端下滑显示(所属浏览器内核)
    @Prop({ type: Boolean, default: appModule.isMobile })
    preventDefault!: boolean;
    // 是否可点击
    @Prop({ type: Boolean, default: appModule.isMobile })
    clickable!: boolean;
}
</script>