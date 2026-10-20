import intl from 'utils/intl';
import { getCurrentOrganizationId, getUserOrganizationId, getCurrentUserId } from 'utils/utils';
import { isNil } from 'lodash';
import { BUCKET_NAME, BUCKET_DIRECTORY, MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';
import { conversionUpdate, getDynamicLabel } from '@/routes/components/utils';

const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();
const userId = getCurrentUserId();

const basicInfo = () => ({
  dataToJSON: 'all',
  autoCreate: true,
  fields: [
    {
      name: 'displayPoNum',
      label: intl.get('sodr.workspace.model.common.displayPoNum').d('订单编号'),
      disabled: true,
    },
    {
      name: 'poTypeId',
      label: intl.get('sodr.workspace.model.common.poTypeId').d('订单类型'),
      type: 'object',
      lovCode: 'SPUC_ORDER_TYPE',
      required: true,
      disabled: true,
      transformResponse: (value, object) =>
        object?.poTypeId
          ? {
              orderTypeId: object?.poTypeId,
              orderTypeCode: object.orderTypeCode,
              orderTypeName: object.poTypeDesc,
              returnOrderFlag: object.returnOrderFlag,
            }
          : null,
      transformRequest: (value) => {
        return value?.orderTypeId || value?.poTypeId;
      },
    },
    // {
    //   name: 'poTypeId',
    //   bind: 'poTypeLov.orderTypeId',
    // },
    {
      name: 'poTypeCode',
      bind: 'poTypeId.orderTypeCode',
    },
    {
      name: 'poTypeDesc',
      bind: 'poTypeId.orderTypeName',
    },
    {
      name: 'returnOrderFlag',
      bind: 'poTypeId.returnOrderFlag',
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
      disabled: true,
      // dynamicProps: {
      //   precision: ({ record }) => record.get('financialPrecision'),
      // },
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
      disabled: true,
      // dynamicProps: {
      //   precision: ({ record }) => record.get('financialPrecision'),
      // },
    },
    {
      name: 'quantityTotal',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.quantityTotal').d('总数量'),
      disabled: true,
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      disabled: true,
      transformResponse: (value, object) => {
        return object?.currencyCode
          ? {
              currencyCode: object?.currencyCode,
            }
          : null;
      },

      transformRequest: (value) => {
        return value?.currencyCode;
      },
    },
    {
      name: 'defaultPrecision',
      bind: 'currencyCode.defaultPrecision',
    },
    {
      name: 'creationDate',
      label: intl.get('sodr.workspace.model.common.creationDate').d('创建日期'),
      type: 'dateTime',
      disabled: true,
    },
    {
      name: 'poSourcePlatform',
      label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
      lookupCode: 'SPRM.SRC_PLATFORM',
      disabled: true,
    },
    {
      name: 'termsId',
      label: intl.get('sodr.workspace.model.common.termsId').d('付款条款'),
      type: 'object',
      lovCode: 'SMDM.PAYMENT.TERM',
      lovPara: { tenantId },
      disabled: true,
      transformResponse: (value) => value && { termId: value },
      transformRequest: (value) => value?.termId,
    },
    // {
    //   name: 'termsId',
    //   bind: 'termsLov.termId',
    // },
    {
      name: 'termsName',
      bind: 'termsId.termName',
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
      maxLength: 480,
      transformRequest: (value) => value || '',
      disabled: true,
    },
    // 默认隐藏字段
    {
      name: 'domesticCurrencyCode',
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      label: intl.get('sodr.workspace.model.common.domesticCurrencyCode').d('本币币种'),
      disabled: true,
      transformResponse: (value, object) => {
        return object?.currencyCode
          ? {
              currencyCode: object?.domesticCurrencyCode,
            }
          : null;
      },

      transformRequest: (value) => {
        return value?.currencyCode;
      },
    },
    // {
    //   name: 'domesticCurrencyCode',
    //   bind: 'domesticCurrencyLov.currencyCode',
    // },
    {
      name: 'domesticTaxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticTaxIncludeAmounts').d('本币金额(含税)'),
      disabled: true,
      // dynamicProps: {
      //   precision: ({ record }) => record.get('domesticFinancialPrecision'),
      // },
    },
    {
      name: 'domesticAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticAmounts').d('本币金额(不含税)'),
      disabled: true,
      // dynamicProps: {
      //   precision: ({ record }) => record.get('domesticFinancialPrecision'),
      // },
    },
    {
      name: 'sourceOfTransferOrder',
      lookupCode: 'SPUC.ORDER.SOURCE_OF_TRANSFER_ORDER',
      label: intl.get('sodr.workspace.model.common.sourceOfTransferOrder').d('转单来源'),
      disabled: true,
    },
    {
      name: 'sourceBillTypeCode',
      lookupCode: 'SPFM.BUSINESS_CATEGORY',
      label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('来源单据'),
      disabled: true,
    },
    {
      name: 'supplierOrderTypeCode',
      label: intl.get('sodr.workspace.model.common.supplierOrderTypeCode').d('京东e卡-code'),
      disabled: true,
    },

    // 附件字段
    {
      name: 'purchaserInnerAttachmentUuid',
      label: intl.get('sodr.workspace.model.common.attachmentUUID').d('采购方附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: BUCKET_DIRECTORY,
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sodr.workspace.model.common.attachmentUUID').d('采购方附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: BUCKET_DIRECTORY,
    },
    {
      name: 'supplierAttachmentUuid',
      type: 'attachment',
      label: intl.get('sodr.workspace.model.common.supplierAttachmentId').d('供应商附件'),
      bucketName: BUCKET_NAME,
      bucketDirectory: BUCKET_DIRECTORY,
    },
    {
      name: 'createdUnitId',
      label: intl.get('sodr.workspace.model.common.createdUnitName').d('创建人部门'),
      type: 'object',
      lovCode: 'SODR.UNIT_NFO',
      disabled: true,
      transformResponse: (value) => value && { unitId: value },
      transformRequest: (value) => {
        return value?.unitId;
      },
    },
    {
      name: 'createdUnitName',
      bind: 'createdUnitId.unitName',
    },
  ],
  queryParameter: {
    camp: 1,
    poEntryPoint: 'PO_MAINTAIN_DETAIL',
    customizeUnitCode: [
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.BASICINFO_NEW',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.BILLINGINFO',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.RECEIPTINFO',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.ATTACHMENTINFO_EXTERNAL',
    ].toString(),
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        i.init({
          prepayFlag: isNil(i.get('prepayFlag')) ? 0 : i.get('prepayFlag'),
        });
      });
    },
    update: ({ name, value, record }) => {
      if (name === 'termsId') {
        const { prepayFlag } = value || {};
        record.set({
          prepayFlag,
        });
      }
    },
  },
});

const organizationInfo = () => ({
  dataToJSON: 'dirty-field',
  autoCreate: true,
  fields: [
    {
      name: 'companyId',
      label: intl.get('sodr.workspace.model.common.company').d('公司'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      disabled: true,
      lovPara: {
        tenantId,
      },
      transformResponse: (value, object) =>
        object?.companyId
          ? {
              companyId: object?.companyId,
              companyNum: object.companyCode,
              companyName: object.companyName,
            }
          : null,
      transformRequest: (value) => {
        return value?.companyId;
      },
    },
    {
      name: 'companyCode',
      bind: 'companyId.companyCode',
    },
    {
      name: 'companyName',
      bind: 'companyId.companyName',
    },
    {
      name: 'supplierLov',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
      type: 'object',
      lovCode: 'SODR.AUTH_SUPPLIER_LIFE_CYCLE',
      ignore: 'always',
      disabled: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            userId,
            tenantId,
            organizationId,
            companyId: record.get('companyId')?.companyId,
          };
        },
      },
    },
    {
      name: 'displaySupplierName',
      bind: 'supplierLov.displaySupplierName',
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierLov.supplierCompanyId',
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierLov.supplierCompanyName',
    },
    {
      name: 'supplierId',
      bind: 'supplierLov.supplierId',
    },
    {
      name: 'supplierName',
      bind: 'supplierLov.supplierName',
    },
    {
      name: 'supplierCode',
      bind: 'supplierLov.supplierNum',
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierLov.supplierTenantId',
    },
    {
      name: 'ouId',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.OU',
      disabled: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId,
            organizationId,
            companyId: record.get('companyId')?.companyId,
          };
        },
      },
      transformResponse: (value, object) =>
        object?.ouId
          ? {
              ouId: object?.ouId,
              ouCode: object.ouCode,
              ouName: object.ouName,
            }
          : null,
      transformRequest: (value) => {
        return value?.ouId;
      },
    },
    // {
    //   name: 'ouId',
    //   bind: 'ouLov.ouId',
    // },
    {
      name: 'ouCode',
      bind: 'ouId.ouCode',
    },
    {
      name: 'ouName',
      bind: 'ouId.ouName',
    },
    {
      name: 'purchaseOrgId',
      label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PUR_OUID_ORG',
      disabled: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            organizationId,
            ouId: record.get('ouId')?.ouId,
          };
        },
      },
      transformResponse: (value, object) =>
        object?.purchaseOrgId
          ? {
              purchaseOrgId: object?.purchaseOrgId,
            }
          : null,
      transformRequest: (value) => {
        return value?.purchaseOrgId;
      },
    },
    // {
    //   name: 'purchaseOrgId',
    //   bind: 'purchaseOrgLov.purchaseOrgId',
    // },
    {
      name: 'purchaseOrgName',
      bind: 'purchaseOrgId.organizationName',
    },
    {
      name: 'agentId',
      label: intl.get('sodr.workspace.model.common.agentId').d('采购员'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PUR_ORG_AGENT',
      required: true,
      // disabled: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            organizationId,
            purchaseOrgId: record.get('purchaseOrgId')?.purchaseOrgId,
          };
        },
        disabled: ({ record }) => record.getPristineValue('agentId')?.purchaseOrgId,
      },
      transformResponse: (value, object) =>
        object?.agentId
          ? {
              purchaseAgentId: object?.agentId,
            }
          : null,
      transformRequest: (value) => {
        return value?.purchaseAgentId;
      },
    },
    // {
    //   name: 'agentId',
    //   bind: 'agentLov.purchaseAgentId',
    // },
    {
      name: 'agentName',
      bind: 'agentId.purchaseAgentName',
    },
    // 默认隐藏字段
    {
      name: 'settleCompanyId',
      label: intl.get(`sodr.common.model.common.settleCompanyName`).d('结算公司'), // H
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      disabled: true,
      lovPara: {
        tenantId,
      },
      transformResponse: (value, object) => {
        return (
          object?.settleCompanyId && {
            companyId: object?.settleCompanyId,
            companyNum: object?.settleCompanyNum,
            companyName: object?.settleCompanyName,
          }
        );
      },
      transformRequest: (value) => value?.companyId || null,
    },
    {
      name: 'settleCompanyNum',
      bind: 'settleCompanyId.companyNum',
    },
    {
      name: 'settleCompanyName',
      bind: 'settleCompanyId.companyName',
    },
    {
      name: 'settleSupplierLov',
      label: intl.get('sodr.workspace.model.common.settleSupplierId').d('结算供应商'),
      type: 'object',
      lovCode: 'SODR.AUTH_SUPPLIER_LIFE_CYCLE',
      ignore: 'always',
      disabled: true,
      transformResponse: (value, object) => {
        return object?.settleErpSupplierId || object?.settleSupplierId
          ? {
              ...value,
              displaySupplierName: object?.settleErpSupplierName || object?.settleSupplierName,
            }
          : null;
      },
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            userId,
            tenantId,
            organizationId,
            companyId: record.get('companyId')?.companyId,
          };
        },
      },
    },
    {
      name: 'settleTempKey',
      bind: 'settleSupplierLov.tempKey',
    },
    {
      name: 'settleSupplierId',
      bind: 'settleSupplierLov.supplierCompanyId',
    },
    {
      name: 'settleSupplierCode',
      bind: 'settleSupplierLov.supplierCompanyNum',
    },
    {
      name: 'settleSupplierName',
      bind: 'settleSupplierLov.supplierCompanyName',
    },
    {
      name: 'settleErpSupplierId',
      bind: 'settleSupplierLov.supplierId',
    },
    {
      name: 'settleErpSupplierCode',
      bind: 'settleSupplierLov.supplierNum',
    },
    {
      name: 'settleErpSupplierName',
      bind: 'settleSupplierLov.supplierName',
    },
    {
      name: 'settleSupplierTenantId',
      bind: 'settleSupplierLov.supplierTenantId',
    },
  ],
});

const detailInfo = () => ({
  dataToJSON: 'all',
  pageSize: 20,
  modifiedCheck: false,
  fields: [
    {
      name: 'benchmarkPriceType',
      transformRequest: (value, record) => {
        const basicCurrent = record.dataSet.getState('basicInfoDs')?.current;
        const benchmarkPriceType = value ?? basicCurrent.get('benchmarkPriceType');
        return benchmarkPriceType;
      },
    },
    {
      name: 'displayStatusCode',
      label: intl.get('sodr.workspace.model.common.displayStatusCode').d('状态'),
    },
    {
      name: 'displayLineNum',
      label: intl.get('sodr.workspace.model.common.displayLineNum').d('行号'),
    },
    {
      name: 'displayLineLocationNum',
      label: intl.get('sodr.workspace.model.common.displayLineLocationNum').d('发运号'),
    },
    {
      name: 'productNum',
      label: intl.get('sodr.workspace.model.common.productNum').d('商品编码'),
      disabled: true,
    },
    {
      name: 'productName',
      label: intl.get('sodr.workspace.model.common.productName').d('商品名称'),
      disabled: true,
    },
    {
      name: 'catalogName',
      label: intl.get('sodr.workspace.model.common.catalogName').d('商品目录'),
      disabled: true,
    },
    {
      name: 'itemId',
      label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
      type: 'object',
      lovCode: 'SPUC.ITEM_PRICE_CODE',
      textField: 'itemCode',
      disabled: true,
      dynamicProps: {
        lovPara: ({ dataSet, record }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          const basicInfoDs = dataSet.getState('basicInfoDs');
          const basicRecord = basicInfoDs.records[0];
          const orgRecord = organizationInfoDs?.records && organizationInfoDs.records[0];
          const tieredPricingFlag = record.get('tieredPricingFlag');
          const returnedFlag = record.get('returnedFlag');
          const { companyId, companyNum } = orgRecord?.get('companyId') || {};
          const { ouId, ouCode } = orgRecord?.get('ouId') || {};
          const { orderTypeCode, returnOrderFlag } = basicRecord.get('poTypeId') || {};
          return {
            organizationId,
            tenantId,
            supplierCompanyId: orgRecord?.get('supplierCompanyId'),
            priceShieldFlag: returnedFlag !== 1 && returnOrderFlag !== 1 ? tieredPricingFlag : null,
            companyId,
            ouId,
            ouCode,
            companyCode: companyNum,
            orderTypeCode,
            invOrganizationId: record.get('invOrganizationId')?.organizationId,
          };
        },
      },
      transformResponse: (value, object) => {
        return object?.itemId
          ? {
              itemId: object?.itemId,
            }
          : null;
      },

      transformRequest: (value) => {
        return value?.itemId;
      },
    },
    // {
    //   name: 'itemId',
    //   bind: 'itemLov.itemId',
    // },
    {
      name: 'itemCode',
      bind: 'itemId.itemCode',
    },
    {
      name: 'itemName',
      label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
      disabled: true,
    },
    {
      name: 'secondaryQuantity',
      label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      min: 0,
      disabled: true,
    },
    {
      name: 'secondaryUomId',
      label: intl.get('sodr.workspace.model.common.uomId').d('单位'),
      type: 'object',
      lovCode: 'SMDM_ITEM_ORG_UOM',
      disabled: true,
      dynamicProps: {
        required: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
        lovPara: ({ record }) => ({
          itemId: record.get('itemId')?.itemId,
          primaryUomId: record.get('uomId')?.uomId,
        }),
      },
      transformResponse: (value, object) =>
        object?.secondaryUomId
          ? {
              uomId: object?.secondaryUomId,
              uomCode: object?.secondaryUomCode,
              uomName: object?.secondaryUomName,
              uomPrecision: object?.secondaryUomPrecision,
              uomCodeAndName: object?.secondaryUomCodeAndName,
            }
          : null,
      transformRequest: (value) => {
        return value?.uomId;
      },
    },
    {
      name: 'secondaryUomName',
      bind: 'secondaryUomId.uomName',
    },
    {
      name: 'secondaryUomCode',
      bind: 'secondaryUomId.uomCode',
    },
    {
      name: 'secondaryUomCodeAndName',
      bind: 'secondaryUomId.uomCodeAndName',
    },
    {
      name: 'secondaryUomPrecision',
      bind: 'secondaryUomId.secondaryUomPrecision',
    },
    {
      name: 'quantity',
      type: 'number',
      min: 0,
      max: MAX_QUAN_NUMBER,
      disabled: true,
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
      },
    },
    {
      name: 'uomId',
      type: 'object',
      lovCode: 'SMDM.UOM',
      required: true,
      disabled: true,
      transformResponse: (value, object) => {
        return object?.uomId
          ? {
              uomId: object?.uomId,
            }
          : null;
      },

      transformRequest: (value) => {
        return value?.uomId;
      },
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
      },
    },
    {
      name: 'uomName',
      bind: 'uomId.uomName',
    },
    {
      name: 'uomCode',
      bind: 'uomId.uomCode',
    },
    {
      name: 'uomCodeAndName',
      bind: 'uomId.uomCodeAndName',
    },
    {
      name: 'uomPrecision',
      bind: 'uomId.uomPrecision',
    },
    {
      name: 'needByDate',
      label: intl.get('sodr.workspace.model.common.needByDate').d('需求日期'),
      type: 'date',
      required: true,
      disabled: true,
    },
    {
      name: 'unitPrice',
      label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
      type: 'number',
      min: 0,
      max: MAX_QUAN_NUMBER,
      disabled: true,
      // dynamicProps: {
      //   precision: ({ record }) => record.get('defaultPrecision'),
      // },
    },
    {
      name: 'enteredTaxIncludedPrice',
      label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrices').d('单价(含税)'),
      type: 'number',
      min: 0,
      max: MAX_QUAN_NUMBER,
      disabled: true,
      // dynamicProps: {
      //   precision: ({ record }) => record.get('defaultPrecision'),
      // },
    },
    {
      name: 'taxId',
      label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
      type: 'object',
      lovCode: 'SMDM.TAX',
      disabled: true,
      lovPara: {
        enabledFlag: 1,
        tenantId,
      },
      transformResponse: (value, object) => {
        return object?.taxId
          ? {
              taxId: object?.taxId,
            }
          : null;
      },

      transformRequest: (value) => {
        return value?.taxId;
      },
    },
    // {
    //   name: 'taxId',
    //   bind: 'taxLov.taxId',
    // },
    {
      name: 'taxRate',
      bind: 'taxId.taxRate',
    },
    {
      name: 'taxCode',
      bind: 'taxId.taxCode',
    },
    {
      name: 'taxRateType',
      bind: 'taxId.taxRateType',
    },
    // {
    //   name: 'lastPurchasePrice',
    //   label: intl.get('sodr.workspace.model.common.lastPurchasePrice').d('最近一次采购价'),
    //   type: 'number',
    // },
    {
      name: 'unitPriceBatch',
      label: intl.get('sodr.workspace.model.common.unitPriceBatch').d('每'),
      type: 'number',
      min: 0,
      max: MAX_QUAN_NUMBER,
      disabled: true,
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      disabled: true,
      transformResponse: (value, object) => {
        return object?.currencyCode
          ? {
              currencyCode: object?.currencyCode,
            }
          : null;
      },

      transformRequest: (value) => {
        return value?.currencyCode;
      },
    },
    // {
    //   name: 'currencyCode',
    //   bind: 'currencyLov.currencyCode',
    // },
    {
      name: 'defaultPrecision',
      bind: 'currencyCode.defaultPrecision',
    },
    {
      name: 'categoryId',
      label: intl.get('sodr.workspace.model.common.categoryId').d('物料分类'),
      type: 'object',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      disabled: true,
      optionsProps: {
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
      },
      transformResponse: (value, object) => {
        return object?.categoryId
          ? {
              categoryId: object?.categoryId,
            }
          : null;
      },

      transformRequest: (value) => {
        return value?.categoryId;
      },
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId,
            enabledFlag: 1,
            itemId: record.get('itemId')?.itemId,
            businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
          };
        },
      },
    },
    // {
    //   name: 'categoryId',
    //   bind: 'categoryLov.categoryId',
    // },
    {
      name: 'categoryName',
      bind: 'categoryId.categoryName',
    },
    {
      name: 'invOrganizationId',
      label: intl.get('sodr.workspace.model.common.invOrganizationId').d('库存组织'),
      type: 'object',
      lovCode: 'SPUC.SMDM.INV_ORG',
      required: true,
      disabled: true,
      transformResponse: (value, object) =>
        object?.invOrganizationId
          ? {
              organizationName: object?.invOrganizationName,
              organizationId: object?.invOrganizationId,
            }
          : null,
      transformRequest: (value) => value?.organizationId,
      dynamicProps: {
        lovPara: ({ dataSet, record }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          const currentRecord = organizationInfoDs?.records && organizationInfoDs.records[0];
          return {
            enabledFlag: 1,
            tenantId,
            ouId: currentRecord?.get('ouId')?.ouId,
            itemId: record.get('itemId')?.itemId,
          };
        },
        // disabled: ({ record }) => record.getPristineValue('invOrganizationId')?.organizationId,
      },
    },
    // {
    //   name: 'invOrganizationId',
    //   bind: 'invOrganizationLov.organizationId',
    // },
    {
      name: 'invOrganizationName',
      bind: 'invOrganizationId.organizationName',
    },
    {
      name: 'invInventoryId',
      label: intl.get('sodr.workspace.model.common.invInventoryId').d('收货库房'),
      type: 'object',
      lovCode: 'SODR.INVENTORY',
      transformResponse: (value) => value && { inventoryId: value },
      transformRequest: (value) => value?.inventoryId,
      disabled: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            enabledFlag: 1,
            tenantId,
            organizationId: record.get('invOrganizationId')?.organizationId,
          };
        },
        // disabled: ({ record }) => !record.get('invOrganizationId')?.organizationId,
      },
    },
    // {
    //   name: 'invInventoryId',
    //   bind: 'invInventoryLov.inventoryId',
    // },
    {
      name: 'inventoryName',
      bind: 'invInventoryId.inventoryName',
    },
    {
      name: 'invLocationId',
      label: intl.get('sodr.workspace.model.common.invLocationId').d('收货库位'),
      type: 'object',
      lovCode: 'SRPM.LOCATION_BY_ORG_INV',
      disabled: true,
      transformResponse: (value, object) =>
        value && {
          locationId: object?.invLocationId,
        },
      transformRequest: (value) => value?.locationId,
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            enabledFlag: 1,
            inventoryId: record.get('invInventoryId')?.inventoryId,
            tenantId,
          };
        },
        // disabled: ({ record }) => !record.get('invInventoryId')?.inventoryId,
      },
    },
    // {
    //   name: 'invLocationId',
    //   bind: 'invLocationLov.locationId',
    // },
    {
      name: 'locationName',
      bind: 'invLocationId.locationName',
    },
    {
      name: 'shipToThirdPartyAddress',
      label: intl.get('sodr.workspace.model.common.receivingAddress').d('收货地址'),
      maxLength: 120,
      disabled: true,
    },
    {
      name: 'shipToThirdPartyContact',
      label: intl.get('sodr.workspace.model.common.shipToThirdPartyContact').d('联系人信息'),
      maxLength: 120,
      disabled: true,
    },
    {
      name: 'departmentId',
      label: intl.get('sodr.workspace.model.common.departmentId').d('部门'),
      type: 'object',
      lovCode: 'SPRM.USER_UNIT',
      lovPara: { tenantId },
      disabled: true,
      transformResponse: (value, object) =>
        value && {
          unitId: object?.departmentId,
          unitName: object?.departmentName,
        },
      transformRequest: (value) => value?.unitId,
    },
    // {
    //   name: 'departmentId',
    //   bind: 'departmentLov.unitId',
    // },
    {
      name: 'departmentName',
      bind: 'departmentId.unitName',
    },
    {
      name: 'costId',
      label: intl.get('sodr.workspace.model.common.costId').d('成本中心'),
      type: 'object',
      lovCode: 'SPRM.COST_CENTER_ID',
      transformResponse: (value) => value && { costId: value },
      transformRequest: (value) => value?.costId,
      disabled: true,
      dynamicProps: {
        // disabled: ({ dataSet }) => {
        //   const organizationInfoDs = dataSet.getState('organizationInfoDs');
        //   const orgRecord = organizationInfoDs.records[0];
        //   return !orgRecord.get('companyId')?.companyId;
        // },
        lovPara: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          const orgRecord = organizationInfoDs?.records && organizationInfoDs.records[0];
          return {
            companyId: orgRecord?.get('companyId')?.companyId,
            tenantId,
            ouId: orgRecord?.get('ouId')?.ouId,
          };
        },
      },
    },
    // {
    //   name: 'costId',
    //   bind: 'costLov.costId',
    // },
    {
      name: 'costCode',
      bind: 'costId.costCode',
    },
    {
      name: 'costName',
      bind: 'costId.costName',
    },
    {
      name: 'projectCategory',
      label: intl.get('sodr.workspace.model.common.projectCategory').d('项目类别'),
      type: 'object',
      lovCode: 'SPUC.PR_LINE_PROJECT_CATEHORY',
      disabled: true,
      transformResponse: (value) =>
        value && {
          value,
        },
      transformRequest: (value) => value?.value,
    },
    // {
    //   name: 'projectCategory',
    //   bind: 'projectCategoryLov.value',
    // },
    {
      name: 'projectCategoryMeaning',
      bind: 'projectCategory.meaning',
    },
    {
      name: 'displayPrNumAndDisplayPrLineNum',
      label: intl.get('sodr.workspace.model.common.prNumAndPrLineNums').d('采购申请号-行号'),
    },
    {
      name: 'prRequestedName',
      label: intl.get('sodr.workspace.model.common.prRequestedName').d('申请人'),
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
      maxLength: 480,
      transformRequest: (value) => value || '',
      disabled: true,
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sodr.workspace.model.common.lineAttachmentUuid').d('行附件'),
      type: 'attachment',
      disabled: true,
      bucketName: BUCKET_NAME,
      bucketDirectory: BUCKET_DIRECTORY,
    },
    // 默认隐藏字段
    {
      name: 'skuType',
      label: intl.get('sodr.workspace.model.common.skuType').d('定制品标识'),
    },
    {
      name: 'customUomName',
      label: intl.get('sodr.workspace.model.common.customUomName').d('定制单位'),
    },
    {
      name: 'customQuantity',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.skuType').d('定制数量'),
    },
    {
      name: 'packageQuantity',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.packageQuantity').d('份数'),
    },
    {
      name: 'customSpecsJson',
      label: intl.get('sodr.workspace.model.common.customSpecsJson').d('定制品属性'),
    },
    {
      name: 'customSpecs',
      label: intl.get('sodr.workspace.model.common.customSpecsJson').d('定制品属性'),
    },
    {
      name: 'productSpecsJson',
      label: intl.get('sodr.workspace.model.common.productSpecsJson').d('商品属性'),
    },
    {
      name: 'productBrand',
      label: intl.get(`sodr.common.model.common.productBrand`).d('商品品牌'),
    },
    {
      name: 'productModel',
      label: intl.get(`sodr.common.model.common.productModel`).d('商品规格'),
    },
    {
      name: 'packingList',
      label: intl.get(`sodr.common.model.common.packingList`).d('商品型号'),
    },
    {
      name: 'productSpecs',
      label: intl.get('sodr.workspace.model.common.productSpecsJson').d('商品属性'),
    },
    {
      name: 'accountSubjectId',
      label: intl.get('sodr.workspace.model.common.accountSubjectId').d('总账科目'),
      type: 'object',
      lovCode: 'SPRM.ACCOUNT_SUBJECT',
      transformResponse: (value, object) => {
        return object?.accountSubjectId
          ? {
              accountSubjectId: object?.accountSubjectId,
            }
          : null;
      },
      transformRequest: (value) => {
        return value?.accountSubjectId;
      },
      disabled: true,
      dynamicProps: {
        // disabled: ({ dataSet }) => {
        //   const organizationInfoDs = dataSet.getState('organizationInfoDs');
        //   const orgRecord = organizationInfoDs.records[0];
        //   return !orgRecord.get('companyId')?.companyId;
        // },
        lovPara: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          const orgRecord = organizationInfoDs?.records && organizationInfoDs.records[0];
          return {
            companyId: orgRecord?.get('companyId')?.companyId,
            tenantId,
          };
        },
      },
    },
    {
      name: 'accountSubjectNum',
      bind: 'accountSubjectId.accountSubjectNum',
    },
    {
      name: 'accountSubjectName',
      bind: 'accountSubjectId.accountSubjectName',
    },
    {
      name: 'wbsCode',
      label: intl.get('sodr.workspace.model.common.wbsCode').d('wbs元素'),
      type: 'object',
      lovCode: 'SPUC.WBS',
      disabled: true,
      transformResponse: (value, object) => {
        return object?.wbsCode
          ? {
              wbsCode: object?.wbsCode,
              wbsName: object?.wbs,
            }
          : null;
      },
      transformRequest: (value) => {
        return value ? value.wbsCode : '';
      },
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          const orgRecord = organizationInfoDs.current;
          return {
            tenantId,
            companyId: orgRecord.get('companyId')?.companyId,
            ouId: orgRecord.get('ouId')?.ouId,
          };
        },
      },
    },
    {
      name: 'wbs',
      bind: 'wbsCode.wbsName',
      transformRequest: (value) => value || '',
    },
    {
      name: 'internationalTelCode',
      label: intl.get('sodr.workspace.model.common.internationalTelCode').d('区号'),
      lookupCode: 'HPFM.IDD',
      transformResponse: (value, object) => (object?.receiveTelNum ? value : value || '+86'),
      transformRequest: (value) => value || '',
      dynamicProps: {
        disabled: ({ record }) => record.getField('receiveTelNum').disabled,
        // required: ({ record }) => record.getField('receiveTelNum').required,
      },
    },
    {
      name: 'receiveTelNum',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('sodr.workspace.model.common.receiveTelNum').d('联系电话'),
      transformRequest: (value) => value || '',
      disabled: true,
      // dynamicProps: {
      //   pattern: ({ record }) =>
      //     record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      // },
    },
    {
      name: 'brand',
      label: intl.get('sodr.workspace.model.common.brand').d('品牌'),
      disabled: true,
    },
    {
      name: 'specifications',
      label: intl.get('sodr.workspace.model.common.specifications').d('规格'),
      disabled: true,
    },
    {
      name: 'model',
      label: intl.get('sodr.workspace.model.common.model').d('型号'),
      disabled: true,
    },
    {
      name: 'accountAssignTypeId',
      type: 'object',
      lovCode: 'SPRM.ACCOUNT_ASSIGN_TYPE',
      label: intl.get('sodr.workspace.model.common.accountAssignTypeCode').d('账户分配类别'),
      lovPara: {
        lineType: 'PO_LINE',
        tenantId,
      },
      disabled: true,
      transformResponse: (value, object) => {
        return object?.accountAssignTypeId
          ? {
              accountAssignTypeId: object?.accountAssignTypeId,
            }
          : null;
      },
      transformRequest: (value) => {
        return value?.accountAssignTypeId;
      },
    },
    // {
    //   name: 'accountAssignTypeId',
    //   bind: 'accountAssignTypeLov.accountAssignTypeId',
    // },
    {
      name: 'accountAssignTypeCode',
      bind: 'accountAssignTypeId.accountAssignTypeCode',
    },
    {
      name: 'requiredFieldNames',
      bind: 'accountAssignTypeId.requiredFieldNames',
    },
    {
      name: 'domesticUnitPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticUnitPrices').d('本币单价(不含税)'),
      // dynamicProps: {
      //   precision: ({ dataSet }) =>
      //     dataSet.getState('basicInfoDs').current.get('domesticDefaultPrecision'),
      // },
    },
    {
      name: 'domesticLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticLineAmounts').d('本币金额(不含税)'),
      // dynamicProps: {
      //   precision: ({ dataSet }) =>
      //     dataSet.getState('basicInfoDs').current.get('domesticFinancialPrecision'),
      // },
    },
    {
      name: 'domesticTaxIncludedPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticTaxIncludedPrices').d('本币单价(含税)'),
      // dynamicProps: {
      //   precision: ({ dataSet }) =>
      //     dataSet.getState('basicInfoDs').current.get('domesticDefaultPrecision'),
      // },
    },
    {
      name: 'domesticTaxIncludedLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl
        .get('sodr.workspace.model.common.domesticTaxIncludedLineAmounts')
        .d('本币金额(含税)'),
      // dynamicProps: {
      //   precision: ({ dataSet }) =>
      //     dataSet.getState('basicInfoDs').current.get('domesticFinancialPrecision'),
      // },
    },
    {
      name: 'docFlow',
      label: intl.get(`sodr.workspace.model.common.docFlow`).d('单据流'),
    },
  ],
  queryParameter: {
    poEntryPoint: 'PO_MAINTAIN_DETAIL',
    camp: 2,
    sortType: 0,
    customizeUnitCode:
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.DETAILINFO,SODR.WORKSPACE_EC_CHANGE_DETAIL.DETAILINFO_FILTER',
  },
  events: {
    update: ({ name, record, value, dataSet }) => {
      const itemCode = record.get('itemCode');
      const basicInfoDs = dataSet.getState('basicInfoDs');
      const loading = basicInfoDs.getState('loading');
      const sodrEnabled = basicInfoDs.getState('doubleUnitEnabled');
      if (name === 'invOrganizationId') {
        const { receiveToleranceQuantity, receiveToleranceQuantityType } = value || {};
        record.set({
          invInventoryId: null,
          invLocationId: null,
          receiveToleranceQuantity,
          receiveToleranceQuantityType,
        });
      }
      if (name === 'itemId') {
        const {
          itemName,
          categoryId,
          categoryName,
          uomId,
          uomName,
          uomCode,
          uomPrecision,
          uomCodeAndName,
          secondaryUomId,
          secondaryUomName,
          secondaryUomCode,
          secondaryUomCodeAndName,
          secondaryUomPrecision,
          specifications,
          model,
        } = value || {};
        const categoryObj = categoryId && { categoryId, categoryName };
        const uomObj = uomId && { uomId, uomCode, uomName, uomPrecision, uomCodeAndName };
        const secondaryUomObj = secondaryUomId
          ? {
              uomId: secondaryUomId,
              uomCode: secondaryUomCode,
              uomName: secondaryUomName,
              uomPrecision: secondaryUomPrecision,
              uomCodeAndName: secondaryUomCodeAndName,
            }
          : uomObj;
        if (sodrEnabled) {
          record.set({ uomId: uomObj, secondaryUomId: secondaryUomObj });
          conversionUpdate({ dataSet, record, loading });
        } else {
          record.set({ secondaryUomId: uomObj, uomObj });
        }
        record.set({
          itemName,
          categoryId: categoryObj,
          uomId: uomObj,
          specifications,
          model,
        });
      }
      if (name === 'quantity' && !sodrEnabled) {
        record.set({ secondaryQuantity: value });
      }
      if (name === 'uomId' && !sodrEnabled) {
        const { uomId, uomName, uomCode, uomCodeAndName, uomPrecision } = value || {};
        const uomObj = uomId && {
          uomId,
          uomName,
          uomCode,
          uomCodeAndName,
          uomPrecision,
        };
        record.set({ secondaryUomId: uomObj });
      }
      if (name === 'secondaryUomId') {
        // 开启双单位 并且有 必备参数 换算出基本数量
        // const itemIdChanged = record.getField('itemId')?.isDirty(record);
        if (sodrEnabled && itemCode) {
          // if (itemIdChanged) return;
          conversionUpdate({ dataSet, record, loading });
        } else {
          // 不开双单位,修改后联动覆盖到基本单位
          const { uomId, uomName, uomCode, uomCodeAndName, uomPrecision } = value || {};
          const uomObj = uomId && {
            uomId,
            uomName,
            uomCode,
            uomCodeAndName,
            uomPrecision,
          };
          record.set({ uomId: uomObj });
        }
      }
      if (name === 'secondaryQuantity') {
        // 有物料编码 并且开启双单位换算出基本数量
        if (sodrEnabled && itemCode) {
          conversionUpdate({ dataSet, record, loading, value });
        } else {
          record.set({ quantity: value });
        }
      }
    },
  },
});

const receiptInfo = () => ({
  dataToJSON: 'all',
  fields: [
    {
      name: 'shipToLocationAddress',
      label: intl.get('sodr.workspace.model.common.shipToLocationAddress').d('收货方地址'),
      disabled: true,
    },
    {
      name: 'shipToLocContName',
      label: intl.get('sodr.workspace.model.common.shipToLocContName').d('收货方联系人'),
      disabled: true,
    },
    {
      name: 'shipToLocTelNum',
      label: intl.get('sodr.workspace.model.common.shipToLocTelNum').d('收货联系电话'),
      disabled: true,
    },
    {
      name: 'billToLocationAddress',
      label: intl.get('sodr.workspace.model.common.billToLocationAddress').d('收单方地址'),
      disabled: true,
    },
    {
      name: 'billToLocContName',
      label: intl.get('sodr.workspace.model.common.billToLocContName').d('收单方联系人'),
      disabled: true,
    },
    {
      name: 'billToLocTelNum',
      label: intl.get('sodr.workspace.model.common.billToLocTelNum').d('收单联系电话'),
      disabled: true,
    },
    {
      name: 'receiverEmailAddress',
      label: intl.get('sodr.workspace.model.common.receiverEmailAddress').d('收单邮箱'),
      disabled: true,
    },
  ],
});

const billingInfo = () => ({
  dataToJSON: 'all',
  fields: [
    {
      name: 'taxRegisterAddress',
      label: intl.get('sodr.workspace.model.common.taxRegisterAddress').d('税务登记地址'),
      disabled: true,
    },
    {
      name: 'taxRegisterNum',
      label: intl.get('sodr.workspace.model.common.taxRegisterNum').d('税号'),
      disabled: true,
    },
    {
      name: 'taxRegisterBank',
      label: intl.get('sodr.workspace.model.common.taxRegisterBank').d('开户行'),
      disabled: true,
    },
    {
      name: 'taxRegisterBankAccount',
      type: 'secret',
      label: intl.get('sodr.workspace.model.common.taxRegisterBankAccount').d('开户行账号'),
      disabled: true,
    },
    {
      name: 'invoiceTitle',
      label: intl.get('sodr.workspace.model.common.invoiceTitle').d('开票公司名称'),
      disabled: true,
    },
    {
      name: 'taxRegisterTel',
      label: intl.get('sodr.workspace.model.common.taxRegisterTel').d('税务登记电话'),
      disabled: true,
    },
    {
      name: 'invoiceTypeName',
      label: intl.get('sodr.workspace.model.common.invoiceTitleTypeName').d('发票类型'),
      disabled: true,
    },
    {
      name: 'invoiceMethodName',
      label: intl.get('sodr.workspace.model.common.invoiceMethodName').d('开票方式'),
      disabled: true,
    },
    {
      name: 'invoiceTitleTypeName',
      label: intl.get('sodr.workspace.model.common.invoiceTypeName').d('发票形式'),
      disabled: true,
    },
    {
      name: 'invoiceDetailTypeName',
      label: intl.get('sodr.workspace.model.common.invoiceDetailTypeName').d('发票明细'),
      disabled: true,
    },
  ],
});

export { basicInfo, organizationInfo, detailInfo, receiptInfo, billingInfo };
