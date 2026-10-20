/**
 * sampleDS - 送样申请DS
 * @date: 2020-12-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

const siteInspectionDS = () => ({
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
    {
      name: 'evalTplName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.template').d('考察模板'),
    },
    {
      name: 'resultsFlag',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.resultsFlagMeaning').d('考察结果'),
    },
    {
      name: 'finalScore',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.score').d('得分'),
    },
    {
      name: 'grade',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.grade').d('等级'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.creationDate').d('创建时间'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.createdBy').d('创建人'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params = {}, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/result/evaluating`,
        method: 'GET',
        data: filterNullValueObject({ ...params, ...other }),
      };
    },
  },
});

// 现场考察Columns
const siteInspectionColumns = ({ jumpSiteInspection }) => [
  {
    name: 'evalStatus',
    width: 100,
    renderer: renderStatus,
  },
  {
    name: 'evalNum',
    width: 140,
    renderer: ({ value, record }) => {
      const { evalHeaderId, evalType, evalStatus } = record.get([
        'evalHeaderId',
        'evalType',
        'evalStatus',
      ]);
      return (
        <a onClick={() => jumpSiteInspection({ evalHeaderId, evalType, evalStatus })}>{value}</a>
      );
    },
  },
  {
    name: 'evalNumRe',
    width: 140,
    renderer: ({ record }) => {
      const { evalHeaderId, evalType, evalStatus, evalNum } = record.get([
        'evalHeaderId',
        'evalType',
        'evalStatus',
        'evalNum',
      ]);
      return (
        <a
          onClick={() =>
            jumpSiteInspection({ evalHeaderId, evalType, evalStatus, openTabFlag: true })
          }
        >
          {evalNum}
        </a>
      );
    },
  },
  {
    name: 'evalDescription',
    width: 150,
  },
  {
    name: 'supplierName',
    width: 200,
  },
  {
    name: 'companyName',
    width: 200,
  },
  {
    name: 'evalTplName',
    width: 150,
  },
  {
    name: 'resultsFlag',
    width: 100,
    renderer: ({ record }) => record.get('resultsFlagMeaning'),
  },
  {
    name: 'finalScore',
    width: 100,
  },
  {
    name: 'grade',
    width: 100,
  },
  {
    name: 'creationDate',
    width: 150,
  },
  {
    name: 'realName',
    width: 120,
  },
];

export { siteInspectionDS, siteInspectionColumns };
