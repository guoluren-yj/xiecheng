import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { SRM_MDM } from '_utils/config';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { getBatchOperationFlag } from '../util';

const tenantId = getCurrentOrganizationId();
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

// 待认证listDs
const awaitAuthsListDS = () => ({
  autoQuery: false,
  autoCreate: false,
  dataToJSON: 'all',
  cacheSelection: true,
  cacheModified: true,
  primaryKey: 'awaitAuthenticateId',
  pageSize: 20,
  transport: {
    read: ({ data }) => {
      const { authenticateOrSourceDocumentsNumQueryList, customizeFilterComparison } = data;
      const otherObj = {};
      if (
        authenticateOrSourceDocumentsNumQueryList &&
        !authenticateOrSourceDocumentsNumQueryList.includes(',')
      ) {
        otherObj.sourceDocumentsNum = authenticateOrSourceDocumentsNumQueryList;
        otherObj.authenticateOrSourceDocumentsNumQueryList = undefined;
        otherObj.customizeFilterComparison = customizeFilterComparison
          ? `${customizeFilterComparison},sourceDocumentsNum:LIKE`
          : 'sourceDocumentsNum:LIKE';
      }
      return {
        url: `${SRM_MDM}/v1/${tenantId}/item-await-auths?customizeUnitCode=SMDM.ITEM_AWAIT_AUTH.LIST,SMDM.ITEM_AWAIT_AUTH.SEARCH`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          ...otherObj,
        }),
      };
    },
  },
  fields: [
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
      name: 'authenticateStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTHENTICATE_STATUS',
      label: intl.get(`hzero.common.button.status`).d('状态'),
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
      name: 'uomName',
      type: 'string',
      label: intl.get(`${commonPrompt}.uomName`).d('单位'),
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
      name: 'neededDate',
      type: 'date',
      label: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
    },
    {
      name: 'sourcePlatform',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_SOURCE_PLATFORM',
      label: intl.get(`${commonPrompt}.sourcePlatform`).d('来源系统'),
    },
    {
      name: 'sourceDocumentsNumAndLineNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.sourceDocumentsNumAndLineNum`).d('来源单号-行号'),
    },
    {
      name: 'syncDate',
      type: 'date',
      label: intl.get(`${commonPrompt}.syncDate`).d('同步日期'),
    },
    {
      name: 'unitName',
      type: 'string',
      label: intl.get(`${commonPrompt}.department`).d('部门'),
    },
    {
      name: 'prTypeName',
      type: 'string',
      label: intl.get(`${commonPrompt}.prTypeName`).d('采购申请类型'),
    },
    {
      name: 'formalItemCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.formalItemCode`).d('正式物料编码'),
    },
    {
      name: 'formalItemName',
      type: 'string',
      label: intl.get(`${commonPrompt}.formalItemName`).d('正式物料名称'),
    },
    {
      name: 'executorName',
      type: 'string',
      label: intl.get(`${commonPrompt}.executorName`).d('需求执行人'),
    },
    {
      name: 'operation',
      label: intl.get(`hzero.common.button.operating`).d('操作记录'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`hzero.common.creationName`).d('创建人'),
      disabled: true,
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

// 创建弹框listDs
const headerInfoDS = ({
  itemAuthReqHeaderId,
  isSelectCreateFlag = false,
  setAwaitAuthConQuote,
}) => ({
  autoQuery: false,
  autoCreate: false,
  forceValidate: true,
  dataToJSON: 'all',
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/${itemAuthReqHeaderId}?createPopupFlag=1&customizeUnitCode=SMDM.ITEM_AUTH_CREATE_MODAL.FORM`,
      method: 'GET',
    },
  },
  fields: [
    {
      name: 'reqHeaderNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.reqHeaderNum`).d('物料认证单号'),
      disabled: true,
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      disabled: true,
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      disabled: true,
    },
    {
      name: 'companyId',
      type: 'object',
      required: true,
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      textField: 'companyName',
      valueField: 'companyId',
      label: intl.get(`${commonPrompt}.company`).d('公司'),
      lovPara: { tenantId, enabledFlag: 1 },
      transformResponse(value, data) {
        if (value) {
          return {
            companyId: value,
            companyName: data.companyName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.companyId,
    },
    {
      name: 'companyName',
      type: 'string',
      bind: 'companyId.companyName',
    },
    {
      name: 'supplierId',
      type: 'object',
      required: true,
      lovCode: 'SPRM.SUPPLIER',
      label: intl.get(`${commonPrompt}.supplier`).d('供应商'),
      dynamicProps: {
        lovPara({ record }) {
          return {
            tenantId,
            enabledFlag: 1,
            companyId: record?.get('companyId')?.companyId,
          };
        },
      },
      transformResponse(value, data) {
        if (value || data.supplierCompanyId) {
          return {
            supplierId: value,
            supplierNume: data.supplierCode,
            supplierName: data.supplierName,
            supplierCompanyId: data.supplierCompanyId,
            supplierCompanyName: data.supplierCompanyName,
            supplierTenantId: data.supplierTenantId,
            displaySupplierName: data.displaySupplierName,
            supplierCompanyNUm: data.supplierCompanyCode,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.supplierId,
    },
    {
      name: 'supplierCode',
      type: 'string',
      bind: 'supplierId.supplierNum',
    },
    {
      name: 'supplierName',
      type: 'string',
      bind: 'supplierId.supplierName',
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierId.supplierCompanyId',
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      bind: 'supplierId.supplierCompanyName',
    },
    {
      name: 'supplierTenantId',
      type: 'string',
      bind: 'supplierId.supplierTenantId',
    },
    {
      name: 'supplierCompanyCode',
      type: 'string',
      bind: 'supplierId.supplierCompanyNum',
    },
    {
      name: 'displaySupplierName',
      type: 'string',
      bind: 'supplierId.displaySupplierName',
    },
    {
      name: 'categoryId',
      type: 'object',
      // lovCode: 'SMDM.ITEM_CATEGORY_ENCRYPTION',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      textField: 'categoryName',
      valueField: 'categoryId',
      label: intl.get(`${commonPrompt}.category`).d('采购品类'),
      // lovPara: { tenantId, enabledFlag: 1, businessObjectCode: 'SRM_C_SMDM_ITEM_AUTH_REQ' },
      transformResponse(value, data) {
        if (value) {
          return {
            categoryId: value,
            categoryName: data.categoryName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.categoryId,
      optionsProps: {
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
      },
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId,
          enabledFlag: 1,
          businessObjectCode:
            !record.get('sourcePlatform') || record.get('sourcePlatform') === 'SRM'
              ? 'SRM_C_SMDM_ITEM_AUTH_REQ'
              : null,
        }),
      },
    },
    {
      name: 'categoryName',
      bind: 'categoryId.categoryName',
    },
    {
      name: 'unitId',
      type: 'object',
      lovCode: 'SPRM.USER_UNIT',
      textField: 'unitName',
      valueField: 'unitId',
      label: intl.get(`${commonPrompt}.department`).d('部门'),
      lovPara: { tenantId, enabledFlag: 1 },
      transformResponse(value, data) {
        if (value) {
          return {
            unitId: value,
            unitName: data.unitName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.unitId,
    },
    {
      name: 'unitName',
      bind: 'unitId.unitName',
    },
    {
      name: 'prTypeId',
      type: 'object',
      lovCode: 'SPUC.PR_DEMAND_TYPE',
      textField: 'prTypeName',
      valueField: 'prTypeId',
      label: intl.get(`${commonPrompt}.prType`).d('采购申请类型'),
      lovPara: { tenantId },
      transformResponse(value, data) {
        if (value) {
          return {
            prTypeId: value,
            prTypeName: data.prTypeName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.prTypeId,
    },
    {
      name: 'prTypeName',
      bind: 'prTypeId.prTypeName',
    },
    {
      name: 'sourcePlatform',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_SOURCE_PLATFORM',
      label: intl.get(`${commonPrompt}.source`).d('来源'),
      disabled: true,
    },
    {
      name: 'strategyName',
      type: 'object',
      lovCode: 'SMDM.ITEM_AUTH_STRATEGY_TEMPLATE_RELEASE',
      label: intl.get(`${commonPrompt}.materialAuthStrategy`).d('物料认证策略'),
      dynamicProps: {
        disabled: ({ record }) =>
          record?.get('autoMatchStrategyNumFlag') === '1' || record.get('itemAuthReqHeaderId'),
        required: ({ record }) => record?.get('autoMatchStrategyNumFlag') !== '1',
      },
      transformResponse(value, data) {
        if (value) {
          return {
            versionNumber: data.strategyVersionNumber,
            strategyName: value,
            strategyNum: data.strategyNum,
            strategyNameVersion: data.strategyName
              ? `${data.strategyName}【${intl
                  .get(`hzero.common.components.dataAudit.version`)
                  .d('版本')}${data.strategyVersionNumber}】`
              : null,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.strategyName,
    },
    {
      name: 'strategyNum',
      bind: 'strategyName.strategyNum',
    },
    {
      name: 'strategyVersionNumber',
      bind: 'strategyName.strategyVersionNumber',
    },
    {
      name: 'autoMatchStrategyNumFlag',
      type: 'string',
      defaultValue: '1',
      label: intl.get(`${commonPrompt}.autoMatchStrategyNumFlag`).d('是否自动匹配物料认证策略'),
      lookupCode: 'HPFM.FLAG',
      dynamicProps: {
        disabled: ({ record }) => record.get('itemAuthReqHeaderId'),
      },
    },
    {
      name: 'awaitAuthConQuote',
      type: 'string',
      defaultValue: '0',
      label: intl.get(`${commonPrompt}.awaitAuthConQuote`).d('勾选的待认证申请是否可继续引用'),
      lookupCode: 'HPFM.FLAG',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('itemAuthReqHeaderId'),
      },
    },
    {
      name: 'supplierCategoryId',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_CATEGORY',
      transformResponse(value, data) {
        if (value) {
          return {
            categoryId: value,
            categoryDescription: data?.supplierCategoryDescription,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.categoryId,
      label: intl.get(`${commonPrompt}.supplierCategoryId`).d('供应商分类'),
    },
  ],
  events: {
    update: ({ name, value }) => {
      // if (name === 'autoMatchStrategyNumFlag') {
      //   if (String(value) !== '1') {
      //     record.set({
      //       strategyName: null,
      //     });
      //   }
      // }
      if (name === 'awaitAuthConQuote') {
        setAwaitAuthConQuote(value);
      }
    },
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        record.set({
          isSelectCreateFlag,
          awaitAuthConQuote: dataSet.getState('awaitAuthConQuote') ?? '0',
        });
      });
    },
  },
});

// 明细
const linelListDS = ({ type }) => ({
  primaryKey: type,
  autoQuery: false,
  autoCreate: false,
  selection: 'multiple',
  dataToJSON: 'all',
  pageSize: 20,
  cacheSelection: true,
  transport: {
    read: ({ data }) => {
      let url = `${SRM_MDM}/v1/${tenantId}/item-auth-req-lines/list-cancel?customizeUnitCode=SMDM.ITEM_CANCEL.LINE_LIST,SMDM.ITEM_CANCEL.LINE_SEARCH`;
      switch (type) {
        case 'cancel':
          url = `${SRM_MDM}/v1/${tenantId}/item-auth-req-lines/list-cancel?customizeUnitCode=SMDM.ITEM_CANCEL.LINE_LIST,SMDM.ITEM_CANCEL.LINE_SEARCH`;
          break;
        case 'pending':
          url = `${SRM_MDM}/v1/${tenantId}/item-auth-req-lines/list-authenticateing?customizeUnitCode=SMDM.ITEM_PENDING_AUTH.LINE_LIST,SMDM.ITEM_PENDING_AUTH.LINE_SEARCH`;
          break;
        case 'certified':
          url = `${SRM_MDM}/v1/${tenantId}/item-auth-req-lines/list-authenticated?customizeUnitCode=SMDM.ITEM_CERTIFIED.LINE_LIST,SMDM.ITEM_CERTIFIED.LINE_SEARCH`;
          break;
        case 'testResult':
          url = `${SRM_MDM}/v1/${tenantId}/item-auth-req-lines/list-test-results-to-be-entered?customizeUnitCode=SMDM.ITEM_TEST_RESULT_ENTRY.LINE_LIST,SMDM.ITEM_TEST_RESULT_ENTRY.LINE_SEARCH`;
          break;
        case 'all':
          url = `${SRM_MDM}/v1/${tenantId}/item-auth-req-lines?customizeUnitCode=SMDM.ITEM_ALL.LINE_SEARCH,SMDM.ITEM_ALL.LINE_TABLE`;
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
      name: 'authReqStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_REQ_STATUS',
      label:
        type === 'certified'
          ? intl.get(`${commonPrompt}.completeMethod`).d('完成方式')
          : intl.get(`hzero.common.button.status`).d('状态'),
    },
    {
      name: 'process',
      type: 'string',
      label: intl.get(`${commonPrompt}.authProcess`).d('认证执行进度'),
    },
    {
      name: 'processStep',
      type: 'string',
      label: intl.get(`${commonPrompt}.processStep`).d('执行阶段'),
    },
    {
      name: 'reqHeaderNumAndLineNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.reqHeaderNumAndLineNum`).d('物料认证单号-行号'),
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
      name: 'createdByName',
      type: 'string',
      label: intl.get(`hzero.common.creationName`).d('创建人'),
      disabled: true,
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

// 整单
const wholeListDS = ({ type }) => ({
  autoQuery: false,
  autoCreate: false,
  selection: 'multiple',
  dataToJSON: 'all',
  pageSize: 20,
  primaryKey: 'itemAuthReqHeaderId',
  cacheSelection: true,
  transport: {
    read: ({ data }) => {
      let url = `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/list-cancel?customizeUnitCode=SMDM.ITEM_CANCEL.WHOLE_LIST,SMDM.ITEM_CANCEL.WHOLE_SEARCH`;
      switch (type) {
        case 'cancel':
          url = `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/list-cancel?customizeUnitCode=SMDM.ITEM_CANCEL.WHOLE_LIST,SMDM.ITEM_CANCEL.WHOLE_SEARCH`;
          break;
        case 'pending':
          url = `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/list-authenticateing?customizeUnitCode=SMDM.ITEM_PENDING_AUTH.LIST,SMDM.ITEM_PENDING_AUTH.SEARCH`;
          break;
        case 'certified':
          url = `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/list-authenticated?customizeUnitCode=SMDM.ITEM_CERTIFIED.LIST,SMDM.ITEM_CERTIFIED.SEARCH`;
          break;
        case 'testResult':
          url = `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/list-test-results-to-be-entered?customizeUnitCode=SMDM.ITEM_TEST_RESULT_ENTRY.LIST,SMDM.ITEM_TEST_RESULT_ENTRY.SEARCH`;
          break;
        case 'all':
          url = `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/list-all?customizeUnitCode=SMDM.ITEM_ALL.WHOLE_SEARCH,SMDM.ITEM_ALL.WHOLE_LIST`;
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
      name: 'viewDetail',
      type: 'string',
      label: intl.get('hzero.common.button.approve.process').d('审批进度'),
    },
    {
      name: 'nodeCodeMeaning',
      type: 'string',
      label: intl.get(`${commonPrompt}.currentNode`).d('当前阶段'),
    },
    { name: 'action', label: intl.get('hzero.common.button.action').d('操作') },
    {
      name: 'authReqStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_REQ_STATUS',
      label:
        type === 'certified'
          ? intl.get(`${commonPrompt}.completeMethod`).d('完成方式')
          : intl.get(`hzero.common.button.status`).d('状态'),
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
    {
      name: 'process',
      type: 'string',
      label: intl.get(`${commonPrompt}.authProcess`).d('认证执行进度'),
    },
    {
      name: 'processStep',
      type: 'string',
      label: intl.get(`${commonPrompt}.processStep`).d('执行阶段'),
    },
    {
      name: 'reqHeaderNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.reqHeaderNum`).d('物料认证单号'),
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
      name: 'createdByName',
      type: 'string',
      label: intl.get(`hzero.common.creationName`).d('创建人'),
      disabled: true,
    },
  ],
  events: {
    async load({ dataSet }) {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
      if (['pending', 'all'].includes(type)) {
        const workFlowBussinessKeys = dataSet.reduce((acc, cur) => {
          const value = cur.get('feeWorkflowBusinessKey') || cur.get('workflowBusinessKey');
          if (value) {
            acc.push(value);
          }
          return acc;
        }, []);
        if (!isEmpty(workFlowBussinessKeys)) {
          // 查询审批记录数据
          const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(
            workFlowBussinessKeys
          );
          console.log(simpleApprovalHistoryData);
          // // 获取审批按钮显示状态
          const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
          // 获取撤销审批按钮状态
          const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
          dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
        }
      }
    },
  },
});

// 预审中列表
const prequalificationListDs = () => ({
  autoQuery: false,
  autoCreate: false,
  selection: 'multiple',
  dataToJSON: 'selected',
  pageSize: 20,
  primaryKey: 'itemAuthFeeHeaderId',
  cacheSelection: true,
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MDM}/v1/${tenantId}/item-auth-fee-headers/list-preapproval?customizeUnitCode=SMDM.ITEM_PREQUALIFICATION.FILTER,SMDM.ITEM_PREQUALIFICATION.TABLE`,
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
    {
      name: 'process',
      type: 'string',
      label: intl.get(`${commonPrompt}.authProcess`).d('认证执行进度'),
    },
    {
      name: 'processStep',
      type: 'string',
      label: intl.get(`${commonPrompt}.processStep`).d('执行阶段'),
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
      name: 'createdByName',
      type: 'string',
      label: intl.get(`hzero.common.creationName`).d('创建人'),
      disabled: true,
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

export { awaitAuthsListDS, headerInfoDS, linelListDS, wholeListDS, prequalificationListDs };
