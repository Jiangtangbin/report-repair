<template>
    <div class="grids-wrapper" ref="grids" :style="{ width: resolution && templateWidth && `${templateWidth}px`, height: resolution && templateHeight && `${templateHeight}px` }">
        <my-button v-if="!readonly" @click="configContent" class="grids-add t-o-e" :type="readonly ? 'disabled' : 'info'" size="small">{{$t('h.formLabel.configManage.configContent')}}</my-button>
        <div
            v-for="(item, index) of currentOption.options"
            :key="index"
            :class="{ 'grids-item-active': selectIndex === index && !readonly }"
            :style="!currentOption.given.length ? { width: `${100 / currentOption.col}%`, height: `${100 / currentOption.row}%` } : currentOption.given[Number(index.split('win')[1] - 1)]"
            @click="selectIndex = index"
            @mouseenter="item[0].isClose = true"
            @mouseleave="item[0].isClose = false"
            class="grids-item d-v-c"
        >
            <svg-icon
                v-show="item[0].isClose && !readonly"
                @click.stop="clearConfigContent(index)"
                icon-class="close"
                class="grids-item-close"
            />
            <svg-icon
                v-show="item[0].isClose && !readonly"
                @click.stop="switchGridContent(index, 'left')"
                icon-class="angle-left"
                class="grids-item-left"
            />
            <svg-icon
                v-show="item[0].isClose && !readonly"
                @click.stop="switchGridContent(index, 'right')"
                icon-class="angle-right"
                class="grids-item-right"
            />
            <div v-show="i === 0" v-for="(opt, i) of handleItem(item)" :key="i" class="grids-item-play">
                <audio
                    v-if="opt.audio.length && content.audio === Number(index.split('win')[1])"
                    :src="opt.audio[0].t === 'audio' && `${pathPrefix}${opt.audio[0].path}`"
                    @click="cancelVideoClickEvent"
                    :autoplay="i === 0 && content.audio === Number(index.split('win')[1])"
                    controls
                    loop
                    oncontextmenu="return false"
                    controlslist="nodownload noremoteplayback"
                    class="grids-item-play-audio" />
                <video
                    v-if="opt.display[0].t === 'video' || opt.display[0].t === 'remote'"
                    :src="opt.display[0].t === 'remote' ? opt.display[0].path : `${pathPrefix}${opt.display[0].path}`"
                    @click="cancelVideoClickEvent"
                    :autoplay="i === 0"
                    controls
                    loop
                    :muted="content.audio !== Number(index.split('win')[1])"
                    oncontextmenu="return false"
                    controlslist="nodownload noremoteplayback"
                    disablePictureInPicture="true"
                    class="grids-item-play-view"
                >
                    {{$t('h.tips.browserIncompatible')}}
                </video>
                <img
                    v-if="opt.display[0].t === 'image'"
                    :src="opt.display[0].t === 'image' && `${pathPrefix}${opt.display[0].path}`"
                    oncontextmenu="return false"
                    ondragstart="return false"
                    class="grids-item-play-view"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import { userModule } from '@/store/index';

type ConfigType = {
    type: string,
    options: any,
    col: number,
    row: number,
    given: any,
 };

@Component({
    name: 'Grids',
})
export default class Grids extends Vue {
    $refs!: {
        grids: HTMLElement;
    }

    // 配置的内容
    @Prop({ type: Object, default: () => ({}) })
    content!: ResponseConfig.List;
    // 窗口项信息
    @Prop({ type: Object, default: () => ({}) })
    currentOption!: ConfigType
    // 设备预览中使用分辨率方式
    @Prop({ type: String })
    resolution?: string;
    // 是否只读
    @Prop({ type: Boolean })
    readonly!: boolean;

    // 当前模式的格子索引
    selectIndex = 'win0';
    // 存储时长
    durationStorageGroup = [];
    // 有分辨率时使用的
    templateWidth = '';
    templateHeight = '';

    get pathPrefix() {
        return userModule.user.file_pre;
    }

    created() {
        // 分辨率 宽 / 高 = 宽高比
        // 格子的 高（高为基准） * 宽高比 = 格子的宽（如果宽度超出可格子宽度则用 宽为基准）
        // 格子的 高（宽为基准） / 宽高比 = 格子的宽（如果宽度超出可格子宽度则用 高为基准）
        // 格子的 高 = 模式的高
        this.resolution && this.$nextTick(() => {
            const { $refs: { grids: { offsetWidth, offsetHeight }}} = this;
            const resolutionWidth = Number((this.resolution as string).split('x')[0]);
            const resolutionHeight = Number((this.resolution as string).split('x')[1]);
            // 宽高比
            const aspectRatio = resolutionWidth / resolutionHeight;
            // console.log('容器宽度___', offsetWidth);
            // console.log('容器高度___', offsetHeight);
            // 最终的 width
            // console.log('分辨率高是否大于宽', resolutionHeight, resolutionWidth);
            if (resolutionHeight > resolutionWidth) {
                // 分辨率高大于宽以高为基准
                this.templateWidth = (offsetHeight * aspectRatio).toString();
                if (Number(this.templateWidth) > offsetWidth) {
                    this.templateWidth = offsetWidth.toString();
                    this.templateHeight = (Number(this.templateWidth) * aspectRatio).toString();
                } else {
                    this.templateHeight = offsetHeight.toString();
                }
                // console.log('最终的宽高', this.templateWidth, this.templateHeight);
            } else {
                // 分辨率高小于宽以宽为基准
                this.templateHeight = (offsetWidth / aspectRatio).toString();
                if (Number(this.templateHeight) > offsetHeight) {
                    this.templateHeight = offsetHeight.toString();
                    this.templateWidth = (Number(this.templateHeight) * aspectRatio).toString();
                } else {
                    this.templateWidth = offsetWidth.toString();
                }
                // console.log('最终的宽高', this.templateWidth, this.templateHeight);
            }
        });
        // 根据时长轮询
        this.readonly && setTimeout(() => {
            /**
             * @description: 获取所有窗口配置时长
             * @param {String} tiemr: 定时器
             * @param {String} win1: 窗口里内容的时长（秒）
             * [{ tiemr: 0, win1: [5, 10] }, { tiemr: 0, win2: [15, 20] }]
             */
            this.content.layout.forEach((item: object) => {
                let d = {
                    duration: [],
                };
                item.loop.filter((v: object)  => {
                    d.duration.push(Number(v.time));
                });
                this.durationStorageGroup.push(d);
            });
            this.durationStorageGroup.forEach((v: object, index: number) => {
                if (!v.duration.length || v.duration.length === 1) return false; // 无时长或长度为 1 时不轮询
                let _this = this;
                let i = 0;
                function recursionPolling (t: number) {
                    i = ++i % v.duration.length;
                    setTimeout(() => {
                        recursionPolling(v.duration[i] * 1000);
                        _this.switchGridContent(`win${index + 1}`, 'right'); // 切换下一个
                    }, t, v.duration[i] * 1000);
                }
                recursionPolling(v.duration[i] * 1000);
            });
        }, 0);
    }

   // 阻止 video 标签点击事件冒泡
    cancelVideoClickEvent(e: Event) {
        e.preventDefault();
    }
    /**
     * @description: 处理 play 的数据
     * @param {String} index: 当前窗口号
     * @param {String} type: 前移 | 后移
     */
    switchGridContent(index: string, type: string) {
        const { currentOption: { options }, moveArrayPosition } = this;
        if (type === 'right') {
            options[index] = moveArrayPosition(options[index], -1);
        } else {
            options[index] = moveArrayPosition(options[index], 1);
        }
    }
    /**
     * @description: 数组数据前移、后移
     * @param {Array} target: 目标数组
     * @param {Number} n: 移动数值，负数前移，正数后移
     * @return {Array}
     */
    moveArrayPosition(target: any, n: number) {
        if (target[0].hasOwnProperty('isClose')) target.splice(0, 1);
        if (Math.abs(n) > target.length) n = n % target.length;
        const result = target.slice(-n).concat(target.slice(0, -n));
        result.splice(0, 0, { isClose: true });
        return result;
    }
    /**
     * @description: 处理 play 的数据
     * @param {Array} item: 需要处理的数据
     * @returns {Array}
     */
    handleItem(item: any) {
        const option = JSON.parse(JSON.stringify(item));
        return option.splice(1);
    }
    // 配置格子内容
    configContent() {
        const { selectIndex } = this;
        const index = Number(selectIndex.split('win')[1])
        if (!index) return this.$Message.warning(this.$t('h.tips.windowConfig'));
        this.$getDynamicComponent('configContent', () => {
            this.$createConfigContentHandle({
                data: JSON.parse(JSON.stringify(this.content.layout[index - 1].loop)),
                windowNumber: index,
                $events: {
                    success: (data: Dictionary<any>[]) => {
                        // 远程文件是字符串，解析成数组
                        data.forEach(item => {
                            if (item.t === 'remote') {
                                item.display = [
                                    {
                                        t: 'remote',
                                        path: item.display,
                                    },
                                ];
                            }
                        });
                        // 配置数据
                        this.$emit('changeConfigData', index - 1, selectIndex, data);
                    },
                },
            }).show();
        });
    }
    /**
     * @description: 清除格子中所有内容
     * @param {String} index: 窗口号
     */
    clearConfigContent(index: string) {
        this.$Modal.confirm({
            title: this.$t('h.tips.clearConfigTitle') as string,
            content: this.$t('h.tips.clearConfigContent') as string,
            onOk: () => {
                const i = Number(index.split('win')[1]);
                // 清除数据
                this.$emit('clearConfigData', i - 1, index);
            },
        });
    }
}
</script>

<style scoped lang="scss">
    // 隐藏 video 标签的音量按钮
    // video::-webkit-media-controls-mute-button {
    //     display: none !important;
    // }
    // 隐藏 video 标签的音量控制条与背景
    // video::-webkit-media-controls-volume-control-container {
    //     min-width: 0; height: 0;
    // }
    // video::-webkit-media-controls-volume-slider {
    //     display: none !important;
    // }
    // 隐藏 video 标签播放进度条
    video::-webkit-media-controls-timeline {
        display: none !important;
    }
    // 隐藏 video 标签播放按钮
    video::-webkit-media-controls-play-button {
        display: none !important;
    }
    // 隐藏 video 标签播放的时间
    video::-webkit-media-controls-current-time-display {
        display: none !important;
    }
    video::-webkit-media-controls-time-remaining-display {
        display: none !important;
    }
    // 调整 video 标签工具条内容的阴影效果
    video::-webkit-media-controls-panel {
        background-size: auto 50px !important;
    }
    // 调整 video 标签音量容器的大小
    video::-webkit-media-controls-volume-control-container {
        min-width: 48px !important;
        height: 48px !important;
    }
    // 调整 video 标签的音量按钮大小与外边距
    video::-webkit-media-controls-mute-button {
        background-size: 20px !important;
        width: 32px !important;
        height: 48px !important;
        min-width: 32px !important;
        margin-right: 14px !important;
    }
    // 调整 video 标签音量 hover 时的容器大小
    video::-webkit-media-controls-volume-control-hover-background {
        height: 36px !important;
        width: 112px !important;
        top: 6px !important;
        right: 4px !important;
        border-radius: 18px !important;
    }
    // 调整 video 标签全屏按钮的大小
    video::-webkit-media-controls-fullscreen-button {
        width: 48px !important;
        height: 48px !important;
        min-width: 48px !important;
        background-size: 20px !important;
    }
    // 调整 audio 标签背景颜色
    audio::-webkit-media-controls-enclosure {
        background: rgba(255, 255, 255, 1);
        width: 116px;
    }
    // 隐藏 audio 标签播放按钮
    audio::-webkit-media-controls-play-button {
        display: none !important;
    }
    // 隐藏 audio 标签时长
    audio::-webkit-media-controls-current-time-display {
        display: none !important;
    }
    audio::-webkit-media-controls-time-remaining-display {
        display: none !important;
    }
    // 隐藏 audio 标签进度条
    audio::-webkit-media-controls-timeline {
        display: none !important;
    }
    // 调整 audio 标签音量图标与音量条容器最小宽度
    audio::-webkit-media-controls-volume-control-container {
        min-width: 90px !important;
    }
    // 调整 audio 标签音量图标与音量条容器里的内容直接显示
    audio::-webkit-media-controls-volume-slider {
        width: 52px !important;
        opacity: 1 !important;
        transition: width 0.3s ease 0s !important;
        pointer-events: auto !important;
    }
    // 调整 audio 标签的音量按钮外边距
    audio::-webkit-media-controls-mute-button {
        margin-right: -5px !important;
    }
    // 隐藏 video、audio 标签点击时的黑框
    video, audio:focus {
        outline: none !important;
    }

    .grids-wrapper {
        width: 100%; height: 100%;
        position: relative;
        .grids-add, .grids-audio {
            position: absolute;
            top: -31px;
            right: 0;
            width: 66px;
            display: inherit;
            // 当是禁用状态时
            &.disabled {
                pointer-events: none;
            }
        }
        .grids-audio {
            right: 76px;
            width: 125px;
        }
        .grids-item {
            float: left;
            border: $--border-base-color;
            position: relative;
            padding: 4px;
            &-active {
                border-bottom: 2px solid red;
                padding: 4px 4px 3px 4px;
            }
            &-close, &-left, &-right {
                position: absolute;
                z-index: 1;
                background: $--white;
                box-shadow: 0 0 20px 0 $--white;
                padding: 6px;
                font-size: 26px;
                border-radius: 50%;
            }
            &-close {
                top: 6px; right: 6px;
            }
            &-left {
                font-size: 30px;
                top: calc(50% - 15px); left: 6px;
            }
            &-right {
                font-size: 30px;
                top: calc(50% - 15px); right: 6px;
            }
            &-play {
                width: 100%; height: 100%;
                position: relative;
                &-audio {
                    position: absolute;
                    bottom: 5px; right: 5px;
                    z-index: 1;
                    width: 116px; height: 34px;
                    border-radius: 100px;
                    box-shadow: 0 0 20px 0 #FFFFFF;
                    object-fit: fill;
                }
                &-view {
                    width: 100%; height: 100%;
                    object-fit: fill;
                }
            }
        }
    }
</style>