/*
 * purchaseOrderTrackingService - 采购订单跟踪报表Service
 * @date: 2020/02/27 11:49:14
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { SRM_SPUC } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export function fetchList(payload) {
  const param = filterNullValueObject(parseParameters(payload));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/order-tracking-report`, {
    method: 'GET',
    query: param,
  });
}
