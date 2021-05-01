
import { Watch, Component, Vue } from 'vue-property-decorator';
import { Table } from 'view-design';
import { appModule } from '@/store/index';
import BScroll from '@better-scroll/core';
import MouseWheel from '@/scroll/mouse-wheel/index';
import Scrollbar from '@/scroll/scroll-bar/index';

BScroll.use(MouseWheel);
BScroll.use(Scrollbar);

/**
 * @description: 计算 table 的高度使其高度自适应且超出父元素高度时 table body 出现滚动条
 */
@Component
export class AnewCalculateHeight extends Vue {
    $refs!: {
        tableBox: HTMLElement;
        table: Table;
    }

    private table: Dictionary<string | number> = { height: '' }

    '$_calcHeight'() {
        this.table.height = '';
        this.$nextTick(() => {
            if (!(this.$refs.tableBox && this.$refs.table)) return;
            const { offsetHeight: maxHeight } = this.$refs.tableBox;
            const { $el: { scrollHeight: height = 0 }} = this.$refs.table;

            if (height > maxHeight) {
                this.table.height = maxHeight;
            }
        });
    }
}

/**
 * @description: 设置滚动条, 注意 -> 需实现 initScroll 函数
 */
@Component
export class BetterScrollBar extends Vue {
    get isMobile() {
        return appModule.isMobile;
    }

    scroll: BScroll | null = null;
    scrollOptions = {
        startX: 0,
        startY: 0,
        scrollX: true,
        mouseWheel: true,
        disableMouse: true,
        scrollbar: {
            fade: false,
            interactive: true,
        },
        preventDefault: false,
    }

    destroyed() {
        this.destroyScrollBar();
    }

    @Watch('isMobile')
    platformChange() {
        (this as any).initScroll();
    }

    /**
     * @param {HTMLElement} el: 需要设置滚动条的元素
     */
    genScrollBar(el: HTMLElement) {
        const { isMobile, scrollOptions } = this;
        this.destroyScrollBar();
        this.scroll = new BScroll(el, isMobile ? { startX: 0, startY: 0, click: true } : scrollOptions);
    }
    /**
     * @description: 销毁滚动条
     */
    destroyScrollBar() {
        if (!this.scroll) return;
        this.scroll.destroy();
        this.scroll = null;
    }
}