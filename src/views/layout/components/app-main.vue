<template>
    <transition name="fade-transform-l-r" mode="out-in">
        <keep-alive :include="cacheRoute" :max="5">
            <router-view class="route-view-wrapper" />
        </keep-alive>
    </transition>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { appModule } from '@/store/index';

@Component
export default class LayoutMain extends Vue {
    get cacheRoute(): string[] {
        return appModule.cacheRoute.map(v => v.value);
    }
}
</script>

<style scoped lang="scss">
    .route-view-wrapper {
        width: 100%; height: 100%;
        padding: 10px 15px 15px 15px;
    }
</style>