import intl from 'utils/intl';
// import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, getUserOrganizationId, getCurrentUserId } from 'utils/utils';
import { isNil } from 'lodash';
import {
  BUCKET_NAME,
  MAX_QUAN_NUMBER,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
} from '@/routes/components/utils/constant';
import { getAutoBind } from '@/routes/components/utils';
import { saveAttachmentUUID } from '@/services/quotePurchaseRequisitionService';
import { getResponse } from 'hzero-front/lib/utils/utils';
// import { validataOrg } from '@/services/orderWorkspaceService';

const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();
const userId = getCurrentUserId();

const headerInfo = () => ({
  // autoCreate: true,
  dataToJSON: 'all',
  primaryKey: 'poHeaderId',
  fields: [
    {
      name: 'poTypeId',
      label: intl.get('sodr.workspace.model.common.poTypeId').d('订单类型'),
      type: 'object',
      lovCode: 'SPUC_ORDER_TYPE',
      required: true,
      transformResponse: (value, object) =>
        object?.poTypeId
          ? {
              orderTypeId: value,
              orderTypeCode: object.orderTypeCode,
              orderTypeName: object.poTypeDesc,
              returnOrderFlag: object.returnOrderFlag,
            }
          : null,
      transformRequest: (value) => value?.orderTypeId,
    },
    {
      name: 'orderTypeCode',
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
      name: 'displayPoNum',
      label: intl.get('sodr.workspace.model.common.displayPoNum').d('订单编号'),
    },
    {
      name: 'creationDate',
      label: intl.get('sodr.workspace.model.common.creationDate').d('创建日期'),
      type: 'dateTime',
    },
    {
      name: 'companyId',
      label: intl.get('sodr.workspace.model.common.company').d('公司'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      required: true,
      transformResponse: (value, object) =>
        object?.companyId
          ? {
              companyId: object?.companyId,
              companyName: object?.companyName,
              companyNum: object.companyCode,
            }
          : null,
      transformRequest: (value) => value?.companyId,
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId,
            supplierCompanyId: record.get('tempKey')?.supplierCompanyId,
          };
        },
      },
    },
    {
      name: 'companyCode',
      bind: 'companyId.companyNum',
    },
    {
      name: 'companyName',
      bind: 'companyId.companyName',
    },
    {
      name: 'ouId',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.OU',
      required: true,
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
              ouCode: object?.ouCode,
              ouName: object?.ouName,
            }
          : null,
      transformRequest: (value) => value?.ouId,
    },
    {
      name: 'ouCode',
      bind: 'ouId.ouCode',
    },
    {
      name: 'ouName',
      bind: 'ouId.ouName',
    },
    {
      name: 'tempKey',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
      type: 'object',
      lovCode: 'SODR.AUTH_SUPPLIER_LIFE_CYCLE',
      required: true,
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
      transformResponse: (value, object) => ({
        displaySupplierName: object?.displaySupplierName,
        supplierCompanyId: object?.supplierCompanyId,
        supplierCompanyName: object?.supplierCompanyName,
        supplierId: object?.supplierId,
        supplierName: object?.supplierName,
        supplierCode: object?.supplierCode,
        supplierTenantId: object?.supplierTenantId,
      }),
      transformRequest: (value) => value?.supplierId,
    },
    {
      name: 'displaySupplierName',
      bind: 'tempKey.displaySupplierName',
    },
    {
      name: 'supplierCompanyId',
      bind: 'tempKey.supplierCompanyId',
    },
    {
      name: 'supplierCompanyName',
      bind: 'tempKey.supplierCompanyName',
    },
    {
      name: 'supplierId',
      bind: 'tempKey.supplierId',
    },
    {
      name: 'supplierName',
      bind: 'tempKey.supplierName',
    },
    {
      name: 'supplierCode',
      bind: 'tempKey.supplierNum',
    },
    {
      name: 'supplierTenantId',
      bind: 'tempKey.supplierTenantId',
    },
    {
      name: 'purchaseOrgId',
      label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PUR_OUID_ORG',
      required: true,
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
              organizationName: object?.purchaseOrgName,
            }
          : null,
      transformRequest: (value) => value?.purchaseOrgId,
    },
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
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            organizationId,
            purchaseOrgId: record.get('purchaseOrgId')?.purchaseOrgId,
          };
        },
        disabled: ({ record, dataSet }) => {
          const { agentId } = dataSet.getState('response') || {};
          return agentId && record.get('agentId');
        },
      },
      transformResponse: (value, object) =>
        object?.agentId
          ? {
              purchaseAgentId: object?.agentId,
              purchaseAgentName: object?.agentName,
            }
          : null,
      transformRequest: (value) => value?.purchaseAgentId,
    },
    {
      name: 'agentName',
      bind: 'agentId.purchaseAgentName',
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      // dynamicProps: {
      //   disabled: ({ record, dataSet }) => {
      //     const headerInfoDs = dataSet.getState('headerInfoDs');
      //     if (!headerInfoDs || !headerInfoDs.current) return;
      //     return record.get('unSaveEnable') === 0 || !headerInfoDs.current.get('companyId');
      //   },
      // },
      required: true,
      transformResponse: (value, object) =>
        object?.currencyCode
          ? {
              currencyCode: object?.currencyCode,
            }
          : null,
      transformRequest: (value) => value?.currencyCode,
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.taxIncludeAmount').d('含税总金额'),
      dynamicProps: {
        currency: ({ record }) => record && record.get('currencyCode')?.currencyCode,
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amount').d('不含税总金额'),
      dynamicProps: {
        currency: ({ record }) => record && record.get('currencyCode')?.currencyCode,
        precision: ({ record }) => record.get('financialPrecision'),
      },
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
    {
      name: 'termsName',
      bind: 'termsId.termName',
    },
    {
      name: 'quantityTotal',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.quantityTotal').d('总数量'),
    },
    {
      name: 'poSourcePlatform',
      label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
      lookupCode: 'SPRM.SRC_PLATFORM',
    },
    {
      name: 'originalPoHeaderId',
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.originalPoNum`).d('原订单号'),
    },
    {
      name: 'sourceBillTypeCode',
      lookupCode: 'SPFM.BUSINESS_CATEGORY',
      label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('来源单据'), // H
    },
    // TODO 收货方地址 shipToLocationAddress [poSourcePlatform === 'CATALOGUE']
    // TODO 收单方地址 billToLocationAddress [poSourcePlatform === 'CATALOGUE']
    {
      name: 'sourceOfTransferOrder',
      lookupCode: 'SPUC.ORDER.SOURCE_OF_TRANSFER_ORDER',
      label: intl.get('sodr.workspace.model.common.sourceOfTransferOrder').d('转单来源'), // H
    },
    {
      name: 'settleTempKey',
      label: intl.get('sodr.workspace.model.common.settleSupplierId').d('结算供应商'), // H
      type: 'object',
      lovCode: 'SODR.AUTH_SUPPLIER_LIFE_CYCLE',
      transformRequest: (value) => value?.tempKey,
      transformResponse: (value, object) => {
        return object?.settleErpSupplierId || object?.settleSupplierId ? { ...value } : null;
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
      name: 'settleDisplaySupplierName',
      bind: 'settleTempKey.displaySupplierName',
      ignore: 'always',
      transformResponse: (value, object) =>
        object?.settleErpSupplierName || object?.settleSupplierName,
    },
    {
      name: 'settleSupplierId',
      bind: 'settleTempKey.supplierCompanyId',
    },
    {
      name: 'settleSupplierCode',
      bind: 'settleTempKey.supplierCompanyNum',
    },
    {
      name: 'settleSupplierName',
      bind: 'settleTempKey.supplierCompanyName',
    },
    {
      name: 'settleErpSupplierId',
      bind: 'settleTempKey.supplierId',
    },
    {
      name: 'settleErpSupplierCode',
      bind: 'settleTempKey.supplierNum',
    },
    {
      name: 'settleErpSupplierName',
      bind: 'settleTempKey.supplierName',
    },
    {
      name: 'settleSupplierTenantId',
      bind: 'settleTempKey.supplierTenantId',
    },
    {
      name: 'supplierOrderTypeCode',
      label: intl.get('sodr.workspace.model.common.supplierOrderTypeCode').d('京东e卡-code'), // H
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
      maxLength: 480,
      transformRequest: (value) => value || '',
    },
    {
      name: 'domesticCurrencyCode',
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      label: intl.get('sodr.workspace.model.common.domesticCurrencyCode').d('本币币种'), // H
      transformResponse: (value) => value && { currencyCode: value },
      transformRequest: (value) => value?.currencyCode,
    },
    {
      name: 'domesticTaxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticTaxIncludeAmount').d('本币含税金额'), // H
      dynamicProps: {
        precision: ({ record }) => record.get('domesticFinancialPrecision'),
        currency: ({ record }) =>
          record && record.get('domesticCurrencyCode')?.domesticCurrencyCode,
      },
    },
    {
      name: 'domesticAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticAmount').d('本币不含税金额'), // H
      dynamicProps: {
        precision: ({ record }) => record.get('domesticFinancialPrecision'),
        currency: ({ record }) =>
          record && record.get('domesticCurrencyCode')?.domesticCurrencyCode,
      },
    },
    {
      name: 'supplierSiteId',
      label: intl.get(`sodr.common.model.common.supplierSiteName`).d('供应商地点'), // H
      type: 'object',
      lovCode: 'SODR.SUPPLIER_SITE',
      required: true,
      // lovQueryAxiosConfig: (code, config, { data: { supplierId } }) => {
      //   return {
      //     url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-sites/${supplierId || -1}`,
      //     method: 'GET',
      //   };
      // },
      dynamicProps: {
        required: ({ record }) => {
          return (
            record.get('enableSupplierSiteFlag') === 1 &&
            record.get('supplierId') &&
            record.get('ouId')?.ouId
          );
        },
        lovPara: ({ record }) => {
          return {
            tenantId,
            supplierId: record.get('tempKey')?.supplierId,
            ouId: record.get('ouId')?.ouId,
          };
        },
      },
      transformResponse: (value, object) =>
        value && {
          supplierSiteId: object?.supplierSiteId,
          supplierSiteName: object?.supplierSiteName,
        },
      transformRequest: (value) => value?.supplierSiteId,
    },
    {
      name: 'supplierSiteName',
      bind: 'supplierSiteId.supplierSiteName',
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
    },
    {
      name: 'purchaserInnerAttachmentUuid',
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
    },
  ],
  queryParameter: {
    camp: 1,
    poEntryPoint: 'PO_MAINTAIN_DETAIL',
    customizeUnitCode: String(['SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST']),
  },
  events: {
    load: ({ dataSet }) => {
      const lineInfoDs = dataSet.getState('lineInfoDs');
      if (lineInfoDs) {
        lineInfoDs.setState({
          fieldMap: undefined,
          fieldMapValues: undefined,
          batchRecordKeys: undefined,
        });
        lineInfoDs.unSelectAll();
      }
      dataSet.forEach((i) => {
        i.init({
          currencyCode: { currencyCode: i.get('currencyCode')?.currencyCode || 'CNY' },
          displaySupplierName: i.get('supplierName') || i.get('supplierCompanyName'),
          prepayFlag: isNil(i.get('prepayFlag')) ? 0 : i.get('prepayFlag'),
        });
        Object.assign(i, { status: 'update' });
      });
    },
    update: async ({ record, name, value, dataSet }) => {
      const lineInfoDs = dataSet.getState('lineInfoDs');
      if (value && ['purchaserInnerAttachmentUuid', 'attachmentUuid'].includes(name)) {
        const uuidType = name === 'attachmentUuid' ? 1 : 3;
        if (!record.get('poHeaderId')) return;
        saveAttachmentUUID({ poHeaderId: record.get('poHeaderId'), uuid: value, uuidType }).then(
          (res) => {
            if (getResponse(res)) {
              record.init({ objectVersionNumber: res });
            }
          }
        );
      }
      if (name === 'poTypeId') {
        if (lineInfoDs) {
          lineInfoDs.forEach((i) => {
            i.set('returnedFlag', record.get('poTypeId')?.returnOrderFlag);
          });
        }
      }
      if (name === 'ouId') {
        if (lineInfoDs) {
          lineInfoDs.setState('ouIdChanged', 1);
        }
        record.set({
          supplierSiteId: null,
        });
        getAutoBind({ record, name, value, dataSet, lineDs: lineInfoDs, type: 'source' });
      }
      if (name === 'companyId') {
        dataSet.setState({ companyIdChange: 1 });
        const { currencyCode } = value || {};
        record.set({ originalPoHeaderId: null, originalPoNum: null });
        record.set({ currencyCode: { currencyCode: currencyCode || 'CNY' } });
        getAutoBind({ record, name, value, dataSet, lineDs: lineInfoDs, type: 'source' });
      }
      if (name === 'tempKey') {
        record.set({
          originalPoHeaderId: null,
          originalPoNum: null,
          supplierSiteId: null,
        });
      }
      if (name === 'purchaseOrgId') {
        record.set({ originalPoHeaderId: null, originalPoNum: null });
        getAutoBind({ record, name, value, dataSet, lineDs: lineInfoDs, type: 'source' });
      }
      if (name === 'termsId') {
        const { prepayFlag } = value || {};
        record.set({
          prepayFlag,
        });
      }
    },
  },
});

export default headerInfo;
