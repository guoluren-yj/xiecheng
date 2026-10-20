// 维护业务对象接口
// import { lowcodeRequest as request } from '@/utils/lowcodeRequest'; // 权限的APPID添加
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

/**
 * api url - 服务埋点列表
 * */
export const getScriptPageUrl = `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/service-points`;

/**
 * api url - 服务埋点脚本列表
 * */
export const getServicePointsUrl = `${lowcodeOrganizationURL({
  route: HZERO_HMDE,
})}/service-points/script`;

/**
 * api url - 服务埋点脚本明细
 * */
export const getScriptDetailUrl = `${lowcodeOrganizationURL({
  route: HZERO_HMDE,
})}/service-points/script`;

/**
 * api url - 服务埋点脚本的出入参
 * */
export const getScripParamUrl = `${lowcodeOrganizationURL({
  route: HZERO_HMDE,
})}/service-points/script/param`;

/**
 * api url - 服务埋点脚本历史记录
 * */
export const getScripRecordUrl = `${lowcodeOrganizationURL({
  route: HZERO_HMDE,
})}/service-points/script/record`;

/**
 * 创建或修改服务埋点
 * */
export const saveScriptPageUrl = {
  url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/service-points`,
  method: 'POST',
} as const;

/**
 * 创建或修改服务埋点
 * */
export const createScriptPageUrl = {
  url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/service-points/script`,
  method: 'POST',
} as const;

/**
 * 禁用服务埋点
 * */
export const enableScriptUtilityService = {
  url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/service-points/script/disable`,
  method: 'POST',
  response: null,
} as const;

/**
 * 删除服务埋点
 * */
export const deleteScriptUtilityService = {
  url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/service-points/script`,
  method: 'DELETE',
  response: null,
} as const;
