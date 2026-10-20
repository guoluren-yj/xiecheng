import { DataToJSON, FieldIgnore, FieldType } from "choerodon-ui/dataset/data-set/enum";
import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";

import intl from "utils/intl";
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { amountFormatterOptions } from "../../../../utils/utils";

import type { DocType } from ".";
import { batchEditCodeMap } from ".";

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const selectDS = (settleHeaderIds: string, documentType: DocType): DataSetProps => {
  return {
    autoQuery: true,
    paging: false,
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
        name: 'currencyCode',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.currencyCode').d('币种'),
      },
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.paymentApplyAmount').d('付款申请金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'prepaymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.prePaymentApplyAmount').d('预付款申请金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
    ],
    queryParameter: {
      settleHeaderIds,
      customizeUnitCode: batchEditCodeMap[documentType].SELECT,
    },
    transport: {
      read: () => ({
        url: `${apiPrefix}/settle-headers/batch-settle-header`,
        method: 'GET',
      }),
    },
  };
};

export const editDS = (documentType: DocType): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'expectPaymentDate',
        type: FieldType.date,
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.expectPaymentDate`)
          .d('期望付款日期'),
      },
      {
        name: 'paymentCondition',
        type: FieldType.object,
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentCondition`).d('付款条件'),
        lovCode: 'SMDM.PAYMENT.TERM',
        ignore: FieldIgnore.always,
      },
      {
        name: 'paymentTermId',
        bind: 'paymentCondition.termId',
      },
      {
        name: 'paymentMethodLov',
        type: FieldType.object,
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentMethod`)
          .d('付款方式'),
        lovCode: 'SMDM.PAYMENT_TYPE',
        ignore: FieldIgnore.always,
      },
      {
        name: 'paymentTypeId',
        bind: 'paymentMethodLov.typeId',
      },
    ],
    transport: {
      submit: ({ data }) => {
        const submitUrlMap: Record<DocType, string> = {
          PAYMENT: `${apiPrefix}/settle-headers/payment/batch-edit`,
          PREPAYMENT: `${apiPrefix}/pre-pay-headers/prepayment/batch-edit`,
        };
        // 后端字段严格校验
        delete data[0].__id;
        delete data[0]._status;
        return {
          url: submitUrlMap[documentType],
          method: 'POST',
          data: data[0],
          params: {
            customizeUnitCode: batchEditCodeMap[documentType].EDIT,
          },
        };
      },
    },
  };
};