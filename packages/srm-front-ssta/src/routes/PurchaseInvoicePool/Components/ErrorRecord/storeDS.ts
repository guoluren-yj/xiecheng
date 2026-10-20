import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import { getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';

export const listDS = (): DataSetProps => {
  return {
    autoQuery: true,
    pageSize: 20,
    selection: false,
    fields: [
      {
        name: 'documentCode',
        label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.apiRequestCode').d('接口请求编号'),
      },
      {
        name: 'content',
        label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.pullDimension').d('拉取维度'),
      },
      {
        name: 'lastUpdateDate',
        type: FieldType.dateTime,
        label: intl.get(`ssta.purchaseInvoicePool.model.purchaseInvoicePool.pullTime`).d('拉取时间'),
      },
      {
        name: 'errorMsg',
        label: intl.get(`ssta.purchaseInvoicePool.model.purchaseInvoicePool.pullFailReason`).d('拉取失败原因'),
      },
    ],
    queryParameter: {
      errorSourceType: 'THIRD_PARTY_INPUT',
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/error-messages/list`,
          method: 'get',
        };
      },
    },
  };
};