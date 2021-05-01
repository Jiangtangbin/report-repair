
<script lang="tsx">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import { HollowDotsSpinner, BreedingRhombusSpinner } from 'epic-spinners';

@Component
export default class Loading extends Vue {
    @Prop({ type: String, default: 'div' }) tag!: string;
    @Prop({ type: String, default: 'absolute' }) position!: string;
    @Prop({ type: Number, default: 200 }) timeout!: number;
    @Prop({ type: Boolean, required: true }) loading!: boolean;
    @Prop({ type: String, default: 'A' }) type!: 'A' | 'B';

    private isShow: boolean = false; // 用来判断是否显示, 不用 loading 是防止请求快速返回时来回切换造成无用渲染
    private timer: number = 0;

    @Watch('loading', { immediate: true })
    changes(val: boolean, oldVal: boolean) {
        if (val === oldVal) return;
        this.setLoading(val);
    }
    
    // 设置 loading 状态
    setLoading(status?: boolean) {
        clearTimeout(this.timer);
        this.timer = window.setTimeout(() => {
            this.isShow = typeof status === 'boolean' ? status : !this.isShow;
        }, this.timeout);
    }

    render() {
        const { tag, type, position, isShow } = this;
        const h = this.$createElement;
        return h(
            tag,
            { style: { position, display: isShow ? 'flex' : 'none' }, class: 'spin-wrapper' },
            [
                h(type === 'A' ? HollowDotsSpinner : BreedingRhombusSpinner, { props: { animationDuration: 1000, size: 60, color: 'currentColor' }}),
            ]
        );
    }
}
</script>

<style scoped lang="scss">
    .spin-wrapper {
        left: 0; top: 0;
        bottom: 0; right: 0;
        margin: auto;
        justify-content: center;
        align-items: center;
        z-index: 1;
    }
</style>