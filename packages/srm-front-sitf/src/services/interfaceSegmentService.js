/**
 * interfaceSegmentService - 接口段结构表 - service
 * @date: 2018-9-27
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 接口段结构查询
 * @export
 * @param {object} params 查询条件
 * @param {String} params.relationValue  IDOC基本类型
 * @param {string} params.erpSystemType  外部系统类型
 * @param {string} params.extendType     IDOC扩展类型
 * @returns
 */
export async function queryInterfaceSegment(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE}/v1/${organizationId}/segments`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询接口字段表
 * @export
 * @param {object} params 查询接口
 * @param {string} params.segmentId 接口表接口ID
 * @returns
 */
export async function querySegmentFields(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE}/v1/${organizationId}/${params.segmentId}/segment-fields`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 与sap同步
 * @export
 * @param {object} params 同步参数
 * @param {string} params.relationValue IDOC基本类型
 * @param {string} params.erpSystemType 外部系统类型
 * @param {string} params.extendType    IDOC扩展类型
 * @returns
 */
export async function syncSegmentFields(params) {
  return request(`${SRM_INTERFACE}/v1/${organizationId}/segments`, {
    method: 'POST',
    query: params,
  });
}
