<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.notice')}`"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="title" :label="i18n.label.title">
                <i-input v-model="formInline.title" :readonly="forbidden" :placeholder="i18n.placeholder.title" />
            </form-item>
            <form-item prop="content" :label="i18n.label.content" class="rich-text">
                <rich-text @on-ready="handleRichText" ref="richText" />
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Select as ISelect, Option as IOption } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import RichText from '@/components/common/richText.vue';
import { setNotice as set, getNoticeInfo as get } from '@/config/api';

@Component({
    name: 'NoticeManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        ISelect,
        IOption,
        RichText,
    },
})
export default class NoticeManageHandle extends Popup<'SetNotice'> {
    $refs!: {
        form: IForm;
        richText: any;
    }

    loading = false;
    editor = null;
    formInline = {
        type: 1,
        id: 0,
        title: '',
        content: '',
    };

    get i18n() {
        const label = {
            title: `${this.$t('h.formLabel.title')}: `,
            content: `${this.$t('h.formLabel.content')}: `,
        };
        const placeholder = {
            title: this.$t('h.placeholder.pleaseEnter', { msg: label.title }),
            content: this.$t('h.placeholder.pleaseEnter', { msg: label.content }),

        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            title: { required: true, message: placeholder.title, trigger: 'blur' },
        };
    }

    @Watch('type', { immediate: true })
    changeT(type: 1 | 2 | 'details') {
        typeof type === 'number' && (this.formInline.type = type);
    }

    // 打开前事件
    prefixFunc() {
        const {
            formInline,
            id,
        } = this;

        id && (formInline.id = id);
        id && this.getDetails();
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    // 获取详情
    async getDetails() {
        const { id } = this;
        if (!id) return console.log('请填写详情 id: ', id);
        this.loading = true;
        const { type, data } = await get(id);
        if (!type) this.setDetails(data);
        this.loading = false;
    }
    // 设置详情
    setDetails({ title, content }: API.Response['NoticeInfo']) {
        const { formInline } = this;
        Object.assign(formInline, {
            title,
            content,
        });
        (this.editor as any).txt.html(formInline.content);
        this.forbidden && (this.editor as any).disable();
    }
    // 保存 editor 实例
    handleRichText(editor: any) {
        this.editor = editor;
    }
    // 提交事件
    async ok() {
        const { $refs: { form: { validate }}, formInline: { content, ...args }} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                content: this.$refs.richText.getValues(),
            });
            const { type: types } = await set(params);
            if (!types) this.$emit('success');
            this.loading = false;
            return !types;
        }
        return false;
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    .rich-text {
        height: 458px;
        max-height: 458px;
        margin-top: -28px;
        padding-top: 28px;
        @include utils-pierce(ivu-form-item-label) {
            &::before {
                content: '*';
                display: inline-block;
                margin-right: 4px;
                line-height: 1;
                font-family: SimSun;
                font-size: 14px;
                color: #ed4014;
            }
        }
    }
</style>