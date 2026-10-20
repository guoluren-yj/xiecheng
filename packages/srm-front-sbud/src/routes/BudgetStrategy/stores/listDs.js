import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
const tenantId = getCurrentOrganizationId();

export default () => {
  return {
    autoQuery: true,
    autoCreate: false,
    dataToJSON: 'all',
    selection: false,
    pageSize: 20,
    paging: 'server',
    idField: 'budgetStrategyId',
    parentField: 'parentBudgetStrategyId',
    primaryKey: 'budgetStrategyId',
    transport: {
      read: ({ data = {} }) => {
        return {
          url: `/sbdm/v1/${tenantId}/budget-strategy?customizeUnitCode=SBUD_BUDGET_STRATEGY.SEARCH,SBUD_BUDGET_STRATEGY.TABLE`,
          method: 'GET',
          transformResponse: value => {
            const newValue = [];
            const listData = value ? JSON.parse(value) : {};
            listData?.content?.forEach(ele => {
              newValue.push({
                ...ele,
                parentBudgetStrategyId: undefined,
                noEffBudgetStrategy: undefined,
              });
              if (ele.noEffBudgetStrategy) {
                newValue.push({
                  ...ele.noEffBudgetStrategy,
                  parentBudgetStrategyId: ele.budgetStrategyId,
                  noEffBudgetStrategy: undefined,
                });
              }
            });
            return {
              ...listData,
              content: newValue,
            };
          },
        };
      },
    },
    fields: [
      {
        name: 'budgetStrategyCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetStrategyCode`).d('策略编码'),
      },
      {
        name: 'budgetStrategyDesc',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetStrategyDesc`).d('策略名称'),
      },
      {
        name: 'strangeStatus',
        type: 'string',
        lookupCode: 'SBDM.STRATEGY_STATUS',
        label: intl.get(`${commonPrompt}.status`).d('状态'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('strangeStatus') === 'NEW';
          },
        },
        label: intl.get(`${commonPrompt}.enabledFlag`).d('是否启用'),
      },
      {
        name: 'version',
        type: 'number',
        label: intl.get(`${commonPrompt}.version`).d('当前版本'),
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
    // queryFields: [
    //   // {
    //   //   name: 'budgetStrategyCode',
    //   //   type: 'string',
    //   //   label: intl.get(`${commonPrompt}.budgetStrategyCode`).d('策略编码'),
    //   // },
    //   {
    //     name: 'budgetStrategyDesc',
    //     type: 'string',
    //     label: intl.get(`${commonPrompt}.budgetStrategyDesc`).d('策略名称'),
    //   },
    //   {
    //     name: 'strangeStatus',
    //     type: 'string',
    //     lookupCode: 'SBDM.STRATEGY_STATUS',
    //     label: intl.get(`${commonPrompt}.status`).d('状态'),
    //   },
    //   {
    //     name: 'creationDate',
    //     type: 'dateTime',
    //     format: getDateTimeFormat(),
    //     range: ['creationDateFrom', 'creationDateTo'],
    //     label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
    //   },
    //   {
    //     name: 'enabledFlag',
    //     type: 'string',
    //     lookupCode: 'HPFM.FLAG',
    //     label: intl.get(`${commonPrompt}.enabledFlag`).d('是否启用'),
    //   },
    // ],
  };
};
