import { EsModuleComponent } from 'vue/types/options';
import { Message } from 'view-design';

export interface ICallbackOptions {
    (component: EsModuleComponent): void;
}
export interface IDynamicImportOptions {
    num: number;
    loadingMsg: string;
    errorMsg: string;
    errorFunc?: (value: Error) => void;
}

export type AsyncComponent = () => Promise<EsModuleComponent>;

/**
 * @description: 动态导入处理过后的函数，允许失败后重复导入
 * @param {Function} imports: 动态导入函数
 * @param {Number} num: 重复导入的次数
 */
async function maxImport(imports: AsyncComponent, num: number): Promise<EsModuleComponent> {
    return imports()
        .catch(error => {
            console.log('导入错误', '\n', error);
            return num > 1
                ? maxImport(imports, num - 1)
                : Promise.reject(error);
        });
}

const defaultOptions: IDynamicImportOptions = {
    num: 5,
    loadingMsg: '组件正在加载中，请稍候',
    errorMsg: '组件加载失败，请重试',
};

const dynamicImport = (() => {
    // 加载动画，显示动画时即时显示，隐藏时延时 0.5s，防止多个请求的情况
    const spin = {
        timer: 0,
        count: 0,
        up(str: string) {
            this.count < 1 && this.show(str);
            this.count++;
            return this;
        },
        down() {
            this.count--;
            this.count < 1 && this.hide();
            return this;
        },
        show(str: string) {
            clearTimeout(this.timer);
            setTimeout(() => console.log('显示了 - ', str), 200);
            return this;
        },
        hide() {
            this.timer = window.setTimeout(() => console.log('隐藏了'), 500);
            return this;
        },
    };
    /**
     * @description: 动态导入(通过回调回调函数)
     * @param {Function} _imports: 动态导入函数
     * @param {Function} callback: 回调函数
     * @param {Object} options?: 可选配置项
     * @param {Number} options.num: 重复请求的次数
     * @param {String} options.loadingMsg: loading 提示，如传空则不进行提示
     * @param {String} options.errorMsg: 加载失败后的提示，如传空则不进行提示
     * @param {String} options.errorFunc: 加载失败后的回调
     */
    function dynamicImport(imports: AsyncComponent, callback: ICallbackOptions, options?: Partial<IDynamicImportOptions>): void
    function dynamicImport(imports: AsyncComponent, options: Partial<IDynamicImportOptions>): Promise<EsModuleComponent>
    function dynamicImport(imports: AsyncComponent): Promise<EsModuleComponent>
    async function dynamicImport(imports: AsyncComponent, callback?: any, options?: any) {
        const isFunc = typeof imports === 'function';
        if (!isFunc) return;
        const hasCallback = typeof callback === 'function';
        const _callback = hasCallback ? callback : () => { };
        const _options = (hasCallback ? options : callback) || {};
        const { num, loadingMsg, errorMsg, errorFunc }: IDynamicImportOptions = { ...defaultOptions, ..._options };
        try {
            loadingMsg && spin.up(loadingMsg);
            const result = await maxImport(imports, num);
            loadingMsg && spin.down();
            if (hasCallback) {
                _callback(result);
            } else {
                return Promise.resolve(result);
            }
        } catch (error) {
            errorMsg && Message.error(errorMsg);
            loadingMsg && spin.down();
            console.log(error);
            if (hasCallback) {
                typeof errorFunc === 'function' && errorFunc(error);
            } else {
                Promise.reject(error);
            }
        }
    }
    return dynamicImport;
})();

export default dynamicImport;