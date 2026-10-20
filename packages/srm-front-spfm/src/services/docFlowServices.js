/*
 * @Description:
 * @Version: 2.0
 * @Autor: lhl
 * @Date: 2021-07-21 17:35:56
 * @LastEditors: lhl
 * @LastEditTime: 2021-09-07 14:51:23
 */
import request from 'hzero-front/lib/utils/request';
import { SRM_DATA_PROCESS } from '_utils/config';

export async function getDocFlowDefinitionCoding(data) {
  const { nodeId } = data;
  return request(`${SRM_DATA_PROCESS}/v1/node-definitions/${nodeId}`, {
    method: 'GET',
  });
}
