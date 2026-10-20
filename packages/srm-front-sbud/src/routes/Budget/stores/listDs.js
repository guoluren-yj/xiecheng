import intl from 'utils/intl';
import notification from 'utils/notification';
import { isEmpty } from 'lodash';
// import { c7nAmountFormatterOptions } from '@/routes/utils';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';
import { c7nAmountFormatterOptions, getBatchOperationFlag } from '@/routes/utils';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
const tenantId = getCurrentOrganizationId();

const wholeListDs = ({ type, getCount }) => {
  return {
    autoQuery: false,
    autoCreate: false,
    dataToJSON: 'all',
    cacheSelection: true,
    primaryKey: 'budgetHeaderId',
    pageSize: 20,
    transport: {
      read: ({ data = {} }) => {
        const { creationDate = {}, validityDate = {}, ...other } = data;
        return {
          url: `/sbdm/v1/${tenantId}/budget-header/${type}-list`,
          method: 'GET',
          data: { ...other, ...creationDate, ...validityDate },
        };
      },
    },
    fields: [
      {
        name: 'budgetNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetNum`).d('预算编码'),
      },
      {
        name: 'budgetHeaderDesc',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetDesc`).d('预算说明'),
      },
      {
        name: 'workFlowApproveProcess',
        label: intl.get('hzero.common.button.approve.process').d('审批进度'),
        type: 'string',
      },
      {
        name: 'budgetHeaderStatus',
        type: 'string',
        // lookupCode: 'SBDM.STRATEGY_STATUS',
        label: intl.get(`${commonPrompt}.status`).d('状态'),
      },
      {
        name: 'periodNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.periodNum`).d('预算周期'),
      },
      {
        name: 'validityDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.validityDate`).d('有效期'),
        range: ['startDate', 'endDate'],
        format: getDateTimeFormat(),
        transformRequest: value =>
          value && (value.startDate || value.endDate)
            ? {
              startDate: value.startDate,
              endDate: value.endDate,
            }
            : {},
        transformResponse: (value, record) => {
          const { startDate, endDate } = record;
          return { startDate, endDate };
        },
      },
      {
        name: 'responsibleName',
        type: 'string',
        label: intl.get(`${commonPrompt}.responsibleName`).d('责任人'),
      },
      {
        name: 'approvedName',
        type: 'string',
        label: intl.get(`${commonPrompt}.approvedName`).d('审批人'),
      },
      {
        name: 'createdByName',
        label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      },
      {
        name: 'version',
        type: 'number',
        label: intl.get(`${commonPrompt}.version`).d('版本'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get(`${commonPrompt}.operation`).d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'budgetHeaderDesc',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetDesc`).d('预算说明'),
      },
      {
        name: 'budgetHeaderStatus',
        type: 'string',
        lookupCode: 'SBDM.BUDGET_HEADER_STATUS',
        label: intl.get(`${commonPrompt}.status`).d('状态'),
      },
      {
        name: 'createdByName',
        label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
        range: ['creationDateFrom', 'creationDateTo'],
        label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      },
      {
        name: 'validityDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.validityDate`).d('有效期'),
        range: ['startDate', 'endDate'],
        format: getDateTimeFormat(),
      },
    ],
    events: {
      query: ({ dataSet }) => {
        if (!dataSet.getQueryParameter('budgetTemplateCode')) {
          notification.warning({
            message: `${intl
              .get(`${commonPrompt}.notSelectedBudgetTemplateCode`)
              .d('请选择模板编码后操作！')}`,
          });
          return false;
        } else {
          getCount(dataSet.getQueryParameter('budgetTemplateCode'));
        }
      },
      load: async ({ dataSet }) => {
        const workFlowBussinessKeys = dataSet.reduce((acc, cur) => {
          const value = cur.get('businessKey');
          if (value) {
            acc.push(value);
          }
          return acc;
        }, []);
        if (!isEmpty(workFlowBussinessKeys)) {
          // 获取审批按钮显示状态
          const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
          // 获取撤销审批按钮状态
          const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
          // 查询审批记录数据
          const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(
            workFlowBussinessKeys
          );
          dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
        }
      },
    },
  };
};

const lineListDs = ({ type, getCount }) => {
  return {
    autoQuery: false,
    autoCreate: false,
    dataToJSON: 'all',
    cacheSelection: true,
    primaryKey: 'budgetLineId',
    pageSize: 20,
    transport: {
      read: ({ data = {} }) => {
        const { creationDate = {}, validityDate = {}, ...other } = data;
        return {
          url: `/sbdm/v1/${tenantId}/budget-line/${type}-list`,
          method: 'GET',
          data: { ...other, ...creationDate, ...validityDate },
        };
      },
    },
    fields: [
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetNumAndLineNum`).d('预算编码-行号'),
      },
      {
        name: 'budgetLineDesc',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetDesc`).d('预算说明'),
      },
      {
        name: 'budgetLineStatus',
        type: 'string',
        // lookupCode: 'SBDM.STRATEGY_STATUS',
        label: intl.get(`${commonPrompt}.status`).d('状态'),
      },
      {
        name: 'periodNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.periodNum`).d('预算周期'),
      },
      {
        name: 'validityDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.validityDate`).d('有效期'),
        range: ['startDate', 'endDate'],
        format: getDateTimeFormat(),
        transformRequest: value =>
          value && (value.startDate || value.endDate)
            ? {
              startDate: value.startDate,
              endDate: value.endDate,
            }
            : {},
        transformResponse: (value, record) => {
          const { startDate, endDate } = record;
          return { startDate, endDate };
        },
      },
      {
        name: 'origBudgetAmount',
        type: 'number',
        label: intl.get(`${commonPrompt}.origBudgetAmount`).d('预算总额'),
        // dynamicProps: {
        //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
        //     record.get('financialPrecision')
        //   ),
        // },
      },
      {
        name: 'occupiedAmount',
        type: 'number',
        label: intl.get(`${commonPrompt}.occupiedAmount`).d('已占用金额'),
        // dynamicProps: {
        //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
        //     record.get('financialPrecision')
        //   ),
        // },
      },
      {
        name: 'appliedAmount',
        type: 'number',
        label: intl.get(`${commonPrompt}.appliedAmount`).d('已核销金额'),
        // dynamicProps: {
        //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
        //     record.get('financialPrecision')
        //   ),
        // },
      },
      {
        name: 'budgetBalanceAmount',
        type: 'number',
        label: intl.get(`${commonPrompt}.budgetBalanceAmount`).d('预算余额'),
        // dynamicProps: {
        //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
        //     record.get('financialPrecision')
        //   ),
        // },
      },
      {
        name: 'currencyCode',
        type: 'object',
        valueField: 'currencyCode',
        textField: 'codeName',
        required: true,
        lovCode: 'SMDM.LEDGER.CURRENCY',
        label: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
        transformRequest: value => (value ? value.currencyCode : null),
        transformResponse: (value, record) => {
          const { currencyCode = null, currencyCodeMeaning = null } = record;
          return {
            currencyCode,
            currencyName: currencyCodeMeaning,
            codeName: currencyCode ? `${currencyCode}/${currencyCodeMeaning}` : null,
          };
        },
      },
      {
        name: 'createdByName',
        label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get(`${commonPrompt}.operation`).d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'budgetLineDesc',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetDesc`).d('预算说明'),
      },
      {
        name: 'budgetLineStatus',
        type: 'string',
        lookupCode: 'SBDM.BUDGET_LINE_STATUS',
        label: intl.get(`${commonPrompt}.status`).d('状态'),
      },
      {
        name: 'createdByName',
        label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        range: ['creationDateFrom', 'creationDateTo'],
        format: getDateTimeFormat(),
        label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      },
      {
        name: 'validityDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.validityDate`).d('有效期'),
        range: ['startDate', 'endDate'],
        format: getDateTimeFormat(),
      },
      // {
      //   name: 'isAbolished',
      //   type: 'string',
      //   lookupCode: 'HPFM.FLAG',
      //   label: intl.get(`${commonPrompt}.abolished`).d('是否显示已作废数据'),
      // },
    ],
    events: {
      query: ({ dataSet }) => {
        if (!dataSet.getQueryParameter('budgetTemplateCode')) {
          notification.warning({
            message: `${intl
              .get(`${commonPrompt}.notSelectedBudgetTemplateCode`)
              .d('请选择模板编码后操作！')}`,
          });
          return false;
        } else {
          getCount(dataSet.getQueryParameter('budgetTemplateCode'));
        }
      },
    },
  };
};

const budgetTemplateLovDs = () => {
  return {
    dataToJSON: 'all',
    autoCreate: true,
    primaryKey: 'budgetTemplateCode',
    fields: [
      {
        name: 'budgetTemplateLov',
        type: 'object',
        lovCode: 'SBDM.BUDGET_TEMPLATE',
        required: true,
        valueField: 'budgetTemplateCode',
        textField: 'budgetTemplateDesc',
        label: intl.get(`${commonPrompt}.budgetTemplate`).d('预算模板'),
      },
      {
        name: 'budgetTemplateId',
        bind: 'budgetTemplateLov.budgetTemplateId',
      },
      {
        name: 'budgetTemplateCode',
        bind: 'budgetTemplateLov.budgetTemplateCode',
      },
      {
        name: 'budgetTemplateDesc',
        bind: 'budgetTemplateLov.budgetTemplateDesc',
      },
    ],
  };
};

export { wholeListDs, lineListDs, budgetTemplateLovDs };
