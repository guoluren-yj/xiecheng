import { isEmpty, isArray, isNil } from 'lodash';

import { SRM_SPUC } from '_utils/config';
import intl from 'utils/intl';
import { getCurrentUserId } from 'utils/utils';
import { c7nAmountFormatterOptions } from '@/routes/components/utils';
import {
  BUCKET_NAME,
  MAX_QUAN_NUMBER,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
} from '@/routes/components/utils/constant';
import { saveAttachmentUUID } from '@/services/quotePurchaseRequisitionService';
import { getResponse } from 'hzero-front/lib/utils/utils';

const customizeUnitCode =
  'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST,SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';

const userId = getCurrentUserId();

export default ({ poHeaderId, tenantId, organizationId, lineDs }) => {
  // const formatQueryData = (list = []) => {
  //   if (isEmpty(list)) return;
  //   const fieldsMap = {
  //     pcNum: 'pcNum',
  //     supplierCompanyId: 'supplierCompanyId',
  //     companyId: 'companyId',
  //   };
  //   const oldData = purchaseAgreementDs.queryDataSet.current.toJSONData();
  //   const queryData = {};
  //   list.forEach((i) => {
  //     queryData[fieldsMap[i.viewField]] = {
  //       value: i.viewValue,
  //       code: i.viewCode,
  //       meaning: i.viewMeaning,
  //     };
  //   });
  //   purchaseAgreementDs.queryDataSet.loadData([{ ...oldData, ...queryData }]);
  // };
  return {
    autoQuery: true,
    primaryKey: 'poHeaderId',
    dataKey: null,
    dataToJSON: 'all',
    autoQueryAfterSubmit: true,
    feedback: {
      loadSuccess({ mergeField }) {
        if (isArray(mergeField) && !isEmpty(mergeField)) {
          // formatQueryData(mergeField);
        }
      },
    },
    transport: {
      read: ({ params, dataSet }) => ({
        url: `${SRM_SPUC}/v1/${tenantId}/po-header/${poHeaderId}/detail`,
        method: 'GET',
        params: {
          camp: 1,
          poEntryPoint: 'PO_MAINTAIN_DETAIL',
          customizeUnitCode: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
          ...params,
        },
        transformResponse(res) {
          const data = JSON.parse(res);
          // 个性化的默认值逻辑导致无法通过 record.getPristineValue 来判断原始值是否有值， 临时使用此方式
          dataSet.setState('response', data);
          return data;
        },
      }),
      submit: ({ data, dataSet }) => {
        const submitType = dataSet.getState('submitType');
        const { ...poHeaderDetailDTO } = data[0];
        // 从data中无法获取跨页缓存的行数据，改从ds中获取
        const poLineDetailDTOs = lineDs.toJSONData();
        // const fieldMap = lineDs.getState('fieldMap');
        const body = {
          poHeaderDetailDTO: {
            ...poHeaderDetailDTO,
            tenantId,
            supplierId: poHeaderDetailDTO.supplierId || null,
            supplierName: poHeaderDetailDTO.supplierName || null,
            supplierCode: poHeaderDetailDTO.supplierNum || poHeaderDetailDTO.supplierCode,
          },
          poLineDetailDTOs: poLineDetailDTOs.map((item) => ({
            ...item,
            tenantId,
            surfaceTreatFlag: item.surfaceTreatFlag ? 1 : 0,
            poLineId: item.displayLineNum ? item.poLineId : undefined,
          })),
          poLineBasicDetailDTOs: [],
          poLineOtherDetailDTOs: [],
          // fieldMap,
        };
        const config = {
          data: body,
          params: {
            customizeUnitCode,
          },
          transformResponse(res) {
            const result = JSON.parse(res);
            if (result && result.failed) {
              return result;
            }
            if (result && ['submit', 'save', 'save-warn'].includes(submitType)) {
              return result;
            }
            return {
              ...poHeaderDetailDTO,
              poLineDetailDTOs,
            };
          },
        };
        if (submitType === 'done') {
          config.url = `${SRM_SPUC}/v1/${tenantId}/po-header/submit`;
          config.method = 'POST';
        } else if (submitType === 'submit') {
          if (poLineDetailDTOs.length !== 0) {
            config.url = `${SRM_SPUC}/v1/${tenantId}/po-header/submit-warn`;
            config.method = 'POST';
          }
        } else if (submitType === 'save-warn') {
          config.url = `${SRM_SPUC}/v1/${tenantId}/po-header/save-warn`;
          config.method = 'POST';
        } else {
          config.url = `${SRM_SPUC}/v1/${tenantId}/po-header/maintain`;
          config.method = 'PUT';
        }
        return config;
      },
    },
    fields: [
      {
        name: 'poTypeId',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.poTypeDesc`).d('订单类型'),
        required: true,
        lovCode: 'SPUC_ORDER_TYPE',
        lovPara: { tenantId, enabledFlag: 1 },
        transformResponse: (value, object) =>
          value && {
            orderTypeId: value,
            orderTypeCode: object.orderTypeCode,
            orderTypeName: object.poTypeDesc,
            returnOrderFlag: object.returnOrderFlag,
          },
        transformRequest: (value) => value?.orderTypeId,
      },
      { name: 'poTypeDesc', bind: 'poTypeId.orderTypeName' },
      { name: 'poTypeCode', bind: 'poTypeId.orderTypeCode' },
      { name: 'returnOrderFlag', bind: 'poTypeId.returnOrderFlag' },
      {
        name: 'displayPoNum',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.displayPoNum`).d('订单号'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.creationDate`).d('创建时间'),
      },
      {
        name: 'companyName',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.companyName`).d('公司'),
      },
      { name: 'companyCode' },
      { name: 'companyId' },
      {
        name: 'ouId',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.ouName`).d('业务实体'),
        required: true,
        textField: 'ouName',
        dynamicProps: {
          lovPara({ record }) {
            return (
              record && {
                tenantId,
                organizationId,
                companyId: record.get('companyId'),
              }
            );
          },
          lovCode({ dataSet }) {
            if (!dataSet.getState('response')?.ouId) {
              return 'SPFM.USER_AUTH.OU';
            }
          },
        },
        transformResponse: (value, object) =>
          value && { ouId: value, ouCode: object.ouCode, ouName: object.ouName },
        transformRequest: (value) => value?.ouId,
      },
      { name: 'ouCode', bind: 'ouId.ouCode' },
      { name: 'ouName', bind: 'ouId.ouName' },
      {
        name: 'supplierName',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.supplier`).d('供应商'),
      },
      {
        name: 'purchaseOrgId',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.purchaseOrgName`).d('采购组织'),
        required: true,
        lovPara: {
          organizationId,
        },
        transformResponse: (value) => value && { purchaseOrgId: value },
        transformRequest: (value) => value?.purchaseOrgId,
        lovCode: 'SPFM.USER_AUTH.PURORG',
      },
      { name: 'purchaseOrgName', bind: 'purchaseOrgId.organizationName' },
      {
        name: 'agentId',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.agentName`).d('采购员'),
        required: true,
        lovPara: {
          organizationId,
        },
        transformResponse: (value) => value && { purchaseAgentId: value },
        transformRequest: (value) => value?.purchaseAgentId,
        dynamicProps: {
          lovCode({ dataSet }) {
            if (!dataSet.getState('response')?.agentId) {
              return 'SPFM.USER_AUTH.PURCHASE_AGENT';
            }
          },
          textField({ dataSet }) {
            if (dataSet.getState('response')?.agentId) {
              return 'purchaseAgentName';
            }
          },
          disabled: ({ record, dataSet }) => {
            const { agentId } = dataSet.getState('response') || {};
            return agentId && record.get('agentId');
          },
        },
      },
      { name: 'agentName', bind: 'agentId.purchaseAgentName' },
      {
        name: 'currencyCode',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.currencyCode`).d('币种'),
      },
      {
        name: 'taxIncludeAmount',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.taxIncludeAmount`).d('含税总金额'),
        dynamicProps: {
          currency: ({ record }) => record && record.get('currencyCode'),
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record && record.get('financialPrecision')
          ),
        },
      },
      {
        name: 'amount',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.amount`).d('不含税总金额'),
        dynamicProps: {
          currency: ({ record }) => record && record.get('currencyCode'),
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record && record.get('financialPrecision')
          ),
        },
      },
      {
        name: 'termsId',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.terms`).d('付款条款'),
        lovCode: 'SMDM.PAYMENT.TERM',
        lovPara: { tenantId },
        transformResponse: (value) => value && { termId: value },
        transformRequest: (value) => value?.termId,
      },
      { name: 'termsName', bind: 'termsId.termName' },
      {
        name: 'quantityTotal',
        type: 'number',
        label: intl.get('sodr.common.model.common.totalQuantity').d('总数量'),
      },
      {
        name: 'poSourcePlatformMeaning',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.PlatformMeaning`).d('来源平台'),
      },
      {
        name: 'sourceBillTypeCodeMeaning',
        label: intl.get(`sodr.common.model.commom.sourceBillTypeCodeMeaning`).d('单据来源类别'),
      },
      {
        name: 'domesticCurrencyCode',
        label: intl
          .get(`sodr.quotePurchase.model.quotePurchase.domesticCurrencyCode`)
          .d('本币币种'),
      },
      {
        name: 'domesticTaxIncludeAmount',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl
          .get(`sodr.quotePurchase.model.quotePurchase.domesticTaxIncludeAmount`)
          .d('本币含税金额'),
        dynamicProps: {
          currency: ({ record }) => record && record.get('domesticCurrencyCode'),
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record && record.get('domesticFinancialPrecision')
          ),
        },
      },
      {
        name: 'domesticAmount',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl
          .get(`sodr.quotePurchase.model.quotePurchase.domesticAmount`)
          .d('本币不含税金额'),
        dynamicProps: {
          currency: ({ record }) => record && record.get('domesticCurrencyCode'),
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record && record.get('domesticFinancialPrecision')
          ),
        },
      },
      {
        name: 'supplierOrderTypeCode',
        label: intl
          .get(`sodr.quotePurchase.model.quotePurchase.supplierOrderTypeCode`)
          .d('京东e卡-code'),
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
        name: 'supplierSiteId',
        type: 'object',
        label: intl.get(`sodr.common.model.common.supplierSites`).d('供应商地点'),
        transformResponse: (value) => value && { supplierSiteId: value },
        transformRequest: (value) => value?.supplierSiteId,
        dynamicProps: {
          required: ({ record }) =>
            record &&
            record.get('enableSupplierSiteFlag') === 1 &&
            !!record.get('supplierId') &&
            record.get('ouId')?.ouId,
          lovCode: ({ record }) =>
            record && record.get('enableSupplierSiteFlag') === 1 && !!record.get('supplierId')
              ? 'SODR.SUPPLIER_SITE'
              : undefined,
          lovPara: ({ record }) =>
            record && record.get('enableSupplierSiteFlag') === 1 && !!record.get('supplierId')
              ? {
                  tenantId,
                  supplierId: record.get('supplierId') || -1,
                  ouId: record.get('ouId')?.ouId,
                }
              : undefined,
        },
      },
      { name: 'supplierSiteName', bind: 'supplierSiteId.supplierSiteName' },
      {
        name: 'remark',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.orderRemark`).d('订单摘要'),
        maxLength: 480,
        transformRequest: (value) => value || '',
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
    children: {
      poLineDetailDTOs: lineDs,
    },
    events: {
      load: ({ dataSet }) => {
        lineDs.setState({
          fieldMap: undefined,
          fieldMapValues: undefined,
          batchRecordKeys: undefined,
        });
        lineDs.unSelectAll();
        dataSet.forEach((i) => {
          i.init({
            prepayFlag: isNil(i.get('prepayFlag')) ? 0 : i.get('prepayFlag'),
          });
          Object.assign(i, { status: 'update' });
        });
      },
      update({ name, record, value }) {
        if (name === 'poTypeId') {
          const returnOrderFlag = value && value.returnOrderFlag;
          lineDs.forEach((line) => {
            line.set('returnedFlag', returnOrderFlag);
          });
        }
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
        if (name === 'termsId') {
          const { prepayFlag } = value || {};
          record.set({
            prepayFlag,
          });
        }
      },
    },
  };
};
