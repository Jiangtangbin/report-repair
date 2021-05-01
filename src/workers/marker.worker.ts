
type IconInfo = ({ image: string; originalSize: Size; size: Size; offset?: Size });
type Size = { width: number; height: number; };
type InstanceOption = { points: Map<string, PointOption>; numeric: Map<string, NumericOption>; labels: Map<string, { instance: any; }> };
type PointOption = { x: number; y: number; index: number; iconInfo: Required<IconInfo>; instance: any };
type NumericOption = { indexs: number[]; x: number; y: number; instance: any; } & Size;

type Datum = {
    x: number;
    y: number;
    index: number;
    space: number;
    width: number;
    height: number;
    iconInfo: Required<IconInfo>;
};
type Points = InstanceOption['points'];
type Numeric = InstanceOption['numeric'];

export default function markerCalc(data: Datum[]) {
    const points: Points = new Map();
    const numeric: Numeric = new Map();
    data.every(v => {
        const { x, y, index, space, width, height, iconInfo } = v;
        if (x < 0 || y < 0 || x > width || y > height) {
            return true;
        }
        let repeatObj = points.get(`${x}${y}`);
        if (!repeatObj) {
            points.forEach(pixel => {
                if (repeatObj) return;
                (Math.abs(pixel.x - x) <= space && Math.abs(pixel.y - y) <= space) && (repeatObj = pixel);
            });
        }
        // 标点重合时，保存重合标点信息
        if (repeatObj) {
            const { iconInfo: { size: { width, height }}, x, y } = repeatObj;
            const key = `${x}${y}-numeric`;
            let indexs = [repeatObj.index, index];
            if (numeric.has(key)) {
                const info = numeric.get(key)!;
                indexs = info.indexs.concat(index);
            }
            numeric.set(key, { indexs, instance: null, width, height, x, y });
            return true;
        }
        // 保存标点信息
        points.set(`${x}${y}`, { x, y, index, iconInfo, instance: null });
        return true;
    });

    return { points, numeric };
}