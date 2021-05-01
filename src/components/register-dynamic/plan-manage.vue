<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.plan')}`"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="name" :label="i18n.label.name">
                <i-input v-model="formInline.name" :readonly="forbidden" :placeholder="i18n.placeholder.name" />
            </form-item>
            <div class="col">
                <form-item prop="org_id" class="col2" :label="i18n.label.org_id">
                    <div class="col">
                        <div @click.self="(!isBjg && type === 1) && (forbidden || selectCard('org_id'))" :label="i18n.placeholder.org_id" class="receive-wrapper simulate-input pseudo-prefix-empty">
                            <figure v-for="(item, key) of formInline.org_id" :key="key" class="receive-item">
                                <figcaption @click="openWins('org', item.id)" :title="item.name" class="t-o-e simulate-a">{{item.name}}</figcaption>
                                <svg-icon
                                    v-show="!isBjg && type === 1 && !forbidden"
                                    @click.stop.native="delReceiveItem('org_id', key)"
                                    class="receive-item-close"
                                    icon-class="close"
                                />
                            </figure>
                        </div>
                        <my-button v-if="!isBjg && type === 1" v-show="!forbidden" @click="selectCard('org_id')" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                    </div>
                </form-item>
                <form-item prop="p_id" class="col2" :label="i18n.label.p_id">
                    <div class="col">
                        <div @click.self="forbidden || selectCard('p_id')" :label="i18n.placeholder.p_id" class="receive-wrapper simulate-input pseudo-prefix-empty">
                            <figure v-for="(item, key) of formInline.p_id" :key="key" class="receive-item">
                                <figcaption :title="item.name" class="t-o-e simulate-a">{{item.name}}</figcaption>
                                <svg-icon
                                    v-show="!forbidden"
                                    @click.stop="delReceiveItem('p_id', key)"
                                    class="receive-item-close"
                                    icon-class="close"
                                />
                            </figure>
                        </div>
                        <my-button v-show="!forbidden" @click="selectCard('p_id')" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                    </div>
                </form-item>
            </div>
            <form-item prop="img" :label="i18n.label.img">
                <my-upload v-show="!(forbidden || formInline.img.length)" @ready="formInline.img = $event" ref="planUpload" />
                <div v-for="(item, index) of formInline.img" :key="index" class="upload-item">
                    <template v-if="item.status === 'finished'">
                        <img :src="item.url" @error="globalImgFail" @click="$previewRefresh" preview="planImg" class="c-p" />
                        <p class="upload-item-mask">
                            <svg-icon icon-class="eye" />
                            <svg-icon v-show="!forbidden" @click="$refs.planUpload.remove(index)" class="upload-item-mask-trash" icon-class="trash-o" />
                        </p>
                    </template>
                    <template v-else>
                        <i-progress v-if="item.showProgress" :percent="item.percentage" />
                    </template>
                </div>
            </form-item>
            <p class="modal-plan-tips">{{$t('h.tips.recommendedSize')}}</p>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Progress as IProgress } from 'view-design';
import MyUpload from '@/components/upload/index.vue';
import { Popup } from '@/base-class/dynamic-create';
import { setPlanInfo as set, getPlanFileInfo as get } from '@/config/api';
import lodashGet from 'lodash/get';
import { userModule } from '@/store/index';


const tableListType: Dictionary<string> = {
    org_id: 'customer',
    p_id: 'plan',
};

@Component({
    name: 'PlanManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        IProgress,
        MyUpload,
    },
})
export default class PlanManageHandle extends Popup<'SetPlan'> {
    $refs!: {
        form: IForm;
    }

    // 非详情必须要传递
    @Prop({ type: Object })
    orgs!: object;

    loading = false;
    formInline = {
        type: 1,
        id: this.id,
        org_id: [],
        p_id: [],
        name: '',
        img: [],
    };

    get i18n() {
        const label = {
            name: `${this.$t('h.formLabel.name')}: `,
            org_id: `${this.$t('h.formLabel.affiliatedCustomer')}: `,
            img: `${this.$t('h.formLabel.plan')}: `,
            p_id: `${this.$t('h.formLabel.affiliatedParent')}: `,
        };
        const placeholder = {
            name: this.$t('h.placeholder.pleaseEnter', { msg: label.name }),
            org_id: this.$t('h.placeholder.pleaseSelect', { msg: label.org_id }),
            img: this.$t('h.placeholder.pleaseUpload', { msg: label.img }),
            p_id: this.$t('h.placeholder.pleaseSelect', { msg: label.p_id }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            name: { required: true, message: placeholder.name, trigger: 'blur' },
            org_id: { required: true, message: placeholder.org_id },
            img: { required: true, type: 'array', message: placeholder.img },
        };
    }
    // 是否是被监管客户，被监管客户无法选择所属客户
    get isBjg() {
        const orgattr = userModule.user.info.orgattr;
        return !orgattr || orgattr === 'bjg';
    }

    @Watch('orgs', { immediate: true })
    changeOrgs(val?: object) {
        (this.formInline as any).org_id = val ? [val] : [];
    }
    @Watch('type', { immediate: true })
    changeT(type: 1 | 2 | 'details') {
        typeof type === 'number' && (this.formInline.type = type);
    }

    // 打开前事件
    prefixFunc() {
        const { formInline, id} = this;

        id && (formInline.id = id);
        id && this.getDetails();
    }
    // 关闭前事件
    suffixFunc() {
        const { formInline, formInline: { img }} = this;
        this.$refs.form.resetFields();
        img.splice(0);
        formInline.img = img;
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
    setDetails({ org_id: orgId, org_name, name, p_id, p_name, img }: Dictionary<any>) {
        const { formInline } = this;
        Object.assign(formInline, {
            name,
            p_id: p_id ? [{ id: p_id, name: p_name }] : [],
            org_id: orgId ? [{ id: orgId, name: org_name }] : [],
        });
        img.length && (formInline.img as any[]).push({
            response: { key: img },
            status: 'finished',
            url: img,
        });
    }
    // 选择弹窗
    selectCard(type: keyof PlanManageHandle['formInline']) {
        const { formInline: { org_id: [org] }} = this;
        if (this.forbidden) return;
        if (type !== 'org_id' && !org) return this.$Message.info(this.$t('h.placeholder.pleaseSelectCustomer'));
        this.$getDynamicComponent('tableList', () => {
            const { formInline } = this;
            this.$createTableListHandle({
                t: tableListType[type],
                checked: formInline[type],
                fromQuery: {
                    org_id: type === 'org_id' ? undefined : org && (org as any).id,
                },
                $events: {
                    success: (data: Dictionary<any>[]) => {
                        (formInline[type] as Dictionary<any>[]) = data;
                    },
                },
            }).show();
        });
    }
    // 提交事件
    async ok() {
        const { $refs: { form: { validate }}, formInline: { org_id: org, p_id, img, ...args }} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                org_id: lodashGet(org, '[0].id', ''),
                p_id: lodashGet(p_id, '[0].id', ''),
                img: lodashGet(img, '[0].response.key', ''),
            });
            const { type: types, data } = await set(params);
            if (!types) this.$emit('success', { ...params, id: data ? Number(data.id) : params.id });
            this.loading = false;
            return !types;
        }
        return false;
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    .modal-plan-tips {
        color: #ed4014;
        font-weight: bold;
    }
</style>