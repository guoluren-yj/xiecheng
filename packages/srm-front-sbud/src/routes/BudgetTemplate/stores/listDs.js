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
    idField: 'budgetTemplateId',
    parentField: 'parentTemplateId',
    primaryKey: 'budgetTemplateId',
    transport: {
      read: ({ data = {} }) => {
        return {
          url: `/sbdm/v1/${tenantId}/budget-template/list-new?customizeUnitCode=SBUD_BUDGET_TEMPLATE.SEARCH,SBUD_BUDGET_TEMPLATE.LIST`,
          method: 'POST',
          transformResponse: value => {
            const newValue = [];
            const listData = value ? JSON.parse(value) : {};
            listData?.content?.forEach(ele => {
              newValue.push({
                ...ele,
                parentTemplateId: undefined,
                nextBudgetTemplate: undefined,
              });
              if (ele.nextBudgetTemplate) {
                newValue.push({
                  ...ele.nextBudgetTemplate,
                  parentTemplateId: ele.budgetTemplateId,
                  nextBudgetTemplate: undefined,
                });
              }
            });
            console.log(newValue);
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
        name: 'budgetTemplateCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetTemplateCode`).d('预算模板编码'),
      },
      {
        name: 'budgetTemplateDesc',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetTemplateDesc`).d('预算模板描述'),
      },
      {
        name: 'templateStatus',
        type: 'string',
        lookupCode: 'SBDM.BUDGET_TEMPLATE_STATUS',
        label: intl.get(`${commonPrompt}.status`).d('状态'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get(`${commonPrompt}.enabledFlag`).d('是否启用'),
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('templateStatus') === 'UNRELEASED';
          },
        },
      },
      {
        name: 'version',
        type: 'number',
        label: intl.get(`${commonPrompt}.currentVersion`).d('当前版本'),
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
    //   //   name: 'budgetTemplateCode',
    //   //   type: 'string',
    //   //   label: intl.get(`${commonPrompt}.budgetTemplateCode`).d('预算模板编码'),
    //   // },
    //   {
    //     name: 'budgetTemplateDesc',
    //     type: 'string',
    //     label: intl.get(`${commonPrompt}.budgetTemplateDesc`).d('预算模板描述'),
    //   },
    //   {
    //     name: 'templateStatus',
    //     type: 'string',
    //     lookupCode: 'SBDM.BUDGET_TEMPLATE_STATUS',
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
