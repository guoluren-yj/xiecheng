/**
 * 指标探查页面服务
 * @date: 2021-11-1
 * @author: Zepeng Huang <zepeng.Huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */
import request from 'utils/request';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import _ from 'lodash';

const organizationId = getCurrentOrganizationId();

/**
 * queryIndexDimension: 查询指标维度数据(租户级)
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function queryIndexDimensionOrg(params) {
  // 修改接口参数对象的字段，使之符合后端要求
  const queryData = _.values(params).map((item) => {
    const { parameterKey, parameterName } = item;
    return {
      ...item,
      parameterKey: undefined, // 删除属性
      parameterName: undefined,
      dimensionalityCode: parameterKey,
      dimensionalityName: parameterName,
    };
  });
  return request(`${SRM_DATA_PROCESS}/v1/${organizationId}/index-search/dimensionalityInfo`, {
    method: 'POST',
    body: queryData,
  });
}

/**
 * queryIndexDimension: 查询指标维度数据(平台级)
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function queryIndexDimension(serviceCode) {
  return request(
    `${SRM_DATA_PROCESS}/v1/index-search/dimensionalityInfo/serviceCode/${serviceCode}`,
    {
      method: 'GET',
    }
  );
}

/**
 * fetchPreview: 查询预览内容 (平台级)
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchPreview(params) {
  return request(`${SRM_DATA_PROCESS}/v1/index-search/preview`, {
    method: 'POST',
    body: {
      ...params,
    },
    responseType: 'text',
  });
}

/**
 * getRuleManageLines: 获取指标列表 不分页
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getRuleManageLines(params) {
  return request(
    `${SRM_DATA_PROCESS}/v1/${organizationId}/rule-management-lines/headerId/${params.ruleManagementHeaderId}?page=-1`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * sendCorrectValue: 推送排查接口
 * @param {*} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function sendCorrectValue(params) {
  return request(`${SRM_DATA_PROCESS}/v1/${organizationId}/index-search/push`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
