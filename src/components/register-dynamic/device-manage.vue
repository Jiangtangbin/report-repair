<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.device')}`"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <div :class="{col: type === 'details'}">
                <form-item prop="name" :class="{col2: type === 'details'}" :label="i18n.label.name">
                    <i-input v-model="formInline.name" :readonly="forbidden" :placeholder="i18n.placeholder.name" />
                </form-item>
                <!-- 只有详情有所属客户，编辑时无 -->
                <form-item v-if="type === 'details'" class="col2" :label="i18n.label.org_id">
                    <div class="col">
                        <div :label="i18n.placeholder.org_id" class="receive-wrapper simulate-input pseudo-prefix-empty">
                            <figure v-for="(item, key) of details.org_id" :key="key" class="receive-item">
                                <figcaption @click="openWins('org', item.id)" :title="item.name" class="t-o-e simulate-a">{{item.name}}</figcaption>
                                <svg-icon
                                    v-show="!forbidden"
                                    @click.stop.native="delReceiveItem('org_id', key)"
                                    class="receive-item-close"
                                    icon-class="close"
                                />
                            </figure>
                        </div>
                        <my-button v-show="!forbidden" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                    </div>
                </form-item>
            </div>
            <form-item v-if="type === 'details'" :label="i18n.label.uuid">
                <i-input :value="details.uuid" :readonly="forbidden" :placeholder="i18n.placeholder.uuid" />
            </form-item>
            <div class="col">
                <form-item prop="adminor" class="col2" :label="i18n.label.adminor">
                    <i-input v-model="formInline.adminor" :readonly="forbidden" :placeholder="i18n.placeholder.adminor" />
                </form-item>
                <form-item prop="adminor_phone" class="col2" :label="i18n.label.adminor_phone">
                    <i-input v-model="formInline.adminor_phone" :readonly="forbidden" :placeholder="i18n.placeholder.adminor_phone" />
                </form-item>
            </div>
            <form-item prop="gid" :label="i18n.label.gid">
                <my-table :columns="finallyColumns.gid" :data="formInline.gid" />
            </form-item>
            <div class="col">
                <form-item prop="lng" class="col2" :label="i18n.label.lng">
                    <i-input v-model="formInline.lng" :placeholder="i18n.placeholder.lng" :readonly="forbidden" />
                </form-item>
                <form-item prop="lat" class="col2" :label="i18n.label.lat">
                    <span class="col">
                        <i-input v-model="formInline.lat" class="a-w" :placeholder="i18n.placeholder.lat" :readonly="forbidden" />
                        <my-button
                            v-show="!forbidden || (formInline.lng && formInline.lat)"
                            @click="openLocation"
                            class="k-w"
                            type="primary"
                        >{{forbidden ? $t('h.formLabel.watch') : ''}}{{$t('h.formLabel.location')}}</my-button>
                    </span>
                </form-item>
            </div>
            <div v-if="type === 'details'" class="col-4">
                <form-item class="col4" :label="i18n.label.isonline">
                    <i-input :value="details.isonline" :readonly="forbidden" :placeholder="i18n.placeholder.isonline" />
                </form-item>
                <form-item class="col4" :label="i18n.label.resolution">
                    <i-input :value="details.resolution" :readonly="forbidden" :placeholder="i18n.placeholder.resolution" />
                </form-item>
                <form-item class="col4" :label="i18n.label.battery">
                    <i-input :value="details.battery" :readonly="forbidden" :placeholder="i18n.placeholder.battery" />
                </form-item>
                <form-item class="col4" :label="i18n.label.signal">
                    <i-input :value="details.signal" :readonly="forbidden" :placeholder="i18n.placeholder.signal" />
                </form-item>
            </div>
            <form-item v-if="type === 'details'" :label="i18n.label.nbtime">
                <i-input :value="details.nbtime" :readonly="forbidden" :placeholder="i18n.placeholder.nbtime" />
            </form-item>
            <form-item prop="address" :label="i18n.label.address">
                <i-input v-model="formInline.address" :readonly="forbidden" :placeholder="i18n.placeholder.address" />
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import MyTable from '@/components/common/table.vue';
import { editDevice as edit, getDeviceInfo as get } from '@/config/api';
import { popupDeviceGroupManage } from '@/config/columns';
import { recursion } from '@/utils/index';

const tableListType: Dictionary<string> = {
    gid: 'deviceGroup',
};

@Component({
    name: 'DeviceManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        MyTable,
    },
})
export default class DeviceManageHandle extends Popup<'EditDevice'> {
    $refs!: {
        form: IForm;
    }

    @Prop({ type: Object })
    orgs!: object;

    loading = false;
    columns = {
        gid: popupDeviceGroupManage(this, 'gid'),
    };
    formInline = {
        type: 2,
        id: this.id,
        name: '',
        adminor: '',
        adminor_phone: '',
        gid: [],
        lng: '',
        lat: '',
        address: '',
    };
    details = {
        uuid: '',
        org_id: [],
        nbtime: '',
        battery: '',
        isonline: 0,
        resolution: '',
        signal: '',
    };

    get i18n() {
        const label = {
            name: `${this.$t('h.formLabel.name')}: `,
            uuid: `${this.$t('h.formLabel.serialNumber')}: `,
            org_id: `${this.$t('h.formLabel.affiliatedCustomer')}: `,
            lng: `${this.$t('h.formLabel.lng')}: `,
            lat: `${this.$t('h.formLabel.lat')}: `,
            adminor: `${this.$t('h.formLabel.deviceManage.personInCharge')}: `,
            adminor_phone: `${this.$t('h.formLabel.deviceManage.personInChargeTelephone')}: `,
            nbtime: `${this.$t('h.formLabel.deviceManage.lastCommunicationTime')}: `,
            isonline: `${this.$t('h.formLabel.status')}: `,
            resolution: `${this.$t('h.formLabel.deviceManage.resolution')}: `,
            battery: `${this.$t('h.formLabel.deviceManage.remainingCapacity')}: `,
            signal: `${this.$t('h.formLabel.deviceManage.signalIntensity')}: `,
            address: `${this.$t('h.formLabel.address')}: `,
            gid: `${this.$t('h.formLabel.affiliatedGroup')}: `,
        };
        const placeholder = {
            name: this.$t('h.placeholder.pleaseEnter', { msg: label.name }),
            uuid: this.$t('h.placeholder.notObtained', { msg: label.uuid }),
            org_id: this.$t('h.placeholder.notObtained', { msg: label.org_id }),
            lng: this.$t('h.placeholder.pleaseEnter', { msg: label.lng }),
            lat: this.$t('h.placeholder.pleaseEnter', { msg: label.lat }),
            adminor: this.$t('h.placeholder.pleaseEnter', { msg: label.adminor }),
            adminor_phone: this.$t('h.placeholder.pleaseEnter', { msg: label.adminor_phone }),
            nbtime: this.$t('h.placeholder.notObtained', { msg: label.nbtime }),
            isonline: this.$t('h.placeholder.notObtained', { msg: label.isonline }),
            resolution: this.$t('h.placeholder.notObtained', { msg: label.resolution }),
            battery: this.$t('h.placeholder.notObtained', { msg: label.battery }),
            signal: this.$t('h.placeholder.notObtained', { msg: label.signal }),
            address: this.$t('h.placeholder.pleaseEnter', { msg: label.address }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            name: { required: true, message: placeholder.name, trigger: 'blur' },
        };
    }

    @Watch('orgs', { immediate: true })
    changeOrgs(val: object) {
        (this.formInline as any).org_id = val ? [val] : [];
    }
    @Watch('type')
    changeT(type: 1 | 2 | 'details') {
        typeof type === 'number' && (this.formInline.type = type);
    }

    // 打开前事件
    prefixFunc() {
        const { formInline, id } = this;

        id && (formInline.id = id);
        id && this.getDetails();
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    // 获取详情
    async getDetails() {
        const { id, setDetails } = this;
        if (!id) return console.log('请填写详情 id: ', id);
        this.loading = true;
        const { type, data } = await get(id);
        if (!type) setDetails(data);
        this.loading = false;
    }
    // 设置详情
    setDetails({
        name, uuid, org_id, orgname, address, lng, lat, group, adminor, adminor_phone, nbtime, battery, isonline, resolution, signal, ...args
    }: API.Response['DeviceInfo']) {
        const { formInline, details } = this;
        recursion(group, v => {
            v.name = v.title;
            delete v.title;
        });
        Object.assign(formInline, {
            name,
            address,
            lng,
            lat,
            adminor,
            adminor_phone,
            gid: group || [],
        });
        Object.assign(details, {
            org_id: org_id ? [{ id: org_id, name: orgname }] : [],
            uuid,
            nbtime,
            battery,
            isonline: Number(isonline) === 1 ? this.$t('h.common.online') : this.$t('h.common.offline'),
            resolution,
            signal,
        });
    }
    // 选择弹窗
    selectCard(type: keyof DeviceManageHandle['formInline']) {
        if (this.forbidden) return;
        this.$getDynamicComponent('tableList', () => {
            const { formInline } = this;
            this.$createTableListHandle({
                t: tableListType[type],
                checked: formInline[type],
                multiple: type === 'gid',
                $events: {
                    success: (data: Dictionary<any>[]) => {
                        (formInline[type] as Dictionary<any>[]) = data;
                    },
                },
            }).show();
        });
    }
    /**
     * @description: 打开地图窗口
     * @param {Number | String} lng: 经度
     * @param {Number | String} lat: 纬度
     * @param {Boolean} readonly: 是否只读
     */
    openLocation() {
        const { formInline, formInline: { lng, lat }, forbidden: readonly } = this;
        this.$getDynamicComponent('location', () => {
            this.$createLocationHandle({
                lng: Number(lng),
                lat: Number(lat),
                readonly,
                $events: {
                    'success': (point: baiduMap['point']) => Object.assign(formInline, point),
                },
            }).show();
        });
    }
    // 提交事件
    async ok() {
        const { $refs: { form: { validate }}, formInline: { gid, ...args }} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                gid: gid.map((v: any) => v.id),
            });
            const { type: types } = await edit(params);
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
</style>