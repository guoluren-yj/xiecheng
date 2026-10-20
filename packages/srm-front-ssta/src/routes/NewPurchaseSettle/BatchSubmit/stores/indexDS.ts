import { DataToJSON, FieldType } from "choerodon-ui/dataset/data-set/enum";
import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";

import intl from "utils/intl";
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { amountFormatterOptions } from "../../../../utils/utils";

import { BasicCode, LineSearchCode, LineCode } from './index';
// import { BatchAddCode, BatchAddSearchCode } from './add';


const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const headerDS = (batchApproveId: string): DataSetProps => {
  return {
    autoQuery: true,
    cacheSelection: true,
    primaryKey: 'settleHeaderId',
    paging: false,
    fields: [
      {
        name: 'batchNum',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.batchApproveNum').d('结算单批次号'),
      },
      {
        name: 'createdName',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.sponsor').d('发起人'),
      },
      {
        name: 'creationDate',
        type: FieldType.date,
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.riseTime').d('发起时间'),
      },
      {
        name: 'settleType',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning').d('结算单类型'),
        lookupCode: 'SSTA.SETTLE_DOCUMENT_TYPE',
      },
    ],
    queryParameter: {
      customizeUnitCode: BasicCode,
    },
    transport: {
      read: () => ({
        url: `${apiPrefix}/batch-approve/detail/${batchApproveId}`,
        method: 'GET',
      }),
    },
  };
};


export const lineDS = (batchApproveId: string): DataSetProps => {
  return {
    autoQuery: true,
    cacheSelection: true,
    primaryKey: 'settleHeaderId',
    dataToJSON: DataToJSON.selected,
    fields: [
      {
        name: 'settleNum',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleNum').d('结算单编号'),
      },
      {
        name: 'companyName',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleCompany').d('结算公司'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleSupplier').d('结算供应商'),
      },
      {
        name: 'paymentApplyAmount',
        type: FieldType.number,
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.paymentApplyAmount').d('付款申请金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.common.model.common.actualPaymentAmountThisTime').d('本次实际付款金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'applyAmount',
        type: FieldType.number,
        label: intl.get(`ssta.purchaseSettle.common.applyAmount`).d('本次预付款核销金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
    ],
    queryParameter: {
      customizeUnitCode: `${LineCode},${LineSearchCode}`,
    },
    transport: {
      read: ({ params }) => ({
        url: `${apiPrefix}/batch-approve/${batchApproveId}/settle/page`,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode: `${LineCode},${LineSearchCode}`,
        },
      }),
    },
  };
};
