import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export type DocType = 'tender' | 'deposit' | 'service';
export const feeIdNameMap: Record<DocType, string> = {
  tender: 'tenderFeesId',
  deposit: 'depositId',
  service: 'serverFeesId',
};

export const syncRecordDS = (feeRecord: DSRecord | null | undefined, docType: DocType): DataSetProps => {
  const feeRecordData = feeRecord?.toData() || {};
  return {
    pageSize: 20,
    selection: false,
    dataToJSON: DataToJSON.dirty, // submit方法会用到，谨慎修改
    fields: [
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.lineNum').d('行号'),
      },
      {
        name: 'syncStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.syncStatus').d('同步状态'),
        lookupCode: 'SDEP.SYNC_STATUS',
      },
      {
        name: 'syncSystem',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.syncSystem').d('同步系统'),
      },
      {
        name: 'syncMessage',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.syncMessage').d('同步消息'),
      },
      {
        name: 'syncTypeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.syncType').d('同步类型'),
      },
      {
        name: 'syncDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.syncTime').d('同步时间'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const feeIdName = feeIdNameMap[docType];
        const feeId = data[feeIdName] || feeRecordData[feeIdName];
        const readUrlMap: Record<DocType, string> = {
          tender: `${apiPrefix}/tender-sync-records/list/${feeId}`,
          deposit: `${apiPrefix}/deposit-sync-records/list/${feeId}`,
          service: `${apiPrefix}/server-sync-records/list/${feeId}`,
        };
        return { url: readUrlMap[docType], method: 'GET' };
      },
    },
  };
};