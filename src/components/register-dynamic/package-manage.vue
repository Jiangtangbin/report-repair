<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.package')}`"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="type" :label="i18n.label.type">
                <i-select v-model="formInline.type" :placeholder="i18n.placeholder.type">
                    <i-option v-for="item of dicts.type" :key="item.name" :value="item.name">{{$t(item.title)}}</i-option>
                </i-select>
            </form-item>
            <form-item prop="version_name" :label="i18n.label.version_name">
                <i-input v-model="formInline.version_name" :placeholder="i18n.placeholder.version_name" />
            </form-item>
            <form-item prop="version_no" :label="i18n.label.version_no">
                <i-input v-model="formInline.version_no" :placeholder="i18n.placeholder.version_no" />
            </form-item>
            <template v-if="formInline.type !== 4">
                <form-item prop="t" :label="i18n.label.t">
                    <i-select v-model="formInline.apkType">
                        <i-option v-for="item of dicts.apkType" :key="item.value" :value="item.value">{{$t(item.title)}}</i-option>
                    </i-select>
                </form-item>
            </template>
            <form-item prop="iosUrl" v-if="formInline.type === 4 || formInline.apkType === 'input'" :label="i18n.label.iosUrl" key="iosUrl">
                <i-input v-model="formInline.iosUrl" :placeholder="i18n.placeholder.iosUrl" />
            </form-item>
            <form-item prop="url" v-else :label="i18n.label.url" key="url">
                <my-upload
                    v-show="!formInline.url.length"
                    @ready="formInline.url = $event"
                    :max-size="51200"
                    :format="dicts.format"
                    ref="upload"
                />
                <div v-for="(item, index) of formInline.url" :key="index" class="file-item">
                    <template v-if="item.status === 'finished'">
                        <span class="">
                            <svg-icon icon-class="file-video-o" />
                            <a class="file-item-name" :download="item.name" :href="item.url" target="_blank">{{item.name}}</a>
                        </span>
                        <svg-icon @click.native="$refs.upload.remove(index)" class="close" icon-class="trash-o" />
                    </template>
                    <template v-else>
                        <i-progress v-if="item.showProgress" :percent="item.percentage" hide-info></i-progress>
                    </template>
                </div>
            </form-item>
            <form-item prop="remark" :label="i18n.label.remark">
                <i-input v-model="formInline.remark" :placeholder="i18n.placeholder.remark" />
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Select as ISelect, Option as IOption, Progress as IProgress } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import MyUpload from '@/components/upload/index.vue';
import { setPackage as set } from '@/config/api';
import lodashGet from 'lodash/get';

@Component({
    name: 'PackageManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        ISelect,
        IOption,
        IProgress,
        MyUpload,
    },
})
export default class PackageManageHandle extends Popup<'SetPackage'> {
    $refs!: {
        form: IForm;
    }

    loading = false;
    formInline = {
        type: 1,
        version_name: '',
        version_no: '',
        remark: '',
        iosUrl: '',
        url: [] as any[],
        apkType: 'upload',
    };
    dicts = {
        type: [
            {
                name: 1,
                title: 'h.formLabel.package.androidPackage',
            },
            {
                name: 4,
                title: 'h.formLabel.package.iosPackage',
            },
        ],
        apkType: [
            { title: 'h.formLabel.package.file', value: 'upload' },
            { title: 'h.formLabel.package.urlAddress', value: 'input' },
        ],
        format: ['msi', 'exe', 'apk'],
    }

    get i18n() {
        const label = {
            type: `${this.$t('h.formLabel.type')}: `,
            version_name: `${this.$t('h.package.versionName')}: `,
            version_no: `${this.$t('h.package.versionNumber')}: `,
            t: `${this.$t('h.formLabel.package.packageType')}: `,
            iosUrl: `${this.$t('h.formLabel.package.fileAddress')}: `,
            url: `${this.$t('h.formLabel.package.file')}: `,
            remark: `${this.$t('h.formLabel.remark')}: `,
        };
        const placeholder = {
            type: this.$t('h.placeholder.pleaseSelect', { msg: label.type }),
            version_name: this.$t('h.placeholder.pleaseEnter', { msg: label.version_name }),
            version_no: this.$t('h.placeholder.pleaseEnter', { msg: label.version_no }),
            url: this.$t('h.placeholder.pleaseUpload', { msg: label.url }),
            iosUrl: this.$t('h.placeholder.pleaseEnter', { msg: label.iosUrl }),
            remark: this.$t('h.placeholder.pleaseEnter', { msg: label.remark }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            type: { type: 'number', required: true, message: placeholder.type },
            version_name: { required: true, message: placeholder.version_name, trigger: 'blur' },
            version_no: { required: true, message: placeholder.version_no, trigger: 'blur' },
            iosUrl: { required: true, message: placeholder.iosUrl, trigger: 'blur' },
            url: { required: true, type: 'array', message: placeholder.url },
        };
    }

    // 打开前事件
    prefixFunc() {
    }
    // 关闭前事件
    suffixFunc() {
        const { formInline, formInline: { url }} = this;
        this.$refs.form.resetFields();
        url.splice(0);
        formInline.url = url;
    }
    // 提交事件
    async ok() {
        const { $refs: { form: { validate }}, formInline: { apkType, iosUrl, url, ...args }} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                url: args.type === 4 || apkType === 'input' ? iosUrl : lodashGet(url, '[0].response.key', ''),
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

    .file-item {
        &-name {
            margin: 0 5px;
        }
    }
</style>