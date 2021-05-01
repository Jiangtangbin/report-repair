// 自定义渲染可用事件列表
export const events = [
    'click',
    'mousedown',
    'mouseup',
    'mousewheel',
    'dblclick',
    'contextmenu',
    'mouseover',
    'mouseout',
];

// 地图标点
export const componentName: [RegExp, string][] = [
    [/^(d$|d-|alarm|control|sense|video|server|other)/, 'd'],
    [/^(o$|o-)/, 'o'],
    [/^(b$|b-)/, 'b'],
    [/^(ap$|ap-)/, 'ap'],
    [/^(f$|f-)/, 'f'],
    [/^(p$|p-)/, 'p'],
    [/^(mp$|mp-)/, 'mp'],
    [/^(rk$|rk-)/, 'rk'],
    [/^(dj$|dj-)/, 'dj'],
    [/^(gd$|gd-)/, 'gd'],
    [/^(jg$|jg-)/, 'jg'],
    [/^(rk$|rk-|dy|dy-)/, 'rk'],
    [/^(wg$|wg-)/, 'wg'],
];

// 传感器数据的别名
export const senseAlias = {
    1: 'wsSense',
    4: 'wsTransmitter',
    5: 'swTransmitter',
    6: 'wsgTransmitter',
    7: 'wsfTransmitter',
    8: 'gTransmitter',
    9: 'wsCollector',
    10: 'dqylTransmitter',
    11: 'fsTransmitter',
    12: 'fxTransmitter',
    13: 'fdsRain',
    14: 'ylTransmitter',
    15: 'trsfSense',
    16: 'trsywTransmitter',
    17: 'CODSense',
    18: 'dcFlow',
    19: 'dxjl',
    20: 'sxjl',
    21: 'dxaq',
    22: 'sxaq',
    24: 'zsTransmitter',
    25: 'ammeter',
    26: 'electricalProbe',
};

// 设备设施单位等的 svg 图标映射
export const icon = {
    o: 'unit',
    p: 'targetPoint',
    person: 'person',
    video: 'file-video-o',
    sense: 'sense-slide',
    control: 'sxaq',
    server: 'VCR',
    unclassified: 'pattern',
    alarm: 'alarm',
    computer: 'computed',
    mobile: 'mobile-custom',
    videoin: 'video-in',
    videoout: 'video-out',
    audioin: 'audio-in',
    audioout: 'audio-out',
    temperature: 'thermometer-3',
    humidity: 'water-drop',
    pm: 'pm',
    cms: 'cms',
    pressure: 'circle-press',
    elebox: 'circle-press',
    convergence: 'sense-slide',
    switch: 'power-off',
    level: 'line-amount',
    gateway: 'transfe',
    matrix: 'VCR',
    nothing: 'four-round-rect',
    nblock: 'door-lock',
    nbsmoke: 'smoke',
    smoke: 'smoke',
    welllid: 'well-lid',
    law: 'recorder',
    alarmserver: 'computer-fire',
    1: 'facility',
    2: 'extinguisher',
    3: 'water-hose',
    4: 'crandall',
    5: 'sandpile',
    // 这个是传感器类型的 -> 取的别名(数字跟消防设施类型起冲突了)
    wsSense: 'wsSense',
    wsTransmitter: 'wsTransmitter',
    swTransmitter: 'swTransmitter',
    wsgTransmitter: 'wsgTransmitter',
    wsfTransmitter: 'wsfTransmitter',
    gTransmitter: 'gTransmitter',
    wsCollector: 'wsCollector',
    dqylTransmitter: 'dqylTransmitter',
    fsTransmitter: 'fsTransmitter',
    fxTransmitter: 'fxTransmitter',
    fdsRain: 'fdsRain',
    ylTransmitter: 'ylTransmitter',
    trsfSense: 'trsfSense',
    trsywTransmitter: 'trsywTransmitter',
    CODSense: 'CODSense',
    dcFlow: 'dcFlow',
    dxjl: 'dxjl',
    sxjl: 'sxjl',
    dxaq: 'dxaq',
    sxaq: 'sxaq',
    zsTransmitter: 'zsTransmitter',
    probe: 'probe',
    ammeter: 'ammeter',
    electricalProbe: 'electricalProbe',
};

// marker 的 label 通用配置
export const markerLabelOpts = {
    offset: {
        width: 28,
        height: 2,
    },
    labelStyle: {
        backgroundColor: 'rgba(41, 70, 144, 0.5)',
        borderRadius: '5px',
        padding: '4px 10px',
        border: '1px solid rgba(0, 204, 255, 0.3)',
        boxShadow: '0px 0px 33px 2px rgba(0, 234, 255, 0.3) inset',
        color: 'white',
    },
};

// 标点的右键菜单项
export const markerRightMenu = (() => {
    const fields = {
        // 消警
        clearAlarm: {
            title: 'h.map.rightMenu.clearAlarm',
            value: 'clearAlarm',
            require: 'isalarm',
            icon: 'microphone-line-off',
        },
        // 报警日志
        alarmLog: {
            title: 'h.map.rightMenu.alarmLog',
            value: 'alarmLog',
            require: 'isalarm',
            icon: 'tasks',
        },
        // 移动标点
        move: {
            title: 'h.map.rightMenu.move',
            value: 'dragging',
        },
        delete: {
            title: 'h.tableButton.delete',
            value: 'delete',
        },
        // 详情
        details: {
            title: 'h.map.rightMenu.details',
            value: 'details',
            icon: 'circle-i',
        },
        // 监测点模板
        monitor: {
            title: 'h.map.rightMenu.monitor',
            value: 'monitor',
            icon: 'template',
        },
        // 立体图
        enterStereo: {
            title: 'h.map.rightMenu.enterStereo',
            value: 'enterStereo',
            icon: 'put-in',
        },
        // 通讯
        talk: {
            title: 'h.map.rightMenu.d.talk',
            value: 'computer',
            require: 'isonline',
            icon: 'microphone-refresh-line',
        },
        // 视频输入
        videoin: {
            title: 'h.map.rightMenu.d.videoin',
            value: 'videoin',
            require: 'isonline',
            icon: 'circle-triangle',
        },
        // 视频输出
        videoout: {
            title: 'h.map.rightMenu.d.videoout',
            value: 'videoout',
            require: 'isonline',
            icon: 'video-out-line',
        },
        // 视频输入
        audioin: {
            title: 'h.map.rightMenu.d.audioin',
            value: 'audioin',
            require: 'isonline',
            icon: 'microphone-line',
        },
        // 视频输出
        audioout: {
            title: 'h.map.rightMenu.d.audioout',
            value: 'audioout',
            require: 'isonline',
            icon: 'audio-out-line',
        },
        // 查看传感器数据
        sense: {
            title: 'h.map.rightMenu.d.sense',
            value: 'sense',
            icon: 'bar-line',
        },
        // 设置传感器
        setSense: {
            title: 'h.map.rightMenu.d.setSense',
            value: 'setSense',
            icon: 'setSense',
        },
        // 设置开关控制
        setSwitch: {
            title: 'h.map.rightMenu.d.setSwitch',
            value: 'setSwitch',
            require: 'isonline',
            icon: 'switch',
        },
        // 设置级数控制
        setLevel: {
            title: 'h.map.rightMenu.d.setLevel',
            value: 'setLevel',
            require: 'isonline',
            icon: 'stream-line',
        },
        // 视音频对讲
        talkAndVideo: {
            title: 'h.map.rightMenu.d.talkAndVideo',
            value: 'server',
            require: 'isonline',
            icon: 'microphone-refresh-line',
        },
        // 设置灵敏度, 烟感等参数
        setOptions: {
            title: 'h.map.rightMenu.d.setOptions',
            value: 'setOptions',
            require: 'isonline',
            icon: 'stream-line',
        },
        // 设置灵敏度, 烟感等参数
        setOptions2: {
            title: 'h.map.rightMenu.d.setOptions2',
            value: 'setOptions',
            require: 'isonline',
            icon: 'stream-line',
        },
        // 出入记录
        inOut: {
            title: 'h.map.rightMenu.d.inOut',
            value: 'inOut',
            icon: 'list',
        },
        // 实时轨迹
        realtimeTrack: {
            title: 'h.map.rightMenu.realtimeTrack',
            value: 'onlineLocation',
            require: 'isonline',
            icon: 'trace',
        },
        // 历史轨迹
        historyTrack: {
            title: 'h.map.rightMenu.historyTrack',
            value: 'historyLocation',
            icon: 'history-trace',
        },
        // 发送短信
        sendSMS: {
            title: 'h.map.rightMenu.sendSMS',
            value: 'sendSMS',
            require: 'isonline',
            requireValue: 0,
            icon: 'evil-triangle',
        },
    };
    const normal = [fields.delete, fields.move, fields.details, fields.clearAlarm, fields.alarmLog];

    return {
        map: [
            {
                title: 'h.map.rightMenu.map.addUsualAddress',
                value: 'addUsualAddress',
            },
            {
                title: 'h.map.rightMenu.map.historyTrace',
                value: 'historyTrace',
            },
            {
                title: 'h.map.rightMenu.map.nearby',
                value: 'nearby',
            },
            {
                title: 'h.map.rightMenu.map.circle',
                value: 'circle',
            },
            {
                title: 'h.map.rightMenu.map.rect',
                value: 'rect',
            },
            {
                title: 'h.map.rightMenu.map.clearRect',
                value: 'clearRect',
            },
            {
                title: 'h.map.rightMenu.map.getContrastRecord',
                value: 'getContrastRecord',
            },
            {
                title: 'h.map.rightMenu.map.copyPoint',
                value: 'copyPoint',
            },
        ],
        o: [
            {
                title: 'h.map.rightMenu.details',
                value: 'details',
                icon: 'circle-i',
            },
            {
                title: 'h.map.rightMenu.clearAlarm',
                value: 'clearAlarm',
                require: 'isalarm',
                icon: 'microphone-line-off',
            },
            {
                title: 'h.map.rightMenu.alarmLog',
                value: 'alarmLog',
                require: 'isalarm',
                icon: 'tasks',
            },
        ],
        m: [
            {
                title: 'h.map.rightMenu.move',
                value: 'dragging',
            },
            {
                title: 'h.map.rightMenu.plan',
                value: 'seePlan',
                icon: 'eye-line',
            },
        ],
        d: {
            person: {
                computer: [fields.move, fields.talk, fields.details],
                mobile: [fields.talk, fields.realtimeTrack, fields.historyTrack, fields.sendSMS, fields.details],
            },
            video: {
                videoin: [fields.delete, fields.move, fields.videoin, fields.details, fields.clearAlarm, fields.alarmLog],
                videoout: [fields.delete, fields.move, fields.videoout, fields.details, fields.clearAlarm, fields.alarmLog],
                audioin: [fields.delete, fields.move, fields.audioin, fields.details, fields.clearAlarm, fields.alarmLog],
                audioout: [fields.delete, fields.move, fields.audioout, fields.details, fields.clearAlarm, fields.alarmLog],
                law: [fields.delete, fields.move, fields.talk, fields.videoin, fields.realtimeTrack, fields.historyTrack, fields.details, fields.clearAlarm, fields.alarmLog],
                default: normal,
            },
            sense: [fields.delete, fields.move, fields.sense, fields.setSense, fields.details, fields.clearAlarm, fields.alarmLog],
            control: {
                switch: [fields.delete, fields.move, fields.setSwitch, fields.details, fields.clearAlarm, fields.alarmLog],
                level: [fields.delete, fields.move, fields.setLevel, fields.details, fields.clearAlarm, fields.alarmLog],
                default: normal,
            },
            server: [fields.delete, fields.move, fields.talkAndVideo, fields.details, fields.clearAlarm, fields.alarmLog],
            alarm: {
                smoke: [fields.delete, fields.move, fields.setOptions, fields.details, fields.clearAlarm, fields.alarmLog],
                welllid: [fields.delete, fields.move, fields.setOptions2, fields.details, fields.clearAlarm, fields.alarmLog],
                default: normal,
            },
            other: {
                gps: [fields.delete, fields.move, fields.realtimeTrack, fields.historyTrack, fields.clearAlarm, fields.details],
                entranceguard: [fields.delete, fields.move, fields.inOut, fields.details, fields.clearAlarm, fields.alarmLog],
                roadgate: [fields.delete, fields.move, fields.inOut, fields.details, fields.clearAlarm, fields.alarmLog],
                default: normal,
            },
            default: normal,
        },
        f: [fields.delete, fields.move, fields.details, fields.clearAlarm, fields.alarmLog],
        p: [fields.delete, fields.move, fields.details, fields.clearAlarm, fields.alarmLog],
        // 警点
        ap: [fields.details, fields.clearAlarm, fields.alarmLog],
        // 监测点
        mp: [fields.delete, fields.move, fields.monitor, fields.details, fields.clearAlarm, fields.alarmLog],
        // 楼栋
        b: [fields.clearAlarm, fields.details],
        lk: [fields.enterStereo],
    };
})();

// 图标大小
export const size = {
    width: 22,
    space: 0,
    height: 30,
};

// 原始图片大小
export const originalSize = {
    width: size.width * 2,
    height: size.height * 88,
};

// 地图上图标对应的 X, Y 点 -> 图片最大为 87(此值动态更新) 从 0 开始计算, 数量应自增一
export const iconY = {
    computer: 1,
    mobile: 2,
    videoin: 4,
    videoout: 3,
    audioin: 6,
    audioout: 5,
    temperature: 7,
    humidity: 8,
    'pm': 9,
    'pm1.0': 9,
    'pm2.0': 10,
    'pm2.5': 10,
    'pm10': 11,
    pressure: 12,
    elebox: 12,
    convergence: 13,
    switchout: 14,
    switchin: 14,
    levelout: 15,
    levelin: 15,
    gateway: 16,
    matrix: 17,
    // 数字是代表消防设施类型
    1: 18,
    2: 19,
    3: 20,
    4: 21,
    5: 49,
    8: 64,
    9: 79,
    10: 80,
    11: 81,
    12: 82,
    13: 83,
    14: 84,
    15: 85,
    p: 22,
    o: 23,
    m: 24,
    ap: 50,
    mp: 51,
    b: 52,
    lk: 56,
    analyze: 57,
    truck: 58,
    welllid: 59,
    law: 60,
    // 这个是传感器类型的 -> 取的别名（数字跟消防设施类型起冲突了）
    wsSense: 25,
    wsTransmitter: 26,
    swTransmitter: 27,
    wsgTransmitter: 28,
    wsfTransmitter: 29,
    gTransmitter: 30,
    wsCollector: 31,
    dqylTransmitter: 32,
    fsTransmitter: 33,
    fxTransmitter: 34,
    fdsRain: 35,
    ylTransmitter: 36,
    trsfSense: 37,
    trsywTransmitter: 38,
    CODSense: 39,
    dcFlow: 40,
    dxjl: 41,
    sxjl: 42,
    dxaq: 43,
    sxaq: 44,
    zsTransmitter: 45,
    alarmserver: 46,
    nblock: 47,
    smoke: 48,
    probe: 55,
    ammeter: 53,
    electricalProbe: 54,
    cms: 61,
    rk: 62,
    charging: 63,
    roadgate: 65, // 道闸
    manual: 66,
    entranceguard: 67,
    bjg: 23,
    xz: 68,
    xf: 69,
    wb: 70,
    pt: 71,
    xfz: 72,
    wg: 73,
    cause: 86,
    // lk: 74,
    zh: 75,
    hb: 76,
    jg: 77,
    gas: 78,
    gps: 87,
};
export const iconX = {
    normal: 0,
    warning: 1,
    alarm: 0,
    0: 1,
    1: 0,
};
Object.keys(iconX).forEach(key => {
    iconX[key as 'alarm'] *= (size.width + size.space);
});
Object.keys(iconY).forEach(key => {
    iconY[key as 'pm'] *= (size.height + size.space);
});

// 标点轨迹的颜色
export const traceColors = ['#87cefa', '#82ca99', '#f4ee71', '#c790b9', '#f69a71', '#7cc623', '#dd549e', '#0088ed'];

// 管道的颜色
export const pipelineColors = {
    pw/* 排水排污 */: '#8956b9',
    js/* 给水供水 */: '#23a0f8',
    rq/* 石油燃气 */: '#d56152',
    tx/* 通讯电缆 */: '#198e8b',
    gr/* 供热 */: '#d17d33',
    ws/* 污水 */: '#ff344c',
    ys/* 雨水 */: '#2fc974',
    normal/* 正常 */: '#2fc974',
    delay/* 漏检 */: '#ffff00',
    alarm/* 报警 */: '#ff344c',
    unknown/* 未知 */: '#d1cd33',
};

// 井盖的 svg 图标
export const sewerCoverIcon = {
    ws: 'point-green',
    ys: 'point-red',
    normal/* 正常 */: 'point-green',
    delay/* 漏检 */: 'point-yellow',
    alarm/* 报警 */: 'point-red',
};

// 监测点水质类型颜色
export const qualityColor = ['#808080', '#0C28FF', '#3184FF', '#5AC918', '#DFD700', '#FF9D10', '#F50C0E'];

// 监测点水质类型
export const qualityType = [0, 'I', 'II', 'Ⅲ', 'Ⅳ', 'Ⅴ', '劣V'];

/**
 * @description: 离线地图展示范围
 * @param {Object} center: 离线地图中点
 * @param {Object} bounds: 图片展示范围
 * @param {Object} areaBounds: 拖拽范围
 */
export const offlinePosition = {
    center: { lng: 112.964047, lat: 28.201596 },
    // 中心点：义乌市。sw: lng 对应 width 与 left，lat 对应 height，ne: lng 对应 width，lat 对应 top
    bounds: { sw: { lng: 119.98594, lat: 29.26477 }, ne: { lng: 120.17702, lat: 29.35910 }},
    areaBounds: { sw: { lng: 112.917488, lat: 28.176269 }, ne: { lng: 113.009043, lat: 28.226185 }},
    minZoom: 15,
    maxZoom: 19,
    putPointZoom: 13,
    zoom: 14,
};

/**
 * @description: 不需要底图时设置的 JSON 样式，需规定最大的缩放级别，防止出现地面小箭头
 * @param {String} color: 十六进制颜色 -> 设置的地图背景色 #F3F1EC
 */
export const customJSON = (color = '#102158') => [
    {
        featureType: 'land',
        elementType: 'all',
        stylers: {
            color,
        },
    },
    {
        featureType: 'water',
        elementType: 'all',
        stylers: {
            color,
        },
    },
    {
        featureType: 'administrative',
        elementType: 'all',
        stylers: {
            visibility: 'off',
        },
    },
    {
        featureType: 'poilabel',
        elementType: 'all',
        stylers: {
            visibility: 'off',
        },
    },
    {
        featureType: 'road',
        elementType: 'all',
        stylers: {
            visibility: 'off',
        },
    },
    {
        featureType: 'green',
        elementType: 'all',
        stylers: {
            visibility: 'off',
        },
    },
    {
        featureType: 'manmade',
        elementType: 'all',
        stylers: {
            visibility: 'off',
        },
    },
    {
        featureType: 'building',
        elementType: 'all',
        stylers: {
            visibility: 'off',
        },
    },
];

/**
 * @description: 自定义在线地图样式
 */
export const customOnJSON = () => [
    {
        featureType: 'all',
        elementType: 'geometry',
        stylers: {
            color: '#042656ff',
        },
    },
    {
        featureType: 'land',
        elementType: 'geometry',
        stylers: {
            color: '#04316Cff',
        },
    }, 
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: {
            color: '#4487D8ff',
        },
    },
    {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: {
            color: '#031B3Bff',
        },
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: {
            color: '#1B497Dff',
        },
    }, 
    {
        featureType: 'districtlabel',
        elementType: 'labels.text.fill',
        stylers: {
            color: '#d69563ff',
        },
    },
    {
        featureType: 'districtlabel',
        elementType: 'labels.text.stroke',
        stylers: {
            color: '#17263cff',
        },
    }, {
        featureType: 'poilabel',
        elementType: 'labels.text.fill',
        stylers: {
            color: '#ffffffff',
        },
    }, {
        featureType: 'poilabel',
        elementType: 'labels.text.stroke',
        stylers: {
            color: '#17263cff',
        },
    },
];