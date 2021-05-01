// 为 v-click-outside-x 做的声明
declare module 'v-click-outside-x';

// 为 vue-qr 做的声明
declare module 'vue-qr';

// 为 vue-echarts 做的声明
declare module 'vue-echarts';

// 为 vue-photo-preview 做的声明
declare module 'vue-photo-preview';

// 为 v-contextmenu 做的声明
declare module 'v-contextmenu';

// 为 ZRender 做的声明
declare module 'zrender';

// 为 vue-photo-preview 做的声明
declare module '@/utils/geoUtils' {
    export class GeoUtils {
        // 判断点是否在矩形内
        static isPointInRect(point: baiduMap['point'], bounds: baiduMap['point'][]): boolean;
        // 判断点是否在圆形内
        static isPointInCircle(point: baiduMap['point'], circle: baiduMap['circle']): boolean;
        // 判断点是否在折线上
        static isPointOnPolyline(point: baiduMap['point'], polyline: baiduMap['polyline']): boolean;
        // 判断点是否多边形内
        static isPointInPolygon(point: baiduMap['point'], polygon: baiduMap['polygon']): boolean;
        // 将度转化为弧度
        static degreeToRad(degree: number): number;
        // 将弧度转化为度
        static radToDegree(rad: number): number;
        // 将v值限定在a,b之间，纬度使用
        static _getRange(v: any, a: any, b: any): any;
        // 将v值限定在a,b之间，经度使用
        static _getLoop(v: any, a: any, b: any): any;
        // 计算两点之间的距离，两点坐标必须为经纬度
        static getDistance(point1: baiduMap['point'], point2: baiduMap['point']): number;
        // 计算折线或者点数组的长度
        static getPolylineDistance(polyline: baiduMap['point'][] | baiduMap['polyline']): number;
        // 计算多边形面或点数组构建图形的面积，注意：坐标类型只能是经纬度，且不适合计算自相交多边形的面积
        static getPolygonArea(polyline: baiduMap['point'][] | baiduMap['polygon']): number;
    }
}