/**
 * marmotScriptService.js
 * @date: 2021-11-04
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_ADAPTOR } from '@/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag ? `${SRM_ADAPTOR}/v1/${organizationId}` : `${SRM_ADAPTOR}/v1`;
const debugUrlPre = tenantFlag ? `v1/${organizationId}` : `v1`;
// 默认值删除config中SRM_ADAPTOR的 / 符号。
// const SRM_ADAPTOR_PREFIX = SRM_ADAPTOR.split('/').join('');
/**
 * 保存脚本
 * @param {Object} params 保存脚本数据
 * @returns
 */
export async function saveScriptDataService(params) {
  return request(`${requestUrlPre}/adaptor-script/script-save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * debugger 脚本接口
 * @param {Object} params debugger参数
 * @returns
 */
export async function testScript(params) {
  const {
    inputEntityCode,
    outputEntityCode,
    scriptVersion,
    // bindRoutePrefix = SRM_ADAPTOR_PREFIX,
    debugTenantNum,
  } = params;
  // 3版本 ： 新的url
  // 2版本 ： 原来的url
  const url =
    // eslint-disable-next-line eqeqeq
    scriptVersion == 3
      ? `${SRM_ADAPTOR}/${debugUrlPre}/script-debug/run`
      : `${SRM_ADAPTOR}/v1/js-execute/js-test`;
  return request(url, {
    method: 'POST',
    body: params.body,
    query:
      scriptVersion === 3
        ? {
            inputEntityCode,
            outputEntityCode,
            debugTenantNum,
          }
        : {
            inputEntityCode,
            outputEntityCode,
            scriptVersion,
            debugTenantNum,
          },
  });
}

/**
 * !!!!暂时注释!!!!
 * 获取存储脚本
 * @param {String} params 获取脚本key
 * @returns
 */
// export async function getScriptDataService(params) {
//   return request(`${requestUrlPre}/adaptor-script/script/${params}`, {
//     method: 'GET',
//     responseType: 'text',
//   });
// }

/**
 * 添加、移出个人模板库
 * @param {Object} params {templateId(模板id String), hasStar(是否已经收藏标识  Boolean)}
 */
export async function templateLibraryService(params) {
  const { templateId } = params;
  return request(`${SRM_ADAPTOR}/v1/script-templates/star/${templateId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取model自动提示数组
 */
export async function getAutoModelService() {
  return request(`${SRM_ADAPTOR}/v1/adaptor-script/auto-model`, {
    method: 'GET',
    responseType: 'text',
  });
}
