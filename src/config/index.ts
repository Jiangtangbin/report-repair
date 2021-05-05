// 百度地图密钥
export const BMapAk = process.env.NODE_ENV === 'development' ? 'mbsF0g38k1KNfoUjFIjELtjLvCG46pul' : 'TwMZnwR2iMlevT7aolQZINTrMAkm5qoZ';

// 当前登录的用户
export const currentUserKey = 'currentUser';

// vuex 存储的 key
export const storeKey = 'vuex';

// vuex 存储过期时间的 key
export const staleDatedKey = 'timestamp';

// vuex 过期时间
export const staleDatedTime: undefined | number = undefined;

// vuex 存储的类型
export const storeType = 'sessionStorage';

// 地图存储的类型
export const mapStoragePrefix = 'map-3-';

// 视音频允许上传的最大大小
export const maxSize = 30 * 1024;

// 禁用今天以前的日期
export const disabledBeforeToday = (date: Date) => date && date.valueOf() < Date.now() - 86400000;

// 禁用今天往后的日期
export const disabledAfterToday = (date: Date) => date && date.valueOf() > Date.now();

// 图片格式
export const imgFormat = ['jpg', 'jpeg', 'bmp', 'eps', 'gif', 'mif', 'miff', 'png', 'tif', 'tiff', 'svg', 'wmf'];

// 音频格式
export const audioFormat = ['mp3', 'mpeg', 'aac', 'wav', 'wma', 'cda', 'flac', 'm4a', 'mid', 'mka', 'mp2', 'mpa', 'mpc', 'ape', 'ofr', 'ogg', 'ra', 'wv', 'tta', 'ac3', 'dts'];

// 视频格式
export const videoFormat = ['avi', 'asf', 'wmv', 'avs', 'flv', 'mkv', 'mov', '3gp', 'mp4', 'mpg', 'mpeg', 'dat', 'ogm', 'vob', 'rm', 'rmvb', 'ts', 'tp', 'ifo', 'nsv'];

// 轮询查询数据间隔时间
export const pollingTime = 60000;

// 轮询查询数据间隔时间
export const devicePollingTime = 60000;

// 会议记录模板
export const conferenceMessageTemp = {
    start: '<%= op %> 开启了会议',
    d_invite: '<%= op %> 邀请了设备 <%= obj %>',
    d_delete: '<%= op %> 踢除了设备 <%= obj %>',
    a_set: '<%= op %> 设置 <%= obj %> 为管理员',
    a_unset: '<%= op %> 取消 <%= obj %> 的管理员身份',
    d_in: '<%= obj %> 进入会议',
    d_out: '<%= obj %> 退出会议',
    d_apply: '<%= obj %> 申请加入会议',
    d_agree: '<%= op %> 同意 <%= obj %> 加入会议',
    d_reject: '<%= op %> 拒绝 <%= obj %> 加入会议',
    s_apply: '<%= obj %> 申请发言',
    s_appoint: '<%= op %> 指定 <%= obj %> 发言',
    s_agree: '<%= op %> 同意 <%= obj %> 发言',
    s_reject: '<%= op %> 拒绝 <%= obj %> 发言',
    stop: '<%= op %> 结束了会议',
};

// 地图菜单图标映射，彩色
export const coloursIcon = {
    o: 'colours-unit',
    d: 'colours-device',
};

// 地图标点 -> alias 的作用在于给地图
// 右键附近资源的下拉项标题提供校准作用
export const pointType = {
    d: {
        title: 'h.modal.titles.device',
        icon: 'sense_two',
    },
} as const;