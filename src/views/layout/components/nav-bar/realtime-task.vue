<template>
    <poptip class="realtime-task-wrapper" placement="bottom-end">
        <badge :count="counts.count">
            <div v-if="$route.name === 'home'" class="realtime-task-email c-p">
                <img class="realtime-task-email-img c-p" src="~@/assets/images/home-page-header-info.png" />
                <svg-icon class="realtime-task-email-svg" icon-class="email" />
            </div>
            <svg-icon v-else class="realtime-task-svg c-p" icon-class="email" />
        </badge>
        <tabs class="realtime-task-list" slot="content">
            <tab-pane
                v-for="(datum, index) of menus" :key="index"
                :label="$event => tabpaneRender($event, datum)"
                :name="datum.value"
            >
                <ul>
                    <li
                        v-for="(item, i) of list[datum.value]" :key="`${item.id}${i}`"
                        @click="handle(datum, item, i)"
                        :title="datum.aliasTitle"
                    >
                        <badge :count="+!item.isread" class="realtime-task-list-item c-p" dot>
                            <span class="realtime-task-list-item-time">{{item.time}}</span>
                            <p :title="item.content" class="t-o-e">{{item.content}}</p>
                        </badge>
                    </li>
                    <li v-if="!(list[datum.value] && list[datum.value].length)">{{$t('h.common.noData')}}</li>
                </ul>
            </tab-pane>
        </tabs>
    </poptip>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Poptip, Badge, Tabs, TabPane } from 'view-design';
import { socketModule } from '@/store/index';

type MenuOption = { title: string; value: string; };
type TaskOption = Dictionary<any>;

@Component({
    components: {
        Poptip,
        Badge,
        Tabs,
        TabPane,
    },
})
export default class RealtimeTask extends Vue {
    menus: MenuOption[] = [
        {
            title: 'h.header.inspectionTask',
            value: 'checktasks',
        },
        {
            title: 'h.header.workTask',
            value: 'worktask',
        },
    ]

    /**
     * @description: 通知列表
     */
    get list() {
        const { checktasks, worktask } = socketModule;
        return { checktasks, worktask };
    }
    /**
     * @description: 通知列表未读数集合
     * @return {Object} 字段是通知列表的字段和 count(总数)
     */
    get counts() {
        const { list } = this;
        const result = { count: 0, checktasks: 0, worktask: 0 };
        Object.entries(list).reduce((prev, [key, values]) => {
            prev[key as 'checktasks'] = values.reduce((prev, v) => prev + !v.isread, 0);
            prev.count += prev[key as 'checktasks'];
            return prev;
        }, result);

        return result;
    }

    /**
     * @description: 生成 tabpane 的头部
     * @param {Function} h: vue 渲染函数
     * @param {Object} data: 点击项数据
     */
    tabpaneRender(h: CreateElement, data: MenuOption) {
        const { counts } = this;
        return h(
            Badge,
            {
                props: { count: counts[data.value as 'worktask'] || 0 },
                style: 'padding-right: 20px',
            },
            this.$t(data.title) as string
        );
    }
    /**
     * @description: 任务点击事件
     * @param {Object} datum: 点击类型数据
     * @param {Object} data: 点击项数据
     * @param {Number} index: 点击数据的下标
     */
    handle(datum: MenuOption, data: Dictionary<any>, index: number) {
        if (datum.value === 'checktasks') {
            // 巡查任务详情
            this.$getDynamicComponent('task', () => {
                this.$createTaskHandle({
                    type: 'details',
                    id: Number(data.id),
                    t: 'task',
                }).show();
            });
        }
        else if (datum.value === 'worktask') {
            // 工单任务详情
            this.$getDynamicComponent('createWork', () => {
                this.$createCreateWorkHandle({
                    type: 'details',
                    alarm_id: Number(data.id),
                    plat: data.plat,
                }).show();
            });
        }
        this.disposeResetNotices(datum.value, index);
    }
    /**
     * @description: 处理已读
     * @param {String} types: 处理的类型
     * @param {Number} index: 已读下标
     */
    disposeResetNotices(types: string, index: number) {
        const { list } = this;
        const data: TaskOption[] = JSON.parse(JSON.stringify(list[types as 'checktasks']));
        isNaN(index) ? data.forEach(item => (item.isread = 1)) : (data[index].isread = 1);
        socketModule.resetNotices({
            types: types as 'checktasks',
            data,
        });
    }
    /**
     * @description: 查看全部
     * @param {String} type: 查看的类型
     * @param {String} plat: 所属平台
     */
    allTaskHandle(type: string, plat: string) {
        let path = '';
        if (type === 'checktasks') {
            // 巡检任务列表
            path = `/app/${plat}/${plat}-patrol/${plat}-patrol-task`;
        }
        else if (type === 'worktask') {
            // 工单任务列表
            path = `/app/${plat}/${plat}-work-list`;
        }
        path && this.$router.push(path);
    }
}
</script>

<style scoped lang="scss">
    .realtime-task-wrapper {
        color: $--black3;
        margin: 2px 5px 0 5px;
        .realtime-task-svg {
            font-size: 0.22rem;
        }
    }
    // 任务列表
    .realtime-task-list {
        width: 600px;
        // color: $--white;
        &-item {
            margin: 4px 10px 0 0;
            display: flex;
            align-items: center;
            &__time {
                margin-right: 8px;
                flex: none;
            }
            @include utils-pierce(ivu-badge-dot) {
                top: 6px;
            }
        }
    }
</style>
