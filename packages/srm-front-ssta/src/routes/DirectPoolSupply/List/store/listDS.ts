import { DataToJSON, FieldType, DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import type { ActiveKey } from '../utils/type';
import { GridCustCodeMap, FilterCustCodeMap } from '../utils/type';
import { transformQselectDate, transformSupplierData } from '../../../../utils/utils';
import { amountFormatterOptions } from '../../../../utils/utils';

const organizationId = getCurrentOrganizationId();

export const wholeListDS = (activeKey: ActiveKey, tab: string): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    cacheSelection: true,
    primaryKey: 'poolId',
    dataToJSON: DataToJSON.selected,
    autoQueryAfterSubmit: false,
    selection: DataSetSelection.multiple,
    queryParameter: {
      customizeUnitCode: [GridCustCodeMap[activeKey], FilterCustCodeMap[activeKey]].join(),
      tab,
    },
    fields: [
        {
          name: 'poolNum',
          type: FieldType.string,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.poolNum').d('开票事务编号'),
        },
        {
          name: 'poolStatus',
          type: FieldType.string,
          lookupCode: 'SDIM.POOL_STATUS',
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.poolStatusMeaning')
            .d('开票状态'),
        },
        {
          name: 'ruleNum',
          type: FieldType.string,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.ruleNum').d('执行开票规则'),
        },
        {
          name: 'netPrice',
          type: FieldType.number,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.netPrice').d('不含税单价'),
        },
        {
          name: 'taxAmount',
          type: FieldType.number,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.amountInvoicing')
            .d('开票税额'),
        },
        {
          name: 'amountInvoice',
          type: FieldType.number,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.amountInvoice')
            .d('可开票含税金额'),
        },
        {
          name: 'trxDate',
          type: FieldType.date,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.trxDate').d('事务日期'),
        },
        {
          name: 'refDocNumListStr',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.refDocNumListStr')
            .d('关联开票申请单'),
        },
        {
          name: 'defaultInvoiceTypeMeaning',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.defaultInvoiceType')
            .d('税务发票种类'),
        },
        {
          name: 'invoiceTypeMeaning',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.invoiceTypeMeaning')
            .d('发票类型'),
        },
        {
          name: 'refInvoiceNumListStr',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.refInvoiceNumListStr')
            .d('关联税务发票代码-发票号码'),
        },
        {
          name: 'companyName',
          type: FieldType.string,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.companyName').d('所属客户'),
        },
        {
          name: 'supplierCompanyName',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.supplierCompanyName')
            .d('所属公司'),
        },
        {
          name: 'itemName',
          type: FieldType.string,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.item').d('物料名称'),
        },
        {
          name: 'commodityNum',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.commodityNum')
            .d('税收商品编码'),
        },
        {
          name: 'commodityName',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.commodityName')
            .d('商品或服务名称'),
        },
        {
          name: 'quantity',
          type: FieldType.number,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.quantity').d('可开票数量'),
        },
        {
          name: 'sourceDocNum',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.sourceDocNum')
            .d('来源单据号'),
        },
        {
          name: 'sourceDocLineNum',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.sourceDocLineNum')
            .d('来源单据行号'),
        },
      ],
      transport: {
        /**
         * 查询
         */
        read: ({ data }) => {
          const url = `/ssta/v1/${organizationId}/direct-pools/list`;
          return {
            url,
            method: 'GET',
            data: filterNullValueObject({
              ...data,
              ...transformQselectDate(data, { dateRange: 'trxDate' }),
              ...transformSupplierData(data.supplierCompanyId),
            }),
          };
        },
      },
  };
};

export const errorTableDS = (): DataSetProps => {
    return {
      dataToJSON: DataToJSON.selected,
      autoQueryAfterSubmit: false,
      selection: DataSetSelection.multiple,
      autoQuery: false,
      cacheSelection: true,
      primaryKey: 'errorId',
      validateBeforeQuery: false,
      pageSize: 20,
      fields: [
        {
          name: 'poolNum',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.originalPoolNum')
            .d('原开票事务编号'),
        },
        {
          name: 'poolStatusMeaning',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.poolStatusMeaning')
            .d('开票状态'),
        },
        {
          name: 'ruleNum',
          type: FieldType.string,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.ruleNum').d('执行开票规则'),
        },
        {
          name: 'netPrice',
          type: FieldType.number,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.netPrice').d('不含税单价'),
        },
        {
          name: 'taxAmount',
          type: FieldType.number,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.amountInvoicing')
            .d('开票税额'),
        },
        {
          name: 'amountInvoice',
          type: FieldType.number,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.amountInvoice')
            .d('可开票含税金额'),
        },
        {
          name: 'trxDate',
          type: FieldType.date,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.trxDate').d('事务日期'),
        },
        {
          name: 'refDocNumListStr',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.refDocNumListStr')
            .d('关联开票申请单'),
        },
        {
          name: 'defaultInvoiceTypeMeaning',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.defaultInvoiceType')
            .d('税务发票种类'),
        },
        {
          name: 'invoiceTypeMeaning',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.invoiceTypeMeaning')
            .d('发票类型'),
        },
        {
          name: 'refInvoiceNumListStr',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.refInvoiceNumListStr')
            .d('关联税务发票代码-发票号码'),
        },
        {
          name: 'companyName',
          type: FieldType.string,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.companyName').d('所属客户'),
        },
        {
          name: 'supplierCompanyName',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.supplierCompanyName')
            .d('所属公司'),
        },
        {
          name: 'item',
          type: FieldType.string,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.item').d('物料名称'),
        },
        {
          name: 'commodityNum',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.commodityNum')
            .d('税收商品编码'),
        },
        {
          name: 'commodityName',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.commodityName')
            .d('商品或服务名称'),
        },
        {
          name: 'quantity',
          type: FieldType.number,
          label: intl.get('ssta.directPoolSupply.model.directPoolSupply.quantity').d('可开票数量'),
        },
        {
          name: 'sourceDocNum',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.sourceDocNum')
            .d('来源单据号'),
        },
        {
          name: 'sourceDocLineNum',
          type: FieldType.string,
          label: intl
            .get('ssta.directPoolSupply.model.directPoolSupply.sourceDocLineNum')
            .d('来源单据行号'),
        },
        /**
         * 垃圾箱
         */
        {
          label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.errorNum`).d('开票事务编号'),
          type: FieldType.string,
          name: 'errorNum',
        },
        {
          label: intl
            .get(`ssta.directPoolSupply.model.directPoolSupply.errorTypeMeaning`)
            .d('导入失败类型'),
          type: FieldType.string,
          name: 'errorTypeMeaning',
        },
        {
          label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.errorMsg`).d('导入失败原因'),
          type: FieldType.string,
          name: 'errorMsg',
        },
        {
          label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.errorMsg`).d('导入失败原因'),
          type: FieldType.string,
          name: 'errorMsg',
        },
      ],
      queryParameter: {
        customizeUnitCode: [GridCustCodeMap.d, FilterCustCodeMap.d].join(),
      },
      transport: {
        read: ({ data }) => {
          return {
            url: `/ssta/v1/${organizationId}/direct-pool-errors/list`,
            method: 'GET',
            data: filterNullValueObject({
              ...data,
              ...transformQselectDate(data, { dateRange: 'trxDate' }),
              ...transformSupplierData(data.supplierCompanyId),
            }),
          };
        },
      },
    };
  };


  export const invoiceListDS = (activeKey: ActiveKey, tab: string): DataSetProps => {
    return {
      autoQuery: false,
      pageSize: 20,
      cacheSelection: true,
      primaryKey: 'poolId',
      dataToJSON: DataToJSON.selected,
      autoQueryAfterSubmit: false,
      selection: DataSetSelection.multiple,
      queryParameter: {
        customizeUnitCode: [GridCustCodeMap[activeKey], FilterCustCodeMap[activeKey]].join(),
        tab,
      },
      fields: [
          {
            name: 'applyStatus',
            type: FieldType.string,
            label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.applyStatus`).d('申请状态'),
            lookupCode: 'SDIM.APPLY_STATUS',
          },
          {
            name: 'operate',
            type: FieldType.string,
            label: intl.get('ssta.directPoolSupply.model.directPoolSupply.operate').d('操作'),
          },
          {
            name: 'applyNum',
            type: FieldType.string,
            label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.InvoiceNum`).d('开票申请单编号'),
          },
          {
            name: 'sourceDocNum',
            type: FieldType.string,
            label: intl.get('ssta.directPoolSupply.model.directPoolSupply.sourceDocNum').d('来源单据号'),
          },
          {
            name: 'companyName',
            type: FieldType.string,
            label: intl.get('ssta.directPoolSupply.model.directPoolSupply.companyName').d('所属客户'),
          },
          {
            name: 'supplierCompanyName',
            type: FieldType.string,
            label: intl
              .get('ssta.directPoolSupply.model.directPoolSupply.supplierCompanyName')
              .d('所属公司'),
          },
          {
            name: 'netAmount',
            type: FieldType.number,
            computedProps: { formatterOptions: amountFormatterOptions },
            label: intl.get('ssta.directPoolSupply.model.directPoolSupply.netTotalAmount').d('合计金额（不含税）'),
          },
          {
            name: 'taxAmount',
            type: FieldType.number,
            computedProps: { formatterOptions: amountFormatterOptions },
            label: intl
              .get('ssta.directPoolSupply.model.directPoolSupply.taxAmountTotal')
              .d('合计税额'),
          },
          {
            name: 'amount',
            type: FieldType.number,
            label: intl.get('ssta.costSheet.model.costSheet.taxsIncludedAmount').d('价税合计'),
            computedProps: { formatterOptions: amountFormatterOptions },
          },
          {
            name: 'invoiceTypeMeaning',
            type: FieldType.string,
            label: intl
              .get('ssta.directPoolSupply.model.directPoolSupply.invoiceTypeMeaning')
              .d('发票类型'),
          },
          {
            name: 'invoiceCode',
            type: FieldType.string,
            label: intl.get('ssta.costSheet.model.costSheet.invoiceCode').d('发票代码'),
          },
          {
            name: 'invoiceNum',
            type: FieldType.string,
            label: intl.get('ssta.costSheet.model.costSheet.invoiceNum').d('发票号码'),
          },

          {
            name: 'deliveryStatus',
            type: FieldType.string,
            label: intl.get('ssta.directPoolSupply.model.directPoolSupply.deliveryStatus').d('交付状态'),
            lookupCode: 'SDIM.DELIVERY_STATUS',
            help: intl.get('ssta.directPoolSupply.model.directPoolSupply.deliveryStatusTips').d('电票版式文件推送至受票人手机短信/邮箱状态；'),
          },
          {
            name: 'creationDate',
            type: FieldType.date,
            label: intl.get('ssta.common.model.common.createdDate').d('创建日期'),
          },
        ],
        transport: {
          read: ({ data }) => {
            const url = `/ssta/v1/${organizationId}/direct-invoice-apply-headers/list`;
            return {
              url,
              method: 'GET',
              data: filterNullValueObject({
                ...data,
                ...transformQselectDate(data, { creationDateRange: 'creationDate' }),
                ...transformSupplierData(data.supplierCompanyId),
              }),
            };
          },
          submit: ({ dataSet, data }): any => {
            const submitType = dataSet?.getState('submitType');
            const dataValue = dataSet?.getState('dataValue');
            switch (submitType) {
              case 'delivery':
                return {
                  url: `/ssta/v1/${organizationId}/direct-invoice-apply-headers/delivery`,
                  method: 'PUT',
                  data: dataValue,
                };
              case 'submit':
                return {
                  url: `/ssta/v1/${organizationId}/direct-invoice-apply-headers/submit`,
                  method: 'PUT',
                  data: data[0],
                };
              case 'delete':
                return {
                  url: `/ssta/v1/${organizationId}/direct-invoice-apply-headers/delete`,
                  method: 'PUT',
                  data: data[0],
                };
              default:
            }
          },
        },
    };
  };


  export const checkInfoDS = (): DataSetProps => {
    return {
      autoCreate: false,
      fields: [
        {
          name: 'recipientPhone',
          type: FieldType.string,
          label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.invoiceReceiverPhone`).d('受票人电话'),
          dynamicProps: {
            required: ({ record }) => !record.get('recipientEmail'),
          },
        },
        {
          name: 'recipientEmail',
          type: FieldType.email,
          label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.invoiceReceiverEmail`).d('受票人邮箱'),
          dynamicProps: {
            required: ({ record }) => !record.get('recipientPhone'),
          },
        },
      ],
    };
  };
