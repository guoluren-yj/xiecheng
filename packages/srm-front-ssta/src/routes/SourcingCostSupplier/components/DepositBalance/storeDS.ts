import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { amountFormatterOptions } from '../../../../utils/utils';
import { DepositBalanceUnitCode } from '.';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const depositTotalBalanceDS = (): DataSetProps => {
  return {
    paging: false,
    autoQuery: true,
    fields: [
      {
        name: 'remainingAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositBalance').d('保证金余额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${apiPrefix}/deposits/supplier-remaining-amount`,
          method: 'GET',
        };
      },
    },
  };
};

export const depositBalanceDS = (): DataSetProps => {
  return {
    autoQuery: true,
    pageSize: 20,
    selection: false,
    fields: [
      {
        name: 'depositNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositNumber').d('保证金编号'),
      },
      {
        name: 'sourceDocumentTypeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentType').d('寻源单据类型'),
      },
      {
        name: 'sourceDocumentNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentNum').d('寻源单据编号'),
      },
      {
        name: 'sourceDocumentTitle',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentTitle').d('寻源单据标题'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.company').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplier').d('供应商'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.currency').d('币种'),
      },
      {
        name: 'amount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositAmount').d('保证金金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'returnAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.returnAmount').d('退回金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
    ],
    queryParameter: { customizeUnitCode: DepositBalanceUnitCode.GRID },
    transport: {
      read: () => {
        return {
          url: `${apiPrefix}/deposits/supplier-remaining-amount/page`,
          method: 'GET',
        };
      },
    },
  };
};