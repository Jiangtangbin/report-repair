<template>
    <my-modal
        v-model="value"
        @on-visible-change="!$event && cameraStatus && [ stopCamera(), hide() ]"
        :loading-func="uploadImg"
        :title="title"
        width="1080px"
        loading
    >
        <div class="camera-wrapper">
            <div class="camera-body">
                <div class="camera-body-preview d-v-c">
                    <span class="camera-body-preview-title">{{$t('h.camera.cameraArea')}}</span>
                    <camera ref="video" />
                </div>
                <div class="camera-body-preview d-v-c">
                    <span class="camera-body-preview-title">{{$t('h.camera.previewArea')}}</span>
                    <img v-if="file.base64" :src="file.base64" />
                </div>
            </div>
            <p class="camera-footer">
                <my-button @click="toggleCamera" type="primary">{{cameraStatus ? $t('h.tableButton.close') : $t('h.tableButton.open')}}{{$t('h.camera.webCamera')}}</my-button>
                <my-button v-show="cameraStatus" @click="snap" class="camera-footer-screenshot" type="primary">{{file.base64 ? $t('h.camera.againScreenshot') : $t('h.camera.screenshot')}}</my-button>
            </p>
        </div>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import { BasePopup } from '@/base-class/dynamic-create';
import Camera from '@/components/common/camera.vue';
import { upload } from '@/mixins/index';

@Component({
    name: 'CameraHandle',
    components: {
        Camera,
    },
})
export default class CameraHandle extends BasePopup {
    $refs!: {
        video: Camera;
    }

    @Prop({ type: Object, default: () => ({ video: { width: 500 }}) })
    params!: MediaStreamConstraints;
    // 打开窗口时是否自动打开视频
    @Prop(Boolean)
    autoOpen!: boolean;

    cameraStatus = false;
    file = { base64: '', blob: new Blob() } as { base64: string; blob: Blob | null };

    // 弹窗打开事件
    prefixFunc() {
        this.autoOpen && this.changeCamera(true);
    }

    /**
     * 操作摄像头(打开或关闭)
     */
    toggleCamera() {
        const { cameraStatus, params } = this;
        this.$refs.video[cameraStatus ? 'stop' : 'start'](params);
        this.cameraStatus = !cameraStatus;
    }
    /**
     * @description: 根据传递的值操作摄像头(打开或关闭)
     * @param {Boolean} status: 打开或关闭
     */
    changeCamera(status: boolean) {
        const { params } = this;
        this.$refs.video[status ? 'start' : 'stop'](params);
        this.cameraStatus = status;
    }

    /**
     * 截图
     */
    async snap() {
        this.file = (await this.$refs.video.snap('both')) as CameraHandle['file'];
    }

    // 关闭模态框前关闭视频
    stopCamera() {
        this.$refs.video.stop();
        this.cameraStatus = false;
        this.file = { base64: '', blob: new Blob() };
    }
    // 上传图片到后台
    async uploadImg() {
        const { file: { blob, base64 }, $Message } = this;
        if (!(base64 && blob)) return ($Message.info(this.$t('h.tips.beforeSnap')), false);
        // 不走 qiniu ，直接传给后台
        // const key = await upload(blob);
        // if (key) {
        this.$emit('success', { url: base64, key: blob });
        this.hide();
        //     return true;
        // }
    }
}
</script>
<style scoped lang="scss">
    $minWidth: 500px;

    .camera-wrapper {
        max-width: 100vw; height: 430px;
        margin: 10px;
        overflow: auto;
        display: flex;
        flex-flow: column;
    }
    .camera-body {
        flex: auto;
        display: flex;
        // 摄像头预览区域
        &-preview {
            min-width: $minWidth;
            color: #ccc;
            border: 1px dashed;
            border-radius: 5px;
            overflow: hidden;
            &:first-child {
                margin-right: 5px;
            }
            &-title {
                position: absolute;
            }
        }
    }
    // 操作按钮
    .camera-footer {
        margin: 10px;
        text-align: right;
        &-screenshot {
            margin-left: 10px;
        }
    }
</style>
