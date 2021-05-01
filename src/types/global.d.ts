import { AxiosResponse } from 'axios';
import { CreateElement as VueCreateElement } from 'vue';

declare global {
    // 支持的语言
    type Language = 'zh-CN' | 'en-US';
    interface Window {
        BMap?: baiduMap['BMap'];
    }
    interface baiduMap {
        map: any;
        BMap: any;
        Pane: 'floatPane' | 'floatShadow' | 'markerPane' | 'markerMouseTarget' | 'labelPane' | 'mapPane';
        el: HTMLElement;
        point: {
            lng: number;
            lat: number;
        }
        circle: any;
        polyline: any;
        polygon: any;
        pixel: { x: number; y: number; }
        addressInfo: {
            address: string;
            point: baiduMap['point'];
            business: string;
            surroundingPois: any[];
            addressComponents: baiduMap['region'];
        }
        region: {
            streetNumber: string;
            street: string;
            district: string;
            city: string;
            province: string;
        }
        event: {
            point: baiduMap['point'];
            pixel: baiduMap['pixel'];
            map: baiduMap['map'];
            target: baiduMap['map'];
            BMap: baiduMap['BMap'];
            type: string;
        }
    }
    // ZRender 事件参数信息
    interface ZRender {
        event: {
            event: MouseEvent;
            type: string;
            stop: Function;
            offsetX: number;
            offsetY: number;
        }
    }
    type Dictionary<T> = { [key: string]: T };
    // 属性替换 -> Replace<{ a: number; b: boolean; }, { a: boolean }> => { a: boolean; b: boolean; }
    type Replace<T extends object, U extends object> = {
        [P in keyof T]: P extends keyof U ? U[P] : T[P];
    };
    // 属性删除 -> Remove<{ a: number; b: boolean; }, 'a'> => { b: boolean; }
    type Remove<T, U> = Pick<T, Exclude<keyof T, U>>
    // 获取函数中除首参外的值
    type Tail<T extends (...args: any[]) => void> = T extends ((a: any, ...args: infer T) => void) ? T : never;
    type CreateElement = VueCreateElement;
    // vuex 修改指定属性
    interface IAlterState<T, K extends keyof T> {
        key: K;
        value: T[K]
    }
    // axios 响应值
    interface IWholeResponse<T> extends AxiosResponse {
        data: IResponse<T>
    }
    // 后台返回的 response 值
    interface IOriginalResponse<T> {
        code: number;
        msg: string;
        data: T;
        status: boolean;
    }
    // 处理后的 response 值
    interface IResponse<T> extends IOriginalResponse<T> {
        type: string | undefined;
    }
}