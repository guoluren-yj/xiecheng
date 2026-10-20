/*
获取卡片配置信息
*/
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_SMBL } from '@/utils/config';
import { omit } from 'lodash';

export async function getBindSupplierUrl(params, data) {
  let query = filterNullValueObject(parseParameters(params));
  query = omit(query, ['page', 'size']);
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/card/mappings/get/card`, {
    query,
    method: 'POST',
    body: data,
  });
}
