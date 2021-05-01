<template>
    <base-upload
        v-on="$listeners"
        v-bind="$attrs"
        :action="action"
        :data="parameter"
        :beforeUpload="handlingBeforeUpload"
        :onFormatError="onFormatError"
        :onExceededSize="onExceededSize"
        :onError="onError"
        ref="baseUpload"
    >
        <template v-if="$slots.default">
            <slot />
        </template>
    </base-upload>
</template>
<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import BaseUpload, { Res, BeforeUploadErrorOption } from '@/components/common/upload.vue';
import { getUpToken as get, action } from '@/config/api';
import { userModule } from '@/store/index';

// 会重新获取 token 的错误字段
const repeatToken = ['expired token', 'bad token', 'token not specified'];
// 重复上传文件的次数
let repeatFileNum: Record<string, number> = {};
// 同一时间内重新获取 token 的最大次数
const repeatMaxNum = 3;
let updateTokenPromise: null | Promise<boolean> = null;

@Component({
    name: 'my-upload',
    components: {
        BaseUpload,
    },
})
export default class MyUpload extends Vue {
    $refs!: {
        baseUpload: BaseUpload;
    }

    // 上传的接口
    @Prop({ type: String, default: action })
    action!: string;
    // 传递的参数
    @Prop({ type: Object, default: () => ({}) })
    data!: object;
    // 上传前的处理 - 是否允许上传
    @Prop({ type: Function })
    beforeUpload?: (error: BeforeUploadErrorOption, file: File, maxNum: number) => Promise<boolean> | boolean;

    // 上传文件前的 params 参数
    get parameter() {
        const { data } = this;
        return { token: userModule.token, ...data };
    }

    /**
     * @description: 上传前事件
     * @param {Object} error: 错误信息
     * @param {File} file: 上传的文件
     * @param {Number} maxNum: 上传文件的最大大小
     * @return {Boolean} 根据返回值来确定是否继续上传
     */
    handlingBeforeUpload(error: BeforeUploadErrorOption, file: File, maxNum: number): Promise<boolean> | boolean {
        if (error.repeat) {
            this.$Notice.warning({ title: this.$t('h.upload.repeat', { msg: file.name }) as string });
            return false;
        } else if (error.outnumber) {
            this.$Notice.warning({
                title: this.$t('h.upload.maxNum', { msg: maxNum }) as string,
            });
            return false;
        }
        if (this.beforeUpload) return this.beforeUpload(error, file, maxNum);
        return true;
    }
    onFormatError(name: string, format: string[]) {
        this.$Notice.warning({
            title: this.$t('h.upload.formatTitle') as string,
            desc: this.$t('h.upload.formatDesc', { msg: name, format: format.join(', ') }) as string,
        });
    }
    onExceededSize(name: string, fileSize: number, size: number) {
        this.$Notice.warning({
            title: this.$t('h.upload.maxSizeTitle', { msg: size }) as string,
            desc: this.$t('h.upload.maxSizeDesc', { msg: name, size: fileSize }) as string,
        });
    }
    // 获取上传文件的 token
    async getToken() {
        if (updateTokenPromise) return updateTokenPromise;
        updateTokenPromise = get()
            .then(({ type, data }) => {
                !type && userModule.updateToken(data.upToken);
                updateTokenPromise = null;
                return !type;
            });
        return updateTokenPromise;
    }
    /**
     * @description: 对错误返回值进行处理，确认不是 token 失效的问题
     * @param {Error} err: 错误信息
     * @param {Object} res: 上传返回的响应值
     * @param {File} file: 上传的文件
     * @param {Function} aginUpload: 重新上传的回调
     */
    async onError(err: any, res: Res, file: File, aginUpload: () => void) {
        const { error } = res;
        const key = file.name;
        if (repeatToken.includes(error)) {
            repeatFileNum[key] = repeatFileNum[key] || 0;
            repeatFileNum[key]++;
            if (repeatFileNum[key] < repeatMaxNum) {
                const status = await this.getToken();
                status && aginUpload();
            }
        } else {
            delete repeatFileNum[key];
            this.$Message.error(this.$t('h.tips.uploadError'));
            console.log({ err, res, file });
        }
    }
    /**
     * @description: 删除指定图片，外部调用
     * @param {Number} index: 照片的下标
     */
    remove(index: number) {
        this.$refs.baseUpload.remove(index);
    }
}
</script>