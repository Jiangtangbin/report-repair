import { Prop, Component, Vue } from 'vue-property-decorator';
import get from 'lodash/get';
import { isString, isObject } from '@/utils/index';
import { openWins } from '@/mixins/index';
import { i18n } from '@/locale/index';

// 基于 createElement 动态生成组件的基类

// 基础的信息
@Component
export class CreateBasic extends Vue {
    @Prop({ type: String, default: () => i18n.t('h.modal.optionList') })
    title!: string;
    @Prop([Number, String])
    type!: 1 | 2 | 'details';
    @Prop(Number)
    id?: number;

    get forbidden() {
        return this.type === 'details';
    }
    get titlePrefix(): string {
        const { type } = this;
        return type === 1
            ? i18n.t('h.modal.add') as string
            : type === 2
                ? i18n.t('h.modal.edit') as string
                : i18n.t('h.modal.details') as string;
    }
}

// 基础的弹窗
export abstract class BasePopup extends CreateBasic {
    init = false;
    value = false;
    removeTimer = 0;

    // 销毁组件
    destroy() {
        this.hide();
        this.$emit('remove');
        // (this as any).remove && (this.removeTimer = window.setTimeout(() => (this as any).remove, 500));
        (this as any).remove && (this.removeTimer = window.setTimeout((this as any).remove, 500));
    }
    // 阻止移除弹窗
    stopDestroy() {
        clearTimeout(this.removeTimer);
    }
    // 初始化组件，但是不显示，由外部来控制是否显示组件
    initComponent() {
        const { prefixFunc } = this;
        this.init = true;
        prefixFunc && this.$nextTick(prefixFunc);
        return this;
    }
    // 显示组件
    show() {
        this.initComponent();
        if (this.value === true) {
            this.value = false;
            this.$nextTick(() => {
                this.stopDestroy();
                this.value = true;
            });
        } else {
            this.value = true;
        }
        return this;
    }
    // 隐藏组件
    hide() {
        const { suffixFunc } = this;
        this.value = false;
        suffixFunc && suffixFunc();
        return this;
    }
    // 补位 Function，防止某些场景不需要此函数时，扩展方法得重新定义一遍
    suffixFunc() { console.log() }
    prefixFunc() { console.log() }
    // 打开指定类型的详情弹窗
    openWins(type: string, id: Number) {
        openWins.call(this, type, id);
    }
}

export type DictPossibleFields = { title: string; value: string | number; [index: string]: string | number };

// 需要向后台提交数据的弹窗
export abstract class Popup<T extends keyof API.Parameter> extends BasePopup {
    // 提交给后台的参数，只限制字段，不限制类型，防止实现时起冲突
    abstract formInline: { [K in keyof API.Parameter[T]]: any };
    // 提交函数
    abstract ok(): boolean | Promise<boolean>;

    // 对弹窗的 columns 做处理，详情时删除列表中的最后一位
    get finallyColumns() {
        const { type, columns } = this as any;
        if (!isObject(columns)) return {};
        return isString(type) ? Object.entries(columns).reduce((prev, [k, v]) => ({ ...prev, [k]: v.slice(0, -1) }), {}) : columns;
    }

    /**
     * @description: 删除弹窗选中的数据
     * @param {String} type: 删除的类型
     * @param {Number} key: 删除的下标
     */
    delReceiveItem(type: keyof API.Parameter[T], key: number | string) {
        const { formInline, suffixDelItem, forbidden } = this;
        if (forbidden) return;
        try {
            // 防止删除列表中不存在的属性
            (get(formInline, type) as any).splice(key, 1);
            // 删除下标有关联操作时触发
            suffixDelItem && suffixDelItem(type, key);
        } catch (error) {
            console.log(error);
        }
    }
    // 补位 Function，防止某些场景不需要此函数时，扩展方法得重新定义一遍
    suffixDelItem(type: keyof API.Parameter[T], key: number | string) {
        type && key || console.log('补位 Function，防止某些场景不需要此函数时，扩展方法得重新定义一遍');
    }
}

// 需要向后台提交数据的弹窗，带字典的
export abstract class PopupDict<T extends keyof API.Parameter> extends Popup<T> {
    abstract dicts: { [K in keyof API.Parameter[T] | any]?: DictPossibleFields[] | any[] | any };

    /**
     * @description: 从 select 字典里面获取指定的数据
     * @param {String} key: 查看的字段
     * @param {String} value: 获取对应的值
     * @param {String} filed: 匹配的字段，默认 value
     * @param {String} def: 默认值
     */
    getTitle({ key, value, field = 'value', title = 'title', def = i18n.t('h.common.none') as string }: { key: keyof API.Parameter[T], value: string, field: string, title: string, def: string }) {
        const { dicts } = this;
        if (dicts[key]) {
            const result = dicts[key].find((item: any) => item[field] === value);
            return result ? result[title] : def;
        }
    }
}