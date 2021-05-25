<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.reply')}`"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="reply_content" :label="i18n.label.reply_content">
                <i-input v-model="formInline.reply_content" :readonly="forbidden" type="textarea" :placeholder="i18n.placeholder.reply_content" />
            </form-item>
            <form-item :label="i18n.label.reply_imgs" prop="reply_imgs" class="form-item-iv">
                <my-upload v-show="!forbidden" @ready="formInline.reply_imgs = $event" :format="imgFormat" :maxNum="2" ref="uploadImgs" multiple />
                <div v-for="(item, index) of formInline.reply_imgs" :key="index" class="upload-item">
                    <template v-if="item.status === 'finished'">
                        <img :src="item.url" @error="globalImgFail" @click="$previewRefresh" preview="workPicture" class="c-p" />
                        <p class="upload-item-mask">
                            <svg-icon icon-class="eye-center" />
                            <svg-icon v-show="!forbidden" @click="$refs.uploadImgs.remove(index)" class="upload-item-mask-trash" icon-class="trash-o" />
                        </p>
                    </template>
                    <template v-else>
                        <i-progress v-if="item.showProgress" :percent="item.percentage" />
                    </template>
                </div>
            </form-item>
            <form-item :label="i18n.label.reply_videos" prop="reply_videos" class="form-item-iv">
                <my-upload v-show="!forbidden" @ready="formInline.reply_videos = $event" :format="videoFormat" :maxNum="2" ref="uploadVideos" multiple />
                <div v-for="(item, index) of formInline.reply_videos" :key="index" class="upload-item">
                    <template v-if="item.status === 'finished'">
                        <video :src="item.url" controls ref="video" />
                        <svg-icon v-show="!forbidden" @click="$refs.uploadVideos.remove(index)" class="upload-item-video" icon-class="trash-o" />
                    </template>
                    <template v-else>
                        <i-progress v-if="item.showProgress" :percent="item.percentage" />
                    </template>
                </div>
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Progress as IProgress } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import MyUpload from '@/components/upload/index.vue';
import { imgFormat, videoFormat } from '@/config/index';
import { replyWork as set } from '@/config/api';

@Component({
    name: 'WorkReplyManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        IProgress,
        MyUpload,
    },
})
export default class WorkReplyManageHandle extends Popup<'ReplyWork'> {
    $refs!: {
        form: IForm;
    }

    @Prop({ type: Number })
    work_id!: number;

    loading = false;
    imgFormat = imgFormat;
    videoFormat = videoFormat;
    formInline = {
        work_id: 0,
        reply_content: '',
        reply_imgs: [],
        reply_videos: [],
    };

    get i18n() {
        const label = {
            reply_content: `${this.$t('h.formLabel.work.replyContent')}: `,
            reply_imgs: `${this.$t('h.formLabel.work.imgs')}: `,
            reply_videos: `${this.$t('h.formLabel.work.videos')}: `,
        };
        const placeholder = {
            reply_content: this.$t('h.placeholder.pleaseEnter', { msg: label.reply_content }),

        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            reply_content: { required: true, message: placeholder.reply_content, trigger: 'blur' },
        };
    }

    // 打开前事件
    prefixFunc() {
        const {
            formInline,
            work_id,
        } = this;

        work_id && (formInline.work_id = work_id);
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    // 提交事件
    async ok() {
        const { $refs: { form: { validate }}, formInline: { reply_imgs, reply_videos, ...args }} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                imgs: reply_imgs.map((v: any) => v.response.data.url),
                videos: reply_videos.map((v: any) => v.response.data.url),
            });
            const { type } = await set(params);
            if (!type) this.$emit('success');
            this.loading = false;
            return !type;
        }
        return false;
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    video::-webkit-media-controls-timeline {
        display: none !important;
    }

    @include utils-pierce(form-item-iv) {
        .ivu-form-item-content {
            display: flex;
        }
    }
</style>