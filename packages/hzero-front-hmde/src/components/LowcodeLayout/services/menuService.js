/**
 * @email WY <yang.wang06@hand-china.com>
 * @creationDate 2020/2/17
 * @copyright HAND ® 2019
 */

// import request from 'utils/request';
import { lowcodeRequest as request } from '@/utils/lowcodeRequest'; // 权限的APPID添加
import { lowcodeOrganizationURL } from '@/utils/common';
import { HZERO_HMDE } from '@/utils/config';

export async function queryMenu(sharedFlag) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/viewable-menu?sharedFlag=${sharedFlag}`,
    {
      method: 'GET',
    }
  );
}
