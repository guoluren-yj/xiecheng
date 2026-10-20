/**
 * indexDs -
 * @date: 2020/11/24
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

export default () => ({
  selection: false,
  primaryKey: 'evalHeaderId',
  autoQuery: true,
  queryFields: [
    {
      name: 'evalNum',
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.code').d('考察报告编码'),
    },
    {
      name: 'evalDescription',
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.describe').d('考察报告描述'),
    },
    {
      name: 'companyIdLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTH.CUSTOMER',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.customer').d('客户'),
    },
    {
      name: 'companyId',
      bind: 'companyIdLov.companyId',
    },
    {
      name: 'creationDateFrom',
      type: 'date',
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.creationDateFrom').d('创建时间从'),
      transformRequest: value => value && value.format(DATETIME_MIN),
      dynamicProps: {
        max: ({ record }) => record && record.get('creationDateTo'),
      },
    },
    {
      name: 'creationDateTo',
      type: 'date',
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.creationDateTo').d('创建时间至'),
      transformRequest: value => value && value.format(DATETIME_MAX),
      dynamicProps: {
        min: ({ record }) => record && record.get('creationDateFrom'),
      },
    },
    {
      name: 'supplierCompanyIdLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.company').d('公司'),
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierCompanyIdLov.companyId',
    },
    {
      name: 'realName',
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.createdBy').d('创建人'),
    },
  ],
  fields: [
    {
      name: 'evalStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'evalNum',
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.code').d('考察报告编码'),
    },
    {
      name: 'evalDescription',
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.describe').d('考察报告描述'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.customer').d('客户'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.company').d('公司'),
    },
    {
      name: 'evalTplName',
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.template').d('考察模板'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.creationDate').d('创建时间'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.siteInvestigateReport.modal.feedBack.createdBy').d('创建人'),
    },
  ],
  transport: {
    read: config => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/publishedList`,
        ...config,
      };
    },
  },
});
