import request from 'hzero-front/lib/utils/request';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';

// 接口组件保存
export async function saveInterfaceComponent(params) {
  return request(`${HZERO_HITF}/v1/open-module-headers/save`, {
    method: 'POST',
    body: params,
  });
}

// 接口组件库详情页表单
export async function getFormDetail(headerId) {
  return request(`${HZERO_HITF}/v1/open-module-headers/${headerId}`, {
    method: 'GET',
  });
}
