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

const detailDS = () => ({
  // primaryKey: 'budgetId',/
  // table表单显示的字段
  fields: [
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sbud.budgeting.model.budgeting.inDate').d('占用时间'),
    },
    {
      name: 'documentTypeMeaning',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.documentTypeMeaning').d('单据类型'),
    },
    {
      name: 'returnedFlag',
      type: 'number',
      label: intl.get('sbud.budgeting.model.budgeting.returnedFlag').d('是否退货'),
    },
    {
      name: 'documentNum',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.documentNum').d('单据编号'),
      required: true,
    },
    {
      name: 'amount',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.amount').d('占用金额'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.realName').d('操作人'),
    },
    {
      name: 'quantity',
      label: intl.get('sbud.budgeting.model.budgeting.quantity').d('数量'),
    },
    {
      name: 'appliedAmount',
      label: intl.get('sbud.budgeting.model.budgeting.appliedWrittenOffAmount').d('核销金额'),
    },
    {
      name: 'contactDocuments',
      label: intl.get('sbud.budgeting.model.budgeting.contactDocuments').d('关联单据'),
    },
  ],

  queryFields: [],

  transport: {
    read: ({ data }) => {
      const { ...otherData } = data;
      const queryParams = getDatas(otherData);
      const budgetId = location.search.split('=')[1];
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-occupy/list/${budgetId}`,
        method: 'GET',
        data: {
          ...queryParams,
        },
      };
    },
  },
  events: {},
});
const queryFields = () => [
  {
    name: 'documentType',
    type: 'string',
    // label: '单据类型',
    label: intl.get('sbud.budgeting.model.budgeting.documentType').d('单据类型'),
    lookupCode: 'SBUD.BUDGET_DOCUMENT_TYPE',
  },
  {
    name: 'documentNum',
    type: 'string',
    // label: '单据编号',
    label: intl.get('sbud.budgeting.model.budgeting.documentNum').d('单据编号'),
  },

  {
    name: 'creationDate',
    type: 'dateTime',
    // label: '占用时间',
    label: intl.get('sbud.budgeting.model.budgeting.inDate').d('占用时间'),
    range: ['creationDateFrom', 'creationDateTo'],
    format: getDateTimeFormat(),
    transformRequest: (value) =>
      value && (value.creationDateFrom || value.creationDateTo)
        ? {
            creationDateFrom: value.creationDateFrom
              ? getMomentDate(value.creationDateFrom, getDateTimeFormat())
              : null,
            creationDateTo: value.creationDateTo
              ? getMomentDate(value.creationDateTo, getDateTimeFormat())
              : null,
          }
        : {},
  },
];

export { detailDS, queryFields };
