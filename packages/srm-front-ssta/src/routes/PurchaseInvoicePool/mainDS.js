import moment from 'moment';

import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';
// import { getDatas } from '@/utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';

import { getDatas, getMomentDate, transformQselectDate, transformSupplierData } from '@/utils/utils';
import { codesTable, filterTable, paramsMap } from './index';

// import uuidv4 from 'uuid/v4';
// import { isArray } from 'lodash';

// import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

const mainTableDs = (activeKey) => ({
  autoQuery: false,
  selection: 'multiple',

  cacheSelection: true,
  primaryKey: 'invoiceHeaderId',
  pageSize: 20,
  // pageSize: ,

  fields: [
    {
      name: 'invoiceStatus',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_STATUS',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceStatusMeaning').d('发票状态'),
    },
    {
      name: 'invoiceStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceStatusMeaning').d('发票状态'), // SSTA.CHARGE_STATUS
    },
    {
      name: 'checkStatus',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_CHECK_STATUS',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkStatusMeaning').d('查验状态'),
    },
    {
      name: 'checkStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkStatusMeaning').d('查验状态'),
    },
    {
      name: 'validateMessage',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.validateMessage').d('查验状态说明'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.operation').d('操作'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.reve2rs2eNum').d('附件查看'),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
    },
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTypeMeaning').d('发票类型'),
    },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.InvoiceCode').d('发票代码'),
    },
    {
      name: 'invoiceNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTel').d('发票号码'),
    },
    {
      name: 'invoicingDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoicingDate').d('开票日期'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.notHaveMoney.').d('不含税金额'),
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxAmount').d('税额'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxInclssudedAmount').d('价税合计'),
    },
    {
      name: 'checkCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkCode').d('校验码'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.remark').d('备注（票面）'),
    },
    {
      name: 'memo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.memo').d('备忘说明'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方名称'),
    },
    {
      name: 'supUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supUnifiedSocialCode').d('销方纳税人识别号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.companyName').d('购方名称'),
    },
    {
      name: 'purUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.purUnifiedSocialCode').d('购方纳税人识别号'),
    },
    {
      name: 'invoiceSourceMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceSource').d('进池来源'),
    },
    {
      name: 'checkDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkDate').d('查验日期'),
    },
    {
      name: 'fileUrl',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.FileURL').d('文件URL'),
    },
    {
      name: 'uniSee',
      type: 'string',
      label: intl.get(`ssta.costSheet.view.message.checkOCRFile`).d('OCR识别文件'),
    },
    {
      name: 'aiAttachmentUrl',
      type: 'string',
      label: intl.get(`ssta.common.model.common.aiRecognizeFile`).d('AI识别文件'),
    },
    {
      name: 'ofdFileUrl',
      type: 'string',
      label: intl.get('ssta.common.view.message.ofdFileUrl').d('OFD文件'),
    },
    {
      name: 'documentStatus',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_DOC_STATUS',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.documentStatusMeaning').d('单据状态'),
    },
    {
      name: 'documentStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.documentStatusMeaning').d('单据状态'),
    },
    {
      name: 'associatedDocumentNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.associatedDocumentNum').d('关联单据'),
    },
    {
      name: 'cancelledFlag',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.cancelledsFlag').d('取消标识'),
    },
    {
      name: 'cancelledFlagMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.cancelledsFlag').d('取消标识'),
    },
    {
      name: 'exceptionStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatusMeaning').d('异常标识'),
    },
    {
      name: 'sumCheckTimes',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.revesng').d('累计查验次数'),
    },
    {
      name: 'checkTimes',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.todayCheckTimes').d('当天查验次数'),
    },
    // 关联表单的
    {
      name: 'invoiceTypeList',
      type: 'string',

      lookupCode: 'SSTA.INVOICE_POOL_TYPE',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxType').d('发票类型'),
    },

    {
      name: 'companyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.buier').d('购方'),
    },
    {
      name: 'supplierCompanyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH.SUPPLIER',

      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方'),
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierCompanyNameLov.supplierTenantId',
    },
    // 聚合信息的
    {
      name: 'statusInfo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatus').d('状态信息'),
    },
    {
      name: 'handle',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatus').d('操作'),
    },
    {
      name: 'keyInfo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.keyinfo').d('关键查验信息'),
    },
    {
      name: 'otherInvoiceInfo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.otherInfo').d('其他票面信息'),
    },
    {
      name: 'urlfield',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.urlfield').d('文件信息'),
    },
    {
      name: 'uploadfield',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.reve2rs2eNum').d('附件查看'),
    },
    {
      name: 'otherInfo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.otherInfos').d('其他信息'),
    },
    // 二阶段优化新增列字段
    {
      name: 'belongCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.belongCompanyName').d('所属公司'),
    },
    {
      name: 'belongSupplierCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.belongSupplierCompanyName').d('所属供应商'),
    },
    {
      name: 'syncStatus',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.syncStatus').d('同步状态'),
      lookupCode: 'SSTA.INVOICE_POOL_SYNC_STATUS',
    },
    {
      name: 'syncResponseMsg',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.feedbackMsg').d('反馈信息'),
    },
    {
      name: 'associatedApplyNum',
      type: 'string',
      label: intl.get('ssta.common.model.common.associatedInvApplyDocNum').d('关联开票申请单号'),
    },
  ],
  queryParameter: paramsMap[activeKey],
  transport: {
    read: ({ data }) => {
      // console.log(queryParams)
      const customizeUnitCode = [codesTable[activeKey], filterTable[activeKey]].filter(Boolean).join();
      const { ...otherData } = data;
      const queryParams = getDatas(otherData);
      return {
        // url: `/ssta/v1/${organizationId}/invoice-header/supplier/page`,
        url: `/ssta/v1/${organizationId}/invoice-header/purchaser/page?customizeUnitCode=${customizeUnitCode}`,

        method: 'GET',
        data: {
          ...queryParams,
          ...transformQselectDate(data, { invoiceDateRange: 'invoicingDate' }),
          ...transformSupplierData(queryParams?.belongSupplierCompanyId, {
            supCompanyPropCode: 'belongSupplierCompanyId',
            supPropCode: 'belongSupplierId',
          }),
          // ...dataParams,
        },
      };
    },
  },
});

const mainTableCheckDs = (activeKey) => ({
  autoQuery: false,
  selection: 'multiple',

  cacheSelection: true,
  primaryKey: 'invoiceHeaderId',
  pageSize: 20,
  // pageSize: ,

  fields: [
    {
      name: 'invoiceStatus',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_STATUS',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceStatusMeaning').d('发票状态'),
    },
    {
      name: 'invoiceStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceStatusMeaning').d('发票状态'), // SSTA.CHARGE_STATUS
    },
    {
      name: 'checkStatus',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_CHECK_STATUS',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkStatusMeaning').d('查验状态'),
    },
    {
      name: 'checkStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkStatusMeaning').d('查验状态'),
    },
    {
      name: 'validateMessage',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.validateMessage').d('查验状态说明'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.operation').d('操作'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.reve2rs2eNum').d('附件查看'),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
    },
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTypeMeaning').d('发票类型'),
    },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.InvoiceCode').d('发票代码'),
    },
    {
      name: 'invoiceNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTel').d('发票号码'),
    },
    {
      name: 'invoicingDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoicingDate').d('开票日期'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.notHaveMoney.').d('不含税金额'),
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxAmount').d('税额'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxInclssudedAmount').d('价税合计'),
    },
    {
      name: 'checkCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkCode').d('校验码'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.remark').d('备注（票面）'),
    },
    {
      name: 'memo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.memo').d('备忘说明'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方名称'),
    },
    {
      name: 'supUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supUnifiedSocialCode').d('销方纳税人识别号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.companyName').d('购方名称'),
    },
    {
      name: 'purUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.purUnifiedSocialCode').d('购方纳税人识别号'),
    },
    {
      name: 'invoiceSourceMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceSource').d('进池来源'),
    },
    {
      name: 'checkDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkDate').d('查验日期'),
    },
    {
      name: 'fileUrl',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.FileURL').d('文件URL'),
    },
    {
      name: 'uniSee',
      type: 'string',
      label: intl.get(`ssta.costSheet.view.message.checkOCRFile`).d('OCR识别文件'),
    },
    {
      name: 'aiAttachmentUrl',
      type: 'string',
      label: intl.get(`ssta.common.model.common.aiRecognizeFile`).d('AI识别文件'),
    },
    {
      name: 'ofdFileUrl',
      type: 'string',
      label: intl.get('ssta.common.view.message.ofdFileUrl').d('OFD文件'),
    },
    {
      name: 'documentStatus',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_DOC_STATUS',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.documentStatusMeaning').d('单据状态'),
    },
    {
      name: 'documentStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.documentStatusMeaning').d('单据状态'),
    },
    {
      name: 'associatedDocumentNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.associatedDocumentNum').d('关联单据'),
    },
    {
      name: 'cancelledFlag',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.cancelledsFlag').d('取消标识'),
    },
    {
      name: 'cancelledFlagMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.cancelledsFlag').d('取消标识'),
    },
    {
      name: 'exceptionStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatusMeaning').d('异常标识'),
    },
    {
      name: 'sumCheckTimes',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.revesng').d('累计查验次数'),
    },
    {
      name: 'checkTimes',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.todayCheckTimes').d('当天查验次数'),
    },
    // 关联表单的
    {
      name: 'invoiceTypeList',
      type: 'string',

      lookupCode: 'SSTA.INVOICE_POOL_TYPE',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxType').d('发票类型'),
    },

    {
      name: 'companyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.buier').d('购方'),
    },
    {
      name: 'supplierCompanyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH.SUPPLIER',

      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方'),
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierCompanyNameLov.supplierTenantId',
    },
    // 聚合信息的
    {
      name: 'statusInfo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatus').d('状态信息'),
    },
    {
      name: 'handle',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatus').d('操作'),
    },
    {
      name: 'keyInfo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.keyinfo').d('关键查验信息'),
    },
    {
      name: 'otherInvoiceInfo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.otherInfo').d('其他票面信息'),
    },
    {
      name: 'urlfield',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.urlfield').d('文件信息'),
    },
    {
      name: 'uploadfield',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.reve2rs2eNum').d('附件查看'),
    },
    {
      name: 'otherInfo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.otherInfos').d('其他信息'),
    },
    // 二阶段优化新增列字段
    {
      name: 'belongCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.belongCompanyName').d('所属公司'),
    },
    {
      name: 'belongSupplierCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.belongSupplierCompanyName').d('所属供应商'),
    },
  ],
  queryParameter: paramsMap[activeKey],
  transport: {
    read: ({ data }) => {
      // console.log(queryParams)
      const customizeUnitCode = [
        'SSTA.PURINVOICE_POOL_LIST.FINISHED_GRID',
        'SSTA.PURINVOICE_POOL_LIST.SEARCH_BAR_UNCHECKED',
      ].join();
      const { ...otherData } = data;
      const queryParams = getDatas(otherData);
      return {
        // url: `/ssta/v1/${organizationId}/invoice-header/supplier/page`,
        url: `/ssta/v1/${organizationId}/invoice-header/purchaser/page?customizeUnitCode=${customizeUnitCode}`,

        method: 'GET',
        data: {
          ...queryParams,
          ...transformQselectDate(data, { invoiceDateRange: 'invoicingDate' }),
          ...transformSupplierData(queryParams?.belongSupplierCompanyId, {
            supCompanyPropCode: 'belongSupplierCompanyId',
            supPropCode: 'belongSupplierId',
          }),
          // ...dataParams,
        },
      };
    },
  },
});

const mainTableUncheckDs = (activeKey) => ({
  autoQuery: false,
  selection: 'multiple',

  cacheSelection: true,
  primaryKey: 'invoiceHeaderId',
  pageSize: 20,
  // pageSize: ,

  fields: [
    {
      name: 'invoiceStatus',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_STATUS',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceStatusMeaning').d('发票状态'),
    },
    {
      name: 'invoiceStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceStatusMeaning').d('发票状态'), // SSTA.CHARGE_STATUS
    },
    {
      name: 'checkStatus',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_CHECK_STATUS',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkStatusMeaning').d('查验状态'),
    },
    {
      name: 'checkStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkStatusMeaning').d('查验状态'),
    },
    {
      name: 'validateMessage',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.validateMessage').d('查验状态说明'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.operation').d('操作'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.reve2rs2eNum').d('附件查看'),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
    },
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTypeMeaning').d('发票类型'),
    },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.InvoiceCode').d('发票代码'),
    },
    {
      name: 'invoiceNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTel').d('发票号码'),
    },
    {
      name: 'invoicingDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoicingDate').d('开票日期'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.notHaveMoney.').d('不含税金额'),
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxAmount').d('税额'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxInclssudedAmount').d('价税合计'),
    },
    {
      name: 'checkCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkCode').d('校验码'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.remark').d('备注（票面）'),
    },
    {
      name: 'memo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.memo').d('备忘说明'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方名称'),
    },
    {
      name: 'supUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supUnifiedSocialCode').d('销方纳税人识别号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.companyName').d('购方名称'),
    },
    {
      name: 'purUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.purUnifiedSocialCode').d('购方纳税人识别号'),
    },
    {
      name: 'invoiceSourceMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceSource').d('进池来源'),
    },
    {
      name: 'checkDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkDate').d('查验日期'),
    },
    {
      name: 'fileUrl',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.FileURL').d('文件URL'),
    },
    {
      name: 'uniSee',
      type: 'string',
      label: intl.get(`ssta.costSheet.view.message.checkOCRFile`).d('OCR识别文件'),
    },
    {
      name: 'aiAttachmentUrl',
      type: 'string',
      label: intl.get(`ssta.common.model.common.aiRecognizeFile`).d('AI识别文件'),
    },
    {
      name: 'ofdFileUrl',
      type: 'string',
      label: intl.get('ssta.common.view.message.ofdFileUrl').d('OFD文件'),
    },
    {
      name: 'documentStatus',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_DOC_STATUS',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.documentStatusMeaning').d('单据状态'),
    },
    {
      name: 'documentStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.documentStatusMeaning').d('单据状态'),
    },
    {
      name: 'associatedDocumentNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.associatedDocumentNum').d('关联单据'),
    },
    {
      name: 'cancelledFlag',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.cancelledsFlag').d('取消标识'),
    },
    {
      name: 'cancelledFlagMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.cancelledsFlag').d('取消标识'),
    },
    {
      name: 'exceptionStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatusMeaning').d('异常标识'),
    },
    {
      name: 'sumCheckTimes',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.revesng').d('累计查验次数'),
    },
    {
      name: 'checkTimes',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.todayCheckTimes').d('当天查验次数'),
    },
    // 关联表单的
    {
      name: 'invoiceTypeList',
      type: 'string',

      lookupCode: 'SSTA.INVOICE_POOL_TYPE',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxType').d('发票类型'),
    },

    {
      name: 'companyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.buier').d('购方'),
    },
    {
      name: 'supplierCompanyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH.SUPPLIER',

      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方'),
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierCompanyNameLov.supplierTenantId',
    },
    // 聚合信息的
    {
      name: 'statusInfo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatus').d('状态信息'),
    },
    {
      name: 'handle',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatus').d('操作'),
    },
    {
      name: 'keyInfo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.keyinfo').d('关键查验信息'),
    },
    {
      name: 'otherInvoiceInfo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.otherInfo').d('其他票面信息'),
    },
    {
      name: 'urlfield',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.urlfield').d('文件信息'),
    },
    {
      name: 'uploadfield',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.reve2rs2eNum').d('附件查看'),
    },
    {
      name: 'otherInfo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.otherInfos').d('其他信息'),
    },
    // 二阶段优化新增列字段
    {
      name: 'belongCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.belongCompanyName').d('所属公司'),
    },
    {
      name: 'belongSupplierCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.belongSupplierCompanyName').d('所属供应商'),
    },
  ],
  queryParameter: paramsMap[activeKey],
  transport: {
    read: ({ data }) => {
      // console.log(queryParams)
      const customizeUnitCode = [
        'SSTA.PURINVOICE_POOL_LIST.UNCHECK_GRID',
        'SSTA.PURINVOICE_POOL_LIST.SEARCH_BAR_CHECKED',
      ].join();
      const { ...otherData } = data;
      const queryParams = getDatas(otherData);
      return {
        // url: `/ssta/v1/${organizationId}/invoice-header/supplier/page`,
        url: `/ssta/v1/${organizationId}/invoice-header/purchaser/page?customizeUnitCode=${customizeUnitCode}`,

        method: 'GET',
        data: {
          ...queryParams,
          ...transformQselectDate(data, { invoiceDateRange: 'invoicingDate' }),
          ...transformSupplierData(queryParams?.belongSupplierCompanyId, {
            supCompanyPropCode: 'belongSupplierCompanyId',
            supPropCode: 'belongSupplierId',
          }),
          // ...dataParams,
        },
      };
    },
  },
});

const choseInvoicePoolDs = () => ({
  // primaryKey: 'invoiceHeaderId',
  // autoQuery: true,
  selection: 'multiple',
  // table表单显示的字段
  fields: [
    // 选择发票池
    {
      name: 'param',
      type: 'string',
      // lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      // placeholder: '222'
      // label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.argument').d('输入购方/供方名称，发票号码，发票代码'),
      // placeholder: '1111'
    },
    {
      name: 'date',
      type: 'date',
      // range: ['invoicingDateFrom', 'invoicingDateTo'],

      // defaultValue: { invoicingDateFrom: moment().subtract(6, 'month'), invoicingDateTo: moment() },
      // label: intl
      //   .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.dateRangse')
      //   .d('开票日期'),
      transformRequest: (value) =>
        value
          ? {
              invoicingDateFrom: getMomentDate(value.invoicingDateFrom, getDateTimeFormat()),
              invoicingDateTo: getMomentDate(value.invoicingDateTo, getDateTimeFormat()),
            }
          : {},
    },
    {
      name: 'invoicingDateFrom',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.creationDateStart').d('开票日期从'),
      transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
    },
    {
      name: 'invoicingDateTo',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.creationDateEnd').d('开票日期至'),
      transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
    },
    // 选择发票池
    {
      name: 'invoiceStatus',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_STATUS',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceStatusMeaning').d('发票状态'),
    },
    {
      name: 'invoiceStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceStatusMeaning').d('发票状态'), // SSTA.CHARGE_STATUS
    },
    {
      name: 'checkStatus',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_CHECK_STATUS',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkStatusMeaning').d('查验状态'),
    },
    {
      name: 'checkStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkStatusMeaning').d('查验状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.operation').d('操作'),
    },

    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTypeMeaning').d('发票类型'),
    },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.InvoiceCode').d('发票代码'),
    },
    {
      name: 'invoiceNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTel').d('发票号码'),
    },
    {
      name: 'invoicingDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoicingDate').d('开票日期'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.notHaveMoneyTax.').d('发票不含税金额'),
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxAmountInvoice').d('发票税额'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxInclssudedAmount').d('价税合计'),
    },
    {
      name: 'checkCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkCode').d('校验码'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.remark').d('备注（票面）'),
    },
    {
      name: 'memo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.memo').d('备忘说明'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方名称'),
    },
    {
      name: 'supUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supUnifiedSocialCode').d('销方纳税人识别号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.companyName').d('购方名称'),
    },
    {
      name: 'purUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.purUnifiedSocialCode').d('购方纳税人识别号'),
    },
    {
      name: 'invoiceSource',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceSource').d('进池来源'),
    },
    {
      name: 'checkDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkDate').d('查验日期'),
    },
    {
      name: 'fileUrl',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.FileUrl').d('文件URL'),
    },
    {
      name: 'h',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceToPreview').d('发票预览'),
    },
    {
      name: 'g',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.propFilePreview').d('附件查看'),
    },
    {
      name: 'documentStatus',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_DOC_STATUS',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.documentStatusMeaning').d('单据状态'),
    },
    {
      name: 'documentStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.documentStatusMeaning').d('单据状态'),
    },
    {
      name: 'associatedDocumentNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.associatedDocumentNum').d('关联单据'),
    },
    {
      name: 'cancelledFlag',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.cancelledsFlag').d('取消标识'),
    },
    {
      name: 'exceptionStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatusMeaning').d('异常标识'),
    },
    {
      name: 'sumCheckTimes',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.sumCheckTimes').d('累计查验次数'),
    },
    {
      name: 'checkTimes',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.todayCheckTimes').d('当天查验次数'),
    },
    // 关联表单的
    {
      name: 'invoiceTypeList',
      type: 'string',

      lookupCode: 'SSTA.INVOICE_POOL_TYPE',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxType').d('发票类型'),
    },

    {
      name: 'companyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.buier').d('购方'),
    },
    {
      name: 'supplierCompanyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH.SUPPLIER',

      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方'),
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierCompanyNameLov.supplierTenantId',
    },
  ],

  transport: {
    read: ({ data }) => {
      return {
        url: `/ssta/v1/${organizationId}/invoice-header/purchaser/select-from-pool`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_TAX_POOL',
        },
      };
    },
  },
});

export { mainTableDs, choseInvoicePoolDs, mainTableCheckDs, mainTableUncheckDs };
