<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.work')}`"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <div class="col-3">
                <form-item prop="org_id" class="col3" :label="i18n.label.org_id">
                    <div class="col">
                        <div @click.self="!orgs && (forbidden || selectCard('org_id'))" :label="i18n.placeholder.org_id" class="receive-wrapper simulate-input pseudo-prefix-empty">
                            <figure v-for="(item, key) of formInline.org_id" :key="key" class="receive-item">
                                <figcaption :title="item.name" class="t-o-e simulate-a">{{item.name}}</figcaption>
                                <svg-icon
                                    v-show="!orgs && !forbidden"
                                    @click.stop.native="delReceiveItem('org_id', key)"
                                    class="receive-item-close"
                                    icon-class="close"
                                />
                            </figure>
                        </div>
                        <my-button v-if="!orgs" v-show="!forbidden" @click="selectCard('org_id')" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                    </div>
                </form-item>
                <form-item prop="link_man" class="col3" :label="i18n.label.link_man">
                    <div class="col">
                        <i-input v-model="formInline.link_man" :readonly="forbidden" :placeholder="i18n.placeholder.link_man" />
                        <my-button v-if="!orgs" v-show="!forbidden" @click="selectCard('link_man')" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                    </div>
                </form-item>
                <form-item prop="link_mobile" class="col3" :label="i18n.label.link_mobile">
                    <i-input v-model="formInline.link_mobile" :readonly="forbidden" :placeholder="i18n.placeholder.link_mobile" />
                </form-item>
            </div>
            <form-item prop="work_level" :label="i18n.label.work_level">
                <i-select v-model="formInline.work_level" :disabled="forbidden" :placeholder="i18n.placeholder.work_level" clearable>
                    <i-option v-for="item of dicts.work_level" :key="item.code" :value="item.code">{{item.name}}</i-option>
                </i-select>
            </form-item>
            <div class="col">
                <form-item prop="work_type" class="col2" :label="i18n.label.work_type">
                    <i-select v-model="formInline.work_type" @on-change="formInline.service_type = ''" :disabled="forbidden" :placeholder="i18n.placeholder.work_type" clearable>
                        <i-option v-for="item of dicts.workType" :key="item.code" :value="item.code">{{item.name}}</i-option>
                    </i-select>
                </form-item>
                <form-item prop="service_type" class="col2" :label="i18n.label.service_type">
                    <i-select v-model="formInline.service_type" :disabled="!formInline.work_type || forbidden" :placeholder="i18n.placeholder.service_type" clearable>
                        <i-option v-for="item of serviceType" :key="item.code" :value="item.code">{{item.name}}</i-option>
                    </i-select>
                </form-item>
            </div>
            <form-item prop="content" :label="i18n.label.content">
                <i-input v-model="formInline.content" :readonly="forbidden" type="textarea" :placeholder="i18n.placeholder.content" />
            </form-item>
            <form-item :label="i18n.label.imgs" prop="imgs" class="form-item-iv">
                <my-upload v-show="!forbidden" @ready="formInline.imgs = $event" :format="imgFormat" :maxNum="2" ref="uploadImgs" multiple />
                <div v-for="(item, index) of formInline.imgs" :key="index" class="upload-item">
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
            <form-item :label="i18n.label.videos" prop="videos" class="form-item-iv">
                <my-upload v-show="!forbidden" @ready="formInline.videos = $event" :format="videoFormat" :maxNum="2" ref="uploadVideos" multiple />
                <div v-for="(item, index) of formInline.videos" :key="index" class="upload-item">
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
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Select as ISelect, Option as IOption, Progress as IProgress } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import MyUpload from '@/components/upload/index.vue';
import { mobileReg } from '@/utils/utils';
import { imgFormat, videoFormat } from '@/config/index';
import { createWork as set, getWorkInfo as get, getUserInfo } from '@/config/api';
import { DictModule } from '@/store/modules/dict';
import lodashGet from 'lodash/get';
import { userModule } from '@/store';

const tableListType: Dictionary<string> = {
    org_id: 'customer',
    link_man: 'account',
};

@Component({
    name: 'WorkPoolManageHandle',
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
export default class WorkPoolManageHandle extends Popup<'CreateWork'> {
    $refs!: {
        form: IForm;
    }

    @Prop({ type: Object })
    orgs?: object;

    loading = false;
    imgFormat = imgFormat;
    videoFormat = videoFormat;
    formInline = {
        id: 0,
        org_id: [],
        work_type: '',
        work_level: '',
        service_type: '',
        content: '',
        imgs: [],
        videos: [],
        link_man: '',
        link_mobile: '',
    };
    dicts = { 
        workType: [],
        work_level: [],
    } as Record<'workType' | 'work_level', Dictionary<any>[]>;

    get i18n() {
        const label = {
            org_id: `${this.$t('h.formLabel.affiliatedCustomer')}: `,
            work_type: `${this.$t('h.formLabel.work.work_type')}: `,
            work_level: `${this.$t('h.formLabel.work.work_level')}: `,
            service_type: `${this.$t('h.formLabel.work.service_type')}: `,
            content: `${this.$t('h.formLabel.work.content')}: `,
            imgs: `${this.$t('h.formLabel.work.imgs')}: `,
            videos: `${this.$t('h.formLabel.work.videos')}: `,
            link_man: `${this.$t('h.formLabel.work.link_man')}: `,
            link_mobile: `${this.$t('h.formLabel.work.link_mobile')}: `,
        };
        const placeholder = {
            org_id: this.$t('h.placeholder.pleaseSelect', { msg: label.org_id }),
            work_type: this.$t('h.placeholder.pleaseSelect', { msg: label.work_type }),
            work_level: this.$t('h.placeholder.pleaseSelect', { msg: label.work_level }),
            service_type: this.$t('h.placeholder.pleaseSelect', { msg: label.service_type }),
            content: this.$t('h.placeholder.pleaseEnter', { msg: label.content }),
            link_man: this.$t('h.placeholder.pleaseEnter', { msg: label.link_man }),
            link_mobile: this.$t('h.placeholder.pleaseEnter', { msg: label.link_mobile }),

        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            org_id: { required: true, message: placeholder.org_id },
            work_type: { required: true, message: placeholder.work_type },
            work_level: { required: true, message: placeholder.work_level },
            service_type: { required: true, message: placeholder.service_type },
            content: { required: true, message: placeholder.content, trigger: 'blur' },
            link_mobile: { required: true, validator: (rule: RegExp, value: string, callback: Function) => callback(mobileReg(value, true)), trigger: 'blur' },
            link_man: { required: true, message: placeholder.link_man, trigger: 'blur' },
        };
    }
    /**
     * @description: 设备小类数据源
     */
    get serviceType() {
        const { formInline: { work_type }, dicts: { workType }} = this;
        if (!work_type) return [];
        const result = workType.find(item => item.code === work_type);
        return result
            ? result.children
            : [];
    }
    
    // 所属机构发生改变
    @Watch('orgs', { immediate: true })
    changeOrgs(val?: object) {
        (this.formInline as any).org_id = val ? [val] : [];
    }

    // 打开前事件
    prefixFunc() {
        const {
            formInline,
            id,
            orgs,
            dicts: {
                workType: { length: workType },
                work_level: { length: work_level },
            },
        } = this;

        orgs && this.getgetUserInfo();
        id && (formInline.id = id);
        work_level || this.getDicts('work_level', 'dict', 3);
        workType || this.getDicts('workType', 'work_type');
        id && this.getDetails();
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    /**
     * 获取字典数据
     * @param {String} key: 成功赋值的键
     * @param {String} type: 字典请求的类型
     * @param {any} params?: 字典请求的参数
     */
    async getDicts<T extends keyof WorkPoolManageHandle['dicts']>(key: T, type: GlobalCustomDicts.CustomDictsKey, params?: GlobalCustomDicts.CustomDictsValue) {
        const { dicts } = this;
        let data = await DictModule.getCustomDicts({ type, params });
        if (data && typeof data !== 'string') {
            (dicts[key] as any[]) = data;
        }
    }
    // 获取账号详情
    async getgetUserInfo() {
        const { user: { info: { id } } } = userModule;
        this.loading = true;
        const { type, data } = await getUserInfo(id);
        if (!type) {
            this.formInline.link_man = data.username;
            (this.formInline.link_mobile as string | number) = data.mobile;
        }
        this.loading = false;
    }
    // 选择弹窗
    selectCard(type: keyof WorkPoolManageHandle['formInline']) {
        const { formInline: { org_id: [org] }, forbidden } = this;
        if (forbidden) return;
        if (type !== 'org_id' && !org) return this.$Message.info(this.$t('h.placeholder.pleaseSelectCustomer'));
        this.$getDynamicComponent('tableList', () => {
            const { formInline } = this;
            this.$createTableListHandle({
                t: tableListType[type],
                checked: formInline[type],
                fromQuery: type === 'org_id' ? {} : { org_id: org && (org as any).id },
                $events: {
                    success: (data: Dictionary<any>[]) => {
                        if (type === 'link_man') {
                            (formInline[type] as string) = data[0].username;
                            formInline['link_mobile'] = data[0].mobile;
                        } else {
                            (formInline[type] as Dictionary<any>[]) = data;
                        }
                    },
                },
            }).show();
        });
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
    setDetails(data: API.Response['WorkInfo']) {
        const { formInline } = this;
        console.log(data);
        // Object.assign(formInline, data);
    }
    // 提交事件
    async ok() {
        const { $refs: { form: { validate }}, formInline: { org_id: org, imgs, videos, ...args }} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                org_id: lodashGet(org, '[0].id', ''),
                imgs: imgs.map((v: any) => v.response.data.url),
                videos: videos.map((v: any) => v.response.data.url),
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