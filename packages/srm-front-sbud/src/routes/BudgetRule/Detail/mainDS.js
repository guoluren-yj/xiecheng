/* eslint-disable no-unused-expressions */
/*
 * @Description:
 * @Date: 2020-08-20 14:21:53
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 规则头
const formDs = () => ({
  // autoQuery: true,
  autoCreate: true,

  fields: [
    {
      name: 'ruleCode',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.ruleCode').d('预算规则编号'),
    },
    {
      name: 'ruleDesc',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.ruleDesc').d('规则说明'),
      required: true,
    },
    {
      name: 'version',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.version').d('版本'),
    },
    {
      name: 'ruleLevel',
      type: 'string',
      lookupCode: 'SBUD.BUDGET_RULE_LEVEL',
      label: intl.get('sbud.budgetRule.model.budgetRule.ruleLevel').d('租户/公司'),
      required: true,
    },
    {
      name: 'company',
      type: 'object',
      valueField: 'companyId',
      textField: 'companyName',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      label: intl.get('sbud.budgetRule.model.budgetRule.company').d('公司'),
      dynamicProps: {
        disabled: ({ record }) => record.get('ruleLevel') === 'TENANT',
        required: ({ record }) => record.get('ruleLevel') === 'COMPANY',
      },
    },
    {
      name: 'companyId',
      type: 'string',
      bind: 'company.companyId',
    },
    {
      name: 'companyName',
      type: 'string',
      bind: 'company.companyName',
    },
    {
      name: 'ruleStatusMeaning',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.ruleStatus').d('状态'),
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
    },
    {
      name: 'excessOccupancyTolerance',
      type: 'number',
      defaultValue: 0,
      required: true,
      label: `${intl
        .get('sbud.budgetRule.model.budgetRule.excessOccupancyTolerance')
        .d('预算超量占用允差')}（%）`,
    },
    {
      name: 'balanceReminderFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
      help: intl
        .get('sbud.budgetRule.model.budgetRule.balanceReminderFlag.help')
        .d('当预算占用超出余额不足提醒开始节点，进行预算占用时会进行提醒'),
      label: intl
        .get('sbud.budgetRule.model.budgetRule.balanceReminderFlag')
        .d('预算余额不足提醒标识'),
    },
    {
      name: 'balanceRemindsNode',
      type: 'number',
      required: true,
      label: `${intl
        .get('sbud.budgetRule.model.budgetRule.balanceRemindsNode')
        .d('余额不足提醒开始节点')}（%）`,
      min: 0,
      max: 100,
      dynamicProps: {
        required: ({ record }) => record.get('balanceReminderFlag') === '1',
      },
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.records.forEach((record) => {
        if (record.get('ruleLevel') === 'TENANT') {
          record.set('company', null);
        }
      });
    },
    update: ({ record, name, value }) => {
      if (name === 'ruleLevel' && value === 'TENANT') {
        record.set('company', null);
      }
    },
  },
});

// 规则行DS
const tableDs = () => ({
  // autoQuery: true,
  paging: false,
  // table表单显示的字段
  fields: [
    {
      name: 'sequenceNo',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.sequenceNo').d('序号'),
    },
    {
      name: 'budgetItem',
      type: 'object',
      lovCode: 'SBUD.BUDGET_ITEM_MAPING',
      label: intl.get('sbud.budgetRule.model.budgetRule.budgetItem').d('预算维度'),
      dynamicProps: {
        lovPara: () => ({
          tenantId: organizationId,
        }),
      },
      required: true,
    },
    {
      name: 'budgetItemCode',
      type: 'string',
      bind: 'budgetItem.budgetItemCode',
    },
    {
      name: 'budgetItemName',
      type: 'string',
      bind: 'budgetItem.budgetItemName',
    },
    {
      name: 'componentType',
      type: 'string',
      bind: 'budgetItem.componentType',
    },
    {
      name: 'displayField',
      type: 'string',
      bind: 'budgetItem.displayField',
    },
    {
      name: 'valueField',
      type: 'string',
      bind: 'budgetItem.valueField',
    },
    {
      name: 'lovCode',
      type: 'string',
      bind: 'budgetItem.lovCode',
    },
    {
      name: 'operator',
      type: 'string',
      lookupCode: 'SBUD.BUDGET_OPERATOR',
      label: intl.get('sbud.budgetRule.model.budgetRule.operator').d('条件'),
      required: true,
    },
    {
      name: 'valueObj',
      // type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.value').d('值'),
      // lovCode: 'SMDM.BUDGET_ACCOUNT',
      // textField: 'budgetAccountNum',
      transformResponse: (value, record) => {
        if (record.componentType === 'SELECT') {
          return record.value;
        }
      },
      dynamicProps: {
        lovPara: () => ({
          tenantId: organizationId,
        }),
        required: ({ record }) =>
          !(
            record.get('operator') === 'is null' ||
            record.get('operator') === '!= null' ||
            record.get('operator') === '== null'
          ),
        // lovCode: ({ record }) => {
        //   console.log(record.get('lovCode'));
        //   return (record.get('lovCode') ? record.get('lovCode') : '');
        // },
        // textField: ({ record }) => {
        //   console.log(record.get('valueField'));
        //   return (record.get('valueField') ? record.get('valueField') : '');
        // },
        type: ({ record }) => (record.get('componentType') === 'LOV' ? 'object' : 'string'),
        lovCode: ({ record }) => (record.get('componentType') === 'LOV' ? record.get('lovCode') : null),
        lookupCode: ({ record }) => (record.get('componentType') === 'SELECT' ? record.get('lovCode') : null),
        textField: ({ record }) => (record.get('componentType') === 'LOV' ? record.get('valueField') : ''),
        valueField: ({ record }) => (record.get('componentType') === 'LOV' ? null : 'value'),
        disabled: ({ record }) =>
          record.get('operator') === 'is null' ||
          record.get('operator') === '!= null' ||
          record.get('operator') === '== null',
      },
      ignore: 'always',
      // noCache: true,
    },
    {
      name: 'valueMeaning',
      type: 'string',
      label: intl.get('sbud.budgetRule.model.budgetRule.valueMeaning').d('值名称'),
      dynamicProps: {
        bind: ({ record }) => {
          return record.get('componentType') === 'LOV' && record.get('displayField') ? `valueObj.${record.get('displayField')}` : '';
        },
      },
    },
    {
      name: 'value',
      type: 'string',
      dynamicProps: {
        bind: ({ record }) => {
          return record.get('componentType') === 'LOV' && record.get('displayField') ? `valueObj.${record.get('valueField')}` : '';
        },
      },
    },
    {
      name: 'endDate',
      type: 'dateTime',
      label: intl.get('sbud.budgetRule.model.budgetRule.endDate').d('失效日期'),
    },
  ],
  transport: {
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-rule-lines`,
        data,
        method: 'DELETE',
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'budgetItem' || (name === 'operator' && value === 'is null')) {
        record.set('valueObj', null);
      }
      if (name === 'valueObj' && record.get('componentType') === 'SELECT') {
        record.set('value', value);
        record.set('valueMeaning', record.getField(name).getLookupData(value).meaning);
      }
    },
  },
});

export { formDs, tableDs };
