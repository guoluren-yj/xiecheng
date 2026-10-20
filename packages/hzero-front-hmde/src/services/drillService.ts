// 维护业务对象接口
import { lowcodeRequest as request } from '@/utils/lowcodeRequest'; // 权限的APPID添加
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

/**
 * 业务对象字段钻取接口
 * */
export async function drill({ query }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields/drill`, {
    method: 'GET',
    query,
  });
}

/**
 * 业务对象字段钻取接口
 * */
export async function getDrillInfo(body: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields/reference-info`,
    {
      method: 'POST',
      body,
    }
  );
}

export async function getNewDrillInfo(body: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields/cascade/analyze`,
    {
      method: 'POST',
      body,
    }
  );
}
