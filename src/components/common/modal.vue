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
            box-shadow: rgba(0, 234, 255, 1) 0px 0px 6px 6px inset;
            border-radius: 8px;
            border: 1px solid #297fff;
            top: 68px;
            .ivu-modal-content {
                background: rgba(0, 28, 92, 0.8);
                .ivu-modal-body {
                    color: $--white;
                    // placeholder 颜色
                    @include input_placeholder($--btn-disable-color-list);
                    .ivu-select-selection .ivu-select-placeholder {
                        color: $--btn-disable-color-list;
                    }
                }
                .ivu-btn-text {
                    color: $--white;
                    &:hover {
                        background-color: #4E6197;
                    }
                }
                .ivu-modal-header {
                    border-bottom: 1px solid #1C45A6;
                }
                // 文字
                .ivu-modal-header-inner {
                    color: $--white;
                }
                // 关闭按钮
                .ivu-modal-close .ivu-icon {
                    color: $--white;
                }
                .ivu-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    border-top: none;
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
        }
        @include utils-pierce(ivu-modal) {
            box-shadow: rgba(0, 234, 255, 1) 0px 0px 6px 6px inset;
            border-radius: 8px;
            border: 1px solid #297fff;
            top: 0;
            .ivu-modal-content {
                background: rgba(0, 28, 92, 0.8);
                .ivu-modal-body {
                    color: $--white;
                    // placeholder 颜色
                    @include input_placeholder($--btn-disable-color-list);
                    .ivu-select-selection .ivu-select-placeholder {
                        color: $--btn-disable-color-list;
                    }
                }
                .ivu-btn-text {
                    color: $--white;
                    &:hover {
                        background-color: #4E6197;
                    }
                }
                .ivu-modal-header {
                    border-bottom: 1px solid #1C45A6;
                }
                // 文字
                .ivu-modal-header-inner {
                    color: $--white;
                }
                // 关闭按钮
                .ivu-modal-close .ivu-icon {
                    color: $--white;
                }
                .ivu-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    border-top: none;
                }
            }
        }
    }
</style>