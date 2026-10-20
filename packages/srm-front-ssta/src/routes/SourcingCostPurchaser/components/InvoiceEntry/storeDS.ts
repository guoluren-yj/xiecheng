import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { amountFormatterOptions } from '../../../../utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export type DocType = 'tender' | 'service';
// 区分招标文件费和服务费
export const feeIdNameMap: Record<DocType, string> = {
  tender: 'tenderFeesId',
  service: 'serverFeesId',
};
// 区分招标文件费和服务费
export const feeInvStatusNameMap: Record<DocType, string> = {
  tender: 'tenderFeesInvoiceStatus',
  service: 'serverFeesInvoiceStatus',
};
// 区分招标文件费和服务费
export const primaryKeyMap: Record<DocType, string> = {
  tender: 'tenderFeesInvoiceRecordId',
  service: 'serverFeesInvoiceRecordId',
};

export const invEntryListDS = (docType: DocType, feeRecord: DSRecord | null | undefined): DataSetProps => {
  const feeIdName = feeIdNameMap[docType]; // 招标文件费或服务费头表主键名
  const feeRecordData: Record<string, any> = feeRecord?.toData() || {};
  const { [feeIdName]: feeId } = feeRecordData;
  return {
    pageSize: 20,
    autoQuery: Boolean(feeId),
    primaryKey: primaryKeyMap[docType],
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.lineNumber`).d('行号'),
      },
      {
        name: 'operation',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
      {
        name: 'invoiceCode',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.invoiceCode`).d('发票代码'),
      },
      {
        name: 'invoiceNum',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.invoiceNumber`).d('发票号码'),
      },
      {
        name: 'invoicingDate',
        type: FieldType.date,
        label: intl.get(`ssta.invoice.model.invoice.invoicingDate`).d('开票日期'),
      },
      {
        name: 'netAmount',
        type: FieldType.number,
        label: intl.get(`ssta.invoice.model.invoice.amountExcludingTax`).d('金额(不含税)'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxAmount',
        type: FieldType.number,
        label: intl.get(`ssta.invoice.model.invoice.taxAmount`).d('税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedAmount',
        type: FieldType.number,
        label: intl.get(`ssta.invoice.model.invoice.amountIncludingTax`).d('金额(含税)'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'invoiceTypeMeaning',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.invoiceSpecies`).d('发票种类'),
      },
      {
        name: 'deductFlag',
        type: FieldType.boolean,
        label: intl.get(`ssta.invoice.model.invoice.deductFlag`).d('是否抵扣'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'checkCode',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.checkCode`).d('校验码'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.sellerName').d('销方名称'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.buyerName').d('购方名称'),
      },
      {
        name: 'supUnifiedSocialCode',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.SellerTaxpayerIdentifyNum').d('销方纳税人识别号'),
      },
      {
        name: 'purUnifiedSocialCode',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.BuyerTaxpayerIdentifyNum').d('购方纳税人识别号'),
      },
      {
        name: 'invoiceUrl',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.elecInvoiceAddress`).d('电子发票地址'),
      },
      {
        name: 'attachmentUuid',
        type: FieldType.attachment,
        label: intl.get('hzero.common.button.uploadView').d('附件查看'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: 'finance-invoice',
      },
      {
        name: 'fileUrl',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.fileURL').d('文件URL'),
      },
      {
        name: 'ocrFileUrl',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.ocrFile').d('OCR文件'),
      },
      {
        name: 'ofdFileUrl',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.ofdFile').d('OFD文件'),
      },

    ],
    transport: {
      read: () => {
        const urlMap: Record<DocType, string> = {
          tender: `${apiPrefix}/tender-fees-invoice-records/list/${feeId}`,
          service: `${apiPrefix}/server-fees-invoice-records/list/${feeId}`,
        };
        return {
          url: urlMap[docType],
          method: 'GET',
        };
      },
      destroy: ({ data, dataSet }) => {
        const feeData = dataSet?.getState('feeData') || feeRecordData;
        const urlMap: Record<DocType, string> = {
          tender: `${apiPrefix}/tender-fees-invoice-records/delete`,
          service: `${apiPrefix}/server-fees-invoice-records/delete`,
        };
        return {
          url: urlMap[docType],
          method: 'DELETE',
          data: {
            ...feeData,
            invoiceRecordList: data,
          },
        };
      },
    },
    // 避免全部notication.success
    feedback: { submitSuccess() { } },
  };
};

export const invoiceHeaderDS = (
  invoiceHeaderId: string | number | undefined,
  docType: DocType,
  feeData: Record<string, any>,
): DataSetProps => {
  const primaryKey = primaryKeyMap[docType];
  return {
    primaryKey,
    paging: false,
    forceValidate: true,
    autoQueryAfterSubmit: false,
    dataToJSON: DataToJSON.all,
    autoQuery: invoiceHeaderId !== undefined,
    autoCreate: invoiceHeaderId === undefined,
    fields: [
      {
        name: 'invoiceType',
        type: FieldType.string,
        lookupCode: 'SDEP.INVOICE_POOL_TYPE',
        label: intl.get('ssta.invoice.model.invoice.invoiceType').d('发票类型'),
        required: true,
      },
      {
        name: 'invoiceCode',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.invoiceCode').d('发票代码'),
        dynamicProps: {
          required: ({ record }) => !['17', '18', '19'].includes(record.get('invoiceType')),
          disabled: ({ record }) => ['18', '19'].includes(record.get('invoiceType')),
        },
        // validator: (value) => {
        //   const reg = /^\d*$/;
        //   if (!isNil(value) && !reg.test(value)) {
        //     return intl.get(`hzero.common.validation.requireNumber`).d('请输入数字');
        //   }
        //   return true;
        // },
      },
      {
        name: 'invoiceNum',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.invoiceNumber').d('发票号码'),
        required: true,
      },
      {
        name: 'invoicingDate',
        type: FieldType.date,
        label: intl.get('ssta.invoice.model.invoice.invoiceingTime').d('开票日期'),
        required: true,
      },
      {
        name: 'companyLov',
        type: FieldType.object,
        lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
        label: intl.get('ssta.invoice.model.invoice.buyer').d('购方'),
        lovPara: { tenantId },
      },
      {
        name: 'companyName',
        bind: 'companyLov.companyName',
      },
      {
        name: 'purUnifiedSocialCode',
        bind: 'companyLov.unifiedSocialCode',
      },
      {
        name: 'companyId',
        bind: 'companyLov.companyId',
      },
      {
        name: 'supplierCompanyLov',
        type: FieldType.object,
        lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER_SUP',
        label: intl.get('ssta.invoice.model.invoice.seller').d('销方'),
        lovPara: { tenantId },
      },
      {
        name: 'supplierCompanyName',
        bind: 'supplierCompanyLov.displaySupplierName',
      },
      {
        name: 'supUnifiedSocialCode',
        bind: 'supplierCompanyLov.supUnifiedSocialCode',
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplierCompanyLov.supplierCompanyId',
      },
      {
        name: 'extUnifiedSocialCode',
        bind: 'supplierCompanyLov.extUnifiedSocialCode',
      },
      {
        name: 'supplierId',
        bind: 'supplierCompanyLov.supplierId',
      },
      {
        name: 'supplierName',
        bind: 'supplierCompanyLov.supplierName',
      },
      {
        name: 'supplierNum',
        bind: 'supplierCompanyLov.supplierNum',
      },
      {
        name: 'netAmount',
        type: FieldType.number,
        label: intl.get('ssta.invoice.model.invoice.amounExcludingTax').d('金额(不含税)'),
        required: true,
        dynamicProps: {
          formatterOptions: amountFormatterOptions,
          // 行上有数据时，头上的【不含税金额】【税额】禁用
          disabled: ({ dataSet }) => dataSet?.children?.invoiceLineList?.length > 0,
        },
      },
      {
        name: 'taxAmount',
        type: FieldType.number,
        label: intl.get('ssta.invoice.model.invoice.taxAmount').d('税额'),
        required: true,
        dynamicProps: {
          formatterOptions: amountFormatterOptions,
          // 行上有数据时，头上的【不含税金额】【税额】禁用
          disabled: ({ dataSet }) => dataSet?.children?.invoiceLineList?.length > 0,
        },
      },
      {
        name: 'checkCode',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.checkcodeWithSixDigitsTip').d('校验码 (多位时请输入后6位即可)'),
        pattern: /^[a-zA-Z\d]+$/,
        defaultValidationMessages: {
          patternMismatch: intl.get('ssta.invoice.view.validation.onlyDigitOrLetter').d('请输入字母或者数字'),
        },
        dynamicProps: {
          required: ({ record }) =>
            ['04', '10', '11'].includes(record.get('invoiceType')),
        },
      },
      {
        name: 'memo',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.note').d('备忘说明'),
      },
      {
        name: 'attachmentUuid',
        type: FieldType.attachment,
      },
      {
        name: 'uniSee',
        type: FieldType.string,
      },
    ],
    queryParameter: { [primaryKey]: invoiceHeaderId },
    transport: {
      read: ({ dataSet }) => {
        const invoiceHeaderId = dataSet?.getQueryParameter(primaryKey);
        const urlMap: Record<DocType, string> = {
          tender: `${apiPrefix}/tender-fees-invoice-records/detail/${invoiceHeaderId}`,
          service: `${apiPrefix}/server-fees-invoice-records/detail/${invoiceHeaderId}`,
        };
        return {
          url: urlMap[docType],
          method: 'GET',
        };
      },
      submit: ({ dataSet, data }): any => {
        const submitType = dataSet?.getState('submitType');
        let urlMap: Record<DocType, string> = { tender: '', service: '' };
        switch (submitType) {
          case 'create':
            urlMap = {
              tender: `${apiPrefix}/tender-fees-invoice-records/create`,
              service: `${apiPrefix}/server-fees-invoice-records/create`,
            };
            return {
              url: urlMap[docType],
              method: 'POST',
              data: { ...feeData, invoiceRecordList: data },
            };
          case 'update':
            urlMap = {
              tender: `${apiPrefix}/tender-fees-invoice-records/update`,
              service: `${apiPrefix}/server-fees-invoice-records/update`,
            };
            return {
              url: urlMap[docType],
              method: 'PUT',
              data: { ...feeData, invoiceRecordList: data },
            };
          default:
        }
      },
    },
    events: {
      update: ({ name, value, record }) => {
        if (name === "invoiceType") {
          if (value === "18" || value === "19") {
            record.set("invoiceCode", null);
          }
        }
      },
    },
  };
};

export const invoiceLineDS = (parentKey: string): DataSetProps => {
  return {
    autoQuery: false,
    forceValidate: true,
    autoQueryAfterSubmit: false,
    fields: [
      {
        name: 'taxInvoiceLineNum',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.lineNumber').d('行号'),
      },
      {
        name: 'itemName',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.projectGoodsServiceName').d('项目名称/货物或应税劳务，服务名称'),
        required: true,
      },
      {
        name: 'netAmount',
        type: FieldType.number,
        label: intl.get('ssta.invoice.model.invoice.amounExcludingTax').d('金额(不含税)'),
        required: true,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'quantity',
        type: FieldType.number,
        label: intl.get('ssta.invoice.model.invoice.quantity').d('数量'),
      },
      {
        name: 'taxRate',
        type: FieldType.number,
        label: intl.get('ssta.invoice.model.invoice.taxRatePercent').d('税率(%)'),
      },
      {
        name: 'taxAmount',
        type: FieldType.number,
        label: intl.get('ssta.invoice.model.invoice.taxAmount').d('税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
        required: true,
      },
      {
        name: 'netPrice',
        type: FieldType.number,
        label: intl.get('ssta.invoice.model.invoice.unitPriceExcludingTax').d('单价(不含税)'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'spec',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.specificationModel').d('规格型号'),
      },
      {
        name: 'uom',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.unit').d('单位'),
      },
      {
        name: 'plateNo',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.licensePlateNumToll').d('车牌号(通行费)'),
      },
      {
        name: 'trafficType',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.type').d('类型'),
      },
      {
        name: 'trafficDateStart',
        type: FieldType.date,
        label: intl.get('ssta.invoice.model.invoice.passDateFromToll').d('通行日期起(通行费)'),
      },
      {
        name: 'trafficDateEnd',
        type: FieldType.date,
        label: intl.get('ssta.invoice.model.invoice.passDateToToll').d('通行日期至(通行费)'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const invoiceHeaderId = data[parentKey];
        return {
          url: `${apiPrefix}/invoice-line/${invoiceHeaderId}`,
          method: 'GET',
        };
      },
      destroy: ({ data, dataSet }) => {
        const headerInfo = dataSet?.parent?.current?.toData() || {};
        return {
          url: `${apiPrefix}/invoice-line`,
          data: { ...headerInfo, invoiceLineList: data },
          method: 'DELETE',
        };
      },
    },
  };
};