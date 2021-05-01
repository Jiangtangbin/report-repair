<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="$t('h.modal.titles.uploadFile')"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="name" :label="i18n.label.name">
                <i-input v-model="formInline.name" :readonly="forbidden" :placeholder="i18n.placeholder.name" />
            </form-item>
            <div class="col">
                <form-item prop="t" class="col2" :label="i18n.label.t">
                    <i-select v-model="formInline.t" @on-change="typeChange" :placeholder="i18n.placeholder.t" clearable>
                        <i-option v-for="item of dicts.t" :key="item.value" :value="item.value">{{item.title}}</i-option>
                    </i-select>
                </form-item>
                <form-item prop="org_id" class="col2" :label="i18n.label.org_id">
                    <div class="col">
                        <div @click.self="!isBjg && (forbidden || selectCard('org_id'))" :label="i18n.placeholder.org_id" class="receive-wrapper simulate-input pseudo-prefix-empty">
                            <figure v-for="(item, key) of formInline.org_id" :key="key" class="receive-item">
                                <figcaption @click="openWins('org', item.id)" :title="item.name" class="t-o-e simulate-a">{{item.name}}</figcaption>
                                <svg-icon
                                    v-show="!isBjg && !forbidden"
                                    @click.stop.native="delReceiveItem('org_id', key)"
                                    class="receive-item-close"
                                    icon-class="close"
                                />
                            </figure>
                        </div>
                        <my-button v-if="!isBjg" v-show="!forbidden" @click="selectCard('org_id')" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                    </div>
                </form-item>
            </div>
            <form-item :label="i18n.label.file" prop="file">
                <my-upload
                    v-show="!formInline.file.length"
                    @ready="formInline.file = $event"
                    :beforeUpload="formatHandle"
                    type="custom"
                    ref="upload"
                />
                <div v-for="(item, index) of formInline.file" :key="index" class="file-item">
                    <template v-if="item.status === 'finished'">
                        <svg-icon :icon-class="`file-${formInline.t}`" />
                        <a class="file-item-name" :download="item.name" :href="item.url" target="_blank">{{item.name}}</a>
                        <svg-icon @click.native="$refs.upload.remove(index)" class="close" icon-class="trash-o" />
                    </template>
                    <template v-else>
                        <i-progress v-if="item.showProgress" :percent="item.percentage" hide-info></i-progress>
                    </template>
                </div>
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Select as ISelect, Option as IOption, Progress as IProgress } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import MyUpload from '@/components/upload/index.vue';
import { uploadFile as set } from '@/config/api';
import { isFile, formatDate } from '@/utils/index';
import { imgFormat, videoFormat, audioFormat } from '@/config/index';
import lodashGet from 'lodash/get';
import { DictModule } from '@/store/modules/dict';
import { userModule } from '@/store/index';

const tableListType: Dictionary<string> = {
    org_id: 'customer',
};

@Component({
    name: 'FileManageHandle',
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
export default class FileManageHandle extends Popup<'UploadFile'> {
    $refs!: {
        form: IForm;
    }

    @Prop({ type: Object })
    orgs!: object;

    loading = false;
    fileFormat = imgFormat;
    formInline = {
        name: '',
        t: 'image',
        org_id: [],
        file: [] as any[],
    }
    dicts = ({
        t: [],
    } as Record<'t', any[]>)

    get i18n() {
        const label = {
            name: `${this.$t('h.formLabel.fileManage.fileName')}: `,
            t: `${this.$t('h.formLabel.fileManage.fileType')}: `,
            org_id: `${this.$t('h.formLabel.affiliatedCustomer')}: `,
            file: `${this.$t('h.formLabel.fileManage.file')}: `,
        };
        const placeholder = {
            name: this.$t('h.placeholder.pleaseEnter', { msg: label.name }),
            t: this.$t('h.placeholder.pleaseSelect', { msg: label.t }),
            org_id: this.$t('h.placeholder.pleaseSelect', { msg: label.org_id }),
            file: this.$t('h.placeholder.pleaseSelect', { msg: label.file }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            name: { required: true, message: placeholder.name, trigger: 'blur' },
            t: { required: true, message: placeholder.t },
            org_id: { required: true, message: placeholder.org_id },
            file: { required: true, type: 'array', message: placeholder.file },
        };
    }
    // 是否是被监管客户，被监管客户无法选择所属客户
    get isBjg() {
        const orgattr = userModule.user.info.orgattr;
        return !orgattr || orgattr === 'bjg';
    }

    // 所属机构发生改变
    @Watch('orgs', { immediate: true })
    changeOrgs(val?: object) {
        (this.formInline as any).org_id = val ? [val] : [];
    }

    // 打开前事件
    prefixFunc() {
        const {
            dicts: {
                t: { length: t }, 
            },
        } = this;

        t || this.getDicts('t', 'dict', 1);
    }
    // 关闭前事件
    suffixFunc() {
        const { formInline, formInline: { file }} = this;
        this.$refs.form.resetFields();
        file.splice(0);
        formInline.file = file;
    }
    /**
     * 修改上传类型
     * @param {String} type: 类型
     */
    typeChange(type: string) {
        this.fileFormat = type === 'image' ? imgFormat : type === 'video' ? videoFormat : audioFormat;
    }
    // 格式处理
    formatHandle(error: any, file: File, maxNum: number) {
        const { fileFormat } = this;
        const [, type] = file.type.split('/');
        // 不允许超过 40 MB
        if (file.size / 1000 / 1024 > 40) {
            this.$Notice.warning({
                title: this.$t('h.upload.maxSizeTitle', { msg: 40 }) as string,
                desc: this.$t('h.upload.maxSizeDesc', { msg: name, size: file.size }) as string,
            });
            return Promise.reject();
        }
        if (!fileFormat.includes(type)) {
            this.$Notice.warning({
                title: this.$t('h.upload.formatTitle') as string,
                desc: this.$t('h.upload.formatDesc', { msg: file.name, format: fileFormat.join('，') }) as string,
            });
            return Promise.reject();
        }
        return false;
    }
    /**
     * 获取字典数据
     * @param {String} key: 成功赋值的键
     * @param {String} type: 字典请求的类型
     * @param {any} params?: 字典请求的参数
     */
    async getDicts<T extends keyof FileManageHandle['dicts']>(key: T, type: GlobalCustomDicts.CustomDictsKey, params?: GlobalCustomDicts.CustomDictsValue) {
        const { dicts } = this;
        let data = await DictModule.getCustomDicts({ type, params });
        if (data && typeof data !== 'string') {
            (dicts[key] as any[]) = data;
        }
    }
    // 选择弹窗
    selectCard(type: keyof FileManageHandle['formInline']) {
        this.$getDynamicComponent('tableList', () => {
            const { formInline } = this;
            this.$createTableListHandle({
                t: tableListType[type],
                checked: formInline[type],
                $events: {
                    success: (data: Dictionary<any>[]) => {
                        (formInline[type] as Dictionary<any>[]) = data;
                    },
                },
            }).show();
        });
    }
    // 提交事件
    async ok(cover = undefined) {
        const { $refs: { form: { validate }}, formInline, formInline: { org_id: org, file, name, ...args }, ok, $Modal} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const _params = Object.assign(args, {
                cover,
                name,
                org_id: lodashGet(org, '[0].id', ''),
                file: isFile(file[0]) ? file[0] : lodashGet(file, '[0].response.key', ''),
            });
            // 图片 file 提交方式
            const params = new FormData();
            Object.entries(_params).every(([k, v]) => {
                // undefined 不传递
                v === undefined || params.append(k, v);
                return true;
            });
            const { type, data } = await set(params as any);
            if (!type) this.$emit('success', { id: data.id, name, t: formInline.t, path: data.path });
            this.loading = false;
            return !type;
        }
        return false;
    }
}
</script>
<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';
</style>