import intl from 'utils/intl';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { SRM_SRPM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { c7nAmountFormatterOptions } from '@/routes/components/utils';
import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';
import { getBatchOperationFlag } from '@/routes/utils';
// import { PRIVATE_BUCKET } from '_utils/config';

import { fetchCategory } from '@/services/rpExecuteProgramService';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'srpm.common.model.common';

const listDs = (tab = '', blLineId = null) => {
  return {
    paging: tab !== 'blLineSourceModal',
    pageSize: 20,
    cacheModified: true,
    cacheSelection: true,
    autoQuery: false,
    primaryKey: tab === 'todo' ? 'rpLineId' : tab === 'submitted' ? 'blHeaderId' : 'blLineId',
    // checkField: tab === 'pending' ? 'isChecked' : null,
    fields: [
      {
        label: intl.get(`hzero.common.status`).d('状态'),
        name: 'blStatus',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.sourceDocument`).d('来源单据'),
        name: 'rpNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.splitLine`).d('是否拆分行'),
        name: 'splitFlagMeaning',
      },
      {
        label: intl.get(`${commonPrompt}.sourceSplitNumAndLineNum`).d('来源拆分行'),
        name: 'splitBlNumAndLineNum',
      },
      {
        label: intl.get(`${commonPrompt}.lineNum`).d('来源单行号'),
        name: 'lineNum',
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.prNumAndlineNum`).d('来源单号-行号'),
        name: 'prNumAndlineNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.sourcePrNumsAndlineNum`).d('来源单据-行号'),
        name: 'sourcePrNumsAndlineNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.releaseFlag`).d('发放状态'),
        name: 'releaseFlag',
        type: 'string',
        lookupCode: 'SRPM.BL_RELEASE_FLAG',
      },
      {
        label: intl.get(`${commonPrompt}.purchaseRequisitionNumAndlineNum`).d('采购申请单号-行号'),
        name: 'prNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.blNum`).d('需求计划单号'),
        name: 'blNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.blNumAndlineNum`).d('需求计划单号-行号'),
        name: 'blNumAndlineNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.containerCode`).d('需求计划编码'),
        name: 'containerCode',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.containerName`).d('需求计划'),
        name: 'containerName',
        type: 'string',
      },
      {
        name: 'invOrganizationId',
        type: 'string',
      },
      {
        name: 'invOrganizationName',
        label: intl.get(`${commonPrompt}.inventory`).d('库存组织'),
        type: 'string',
      },
      {
        name: 'itemCode',
        label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
        type: 'string',
      },
      {
        name: 'itemName',
        label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
        type: 'string',
      },
      {
        name: 'uomId',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        lovCode: 'SMDM.DUAL_UOM_ID',
        type: 'object',
        textField: 'uomName',
        ignore: 'always',
        valueField: 'uomId',
        transformResponse(value, data) {
          if (value) {
            return {
              uomId: value,
              uomCode: data.uomCode,
              uomName: data.uomName,
              uomPrecision: data.uomPrecision,
              uomCodeAndName: data.uomCodeAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.uomId,
      },
      {
        name: 'uomPrecision',
        type: 'number',
        bind: 'uomId.uomPrecision',
      },
      // {
      //   name: 'uomId',
      //   bind: 'uomLov.uomId',
      // },
      {
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        name: 'uomCode',
        bind: 'uomLov.uomCode',
      },
      {
        name: 'uomName',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        bind: 'uomLov.uomName',
      },
      {
        label: intl.get(`${commonPrompt}.quantity`).d('需求计划数量'),
        name: 'quantity',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.mergeQuantity`).d('平衡数量'),
        name: 'mergeQuantity',
        type: 'number',
        min: 0,
        validator: (value) => {
          if (value > 0) {
            return true;
          } else {
            return intl.get(`srpm.common.message.mustExceedZero`).d('数量必须大于0');
          }
        },
        transformRequest: (value, record = {}) =>
          value || value === 0 ? value : record?.get('remainQuantity') || null,
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.remainQuantity`).d('剩余平衡数量'),
        name: 'remainQuantity',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        name: 'neededDate',
        type: 'date',
        min: moment('1970-01-01'),
      },
      {
        name: 'taxRate',
        label: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        type: 'number',
      },
      {
        name: 'currencyCode',
        label: intl.get(`${commonPrompt}.currencyCode`).d('行币种'),
        type: 'string',
      },
      {
        name: 'taxIncludedUnitPrice',
        label: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('单价(含税)'),
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('defaultPrecision') ?? null;
          },
        },
      },
      {
        name: 'taxIncludedLineAmount',
        label: intl.get(`${commonPrompt}.taxIncludedLineAmount`).d('行金额(含税)'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record && (record.get('financialPrecision') ?? undefined)
          ),
        },
      },
      {
        name: 'unitPrice',
        label: intl.get(`${commonPrompt}.unitPrice`).d('单价(不含税)'),
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('defaultPrecision') ?? null;
          },
        },
      },
      {
        name: 'lineAmount',
        label: intl.get(`${commonPrompt}.lineAmount`).d('行金额(不含税)'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record && (record.get('financialPrecision') ?? undefined)
          ),
        },
      },
      {
        name: 'unitName',
        label: intl.get(`${commonPrompt}.unitName`).d('部门'),
        type: 'string',
      },
      {
        name: 'rpStatusMeaning',
        label: intl.get(`${commonPrompt}.rpStatusMeaning`).d('状态'),
        type: 'string',
      },
      {
        name: 'rpSourcePlatformMeaning',
        label: intl.get(`${commonPrompt}.rpSourcePlatform`).d('单据来源'),
        type: 'string',
      },
      {
        name: 'version',
        label: intl.get(`${commonPrompt}.version`).d('版本'),
        type: 'string',
      },
      {
        name: 'amount',
        label: intl.get(`${commonPrompt}.PlanAmount`).d('计划总额'),
        type: 'currency',
        disabled: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record && (record.get('financialPrecision') ?? undefined)
          ),
        },
      },
      {
        name: 'operatorRecord',
        label: intl.get(`${commonPrompt}.action`).d('操作'),
      },
      {
        name: 'createdByName',
        label: intl.get(`entity.roles.creator`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.creationDate`).d('创建日期'),
      },
      {
        name: 'originalCurrency',
        label: intl.get(`${commonPrompt}.originalCurrency`).d('原币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        type: 'object',
        valueField: 'currencyCode',
        transformResponse(value, data) {
          if (value) {
            return {
              currencyCode: value,
              financialPrecision: data.financialPrecision,
              defaultPrecision: data.defaultPrecision,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'financialPrecision',
        bind: 'originalCurrency.financialPrecision',
      },
      {
        name: 'defaultPrecision',
        bind: 'originalCurrency.defaultPrecision',
      },
      {
        name: 'localCurrency',
        label: intl.get(`${commonPrompt}.localCurrency`).d('本币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              currencyCode: value,
              financialPrecision: data.localFinancialPrecision,
              defaultPrecision: data.localDefaultPrecision,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'localFinancialPrecision',
        bind: 'localCurrency.financialPrecision',
      },
      {
        name: 'localDefaultPrecision',
        bind: 'localCurrency.defaultPrecision',
      },
      {
        name: 'originalCurrencyNoTaxSum',
        label: intl.get(`${commonPrompt}.originalCurrencyNoTaxSum`).d('原币总金额(不含税)'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record && (record.get('financialPrecision') ?? undefined)
          ),
        },
      },
      {
        name: 'originalCurrencyTaxSum',
        label: intl.get(`${commonPrompt}.originalCurrencyTaxSum`).d('原币总金额(含税)'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record && (record.get('financialPrecision') ?? undefined)
          ),
        },
      },
      {
        name: 'localCurrencyNoTaxSum',
        label: intl.get(`${commonPrompt}.totalLocalCurrencyNoTaxSum`).d('本币总金额(不含税)'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record.get('localFinancialPrecision') ?? undefined
          ),
        },
      },
      {
        name: 'localCurrencyTaxSum',
        label: intl.get(`${commonPrompt}.totalLocalCurrencyTaxSum`).d('本币总金额(含税)'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record.get('localFinancialPrecision') ?? undefined
          ),
        },
      },
      {
        name: 'localCurrencyNoTaxUnit',
        type: 'number',
        label: intl.get('srpm.common.model.common.localCurrencyNoTaxUnit').d('本币单价(不含税)'),
        dynamicProps: {
          precision: ({ record }) => record.get('localDefaultPrecision') ?? undefined,
        },
      },
      {
        label: intl.get(`srpm.common.model.common.localCurrencyTaxUnit`).d('本币单价(含税)'),
        name: 'localCurrencyTaxUnit',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => record.get('localDefaultPrecision') ?? undefined,
        },
      },
      {
        name: 'requestedBy',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
        lovCode: 'SPCM.ACCEPT_USER',
        lovPara: { tenantId: organizationId },
        textField: 'userName',
        // valueField: 'userId',
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              userId: value,
              loginName: data.prRequestedNum,
              userName: data.requestedByName,
              prRequestedNumAndName: data.prRequestedNumAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.userId,
      },
      {
        name: 'prRequestedNum',
        bind: 'requestedBy.loginName',
      },
      {
        name: 'requestedByName',
        bind: 'requestedBy.userName',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
      },
      {
        name: 'requestDate',
        label: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
        type: 'date',
        min: moment('1970-01-01'),
      },
      {
        name: 'remark',
        label: intl.get(`${commonPrompt}.remark`).d('备注'),
        type: 'string',
      },
      {
        name: 'returnReason',
        label: intl.get(`${commonPrompt}.returnReason`).d('退回原因'),
        type: 'string',
      },
      {
        name: 'categoryName',
        label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
      },
      {
        label: intl.get(`${commonPrompt}.itemModel`).d('型号'),
        name: 'itemModel',
      },
      {
        label: intl.get(`${commonPrompt}.itemSpecs`).d('规格'),
        name: 'itemSpecs',
      },
      {
        name: 'companyId',
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        textField: 'companyName',
        type: 'object',
        transformRequest: (value) => value?.companyId,
        label: intl.get(`entity.company.tag`).d('公司'),
      },
      {
        name: 'ouId',
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        type: 'object',
        transformRequest: (value) => value?.ouId,
        label: intl.get(`entity.business.tag`).d('业务实体'),
      },
      {
        name: 'purchaseOrgId',
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      },
      {
        name: 'purchaseAgentId',
        label: intl.get(`srpm.common.model.common.planner`).d('计划员'),
        lovCode: 'SRPM.PURCHASE_AGENT',
        textField: 'purchaseAgentName',
        valueField: 'purchaseAgentId',
        type: 'object',
        transformRequest: (value) => value?.purchaseAgentId,
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get(`entity.company.tag`).d('公司'),
      },
      {
        name: 'ouName',
        type: 'string',
        label: intl.get(`entity.business.tag`).d('业务实体'),
      },
      {
        name: 'purchaseOrgName',
        type: 'string',
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      },
      {
        name: 'workFlowApproveProcess',
        label: intl.get('hzero.common.button.approve.process').d('审批进度'),
        type: 'string',
      },
    ],

    transport: {
      read: (values) => {
        const { data, params = {} } = values;
        const { advancedData, ...otherData } = data;
        const newParams = {
          ...params,
          ...otherData,
          ...advancedData,
        };
        let url;
        let customizeUnitCode;
        switch (tab) {
          case 'todo': // 待处理申请单
            url = `${SRM_SRPM}/v1/${organizationId}/request-plan/todo-list`;
            customizeUnitCode =
              'SRPM.RP_EXECUTE_PLATFORM.TODO.LIST,SRPM.RP_EXECUTE_PLATFORM.TODO.LIST.SEARCH_BAR';
            break;
          // case 'pending': // 计划平衡中
          //   url = `${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/pending-list`;
          //   customizeUnitCode =
          //     'SRPM.RP_EXECUTE_PLATFORM.PENDING.LIST,SRPM.RP_EXECUTE_PLATFORM.FILTER_BAR';
          //   break;
          case 'submitted': // 平衡结果审批中
            url = `${SRM_SRPM}/v1/${organizationId}/request-plan-balance/submitted-list`;
            customizeUnitCode =
              'SRPM.RP_EXECUTE_PLATFORM.SUBMITTED.LIST,SRPM.RP_EXECUTE_PLATFORM.SUBMITTED.LIST.SEARCH_BAR';
            break;
          case 'submittedLine': // 平衡结果审批中 行
            url = `${SRM_SRPM}/v1/${organizationId}/request-plan-balance/submitted-list/lines`;
            customizeUnitCode =
              'SRPM.RP_EXECUTE_PLATFORM.SUBMITTED_LINE.LIST,SRPM.RP_EXECUTE_PLATFORM.SUBMITTED_LINE.LIST.SEARCH_BAR';
            break;
          case 'ready': // 已平衡待发放
            url = `${SRM_SRPM}/v1/${organizationId}/request-plan-balance/ready-list`;
            customizeUnitCode =
              'SRPM.RP_EXECUTE_PLATFORM.READY.LIST,SRPM.RP_EXECUTE_PLATFORM.READY.LIST.SEARCH_BAR';
            break;
          case 'released': // 已发放
            url = `${SRM_SRPM}/v1/${organizationId}/request-plan-balance/released-list`;
            customizeUnitCode =
              'SRPM.RP_EXECUTE_PLATFORM.RELEASED.LIST,SRPM.RP_EXECUTE_PLATFORM.RELEASED.LIST.SEARCH_BAR';
            break;
          case 'releaseding':
            url = `${SRM_SRPM}/v1/${organizationId}/request-plan-balance/releaseding-list`;
            customizeUnitCode =
              'SRPM.RP_EXECUTE_PLATFORM.RELEASEDING_LIST,SRPM.RP_EXECUTE_PLATFORM.RELEASEDING_LIST_SEARCH_BAR';
            break;
          case 'blLineSourceModal': // 查看来源单据
            url = `${SRM_SRPM}/v1/${organizationId}/request-plan-execute/bl-line-source`;
            customizeUnitCode = 'SRPM.RP_EXECUTE_PLATFORM.DOC_SOURCE_LIST';
            break;
          default:
            // 默认（待提交申请单）
            url = `${SRM_SRPM}/v1/${organizationId}/request-plan/todo-list`;
            customizeUnitCode =
              'SRPM.RP_EXECUTE_PLATFORM.TODO.LIST,SRPM.RP_EXECUTE_PLATFORM.TODO.LIST.SEARCH_BAR';
            break;
        }

        return {
          url,
          method: 'GET',
          data: filterNullValueObject({
            ...data,
            ...newParams,
            customizeUnitCode,
            advancedData: undefined,
            blLineId,
          }),
        };
      },
    },
    events: {
      query: ({ dataSet }) => {
        if (!dataSet.getState('initFlag')) {
          setTimeout(() => {
            dataSet.setState('initFlag', true);
          }, 200);
        }
      },
      async load({ dataSet }) {
        if (['submitted'].includes(tab)) {
          const workFlowBussinessKeys = dataSet.reduce((acc, cur) => {
            const value = cur.get('workflowBusinessKey');
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
            // console.log(simpleApprovalHistoryData);
            // // 获取审批按钮显示状态
            const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
            // 获取撤销审批按钮状态
            const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
            dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
          }
        }
      },
    },
  };
};

const pendingDs = ({ cuxParams = {} }) => {
  return {
    cacheSelection: true,
    paging: 'server',
    autoQuery: false,
    primaryKey: 'vtLineId',
    idField: 'vtLineId',
    parentField: 'parentVtLineId',
    pageSize: 20,
    // checkField: tab === 'pending' ? 'isChecked' : null,
    fields: [
      {
        label: intl.get(`${commonPrompt}.sourceDocument`).d('来源单据'),
        name: 'rpNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.lineNum`).d('来源单行号'),
        name: 'lineNum',
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.rpNumAndlineNum`).d('单号-行号'),
        name: 'rpNumAndlineNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.splitLine`).d('是否拆分行'),
        name: 'splitFlagMeaning',
      },
      {
        label: intl.get(`${commonPrompt}.sourceSplitNumAndLineNum`).d('来源拆分行'),
        name: 'splitVtNumAndLineNum',
      },
      {
        label: intl.get(`${commonPrompt}.purchaseRequisitionNum`).d('采购申请单号'),
        name: 'prNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.blNum`).d('需求计划单号'),
        name: 'blNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.containerCode`).d('需求计划编码'),
        name: 'containerCode',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.containerName`).d('需求计划'),
        name: 'containerName',
        type: 'string',
      },
      {
        name: 'invOrganizationId',
        type: 'string',
      },
      {
        name: 'invOrganizationName',
        label: intl.get(`${commonPrompt}.inventory`).d('库存组织'),
        type: 'string',
      },
      {
        name: 'itemCode',
        label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
        type: 'string',
      },
      {
        name: 'itemName',
        label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
        type: 'string',
      },
      {
        name: 'uomId',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        lovCode: 'SMDM.DUAL_UOM_ID',
        type: 'object',
        textField: 'uomName',
        ignore: 'always',
        valueField: 'uomId',
        transformResponse(value, data) {
          if (value) {
            return {
              uomId: value,
              uomCode: data.uomCode,
              uomName: data.uomName,
              uomPrecision: data.uomPrecision,
              uomCodeAndName: data.uomCodeAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.uomId,
      },
      {
        name: 'uomPrecision',
        type: 'number',
        bind: 'uomId.uomPrecision',
      },
      // {
      //   name: 'uomId',
      //   bind: 'uomLov.uomId',
      // },
      {
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        name: 'uomCode',
        bind: 'uomLov.uomCode',
      },
      {
        name: 'uomName',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        bind: 'uomLov.uomName',
      },
      {
        label: intl.get(`${commonPrompt}.quantity`).d('需求计划数量'),
        name: 'quantity',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.mergeQuantity`).d('平衡数量'),
        name: 'mergeQuantity',
        type: 'number',
        min: 0,
        validator: (value) => {
          if (value > 0) {
            return true;
          } else {
            return intl.get(`srpm.common.message.mustExceedZero`).d('数量必须大于0');
          }
        },
        transformRequest: (value, record = {}) =>
          value || value === 0 ? value : record?.get('remainQuantity') || null,
        dynamicProps: {
          required() {
            return true;
          },
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.remainQuantity`).d('剩余平衡数量'),
        name: 'remainQuantity',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        name: 'neededDate',
        type: 'date',
        min: moment('1970-01-01'),
      },
      {
        name: 'taxRate',
        label: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        type: 'number',
      },
      {
        name: 'currencyCode',
        label: intl.get(`${commonPrompt}.currencyCode`).d('行币种'),
        type: 'string',
      },
      {
        name: 'taxIncludedUnitPrice',
        label: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('单价(含税)'),
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('defaultPrecision') ?? null;
          },
        },
      },
      {
        name: 'taxIncludedLineAmount',
        label: intl.get(`${commonPrompt}.taxIncludedLineAmount`).d('行金额(含税)'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record && (record.get('financialPrecision') ?? undefined)
          ),
        },
      },
      {
        name: 'unitPrice',
        label: intl.get(`${commonPrompt}.unitPrice`).d('单价(不含税)'),
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('defaultPrecision') ?? null;
          },
        },
      },
      {
        name: 'lineAmount',
        label: intl.get(`${commonPrompt}.lineAmount`).d('行金额(不含税)'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => record && (record.get('financialPrecision') ?? undefined)
          ),
        },
      },
      {
        name: 'unitName',
        label: intl.get(`${commonPrompt}.unitName`).d('部门'),
        type: 'string',
      },
      {
        name: 'rpStatusMeaning',
        label: intl.get(`${commonPrompt}.rpStatusMeaning`).d('状态'),
        type: 'string',
      },
      {
        name: 'rpSourcePlatformMeaning',
        label: intl.get(`${commonPrompt}.rpSourcePlatform`).d('单据来源'),
        type: 'string',
      },
      {
        name: 'version',
        label: intl.get(`${commonPrompt}.version`).d('版本'),
        type: 'string',
      },
      {
        name: 'operatorRecord',
        label: intl.get(`${commonPrompt}.action`).d('操作'),
      },
      {
        name: 'createdByName',
        label: intl.get(`entity.roles.creator`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.creationDate`).d('创建日期'),
      },
      {
        name: 'originalCurrency',
        label: intl.get(`${commonPrompt}.originalCurrency`).d('原币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        type: 'object',
        valueField: 'currencyCode',
        transformResponse(value, data) {
          if (value) {
            return {
              currencyCode: value,
              financialPrecision: data.financialPrecision,
              defaultPrecision: data.defaultPrecision,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'financialPrecision',
        bind: 'originalCurrency.financialPrecision',
      },
      {
        name: 'defaultPrecision',
        bind: 'originalCurrency.defaultPrecision',
      },
      {
        name: 'localCurrency',
        label: intl.get(`${commonPrompt}.localCurrency`).d('本币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              currencyCode: value,
              financialPrecision: data.localFinancialPrecision,
              defaultPrecision: data.localDefaultPrecision,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'localFinancialPrecision',
        bind: 'localCurrency.financialPrecision',
      },
      {
        name: 'localDefaultPrecision',
        bind: 'localCurrency.defaultPrecision',
      },
      {
        name: 'originalCurrencyNoTaxSum',
        label: intl.get(`${commonPrompt}.originalCurrencyNoTaxSum`).d('原币总金额(不含税)'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) =>
              record &&
              (record.get('rpSourcePlatform') === 'REQUEST_PLAN'
                ? record.get('financialPrecision')
                : undefined)
          ),
        },
      },
      {
        name: 'originalCurrencyTaxSum',
        label: intl.get(`${commonPrompt}.originalCurrencyTaxSum`).d('原币总金额(含税)'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) =>
              record &&
              (record.get('rpSourcePlatform') === 'REQUEST_PLAN'
                ? record.get('financialPrecision')
                : undefined)
          ),
        },
      },
      {
        name: 'localCurrencyNoTaxSum',
        label: intl.get(`${commonPrompt}.totalLocalCurrencyNoTaxSum`).d('本币总金额(不含税)'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) =>
              record &&
              (record.get('rpSourcePlatform') === 'REQUEST_PLAN'
                ? record.get('localFinancialPrecision')
                : undefined)
          ),
        },
      },
      {
        name: 'localCurrencyTaxSum',
        label: intl.get(`${commonPrompt}.totalLocalCurrencyTaxSum`).d('本币总金额(含税)'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) =>
              record &&
              (record.get('rpSourcePlatform') === 'REQUEST_PLAN'
                ? record.get('localFinancialPrecision')
                : undefined)
          ),
        },
      },
      {
        name: 'requestedBy',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
        lovCode: 'SPCM.ACCEPT_USER',
        lovPara: { tenantId: organizationId },
        textField: 'userName',
        // valueField: 'userId',
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              userId: value,
              loginName: data.prRequestedNum,
              userName: data.requestedByName,
              prRequestedNumAndName: data.prRequestedNumAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.userId,
      },
      {
        name: 'prRequestedNum',
        bind: 'requestedBy.loginName',
      },
      {
        name: 'requestedByName',
        bind: 'requestedBy.userName',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
      },
      {
        name: 'requestDate',
        label: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
        type: 'date',
        min: moment('1970-01-01'),
      },
      {
        name: 'remark',
        label: intl.get(`${commonPrompt}.remark`).d('备注'),
        type: 'string',
      },
      {
        name: 'rejectedReason',
        label: intl.get(`${commonPrompt}.rejectedReason`).d('拒绝原因'),
        type: 'string',
      },
    ],

    transport: {
      read: (values) => {
        const { data, params = {} } = values;
        const { advancedData, ...otherData } = data;
        const newParams = {
          ...params,
          ...otherData,
          ...advancedData,
        };
        if (!newParams?.containerId) {
          return null;
        }
        const customizeUnitCode =
          'SRPM.RP_EXECUTE_PLATFORM.PENDING.LIST,SRPM.RP_EXECUTE_PLATFORM.PENDING.LIST.SEARCH_BAR';
        const url = `${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/pending-list`;
        return {
          url,
          method: 'GET',
          data: filterNullValueObject({
            ...data,
            ...newParams,
            ...cuxParams,
            advancedData: undefined,
            customizeUnitCode,
          }),
        };
      },
    },
    events: {
      query: ({ dataSet }) => {
        if (!dataSet.getState('initFlag')) {
          setTimeout(() => {
            dataSet.setState('initFlag', true);
          }, 200);
        }
      },
    },
  };
};

const balanceDs = (getVtLineIds, vtLineIds) => {
  return {
    cacheSelection: true,
    pageSize: 20,
    paging: 'server',
    autoQuery: false,
    primaryKey: 'vtLineId',
    idField: 'vtLineId',
    parentField: 'parentVtLineId',
    // checkField: tab === 'pending' ? 'isChecked' : null,
    fields: [
      {
        label: intl.get(`${commonPrompt}.sourceDocument`).d('来源单据'),
        name: 'rpNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.rpNumAndlineNum`).d('单号-行号'),
        name: 'rpNumAndlineNum',
        type: 'string',
      },
      {
        name: 'rpTypeId',
        label: intl.get(`${commonPrompt}.rpType`).d('需求计划类型'),
        lovCode: 'SRPM_RP_TYPE',
        textField: 'rpTypeName',
        valueField: 'rpTypeId',
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              rpTypeId: value,
              rpTypeName: data.rpTypeName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value && value.rpTypeId,
      },
      {
        name: 'rpTypeName',
        bind: 'rpTypeId.rpTypeName',
      },
      {
        name: 'currencyCode',
        // label: intl.get(`${commonPrompt}.currencyCode`).d('行币种'),
        type: 'string',
      },
      {
        name: 'originalCurrency',
        label: intl.get(`${commonPrompt}.originalCurrency`).d('原币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        required: true,
        type: 'object',
        valueField: 'currencyCode',
        transformResponse(value, data) {
          if (value) {
            return {
              currencyCode: value,
              financialPrecision: data.financialPrecision,
              defaultPrecision: data.defaultPrecision,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'financialPrecision',
        bind: 'originalCurrency.financialPrecision',
      },
      {
        name: 'defaultPrecision',
        bind: 'originalCurrency.defaultPrecision',
      },
      {
        name: 'localCurrency',
        label: intl.get(`${commonPrompt}.localCurrency`).d('本币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              currencyCode: value,
              financialPrecision: data.localFinancialPrecision,
              defaultPrecision: data.localDefaultPrecision,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'localFinancialPrecision',
        bind: 'localCurrency.financialPrecision',
      },
      {
        name: 'localDefaultPrecision',
        bind: 'localCurrency.defaultPrecision',
      },
      {
        name: 'requestedBy',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
        lovCode: 'SPCM.ACCEPT_USER',
        lovPara: { tenantId: organizationId },
        textField: 'userName',
        // valueField: 'userId',
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              userId: value,
              loginName: data.prRequestedNum,
              userName: data.requestedByName,
              prRequestedNumAndName: data.prRequestedNumAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.userId,
      },
      {
        name: 'prRequestedNum',
        bind: 'requestedBy.loginName',
      },
      {
        name: 'requestedByName',
        bind: 'requestedBy.userName',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
      },
      {
        name: 'prRequestedNumAndName',
        bind: 'requestedBy.prRequestedNumAndName',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
      },
      {
        name: 'requestDate',
        // required: true,
        label: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
        type: 'date',
        min: moment('1970-01-01'),
      },

      {
        name: 'companyId',
        label: intl.get(`entity.company.tag`).d('公司'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        textField: 'companyName',
        valueField: 'companyId',
        type: 'object',
        required: true,
        lovPara: { tenantId: organizationId, enabledFlag: 1 },
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
        bind: 'companyId.companyName',
        label: intl.get(`entity.company.tag`).d('公司'),
      },
      {
        name: 'ouId',
        label: intl.get(`entity.business.tag`).d('业务实体'),
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        type: 'object',
        required: true,
        dynamicProps: {
          lovPara({ record }) {
            return {
              companyId: record.get('companyId')?.companyId,
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              ouId: value,
              ouName: data.ouName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.ouId,
      },
      {
        name: 'ouName',
        bind: 'ouId.ouName',
        label: intl.get(`entity.business.tag`).d('业务实体'),
      },
      {
        name: 'purchaseOrgId',
        required: true,
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        lovCode: 'HPFM.PURCHASE_ORGANIZATION',
        textField: 'organizationName',
        type: 'object',
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record.get('ouId')?.ouId,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              purchaseOrgId: value,
              purchaseOrgName: data.purchaseOrgName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.purchaseOrgId,
      },
      {
        name: 'purchaseOrgName',
        bind: 'purchaseOrgId.organizationName',
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      },
      {
        name: 'unitId',
        type: 'object',
        lovCode: 'SPRM.USER_UNIT',
        label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
        textField: 'unitName',
        valueField: 'unitId',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              tenantId: organizationId,
              companyId: record.get('companyId')?.companyId,
            };
          },
        },
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
        transformRequest: (value) => value?.unitId,
      },
      {
        name: 'unitName',
        bind: 'unitId.unitName',
        label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
      },
      {
        name: 'purchaseAgentId',
        required: true,
        label: intl.get(`${commonPrompt}.purchaseAgentName`).d('计划负责人'),
        lovCode: 'SRPM.PURCHASE_AGENT',
        textField: 'purchaseAgentName',
        valueField: 'purchaseAgentId',
        type: 'object',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              purchaseOrgIds: record.get('purchaseOrgId')?.purchaseOrgId,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              purchaseAgentId: value,
              purchaseAgentName: data.purchaseAgentName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.purchaseAgentId,
      },
      {
        name: 'purchaseAgentName',
        bind: 'purchaseAgentId.purchaseAgentName',
        label: intl.get(`${commonPrompt}.purchaseAgentName`).d('计划负责人'),
      },
      {
        name: 'invOrganizationId',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record.get('ouId')?.ouId,
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
          required({ record }) {
            return !(record.get('rpSourcePlatform') && record.get('rpStatusCode') === 'reject');
          },
        },
        required: true,
        valueField: 'organizationId',
        textField: 'organizationName',
        label: intl.get(`${commonPrompt}.inventory`).d('库存组织'),
        transformResponse(value, data) {
          if (value) {
            return {
              organizationId: value,
              organizationName: data.invOrganizationName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.organizationId,
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationId.organizationName',
      },

      {
        name: 'itemCode',
        label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
        textField: 'itemCode',
        valueField: 'itemId',
        dynamicProps: {
          lovPara({ record, dataSet }) {
            const params = {
              enabledFlag: 1,
              tenantId: organizationId,
              companyId: record.get('companyId')?.companyId,
              headerCategoryId: record.get('categoryId')?.categoryId,
              lineCategoryId: record.get('categoryId')?.categoryId,
              prTypeId: record.get('prTypeId')?.prTypeId,
            };
            const { itemLimitRule = [] } = dataSet.queryParameter;
            // 物料分类
            if (itemLimitRule.find((rule) => rule === 'categoryId')) {
              params.categoryId = record.get('categoryId');
            }
            // 库存组织
            if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
              params.invOrganizationId = record.get('invOrganizationId');
            }
            return params;
          },
        },
        transformRequest: (value) => value?.itemCode,
        transformResponse(value, data) {
          if (value) {
            return {
              ...data,
              itemId: data?.itemId,
              itemCode: data?.itemCode,
            };
          } else {
            return null;
          }
        },
      },
      {
        name: 'itemId',
        bind: 'itemCode.itemId',
      },
      {
        name: 'itemName',
        required: true,
        label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
        type: 'string',
        maxLength: 360,
      },
      {
        label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        name: 'categoryId',
        type: 'object',
        lovCode: 'SPRM.ITEM_CATEGOR_TILED',
        // lovCode: 'SPRM.ITEM_CATEGOR',
        // textField: 'itemCode',
        // valueField: 'itemId',
        optionsProps: {
          paging: 'server',
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              purchaseOrgId: record.get('purchaseOrgId')?.purchaseOrgId,
              queryCategoryId: record.get('purchaseOrgId')?.purchaseOrgId,
              itemId: record.get('itemId'),
            };
          },
        },
        lovDefineAxiosConfig: (code) => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  treeFlag: 'Y',
                  idField: 'categoryId',
                  parentIdField: 'parentCategoryId',
                };
              },
            ],
          };
        },
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
        transformRequest: (value) => value?.categoryId,
      },
      {
        name: 'categoryName',
        bind: 'categoryId.categoryName',
        label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
      },
      {
        label: intl.get(`${commonPrompt}.itemModel`).d('型号'),
        name: 'itemModel',
      },
      {
        label: intl.get(`${commonPrompt}.itemSpecs`).d('规格'),
        name: 'itemSpecs',
      },
      {
        name: 'uomId',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        lovCode: 'SMDM.DUAL_UOM_ID',
        type: 'object',
        textField: 'uomName',
        ignore: 'always',
        valueField: 'uomId',
        required: true,
        transformResponse(value, data) {
          if (value) {
            return {
              uomId: value,
              uomCode: data.uomCode,
              uomName: data.uomName,
              uomPrecision: data.uomPrecision,
              uomCodeAndName: data.uomCodeAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.uomId,
      },
      {
        name: 'uomPrecision',
        type: 'number',
        bind: 'uomId.uomPrecision',
      },
      {
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        name: 'uomCode',
        bind: 'uomLov.uomCode',
      },
      {
        name: 'uomName',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        bind: 'uomLov.uomName',
      },
      {
        label: intl.get(`${commonPrompt}.quantity`).d('需求计划数量'),
        name: 'quantity',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.mergeQuantity`).d('平衡数量'),
        name: 'mergeQuantity',
        type: 'number',
        min: 0,
        validator: (value) => {
          if (value > 0) {
            return true;
          } else {
            return intl.get(`srpm.common.message.mustExceedZero`).d('数量必须大于0');
          }
        },
        required: true,
        transformRequest: (value, record = {}) =>
          value || value === 0 ? value : record?.get('remainQuantity') || null,
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.remainQuantity`).d('剩余平衡数量'),
        name: 'remainQuantity',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        name: 'neededDate',
        type: 'date',
        min: moment('1970-01-01'),
        required: true,
      },
      {
        name: 'taxId',
        type: 'object',
        lovCode: 'SPRM.TAX',
        textField: 'taxCode',
        label: intl.get(`${commonPrompt}.taxType`).d('税种'),
        transformResponse(value, data) {
          if (value) {
            return {
              taxId: value,
              taxRate: data.taxRate,
              taxCode: data.taxCode,
              includedTaxFlag: data.includedTaxFlag,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.taxId,
      },
      {
        name: 'taxCode',
        bind: 'taxId.taxCode',
      },
      {
        name: 'includedTaxFlag',
        bind: 'taxId.includedTaxFlag',
      },
      {
        name: 'taxRate',
        label: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        name: 'taxIncludedUnitPrice',
        type: 'number',
        // numberGrouping: true,
        dynamicProps: {
          precision: ({ record }) =>
            record.get('rpSourcePlatform') === 'REQUEST_PLAN'
              ? record.get('defaultPrecision')
              : undefined,
        },
      },
      {
        name: 'remark',
        label: intl.get(`${commonPrompt}.remark`).d('备注'),
      },
      // {
      //   label: intl.get(`${commonPrompt}.attachment.tag`).d('附件'),
      //   type: 'attachment',
      //   viewMode: 'popup',
      //   name: 'attachmentUuid',
      //   bucketName: PRIVATE_BUCKET,
      // },
    ],
    events: {
      update: ({ name, record, value }) => {
        if (name === 'originalCurrency') {
          record.set({
            currencyCode: value?.currencyCode,
          });
        }
        if (name === 'taxId') {
          if (value) {
            const { taxCode, taxRate, includedTaxFlag } = value;
            record.set({
              taxCode,
              taxRate,
              includedTaxFlag,
            });
          } else {
            record.set({
              taxCode: null,
              taxRate: null,
              includedTaxFlag: null,
            });
          }
        }
        if (name === 'itemCode') {
          const {
            partnerItemId,
            itemName,
            itemId,
            uomCode,
            uomId,
            uomName,
            model,
            specifications,
            taxId,
            taxCode,
            taxRate,
            uomPrecision,
          } = value || {};
          record.set({
            itemName,
            itemModel: model,
            itemSpecs: specifications,
            taxId: {
              taxId,
              taxCode,
              taxRate,
            },
            uomId: {
              uomCode,
              uomId,
              uomName,
              uomPrecision,
              // uomCodeAndName: `${uomCode}/${uomName}`,
              // uomCodeAndName: uomCodeAndNameRule ? `${uomCode}/${uomName}` : uomName,
            },
            categoryId: null,
          });

          if (itemId) {
            fetchCategory({ itemId: partnerItemId || itemId, enabledFlag: 1, defaultFlag: 1 }).then(
              (res) => {
                if (res && res.length === 1) {
                  const [{ categoryId, categoryCode, categoryName }] = res;
                  record.set({
                    categoryId: { categoryId, categoryCode, categoryName },
                  });
                }
              }
            );
          }
        }
      },
      load: ({ dataSet }) => {
        if (!dataSet.getState('initFlag')) {
          dataSet.setState('initFlag', true);
        }
      },
    },
    transport: {
      read: ({ data = {} }) => {
        const newParams = {
          ...data,
          vtLineIdList: getVtLineIds() || vtLineIds.join(','),
        };
        return {
          url: `${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/balance-list`,
          data: {
            customizeUnitCode:
              'SRPM.RP_EXECUTE_PLATFORM.BALANCE_MODAL.LIST,SRPM.RP_EXECUTE_PLATFORM.BALANCE_MODAL.LIST.SEARCH_BAR',
            ...newParams,
          },
          method: 'GET',
        };
      },
    },
  };
};

const vtBalanceSplitDs = () => {
  return {
    // cacheSelection: true,
    paging: false,
    autoQuery: false,
    primaryKey: 'vtLineId',
    idField: 'vtLineId',
    parentField: 'parentVtLineId',
    forceValidate: true,
    // checkField: tab === 'pending' ? 'isChecked' : null,
    fields: [
      {
        label: intl.get(`${commonPrompt}.sourceDocument`).d('来源单据'),
        name: 'rpNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.rpNumAndlineNum`).d('单号-行号'),
        name: 'rpNumAndlineNum',
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.splitLine`).d('是否拆分行'),
        name: 'splitFlagMeaning',
      },
      {
        label: intl.get(`${commonPrompt}.sourceSplitNumAndLineNum`).d('来源拆分行'),
        name: 'splitVtNumAndLineNum',
      },
      {
        name: 'rpTypeId',
        label: intl.get(`${commonPrompt}.rpType`).d('需求计划类型'),
        lovCode: 'SRPM_RP_TYPE',
        textField: 'rpTypeName',
        valueField: 'rpTypeId',
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              rpTypeId: value,
              rpTypeName: data.rpTypeName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value && value.rpTypeId,
      },
      {
        name: 'rpTypeName',
        bind: 'rpTypeId.rpTypeName',
      },
      {
        name: 'currencyCode',
        // label: intl.get(`${commonPrompt}.currencyCode`).d('行币种'),
        type: 'string',
      },
      {
        name: 'originalCurrency',
        label: intl.get(`${commonPrompt}.originalCurrency`).d('原币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        required: true,
        type: 'object',
        valueField: 'currencyCode',
        transformResponse(value, data) {
          if (value) {
            return {
              currencyCode: value,
              financialPrecision: data.financialPrecision,
              defaultPrecision: data.defaultPrecision,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'financialPrecision',
        bind: 'originalCurrency.financialPrecision',
      },
      {
        name: 'defaultPrecision',
        bind: 'originalCurrency.defaultPrecision',
      },
      {
        name: 'localCurrency',
        label: intl.get(`${commonPrompt}.localCurrency`).d('本币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              currencyCode: value,
              financialPrecision: data.localFinancialPrecision,
              defaultPrecision: data.localDefaultPrecision,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'localFinancialPrecision',
        bind: 'localCurrency.financialPrecision',
      },
      {
        name: 'localDefaultPrecision',
        bind: 'localCurrency.defaultPrecision',
      },
      {
        name: 'requestedBy',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
        lovCode: 'SPCM.ACCEPT_USER',
        lovPara: { tenantId: organizationId },
        textField: 'userName',
        // valueField: 'userId',
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              userId: value,
              loginName: data.prRequestedNum,
              userName: data.requestedByName,
              prRequestedNumAndName: data.prRequestedNumAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.userId,
      },
      {
        name: 'prRequestedNum',
        bind: 'requestedBy.loginName',
      },
      {
        name: 'requestedByName',
        bind: 'requestedBy.userName',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
      },
      {
        name: 'prRequestedNumAndName',
        bind: 'requestedBy.prRequestedNumAndName',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
      },
      {
        name: 'requestDate',
        // required: true,
        label: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
        type: 'date',
        min: moment('1970-01-01'),
      },

      {
        name: 'companyId',
        label: intl.get(`entity.company.tag`).d('公司'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        textField: 'companyName',
        valueField: 'companyId',
        type: 'object',
        required: true,
        lovPara: { tenantId: organizationId, enabledFlag: 1 },
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
        bind: 'companyId.companyName',
        label: intl.get(`entity.company.tag`).d('公司'),
      },
      {
        name: 'ouId',
        label: intl.get(`entity.business.tag`).d('业务实体'),
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        type: 'object',
        required: true,
        dynamicProps: {
          lovPara({ record }) {
            return {
              companyId: record.get('companyId')?.companyId,
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              ouId: value,
              ouName: data.ouName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.ouId,
      },
      {
        name: 'ouName',
        bind: 'ouId.ouName',
        label: intl.get(`entity.business.tag`).d('业务实体'),
      },
      {
        name: 'purchaseOrgId',
        required: true,
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        lovCode: 'HPFM.PURCHASE_ORGANIZATION',
        textField: 'organizationName',
        type: 'object',
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record.get('ouId')?.ouId,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              purchaseOrgId: value,
              purchaseOrgName: data.purchaseOrgName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.purchaseOrgId,
      },
      {
        name: 'purchaseOrgName',
        bind: 'purchaseOrgId.organizationName',
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      },
      {
        name: 'unitId',
        type: 'object',
        lovCode: 'SPRM.USER_UNIT',
        label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
        textField: 'unitName',
        valueField: 'unitId',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              tenantId: organizationId,
              companyId: record.get('companyId')?.companyId,
            };
          },
        },
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
        transformRequest: (value) => value?.unitId,
      },
      {
        name: 'unitName',
        bind: 'unitId.unitName',
        label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
      },
      {
        name: 'purchaseAgentId',
        required: true,
        label: intl.get(`${commonPrompt}.purchaseAgentName`).d('计划负责人'),
        lovCode: 'SRPM.PURCHASE_AGENT',
        textField: 'purchaseAgentName',
        valueField: 'purchaseAgentId',
        type: 'object',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              purchaseOrgIds: record.get('purchaseOrgId')?.purchaseOrgId,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              purchaseAgentId: value,
              purchaseAgentName: data.purchaseAgentName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.purchaseAgentId,
      },
      {
        name: 'purchaseAgentName',
        bind: 'purchaseAgentId.purchaseAgentName',
        label: intl.get(`${commonPrompt}.purchaseAgentName`).d('计划负责人'),
      },
      {
        name: 'invOrganizationId',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record.get('ouId')?.ouId,
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
          required({ record }) {
            return !(record.get('rpSourcePlatform') && record.get('rpStatusCode') === 'reject');
          },
        },
        required: true,
        valueField: 'organizationId',
        textField: 'organizationName',
        label: intl.get(`${commonPrompt}.inventory`).d('库存组织'),
        transformResponse(value, data) {
          if (value) {
            return {
              organizationId: value,
              organizationName: data.invOrganizationName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.organizationId,
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationId.organizationName',
      },

      {
        name: 'itemCode',
        label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
        textField: 'itemCode',
        valueField: 'itemId',
        dynamicProps: {
          lovPara({ record, dataSet }) {
            const params = {
              enabledFlag: 1,
              tenantId: organizationId,
              companyId: record.get('companyId')?.companyId,
              headerCategoryId: record.get('categoryId')?.categoryId,
              lineCategoryId: record.get('categoryId')?.categoryId,
              prTypeId: record.get('prTypeId')?.prTypeId,
            };
            const { itemLimitRule = [] } = dataSet.queryParameter;
            // 物料分类
            if (itemLimitRule.find((rule) => rule === 'categoryId')) {
              params.categoryId = record.get('categoryId');
            }
            // 库存组织
            if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
              params.invOrganizationId = record.get('invOrganizationId');
            }
            return params;
          },
        },
        transformRequest: (value) => value?.itemCode,
      },
      {
        name: 'itemId',
        bind: 'itemCode.itemId',
      },
      {
        name: 'itemName',
        required: true,
        label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
        type: 'string',
        maxLength: 360,
      },
      {
        label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        name: 'categoryId',
        type: 'object',
        lovCode: 'SPRM.ITEM_CATEGOR_TILED',
        // lovCode: 'SPRM.ITEM_CATEGOR',
        // textField: 'itemCode',
        // valueField: 'itemId',
        optionsProps: {
          paging: 'server',
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              purchaseOrgId: record.get('purchaseOrgId')?.purchaseOrgId,
              queryCategoryId: record.get('purchaseOrgId')?.purchaseOrgId,
              itemId: record.get('itemId'),
            };
          },
        },
        lovDefineAxiosConfig: (code) => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  treeFlag: 'Y',
                  idField: 'categoryId',
                  parentIdField: 'parentCategoryId',
                };
              },
            ],
          };
        },
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
        transformRequest: (value) => value?.categoryId,
      },
      {
        name: 'categoryName',
        bind: 'categoryId.categoryName',
        label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
      },
      {
        label: intl.get(`${commonPrompt}.itemModel`).d('型号'),
        name: 'itemModel',
      },
      {
        label: intl.get(`${commonPrompt}.itemSpecs`).d('规格'),
        name: 'itemSpecs',
      },
      {
        name: 'uomId',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        lovCode: 'SMDM.DUAL_UOM_ID',
        type: 'object',
        textField: 'uomName',
        ignore: 'always',
        valueField: 'uomId',
        required: true,
        transformResponse(value, data) {
          if (value) {
            return {
              uomId: value,
              uomCode: data.uomCode,
              uomName: data.uomName,
              uomPrecision: data.uomPrecision,
              uomCodeAndName: data.uomCodeAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.uomId,
      },
      {
        name: 'uomPrecision',
        type: 'number',
        bind: 'uomId.uomPrecision',
      },
      {
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        name: 'uomCode',
        bind: 'uomLov.uomCode',
      },
      {
        name: 'uomName',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        bind: 'uomLov.uomName',
      },
      {
        label: intl.get(`${commonPrompt}.quantity`).d('需求计划数量'),
        name: 'quantity',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.mergeQuantity`).d('平衡数量'),
        name: 'mergeQuantity',
        type: 'number',
        min: 0,
        validator: (value) => {
          if (value > 0) {
            return true;
          } else {
            return intl.get(`srpm.common.message.mustExceedZero`).d('数量必须大于0');
          }
        },
        required: true,
        transformRequest: (value, record = {}) =>
          value || value === 0 ? value : record?.get('remainQuantity') || null,
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.remainQuantity`).d('剩余平衡数量'),
        name: 'remainQuantity',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      {
        label: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        name: 'neededDate',
        type: 'date',
        min: moment('1970-01-01'),
        required: true,
      },
      {
        name: 'taxId',
        type: 'object',
        lovCode: 'SPRM.TAX',
        textField: 'taxCode',
        label: intl.get(`${commonPrompt}.taxType`).d('税种'),
        transformResponse(value, data) {
          if (value) {
            return {
              taxId: value,
              taxRate: data.taxRate,
              taxCode: data.taxCode,
              includedTaxFlag: data.includedTaxFlag,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.taxId,
      },
      {
        name: 'taxCode',
        bind: 'taxId.taxCode',
      },
      {
        name: 'includedTaxFlag',
        bind: 'taxId.includedTaxFlag',
      },
      {
        name: 'taxRate',
        label: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        name: 'taxIncludedUnitPrice',
        type: 'number',
        // numberGrouping: true,
        dynamicProps: {
          precision: ({ record }) =>
            record.get('rpSourcePlatform') === 'REQUEST_PLAN'
              ? record.get('defaultPrecision')
              : undefined,
        },
      },
      {
        name: 'remark',
        label: intl.get(`${commonPrompt}.remark`).d('备注'),
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get(`hzero.common.button.action`).d('操作'),
      },
      {
        name: 'totalSplitQuantity',
        type: 'number',
        label: intl.get(`${commonPrompt}.splitQuantity`).d('已拆分数量'),
      },
      {
        name: 'blNumAndLineNum',
        label: intl.get(`${commonPrompt}.blNumAndLineNum`).d('需求计划单号-行号'),
      },
      // {
      //   label: intl.get(`${commonPrompt}.attachment.tag`).d('附件'),
      //   type: 'attachment',
      //   viewMode: 'popup',
      //   name: 'attachmentUuid',
      //   bucketName: PRIVATE_BUCKET,
      // },
    ],
    events: {
      update: ({ name, record, value }) => {
        if (name === 'originalCurrency') {
          record.set({
            currencyCode: value?.currencyCode,
          });
        }
        if (name === 'taxId') {
          if (value) {
            const { taxCode, taxRate, includedTaxFlag } = value;
            record.set({
              taxCode,
              taxRate,
              includedTaxFlag,
            });
          } else {
            record.set({
              taxCode: null,
              taxRate: null,
              includedTaxFlag: null,
            });
          }
        }
        if (name === 'itemCode') {
          const {
            partnerItemId,
            itemName,
            itemId,
            uomCode,
            uomId,
            uomName,
            model,
            specifications,
            taxId,
            taxCode,
            taxRate,
            uomPrecision,
          } = value || {};
          record.set({
            itemName,
            itemModel: model,
            itemSpecs: specifications,
            taxId: {
              taxId,
              taxCode,
              taxRate,
            },
            uomId: {
              uomCode,
              uomId,
              uomName,
              uomPrecision,
              // uomCodeAndName: `${uomCode}/${uomName}`,
              // uomCodeAndName: uomCodeAndNameRule ? `${uomCode}/${uomName}` : uomName,
            },
            categoryId: null,
          });

          if (itemId) {
            fetchCategory({ itemId: partnerItemId || itemId, enabledFlag: 1, defaultFlag: 1 }).then(
              (res) => {
                if (res && res.length === 1) {
                  const [{ categoryId, categoryCode, categoryName }] = res;
                  record.set({
                    categoryId: { categoryId, categoryCode, categoryName },
                  });
                }
              }
            );
          }
        }
      },
      load: ({ dataSet }) => {
        if (!dataSet.getState('initFlag')) {
          dataSet.setState('initFlag', true);
        }
      },
    },
    transport: {
      read: ({ data = {} }) => {
        return {
          url: `${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/split-list`,
          data: {
            customizeUnitCode:
              'SRPM.RP_EXECUTE_PLATFORM.SPLIT_LIST,SRPM.RP_EXECUTE_PLATFORM.SPLIT_LIST_SEARCH',
            ...data,
          },
          method: 'GET',
        };
      },
    },
    record: {
      dynamicProps: {
        selectable: (record) => record.get('submittedFlag') !== 1,
      },
    },
  };
};

const blBalanceSplitDs = () => {
  return {
    // cacheSelection: true,
    paging: false,
    autoQuery: false,
    forceValidate: true,
    // checkField: tab === 'pending' ? 'isChecked' : null,
    fields: [
      {
        label: intl.get(`${commonPrompt}.sourceDocument`).d('来源单据'),
        name: 'rpNum',
        type: 'string',
      },
      {
        name: 'blNumAndlineNum',
        label: intl.get(`${commonPrompt}.blNumAndLineNum`).d('需求计划单号-行号'),
      },
      {
        label: intl.get(`${commonPrompt}.splitLine`).d('是否拆分行'),
        name: 'splitFlagMeaning',
      },
      {
        label: intl.get(`${commonPrompt}.sourceSplitNumAndLineNum`).d('来源拆分行'),
        name: 'splitBlNumAndLineNum',
      },
      {
        name: 'rpTypeId',
        label: intl.get(`${commonPrompt}.rpType`).d('需求计划类型'),
        lovCode: 'SRPM_RP_TYPE',
        textField: 'rpTypeName',
        valueField: 'rpTypeId',
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              rpTypeId: value,
              rpTypeName: data.rpTypeName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value && value.rpTypeId,
      },
      {
        name: 'rpTypeName',
        bind: 'rpTypeId.rpTypeName',
      },
      {
        name: 'currencyCode',
        // label: intl.get(`${commonPrompt}.currencyCode`).d('行币种'),
        type: 'string',
      },
      {
        name: 'currencyCode',
        label: intl.get(`${commonPrompt}.originalCurrency`).d('原币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        required: true,
        type: 'object',
        valueField: 'currencyCode',
        transformResponse(value, data) {
          if (value) {
            return {
              currencyCode: value,
              financialPrecision: data.financialPrecision,
              defaultPrecision: data.defaultPrecision,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'financialPrecision',
        bind: 'currencyCode.financialPrecision',
      },
      {
        name: 'defaultPrecision',
        bind: 'currencyCode.defaultPrecision',
      },
      {
        name: 'localCurrency',
        label: intl.get(`${commonPrompt}.localCurrency`).d('本币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              currencyCode: value,
              financialPrecision: data.localFinancialPrecision,
              defaultPrecision: data.localDefaultPrecision,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'localFinancialPrecision',
        bind: 'localCurrency.financialPrecision',
      },
      {
        name: 'localDefaultPrecision',
        bind: 'localCurrency.defaultPrecision',
      },
      {
        name: 'requestedBy',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
        lovCode: 'SPCM.ACCEPT_USER',
        lovPara: { tenantId: organizationId },
        textField: 'userName',
        // valueField: 'userId',
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              userId: value,
              loginName: data.prRequestedNum,
              userName: data.requestedByName,
              prRequestedNumAndName: data.prRequestedNumAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.userId,
      },
      {
        name: 'prRequestedNum',
        bind: 'requestedBy.loginName',
      },
      {
        name: 'requestedByName',
        bind: 'requestedBy.userName',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
      },
      {
        name: 'prRequestedNumAndName',
        bind: 'requestedBy.prRequestedNumAndName',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
      },
      {
        name: 'requestDate',
        // required: true,
        label: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
        type: 'date',
        min: moment('1970-01-01'),
      },

      {
        name: 'companyId',
        label: intl.get(`entity.company.tag`).d('公司'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        textField: 'companyName',
        valueField: 'companyId',
        type: 'object',
        required: true,
        lovPara: { tenantId: organizationId, enabledFlag: 1 },
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
        bind: 'companyId.companyName',
        label: intl.get(`entity.company.tag`).d('公司'),
      },
      {
        name: 'ouId',
        label: intl.get(`entity.business.tag`).d('业务实体'),
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        type: 'object',
        required: true,
        dynamicProps: {
          lovPara({ record }) {
            return {
              companyId: record.get('companyId')?.companyId,
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              ouId: value,
              ouName: data.ouName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.ouId,
      },
      {
        name: 'ouName',
        bind: 'ouId.ouName',
        label: intl.get(`entity.business.tag`).d('业务实体'),
      },
      {
        name: 'purchaseOrgId',
        required: true,
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        lovCode: 'HPFM.PURCHASE_ORGANIZATION',
        textField: 'organizationName',
        type: 'object',
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record.get('ouId')?.ouId,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              purchaseOrgId: value,
              purchaseOrgName: data.purchaseOrgName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.purchaseOrgId,
      },
      {
        name: 'purchaseOrgName',
        bind: 'purchaseOrgId.organizationName',
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      },
      {
        name: 'unitId',
        type: 'object',
        lovCode: 'SPRM.USER_UNIT',
        label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
        textField: 'unitName',
        valueField: 'unitId',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              tenantId: organizationId,
              companyId: record.get('companyId')?.companyId,
            };
          },
        },
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
        transformRequest: (value) => value?.unitId,
      },
      {
        name: 'unitName',
        bind: 'unitId.unitName',
        label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
      },
      {
        name: 'purchaseAgentId',
        required: true,
        label: intl.get(`${commonPrompt}.purchaseAgentName`).d('计划负责人'),
        lovCode: 'SRPM.PURCHASE_AGENT',
        textField: 'purchaseAgentName',
        valueField: 'purchaseAgentId',
        type: 'object',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              purchaseOrgIds: record.get('purchaseOrgId')?.purchaseOrgId,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              purchaseAgentId: value,
              purchaseAgentName: data.purchaseAgentName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.purchaseAgentId,
      },
      {
        name: 'purchaseAgentName',
        bind: 'purchaseAgentId.purchaseAgentName',
        label: intl.get(`${commonPrompt}.purchaseAgentName`).d('计划负责人'),
      },
      {
        name: 'invOrganizationId',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record.get('ouId')?.ouId,
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
          required({ record }) {
            return !(record.get('rpSourcePlatform') && record.get('rpStatusCode') === 'reject');
          },
        },
        required: true,
        valueField: 'organizationId',
        textField: 'organizationName',
        label: intl.get(`${commonPrompt}.inventory`).d('库存组织'),
        transformResponse(value, data) {
          if (value) {
            return {
              organizationId: value,
              organizationName: data.invOrganizationName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.organizationId,
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationId.organizationName',
      },

      {
        name: 'itemCode',
        label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
        textField: 'itemCode',
        valueField: 'itemId',
        dynamicProps: {
          lovPara({ record, dataSet }) {
            const params = {
              enabledFlag: 1,
              tenantId: organizationId,
              companyId: record.get('companyId')?.companyId,
              headerCategoryId: record.get('categoryId')?.categoryId,
              lineCategoryId: record.get('categoryId')?.categoryId,
              prTypeId: record.get('prTypeId')?.prTypeId,
            };
            const { itemLimitRule = [] } = dataSet.queryParameter;
            // 物料分类
            if (itemLimitRule.find((rule) => rule === 'categoryId')) {
              params.categoryId = record.get('categoryId');
            }
            // 库存组织
            if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
              params.invOrganizationId = record.get('invOrganizationId');
            }
            return params;
          },
        },
        transformRequest: (value) => value?.itemCode,
      },
      {
        name: 'itemId',
        bind: 'itemCode.itemId',
      },
      {
        name: 'itemName',
        required: true,
        label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
        type: 'string',
        maxLength: 360,
      },
      {
        label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        name: 'categoryId',
        type: 'object',
        lovCode: 'SPRM.ITEM_CATEGOR_TILED',
        // lovCode: 'SPRM.ITEM_CATEGOR',
        // textField: 'itemCode',
        // valueField: 'itemId',
        optionsProps: {
          paging: 'server',
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              purchaseOrgId: record.get('purchaseOrgId')?.purchaseOrgId,
              queryCategoryId: record.get('purchaseOrgId')?.purchaseOrgId,
              itemId: record.get('itemId'),
            };
          },
        },
        lovDefineAxiosConfig: (code) => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  treeFlag: 'Y',
                  idField: 'categoryId',
                  parentIdField: 'parentCategoryId',
                };
              },
            ],
          };
        },
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
        transformRequest: (value) => value?.categoryId,
      },
      {
        name: 'categoryName',
        bind: 'categoryId.categoryName',
        label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
      },
      {
        label: intl.get(`${commonPrompt}.itemModel`).d('型号'),
        name: 'itemModel',
      },
      {
        label: intl.get(`${commonPrompt}.itemSpecs`).d('规格'),
        name: 'itemSpecs',
      },
      {
        name: 'uomId',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        lovCode: 'SMDM.DUAL_UOM_ID',
        type: 'object',
        textField: 'uomName',
        ignore: 'always',
        valueField: 'uomId',
        required: true,
        transformResponse(value, data) {
          if (value) {
            return {
              uomId: value,
              uomCode: data.uomCode,
              uomName: data.uomName,
              uomPrecision: data.uomPrecision,
              uomCodeAndName: data.uomCodeAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.uomId,
      },
      {
        name: 'uomPrecision',
        type: 'number',
        bind: 'uomId.uomPrecision',
      },
      {
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        name: 'uomCode',
        bind: 'uomLov.uomCode',
      },
      {
        name: 'uomName',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        bind: 'uomLov.uomName',
      },
      {
        label: intl.get(`${commonPrompt}.quantity`).d('需求计划数量'),
        name: 'quantity',
        type: 'number',
        min: 0,
        validator: (value) => {
          if (value > 0) {
            return true;
          } else {
            return intl.get(`srpm.common.message.mustExceedZero`).d('数量必须大于0');
          }
        },
        required: true,
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? null;
          },
        },
      },
      // {
      //   label: intl.get(`${commonPrompt}.mergeQuantity`).d('平衡数量'),
      //   name: 'mergeQuantity',
      //   type: 'number',
      //   min: 0,
      // validator: (value) => {
      //   if (value > 0) {
      //     return true;
      //   } else {
      //     return intl.get(`srpm.common.message.mustExceedZero`).d('数量必须大于0');
      //   }
      // },
      //   required: true,
      //   transformRequest: (value, record = {}) =>
      //     value || value === 0 ? value : record?.get('remainQuantity') || null,
      //   dynamicProps: {
      //     precision: ({ record }) => {
      //       return record.get('uomPrecision') ?? null;
      //     },
      //   },
      // },
      // {
      //   label: intl.get(`${commonPrompt}.remainQuantity`).d('剩余平衡数量'),
      //   name: 'remainQuantity',
      //   type: 'number',
      //   dynamicProps: {
      //     precision: ({ record }) => {
      //       return record.get('uomPrecision') ?? null;
      //     },
      //   },
      // },
      {
        label: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        name: 'neededDate',
        min: moment('1970-01-01'),
        type: 'date',
        required: true,
      },
      {
        name: 'taxId',
        type: 'object',
        lovCode: 'SPRM.TAX',
        textField: 'taxCode',
        label: intl.get(`${commonPrompt}.taxType`).d('税种'),
        transformResponse(value, data) {
          if (value) {
            return {
              taxId: value,
              taxRate: data.taxRate,
              taxCode: data.taxCode,
              includedTaxFlag: data.includedTaxFlag,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.taxId,
      },
      {
        name: 'taxCode',
        bind: 'taxId.taxCode',
      },
      {
        name: 'includedTaxFlag',
        bind: 'taxId.includedTaxFlag',
      },
      {
        name: 'taxRate',
        label: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        name: 'taxIncludedUnitPrice',
        type: 'number',
        // numberGrouping: true,
        dynamicProps: {
          precision: ({ record }) =>
            record.get('rpSourcePlatform') === 'REQUEST_PLAN'
              ? record.get('defaultPrecision')
              : undefined,
        },
      },
      {
        name: 'remark',
        label: intl.get(`${commonPrompt}.remark`).d('备注'),
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get(`hzero.common.button.action`).d('操作'),
      },
      {
        name: 'totalSplitQuantity',
        type: 'number',
        label: intl.get(`${commonPrompt}.splitQuantity`).d('已拆分数量'),
      },
      // {
      //   label: intl.get(`${commonPrompt}.attachment.tag`).d('附件'),
      //   type: 'attachment',
      //   viewMode: 'popup',
      //   name: 'attachmentUuid',
      //   bucketName: PRIVATE_BUCKET,
      // },
    ],
    events: {
      update: ({ name, record, value }) => {
        if (name === 'originalCurrency') {
          record.set({
            currencyCode: value?.currencyCode,
          });
        }
        if (name === 'taxId') {
          if (value) {
            const { taxCode, taxRate, includedTaxFlag } = value;
            record.set({
              taxCode,
              taxRate,
              includedTaxFlag,
            });
          } else {
            record.set({
              taxCode: null,
              taxRate: null,
              includedTaxFlag: null,
            });
          }
        }
        if (name === 'itemCode') {
          const {
            partnerItemId,
            itemName,
            itemId,
            uomCode,
            uomId,
            uomName,
            model,
            specifications,
            taxId,
            taxCode,
            taxRate,
            uomPrecision,
          } = value || {};
          record.set({
            itemName,
            itemModel: model,
            itemSpecs: specifications,
            taxId: {
              taxId,
              taxCode,
              taxRate,
            },
            uomId: {
              uomCode,
              uomId,
              uomName,
              uomPrecision,
              // uomCodeAndName: `${uomCode}/${uomName}`,
              // uomCodeAndName: uomCodeAndNameRule ? `${uomCode}/${uomName}` : uomName,
            },
            categoryId: null,
          });

          if (itemId) {
            fetchCategory({ itemId: partnerItemId || itemId, enabledFlag: 1, defaultFlag: 1 }).then(
              (res) => {
                if (res && res.length === 1) {
                  const [{ categoryId, categoryCode, categoryName }] = res;
                  record.set({
                    categoryId: { categoryId, categoryCode, categoryName },
                  });
                }
              }
            );
          }
        }
      },
      load: ({ dataSet }) => {
        if (!dataSet.getState('initFlag')) {
          dataSet.setState('initFlag', true);
        }
      },
    },
    transport: {
      read: ({ data = {} }) => {
        return {
          url: `${SRM_SRPM}/v1/${organizationId}/request-plan-balance/split-list`,
          data: {
            customizeUnitCode:
              'SRPM.RP_EXECUTE_PLATFORM.BL_SPLIT_LIST,SRPM.RP_EXECUTE_PLATFORM.BL_SPLIT_LIST_SEARCH',
            ...data,
          },
          method: 'GET',
        };
      },
    },
    record: {
      dynamicProps: {
        selectable: (record) => Number(record.get('releasedFlag')) === 0,
      },
    },
  };
};
export { listDs, pendingDs, balanceDs, vtBalanceSplitDs, blBalanceSplitDs };
