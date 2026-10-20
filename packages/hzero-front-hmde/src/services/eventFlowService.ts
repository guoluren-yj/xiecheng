// 维护业务对象接口
import { lowcodeRequest as request } from '@/utils/lowcodeRequest'; // 权限的APPID添加
import { HZERO_HLOD, HZERO_HWKF } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

/**
 * 获取业务对象事件流明细
 * */
export async function getBOEventFlowDetail({ flowId = '' }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HLOD,
    })}/business-object-event-flows/display-detail/${flowId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 创建业务对象事件流
 * */
export async function createBOEventFlow({ body = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-event-flows/save`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 获取工作流字段
 * */
export async function getWorkFlowFields({ flowId = '' }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HWKF })}/monitor-simulate/${flowId}`, {
    method: 'GET',
  });
}
