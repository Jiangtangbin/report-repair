<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :title="$t(title)"
        :footer-hide="true"
        width="780px"
    >
        <video v-if="type === 'video'" :src="url" autoplay controls loop class="play-item play-video" ref="video" />
        <audio v-if="type === 'audio'" :src="url" autoplay controls loop class="play-item play-audio" ref="audio" />
        <img v-if="type === 'image'" :src="url" class="play-item play-img" />
    </my-modal>
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import { BasePopup } from '@/base-class/dynamic-create';

@Component({
    name: 'PublicPlayHandle',
})
export default class PublicPlayHandle extends BasePopup {
    $refs!: {
        video: HTMLVideoElement;
        audio: HTMLAudioElement;
    }

    @Prop({ type: String })
    url!: string

    suffixFunc() {
        // 暂停视频、音频
        this.$refs.video && this.$refs.video.pause();
        this.$refs.audio && this.$refs.audio.pause();
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    // 隐藏 video、audio 标签点击时的黑框
    video, audio:focus {
        outline: none !important;
    }

    .play-item {
        width: 100%;
        max-height: calc(80vh - 89px);
        overflow: auto;
    }
</style>