/*
 * @Description:
 * @Date: 2020-07-23 10:38:14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import { getMomentDate, getDatas } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

const mainTableDs = () => ({
  primaryKey: 'budgetRuleId',
  autoQuery: true,
  // table表单显示的字段
  fields: [
    {
      name: 'ruleStatusMeaning',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.ruleStatus').d('状态'),
    },
    {
      name: 'ruleCode',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.ruleCode').d('预算规则编号'),
    },
    {
      name: 'version',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.version').d('版本'),
    },
    {
      name: 'ruleDesc',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.ruleDesc').d('规则说明'),
    },
    {
      name: 'ruleLevelMeaning',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.ruleLevel').d('租户/公司'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.companyName').d('公司'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.createdByName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sbud.budgetRule.model.budgetRule.createdDate').d('创建日期'),
    },
  ],

  queryFields: [
    {
      name: 'ruleCode',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.ruleCode').d('预算规则编号'),
    },
    {
      name: 'ruleDesc',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.ruleDesc').d('规则说明'),
    },
    {
      name: 'ruleStatus',
      type: 'string',
      lookupCode: 'SBUD.BUDGET_RULE_STATUS',
      label: intl.get('sbud.budgetRule.model.budgetRule.ruleStatus').d('状态'),
    },
    {
      name: 'ruleLevel',
      type: 'string',
      lookupCode: 'SBUD.BUDGET_RULE_LEVEL',
      label: intl.get('sbud.budgetRule.model.budgetRule.ruleLevel').d('租户/公司'),
    },
    {
      name: 'companyId',
      type: 'object',
      valueField: 'companyId',
      textField: 'companyName',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      label: intl.get('sbud.budgetRule.model.budgetRule.company').d('公司'),
      transformRequest: (value) => (value ? value.companyId : null),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.createdByName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sbud.budgetRule.model.budgetRule.creationDate').d('创建日期'),
      range: ['creationDateStart', 'creationDateEnd'],
      format: getDateTimeFormat(),
      transformRequest: (value) =>
        value && (value.creationDateStart || value.creationDateEnd)
          ? {
              creationDateStart: value.creationDateStart
                ? getMomentDate(value.creationDateStart, getDateTimeFormat())
                : null,
              creationDateEnd: value.creationDateEnd
                ? getMomentDate(value.creationDateEnd, getDateTimeFormat())
                : null,
            }
          : {},
    },
  ],

  transport: {
    read: ({ data }) => {
      const { ...otherData } = data;
      const queryParams = getDatas(otherData);
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-rules`,
        method: 'GET',
        data: {
          ...queryParams,
        },
      };
    },
    submit: (val) => {
      const { data = [] } = val;
      const list = data.map((item) => {
        const itemData = getDatas(item);
        return itemData;
      });
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget`,
        data: list,
        method: 'put',
      };
    },
  },
});

export { mainTableDs };
