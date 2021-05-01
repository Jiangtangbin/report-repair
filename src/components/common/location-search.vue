<template>
    <i-input
        v-on="$listeners"
        v-bind="$attrs"
        :value="keyword"
        @input="updateKeyword"
        @on-blur="keyword || updateValue(false)"
        @on-click="handle"
        @on-change="updateValue(true)"
        @on-focus="keyword && updateValue(true)"
        :icon="keyword ? 'ios-close' : 'ios-search'"
    />
</template>

<script lang="ts">
import { Prop, Emit, Component, Vue } from 'vue-property-decorator';
import { Input as IInput } from 'view-design';

@Component({
    components: {
        IInput,
    },
})
export default class MapSearch extends Vue {
    // 搜索字段，sync 触发
    @Prop({ type: String, required: true })
    keyword!: string;
    // 控制搜索组件显隐，sync 触发 -> 地图搜索组件
    @Prop(Boolean)
    value!: boolean;

    // 点击事件
    handle() {
        this.updateValue(false);
        this.updateKeyword('');
    }

    @Emit('update:value')
    updateValue(val: boolean) {
        return val;
    }
    @Emit('update:keyword')
    updateKeyword(val: string) {
        return val;
    }
}
</script>