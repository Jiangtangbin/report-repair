<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${$t('h.modal.titles.configContent')}${$t('h.formLabel.configManage.windowNumber', { msg: windowNumber })}`"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <template v-for="(target, index) of formInline.multipleConfig">
                <div :key="index" class="config-content d-v-c">
                    <span>{{index + 1}}、</span>
                    <div class="config-content-item">
                        <form-item :prop="`multipleConfig.${index}.t`" :label="i18n.label.fileType">
                            <i-select v-model="formInline.multipleConfig[index].t" @on-change="typeChange(index)" :disabled="forbidden" :placeholder="i18n.placeholder.fileType">
                                <i-option v-for="item of selectType" :key="item.value" :value="item.value">{{item.title}}</i-option>
                            </i-select>
                        </form-item>
                        <form-item v-if="formInline.multipleConfig[index].t === 'remote'" :prop="`multipleConfig.${index}.display`" :rules="getRules('display', index)" :label="i18n.label.display">
                            <i-input v-model="formInline.multipleConfig[index].display" :readonly="forbidden" :placeholder="i18n.placeholder.display" />
                        </form-item>
                        <div :class="{col: formInline.multipleConfig[index].display.length && formInline.multipleConfig[index].display[0].t !== 'video'}">
                            <form-item v-if="formInline.multipleConfig[index].t === 'local'" :prop="`multipleConfig.${index}.display`" :rules="getRules('display', index)" :class="{col2: formInline.multipleConfig[index].display.length && formInline.multipleConfig[index].display[0].t !== 'video'}" :label="i18n.label.display">
                                <div class="col">
                                    <div @click.self="forbidden || selectCard('display', index)" :label="i18n.placeholder.display" class="receive-wrapper simulate-input pseudo-prefix-empty">
                                        <figure v-for="(item, key) of formInline.multipleConfig[index].display" :key="key" class="receive-item">
                                            <figcaption @click="openWins('file', item.id)" :title="item.name" class="t-o-e simulate-a">{{item.name}}</figcaption>
                                            <svg-icon
                                                v-show="!forbidden"
                                                @click.stop.native="delReceiveItem(`multipleConfig[${index}].display`, key)"
                                                class="receive-item-close"
                                                icon-class="close"
                                            />
                                        </figure>
                                    </div>
                                    <my-button v-show="!forbidden" @click="selectCard('display', index)" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                                    <my-button v-show="!forbidden && auth.includes('add')" @click="uploadFile('display', index)" class="k-w config-content-item-upload" type="primary">{{$t('h.tableButton.upload')}}</my-button>
                                </div>
                            </form-item>
                            <form-item v-if="formInline.multipleConfig[index].display.length && formInline.multipleConfig[index].display[0].t !== 'video' && formInline.multipleConfig[index].t !== 'remote'" :prop="`multipleConfig.${index}.audio`" class="col2" :label="i18n.label.audio">
                                <div class="col">
                                    <div @click.self="forbidden || selectCard('audio', index)" :label="i18n.placeholder.audio" class="receive-wrapper simulate-input pseudo-prefix-empty">
                                        <figure v-for="(item, key) of formInline.multipleConfig[index].audio" :key="key" class="receive-item">
                                            <figcaption @click="openWins('file', item.id)" :title="item.name" class="t-o-e simulate-a">{{item.name}}</figcaption>
                                            <svg-icon
                                                v-show="!forbidden"
                                                @click.stop.native="delReceiveItem(`multipleConfig[${index}].audio`, key)"
                                                class="receive-item-close"
                                                icon-class="close"
                                            />
                                        </figure>
                                    </div>
                                    <my-button v-show="!forbidden" @click="selectCard('audio', index)" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                                    <my-button v-show="!forbidden && auth.includes('add')" @click="uploadFile('audio', index)" class="k-w config-content-item-upload" type="primary">{{$t('h.tableButton.upload')}}</my-button>
                                </div>
                            </form-item>
                        </div>
                        <div :class="{col: formInline.multipleConfig[index].timeType === 'custom-duration'}">
                            <!-- <form-item :prop="`multipleConfig.${index}.timeType`" :rules="getRules('timeType', index)" :label="i18n.label.timeType" class="col2"> -->
                            <form-item :prop="`multipleConfig.${index}.timeType`" :label="i18n.label.timeType" :class="{col2: formInline.multipleConfig[index].timeType === 'custom-duration'}">
                                <i-select v-model="formInline.multipleConfig[index].timeType" @on-change="timeChange($event, index)" :disabled="forbidden" :placeholder="i18n.placeholder.timeType" clearable>
                                    <i-option v-for="item of windowDuration(index)" :key="item.value" :value="item.value">{{item.title}}</i-option>
                                </i-select>
                            </form-item>
                            <!-- <form-item :prop="`multipleConfig.${index}.time`" :rules="getRules('time', index)" :label="i18n.label.time" class="col2"> -->
                            <form-item v-if="formInline.multipleConfig[index].timeType === 'custom-duration'" :prop="`multipleConfig.${index}.time`" :label="i18n.label.time" class="col2">
                                <i-input v-model="formInline.multipleConfig[index].time" :readonly="forbidden" :placeholder="i18n.placeholder.time" />
                            </form-item>
                            </div>
                    </div>
                    <div v-if="!forbidden" class="config-content-control d-v-c">
                        <svg-icon :key="`plus_${index}`" @click="createConfigContentForm" class="config-content-control-icon config-content-control-icon-plus" icon-class="add" />
                        <svg-icon v-if="formInline.multipleConfig.length !== 1" :key="`minus_${index}`" @click="removeConfigContentForm(index)" class="config-content-control-icon" icon-class="minus" />
                    </div>
                </div>
            </template>
        </i-form>
        <video :src="hideVideoUrl" @canplay="canplay($event)" class="hide" ref="video"></video>
        <audio :src="hideAudioUrl" @canplay="canplay($event)" class="hide" ref="audio"></audio>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Select as ISelect, Option as IOption } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import { PageAuth, getAuth } from '@/base-class/list';
import { userModule } from '@/store/index';

type ResponseFormat = { t: string; display: any; timeType: string; time: string; audio: any; };

const tableListType: Dictionary<string> = {
    display: 'file',
    audio: 'file',
};

@Component({
    name: 'ConfigContentHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        ISelect,
        IOption,
    },
})
export default class ConfigContentHandle extends Popup<'ConfigContent'> {
    $refs!: {
        form: IForm;
        video: HTMLVideoElement;
        audio: HTMLAudioElement;
    }

    // 已配置的内容
    @Prop({ type: Array, default: () => ([{ t: 'local', display: '', timeType: '', time: '', audio: [] }]) })
    data!: ResponseFormat[];
    // 配置内容的窗口号
    @Prop({ type: Number })
    windowNumber!: number;

    loading = false;
    selectType = [
        {
            title: '本地文件',
            value: 'local',
        },
        {
            title: '远程文件',
            value: 'remote',
        },
    ];
    formInline = {
        multipleConfig: [{ t: 'local', display: '', timeType: '', time: '', audio: [] }] as ResponseFormat[],
    };
    playIndex = 0;
    hideVideoUrl = '';// 获取视频时长
    hideAudioUrl = '';// 获取音频时长
    auth: PageAuth['files'][] = []; // 该用户拥有的权限

    get i18n() {
        const label = {
            fileType: `${this.$i18n.t('h.formLabel.configManage.fileType')}: `,
            display: `${this.$i18n.t('h.formLabel.configManage.windowDisplay')}: `,
            // time: `${this.$i18n.t('h.formLabel.configManage.duration')}: `,
            timeType: `${this.$i18n.t('h.formLabel.configManage.selectDuration')}: `,
            time: `${this.$i18n.t('h.formLabel.configManage.enterDuration')}: `,
            audio: `${this.$i18n.t('h.formLabel.configManage.windowAudio')}: `,
        };
        const placeholder = {
            fileType: this.$t('h.placeholder.pleaseSelect', { msg: label.fileType }),
            display: this.$t('h.placeholder.pleaseSelect', { msg: label.display }),
            timeType: this.$i18n.t('h.placeholder.pleaseSelect', { msg: label.timeType }),
            time: this.$i18n.t('h.placeholder.pleaseEnter', { msg: label.time }),
            selectOrEnterTime: this.$i18n.t('h.placeholder.pleaseEnterOrSelect', { msg: label.time }),
            audio: this.$t('h.placeholder.pleaseSelect', { msg: label.audio }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            multipleConfigDisplay: { required: true, message: placeholder.display },
            // multipleConfigTime: { required: true, message: placeholder.selectOrEnterTime },
        };
    }
    get pathPrefix() {
        return userModule.user.file_pre;
    }

    // 配置内容发生变化
    @Watch('data', { immediate: true })
    changeContent(val?: any) {
        if (val && val.length) {
            // 回填远程文件时是字符串，接收的是数组
            val.forEach((item: object) => {
                if (item.t === 'remote') {
                    item.display.filter((v: object) => {
                        item.display = v.path;
                    });
                }
                // video 与 image 属于本地文件
                if (item.t === 'video' || item.t === 'image') {
                    item.t = 'local';
                }
            });
            // 数据发生变化时先赋空数据源再赋值
            (this.formInline as any).multipleConfig = [] = val;
        }
    }

    // 打开前事件
    prefixFunc() {
        // 获取账号权限，如果没有文件上传权限，则只能选择本地文件，或填写线上展示地址
        getAuth('files', this.auth);
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
        // 重置数据配置
        this.formInline.multipleConfig = [{ t: 'local', display: '', timeType: '', time: '', audio: [] }];
    }
    /**
     * 文件类型切换时清空数据源
     * @param {Number} index: 数据的索引
     */
    typeChange(index: number) {
        this.formInline.multipleConfig[index].display = '';
        this.formInline.multipleConfig[index].audio = [];
    }
    /**
     * 时长类型切换时清空数据源
     * @param {String} type: 时长的类型
     * @param {Number} index: 数据的索引
     */
    timeChange(type: string, index: number) {
        const { formInline: { multipleConfig }, pathPrefix } = this;
        if (type === 'same-display') {
            this.loading = true;
            multipleConfig[index].t === 'local' ?
                this.hideVideoUrl = `${pathPrefix}${multipleConfig[index].display[0].path}` :
                    this.hideVideoUrl = multipleConfig[index].display;
            this.playIndex = index;
            this.$Message.info({
                content: this.$t('h.tips.getVideoDuration') as string,
                duration: 3,
            });
        } else if (type === 'same-audio') {
            this.loading = true;
            this.hideAudioUrl = `${pathPrefix}${multipleConfig[index].audio[0].path}`;
            this.playIndex = index;
            this.$Message.info({
                content: this.$t('h.tips.getAudioDuration') as string,
                duration: 3,
            });
        } else {
            multipleConfig[index].time = '';
        }
    }
    // 视频、音频缓冲足够播放时
    canplay(e: Event) {
        // 默认延迟 1 秒，防止 playIndex 未赋值
        setTimeout(() => {
            this.loading = false;
            const { formInline: { multipleConfig } } = this;
            if (e.target.localName === 'video') {
                multipleConfig[this.playIndex].time = Math.ceil(this.$refs.video.duration).toString();
            } else {
                multipleConfig[this.playIndex].time = Math.ceil(this.$refs.audio.duration).toString();
            }
        }, 1000);
    }
    // 返回可以选择的时长
    windowDuration(index: number) {
        const { formInline: { multipleConfig }, formInline } = this;
        return multipleConfig[index].audio.length && multipleConfig[index].display.length && multipleConfig[index].display[0].t === 'video' ? 
            [
                {
                    title: '自定义时长',
                    value: 'custom-duration',
                },
                {
                    title: '视频时长',
                    value: 'same-display',
                },
                {
                    title: '音频时长',
                    value: 'same-audio',
                },
            ] : multipleConfig[index].display.length && multipleConfig[index].display[0].t === 'video' ? 
                [{title: '自定义时长', value: 'custom-duration'}, { title: '视频时长', value: 'same-display' }] : 
                    multipleConfig[index].audio.length ? 
                        [{title: '自定义时长', value: 'custom-duration'}, { title: '音频时长', value: 'same-audio' }] :
                            [{title: '自定义时长', value: 'custom-duration'}];
    }
    // 生成配置内容表单
    createConfigContentForm() {
        const { formInline: { multipleConfig }} = this;
        multipleConfig.push({ t: 'local', display: '', timeType: '', time: '', audio: [] });
    }
    // 删除配置内容表单
    removeConfigContentForm(index: number) {
        const { formInline: { multipleConfig }} = this;
        multipleConfig.splice(index, 1);
    }
    // 获取配置内容，配置目标的规则
    // getRules(k: 'display' | 'time', index: number) {
    getRules(k: 'display', index: number) {
        const { forbidden, rules, formInline: { multipleConfig }} = this;
        if (forbidden) return {};
        return rules.multipleConfigDisplay;
        // return k === 'display'
        //     ? rules.multipleConfigDisplay
        //     : rules.multipleConfigTime;
    }
    // 上次文件
    uploadFile(type: keyof ConfigContentHandle['formInline'], index: number) {
        this.$getDynamicComponent('fileManage', () => {
            const { formInline } = this;
            this.$createFileManageHandle({
                orgs: userModule.userOrg,
                $events: {
                    success: (data: Dictionary<any>[]) => {
                        (formInline.multipleConfig[index][type] as Dictionary<any>[]) = [data];
                    },
                },
            }).show();
        });
    }
    // 选择弹窗
    selectCard(type: keyof ConfigContentHandle['formInline'], index: number) {
        this.$getDynamicComponent('tableList', () => {
            const { formInline } = this;
            this.$createTableListHandle({
                t: tableListType[type],
                fromQuery: type === 'display' ? { t: ['video', 'image'] } : { t: ['video', 'audio'] },
                $events: {
                    success: (data: Dictionary<any>[]) => {
                        let filterData = { t: '', id: null, name: '', path: ''};
                        data.filter((item: object) => {
                            filterData.t = item.t;
                            filterData.id = item.id;
                            filterData.name = item.name;
                            filterData.path = item.path;
                        });
                        (formInline.multipleConfig[index][type] as Dictionary<any>[]) = [filterData];
                    },
                },
            }).show();
        });
    }
    // 提交事件
    async ok() {
        const { $refs: { form: { validate }}, formInline: { multipleConfig } } = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            let validateDuration = true;
            multipleConfig.map((item, index) => {
                if (!item.timeType && !item.time || (item.timeType === 'custom-duration' && !item.time)) {
                    // 遍历数组验证每一组数据是否输入了时长或选择了时长，输入与选择的时长必填一个
                    this.loading = false;
                    validateDuration = false;
                    this.$Message.error(this.$t('h.tips.formNotSelected', { msg: index + 1 }));
                    return false;
                }
            });
            if (validateDuration) {
                this.$emit('success', JSON.parse(JSON.stringify(multipleConfig)));
                this.loading = false;
                return true;
            }
        }
        return false;
    }
}
</script>
<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    .config-content {
        border-bottom: 1px solid #ddd;
        margin-bottom: 10px;
        &-item {
            float: left;
            width: calc(100% - 60px);
            &-upload {
                margin-left: 2px;
            }
        }
        &-control {
            width: 60px;
            margin-top: 6px;
            &-icon {
                &-plus {
                    margin-right: 10px;
                }
            }
        }
    }
</style>