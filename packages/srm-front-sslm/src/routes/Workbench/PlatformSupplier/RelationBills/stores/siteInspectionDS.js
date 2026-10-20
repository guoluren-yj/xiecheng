import querystring from 'querystring';
import React, { Fragment } from 'react';
import { Link } from 'dva/router';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

const jumpDetail = ({ record }) => {
  const { evalType, evalHeaderId } = record.get(['evalType', 'evalHeaderId']);
  openTab({
    key: '/sslm/include/site-investigate-report/result/detail',
    title: intl.get('sslm.siteInvestigateReport.view.filled.detailTitle').d('现场考察报告明细'),
    search: querystring.stringify({
      evalType,
      evalHeaderId,
      openTab: 1,
    }),
  });
};

const siteInspectionDS = params => ({
  pageSize: 20,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'evalStatus',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'evalNum',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.code').d('考察报告编码'),
    },
    {
      name: 'evalNumRe',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.code').d('考察报告编码'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'evalDescription',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.describe').d('考察报告描述'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.supplierName').d('供应商'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.company').d('公司'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { companyId, supplierCompanyId } = params;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-workbench/supplier-site-eval-info`,
        method: 'GET',
        data: filterNullValueObject({
          companyId,
          supplierCompanyId,
          customizeUnitCode:
            'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SITE_INSPECTION,SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SITEINSPECTION_SEARCH_BAR',
          ...data,
        }),
      };
    },
  },
});

const siteInspectionColumns = ({ handleSiteInspection, operationRecordsModal }) => [
  {
    name: 'evalStatus',
    width: 100,
    renderer: renderStatus,
  },
  {
    name: 'option',
    width: 110,
    renderer: ({ record }) => {
      const { data: { evalHeaderId, operateFlag, evalFlag } = {} } = record;
      const params = { documentType: 'SITE_EVAL', documentId: evalHeaderId };
      return (
        <Fragment>
          {operateFlag || evalFlag ? (
            <Button funcType="link" onClick={() => handleSiteInspection(record)}>
              {intl.get('sslm.common.model.option.maintain').d('维护')}
            </Button>
          ) : null}
          <Button funcType="link" onClick={() => operationRecordsModal(params)}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
        </Fragment>
      );
    },
  },
  {
    name: 'evalNum',
    width: 140,
    renderer: ({ value, record }) => {
      const { data: { evalHeaderId, evalType, evalStatus } = {} } = record;
      return (
        <Link
          to={`/sslm/site-investigate-report/result/detail/${evalHeaderId}/${evalType}/${evalStatus}`}
        >
          {value}
        </Link>
      );
    },
  },
  {
    name: 'evalNumRe',
    width: 140,
    renderer: ({ record }) => <a onClick={() => jumpDetail({ record })}>{record.get('evalNum')}</a>,
  },
  {
    name: 'evalDescription',
    width: 150,
  },
  {
    name: 'supplierName',
    width: 150,
  },
  {
    name: 'companyName',
  },
];

export { siteInspectionDS, siteInspectionColumns };
