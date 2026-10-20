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

const detailDS = (budgetId) => ({
  // primaryKey: 'budgetId',/
  // table表单显示的字段
  autoQuery: true,
  fields: [
    {
      name: 'occupyDocumentType',
      type: 'string',
      lookupCode: 'SBUD.BUDGET_DOCUMENT_TYPE',
      label: intl.get('sbud.budgeting.model.budgeting.occupyDocumentType').d('来源单据类型'),
    },
    {
      name: 'occupyDate',
      type: 'dateTime',
      label: intl.get('sbud.budgeting.model.budgeting.occupyDate').d('预算占据时间'),
    },
    {
      name: 'occupyDocumentNum',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.occupyDocumentNum').d('来源单据编号'),
    },
    {
      name: 'occupyQuantity',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.occupyQuantity').d('来源单据数量'),
    },
    {
      name: 'occupyAmount',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.occupyAmount').d('预算占用金额'),
    },
    {
      name: 'cancellationDocumentType',
      type: 'string',
      lookupCode: 'SBUD.BUDGET_CANCELLATION_DOCUMENT_TYPE',
      label: intl.get('sbud.budgeting.model.budgeting.cancellationDocumentType').d('核销单据类型'),
    },
    {
      name: 'cancellationDate',
      type: 'dateTime',
      label: intl.get('sbud.budgeting.model.budgeting.cancellationDate').d('核销时间'),
    },
    {
      name: 'cancellationDocumentNum',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.cancellationDocumentNum').d('核销单据单号'),
    },
    {
      name: 'cancellationQuantity',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.cancellationQuantity').d('核销数量'),
    },
    {
      name: 'cancellationAmount',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.cancellationAmount').d('核销金额'),
    },
    {
      name: 'cancellationFlag',
      type: 'number',
      label: intl.get('sbud.budgeting.model.budgeting.cancellationFlag').d('是否已核销'),
    },
  ],

  queryFields: [
    {
      name: 'cancellationDocumentType',
      type: 'string',
      lookupCode: 'SBUD.BUDGET_CANCELLATION_DOCUMENT_TYPE',
      label: intl.get('sbud.budgeting.model.budgeting.cancellationDocumentType').d('核销单据类型'),
    },
    {
      name: 'cancellationDocumentNum',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.cancellationDocumentNum').d('核销单据单号'),
    },
    {
      name: 'cancellationDate',
      type: 'dateTime',
      label: intl.get('sbud.budgeting.model.budgeting.cancellationDate').d('核销时间'),
      range: ['cancellationDateFrom', 'cancellationDateTo'],
      format: getDateTimeFormat(),
      transformRequest: (value) =>
        value && (value.cancellationDateFrom || value.cancellationDateTo)
          ? {
              cancellationDateFrom: value.cancellationDateFrom
                ? getMomentDate(value.cancellationDateFrom, getDateTimeFormat())
                : null,
              cancellationDateTo: value.cancellationDateTo
                ? getMomentDate(value.cancellationDateTo, getDateTimeFormat())
                : null,
            }
          : {},
    },
    {
      name: 'occupyDocumentType',
      type: 'string',
      lookupCode: 'SBUD.BUDGET_DOCUMENT_TYPE',
      label: intl.get('sbud.budgeting.model.budgeting.occupyDocumentType').d('来源单据类型'),
    },
    {
      name: 'occupyDocumentNum',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.occupyDocumentNum').d('来源单据编号'),
    },
    {
      name: 'occupyDate',
      type: 'dateTime',
      label: intl.get('sbud.budgeting.model.budgeting.occupyDate').d('预算占据时间'),
      range: ['occupyDateFrom', 'occupyDateTo'],
      format: getDateTimeFormat(),
      transformRequest: (value) =>
        value && (value.occupyDateFrom || value.occupyDateTo)
          ? {
              occupyDateFrom: value.occupyDateFrom
                ? getMomentDate(value.occupyDateFrom, getDateTimeFormat())
                : null,
              occupyDateTo: value.occupyDateTo
                ? getMomentDate(value.occupyDateTo, getDateTimeFormat())
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
        url: `${SRM_SPRM}/v1/${organizationId}/budget-cancellations/list/${budgetId}`,
        method: 'GET',
        data: {
          ...queryParams,
        },
      };
    },
  },
});

export { detailDS };
