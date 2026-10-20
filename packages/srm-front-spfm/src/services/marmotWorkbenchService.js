/**
 * service - MarmotHub工作台数据迁移
 * @date: 2022-3-23
 * @version: 1.0.0
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_ADAPTOR } from '_utils/config';

export async function importCurrentData(uuid) {
  return request(`${SRM_ADAPTOR}/v1/marmot-data/import/${uuid}`, {
    method: 'GET',
    responseType: 'text',
  });
}

export async function showDataMove() {
  return request(`${SRM_ADAPTOR}/v1/marmot-data/permission`, {
    method: 'GET',
  });
}

export async function queryUUID(tenantNum) {
  return request(`${SRM_ADAPTOR}/v1/marmot-data/download/preview/${tenantNum}`, {
    method: 'GET',
    responseType: 'text',
  });
}

// 调度日志中错误详情接口
export async function querySchedulingLogDetail(logId) {
  return request(`/hsdr/v1/marmot-job-log/${logId}/error-detail`, {
    method: 'GET',
    responseType: 'text',
  });
}
