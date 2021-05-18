<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.knowLedgeBase')}`"
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
                <rich-text ref="richText" />
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Select as ISelect, Option as IOption } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import RichText from '@/components/common/richText.vue';
import { setKnowledgeBase as set, getKnowledgeBaseInfo as get } from '@/config/api';

@Component({
    name: 'KnowLedgeManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        ISelect,
        IOption,
        RichText,
    },
})
export default class KnowLedgeManageHandle extends Popup<'SetKnowledgeBase'> {
    $refs!: {
        form: IForm;
        richText: any;
    }

    loading = false;
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
    setDetails({ title, content }: API.Response['KnowledgeBaseInfo']) {
        const { formInline } = this;
        Object.assign(formInline, {
            title,
            content,
        });
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
        height: 430px;
        max-height: 430px;
    }
</style>