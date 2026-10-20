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

const mainTableDs = (budgetId) => ({
  primaryKey: 'budgetId',

  // table表单显示的字段
  fields: [
    {
      name: 'budgetStatusMeaning',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.budgetStatus').d('状态'),
    },
    {
      name: 'budgetNum',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.budgetNum').d('预算编号'),
    },
    {
      name: 'budgetDesc',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.budgetDesc').d('预算说明'),
      required: true,
    },
    {
      name: 'companyId',
      type: 'object',
      valueField: 'companyId',
      textField: 'companyName',
      required: true,
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      label: intl.get('sbud.budgeting.model.budgeting.company').d('公司'),
      transformRequest: (value) => (value ? value.companyId : null),
      transformResponse: (value, record) => {
        const { companyId = null, companyName = null } = record;
        return { companyId, companyName };
      },
      dynamicProps: {
        lovPara: () => ({
          tenantId: getCurrentOrganizationId(),
        }),
      },
    },
    {
      name: 'origBudgetAmount',
      type: 'number',
      required: true,
      label: intl.get('sbud.budgeting.model.budgeting.origBudgetAmount').d('原始预算金额'),
    },
    {
      name: 'occupiedAmount',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.occupiedAmount').d('已占用预算'),
    },
    {
      name: 'appliedAmount',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.writeoffBudget').d('核销预算'),
    },
    {
      name: 'remainingBudget',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.remainingBudget').d('剩余预算'),
    },
    {
      name: 'adjustAmount',
      type: 'number',
      label: intl.get('sbud.budgeting.model.budgeting.adjustAmount').d('调整金额'),
    },
    {
      name: 'budgetAmount',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.budgetAmount').d('审批后预算金额'),
    },
    {
      name: 'currencyCode',
      type: 'object',
      valueField: 'currencyCode',
      textField: 'codeName',
      required: true,
      lovCode: 'SMDM.LEDGER.CURRENCY',
      label: intl.get('sbud.budgeting.model.budgeting.currency').d('币种'),
      transformRequest: (value) => (value ? value.currencyCode : null),
      transformResponse: (value, record) => {
        const { currencyCode = null, currencyCodeMeaning = null } = record;
        return {
          currencyCode,
          currencyName: currencyCodeMeaning,
          codeName: currencyCode ? `${currencyCode}/${currencyCodeMeaning}` : null,
        };
      },
      dynamicProps: {
        lovPara: () => ({
          tenantId: getCurrentOrganizationId(),
        }),
      },
    },
    {
      name: 'periodNum',
      type: 'object',
      valueField: 'periodNum',
      textField: 'periodNum',
      // required: true,
      lovCode: 'SBUD.BUGET_PERIOD',
      label: intl.get('sbud.budgeting.model.budgeting.periodNums').d('预算周期'),
      transformRequest: (value) => (value ? value.periodNum : null),
      transformResponse: (value, record) => {
        const { periodNum = null } = record;
        return { periodNum };
      },
      dynamicProps: {
        lovPara: ({ record }) => {
          const { periodNum, year, quarter, month, ...others } = record.toData();
          return {
            tenantId: getCurrentOrganizationId(),
            ...getDatas(others),
          };
        },
      },
    },
    {
      name: 'validityDate',
      type: 'dateTime',
      required: true,
      label: intl.get('sbud.budgeting.model.budgeting.validity').d('有效期'),
      range: ['startDate', 'endDate'],
      format: getDateTimeFormat(),
      transformRequest: (value) =>
        value && (value.startDate || value.endDate)
          ? {
              startDate: value.startDate
                ? getMomentDate(value.startDate, getDateTimeFormat())
                : null,
              endDate: value.endDate ? getMomentDate(value.endDate, getDateTimeFormat()) : null,
            }
          : {},
      transformResponse: (value, record) => {
        const { startDate, endDate } = record;
        return { startDate, endDate };
      },
    },
    // SBUD.BUGET_PERIOD@张永轩  周期明细   periodNum
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.createdByName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sbud.budgeting.model.budgeting.creationDate').d('创建日期'),
    },
    {
      name: 'approvedDate',
      type: 'dateTime',
      label: intl.get('sbud.budgeting.model.budgeting.approvedDate').d('审批日期'),
    },
    {
      name: 'version',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.version').d('版本'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.operation').d('操作'),
    },
  ],

  //   queryFields: [],

  transport: {
    read: ({ data }) => {
      const { ...otherData } = data;
      const queryParams = getDatas(otherData);
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget/workflow/list`,
        method: 'GET',
        data: {
          ...queryParams,
          budgetId,
        },
      };
    },
  },
});

export { mainTableDs };
