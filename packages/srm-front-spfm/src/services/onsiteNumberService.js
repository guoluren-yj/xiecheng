import request from 'utils/request';
import { SRM_CUSTOMIZATION } from '_utils/config';

export async function handleOnsite(params) {
  return request(`${SRM_CUSTOMIZATION}/v1/donlim-site-numberings/get/code`, {
    method: 'POST',
    body: params,
  });
}

// 查询待办人数接口
export async function statistics() {
  return request(`${SRM_CUSTOMIZATION}/v1/donlim-site-numberings/statistics`, {
    method: 'GET',
  });
}
