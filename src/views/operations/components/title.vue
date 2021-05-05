<template>
    <header class="map-header">
        <span v-if="!noBack" @click="$router.back()" class="map-header-icon">
            <svg-icon icon-class="right-arrows-circle" />
        </span>
        <span class="map-header-clock">{{time}}</span>
        <h2 class="map-header-desc"><span class="map-header-text">{{$route.meta.title}}</span></h2>
        <avatar class="map-header-avatar" />
    </header>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import Avatar from '@/views/layout/components/nav-bar/avatar.vue';
import { formatDate } from '@/utils/index';

@Component({
    components: {
        Avatar,
    },
})
export default class MapTitle extends Vue {
    @Prop(Boolean)
    noBack?: boolean;
    
    time = formatDate(Date.now());
    timer = 0;

    created() {
        const { _inactive } = this;
        _inactive === null && this.updateTime();
    }
    beforeDestroy() {
        clearInterval(this.timer);
    }
    activated() {
        this.updateTime();
    }
    deactivated() {
        clearInterval(this.timer);
    }

    /**
     * @description: 更新时间
     */
    updateTime() {
        this.timer = window.setInterval(() => {
            this.time = formatDate(Date.now());
        });
    }
}
</script>

<style lang="scss" scoped>
    $image: '~@/assets/images/map/background-title.png';

    .map-header {
        height: 0.6rem;
        color: $--white;
        padding: 0.2rem;
        padding-top: 0.29rem;
        position: relative;
        z-index: 0;
        flex: none;
        display: flex;
        align-items: center;
        &-icon {
            font-size: 0.24rem;
            cursor: pointer;
        }
        &-clock {
            font-size: 0.16rem;
            font-weight: bold;
            margin-left: 0.2rem;
        }
        &-desc {
            width: 100%; height: 100%;
            font-size: 0.3rem;
            position: absolute;
            left: 0; top: 0;
            z-index: -1;
            background: {
                image: url($image);
                repeat: repeat-x;
                size: 100% 100%;
            }
            display: flex;
            align-items: center;
            justify-content: center;
        }
        &-text {
            background-image: linear-gradient(to bottom, #b0fff0, #7ba3ff);
            background-clip: text !important;
            color: transparent;
        }
        &-avatar {
            margin-left: auto;
        }
    }
</style>
