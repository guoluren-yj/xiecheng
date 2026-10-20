/**
 * processorMonitorService - 前置机监控 - service 租户
 * @date: 2018-09-18
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_INTERFACE_CONFIG } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 前置机数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function queryProcessorMonitor(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/front-end-sys-monitor`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 前置机创建/更新
 * @export
 * @param {object} params 编辑参数
 * @returns
 *
 */
export async function updateProcessorMonitor(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/front-end-sys-monitor`, {
    method: 'POST',
    body: params.body,
  });
}

/**
 * 前置机明细查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function updateProcessorMonitorDetail(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/front-end-sys-monitor/${params}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 批量开启,结束
 * @export
 * @param {object} params 与编辑，新建参数相同
 * @returns
 */
export async function startOrEndProcessorMonitor(params) {
  return request(
    `${SRM_INTERFACE_CONFIG}/v1/front-end-sys-monitor/switch-status/${params.status}`,
    {
      method: 'POST',
      body: params.body,
    }
  );
}

/**
 * 执行器查询接口(值级查询)
 * @export
 * @param {object} params 查询参数
 * @param {string} params.lovCode
 * @returns
 */
export async function getGroupList(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 删除前置机监控
 * @export
 * @param {object} params 删除参数
 * @returns
 */
export async function deleteProcessorMonitor(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/front-end-sys-monitor`, {
    method: 'DELETE',
    body: params.body,
  });
}
