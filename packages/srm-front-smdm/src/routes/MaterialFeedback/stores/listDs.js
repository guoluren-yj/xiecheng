import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

// 待反馈listDs
const pendingFeedbackListDS = () => ({
  autoQuery: false,
  autoCreate: false,
  selection: false,
  dataToJSON: 'all',
  pageSize: 20,
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MDM}/v1/${tenantId}/item-auth-fee-headers/list-wait-feedback?customizeUnitCode=SMDM_ITEM_PENDING_FEEDBACK.LIST,SMDM_ITEM_PENDING_FEEDBACK.SEARCH`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
        }),
      };
    },
  },
  fields: [
    {
      name: 'nodeCodeMeaning',
      type: 'string',
      label: intl.get(`${commonPrompt}.currentNode`).d('当前阶段'),
    },
    {
      name: 'authFeeStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_FEE_STATUS',
      label: intl.get(`hzero.common.button.status`).d('状态'),
    },
    {
      name: 'feeHeaderNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.feeHeaderNum`).d('物料认证反馈单号'),
    },
    {
      name: 'authenticateNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.authenticateNum`).d('认证事务编号'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`${commonPrompt}.category`).d('采购品类'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`${commonPrompt}.company`).d('公司'),
    },
    {
      name: 'supplierCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.supplierCode`).d('供应商编码'),
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get(`${commonPrompt}.supplierName`).d('供应商名称'),
    },
    {
      name: 'sourcePlatform',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_SOURCE_PLATFORM',
      label: intl.get(`${commonPrompt}.sourcePlatform`).d('来源系统'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
    },
  },
});

// 已反馈listDs
const feedbackListDS = () => ({
  autoQuery: false,
  autoCreate: false,
  selection: false,
  dataToJSON: 'all',
  pageSize: 20,
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MDM}/v1/${tenantId}/item-auth-fee-headers/list-feedback?customizeUnitCode=SMDM_ITEM_FEEDBACK.LIST,SMDM_ITEM_FEEDBACK.SEARCH`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
        }),
      };
    },
  },
  fields: [
    {
      name: 'nodeCodeMeaning',
      type: 'string',
      label: intl.get(`${commonPrompt}.currentNode`).d('当前阶段'),
    },
    {
      name: 'authFeeStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_FEE_STATUS',
      label: intl.get(`hzero.common.button.status`).d('状态'),
    },
    {
      name: 'feeHeaderNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.feeHeaderNum`).d('物料认证反馈单号'),
    },
    {
      name: 'authenticateNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.authenticateNum`).d('认证事务编号'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`${commonPrompt}.category`).d('采购品类'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`${commonPrompt}.company`).d('公司'),
    },
    {
      name: 'supplierCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.supplierCode`).d('供应商编码'),
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get(`${commonPrompt}.supplierName`).d('供应商名称'),
    },
    {
      name: 'sourcePlatform',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_SOURCE_PLATFORM',
      label: intl.get(`${commonPrompt}.sourcePlatform`).d('来源系统'),
    },
    {
      name: 'exportExternalStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_EXPORT_EXT_STA',
      label: intl.get(`${commonPrompt}.exportExternalStatusCode`).d('物料认证完成导出外部状态'),
    },
    {
      name: 'exportExternalErrorReason',
      type: 'string',
      label: intl.get(`${commonPrompt}.exportExternalErrorReason`).d('物料认证完成导出失败原因'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
    },
  },
});

// 全部整单listDs
const allWholeListDS = () => ({
  autoQuery: false,
  autoCreate: false,
  selection: false,
  dataToJSON: 'all',
  pageSize: 20,
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MDM}/v1/${tenantId}/item-auth-fee-headers/list-header/all-feedback?customizeUnitCode=SMDM_ITEM_FEEDBACK_ALL.LIST,SMDM_ITEM_FEEDBACK_ALL.SEARCH`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
        }),
      };
    },
  },
  fields: [
    {
      name: 'nodeCodeMeaning',
      type: 'string',
      label: intl.get(`${commonPrompt}.currentNode`).d('当前阶段'),
    },
    {
      name: 'authFeeStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_FEE_STATUS',
      label: intl.get(`hzero.common.button.status`).d('状态'),
    },
    {
      name: 'feeHeaderNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.feeHeaderNum`).d('物料认证反馈单号'),
    },
    {
      name: 'authenticateNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.authenticateNum`).d('认证事务编号'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`${commonPrompt}.category`).d('采购品类'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`${commonPrompt}.company`).d('公司'),
    },
    {
      name: 'supplierCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.supplierCode`).d('供应商编码'),
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get(`${commonPrompt}.supplierName`).d('供应商名称'),
    },
    {
      name: 'sourcePlatform',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_SOURCE_PLATFORM',
      label: intl.get(`${commonPrompt}.sourcePlatform`).d('来源系统'),
    },
    {
      name: 'exportExternalStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_EXPORT_EXT_STA',
      label: intl.get(`${commonPrompt}.exportExternalStatusCode`).d('物料认证完成导出外部状态'),
    },
    {
      name: 'exportExternalErrorReason',
      type: 'string',
      label: intl.get(`${commonPrompt}.exportExternalErrorReason`).d('物料认证完成导出失败原因'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
    },
  },
});

// 明细listDs
const lineListDS = (type) => ({
  autoQuery: false,
  autoCreate: false,
  selection: false,
  dataToJSON: 'all',
  pageSize: 20,
  transport: {
    read: ({ data }) => {
      let url = `${SRM_MDM}/v1/${tenantId}/item-auth-fee-lines?customizeUnitCode=SMDM_ITEM_FEEDBACK_ALL.LINE_LIST,SMDM_ITEM_FEEDBACK_ALL.LINE_SEARCH`;
      switch (type) {
        case 'pending':
          url = `${SRM_MDM}/v1/${tenantId}/item-auth-fee-lines/list-wait-feedback?customizeUnitCode=SMDM_ITEM_PENDING_FEEDBACK.LINE_LIST,SMDM_ITEM_PENDING_FEEDBACK.LINE_SEARCH`;
          break;
        case 'feeback':
          url = `${SRM_MDM}/v1/${tenantId}/item-auth-fee-lines/list-feedback?customizeUnitCode=SMDM_ITEM_FEEDBACK.LINE_LIST,SMDM_ITEM_FEEDBACK.LINE_SEARCH`;
          break;
        default:
          break;
      }
      return {
        url,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
        }),
      };
    },
  },
  fields: [
    {
      name: 'nodeCodeMeaning',
      type: 'string',
      label: intl.get(`${commonPrompt}.currentNode`).d('当前阶段'),
    },
    {
      name: 'authFeeStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_FEE_STATUS',
      label: intl.get(`hzero.common.button.status`).d('状态'),
    },
    {
      name: 'feeHeaderNumAndLineNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.feeHeaderNumAndLineNum`).d('物料认证反馈单号-行号'),
    },
    {
      name: 'authenticateNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.authenticateNum`).d('认证事务编号'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`${commonPrompt}.materialCategory`).d('物料品类'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`${commonPrompt}.materialCategory`).d('物料品类'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
    },
    {
      name: 'formalItemCode',
      label: intl.get(`${commonPrompt}.formalItemCode`).d('正式物料编码'),
      type: 'string',
    },
    {
      name: 'formalItemName',
      label: intl.get(`${commonPrompt}.formalItemName`).d('正式物料名称'),
      type: 'string',
    },
    {
      name: 'feedbackDate',
      type: 'date',
      label: intl.get(`${commonPrompt}.feedbackDate`).d('反馈日期'),
    },
    {
      name: 'neededDate',
      type: 'date',
      label: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
    },
    {
      name: 'syncDate',
      type: 'date',
      label: intl.get(`${commonPrompt}.syncDate`).d('同步日期'),
    },
    {
      name: 'sourceDocumentsNumAndLineNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.sourceDocumentsNumAndLineNum`).d('来源单号-行号'),
    },
    {
      name: 'poNum',
      label: intl.get(`${commonPrompt}.poNum`).d('订单单号'),
      type: 'string',
    },
    {
      name: 'sourceNum',
      label: intl.get(`${commonPrompt}.sourceNum`).d('寻源单号'),
      type: 'string',
    },
    {
      name: 'sourcePrice',
      label: intl.get(`${commonPrompt}.sourcePrice`).d('寻源价格'),
      type: 'number',
    },
    {
      name: 'executorName',
      type: 'string',
      label: intl.get(`${commonPrompt}.executorName`).d('需求执行人'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
    },
  },
});

export { pendingFeedbackListDS, feedbackListDS, allWholeListDS, lineListDS };
