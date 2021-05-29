<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="$t('h.modal.titles.workDetails')"
        width="880px"
        :footer-hide="true"
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
                <span @click="handleTarget(index, item.finished, item.step)" :style="{ backgroundColor: item.finished ? '#2d8cf0' : '#afafaf' }" :class="current === index && 'steps-info-name-active'" class="steps-info-name-status c-p"></span>
                <span class="steps-info-name-title">{{item.step_name}}</span>
                <span class="steps-info-name-line"></span>
                <div v-if="item.step === 'report' && currentStep === 'report' && handleLine('report')" class="steps-info-content d-v-c">
                    <div class="steps-info-content-text d-v-c">
                        <div class="steps-content-item">
                            <label>{{i18n.label.time}}</label>
                            <span>{{handleLine('report').content.time}}</span>
                        </div>
                        <div class="steps-content-item">
                            <label>{{i18n.label.reportUser}}</label>
                            <span>{{handleLine('report').content.creater_name}}</span>
                        </div>
                        <div class="steps-content-item">
                            <label>{{i18n.label.customer}}</label>
                            <span>{{handleLine('report').content.org_name}}</span>
                        </div>
                        <div class="steps-content-item">
                            <label>{{i18n.label.customerAddress}}</label>
                            <span>{{handleLine('report').content.org_address}}</span>
                        </div>
                        <div class="steps-content-item">
                            <label>{{i18n.label.contactMan}}</label>
                            <span>{{handleLine('report').content.link_man}}</span>
                        </div>
                        <div class="steps-content-item">
                            <label>{{i18n.label.link_mobile}}</label>
                            <span>{{handleLine('report').content.link_mobile}}</span>
                        </div>
                        <div class="steps-content-item">
                            <label>{{i18n.label.content}}</label>
                            <span>{{handleLine('report').content.content}}</span>
                        </div>
                    </div>
                    <div class="steps-info-content-media">
                        <img v-for="im of handleLine('report').content.imgs" :key="im" :src="im" class="steps-info-content-media-img" />
                        <video v-for="vi of handleLine('report').content.videos" :key="vi" :src="vi" autoplay controls loop class="steps-info-content-media-video" ref="video" />
                    </div>
                </div>
                <div v-if="item.step === 'recieve' && currentStep === 'recieve' && handleLine('recieve')" class="steps-info-content d-v-c">
                    <div class="steps-content-item">
                        <label>{{i18n.label.time}}</label>
                        <span>{{handleLine('recieve').content.time}}</span>
                    </div>
                    <div class="steps-content-item">
                        <label>{{i18n.label.acceptType}}</label>
                        <span>{{handleLine('recieve').content.accept_type_name}}</span>
                    </div>
                    <div class="steps-content-item">
                        <label>{{i18n.label.sendPeople}}</label>
                        <span>{{handleLine('recieve').content.sender_name}}</span>
                    </div>
                    <div class="steps-content-item">
                        <label>{{i18n.label.repairUser}}</label>
                        <span>{{handleLine('recieve').content.accepter_name}}</span>
                    </div>
                    <div class="steps-content-item">
                        <label>{{i18n.label.repairUserPhone}}</label>
                        <span>{{handleLine('recieve').content.accepter_mobile}}</span>
                    </div>
                </div>
                <div v-if="item.step === 'arrive' && currentStep === 'arrive' && handleLine('arrive')" class="steps-info-content d-v-c">
                    <div class="steps-content-item">
                        <label>{{i18n.label.time}}</label>
                        <span>{{handleLine('arrive').content.time}}</span>
                    </div>
                    <div class="steps-content-item">
                        <label>{{i18n.label.signLng}}</label>
                        <span>{{handleLine('arrive').content.lng}}</span>
                    </div>
                    <div class="steps-content-item">
                        <label>{{i18n.label.signLat}}</label>
                        <span>{{handleLine('arrive').content.lat}}</span>
                    </div>
                    <div class="steps-content-item">
                        <label>{{i18n.label.signDistance}}</label>
                        <span>{{handleLine('arrive').content.distance}} 米</span>
                    </div>
                </div>
                <div v-if="item.step === 'reply' && currentStep === 'reply' && handleLine('reply')" class="steps-info-content d-v-c">
                    <div class="steps-info-content-text d-v-c">
                        <div class="steps-content-item">
                            <label>{{i18n.label.time}}</label>
                            <span>{{handleLine('reply').content.time}}</span>
                        </div>
                        <div class="steps-content-item">
                            <label>{{i18n.label.receiptPeople}}</label>
                            <span>{{handleLine('reply').content.replyer_name}}</span>
                        </div>
                        <div class="steps-content-item">
                            <label>{{i18n.label.receiptContent}}</label>
                            <span>{{handleLine('reply').content.reply_content}}</span>
                        </div>
                    </div>
                    <div class="steps-info-content-media">
                        <img v-for="im of handleLine('reply').content.reply_imgs" :key="im" :src="im" class="steps-info-content-media-img" />
                        <video v-for="vi of handleLine('reply').content.reply_videos" :key="vi" :src="vi" autoplay controls loop class="steps-info-content-media-video" ref="video" />
                    </div>
                </div>
                <div v-if="item.step === 'evaluate' && currentStep === 'evaluate' && handleLine('evaluate')" class="steps-info-content d-v-c">
                    <div class="steps-content-item">
                        <label>{{i18n.label.time}}</label>
                        <span>{{handleLine('evaluate').content.time}}</span>
                    </div>
                    <div class="steps-content-item">
                        <label>{{i18n.label.score}}</label>
                        <span>{{handleLine('evaluate').content.score}}</span>
                    </div>
                    <div class="steps-content-item">
                        <label>{{i18n.label.evaluate}}</label>
                        <span>{{handleLine('evaluate').content.pj}}</span>
                    </div>
                </div>
                <div v-if="item.step === 'cancel' && currentStep === 'cancel' && handleLine('cancel')" class="steps-info-content d-v-c">
                    <div class="steps-content-item">
                        <label>{{i18n.label.time}}</label>
                        <span>{{handleLine('cancel').content.time}}</span>
                    </div>
                    <div class="steps-content-item">
                        <label>{{i18n.label.cancelPeople}}</label>
                        <span>{{handleLine('cancel').content.canceler_name}}</span>
                    </div>
                    <div class="steps-content-item">
                        <label>{{i18n.label.cancelReason}}</label>
                        <span>{{handleLine('cancel').content.reason}}</span>
                    </div>
                </div>
            </div>
        </div>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import { BasePopup } from '@/base-class/dynamic-create';
import { getWorkInfo as get } from '@/config/api';

@Component({
    name: 'WorkDetailsHandle',
})
export default class WorkDetailsHandle extends BasePopup {
    @Prop({ type: String, default: () => 'report' })
    step?: string;

    current = 0;
    currentStep = 'report';
    info = {
        id: 0, 
        work_code: 0,
        service_type_name: '',
        work_level_name: '',
        work_type_name: '',
        work_status: '',
        work_status_name: '',
    };
    line = [{ content: {}}, { content: {}}, { content: {}}, { content: {}}, { content: {}}] as any;

    get i18n() {
        const label = {
            work_code: `${this.$t('h.table.work.workNumber')}：`,
            service_type_name: `${this.$t('h.formLabel.work.service_type')}：`,
            work_level_name: `${this.$t('h.formLabel.work.work_level')}：`,
            work_type_name: `${this.$t('h.formLabel.work.work_type')}：`,
            work_status_name: `${this.$t('h.table.work.workStatus')}：`,
            time: `${this.$t('h.table.time')}：`,
            reportUser: `${this.$t('h.formLabel.work.reportUser')}：`,
            customer: `${this.$t('h.formLabel.work.customer')}：`,
            customerAddress: `${this.$t('h.formLabel.work.customerAddress')}：`,
            contactMan: `${this.$t('h.table.work.contactMan')}：`,
            link_mobile: `${this.$t('h.formLabel.work.link_mobile')}：`,
            content: `${this.$t('h.formLabel.work.content')}：`,
            acceptType: `${this.$t('h.formLabel.work.acceptType')}：`,
            sendPeople: `${this.$t('h.formLabel.work.sendPeople')}：`,
            repairUser: `${this.$t('h.formLabel.work.repairUser')}：`,
            repairUserPhone: `${this.$t('h.formLabel.work.repairUserPhone')}：`,
            score: `${this.$t('h.table.work.score')}：`,
            signLng: `${this.$t('h.formLabel.work.signLng')}：`,
            signLat: `${this.$t('h.formLabel.work.signLat')}：`,
            signDistance: `${this.$t('h.formLabel.work.signDistance')}：`,
            receiptPeople: `${this.$t('h.formLabel.work.receiptPeople')}：`,
            receiptContent: `${this.$t('h.formLabel.work.receiptContent')}：`,
            evaluate: `${this.$t('h.formLabel.work.evaluate')}：`,
            cancelPeople: `${this.$t('h.formLabel.work.cancelPeople')}：`,
            cancelReason: `${this.$t('h.formLabel.work.cancelReason')}：`,
        };

        return { label };
    }

    // 打开前事件
    prefixFunc() {
        const { id, step } = this;
        this.current = ['report', 'recieve', 'arrive', 'reply', 'evaluate'].findIndex(item => item === step);
        this.currentStep = step;
        id && this.getDetails(id);
    }
    // 关闭前事件
    suffixFunc() {
        
    }

    handleLine(step: string){
        const { line } = this;
        return line.find((item: any) => item.step === step);
    }
    handleTarget(index: number, finished: number, step: string) {
        if (!finished) return false;
        this.current = index;
        this.currentStep = step;

    }
    // 获取详情
    async getDetails(id: number) {
        const { info } = this;
        const { type, data } = await get(id);
        if (!type) {
            Object.assign(info, data.info);
            this.line = data.line;
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
        display: flex;
        align-items: end;
        &-name {
            flex: 0 0 20%;
            text-align: center;
            display: flex;
            justify-content: center;
            height: 400px;
            &-line {
                width: 100%;
                height: 2px;
                background-color: #ffffff;
                position: absolute;
                top: 14px;
                left: 0;
                z-index: -1;
            }
            &-status {
                display: inline-block;
                min-width: 30px;
                height: 30px;
                border-radius: 50%;
                margin-right: 5px;
                z-index: 2;
            }
            &-active {
                box-shadow: 0 0 20px 0 $--white;
            }
            &-title {
                min-width: 30px;
                margin-top: 3px;
                height: 22px;
            }
        }
        &-content {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 15px;
            left: 0;
            z-index: 1;
            flex-flow: column;
            &-text {
                flex-flow: column;
                margin-bottom: 10px;
            }
            &-media {
                display: flex;
                max-height: 200px;
                justify-content: space-around;
                &-img {
                    width: 200px;
                    object-fit: contain;
                    margin: 0 5px;
                }
                &-video {
                    width: 200px;
                    margin: 0 5px;
                }
            }
        }
    }
</style>
