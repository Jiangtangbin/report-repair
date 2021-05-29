<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="$t('h.modal.titles.workNewNotice')"
        width="880px"
        :footer-hide="true"
        loading
    >
        <div class="work-info">
            <template v-if="stepType === 'new_work'">
                <div class="work-info-item">
                    <label>{{i18n.label.work_code}}</label>
                    <span>{{data.work_code}}</span>
                </div>
                <div class="work-info-item">
                    <label>{{i18n.label.org_name}}</label>
                    <span>{{data.org_name}}</span>
                </div>
                <div class="work-info-item">
                    <label>{{i18n.label.link_man}}</label>
                    <span>{{data.link_man}}</span>
                </div>
                <div class="work-info-item">
                    <label>{{i18n.label.link_mobile}}</label>
                    <span>{{data.link_mobile}}</span>
                </div>
                <div class="work-info-item">
                    <label>{{i18n.label.work_type_name}}</label>
                    <span>{{data.work_type_name}}</span>
                </div>
                <div class="work-info-item">
                    <label>{{i18n.label.service_type_name}}</label>
                    <span>{{data.service_type_name}}</span>
                </div>
                <div class="work-info-item">
                    <label>{{i18n.label.work_level_name}}</label>
                    <span>{{data.work_level_name}}</span>
                </div>
            </template>
            <template v-if="stepType === 'accept_work' || stepType === 'finish_work'">
                <div class="work-info-item">
                    <label>{{i18n.label.work_code}}</label>
                    <span>{{data.work_code}}</span>
                </div>
                <div class="work-info-item">
                    <label>{{i18n.label.accepter_name}}</label>
                    <span>{{data.accepter_name}}</span>
                </div>
                <div class="work-info-item">
                    <label>{{i18n.label.accepter_mobile}}</label>
                    <span>{{data.accepter_mobile}}</span>
                </div>
            </template>
            <template v-if="stepType === 'pj_work'">
                <div class="work-info-item">
                    <label>{{i18n.label.work_code}}</label>
                    <span>{{data.work_code}}</span>
                </div>
                <div class="work-info-item">
                    <label>{{i18n.label.score}}</label>
                    <span>{{data.score}}</span>
                </div>
                <div class="work-info-item">
                    <label>{{i18n.label.pj}}</label>
                    <span>{{data.pj}}</span>
                </div>
            </template>
            <div class="work-info-item">
                <my-button @click="checkWorkDetails">查看工单详情</my-button>
            </div>
        </div>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import { BasePopup } from '@/base-class/dynamic-create';

@Component({
    name: 'WorkNewNoticeHandle',
})
export default class WorkNewNoticeHandle extends BasePopup {
    @Prop({ type: String, default: () => "new_work" })
    stepType!: string;
    @Prop({ type: Object, default: () => ({}) })
    data!: object;

    get i18n() {
        const label = {
            work_code: `${this.$t('h.table.work.workNumber')}：`,
            org_name: `${this.$t('h.formLabel.affiliatedCustomer')}：`,
            link_man: `${this.$t('h.formLabel.work.link_man')}：`,
            link_mobile: `${this.$t('h.formLabel.work.link_mobile')}：`,
            service_type_name: `${this.$t('h.formLabel.work.service_type')}：`,
            work_level_name: `${this.$t('h.formLabel.work.work_level')}：`,
            work_type_name: `${this.$t('h.formLabel.work.work_type')}：`,
            accepter_name: `${this.$t('h.formLabel.work.repairUser')}：`,
            accepter_mobile: `${this.$t('h.formLabel.work.repairUserPhone')}：`,
            score: `${this.$t('h.table.work.score')}：`,
            pj: `${this.$t('h.formLabel.work.evaluate')}：`,
        };

        return { label };
    }

    // 打开前事件
    prefixFunc() {
        
    }
    // 关闭前事件
    suffixFunc() {
        
    }

    checkWorkDetails() {
        const { data } = this;
        this.$getDynamicComponent('workDetails', () => {
            this.$createWorkDetailsHandle({
                id: data && data.id,
                step: data && data.step,
                $events: {
                    success: 'refresh',
                },
            }).show();
        });
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
</style>
