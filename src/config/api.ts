/// <reference path="../interface/api/index.ts" />

import axios from '@/axios/index';

const { location: { host }} = window;
const baseUrl = process.env.NODE_ENV === 'development' ? '/' : host.indexOf('besthai') !== -1 ? '//122.112.176.222:8558/apis/' : '/apis/';

// api 请求默认的地址
export default baseUrl;

// 登录接口
export function login(data: API.Parameter['Login']) {
    return axios<API.Response['LoginInfo']>('common/common/login', { data, method: 'POST' });
}

// 刷新 token
export function freshToken() {
    return axios<API.Response['RefreshToken']>('common/common/freshToken', { method: 'POST', forbiddenAutoUpdateToken: true });
}

// 获取图形验证码
export function getGraphicCode(mobile: API.Parameter['GraphicCode']) {
    return axios('common/common/getImgCode', { params: { mobile }});
}

// 发送短信验证码
export function sendSMSCode(data: API.Parameter['SMSCode']) {
    return axios('common/common/getSmsCode', { data, method: 'POST' });
}

// 修改密码
export function updatePassword(data: API.Parameter['UpdatePassword']) {
    return axios('common/common/modifyPassword', { data, method: 'POST' });
}

// 字典数据列表
export function getDicts(type?: string | number) {
    return axios<API.Response['Dict']>('system/base/getDict', { params: { type }, noTip: true });
}

// 获取角色下拉框
export function getRuleSelect() {
    return axios<API.Response['Rule']>('system/base/getRoleSelect', { noTip: true });
}

// 获取市区树形
export function getCityAreaTree() {
    return axios<API.Response['CityArea']>('system/base/getAreaTree', { noTip: true });
}

// 获取工单类型和服务 / 故障类型的树形
export function getWorkServiceFault() {
    return axios<API.Response['WorkServiceFault']>('system/base/getCateGoryTree', { noTip: true });
}

// 上传文件
export function uploadFile(data: API.Parameter['UploadFile']) {
    return axios('system/base/uploadFile', { data, method: 'POST' });
}

// 获取客户列表
export function getOrgList(params: API.Parameter['OrgList']) {
    return axios<API.Response['OrgList']>('system/user/getOrgList', { params, noTip: true });
}

// 获取客户详情
export function getOrgInfo(id: number) {
    return axios<API.Response['OrgInfo']>('system/user/getOrgDetail', { params: { id }});
}

// 设置客户
export function setOrg(data: API.Parameter['SetOrg']) {
    return axios('system/user/setOrg', { data, method: 'POST' });
}

// 删除客户
export function deleteOrg(id: number) {
    return axios('system/user/deleteOrg', { params: { id }});
}

// 账号列表
export function getUserList(params: API.Parameter['UserList']) {
    return axios<API.Response['UserList']>('system/user/getUserList', { params, noTip: true });
}

// 获取账号详情
export function getUserInfo(id: number) {
    return axios<API.Response['UserInfo']>('system/user/getUserDetail', { params: { id }});
}

// 添加账号
export function setUserInfo(data: API.Parameter['SetUser']) {
    return axios('system/user/setUser', { data, method: 'POST' });
}

// 启用禁用账号
export function forbiddenUser(data: API.Parameter['Forbidden']) {
    return axios('system/user/setUserStatus', { data, method: 'POST' });
}

// 解绑账号微信
export function unbundlingWx(id: number){
    return axios('system/user/unbindUserWx', { params: { id }, method: 'POST' });
}

// 个人设置
export function personalSetting(data: API.Parameter['PersonalSetting']) {
    return axios('system/user/profile', { data, method: 'POST' });
}

// 获取绑定微信的二维码
export function getQRCodeUrl() {
    return axios<API.Response['QRCodeUrl']>('system/user/getBindQrcode', { noTip: true });
}

// 获取用户微信信息
export function getUserWxInfo() {
    return axios<API.Response['UserWxInfo']>('system/user/getUserWxInfo', { noTip: true });
}

// 获取图形验证码
export function getPrivateGraphicCode() {
    return axios('system/user/getImgCode');
}

// 发送短信验证码
export function privateSendSMSCode(data: API.Parameter['SMSCode']) {
    return axios('system/user/getSmsCode', { data, method: 'POST' });
}

// 修改密码或手机号码
export function updatePasswordMobile(data: API.Parameter['UpdatePasswordMobile']) {
    return axios('system/user/modifyPasswordOrMobile', { data, method: 'POST' });
}

// 操作记录列表
export function getOperationLog(params?: API.Parameter['OperationLog']) {
    return axios<API.Response['OperationLog']>('system/user/getOpList', { params, noTip: true });
}

// 工单池列表
export function getWorkPoolList(params: API.Parameter['WorkPoolList']) {
    return axios<API.Response['WorkPoolList']>('system/work/getPoolList', { params, noTip: true });
}

// 工单列表
export function getWorkList(params: API.Parameter['WorkList']) {
    return axios<API.Response['WorkList']>('system/work/getWorkList', { params, noTip: true  });
}

// 工单详情
export function getWorkInfo(id: number) {
    return axios<API.Response['WorkInfo']>('system/work/getWorkDetail', { params: { id }});
}

// 生成工单
export function createWork(data: API.Parameter['CreateWork']) {
    return axios('system/work/createWork', { data, method: 'POST' });
}

// 派发工单
export function distributionWork(data: API.Parameter['DistributionWork']) {
    return axios('system/work/sendWork', { data, method: 'POST' });
}

// 领取工单
export function receiveWork(data: API.Parameter['ReceiveWork']) {
    return axios('system/work/acceptWork', { data });
}

// 回单
export function replyWork(data: API.Parameter['ReplyWork']) {
    return axios('system/work/replyWork', { data, method: 'POST' });
}

// 评价
export function appraise(data: API.Parameter['Appraise']) {
    return axios('system/work/pj', { data, method: 'POST' });
}

// 知识库列表
export function getKnowledgeBaseList(params: API.Parameter['KnowledgeBaseList']) {
    return axios<API.Response['KnowledgeBaseList']>('system/other/getKnowledgeList', { params, noTip: true });
}

// 知识库详情
export function getKnowledgeBaseInfo(id: number) {
    return axios<API.Response['KnowledgeBaseInfo']>('system/other/getKnowledgeDetail', { params: { id }});
}

// 设置知识库
export function setKnowledgeBase(data: API.Parameter['SetKnowledgeBase']) {
    return axios('system/other/setKnowledge', { data, method: 'POST' });
}

// 删除知识库
export function deleteKnowledgeBase(id: number) {
    return axios('system/other/deleteKnowledge', { params: { id }});
}

// 公告列表
export function getNoticeList(params: API.Parameter['NoticeList']) {
    return axios<API.Response['NoticeList']>('system/other/getNoticeList', { params, noTip: true });
}

// 公告详情
export function getNoticeInfo(id: number) {
    return axios<API.Response['NoticeInfo']>('system/other/getNoticeDetail', { params: { id }});
}

// 设置公告
export function setNotice(data: API.Parameter['SetNotice']) {
    return axios('system/other/setNotice', { data, method: 'POST' });
}

// 删除公告
export function deleteNotice(id: number) {
    return axios('system/other/deleteNotice', { params: { id }});
}

// 发布公告
export function publishNotice(data: API.Parameter['PublishNotice']) {
    return axios('system/other/publishNotice', { data, method: 'POST' });
}

// 地图运维
export function mapOperation() {
    return axios<API.Response['MapOperation']>('system/other/getMapChart');
}

// 获取客户总览
export function getOrgOverView() {
    return axios<API.Response['OrgOverView']>('system/other/getOrgOverView');
}
