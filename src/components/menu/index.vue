<template>
    <collapse-transition appear>
        <div class="menu-wrapper">
            <menu-item
                v-for="(item, index) of data" :key="`${item.value}${index}${Number(collapse)}`"
                :accordion="accordion"
                :active-name="activeName"
                :append-to-body="appendToBody"
                :collapse="collapse"
                :data="item"
                :space="space"
                :trigger="trigger"
                :timeout="timeout"
                ref="menuItem"
            />
        </div>
    </collapse-transition>
</template>
<script lang="ts">
import { Prop, Emit, Provide, Component, Vue } from 'vue-property-decorator';
import MenuItem from './menu-item.vue';
import CollapseTransition from '../transition/index';

export interface IData {
    title: string;
    value: string;
    icon?: string;
    children?: IData[];
}
export interface IDataInfo extends IData {
    _expand: boolean;
}

/**
  * @description: 允许传递的参数
  * @param {String} activeName: 激活菜单的值
  * @param {Boolean} accordion: 是否开启手风琴
  * @param {Boolean} appendToBody: 是否将弹窗添加至 body, collapse 为 true 才起作用
  * @param {Boolean} collapse: 水平折叠收起菜单
  * @param {Array} data: 数据源, 格式为: [{title: '首页', name: 'home', children?: []}]
  * @param {Number} space: 距离左侧的间隔
  * @param {String} trigger: 触发显示菜单的方式
  * @param {Number} timeout: 触发延时
  * @return 父组件接收到的事件
  * $emit('selected', name) 点击 menuitem 时返回的当前的 name
  * $emit('open-change', name, expand) 点击 menu 时返回点击的 name 和 expand 状态
  */
@Component({
    name: 'Menu',
    components: {
        MenuItem,
        CollapseTransition,
    },
})
export default class Menu extends Vue {
    $refs!: {
        menuItem: MenuItem[];
    }

    @Provide()
    rootMenu = this;

    @Emit()
    selected(data: IDataInfo) {
        return data;
    }
    @Emit()
    openChange(data: IDataInfo) {
        return data;
    }

    // 激活的名称
    @Prop({ type: String, default: '' })
    activeName!: string;
    // 手风琴效果
    @Prop({ type: Boolean, default: true })
    accordion!: boolean;
    // 是否将弹窗添加至 body, collapse 为 true 才起作用
    @Prop({ type: Boolean, default: true })
    appendToBody!: boolean;
    // 行内显示菜单(false)或浮层(true)显示
    @Prop({ type: Boolean, default: false })
    collapse!: boolean
    // 数据源
    @Prop({ type: Array, required: true })
    data!: IData[]
    // 距离左侧的间距
    @Prop({ type: Number, default: 25 })
    space!: number;
    // 触发显示菜单的方式 -> click | hover
    @Prop({ type: String, default: 'click' })
    trigger!: string
    // 触发延时
    @Prop({ type: Number, default: 300 })
    timeout!: number

    public isRootMenu: Readonly<any> = {};
}
</script>