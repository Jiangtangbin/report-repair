<template>
    <video ref="video" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { cameraLow, canvasConvert } from '@/utils/utils';
import { isObject, isFunction } from '@/utils/index';
import { i18n } from '@/locale/index';

cameraLow();

const Errors = {
    hardwareProblems: i18n.t('h.camera.hardwareProblems'),
    allowAccessTo: i18n.t('h.camera.allowAccessTo'),
    notMediaType: i18n.t('h.camera.notMediaType'),
    cannotAccess: i18n.t('h.camera.cannotAccess'),
    deviceError: i18n.t('h.camera.deviceError'),
    securityError: i18n.t('h.camera.securityError'),
    typeError: i18n.t('h.camera.typeError'),
    notSupportedError: i18n.t('h.camera.notSupportedError'),
};

@Component
export default class Camera extends Vue {
    $refs!: {
        video: HTMLVideoElement;
    }

    streamTrack: MediaStream | null | MediaStreamTrack = null;

    /**
     * @description: 打开视频，开始视频
     * @param {Object} 打开的类型对象(视音频)，参考 mdn https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia
     */
    async start(params: MediaStreamConstraints) {
        if (!isObject(params)) return console.log('参数格式(Object)输入错误, 请检查: ', params);
        try {
            let video = this.$refs.video;
            const stream = await navigator.mediaDevices.getUserMedia(params);
            if ('srcObject' in video) {
                video.srcObject = stream;
            } else {
                (video as HTMLVideoElement).src = window.URL.createObjectURL(stream);
            }
            // 保存流，以便于可以关闭摄像头
            this.streamTrack = isFunction(stream.stop) ? stream : stream.getTracks()[0];
            video.onloadedmetadata = function () {
                video.play();
            };
        } catch (error) {
            console.log('视频播放错误', error.name + '：' + error.message, '，', Errors[error.name as 'hardwareProblems']);
            this.$Message.info(`${this.$t('h.camera.videoPlaybackError')}: ${Errors[error.name as 'hardwareProblems'] || (error.name + ':' + error.message)}`);
        }
    }
    // 关闭视频
    stop() {
        if (!this.streamTrack) return this.$Message.info(this.$t('h.camera.videoCloseFail'));
        this.streamTrack.stop();
        this.streamTrack = null;
    }
    /**
     * @description: 生成快照
     * @param {String} value: 返回的类型(base64|blob|both)
     * @return {Object} {base64: 返回图片地址，blob: 二进制}
     */
    async snap(value: 'base64' | 'blob' | 'both' = 'base64') {
        const { video } = this.$refs;
        const { width, height } = video.getBoundingClientRect();
        return value === 'both'
            ? { base64: canvasConvert(video, true, { width, height }), name: '1.png', blob: await canvasConvert(video, false, { width, height }) }
            : { [value]: await canvasConvert(video, value === 'base64', { width, height }) };
    }
}
</script>