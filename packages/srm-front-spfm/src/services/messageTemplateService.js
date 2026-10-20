/**
 * service - 消息服务
 * @date: 2018-9-29
 * @version: 1.0.0
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { parseParameters } from 'utils/utils';
import request from 'utils/request';
import { HZERO_IAM } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_PLATFORM}/v1`;

/**
 * 查询消息模板列表数据
 * @async
 * @function searchList
 * @param {object} params - 查询条件
 * @param {!number} param.tenantId - 租户Id
 * @param {?string} params.templateCode - 消息模板编码
 * @param {?string} params.templateName - 消息模板名称
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */

export async function searchList(params) {
  const param = parseParameters(params);
  return request(`${prefix}/srm-message/templates`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询消息模板Id查询消息模板
 * @async
 * @function searchTemplate
 * @param {string} params.tempalteId - 消息模板ID
 */
export async function searchTemplate(params) {
  return request(`${prefix}/srm-message/templates/${params.templateId}`, {
    method: 'GET',
  });
}
/**
 * 查询消息模板明细
 * @async
 * @function searchDetail
 * @param {object} params - 查询条件
 * @param {?string} params.templateId - 消息模板Id
 * @returns {object} fetch Promise
 */
export async function searchDetail(params) {
  return request(`${prefix}/srm-message/${params.templateId}/template-detail`, {
    method: 'GET',
  });
}
/**
 * 创建消息模板
 * @async
 * @function saveTemplate
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function saveTemplate(params) {
  return request(`${prefix}/srm-message/templates`, {
    method: 'POST',
    body: { ...params },
  });
}
/**
 * 更新消息模板明细
 * @async
 * @function updateDetail
 * @param {object} params
 * /v1/srm-message/{templateId}/template-detail
 */
export async function updateDetail(params) {
  const { detail, templateId } = params;
  return request(`${prefix}/srm-message/${templateId}/template-detail`, {
    method: 'POST',
    body: [...detail],
  });
}
/**
 * 查询系统支持的语言数据
 * @async
 * @function queryLanguageData
 * @returns fetch Promise
 */
export async function queryLanguageData() {
  return request(`${HZERO_IAM}/v1/languages/list`, {
    method: 'GET',
  });
}

/**
 * 数据转换
 */
export function parseData(data, typeList) {
  const source = {};
  for (let i = 0; i < typeList.length; i++) {
    const temp = data.filter(item => item.templateTypeCode === typeList[i]); // 过滤后的内容
    const target = temp[0];
    const masterContent = {};
    let otherProps = {};
    for (let j = 0; j < temp.length; j++) {
      const item = temp[j];
      const { lang, languageName, sqlValue, templateTitle, templateContent, ...props } = item;
      masterContent[item.lang] = {
        lang,
        languageName,
        sqlValue,
        templateTitle,
        templateContent,
      };
      if (j === 0) {
        otherProps = { ...props };
      }
    }
    source[target.templateTypeCode] = {
      ...otherProps,
      masterContent,
    };
  }
  return source;
}
