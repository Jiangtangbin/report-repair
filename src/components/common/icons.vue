<script lang="tsx">
import { Prop, Component, Vue } from 'vue-property-decorator';
import iconList from '@/assets/icons/svg-icons';

@Component
export default class Icons extends Vue {
    @Prop(String)
    filterKey?: string;

    get icons() {
        const { filterKey } = this;
        return filterKey
            ? iconList.filter(icon => icon.indexOf(filterKey) !== -1)
            : iconList;
    }
    
    // 渲染图标
    render(h: CreateElement) {
        return h('div', this.genIcon());
    }

    // 生成图标
    genIcon() {
        const { icons } = this;
        return icons.map(icon => {
            return this.$scopedSlots.default
                ? this.$scopedSlots.default(icon)
                : this.$createElement(
                    'svg-icon',
                    { props: { iconClass: icon }, class: 'svg-icon-item c-p', on: this.getEvent(icon) }
                );
        });
    }

    /**
     * @description: 生成事件
     * @param {String} icon: 图标名称
     */
    getEvent(icon: string) {
        const { $listeners } = this;
        return Object.keys($listeners).reduce((prev, triggerName) => {
            prev[triggerName] = (event: MouseEvent) => this.$emit(triggerName, icon, event);
            return prev;
        }, {} as Dictionary<Function>);
    }
}
</script>

<style scoped lang="scss">
    .svg-icon-item {
        font-size: 23px;
        margin: 10px;
        transition: transform $--transition-time $--ease-in-out-function;
        &:hover {
            transform: scale3d(1.4, 1.4, 1)
        }
    }
</style>