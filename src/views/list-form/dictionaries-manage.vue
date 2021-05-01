<template>
    <div class="dicts-wrapper">
        <alert class="alert">{{$t('h.common.type')}}：{{$t('h.dictionaries.requestType')}}</alert>
        <div class="dicts-body">
            <div class="dicts-body-tree">
                <p class="dicts-body-tree-title t-o-e">{{$t('h.dictionaries.dictionariesParamsList')}}</p>
                <loading :loading="loading" />
                <tree @on-select-change="handle" :data="data" class="dicts-body-tree-list" />
            </div>
            <basic-list
                :columns="columns"
                :data="list"
                :pageSize="1"
                :pageNum="1"
                :countPage="1"
                :count="1"
                class="dicts-body-table"
                page-hide
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import { Tree, Alert, Spin } from 'view-design';
import BasicList from '@/components/common/list.vue';
import { DictModule } from '@/store/modules/dict';
import { isString } from '@/utils/index';

type Datum = ResponseSimple.Dict;

@Component({
    name: 'dictionaries-manage',
    components: {
        Tree,
        Alert,
        BasicList,
        Spin,
    },
})
export default class DictionariesManage extends Vue {
    @Prop(String)
    t?: string;

    private data: Datum[] = [];
    private list: Datum[] = [];
    private loading = false;

    get columns() {
        const title = {
            title: this.$t('h.formLabel.name'),
            type: this.$t('h.formLabel.type'),
            value: this.$t('h.formLabel.code'),
        };
        return [
            {
                title: title.title,
                key: 'title',
            },
            {
                title: title.type,
                key: 'type',
            },
            {
                title: title.value,
                key: 'value',
            },
        ]
    }

    created() {
        const { t } = this;
        const result = this.getDicts('test');
        t ? this.getDicts(t) : result.then(data => {
                    isString(data) || this.getDicts(data[0].value);
                });
    }

    @Watch('t')
    tChange(t?: string) {
        this.getDicts(t);
    }

    // 请求字典
    async getDicts(t?: string) {
        this.loading = true;
        const data = await DictModule.getDicts(t);
        if (typeof data === 'string') {
            this.$Message.error(data);
        } else {
            t && t !== 'test'
                ? this.list = data
                : this.data = JSON.parse(JSON.stringify(data));
        }
        this.loading = false;
        return data;
    }
    /**
     * @description: 树形列表点击事件
     * @param {Array} checked: 已选中数据
     * @param {Object} data: 点击项数据
     */
    handle(checked: Datum[], data: Datum) {
        const { t } = this;
        data.value !== t && this.$router.replace({ query: { t: data.value }});
    }
}
</script>
<style scoped lang="scss">
    @import '~@/views/styles/list.scss';

    .dicts-wrapper {
        width: 100%; height: 100%;
        display: flex;
        flex-flow: column;
        .dicts-body {
            width: 100%; height: calc(100% - 46px);
            display: flex;
            &-tree {
                width: 140px; height: 100%;
                position: relative;
                &-title {
                    height: 24px;
                }
                &-list {
                    height: calc(100% - 24px);
                    overflow: auto;
                }
            }
            &-table {
                width: calc(100% - 140px); height: 100%;
                margin: 0;
            }
        }
    }
</style>