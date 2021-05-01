<template>
    <div @click="pause" :class="{hide: !(loop && isPlaying)}" class="sound-wrapper c-p">
        <svg-icon icon-class="microphone-off" />
        <audio @ended="pause" @error="pause" v-if="src" :loop="loop" :src="src" class="hide" ref="audio"></audio>
    </div>
</template>

<script lang="ts">
import { Watch, Prop, Component } from 'vue-property-decorator';
import { BasePopup } from '@/base-class/dynamic-create';
import bus from '@/utils/bus';

const di = require('@/assets/media/di.mp3');
const video = require('@/assets/media/video.mp3');
const fireAlarm = require('@/assets/media/fire.mp3');

type SoundType = 'di' | 'audio' | 'video' | 'fire';

const sounds: Record<SoundType, any> = {
    di,
    audio: video,
    video: video,
    fire: fireAlarm,
};

@Component({
    name: 'SoundsHandle',
})
export default class SoundsHandle extends BasePopup {
    $refs!: {
        audio: HTMLAudioElement;
    }

    // 播放的音效别名
    @Prop({ type: String, required: true })
    t!: SoundType;
    // 是否循环播放
    @Prop(Boolean)
    loop?: boolean;

    src = '';
    isPlaying = true;

    created() {
        bus.$on('close-sound', () => {
            const { t } = this;
            t === 'fire' && this.pause();
        });
    }
    beforeDestroy() {
        bus.$off('close-sound');
    }

    @Watch('loop', { immediate: true })
    loopChange(val: boolean) {
        this.isPlaying = val;
    }

    // 打开弹窗前执行的函数
    prefixFunc() {
        const { t } = this;
        if (!sounds[t]) return console.log('请填写正确的音效类型');
        this.src = sounds[t];
        this.$nextTick(() => {
            this.play();
        });
    }
    // 关闭弹窗前执行的函数
    suffixFunc() {
        this.pause();
    }
    // 播放音效
    play() {
        this.isPlaying = true;
        this.$refs.audio
            .play()
            .catch((err) => {
                console.log('音效播放错误: ', err);
                this.isPlaying = false;
            });
    }
    // 停止播放音效
    pause() {
        this.$refs.audio.pause();
        this.isPlaying = false;
    }
}
</script>

<style scoped lang="scss">
    .sound-wrapper {
        color: $--white;
        font-size: 0.2rem;
        padding: 6px 13px;
        border-radius: 5px;
        background: $--background-dark-active-color;
        position: fixed;
        top: calc(40% - 20px); right: 0;
        z-index: 100000;
    }
</style>