<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.config')}`"
        :footer-hide="forbidden"
        :fullscreen="true"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <div v-if="!forbidden" class="col-3">
                <form-item prop="name" class="col3" :label="i18n.label.name">
                    <i-input v-model="formInline.name" :readonly="forbidden" :placeholder="i18n.placeholder.name" />
                </form-item>
                <form-item prop="org_id" class="col3" :label="i18n.label.org_id">
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
                <form-item prop="content.audio" class="col3" :label="i18n.label.audio">
                    <i-select v-model="formInline.content.audio" :disabled="forbidden || !formInline.content.layout.some(v => v.loop.some(s => s.audio.length || (s.display.length && s.display.some(d => d.t === 'video' || d.t === 'remote'))))" :placeholder="i18n.placeholder.audio">
                        <i-option v-for="item of windowAudio" :key="item.value" :value="item.value">{{item.title}}</i-option>
                    </i-select>
                </form-item>
            </div>
            <form-item prop="content" :label="!forbidden ? i18n.label.content : ''" class="grids-form-item">
                <div v-if="!forbidden" class="grids-control-group">
                    <span class="grids-control-group-tips">{{$t('h.tips.windowConfig')}}</span>
                    <my-button v-for="item of template" :key="item.type" @click="switchTemplate(item.type)" class="grids-control-group-item" size="small">{{$t(item.title)}}</my-button>
                </div>
                <grids
                    v-if="value"
                    :content="formInline.content"
                    :currentOption="currentOption"
                    :readonly="forbidden"
                    :style="{ height: forbidden ? 'calc(100vh - 103px)' : 'calc(100vh - 244px)' }"
                    @changeConfigData="changeConfigData"
                    @clearConfigData="clearConfigData"
                    ref="grids"
                >
                </grids>
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Select as ISelect, Option as IOption } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import Grids from '@/components/common/grids.vue';
import { setConfig as set } from '@/config/api';
import lodashGet from 'lodash/get';
import { userModule } from '@/store/index';

const tableListType: Dictionary<string> = {
    org_id: 'customer',
};

@Component({
    name: 'ConfigManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        ISelect,
        IOption,
        Grids,
    },
})
export default class ConfigManageHandle extends Popup<'SetConfig'> {
    $refs!: {
        form: IForm;
        grids: Grids;
    }

    // 修改、详情时因为没有详情接口，传过来的数据
    @Prop(Object)
    data?: ResponseConfig.List;
    @Prop({ type: Object })
    orgs!: object;

    loading = false;
    formInline = {
        type: 1,
        id: this.id,
        org_id: [],
        name: '',
        content: {
            model: 5,
            audio: 0,
            layout: [
                {
                    win: 1,
                    loop: [],
                },
                {
                    win: 2,
                    loop: [],
                },
                {
                    win: 3,
                    loop: [],
                },
            ],
        },
    };
    // 需求如果变动为轮播模板的数据 content
    // content = [
    //     {
    //         model: 3,
    //         audio: 0,
    //         time: 5,
    //         layout: [
    //             {
    //                 win: 1,
    //                 loop: [],
    //             },
    //             {
    //                 win: 2,
    //                 loop: [],
    //             },
    //         ]
    //     },
    //     {
    //         model: 5,
    //         audio: 0,
    //         time: 10,
    //         layout: [
    //             {
    //                 win: 1,
    //                 loop: [],
    //             },
    //             {
    //                 win: 2,
    //                 loop: [],
    //             },
    //             {
    //                 win: 3,
    //                 loop: [],
    //             },
    //         ]
    //     },
    // ];
    // 默认窗口项信息
    currentOption = {
        type: 'template_5',
        options: {
            win1: [
                { isClose: false }
            ],
            win2: [
                { isClose: false }
            ],
            win3: [
                { isClose: false }
            ],
        },
        col: 0,
        row: 0,
        given: [
            { width: '100%', height: '30%' },
            { width: '50%', height: '70%' },
            { width: '50%', height: '70%' },
        ],
    };
    // 模板
    template = [
        {
            type: 'template_1',
            title: 'h.formLabel.configManage.template1',
        },
        {
            type: 'template_2',
            title: 'h.formLabel.configManage.template2',
        },
        {
            type: 'template_3',
            title: 'h.formLabel.configManage.template3',
        },
        {
            type: 'template_4',
            title: 'h.formLabel.configManage.template4',
        },
        {
            type: 'template_5',
            title: 'h.formLabel.configManage.template5',
        },
    ];
    /**
     * @description: 配置信息
     * @param {String} type: 窗口模板
     * @param {Object} options: 模板的格子与格子内容与格子数量
     * @param {Number} col: 列
     * @param {Number} row: 行
     * @param {Array} given: 特定的格子格式
     * @param {Boolean} isClose: 是否显示清除按钮
     * @param {Object} content: 模板中格子的内容，需配置项
     */
    gridInfo = [
        {
            type: 'template_1',
            options: {
                win1: [
                    { isClose: false }
                ],
            },
            col: 1,
            row: 1,
            given: [],
            content: {
                model: 1, // 当前窗口模板
                audio: 0, // 音频输出窗口号
                layout: [
                    {
                        win: 1,
                        loop: [],
                    },
                ],
            },
        },
        {
            type: 'template_2',
            options: {
                win1: [
                    { isClose: false }
                ],
                win2: [
                    { isClose: false }
                ],
            },
            col: 2,
            row: 1,
            given: [],
            content: {
                model: 2, // 当前窗口模板
                audio: 0, // 音频输出窗口号
                layout: [
                    {
                        win: 1,
                        loop: [],
                    },
                    {
                        win: 2,
                        loop: [],
                    },
                ],
            },
        },
        {
            type: 'template_3',
            options: {
                win1: [
                    { isClose: false }
                ],
                win2: [
                    { isClose: false }
                ],
            },
            col: 0,
            row: 0,
            given: [
                { width: '100%', height: '30%' },
                { width: '100%', height: '70%' },
            ],
            content: {
                model: 3, // 当前窗口模板
                audio: 0, // 音频输出窗口号
                layout: [
                    {
                        win: 1,
                        loop: [],
                    },
                    {
                        win: 2,
                        loop: [],
                    },
                ],
            },
        },
        {
            type: 'template_4',
            options: {
                win1: [
                    { isClose: false }
                ],
                win2: [
                    { isClose: false }
                ],
            },
            col: 0,
            row: 0,
            given: [
                { width: '100%', height: '70%' },
                { width: '100%', height: '30%' },
            ],
            content: {
                model: 4, // 当前窗口模板
                audio: 0, // 音频输出窗口号
                layout: [
                    {
                        win: 1,
                        loop: [],
                    },
                    {
                        win: 2,
                        loop: [],
                    },
                ],
            },
        },
        {
            type: 'template_5',
            options: {
                win1: [
                    { isClose: false }
                ],
                win2: [
                    { isClose: false }
                ],
                win3: [
                    { isClose: false }
                ],
            },
            col: 0,
            row: 0,
            given: [
                { width: '100%', height: '30%' },
                { width: '50%', height: '70%' },
                { width: '50%', height: '70%' },
            ],
            content: {
                model: 5, // 当前窗口模板
                audio: 0, // 音频输出窗口号
                layout: [
                    {
                        win: 1,
                        loop: [],
                    },
                    {
                        win: 2,
                        loop: [],
                    },
                    {
                        win: 3,
                        loop: [],
                    },
                ],
            },
        },
    ];

    get i18n() {
        const label = {
            name: `${this.$t('h.formLabel.configManage.configName')}: `,
            org_id: `${this.$t('h.formLabel.affiliatedCustomer')}: `,
            audio: `${this.$t('h.formLabel.configManage.audioOutput')}: `,
            content: `${this.$t('h.formLabel.configManage.configContent')}: `,
        };
        const placeholder = {
            name: this.$t('h.placeholder.pleaseEnter', { msg: label.name }),
            org_id: this.$t('h.placeholder.pleaseSelect', { msg: label.org_id }),
            audio: this.$t('h.placeholder.pleaseSelect', { msg: label.audio }),
            content: this.$t('h.placeholder.pleaseSelect', { msg: label.content }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            name: { required: true, message: placeholder.name, trigger: 'blur' },
            org_id: { required: true, message: placeholder.org_id },
            // 'content.audio':  { required: true, message: placeholder.audio },
        };
    }
    // 是否是被监管客户，被监管客户无法选择所属客户
    get isBjg() {
        const orgattr = userModule.user.info.orgattr;
        return !orgattr || orgattr === 'bjg';
    }
    // 返回可以选择的音频输出窗口
    get windowAudio() {
        const { currentOption: { type }, formInline } = this;
        let windowAudioDicts = [
            { title: '窗口一', value: 1 },
            { title: '窗口二', value: 2 },
            { title: '窗口三', value: 3 },
        ];
        const requiredAudio = formInline.content.layout.filter(v => v.loop.find(s => s.audio.length || (s.display.length && s.display.some(d => d.t === 'video' || d.t === 'remote'))));
        // 为空时没有选择窗口音频，则清空
        if (!requiredAudio.length) formInline.content.audio = 0;
        return requiredAudio.map(v => windowAudioDicts.find(({ value }) => value === v.win));
    }

    // 所属机构发生改变
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
        const {
            formInline,
            id,
            data,
        } = this;

        id && (formInline.id = id);
        data && this.setDetails(data);
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
        // 重置展示区域
        this.currentOption = {
            type: 'template_5',
            options: {
                win1: [
                    { isClose: false }
                ],
                win2: [
                    { isClose: false }
                ],
                win3: [
                    { isClose: false }
                ],
            },
            col: 0,
            row: 0,
            given: [
                { width: '100%', height: '30%' },
                { width: '50%', height: '70%' },
                { width: '50%', height: '70%' },
            ],
        };
    }
    /**
     * @description: 切换模板
     * @param {String} template: 模板
     */
    switchTemplate(template: string) {
        if (this.formInline.content.layout.find(v => v.loop.length)) {
            this.$Modal.confirm({
                title: this.$t('h.tips.switchTemplate') as string,
                content: this.$t('h.tips.configured') as string,
                onOk: () => {
                    this.reset(template);
                },
            });
        } else {
            this.reset(template);
        }
    }
    /**
     * @description: 重置模板数据项
     * @param {String} template: 模板
     */
    reset(template: string) {
        const { gridInfo } = this;
        this.$refs.grids.selectIndex = 'win0';
        this.formInline.content = gridInfo.find(v => {
            return v.type === template;
        }).content;
        this.currentOption = JSON.parse(JSON.stringify(gridInfo)).find(v => {
            delete v.content;
            return v.type === template;
        });
    }
    // 获取详情
    // async getDetails() {
    //     const { id } = this;
    //     if (!id) return console.log('请填写详情 id: ', id);
    //     this.loading = true;
    //     const { type, data } = await get(id);
    //     if (!type) this.setDetails(data);
    //     this.loading = false;
    // }
    // 设置详情
    setDetails({ name, org_id: orgId, orgname, content, ...args }: ResponseConfig.List) {
        const { formInline, gridInfo } = this;
        const configContent = JSON.parse(content);
        // 还原配置内容时长
        configContent.layout.filter((item: object) => {
            if (item.loop.length) {
                item.loop.map((i: any) => {
                    i.display = [i.display];
                    i.audio = i.audio ? [i.audio] : []; // 音频输出不是必填的，所以得判断一下
                    // i.selectTime = (i.time === 'same-display' || i.time === 'same-audio') ? i.time : 'custom-duration';
                    // i.enterTime = i.time !== 'same-display' && i.time !== 'same-audio' ? i.time : '';
                    // delete i.time;
                });
            }
        });
        Object.assign(formInline, {
            name,
            org_id: orgId ? [{ id: orgId, name: orgname }] : [],
            content: configContent,
        });
        // 回填窗口项信息
        this.currentOption = JSON.parse(JSON.stringify(gridInfo)).find(v => {
            delete v.content;
            return v.type === `template_${configContent.model}`;
        });
        for (let i in configContent.layout) {
            configContent.layout[i].loop.length && this.currentOption.options[`win${Number(i) + 1}`].push(...configContent.layout[i].loop);
        }
    }
    // 选择弹窗
    selectCard(type: keyof ConfigManageHandle['formInline']) {
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
    // 配置数据
    changeConfigData(index: number, selectIndex: number, data: any) {
        // 清空已有数据
        this.formInline.content.layout[index].loop = [];
        this.currentOption.options[selectIndex] = [{ isClose: false }];
        // // 需向后台提交的数据
        this.formInline.content.layout[index].loop.push(...data);
        // // 格子内展示的数据
        this.currentOption.options[selectIndex].push(...data);
    }
    // 清除格子中所有内容
    clearConfigData(index: number, selectIndex: number) {
        // 清除向后台提交的数据
        this.formInline.content.audio = 0;
        this.formInline.content.layout[index].loop = [];
        // 清除格子内展示的数据
        this.currentOption.options[selectIndex] = [{ isClose: false }];
    }
    // 提交事件
    async ok() {
        const { $refs: { form: { validate }}, id, type, formInline: { org_id: org, content, ...args }} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const result = JSON.parse(JSON.stringify(content));
            result.layout.filter((item: object) => {
                if (item.loop.length) {
                    item.loop.map((i: any) => {
                        i.display = i.display[0];
                        i.audio = i.audio[0];
                        i.t = i.display.t;
                        // i.time = i.selectTime === 'custom-duration' ? i.enterTime : i.selectTime;
                        // delete i.selectTime;
                        // delete i.enterTime;
                    });
                }
            });
            const params = Object.assign(args, {
                id: type === 1 ? undefined : id,
                org_id: lodashGet(org, '[0].id', ''),
                content: JSON.stringify(result),
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

    // 全屏时不设置最大高度
    @include utils-pierce(ivu-modal-fullscreen) {
        .form {
            max-height: none;
            .grids-form-item {
                margin-bottom: 0;
            }
            .grids-control-group {
                position: absolute;
                top: -35px;
                right: 76px;
                &-tips {
                    color: red;
                    font-weight: bold;
                }
                &-item {
                    margin: 0 5px;
                    &:last-child {
                        margin-right: 0;
                    }
                }
            }
            // 格子减去已使用的高度
            .grids-wrapper {
                height: calc(100vh - 244px);
                margin-top: 10px;
            }
        }
    }
</style>