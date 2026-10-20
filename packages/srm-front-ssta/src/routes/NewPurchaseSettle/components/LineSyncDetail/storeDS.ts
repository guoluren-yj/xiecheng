import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export const listDS = (topRecord): DataSetProps => {
  const documentType = topRecord.get('documentType');
  const documentId = topRecord.key;
  return {
    autoQuery: true,
    pageSize: 20,
    selection: false,
    fields: [
      {
        name: 'recordTypeMeaning',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.syncType').d('同步类型'),
      },
      {
        name: 'recordStatus',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.syncStatus').d('同步状态'),
        lookupCode: 'SSTA.SETTLE_HEADER_SYNC_STATUS',
      },
      {
        name: 'recordMessage',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.syncMessage').d('同步消息'),
      },
      {
        name: 'lastUpdateDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.operationTime').d('操作时间'),
      },
      {
        name: 'createdByName',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.operationPerson').d('操作人'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/settle-export-records/${documentType}/list/${documentId}`,
        method: 'get',
      },
      submit: ({ data, dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        switch (submitType) {
          case 'reSync':
            return {
              url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/settle-export-records/re-execute`,
              method: 'PUT',
              data: data[0],
            };
          default:
        }
      },
    },
  };
};
