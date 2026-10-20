import moment from 'moment';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/dataset/data-set/enum';

import { getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';

export const formDS = (): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'startDate',
        type: FieldType.date,
        label: intl.get('ssta.costSheet.model.costSheet.invoicingDate').d('开票日期'),
        range: ['from', 'to'],
        required: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'startDateFrom',
        bind: 'startDate.from',
        transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
      },
      {
        name: 'startDateTo',
        bind: 'startDate.to',
        transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
      },
      {
        name: 'companyIds',
        type: FieldType.object,
        label: intl.get('ssta.costSheet.model.costSheet.pure').d('购方税号'),
        lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
        multiple: true,
        transformRequest: (value) => {
          return value && value.map((item) => item.companyId);
        },
      },
      {
        name: 'supplierCompanyIds',
        type: FieldType.object,
        label: intl.get('ssta.costSheet.model.costSheet.supUnifiedSocialCode').d('销方税号'),
        lovCode: 'SSTA.USER_WITH_AUTH_SUPPLIER_WITH_TAX',
        multiple: true,
        transformRequest: (value) => {
          return value && value.map((item) => item.supplierCompanyId);
        },
      },
      {
        name: 'checkStatus',
        label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkStatusMeaning').d('查验状态'),
        lookupCode: 'SSTA.INVOICE_CHECK_STATUS_PULL',
      },
      {
        name: 'invoiceTypes',
        label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxType').d('发票类型'),
        lookupCode: 'SSTA.INVOICE_POOL_TYPE',
        multiple: ',',
      },
      {
        name: 'invoiceStatusMulti',
        label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceStatusMeaning').d('发票状态'),
        lookupCode: 'SSTA.INVOICE_STATUS',
        multiple: ',',
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/invoice-header/pull`,
          method: 'post',
          data: data[0],
        };
      },
    },
  };
};