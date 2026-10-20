/*
 * @Author: your name
 * @Date: 2020-12-23 14:15:30
 * @LastEditTime: 2020-12-23 14:19:41
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \srm-front-sfin\src\services\paymentSyncErpServices.js
 */

import request from 'utils/request';
import { SRM_FINANCE } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 *  付款申请 同步erp
 */
export async function paymentSyncErp(list) {
  const customizeUnitCode = 'SFIN.PAYMENT_SYNC_ERP.LIST';
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-headers/sync/payment-approve?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: list,
    }
  );
}
