/// <reference path="../interface/api/index.ts" />

import axios, { defaultAxios } from '@/axios/index';
import { Message } from 'view-design';
import { isNumber, isString, downLoadFile } from '@/utils/index';
import { i18n } from '@/locale/index';

const { location: { protocol, host }} = window;
const baseUrl = process.env.NODE_ENV === 'development' ? '/' : host.indexOf('besthai') !== -1 ? '//122.112.176.222:8558/apis/' : '/apis/';

// api 请求默认的地址
export default baseUrl;

// 上传地址
export const action =
    protocol === 'http:' ? '//upload-z2.qiniu.com/' : '//up-z2.qiniup.com';

// api 详情
export function getApiInfo(name: string) {
    return axios<API.Response['ApiInfo']>('api/index/getInfo', { params: { name }});
}

// 登录接口
export function login(data: API.Parameter['Login']) {
    return axios<API.Response['LoginInfo']>('user/user/login', { data, method: 'POST' });
}

// 退出登录
export function logout() {
    return axios('user/user/logout', { method: 'POST' });
}

// api 列表
export function getApiList() {
    return axios<API.Response['ApiList']>('api/index/index', { noTip: true });
}

// 安装包列表
export function getPackage(type?: API.Parameter['Package']['type']) {
    return axios<API.Response['Package']>('system/plugin/index', { params: { type }, noTip: true});
}

// 上传安装包
export function setPackage(data?: API.Parameter['SetPackage']) {
    return axios('system/plugin/uploadApk', { data, method: 'POST' });
}

// 刷新 token
export function freshToken() {
    return axios<API.Response['RefreshToken']>('user/user/freshToken', { method: 'POST', forbiddenAutoUpdateToken: true });
}

// 获取文件上传 token
export function getUpToken() {
    return axios<API.Response['UpToken']>('common/common/getUpToken', { noTip: true });
}

// 通过 token 获取用户信息
export function getUserThroughToken(token: string) {
    return axios<API.Response['LoginInfo']>('user/user/loginByToken', { method: 'POST', headers: { token }});
}

// 通过密钥获取用户信息
export function getUserThroughSecret(secret: string) {
    return axios<API.Response['LoginInfo']>('user/user/loginBySecret', { data: { secret }, method: 'POST' });
}

// 字典数据列表
export function getDicts(type?: string | number) {
    return axios<API.Response['Dict']>('system/system/getDict', { params: { type }, noTip: true });
}

// 菜单管理列表
export function getModule() {
    return axios<API.Response['getModule']>('system/auth/index', { noTip: true });
}

// 获取（根据菜单管理）树形列表
export function getModuleTree(module: string) {
    return axios<API.Response['getModuleTree']>('system/auth/getMenusByModule', { params: { module }, noTip: true});
}

// 设置菜单
export function setMenu(data: API.Parameter['SetMenu']) {
    return axios('system/auth/setMenu', { data, method: 'POST' });
}

// 获取菜单详情
export function getMenuInfo(id: number) {
    return axios<API.Response['getMenuInfo']>('system/auth/getMenu', { params: { id }});
}

// 删除菜单
export function delMenu(id: number) {
    return axios('system/auth/deleteMenu', { params: { id }});
}

// 操作记录列表
export function getOperationLog(params?: API.Parameter['OperationLog']) {
    return axios<API.Response['OperationLog']>('system/system/getOpList', { params, noTip: true });
}

// 角色管理列表
export function getRoleList(params: API.Parameter['RoleList']) {
    return axios<API.Response['RoleList']>('system/auth/getRoleList', { params, noTip: true });
}

// 设置角色
export function setRole(data: API.Parameter['setRole']) {
    return axios('system/auth/setRole', { data, method: 'POST' });
}

// 获取角色详情
export function getRoleInfo(id: number) {
    return axios<API.Response['RoleInfo']>('system/auth/getRoleDetail', { params: { id }});
}

// 删除角色
export function delRole(id: number) {
    return axios('system/auth/deleteRole', { params: { id }});
}

// 账号管理列表
export function getUserList(params: API.Parameter['UserList']) {
    return axios<API.Response['UserList']>('user/user/index', { params, noTip: true });
}

// 获取（根据客户管理）用户详细信息
export function getUserInfo(id: number) {
    return axios<API.Response['UserInfo']>('user/user/getUser', { params: { id }});
}

// 添加账号
export function setUserInfo(data: API.Parameter['SetUser']) {
    return axios('user/user/addUser', { data, method: 'POST' });
}

// 修改账号
export function editUserInfo(data: API.Parameter['editUser']) {
    return axios('user/user/editUser', { data, method: 'POST' });
}

// 禁用启用账号
export function forbiddenUser(data: API.Parameter['Forbidden']) {
    return axios('user/user/setUserStatus', { data, method: 'POST' });
}

// 更新账号信息
export function personalUpdate(data: API.Parameter['PersonalSettings']) {
    return axios('user/user/profile', { data, method: 'POST' });
}

// 设置账号权限
export function setUserAuth(data: API.Parameter['SetUserAuth']) {
    return axios('system/auth/setAuth', { data, method: 'POST' });
}

// 获取账号权限
export function getUserAuthInfo(id: number) {
    return axios<API.Response['UserAuthInfo']>('system/auth/getUserAuth', { params: { id }, noTip: true });
}

// 客户管理列表
export function getOrgList(params: API.Parameter['OrgList']) {
    return axios<API.Response['OrgList']>('user/org/index', { params, noTip: true });
}

// 设置客户
export function setOrg(data: API.Parameter['SetOrg']) {
    return axios('user/org/setOrg', { data, method: 'POST' });
}

// 删除客户
export function deleteOrg(id: number) {
    return axios('user/org/deleteOrg', { params: { id }});
}

// 获取客户详情
export function getOrgInfo(id: number) {
    return axios<API.Response['OrgInfo']>('user/org/getOrgInfo', { params: { id }});
}

// 设备管理列表
export function getDeviceList(params: API.Parameter['DeviceList']) {
    return axios<API.Response['DeviceList']>('device/device/index', { params, noTip: true });
}

// 修改设备
export function editDevice(data: API.Parameter['EditDevice']) {
    return axios('device/device/setDevice', { data, method: 'POST' });
}

// 获取设备详情
export function getDeviceInfo(id: number) {
    return axios<API.Response['DeviceInfo']>('device/device/getDevice', { params: { id }});
}

// 获取设备当前配置
export function getDeviceConfig(id: number) {
    return axios<API.Response['DeviceConfig']>('device/device/getDeviceNowConfig', { params: { id }});
}

// 删除设备
export function delDevice(id: number) {
    return axios('device/device/deleteDevice', { params: { id }});
}

// 获取设备分组列表
export function getDeviceGroupList(params: API.Parameter['DeviceGroupList']) {
    return axios<API.Response['DeviceGroupList']>('device/device/getDeviceGroupList', { params, noTip: true });
}

// 设置设备分组
export function setDeviceGroup(data: API.Parameter['SetDeviceGroup']) {
    return axios('device/device/setDeviceGroup', { data, method: 'POST' });
}

// 删除设备分组
export function delDeviceGroup(id: number) {
    return axios('device/device/deleteDeviceGroup', { params: { id }});
}

// 获取设备分组下的设备
export function getDeviceGroupDevices(id: number) {
    return axios<API.Response['DeviceGroupDevice']>('device/device/getDeviceByGroup', { params: { id }, noTip: true});
}

// 设置设备分组下的设备
export function batchAddDevice(params: API.Parameter['SetDeviceGroupDevice']) {
    return axios('device/device/device/device/setDeviceByGroup', { params, method: 'POST' });
}

// 获取文件仓库列表
export function getFileList(params: API.Parameter['FileList']) {
    return axios<API.Response['FileList']>('device/manage/getFileList', { params, noTip: true });
}

// 上传文件
export function uploadFile(data: API.Parameter['UploadFile']) {
    return axios('device/manage/uploadFile', { data, method: 'POST' });
}

// 删除文件
export function delectFile(id: number) {
    return axios('device/manage/deleteFile', { params: { id }});
}

// 获取配置列表
export function getConfigList(params: API.Parameter['ConfigList']) {
    return axios<API.Response['ConfigList']>('device/manage/getConfigList', { params, noTip: true });
}

// 设置配置
export function setConfig(data: API.Parameter['SetConfig']) {
    return axios('device/manage/setConfig', { data, method: 'POST' });
}

// 删除配置
export function delectConfig(id: number) {
    return axios('device/manage/deleteConfig', { params: { id }});
}

// 下发（配置、文件）到设备
export function setConfigOrFile(params: API.Parameter['ConfigOrFile']) {
    return axios<API.Response['DistributionLogList']>('device/manage/distributeToDevice', { params, noTip: true });
}

// 获取下发记录列表
export function getDistributionLogList(params: API.Parameter['DistributionLogList']) {
    return axios<API.Response['DistributionLogList']>('device/manage/getDistributeLog', { params, noTip: true });
}

// 获取下发结果
export function getDistributionInfo(id: number) {
    return axios<API.Response['DistributionInfo']>('device/manage/getDistributeResult', { params: { id }});
}

// 获取常用地址列表
export function getUsualAddressList(params: API.Parameter['UsualAddressList']) {
    return axios<API.Response['UsualAddressList']>('map/map/getMapAddressList', { params, noTip: true });
}

// 设置常用地址
export function setUsualAddressInfo(data: API.Parameter['UsualAddressInfo']) {
    return axios('map/map/setMapAddress', { data, method: 'POST' });
}

// 获取平面图管理列表
export function getPlanList(params: API.Parameter['PlanList']) {
    return axios<API.Response['PlanList']>('map/map/index', { params, noTip: true });
}

// 设置平面图
export function setPlanInfo(data: API.Parameter['SetPlan']) {
    return axios('map/map/setMap', { data, method: 'POST' });
}

// 删除平面图
export function delPlan(id: number) {
    return axios('map/map/deleteMap', { params: { id }});
}

// 获取平面图详情
export function getPlanFileInfo(id: number) {
    return axios<API.Response['PlanInfo']>('map/map/getMapDetail', { params: { id }});
}

// 获取离线地图的所有标点 type: d | f | p
export function getOfflineMarkers(map_id: number, type?: string) {
    return axios<API.Response['OfflineMarkers']>('map/map/getMarkers', { params: { map_id, type }});
}

// 平面图布点
export function planDistribution(data: API.Parameter['PlanDistribution']) {
    return axios('map/map/setMarker', { data, method: 'POST' });
}

// 删除平面图上的点
export function deletePlanPoint(params: { map_id: number, flag: string, marker_type: string }) {
    return axios('map/map/deleteMarker', { params });
}

// 获取离线地图树形
export function getOffLineTree() {
    return axios<API.Response['OffLineTree']>('map/map/getMapTree', { noTip: true });
}

// 删除常用地址
export function delUsualAddress(id: number) {
    return axios('map/map/deleteMapAddress', { params: { id }});
}