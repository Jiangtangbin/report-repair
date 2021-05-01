import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import { Dropdown, DropdownMenu, DropdownItem } from 'view-design';
import { OpenListType, openList } from './index';

const text: Record<string, { alias: OpenListType; title: string; params?: Record<string, any>; }> = {
    // device: {
    //     title: 'h.formLabel.device.devices',
    //     alias: 'd',
    // },
};
const plats = [''];

type DropList = { title: string; value: string; alias: string; params?: Record<string, any>; };
type WinType = keyof typeof text;

// @ts-ignore
@Component({
    components: {
        Dropdown,
        DropdownMenu,
        DropdownItem,
    },
})
export abstract class DropMixin extends Vue {
    // 显示的 plat
    @Prop(String)
    plat?: string;

    // 用来判断父级是否存在此方法, 存在则子级不显示下拉框
    readonly __dropMenuMixin = true;
    // 是否允许显示下拉弹窗
    private isShowMenuDrop = false;
    // 需弹窗的类型 -> 外部实现
    abstract winType: WinType[];

    get dropList(): DropList[] {
        const { plat, isShowMenuDrop } = this;
        const winType = this.winType || [];
        if (!(isShowMenuDrop && plat)) return [];
        const _plat = plat && plats.includes(plat) ? plat : undefined;
        const result: DropList[] = [];
        winType.reduce((prev, k) => {
            text[k] && prev.push({
                title: this.$t(text[k].title) as string,
                value: k,
                alias: text[k].alias || k,
                params: { plat: _plat, ...text[k].params },
            });
            return prev;
        }, result);
        return result;
    }

    @Watch('plat', { immediate: true })
    platChange() {
        this.$nextTick(() => {
            const __dropMenuMixin = (this.$parent as any).__dropMenuMixin;
            this.isShowMenuDrop = !__dropMenuMixin;
        });
    }

    /**
     * @description: 点击下拉框
     * @param {String} type: 打开的类型
     */
    dropHandle(type: string) {
        const { dropList, $route: { query: { area } } } = this;
        const item = dropList.find(v => v.value === type);
        // 如果路径上存在区域筛选就加入区域参数
        if (area) {
            const region = area.split('_');
            item.params[region[0]] = region[1];
        }
        if (!item) return;
        openList.call(this, item.alias, item.params);
    }
}