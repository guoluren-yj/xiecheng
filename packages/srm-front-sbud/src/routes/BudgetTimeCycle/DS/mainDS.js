/*
 * @Description:
 * @Date: 2020-07-23 10:38:14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { getDatas } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

const mainTableDs = () => ({
  primaryKey: 'periodSetId',
  autoQuery: true,
  // table表单显示的字段
  fields: [
    {
      name: 'periodSetNum',
      type: 'string',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.periodSetNum').d('预算周期代码'),
    },
    {
      name: 'periodSetName',
      type: 'string',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.periodSetName').d('预算周期名称'),
    },
    {
      name: 'typeCode',
      type: 'string',
      lookupCode: 'SBUD.BUDGET.DATETYPE',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.typeCode').d('类型'),
    },
    {
      name: 'ruleContext',
      type: 'string',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.ruleContext').d('规则'),
      transformResponse: (value, record) => {
        const { typeCode, ruleCode } = record;
        let msg = '';
        if (Number(ruleCode) === 0 && Number(typeCode) === 1) {
          msg = intl.get('sbud.budgetTimeCycle.view.year').d('自然年');
        } else if (Number(ruleCode) === 0 && Number(typeCode) === 2) {
          msg = intl.get('sbud.budgetTimeCycle.view.month').d('自然月');
        } else if (Number(ruleCode) === 0 && Number(typeCode) === 3) {
          msg = intl.get('sbud.budgetTimeCycle.view.season').d('自然季度');
        } else {
          msg = intl.get('sbud.budgetTimeCycle.view.custom').d('自定义');
        }
        return value || msg;
      },
    },
    {
      name: 'startDate',
      type: 'string',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.startDate').d('生效日期'),
    },
    {
      name: 'endDate',
      type: 'string',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.endDate').d('失效日期'),
    },
    {
      name: 'enabledFlag',
      type: 'string',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.enabledFlag').d('是否启用'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.operation').d('操作'),
    },
    {
      name: 'cycleDetail',
      type: 'string',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.cycleDetail').d('周期明细'),
    },
  ],

  transport: {
    read: ({ data }) => {
      const { ...otherData } = data;
      const queryParams = getDatas(otherData);
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-period-sets`,
        method: 'GET',
        data: {
          ...queryParams,
        },
      };
    },
  },
});

// 侧滑表单ds
const basicDrawerFormDs = () => ({
  // autoQuery: true,
  // autoCreate: true,

  // table表单显示的字段
  fields: [
    {
      name: 'periodSetNum',
      type: 'string',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.periodSetNum').d('预算周期代码'),
      required: true,
    },
    {
      name: 'periodSetName',
      type: 'intl',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.periodSetName').d('预算周期名称'),
      required: true,
    },
    {
      name: 'typeCode',
      type: 'string',
      lookupCode: 'SBUD.BUDGET.DATETYPE',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.typeCode').d('类型'),
      required: true,
    },
    {
      name: 'rule',
      type: 'string',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.ruleCode').d('规则：'),
    },
    {
      name: 'ruleCode',
      type: 'string',
      required: true,
    },
    {
      name: 'quarter', // 季度
      type: 'number',
      max: 4,
      min: 1,
    },
    {
      name: 'month', // 月
      type: 'number',
      max: 12,
      min: 1,
      dynamicProps: {
        required: ({ record }) => {
          const typeCode = record.get('typeCode');
          const ruleCode = record.get('ruleCode');
          if (['1', '3'].includes(typeCode) && ['1', '2'].includes(ruleCode)) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'day', // 日
      type: 'number',
      max: 31,
      min: 1,
      dynamicProps: {
        required: ({ record }) => {
          const typeCode = record.get('typeCode');
          const ruleCode = record.get('ruleCode');
          if (['1', '2', '3'].includes(typeCode) && ['1'].includes(ruleCode)) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'week', // 周
      type: 'number',
      max: 4,
      min: 1,
      dynamicProps: {
        required: ({ record }) => {
          const typeCode = record.get('typeCode');
          const ruleCode = record.get('ruleCode');
          if (['1', '2', '3'].includes(typeCode) && ['2'].includes(ruleCode)) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'weekDay', // 星期
      type: 'number',
      max: 7,
      min: 1,
      dynamicProps: {
        required: ({ record }) => {
          const typeCode = record.get('typeCode');
          const ruleCode = record.get('ruleCode');
          if (['1', '2', '3'].includes(typeCode) && ['2'].includes(ruleCode)) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'hour', // 时
      type: 'number',
      max: 24,
      min: 0,
      dynamicProps: {
        required: ({ record }) => {
          const ruleCode = record.get('ruleCode');
          if (['1', '2'].includes(ruleCode)) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    // {
    //   name: 'validityDate',
    //   type: 'dateTime',
    //   label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.ruleCode').d('有效期'),
    //   range: ['startDate', 'endDate'],
    //   format: getDateTimeFormat(),
    //   transformRequest: (value) =>
    //     value && (value.startDate || value.endDate)
    //       ? {
    //           startDate: value.startDate
    //             ? getMomentDate(value.startDate, getDateTimeFormat())
    //             : null,
    //           endDate: value.endDate ? getMomentDate(value.endDate, getDateTimeFormat()) : null,
    //         }
    //       : null,
    //   transformResponse: (value, record) => {
    //     const { startDate, endDate } = record;
    //     return { startDate, endDate };
    //   },
    //   required: true,
    // },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.yesOrNo').d('启用'),
    },
    {
      name: 'startDate',
      type: 'dateTime',
      max: 'endDate',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.startDate').d('生效日期'),
      required: true,
    },
    {
      name: 'endDate',
      type: 'dateTime',
      min: 'startDate',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.endDate').d('失效日期'),
      required: true,
    },
  ],
});

//  规则明细
const cycleDetailDs = () => ({
  // autoQuery: true,
  primaryKey: 'periodId',

  // table表单显示的字段
  fields: [
    {
      name: 'periodNum',
      type: 'string',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.periodNum').d('周期代码'),
    },
    {
      name: 'year',
      type: 'string',
      required: true,
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.year').d('年'),
    },
    {
      name: 'quarter',
      type: 'number',
      max: 4,
      min: 1,
      required: true,
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.quarter').d('季度'),
    },
    {
      name: 'month',
      type: 'number',
      max: 12,
      min: 1,
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.month').d('月'),
      required: true,
    },
    {
      name: 'startDate',
      type: 'dateTime',
      max: 'endDate',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.startDate').d('生效日期'),
      required: true,
    },
    {
      name: 'endDate',
      type: 'dateTime',
      min: 'startDate',
      label: intl.get('sbud.budgetTimeCycle.model.budgetTimeCycle.endDate').d('失效日期'),
      required: true,
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-periods`,
        method: 'GET',
        data,
      };
    },
    submit: ({ data }) => {
      const queryParams = data.map((item) => getDatas(item));
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-periods`,
        data: queryParams,
        method: 'POST',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-periods`,
        data,
        method: 'DELETE',
      };
    },
  },
});

export { mainTableDs, basicDrawerFormDs, cycleDetailDs };
