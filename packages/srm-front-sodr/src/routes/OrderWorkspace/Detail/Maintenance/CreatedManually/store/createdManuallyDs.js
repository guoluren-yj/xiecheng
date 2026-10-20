import intl from 'utils/intl';
// import { SRM_SSLM } from '_utils/config';
import { isNil, isEmpty, isNumber } from 'lodash';
import { runInAction } from 'mobx';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import {
  getCurrentOrganizationId,
  getUserOrganizationId,
  getCurrentUserId,
  getResponse,
} from 'utils/utils';
import notification from 'utils/notification';

import {
  // validataOrg,
  getLineAttachmentUuid,
  workbenchNewPriceLibEnable,
  fetchBenchmarkPriceType,
  fetchItemChangePrice,
  fetchModifyablePriceFlag,
  checkInvOrganization,
} from '@/services/orderWorkspaceService';
import {
  amountCalculationPro,
  getPrecision,
  conversionUpdate,
  getDynamicLabel,
  getStageIdList,
  getAutoBind,
  getMaxPoLineNum,
} from '@/routes/components/utils';
import {
  BUCKET_NAME,
  MAX_QUAN_NUMBER,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
  SUPPLIER_DIRECTORY,
  LINE_DIRECTORY,
} from '@/routes/components/utils/constant';

const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();
const userId = getCurrentUserId();
const priceLibFields = ['companyId', 'ouId', 'poTypeId', 'sourceBillTypeCode']; // 新价格库相关字段
const benchmarkPriceFields = ['companyId', 'supplierLov']; // 基准价要素相关字段
const priceLibItemFields = ['companyId', 'ouId', 'poTypeId', 'poSourcePlatform']; // 物料获取价格相关字段
const modifyablePriceFields = ['companyId', 'poTypeId', 'supplierLov']; // 价格库价格是否可修改相关字段

const getNewPriceLibFlag = async (ds, params = {}) => {
  if (Object.values(params).some((i) => !i)) return;
  const res = getResponse(await workbenchNewPriceLibEnable(params));
  ds.setState({ newPriceLibFlag: res });
};

const getBenchmarkPriceType = async (ds, params = {}, lineDs) => {
  // if (Object.values(params).some((i) => !i)) return;
  if (!params.companyId) return;
  const oldBenchmarkPriceType = ds?.current && ds?.current?.get('benchmarkPriceType');
  const result = await fetchBenchmarkPriceType(params);
  const res = getResponse(result);
  if (res) {
    if (ds?.current) {
      ds.current.set({ benchmarkPriceType: res });
    }
    if (oldBenchmarkPriceType === res) return;
    const clearLines = lineDs.filter((i) => !i.get('priceLibraryId'));
    if (!isEmpty(clearLines)) {
      clearLines.forEach((i) => {
        i.set({
          [res === 'TAX_INCLUDED_PRICE' ? 'unitPrice' : 'enteredTaxIncludedPrice']: undefined,
          benchmarkPriceType: res,
        });
      });
      notification.warning({
        message:
          res === 'TAX_INCLUDED_PRICE'
            ? intl
                .get('sodr.workspace.view.message.clearLinePrice.netPrice')
                .d(
                  '订单行信息基准价发生变化,非引用价格库订单行原不含税单价已清空,请重新维护含税单价信息'
                )
            : intl
                .get('sodr.workspace.view.message.clearLinePrice.taxIncludePrice')
                .d(
                  '订单行信息基准价发生变化,非引用价格库订单行原含税单价已清空,请重新维护不含税单价信息'
                ),
      });
    }
  }
};

const getItemChangePriceFlag = async (ds, params = {}) => {
  if (Object.values(params).some((i) => !i)) return;
  const res = getResponse(await fetchItemChangePrice(params));
  if (ds) {
    ds.setState({ itemChangePriceFlag: res });
  }
};

const getModifyablePriceFlag = async (ds, params) => {
  if (Object.values(params).some((i) => !i)) return;
  const res = getResponse(await fetchModifyablePriceFlag(params));
  if (ds?.current) {
    ds.current.set({
      modifyablePriceFlag: isNumber(+res?.modifyablePriceFlag)
        ? +res?.modifyablePriceFlag
        : undefined,
    });
  }
};

const organizationFields = ({ remote }) => [
  {
    name: 'companyId',
    label: intl.get('sodr.workspace.model.common.company').d('公司'),
    type: 'object',
    lovCode: 'SPFM.USER_AUTH.COMPANY',
    required: true,
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
      return value?.companyId || null;
    },
  },
  // {
  //   name: 'companyId',
  //   bind: 'companyLov.companyId',
  // },
  {
    name: 'companyCode',
    bind: 'companyId.companyNum',
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
    required: true,
    dynamicProps: {
      lovPara: ({ record, dataSet }) => {
        const stageIds = dataSet.getState('stageIdList');
        const supplierLovFlag = dataSet.getState('supplierLovFlag');
        const stageIdList = stageIds && (supplierLovFlag ? stageIds.split(',') : stageIds);
        const params = {
          userId,
          tenantId,
          stageIdList,
          organizationId,
          companyId: record.get('companyId')?.companyId,
          pageSource: 'SODR',
        };
        return remote.process('getSupplierLovPara', params, dataSet);
      },
      disabled: ({ record }) => record.get('poHeaderId'),
    },
  },
  {
    // 新的供应商lov显示
    name: 'supplierName',
    bind: 'supplierLov.supplierName',
  },
  {
    name: 'supplierCompanyName',
    bind: 'supplierLov.supplierCompanyName',
  },
  {
    name: 'supplierCompanyNum',
    bind: 'supplierLov.supplierCompanyNum',
  },
  {
    name: 'supplierCode',
    bind: 'supplierLov.supplierNum',
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
    name: 'supplierId',
    bind: 'supplierLov.supplierId',
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
    required: true,
    transformResponse: (value, object) =>
      object?.ouId
        ? {
            ouId: object?.ouId,
            ouCode: object.ouCode,
            ouName: object.ouName,
          }
        : null,
    transformRequest: (value) => {
      return value?.ouId || null;
    },
    dynamicProps: {
      lovPara: ({ record }) => {
        return {
          tenantId,
          organizationId,
          companyId: record.get('companyId')?.companyId,
        };
      },
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
    required: true,
    transformResponse: (value, object) =>
      object?.purchaseOrgId
        ? {
            purchaseOrgId: object?.purchaseOrgId,
          }
        : null,
    transformRequest: (value) => {
      return value?.purchaseOrgId || null;
    },
    dynamicProps: {
      lovPara: ({ record }) => {
        return {
          organizationId,
          ouId: record.get('ouId')?.ouId,
        };
      },
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
    transformResponse: (value, object) =>
      object?.agentId
        ? {
            purchaseAgentId: object?.agentId,
          }
        : null,
    transformRequest: (value) => {
      return value?.purchaseAgentId || null;
    },
    dynamicProps: {
      lovPara: ({ record }) => {
        return {
          organizationId,
          purchaseOrgId: record.get('purchaseOrgId')?.purchaseOrgId,
        };
      },
      disabled: ({ record, dataSet }) =>
        !dataSet.getState('isCreate') && record.getPristineValue('agentId')?.purchaseOrgId,
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
    name: 'settleSupplierLov',
    label: intl.get('sodr.workspace.model.common.settleSupplierId').d('结算供应商'),
    type: 'object',
    lovCode: 'SODR.AUTH_SUPPLIER_LIFE_CYCLE',
    ignore: 'always',
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
    name: 'supplierSiteId',
    label: intl.get(`sodr.common.model.common.supplierSiteName`).d('供应商地点'),
    type: 'object',
    lovCode: 'SODR.SUPPLIER_SITE',
    // lovQueryAxiosConfig: (code, config, { data: { supplierId } }) => {
    //   return {
    //     url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-sites/${supplierId || -1}`,
    //     method: 'GET',
    //   };
    // },
    transformResponse: (value) => value && { supplierSiteId: value },
    transformRequest: (value) => value?.supplierSiteId || null,
    dynamicProps: {
      required: ({ record }) =>
        record.get('enableSupplierSiteFlag') === 1 &&
        record.get('supplierId') &&
        record.get('ouId')?.ouId,
      lovPara: ({ record }) => {
        return {
          tenantId,
          supplierId: record.get('supplierId'),
          ouId: record.get('ouId')?.ouId,
        };
      },
    },
  },
  {
    name: 'supplierSiteName',
    bind: 'supplierSiteId.supplierSiteName',
  },
  // {
  //   name: 'supplierSiteId',
  //   bind: 'supplierSiteLov.supplierSiteId',
  // },
  {
    name: 'supplierContactName',
    label: intl.get('sodr.workspace.model.common.supplierContactName').d('供应商联系人名称'),
  },
  {
    name: 'supplierContactTelNum',
    label: intl.get('sodr.workspace.model.common.supplierContactTelNum').d('供应商联系人电话'),
  },
];

const basicInfo = ({ remote }) => ({
  autoCreate: true,
  dataToJSON: 'all',
  primaryKey: 'poHeaderId',
  fields: [
    {
      name: 'displayPoNum',
      label: intl.get('sodr.workspace.model.common.displayPoNum').d('订单编号'),
    },
    {
      name: 'poTypeId',
      label: intl.get('sodr.workspace.model.common.poTypeId').d('订单类型'),
      type: 'object',
      lovCode: 'SPUC_ORDER_TYPE',
      required: true,
      transformResponse: (value, object) =>
        object?.poTypeId
          ? {
              orderTypeId: object?.poTypeId,
              orderTypeCode: object.orderTypeCode,
              orderTypeName: object.poTypeDesc,
              returnOrderFlag: object.returnOrderFlag,
              fixedAssetsFlag: object.fixedAssetsFlag,
              outsourceOrderFlag: object.outsourceOrderFlag,
            }
          : null,
      transformRequest: (value) => {
        return value?.orderTypeId || value?.poTypeId;
      },
    },
    {
      name: 'orderTypeCode',
      bind: 'poTypeId.orderTypeCode',
    },
    // 兼容后端接收参数
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
      name: 'fixedAssetsFlag',
      bind: 'poTypeId.fixedAssetsFlag',
    },
    {
      name: 'outsourceOrderFlag',
      bind: 'poTypeId.outsourceOrderFlag',
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
      dynamicProps: {
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
      dynamicProps: {
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'quantityTotal',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.quantityTotal').d('总数量'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      required: true,
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
      dynamicProps: {
        disabled: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          if (!organizationInfoDs || !organizationInfoDs.current) return;
          return !organizationInfoDs.current.get('companyId')?.companyId;
        },
      },
    },
    // {
    //   name: 'currencyCode',
    //   bind: 'currencyLov.currencyCode',
    // },
    {
      name: 'creationDate',
      label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
      type: 'dateTime',
    },
    {
      name: 'poSourcePlatform',
      label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
      lookupCode: 'SPRM.SRC_PLATFORM',
    },
    {
      name: 'termsId',
      label: intl.get('sodr.workspace.model.common.termsId').d('付款条款'),
      type: 'object',
      lovCode: 'SMDM.PAYMENT.TERM',
      lovPara: { tenantId },
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
    },
    // 默认隐藏字段
    {
      name: 'domesticCurrencyCode',
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      label: intl.get('sodr.workspace.model.common.domesticCurrencyCode').d('本币币种'),
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
      dynamicProps: {
        disabled: ({ record, dataSet }) =>
          !dataSet.getState('isCreate') &&
          record.getPristineValue('domesticCurrencyCode')?.currencyCode,
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
      dynamicProps: {
        precision: ({ record }) => record.get('domesticFinancialPrecision'),
      },
    },
    {
      name: 'domesticAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticAmounts').d('本币金额(不含税)'),
      disabled: true,
      dynamicProps: {
        precision: ({ record }) => record.get('domesticFinancialPrecision'),
      },
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
      label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('单据来源'),
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
      bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sodr.workspace.model.common.attachmentUUID').d('采购方附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
    },
    {
      name: 'supplierAttachmentUuid',
      type: 'attachment',
      label: intl.get('sodr.workspace.model.common.supplierAttachmentId').d('供应商附件'),
      bucketName: BUCKET_NAME,
      bucketDirectory: SUPPLIER_DIRECTORY,
    },
    // ...organizationFields(),
    {
      name: 'createdUnitId',
      label: intl.get('sodr.workspace.model.common.createdUnitName').d('创建人部门'),
      type: 'object',
      lovCode: 'SODR.UNIT_NFO',
      transformResponse: (value) => value && { unitId: value },
      transformRequest: (value) => {
        return value?.unitId;
      },
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            userId: record.get('createdBy'),
          };
        },
      },
    },
    {
      name: 'createdUnitName',
      bind: 'createdUnitId.unitName',
    },
    {
      name: 'pcHeaderIdLov',
      label: intl.get(`sodr.workspace.model.common.pcSubjectId`).d('关联采购协议'),
      lovCode: 'SPCM.HEADER_COMMON_PLUS',
      type: 'object',
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs') || {};
          const { supplierCompanyId, supplierId } =
            organizationInfoDs.current?.get(['supplierCompanyId', 'supplierId']) || {};
          return {
            supplierCompanyId,
            supplierId,
            organizationId,
          };
        },
      },
      transformResponse: (value, object) => ({ pcHeaderId: value, pcNum: object.pcNumLov }),
      transformRequest: (value) => value?.pcHeaderId,
    },
    {
      name: 'pcNumLov',
      bind: 'pcHeaderIdLov.pcNum',
    },
    {
      // 后端需要该字段处理新增行号逻辑
      name: 'insertLineNumByPageFlag',
      transformRequest: (value, record) => Number(!isNil(record.get('maxPoLineNum'))),
    },
  ],
  queryParameter: {
    camp: 1,
    poEntryPoint: 'PO_MAINTAIN_DETAIL',
    customizeUnitCode: String([
      'SODR.WORKSPACE_CREATEDMANUALLY.BASICINFO',
      'SODR.WORKSPACE_CREATEDMANUALLY.ORGANIZATIONINFO',
      'SODR.WORKSPACE_CREATEDMANUALLY.ATTACHMENTINFO',
      'SODR.WORKSPACE_CREATEDMANUALLY.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_CREATEDMANUALLY.PAYMENTTERMINFO',
    ]),
  },
  events: {
    load: ({ dataSet }) => {
      const detailInfoDs = dataSet.getState('detailInfoDs');
      if (detailInfoDs) {
        detailInfoDs.setState({
          fieldMap: undefined,
          fieldMapValues: undefined,
          batchRecordKeys: undefined,
        });
        detailInfoDs.unSelectAll();
      }
      dataSet.forEach((i) => {
        i.init({
          sourceBillTypeCode: 'PURCHASE_ORDER',
          prepayFlag: isNil(i.get('prepayFlag')) ? 0 : i.get('prepayFlag'),
        });
        Object.assign(i, { status: 'update' });
      });
      remote.event.fireEvent('basicInfoDsLoad', { dataSet });
    },
    update: async ({ name, record, value, dataSet }) => {
      dataSet.setState('updatedFlag', 1);
      const newPriceLibFields = [
        ...modifyablePriceFields,
        ...(dataSet.getState('newPriceLibFields') || []),
      ];
      const organizationInfoDs = dataSet.getState('organizationInfoDs');
      const attributeFields = record.get(dataSet.getState('newPriceLibFields') || []);
      const organizationCurrent = dataSet.getState('organizationInfoDs')?.current;
      const { orderTypeCode, poTypeId, poSourcePlatform, sourceBillTypeCode } = record.get([
        'orderTypeCode',
        'poTypeId',
        'poSourcePlatform',
        'sourceBillTypeCode',
      ]);
      const { ouCode, ouId, companyCode, companyId, supplierCompanyId } = organizationCurrent
        ? organizationCurrent.get([
            'ouCode',
            'ouId',
            'companyCode',
            'companyId',
            'supplierCompanyId',
          ])
        : {};
      if (priceLibFields.includes(name)) {
        getNewPriceLibFlag(dataSet, {
          poTypeCode: orderTypeCode,
          ouCode,
          companyCode,
          sourceBillTypeCode,
        });
      }
      if (priceLibItemFields.includes(name)) {
        getItemChangePriceFlag(dataSet.getState('basicInfoDs'), {
          poTypeId: poTypeId?.orderTypeId,
          ouId: ouId?.ouId,
          companyCode,
          poSourcePlatform: poSourcePlatform || 'SRM',
        });
      }
      if (newPriceLibFields.includes(name)) {
        getModifyablePriceFlag(dataSet, {
          ...attributeFields,
          orderType: orderTypeCode,
          sourcePlatform: poSourcePlatform || 'SRM',
          companyId: companyId?.companyId,
          supplierCompanyId,
        });
      }
      if (name === 'poTypeId') {
        const stageIdList = await getStageIdList({
          poTypeId: value?.orderTypeId,
          companyId: organizationCurrent?.get('companyId')?.companyId,
        });
        dataSet.setState({ stageIdList });
        if (organizationInfoDs) {
          organizationInfoDs.setState({ stageIdList });
        }
      }
      if (name === 'termsId') {
        const { prepayFlag } = value || {};
        record.set({
          prepayFlag,
        });
      }
      remote.event.fireEvent('basicInfoDsUpdate', { name, record, value, dataSet });
    },
  },
});

const organizationInfo = ({ remote }) => ({
  dataToJSON: 'dirty-field',
  autoCreate: true,
  fields: organizationFields({ remote }),
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        Object.assign(i, { status: 'update' });
      });
    },
    update: async ({ record, name, value, dataSet }) => {
      dataSet.setState('updatedFlag', 1);
      const newPriceLibFields = [
        ...modifyablePriceFields,
        ...(dataSet.getState('newPriceLibFields') || []),
      ];
      const attributeFields = record.get(dataSet.getState('newPriceLibFields') || []);
      const basicCurrent = dataSet.getState('basicInfoDs')?.current;
      const detailInfo = dataSet.getState('detailInfoDs');
      const {
        orderTypeCode,
        poTypeId,
        poSourcePlatform,
        sourceBillTypeCode,
        currencyCode: oldCurrencyCode,
      } =
        basicCurrent?.get([
          'orderTypeCode',
          'poTypeId',
          'poSourcePlatform',
          'sourceBillTypeCode',
          'currencyCode',
        ]) || {};
      const { ouCode, ouId, companyCode, companyId, supplierCompanyId } = record.get([
        'ouCode',
        'ouId',
        'companyCode',
        'companyId',
        'supplierCompanyId',
      ]);
      if (['supplierContactName', 'supplierContactTelNum'].includes(name) && !value) {
        record.set({ supplierContactName: null, supplierContactTelNum: null });
      }
      if (priceLibFields.includes(name)) {
        getNewPriceLibFlag(dataSet.getState('basicInfoDs'), {
          poTypeCode: orderTypeCode,
          ouCode,
          companyCode,
          sourceBillTypeCode,
        });
      }
      if (priceLibItemFields.includes(name)) {
        getItemChangePriceFlag(dataSet.getState('basicInfoDs'), {
          poTypeId: poTypeId?.orderTypeId,
          ouId: ouId?.ouId,
          companyCode,
          poSourcePlatform: poSourcePlatform || 'SRM',
        });
      }
      if (newPriceLibFields.includes(name)) {
        getModifyablePriceFlag(dataSet.getState('basicInfoDs'), {
          ...attributeFields,
          orderType: orderTypeCode,
          sourcePlatform: poSourcePlatform || 'SRM',
          companyId: companyId?.companyId,
          supplierCompanyId,
        });
      }

      if (name === 'ouId') {
        getAutoBind({ record, name, value, dataSet, lineDs: detailInfo, type: 'create' });
        if (basicCurrent) {
          basicCurrent.set({ originalPoHeaderId: null, originalPoNum: null, supplierSiteId: null });
        }
      }
      if (name === 'companyId') {
        const { currencyCode } = value || {};
        getAutoBind({ record, name, value, dataSet, lineDs: detailInfo, type: 'create' });
        const stageIdList = await getStageIdList({
          companyId: value?.companyId,
          poTypeId: basicCurrent?.get('poTypeId')?.orderTypeId,
        });
        dataSet.setState({ stageIdList });
        const supplierLov = record.getField('supplierLov');
        if (supplierLov.getValue()) {
          record.set({
            supplierLov: undefined,
            supplierName: '',
            supplierCompanyName: '',
          });
        }
        if (basicCurrent) {
          basicCurrent.set({
            originalPoHeaderId: null,
            originalPoNum: null,
            currencyCode: currencyCode ? { currencyCode } : { currencyCode: 'CNY' },
            domesticCurrencyCode: { currencyCode },
            // currencyName: currencyName || '人民币',
          });
        }
      }
      if (name === 'supplierLov') {
        if (basicCurrent) {
          basicCurrent.set({
            originalPoHeaderId: null,
            originalPoNum: null,
            supplierSiteId: null,
            pcHeaderIdLov: null,
          });
        }
        const { supplierName, supplierCompanyName } = value || {};
        if (!supplierName) {
          record.set({
            supplierName: supplierCompanyName,
          });
        }
        record.set({ supplierContactName: null, supplierContactTelNum: null });
      }
      if (name === 'purchaseOrgId') {
        if (basicCurrent) {
          basicCurrent.set({ originalPoHeaderId: null, originalPoNum: null });
        }
        getAutoBind({ record, name, value, dataSet, lineDs: detailInfo, type: 'create' });
      }
      if (benchmarkPriceFields.includes(name)) {
        getBenchmarkPriceType(
          dataSet.getState('basicInfoDs'),
          {
            companyId: companyId?.companyId,
            supplierCompanyId,
          },
          dataSet.getState('detailInfoDs')
        );
      }
      await remote.event.fireEvent('organizationInfoDsUpdate', {
        name,
        record,
        value,
        dataSet,
        basicCurrent,
        oldCurrencyCode,
      });
    },
  },
});

const detailInfo = ({ remote }) => ({
  dataToJSON: 'all',
  pageSize: 20,
  // autoQuery: true,
  modifiedCheck: false,
  cacheModified: true,
  cacheSelection: true,
  primaryKey: 'poLineLocationId',
  autoQueryAfterSubmit: false,
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
      name: 'translate',
      label: intl.get('sodr.workspace.model.common.translate').d('拆分'),
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
      name: 'itemId',
      label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
      type: 'object',
      lovCode: 'SPUC.ITEM_PRICE_CODE',
      required: true,
      textField: 'itemCode',
      dynamicProps: {
        lovPara: ({ dataSet, record }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          const basicInfoDs = dataSet.getState('basicInfoDs');
          const basicRecord = basicInfoDs.records[0];
          const orgRecord = organizationInfoDs?.records && organizationInfoDs.records[0];
          const returnOrderFlag = basicRecord.get('returnOrderFlag');
          const tieredPricingFlag = record.get('tieredPricingFlag');
          const returnedFlag = record.get('returnedFlag');
          const { companyId, companyNum } = orgRecord?.get('companyId') || {};
          const { ouId, ouCode } = orgRecord?.get('ouId') || {};
          const { orderTypeCode } = basicRecord?.get('poTypeId') || {};
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
    {
      name: 'itemCode',
      bind: 'itemId.itemCode',
    },
    {
      name: 'itemName',
      label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
      required: true,
    },
    {
      name: 'secondaryQuantity',
      label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      min: 0,
      dynamicProps: {
        required: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
        precision: ({ record }) => getPrecision(record.get('secondaryUomPrecision'), 'number'),
      },
    },
    {
      name: 'secondaryUomId',
      label: intl.get('sodr.workspace.model.common.uomId').d('单位'),
      type: 'object',
      lovCode: 'SMDM_ITEM_ORG_UOM',
      dynamicProps: {
        required: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
        lovPara: ({ record }) => ({
          itemId: record.get('itemId')?.itemId,
          primaryUomId: record.get('uomId')?.uomId,
        }),
        disabled: ({ record, dataSet }) => {
          const setting = dataSet.getState('setting');
          return (
            (setting === '1' && record.get('itemId')?.itemId) ||
            (setting === '0' && record.get('priceLibraryId') && record.get('uomId')?.uomId)
          );
        },
      },
      transformResponse: (value, object) =>
        object?.secondaryUomId && {
          uomId: object?.secondaryUomId,
          uomCode: object?.secondaryUomCode,
          uomName: object?.secondaryUomName,
          uomPrecision: object?.secondaryUomPrecision,
          uomCodeAndName: object?.secondaryUomCodeAndName,
        },
      transformRequest: (value) => value?.uomId,
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
      name: 'secondaryUomPrecision',
      bind: 'secondaryUomId.secondaryUomPrecision',
    },
    {
      name: 'secondaryUomCodeAndName',
      bind: 'secondaryUomId.uomCodeAndName',
    },
    {
      name: 'quantity',
      type: 'number',
      min: 0,
      required: true,
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        disabled: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
        precision: ({ record }) => getPrecision(record.get('uomPrecision'), 'quantity'),
      },
    },
    {
      name: 'uomId',
      type: 'object',
      lovCode: 'SMDM.UOM',
      required: true,
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
        disabled: ({ record, dataSet }) => {
          const setting = dataSet.getState('setting');
          const flag = dataSet.getState('doubleUnitEnabled');
          return (
            flag ||
            (setting === '1' && record.get('itemId')?.itemId) ||
            (setting === '0' && record.get('priceLibraryId') && record.get('uomId')?.uomId)
          );
        },
      },

      transformResponse: (value, object) => {
        return object?.uomId
          ? {
              uomId: object?.uomId,
              uomCode: object?.uomCode,
              uomName: object?.uomName,
              uomPrecision: object?.uomPrecision,
              uomCodeAndName: object?.uomCodeAndName,
            }
          : null;
      },
      transformRequest: (value) => value?.uomId,
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
    },
    {
      name: 'unitPrice',
      label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
      type: 'number',
      min: 0,
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => getPrecision(record.get('defaultPrecision')),
        required: ({ record, name }) => {
          return !record.getField(name).get('disabled', record);
          // const basicCurrent = dataSet.getState('basicInfoDs').records[0];
          // const benchmarkPriceType =
          //   record.get('benchmarkPriceType') || basicCurrent.get('benchmarkPriceType');
          // return benchmarkPriceType === 'NET_PRICE';
        },
        max: ({ record, dataSet }) => {
          const basicCurrent = dataSet.getState('basicInfoDs')?.current;
          const benchmarkPriceType =
            record.get('benchmarkPriceType') || basicCurrent.get('benchmarkPriceType');
          return benchmarkPriceType === 'NET_PRICE' &&
            basicCurrent.get('modifyablePriceFlag') === -1
            ? record.get('originUnitPrice')
            : MAX_QUAN_NUMBER;
        },
        disabled: ({ record, dataSet }) => {
          const basicCurrent = dataSet.getState('basicInfoDs')?.current;
          const benchmarkPriceType = record.get('benchmarkPriceType')
            ? record.get('benchmarkPriceType')
            : basicCurrent.get('benchmarkPriceType');
          return (
            benchmarkPriceType !== 'NET_PRICE' ||
            (benchmarkPriceType === 'NET_PRICE' &&
              basicCurrent.get('modifyablePriceFlag') === 0 &&
              record.get('priceLibraryId'))
          );
        },
      },
    },
    {
      name: 'enteredTaxIncludedPrice',
      label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrices').d('单价(含税)'),
      type: 'number',
      min: 0,
      // max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => getPrecision(record.get('defaultPrecision')),
        required: ({ record, name }) => {
          return !record.getField(name).get('disabled', record);
          // const basicCurrent = dataSet.getState('basicInfoDs').records[0];
          // const benchmarkPriceType =
          //   record.get('benchmarkPriceType') || basicCurrent.get('benchmarkPriceType');
          // return benchmarkPriceType !== 'NET_PRICE';
        },
        max: ({ record, dataSet }) => {
          const basicCurrent = dataSet.getState('basicInfoDs')?.current;
          const benchmarkPriceType =
            record.get('benchmarkPriceType') || basicCurrent.get('benchmarkPriceType');
          return record.get('priceLibraryId') &&
            benchmarkPriceType !== 'NET_PRICE' &&
            basicCurrent.get('modifyablePriceFlag') === -1
            ? record.get('originUnitPrice')
            : MAX_QUAN_NUMBER;
        },
        disabled: ({ record, dataSet }) => {
          const basicCurrent = dataSet.getState('basicInfoDs')?.current;
          const benchmarkPriceType = record.get('benchmarkPriceType')
            ? record.get('benchmarkPriceType')
            : basicCurrent.get('benchmarkPriceType');
          return (
            benchmarkPriceType === 'NET_PRICE' ||
            (benchmarkPriceType === 'TAX_INCLUDED_PRICE' &&
              basicCurrent.get('modifyablePriceFlag') === 0 &&
              record.get('priceLibraryId'))
          );
        },
      },
    },
    {
      name: 'taxId',
      label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
      type: 'object',
      lovCode: 'SMDM.TAX',
      required: true,
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
      dynamicProps: {
        disabled: ({ record }) => record.get('priceLibraryId') && record.get('priceTaxId'),
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
      dynamicProps: {
        disabled: ({ record }) => record.get('priceLibraryId') && record.get('currencyCode'),
        // required: ({ record }) =>
        //   (record.get('assignTypeRequiredFieldNames') || []).includes('unitPriceBatch'),
      },
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      required: true,
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
      dynamicProps: {
        disabled: ({ record }) =>
          record.get('priceLibraryId') && record.get('currencyCode')?.currencyCode,
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
      name: 'referPrice',
      label: intl.get('sodr.workspace.model.common.referPrice').d('参考价格'),
    },
    {
      name: 'categoryId',
      label: intl.get('sodr.workspace.model.common.categoryId').d('物料分类'),
      type: 'object',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      required: true,
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
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            enabledFlag: 1,
            tenantId,
            organizationId: record.get('invOrganizationId')?.organizationId,
            invOrganizationId: record.get('invOrganizationId')?.organizationId,
          };
        },
        disabled: ({ record }) => !record.get('invOrganizationId')?.organizationId,
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
        disabled: ({ record }) => !record.get('invInventoryId')?.inventoryId,
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
    },
    {
      name: 'shipToThirdPartyContact',
      label: intl.get('sodr.workspace.model.common.shipToThirdPartyContact').d('联系人信息'),
      maxLength: 120,
    },
    {
      name: 'departmentId',
      label: intl.get('sodr.workspace.model.common.departmentId').d('部门'),
      type: 'object',
      lovCode: 'SPRM.USER_UNIT',
      lovPara: { tenantId },
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
      dynamicProps: {
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
      transformResponse: (value) =>
        value && {
          value,
        },
      transformRequest: (value) => value?.value,
    },
    {
      name: 'projectCategoryMeaning',
      bind: 'projectCategory.meaning',
    },
    {
      name: 'bom',
      label: intl.get('sodr.workspace.model.common.bom').d('外协BOM'),
    },
    {
      name: 'freeFlag',
      label: intl.get('sodr.workspace.model.common.freeFlag').d('是否免费'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'returnedFlag',
      label: intl.get('sodr.workspace.model.common.returnedFlag').d('是否退回'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        disabled: ({ dataSet }) => {
          const basicInfoDs = dataSet.getState('basicInfoDs');
          return basicInfoDs.current.get('returnOrderFlag');
        },
      },
    },
    {
      name: 'fixedAssetsFlag',
      label: intl.get('sodr.workspace.model.common.fixedAssetsFlag').d('是否固定资产'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        disabled: ({ dataSet }) => {
          const basicInfoDs = dataSet.getState('basicInfoDs');
          return basicInfoDs.current.get('fixedAssetsFlag');
        },
      },
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
      maxLength: 480,
      transformRequest: (value) => value || '',
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('sodr.workspace.model.common.lineAttachmentUuid').d('行附件'),
      bucketName: BUCKET_NAME,
      bucketDirectory: LINE_DIRECTORY,
    },
    // 默认隐藏字段
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
      dynamicProps: {
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
      // dynamicProps: {
      //   disabled: ({ record }) => record.getField('receiveTelNum').disabled,
      //    required: ({ record }) => record.getField('receiveTelNum').required,
      // },
    },
    {
      name: 'receiveTelNum',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('sodr.workspace.model.common.receiveTelNum').d('联系电话'),
      transformRequest: (value) => value || '',
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'commonName',
      label: intl.get('sodr.workspace.model.common.commonName').d('通用名'),
    },
    {
      name: 'brand',
      label: intl.get('sodr.workspace.model.common.brand').d('品牌'),
    },
    {
      name: 'specifications',
      label: intl.get('sodr.workspace.model.common.specifications').d('规格'),
    },
    {
      name: 'model',
      label: intl.get('sodr.workspace.model.common.model').d('型号'),
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
      dynamicProps: {
        precision: ({ dataSet }) =>
          dataSet.getState('basicInfoDs').current.get('domesticDefaultPrecision'),
      },
    },
    {
      name: 'domesticLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticLineAmounts').d('本币金额(不含税)'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          dataSet.getState('basicInfoDs').current.get('domesticFinancialPrecision'),
      },
    },
    {
      name: 'domesticTaxIncludedPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticTaxIncludedPrices').d('本币单价(含税)'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          dataSet.getState('basicInfoDs').current.get('domesticDefaultPrecision'),
      },
    },
    {
      name: 'domesticTaxIncludedLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl
        .get('sodr.workspace.model.common.domesticTaxIncludedLineAmounts')
        .d('本币金额(含税)'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          dataSet.getState('basicInfoDs').current.get('domesticFinancialPrecision'),
      },
    },
    {
      name: 'budgetAccountId',
      label: intl.get('sodr.workspace.model.common.budgetAccountId').d('预算科目'),
      type: 'object',
      lovCode: 'SMDM.BUDGET_ACCOUNT_ORDER',
      lovPara: {
        tenantId,
      },
      transformResponse: (value, object) => {
        return object?.budgetAccountId
          ? {
              budgetAccountId: object?.budgetAccountId,
            }
          : null;
      },
      transformRequest: (value) => {
        return value?.budgetAccountId;
      },
    },
    // {
    //   name: 'budgetAccountId',
    //   bind: 'budgetAccountLov.budgetAccountId',
    // },
    {
      name: 'budgetAccountName',
      bind: 'budgetAccountId.budgetAccountName',
    },
    {
      name: 'receiveToleranceQuantityType',
      label: intl.get('sodr.workspace.model.common.receiveToleranceQuantityType').d('接收允差类型'),
      lookupCode: 'SMDM.ALLOW_EXCESS_ORDER_TYPE',
      dynamicProps: {
        required: ({ record }) =>
          record.get('receiveToleranceQuantity') && !record.get('receiveToleranceQuantityType'),
      },
      transformRequest: (value) => value || '',
    },
    {
      name: 'receiveToleranceQuantity',
      label: intl.get('sodr.workspace.model.common.receiveToleranceQuantity').d('接收允差（%）'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        required: ({ record }) =>
          record.get('receiveToleranceQuantityType') && !record.get('receiveToleranceQuantity'),
      },
    },
    {
      name: 'purchaseLineTypeId',
      label: intl.get(`sodr.workspace.model.common.purchaseLineTypes`).d('采购行类型'),
      lookupCode: 'SODR.PO_LINE_TYPE',
    },
    {
      name: 'priceSource',
      label: intl.get('sodr.workspace.model.common.priceSource').d('价格来源'),
    },
    {
      name: 'priceSourceNum',
      label: intl.get('sodr.workspace.model.common.priceSourceNum').d('价格来源单据号'),
    },
    {
      name: 'priceSourceLineNum',
      label: intl.get('sodr.workspace.model.common.priceSourceLineNum').d('价格来源单据行号'),
    },
    {
      name: 'docFlow',
      label: intl.get(`sodr.workspace.model.common.docFlow`).d('单据流'),
    },
    {
      name: 'projectTaskId',
      label: intl.get(`sodr.workspace.model.common.projectTaskId`).d('项目任务名称'),
      type: 'object',
      lovCode: 'SIEC.PROJECT_TASK_TREE',
      optionsProps: {
        idField: 'taskId',
        childrenField: 'children',
        parentIdField: 'parentTaskId',
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
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
      transformResponse: (value, object) =>
        value && { taskId: value, taskName: object?.projectTaskName },
      transformRequest: (value) => value?.taskId,
    },
    // {
    //   name: 'projectTaskName',
    //   bind: 'projectTaskId.taskName',
    // },
    {
      label: intl.get(`sodr.common.model.common.subSupplierId`).d('分包供应商'),
      name: 'subSupplierId',
      type: 'object',
      lovCode: 'SODR.AUTH_SUPPLIER_LIFE_CYCLE',
      transformRequest: (value) => value?.supplierCompanyId,
      transformResponse: (value, object) => {
        const {
          subSupplierId,
          subErpSupplierName,
          subSupplierName,
          subSupplierCode,
          subErpSupplierId,
          subErpSupplierCode,
          subSupplierTenantId,
        } = object;
        return {
          supplierCompanyId: subSupplierId,
          supplierCompanyNum: subSupplierCode,
          supplierCompanyName: subSupplierName,
          supplierId: subErpSupplierId,
          supplierNum: subErpSupplierCode,
          supplierName: subErpSupplierName,
          supplierTenantId: subSupplierTenantId,
          displaySupplierName: subErpSupplierName || subSupplierName,
        };
      },
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          return {
            userId,
            tenantId,
            organizationId,
            companyId: organizationInfoDs.current.get('companyId')?.companyId,
          };
        },
      },
    },
    {
      name: 'subSupplierCode',
      bind: 'subSupplierId.supplierCompanyNum',
    },
    {
      name: 'subSupplierName',
      bind: 'subSupplierId.supplierCompanyName',
    },
    {
      name: 'subErpSupplierId',
      bind: 'subSupplierId.supplierId',
    },
    {
      name: 'subErpSupplierCode',
      bind: 'subSupplierId.supplierNum',
    },
    {
      name: 'subErpSupplierName',
      bind: 'subSupplierId.supplierName',
    },
    {
      name: 'subSupplierTenantId',
      bind: 'subSupplierId.supplierTenantId',
    },
    {
      name: 'pcSubjectId',
      label: intl.get(`sodr.workspace.model.common.pcSubjectId`).d('关联采购协议'),
      lovCode: 'SPCM.SUBJECT_COMMON_PLUS',
      type: 'object',
      dynamicProps: {
        lovPara: ({ dataSet, record }) => {
          const itemId = record.get('itemId')?.itemId;
          const organizationInfoDs = dataSet.getState('organizationInfoDs') || {};
          const { supplierCompanyId, supplierId } = organizationInfoDs.current?.get([
            'supplierCompanyId',
            'supplierId',
          ]);
          return {
            supplierCompanyId,
            supplierId,
            itemId,
            organizationId,
          };
        },
      },
      // 后端因担心影响二开所以查询只会返回hold字段，所以前端给pcSubjectId、pcHeaderId赋值
      transformResponse: (_, { contractNum, holdPcLineId, holdPcHeaderId }) => ({
        pcNumAndDisplayLineNum: contractNum,
        pcSubjectId: holdPcLineId,
        pcHeaderId: holdPcHeaderId,
      }),
      transformRequest: (value) => value?.pcSubjectId,
    },
    {
      name: 'contractNum',
      bind: 'pcSubjectId.pcNumAndDisplayLineNum',
    },
    {
      name: 'pcHeaderId',
      bind: 'pcSubjectId.pcHeaderId',
    },
    {
      name: 'costInformation',
      label: intl.get('sodr.workspace.model.costInformation.costInformation').d('费用信息'),
    },
    {
      name: 'originalPoLineId',
      label: intl
        .get('sodr.workspace.model.common.displayOriginalPoAndLineNum')
        .d('原采购订单号-行号'),
    },
    {
      name: 'fundLineTermId',
      label: intl.get('sodr.workspace.model.common.termsId').d('付款条款'),
    },
  ],
  queryParameter: {
    poEntryPoint: 'PO_MAINTAIN_DETAIL',
    camp: 2,
    sortType: 0,
    customizeUnitCode:
      'SODR.WORKSPACE_CREATEDMANUALLY.DETAILINFO,SODR.WORKSPACE_CREATEDMANUALLY.DETAILINFO_FILTER',
  },
  events: {
    load: async ({ dataSet }) => {
      const basicCurrent = dataSet.getState('basicInfoDs')?.current;
      const fieldMap = dataSet.getState('fieldMap');
      const fieldMapValues = dataSet.getState('fieldMapValues');
      const { invOrganizationId } = fieldMap || {};
      // 跨页批量编辑
      if (fieldMapValues) {
        let validateResult = true;
        const needValidateLines = dataSet
          .filter((i) => i.status === 'sync')
          .map((i) => i.toJSONData());
        if (invOrganizationId && !isEmpty(needValidateLines)) {
          let checkRes;
          const getValues = dataSet.getState('getValues');
          const { poHeaderDetailDTO } = getValues();
          const res = await checkInvOrganization({
            list: { poHeaderDetailDTO, poLineDetailDTOs: needValidateLines },
            invOrganizationId,
          });
          try {
            checkRes = getResponse(JSON.parse(res));
          } catch {
            checkRes = res;
          }
          if (checkRes !== 'SUCCESS') validateResult = false;
        }
        const batchRecordKeys = dataSet.getState('batchRecordKeys');
        if (validateResult && batchRecordKeys) {
          // 添加setTimeout处理特殊场景：个性化公式默认值翻页不生效
          setTimeout(() => {
            runInAction(() => {
              dataSet.forEach((i) => {
                if (!batchRecordKeys.has(i.key)) {
                  fieldMapValues.forEach(([key, value]) => {
                    const field = i.getField(key);
                    const itemNameEdit = ['itemName'].includes(key)
                      ? !i.get('itemId')?.itemId
                      : true;
                    if (
                      itemNameEdit &&
                      !field.disabled &&
                      !field.get('bind') &&
                      (['enteredTaxIncludedPrice', 'unitPrice', 'taxId'].includes(key)
                        ? !i.get('priceLibraryId')
                        : true)
                    ) {
                      i.set({ [key]: value });
                      batchRecordKeys.add(i.key);
                    }
                  });
                }
              });
            });
          }, 0);
        }
      }

      dataSet.forEach((i) => {
        // Object.assign(i, { status: 'update' });
        i.init({
          saveBomItemId: i.get('itemId')?.itemId,
          tmpOrganizationId: i.get('invOrganizationId')?.organizationId,
          defaultPrecision: i.get('defaultPrecision') ?? basicCurrent?.get('defaultPrecision'),
          domesticDefaultPrecision: basicCurrent?.get('domesticDefaultPrecision'),
          domesticFinancialPrecision: basicCurrent?.get('domesticFinancialPrecision'),
        });
      });
      remote.event.fireEvent('detailInfoDsLoad', { dataSet });
    },
    update: async ({ name, record, value, dataSet }) => {
      dataSet.setState('updatedFlag', 1);
      const { itemCode, priceSource } = record.get(['itemCode', 'priceSource']);
      const basicInfoDs = dataSet.getState('basicInfoDs');
      const organizationInfoDs = dataSet.getState('organizationInfoDs');
      const loading = basicInfoDs.getState('loading');
      const sodrEnabled = basicInfoDs.getState('doubleUnitEnabled');
      const itemChangePriceFlag = basicInfoDs.getState('itemChangePriceFlag');
      const handleIncludedPriceFcous = basicInfoDs.getState('handleIncludedPriceFcous');
      const basicCurrent = basicInfoDs?.current;
      const benchmarkPriceType =
        record.get('benchmarkPriceType') || basicCurrent?.get('benchmarkPriceType');
      // 是否非协议价
      const notContractPrice = priceSource !== 'CONTRACT';
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
          receiveToleranceQuantity,
          receiveToleranceQuantityType,
          commonName,
          model,
          specifications,
          brand,
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
          record.set({ secondaryUomId: uomObj, uomId: uomObj });
        }
        if (notContractPrice) record.set({ pcSubjectId: null });
        record.set({
          itemName,
          categoryId: categoryObj,
          // uomId: uomObj,
          // taxId: undefined,
          // taxRate: undefined,
          unitPrice: undefined,
          enteredTaxIncludedPrice: undefined,
          priceLibraryId: undefined,
          receiveToleranceQuantity,
          receiveToleranceQuantityType,
          commonName,
          model,
          specifications,
          brand,
        });
        if (
          itemChangePriceFlag === 1 &&
          handleIncludedPriceFcous &&
          typeof handleIncludedPriceFcous === 'function'
        ) {
          handleIncludedPriceFcous(record, 'item');
        }
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
      if (name === 'taxId') {
        const price = amountCalculationPro(benchmarkPriceType, record, value, dataSet);
        record.set(price);
      }
      if (name === 'invInventoryId') {
        record.set({
          invLocationId: null,
        });
      }
      if (name === 'attachmentUuid') {
        if (record.get('poLineId')) {
          getLineAttachmentUuid({ poLineId: record.get('poLineId'), attachmentUuid: value }).then(
            (res) => {
              if (res && !res.failed) {
                record.init({ lineVersionNumber: res.objectVersionNumber });
              }
            }
          );
        }
      }
      if (name === 'pcSubjectId') {
        if (notContractPrice) {
          const { pcSubjectId, pcHeaderId } = value || {};
          record.set({ holdPcLineId: pcSubjectId, holdPcHeaderId: pcHeaderId });
        }
      }
      remote.event.fireEvent('detailInfoDsUpdate', {
        name,
        record,
        value,
        dataSet,
        basicCurrent,
        organizationInfoDs,
      });
    },
    create: ({ dataSet, record }) => {
      const basicInfoDs = dataSet.getState('basicInfoDs');
      const { displayPoNum } = basicInfoDs?.current.get(['displayPoNum']) || {};
      const { preCallPriceLibBusinessKey, lineNum: originLineNum } = record.get([
        'preCallPriceLibBusinessKey',
        'lineNum',
      ]);
      const lineNum = originLineNum || getMaxPoLineNum(basicInfoDs, dataSet);
      if (lineNum) {
        if (!preCallPriceLibBusinessKey) {
          record.init({
            preCallPriceLibBusinessKey: displayPoNum ? `${displayPoNum}-${lineNum}` : lineNum,
          });
        }
        if (!originLineNum) {
          record.init({
            displayLineNum: lineNum,
            lineNum,
          });
        }
      }
    },
  },
});

const batchMaintenance = () => ({
  dataToJSON: 'normal',
  autoCreate: true,
  fields: [
    {
      name: 'invOrganizationId',
      label: intl.get('sodr.workspace.model.common.invOrganizationId').d('库存组织'),
      type: 'object',
      lovCode: 'SPUC.SMDM.INV_ORG',
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
          const currentRecord = organizationInfoDs?.current;
          return {
            enabledFlag: 1,
            tenantId,
            ouId: currentRecord?.get('ouId')?.ouId,
            itemId: record.get('itemId')?.itemId,
          };
        },
      },
    },
    // {
    //   name: 'invOrganizationId',
    //   bind: 'invOrganizationId.organizationId',
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
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            enabledFlag: 1,
            tenantId,
            organizationId: record.get('invOrganizationId')?.organizationId,
          };
        },
        disabled: ({ record }) => !record.get('invOrganizationId')?.organizationId,
      },
    },
    // {
    //   name: 'invInventoryId',
    //   bind: 'invInventoryId.inventoryId',
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
        disabled: ({ record }) => !record.get('invInventoryId')?.inventoryId,
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
      name: 'needByDate',
      label: intl.get('sodr.workspace.model.common.needByDate').d('需求日期'),
      type: 'date',
    },
    {
      name: 'taxId',
      label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
      type: 'object',
      lovCode: 'SMDM.TAX',
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
    {
      name: 'costId',
      label: intl.get('sodr.workspace.model.common.costId').d('成本中心'),
      type: 'object',
      lovCode: 'SPRM.COST_CENTER_ID',
      transformResponse: (value) => value && { costId: value },
      transformRequest: (value) => value?.costId,
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          const orgRecord = organizationInfoDs?.records[0];
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
      name: 'departmentId',
      label: intl.get('sodr.workspace.model.common.departmentId').d('部门'),
      type: 'object',
      lovCode: 'SPRM.USER_UNIT',
      lovPara: { tenantId },
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
      name: 'unitPriceBatch',
      label: intl.get('sodr.workspace.model.common.unitPriceBatch').d('每'),
      type: 'number',
      min: 0,
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        disabled: ({ record }) => record.get('priceLibraryId') && record.get('currencyCode'),
        // required: ({ record }) =>
        //   (record.get('assignTypeRequiredFieldNames') || []).includes('unitPriceBatch'),
      },
    },
    {
      name: 'shipToThirdPartyAddress',
      label: intl.get('sodr.workspace.model.common.receivingAddress').d('收货地址'),
      maxLength: 120,
    },
    {
      name: 'shipToThirdPartyContact',
      label: intl.get('sodr.workspace.model.common.shipToThirdPartyContact').d('联系人信息'),
      maxLength: 120,
    },
    {
      name: 'projectCategory',
      label: intl.get('sodr.workspace.model.common.projectCategory').d('项目类别'),
      type: 'object',
      lovCode: 'SPUC.PR_LINE_PROJECT_CATEHORY',
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
      name: 'enteredTaxIncludedPrice',
      label: intl.get(`sodr.common.model.common.taxedEnteredUnitPrices`).d('原币单价(含税)'),
      type: 'number',
      min: 0,
      max: MAX_QUAN_NUMBER,
      computedProps: {
        precision: ({ dataSet }) => {
          const basicInfoDs = dataSet.getState('basicInfoDs');
          const { defaultPrecision } = (basicInfoDs.toJSONData() || [])[0] || {};
          return getPrecision(defaultPrecision);
        },
      },
    },
    {
      name: 'unitPrice',
      label: intl.get(`sodr.common.model.common.unitPrices`).d('单价(不含税)'),
      type: 'number',
      min: 0,
      max: MAX_QUAN_NUMBER,
      computedProps: {
        precision: ({ dataSet }) => {
          const basicInfoDs = dataSet.getState('basicInfoDs');
          const { defaultPrecision } = (basicInfoDs.toJSONData() || [])[0] || {};
          return getPrecision(defaultPrecision);
        },
      },
    },
    {
      name: 'wbsCode',
      label: intl.get('sodr.workspace.model.common.wbsCode').d('wbs元素'),
      type: 'object',
      lovCode: 'SPUC.WBS',
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
          if (!organizationInfoDs) return;
          const orgRecord = organizationInfoDs?.current;
          return {
            tenantId,
            companyId: orgRecord?.get('companyId')?.companyId,
            ouId: orgRecord?.get('ouId')?.ouId,
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
      name: 'purchaseLineTypeId',
      label: intl.get(`sodr.workspace.model.common.purchaseLineTypes`).d('采购行类型'),
      lookupCode: 'SODR.PO_LINE_TYPE',
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
    {
      name: 'accountAssignTypeCode',
      bind: 'accountAssignTypeId.accountAssignTypeCode',
    },
    {
      name: 'requiredFieldNames',
      bind: 'accountAssignTypeId.requiredFieldNames',
    },
    {
      name: 'itemName',
      label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
      // required: true,
    },
    {
      name: 'categoryId',
      label: intl.get('sodr.workspace.model.common.categoryId').d('物料分类'),
      type: 'object',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      // required: true,
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
    {
      name: 'categoryName',
      bind: 'categoryId.categoryName',
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
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          const orgRecord = organizationInfoDs?.records[0];
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
      name: 'projectTaskId',
      label: intl.get(`sodr.workspace.model.common.projectTaskId`).d('项目任务名称'),
      type: 'object',
      lovCode: 'SIEC.PROJECT_TASK_TREE',
      optionsProps: {
        idField: 'taskId',
        childrenField: 'children',
        parentIdField: 'parentTaskId',
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
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
      transformResponse: (value, object) =>
        value && { taskId: value, taskName: object?.projectTaskName },
      transformRequest: (value) => value?.taskId,
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
      maxLength: 480,
    },
    {
      name: 'receiveToleranceQuantityType',
      label: intl.get('sodr.workspace.model.common.receiveToleranceQuantityType').d('接收允差类型'),
      lookupCode: 'SMDM.ALLOW_EXCESS_ORDER_TYPE',
      transformRequest: (value) => value || '',
    },
    {
      name: 'receiveToleranceQuantity',
      label: intl.get('sodr.workspace.model.common.receiveToleranceQuantityPro').d('接收允差'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      transformResponse: (value, object) => (object?.receiveTelNum ? value : value || '+86'),
      transformRequest: (value) => value || '',
      // dynamicProps: {
      //   disabled: ({ record }) => record.getField('receiveTelNum').disabled,
      //    required: ({ record }) => record.getField('receiveTelNum').required,
      // },
    },
    {
      name: 'receiveTelNum',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('sodr.workspace.model.common.receiveTelNum').d('联系电话'),
      transformRequest: (value) => value || '',
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
  ],
  events: {
    update: ({ name, record }) => {
      if (name === 'invOrganizationId') {
        record.set({ invInventoryId: null, invLocationId: null });
      }
      if (name === 'invInventoryId') {
        record.set({
          invLocationId: null,
        });
      }
    },
  },
});

export { basicInfo, organizationInfo, detailInfo, batchMaintenance, priceLibFields };
