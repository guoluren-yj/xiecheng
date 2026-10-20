import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { TenderProgressCtrlCode } from '.';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const tenderProgressCtrlDS = (tenderRecord: DSRecord | null | undefined): DataSetProps => {
  const tenderRecordData = tenderRecord?.toData() || {};
  tenderRecordData.supplierParticipationFlag = 0;
  const { uuidDownloadFlag, supplierParticipationFlag } = tenderRecordData;
  return {
    autoCreate: true,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    data: [{
      ...tenderRecordData,
      uuidDownloadFlag: 1, // 默认勾选
      supplierParticipationFlag: 1, // 默认勾选
    }],
    fields: [
      {
        name: 'uuidDownloadFlag',
        type: FieldType.boolean,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.allowDownloadTender').d('允许下载标书'),
        trueValue: 1,
        falseValue: 0,
        disabled: Number(uuidDownloadFlag) === 1, // 原始值为勾选不能取消
        transformResponse: (value) => Number(value),
      },
      {
        name: 'supplierParticipationFlag',
        type: FieldType.boolean,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.allowSupplierParticipate').d('允许供应商参与'),
        trueValue: 1,
        falseValue: 0,
        disabled: Number(supplierParticipationFlag) === 1, // 原始值为勾选不能取消
        transformResponse: (value) => Number(value),
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${apiPrefix}/tender-feess/update-download-and-supplier-participation-flag`,
          method: 'POST',
          data: data[0],
          params: { customizeUnitCode: TenderProgressCtrlCode },
        };
      },
    },
  };
};