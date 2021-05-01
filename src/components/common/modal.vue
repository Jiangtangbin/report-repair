<template>
    <modal
        v-on="$listeners"
        v-bind="$attrs"
        :value="value"
        :fullscreen="isFullscreen"
        :theme="theme"
        :mask-closable="maskClosable"
        class="h-modal"
    >
        <template v-if="$scopedSlots.header" #header>
            <slot name="header" />
        </template>
        <slot />
        <template #footer>
            <slot name="footer" :loading="isLoading" :onOk="ok" :onCancel="cancel">
                <Button @click="cancel" type="text">{{$t('i.modal.cancelText')}}</Button>
                <Button v-if="isConfim" @click="ok" :loading="isLoading" type="primary">{{$t('i.modal.okText')}}</Button>
            </slot>
        </template>
    </modal>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import { Modal, Button } from 'view-design';
import { appModule } from '@/store';

@Component({
    inheritAttrs: false,
    components: {
        Modal,
        Button,
    },
})
export default class MyModal extends Vue {
    @Prop({ type: Boolean, required: true })
    value!: boolean;
    // 弹窗主题 -> dark
    @Prop({ type: String, default: 'dark' })
    theme?: string;
    @Prop({ type: Boolean, default: false })
    loading!: boolean;
    @Prop(Function)
    loadingFunc?: () => boolean;
    @Prop({ type: Boolean, default: undefined })
    fullscreen?: boolean;
    @Prop({ type: Boolean, default: false })
    maskClosable?: boolean;
    // 新增参数，是否需要确认按钮（设备升级与调试）
    @Prop({ type: Boolean, default: true })
    isConfim?: boolean;

    get isMobile() {
        return appModule.isMobile;
    }

    get isFullscreen() {
        const { fullscreen, isMobile } = this;
        return typeof fullscreen === 'boolean' ? fullscreen : isMobile;
    }

    private isLoading = false;

    /**
     * @description: 确定事件
     */
    async ok() {
        const { loading, loadingFunc } = this;
        if (loading && typeof loadingFunc === 'function') {
            this.isLoading = true;
            const status = await loadingFunc();
            this.isLoading = false;
            if (status) {
                this.$emit('on-ok');
                this.$emit('input', false);
            }
            return;
        }
        this.$emit('on-ok');
        this.$emit('input', false);
    }
    /**
     * @description: 关闭事件
     */
    cancel() {
        this.isLoading = false;
        this.$emit('on-cancel');
        this.$emit('input', false);
    }
}
</script>

<style scoped lang="scss">
    // 拖动背景
    .h-modal[theme=draggable] {
        @include utils-pierce(ivu-modal) {
            // 弹出窗口拖动时
            .popup-table-wrapper {
                height: auto; max-height: calc(80vh - 153px);
            }
            .basic-list-main-table-page {
                text-align: right;
                margin-top: 5px;
                .ivu-page-options {
                    margin-top: 5px;
                }
            }
        }
    }
    // 暗黑背景
    .h-modal[theme=dark] {
        @include utils-pierce(ivu-modal-wrap) {
            display: flex;
            justify-content: center;
            align-items: center;
            .ivu-modal {
                top: 0;
            }
        }
    }
</style>