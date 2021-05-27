<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="$t('h.modal.titles.workDetails')"
        width="900px"
        loading
    >
        <div class="work-info">
            <div class="work-info-item">
                <label>{{i18n.label.work_code}}</label>
                <span>{{info.work_code}}</span>
            </div>
            <div class="work-info-item">
                <label>{{i18n.label.service_type_name}}</label>
                <span>{{info.service_type_name}}</span>
            </div>
            <div class="work-info-item">
                <label>{{i18n.label.work_level_name}}</label>
                <span>{{info.work_level_name}}</span>
            </div>
            <div class="work-info-item">
                <label>{{i18n.label.work_type_name}}</label>
                <span>{{info.work_type_name}}</span>
            </div>
            <div class="work-info-item">
                <label>{{i18n.label.work_status_name}}</label>
                <span>{{info.work_status_name}}</span>
            </div>
        </div>
        <div class="steps-info">
            <div v-for="(item, index) of line" :key="item.step" class="steps-info-name">
                <span @click="handleTarget(index)" :style="{ backgroundColor: item.finished ? '#2d8cf0' : '#afafaf'  }" class="steps-info-name-status c-p"></span>
                <span class="steps-info-name-title">{{item.step_name}}</span>
                <span class="steps-info-name-line"></span>
                <div v-if="current === index" class="steps-info-content">
                    <template v-if="index === 0">
                        <div class="steps-info-content-text">
                            <div class="steps-info-content-item">
                                <label>时间：</label>
                                <span>{{item.content.time}}</span>
                            </div>
                            <div class="steps-info-content-item">
                                <label>填报人员：</label>
                                <span>{{item.content.creater_name}}</span>
                            </div>
                            <div class="steps-info-content-item">
                                <label>客户：</label>
                                <span>{{item.content.org_name}}</span>
                            </div>
                            <div class="steps-info-content-item">
                                <label>客户地址：</label>
                                <span>{{item.content.org_address}}</span>
                            </div>
                            <div class="steps-info-content-item">
                                <label>联系人：</label>
                                <span>{{item.content.link_man}}</span>
                            </div>
                            <div class="steps-info-content-item">
                                <label>联系电话：</label>
                                <span>{{item.content.link_mobile}}</span>
                            </div>
                            <div class="steps-info-content-item">
                                <label>报修内容：</label>
                                <span>{{item.content.content}}</span>
                            </div>
                        </div>
                        <div class="steps-info-content-media">
                            <img v-for="im of item.content.imgs" :key="im" :src="im" class="steps-info-content-media-img" />
                            <video v-for="vi of item.content.videos" :key="vi" :src="vi" autoplay controls loop class="steps-info-content-media-video" ref="video" />
                        </div>
                    </template>
                    <template v-if="index === 1">
                        <div>2</div>
                    </template>
                    <template v-if="index === 2">
                        <div>3</div>
                    </template>
                    <template v-if="index === 3">
                        <div>4</div>
                    </template>
                    <template v-if="index === 4">
                        <div>5</div>
                    </template>
                </div>
            </div>
        </div>
    </my-modal>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { BasePopup } from '@/base-class/dynamic-create';
import { getWorkInfo as get } from '@/config/api';

@Component({
    name: 'WorkDetailsHandle',
})
export default class WorkDetailsHandle extends BasePopup {
    current = 0;
    info = {
        id: 0, 
        work_code: 0,
        service_type_name: '',
        work_level_name: '',
        work_type_name: '',
        work_status: '',
        work_status_name: '',
    };
    line = [] as any;

    get i18n() {
        const label = {
            work_code: `${this.$t('h.table.work.workNumber')}：`,
            service_type_name: `${this.$t('h.formLabel.work.service_type')}：`,
            work_level_name: `${this.$t('h.formLabel.work.work_level')}：`,
            work_type_name: `${this.$t('h.formLabel.work.work_type')}：`,
            work_status_name: `${this.$t('h.table.work.workStatus')}：`,
        };

        return { label };
    }

    // 打开前事件
    prefixFunc() {
        const { id } = this;
        id && this.getDetails(id);
    }
    // 关闭前事件
    suffixFunc() {
        
    }

    handleTarget(index: number) {
        this.current = index;
        console.log(index);
    }
    // 获取详情
    async getDetails(id: number) {
        const { info } = this;
        const { type, data } = await get(id);
        if (!type) {
            Object.assign(info, data.info);
            this.line = data.line;
            console.log(this.line)
        }
    }
    // 提交事件
    async ok() {}
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    @include utils-pierce(ivu-modal-body) {
        max-height: 80vh;
        overflow: auto;
    }
    .work-info {
        display: flex;
        flex-flow: row wrap;
        padding: 0 20% 15px 20%;
        line-height: 30px;
        margin-bottom: 30px;
        border-bottom: 1px solid $--white;
        &-item {
            flex: 0 0 calc(50% - 20px);
            margin: 5px 10px;
        }
    }
    .steps-info {
        position: relative;
        height: 400px;
        display: flex;
        align-items: end;
        &-name {
            flex: 0 0 20%;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            &-line {
                width: 100%;
                height: 2px;
                background-color: #ffffff;
                position: absolute;
                left: 0;
                z-index: -1;
            }
            &-status {
                display: inline-block;
                min-width: 30px;
                height: 30px;
                border-radius: 50%;
                margin-right: 5px;
            }
            &-title {
                min-width: 30px;
            }
        }
        &-content {
            position: absolute;
            top: 50px;
            left: 0;
            width: 100%;
            &-text {
                margin-bottom: 10px;
            }
            &-media {
                display: flex;
                height: 200px;
                justify-content: space-around;
                &-img {
                    width: 200px;
                    object-fit: contain;
                }
                &-video {
                    width: 200px;
                }
            }
        }
    }
</style>
