<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="$t('h.modal.titles.devicePreview')"
        :footer-hide="true"
        :fullscreen="true"
        loading
    >
        <grids v-if="value" :content="formInline.content" :currentOption="currentOption" :resolution="resolution" :readonly="true" ref="grids"></grids>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Popup } from '@/base-class/dynamic-create';
import Grids from '@/components/common/grids.vue';

@Component({
    name: 'DevicePreviewHandle',
    components: {
        Grids,
    },
})
export default class DevicePreviewHandle extends Popup<'DevicePreview'> {
    $refs!: {
        grids: Grids;
    }

    // 修改、详情时因为没有详情接口，传过来的数据
    @Prop(Object)
    data?: ResponseConfig.List;
    // 设备预览中使用分辨率方式
    @Prop({ type: String })
    resolution?: string;

    formInline = {
        content: {},
    }
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

    // 打开前事件
    prefixFunc() {
        const {
            formInline,
            data,
        } = this;

        data && this.setDetails(data);
    }
    // 关闭前事件
    suffixFunc() {

    }
    // 设置详情
    setDetails({ config, ...args }: ResponseConfig.List, type?: string) {
        const { formInline, gridInfo } = this;
        let configContent = JSON.parse(config);
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
    // 提交事件
    async ok() {
        return false;
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    // 使用分辨率时用到的垂直居中
    @include utils-pierce(ivu-modal-body) {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>