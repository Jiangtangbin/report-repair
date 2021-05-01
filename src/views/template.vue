<template>
    <keep-alive :include="cacheRoute" :max="5">
        <router-view />
    </keep-alive>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { appModule } from '@/store/index';

@Component
export default class LayoutMain extends Vue {
    get cacheRoute() {
        return appModule.cacheRoute.map(v => v.value);
    }

}
</script>

