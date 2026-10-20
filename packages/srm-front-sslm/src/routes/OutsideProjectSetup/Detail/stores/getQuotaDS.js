/*
 * @Date: 2025-08-20 09:41:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const quotaDS = ({ extSourceReqId }) => ({
  paging: false,
  forceValidate: true,
  autoCreate: isNil(extSourceReqId),
  primaryKey: 'quotaRequirementId',
  fields: [
    {
      name: 'paymentTerm',
      required: true,
      lookupCode: 'SPFM.EXT_SOURCE_QUOTA_REQUIRE.PAYMENT_TERM',
      label: intl.get('sslm.outsideProjectSetup.modal.termId').d('付款条款'),
    },
    {
      name: 'freightTerm',
      required: true,
      lookupCode: 'SPFM.EXT_SOURCE_QUOTA_REQUIRE.FREIGHT_TERM',
      label: intl.get('sslm.outsideProjectSetup.modal.freightTerm').d('货运条款'),
    },
    {
      name: 'confidentAgreement',
      required: true,
      lookupCode: 'SPFM.EXT_SOURCE_QUOTA_REQUIRE.NDA',
      label: intl.get('sslm.outsideProjectSetup.modal.confidentAgreement').d('保密协议'),
    },
    {
      name: 'currency',
      required: true,
      lookupCode: 'SPFM.EXT_SOURCE_QUOTA_REQUIRE.CURRENCY',
      label: intl.get('sslm.outsideProjectSetup.modal.currencyId').d('报价币种'),
    },
    {
      name: 'regionPathName',
      required: true,
      label: intl.get('sslm.outsideProjectSetup.modal.deliveryAddress').d('送货地址'),
      validator: (value, name, record) => {
        const { isLeaf = true, regionId } = record.get(['isLeaf', 'regionId']);
        if (!isLeaf && regionId) {
          return intl.get('sslm.common.view.message.lastAddress').d('地址须选择填写至最末级地址');
        }
        return true;
      },
    },
    {
      name: 'deliveryAddress',
      required: true,
      label: intl.get('sslm.outsideProjectSetup.modal.deliveryAddress.detail').d('送货详细地址'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/${organizationId}/ext-source-quota-requirements/${extSourceReqId}`,
      method: 'GET',
    },
  },
});
