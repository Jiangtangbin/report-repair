<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="$t('h.modal.titles.setDeviceConfigOrFile')"
        :footer-hide="forbidden || !!logId"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <div class="col">
                <form-item prop="t" class="col2" :label="i18n.label.t">
                    <i-select v-model="formInline.t" :disabled="forbidden" :placeholder="i18n.placeholder.t">
                        <i-option v-for="item of selectType" :key="item.value" :value="item.value">{{item.title}}</i-option>
                    </i-select>
                </form-item>
                <form-item v-if="formInline.t === 'config'" prop="config_id" class="col2" :label="i18n.label.config_id">
                    <div class="col">
                        <div @click.self="forbidden || selectCard('config_id')" :label="i18n.placeholder.config_id" class="receive-wrapper simulate-input pseudo-prefix-empty">
                            <figure v-for="(item, key) of formInline.config_id" :key="key" class="receive-item">
                                <figcaption @click="openWins('config', item.id)" :title="item.name" class="t-o-e simulate-a">{{item.name}}</figcaption>
                                <svg-icon
                                    v-show="!forbidden"
                                    @click.stop.native="delReceiveItem('config_id', key)"
                                    class="receive-item-close"
                                    icon-class="close"
                                />
                            </figure>
                        </div>
                        <my-button v-show="!forbidden" @click="selectCard('config_id')" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                    </div>
                </form-item>
                <form-item v-else prop="file_id" class="col2" :label="i18n.label.file_id">
                    <div class="col">
                        <div @click.self="forbidden || selectCard('file_id')" :label="i18n.placeholder.file_id" class="receive-wrapper simulate-input pseudo-prefix-empty">
                            <figure v-for="(item, key) of formInline.file_id" :key="key" class="receive-item">
                                <figcaption @click="openWins('file', item.id)" :title="item.name" class="t-o-e simulate-a">{{item.name}}</figcaption>
                                <svg-icon
                                    v-show="!forbidden"
                                    @click.stop.native="delReceiveItem('file_id', key)"
                                    class="receive-item-close"
                                    icon-class="close"
                                />
                            </figure>
                        </div>
                        <my-button v-show="!forbidden" @click="selectCard('file_id')" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                    </div>
                </form-item>
            </div>
            <template v-if="logId">
                <p class="status-result">
                    <span>结果：</span>
                    <my-wait v-if="result === 'distributing'" />
                    <svg-icon v-else-if="result === 'success'" class="status-result-correct" icon-class="correct" />
                    <svg-icon v-else class="status-result-error" icon-class="error" />
                </p>
                <p class="status-result">
                    <span>原因：</span>
                    {{ msg }}
                </p>
                <p class="status-result">
                    <span>时间：</span>
                    {{ time }}
                </p>
            </template>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Select as ISelect, Option as IOption, } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import MyWait from '@/components/common/wait.vue'; // 等待组件
import { setConfigOrFile as set } from '@/config/api';
import bus from '@/utils/bus';

const tableListType: Dictionary<string> = {
    config_id: 'config',
    file_id: 'file',
};

@Component({
    name: 'DeviceSetContentHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        ISelect,
        IOption,
        MyWait,
    },
})
export default class DeviceSetContentHandle extends Popup<'ConfigOrFile'> {
    $refs!: {
        form: IForm;
    }
    
    @Prop({ type: Array })
    devices?: object[];
    @Prop({ type: Array })
    files?: object[];

    loading = false;
    logId = null;
    selectType = [
        {
            title: '配置',
            value: 'config',
        },
        {
            title: '文件',
            value: 'file',
        },
    ];
    formInline = {
        t: 'config',
        config_id: [], // 选取的配置 id
        file_id: [], // 选取的文件 id
        devices: this.devices,
        files: this.files,
    };
    // 提示用户的状态
    result = 'distributing';
    msg = '';
    time = '';

    get i18n() {
        const label = {
            t: `${this.$t('h.formLabel.type')}: `,
            config_id: `${this.$t('h.formLabel.configManage.config')}: `,
            file_id: `${this.$t('h.formLabel.fileManage.file')}: `,
        };
        const placeholder = {
            t: this.$t('h.placeholder.pleaseSelect', { msg: label.t }),
            config_id: this.$t('h.placeholder.pleaseSelect', { msg: label.config_id }),
            file_id: this.$t('h.placeholder.pleaseSelect', { msg: label.file_id }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return this.formInline.t === 'config' ? {
            config_id: { required: true, type: 'array', message: placeholder.config_id },
        } : {
            file_id: { required: true, type: 'array', message: placeholder.file_id },
        };
    }

    created() {
        bus.$on('on-update-result', this.updateStatus);
    }
    beforeDestroy() {
        bus.$off('on-update-result', this.updateStatus);
    }

    // 打开前事件
    prefixFunc() {
        // const { formInline, id } = this;

        // id && (formInline.id = id);
        // id && this.getDetails();
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    // 获取详情
    // async getDetails() {
    //     const { id, setDetails } = this;
    //     if (!id) return console.log('请填写详情 id: ', id);
    //     this.loading = true;
    //     const { type, data } = await get(id);
    //     if (!type) setDetails(data);
    //     this.loading = false;
    // }
    // 设置详情
    // setDetails(data: API.Response['DeviceGroupDevice']) {
    //     const { formInline } = this;
    //     Object.assign(formInline, { devices: data || [] });
    // }
    // 更新状态
    updateStatus(result: object) {
        const { formInline: { devices }, logId } = this;
        if (logId === result.distribute_id) {
            devices.filter(v => {
                if (result.device.includes(v.id)) {
                    this.$set(this, 'result', result.result);
                    this.$set(this, 'msg', result.msg);
                    this.$set(this, 'time', result.time);
                }
            });
        }
    }
    // 选择弹窗
    selectCard(type: keyof DeviceSetContentHandle['formInline']) {
        if (this.forbidden) return;
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
    async ok() {
        const { $refs: { form: { validate }}, formInline: { config_id, file_id, devices, files, ...args }} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                devices: devices && devices.length && devices.map(v => v.id),
                files: files && files.length && files.map(v => v.id),
                config_id: config_id.length ? Number(config_id.map(v => v.id).toString()) : undefined,
                file_id: file_id.length ? Number(file_id.map(v => v.id).toString()) : undefined,
            });
            const { type, data: { id }} = await set(params);
            if (!type) {
                this.logId = id;
                this.$emit('success')
                this.loading = false;
            };
        }
        return false;
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    .status-result {
        display: flex;
        height: 30px;
        line-height: 30px;
        span {
            padding-right: 10px;
        }
        &-correct, &-error {
            font-size: 24px;
            margin-top: 3px;
        }
        &-correct {
            color: #60DA8D;
        }
        &-error {
            color: #FE5967;
        }
    }
</style>