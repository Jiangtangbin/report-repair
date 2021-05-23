<template>
    <upload
        v-bind="$attrs"
        :action="action"
        :data="data"
        :max-size="maxSize"
        :format="format"
        :showUploadList="showUploadList"
        :before-upload="handingBeforeUpload"
        :on-format-error="handingFormatError"
        :on-exceeded-size="handingExceededSize"
        :on-progress="onProgress"
        :on-success="handingSuccess"
        :on-error="handingError"
        :headers="{token: uploadToken}"
        ref="upload"
    >
        <slot>
            <p :style="styles" class="upload">
                <svg-icon icon-class="add" />
            </p>
        </slot>
    </upload>
</template>
<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import { Upload } from 'view-design';
import { userModule } from '@/store/index';
import { imgFormat } from '@/config/index';
import { isFunction } from '@/utils/index';

interface CustomFile extends File {
    url?: string;
    status: string;
    percentage: number;
    uid: number;
}

export interface Res {
    error: string;
}
export interface BeforeUploadErrorOption {
    repeat?: boolean;
    outnumber?: boolean;
}

@Component({
    name: 'base-upload',
    components: {
        Upload,
    },
})
export default class BaseUpload extends Vue {
    $refs!: {
        upload: Upload;
    }

    // 上传的接口
    @Prop({ type: String, required: true })
    action!: string;
    // 传递的参数
    @Prop({ type: Object, default: () => ({}) })
    data!: object;
    // 展示框的样式
    @Prop({ type: Object, default: () => ({}) })
    styles!: object;
    // 最大上传数量
    @Prop({ type: Number, default: 3 })
    maxNum!: number;
    // 是否显示上传列表
    @Prop(Boolean)
    showUploadList!: boolean;
    // 是否支持多选
    @Prop({ type: Boolean, default: false })
    multiple!: boolean;
    // 最大上传大小
    @Prop({ type: Number, default: 2048 })
    maxSize!: number;
    // 最大上传大小
    @Prop({ type: Array, default: () => imgFormat })
    format!: string[];
    @Prop({ type: Function })
    beforeUpload?: (error: BeforeUploadErrorOption, file: File, maxNum: number) => boolean;
    @Prop({ type: Function })
    onFormatError?: (name: string, format: string[], file: File) => void;
    @Prop({ type: Function })
    onExceededSize?: (name: string, fileSize: number, size: number, file: File) => void;
    @Prop(Function)
    onSuccess?: Function;
    @Prop(Function)
    onProgress?: Function;
    @Prop(Function)
    onError?: (err: any, res: Res, file: File, aginUpload: () => void) => void;
    // type 为 custom 且 beforeUpload(): false 则为自定义上传，该组件不处理上传事件，但会将上传的文件保存到已上传列表
    @Prop(String)
    type?: 'custom' | 'default';

    // 上传成功的文件列表
    fileList: CustomFile[] = [];
    // 上传文件 token 失效时重新请求的次数总计，总数超过三次则本次请求不再重复
    count = 0;
    // 上传的时候备份该文件的本地 url 地址，供图片展示用
    uploadingBackupsLocalURL: Dictionary<string> = {};

    mounted() {
        this.fileList = (this.$refs.upload as any).fileList;
        this.$emit('ready', this.fileList);
    }

    get uploadToken() {
        return userModule.user.token;
    }

    /**
     * @description: 上传前对参数进行处理, 获取文件的 url
     * @param {File} file: {当前上传的图片}
     * @returns {Boolean}: (根据 Boolean 来确认是否上传)
     */
    handingBeforeUpload(file: CustomFile) {
        const reader = new FileReader();
        let result = true;
        if (isFunction(this.beforeUpload)) {
            const { fileList, multiple, maxNum } = this;
            const _maxNum = multiple ? maxNum : Infinity;
            const options = {
                repeat: fileList.some(f => f.name === file.name),
                outnumber: fileList.length >= _maxNum,
            };
            result = this.beforeUpload(options, file, _maxNum);
        }
        reader.onloadend = event => {
            event.target && (this.uploadingBackupsLocalURL[file.name] = file.url = (event.target as any).result);
            // 类型为 custom 且阻止上传，则将该文件保存至已上传列表
            if (this.type === 'custom' && result === false) this.simulateUploadSuccess(file);
        };
        reader.readAsDataURL(file);
        return result;
    }
    /**
     * @description: 上传格式错误事件
     * @param {File} file: {当前上传的图片}
     */
    handingFormatError(file: File) {
        if (isFunction(this.onFormatError)) {
            this.onFormatError(file.name, this.format, file);
        }
    }
    /**
     * @description: 文件大小超出限制
     * @param {File} file: {当前上传的图片}
     */
    handingExceededSize(file: File) {
        if (isFunction(this.onExceededSize)) {
            const { maxSize } = this;
            const size = Math.floor(maxSize / 1024);
            const fileSize = Math.floor(file.size / 1000 / 1024);
            this.onExceededSize(file.name, fileSize, size, file);
        }
    }
    /**
     * 上传成功后进行处理，将保存的本地地址添加到展示列表中
     */
    handingSuccess(res: object, file: File, list: CustomFile[]) {
        const { multiple } = this;
        const { name } = file;
        const localURL = this.uploadingBackupsLocalURL[name];
        (file as any).url = localURL;
        delete this.uploadingBackupsLocalURL[name];
        // 单选的情况下，直接替换图片
        !multiple && list.length > 1 && list.splice(0, list.length - 1);
        isFunction(this.onSuccess) && this.onSuccess(res, file, list);
        this.count = 0;
    }
    /**
     * @description: 上传错误事件
     * @param {Error} err: 错误信息
     * @param {Object} res: 上传返回的响应值
     * @param {File} file: 上传的文件
     */
    async handingError(err: any, res: Res, file: File) {
        // 第四个参数是重新上传
        isFunction(this.onError) && this.onError(err, res, file, () => {
            (this.$refs.upload as any).post(file);
        });
    }
    // 模拟上传成功，针对 type 为 custom 时
    simulateUploadSuccess(file: CustomFile) {
        const upload = this.$refs.upload as any;
        file.status = 'finished';
        file.percentage = 100;
        file.uid = Date.now() + (upload.tempIndex as number)++;
        this.fileList.push(file);
    }
    /**
     * @description: 删除指定图片，外部调用
     * @param {Number} index: 照片的下标
     */
    remove(index: number) {
        this.fileList.splice(index, 1);
    }
}
</script>
<style scoped lang="scss">
    .upload {
        width: 50px;
        height: 50px;
        border: $--border-base-dashed-color;
        cursor: pointer;
        transition: $--border-transition-base;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        &:hover {
            border-color: $--border-base-dark-color;
        }
    }
</style>