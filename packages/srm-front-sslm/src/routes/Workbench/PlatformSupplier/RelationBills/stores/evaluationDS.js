import React from 'react';
import { Link } from 'dva/router';
import querystring from 'querystring';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { SRM_SSLM } from '_utils/config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';
import { rangeDateRender } from '@/routes/components/utils/utils';

const organizationId = getCurrentOrganizationId();

const jumpDetail = ({ record }) => {
  const { evalTplId, createPage, evalHeaderId, evalGranularity } = record.get([
    'evalTplId',
    'createPage',
    'evalHeaderId',
    'evalGranularity',
  ]);
  const newPage = createPage === 'ASSESS'; // 新菜单
  const pathname = newPage
    ? `/sslm/include/appraisal-purchaser/detail/${evalTplId}/${evalHeaderId}/${evalGranularity}/read`
    : `/sslm/include/evaluation-query/detail/${evalHeaderId}`;
  const title = newPage
    ? intl.get('sslm.evaluationQuery.model.title.viewEvaluation').d(`查看考评档案`)
    : intl.get(`sslm.evaluationQuery.model.result.query`).d('考评结果查询');
  const routerParams = newPage
    ? {
        openTab: 1,
      }
    : {
        evalGranularity,
        openTab: 1,
      };
  openTab({
    title,
    key: pathname,
    search: querystring.stringify(routerParams),
  });
};

const evaluationDS = params => ({
  pageSize: 20,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'evalStatus',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.archive.num`).d('档案编码'),
      name: 'evalNum',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.archive.num`).d('档案编码'),
      name: 'reEvalNum',
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.archive.describe`).d('档案描述'),
      name: 'evalName',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.evaluation.cycle`).d('考评周期'),
      name: 'evalCycle',
    },
    {
      name: 'evalDate',
      type: 'date',
      label: intl.get('sslm.common.model.evaluation.evalDate').d('考评日期'),
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.archive.lineScore`).d('得分'),
      name: 'lineScore',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.archive.checkCollectScore`).d('校准得分'),
      name: 'checkCollectScore',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { companyId, supplierCompanyId } = params;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-headers/result/life/purchase`,
        method: 'GET',
        data: filterNullValueObject({
          pageEntryPoint: 'CUSTOMER_OWNED',
          companyId,
          supplierId: supplierCompanyId,
          customizeUnitCode:
            'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVALUATION,SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVALUATION_SEARCH_BAR',
          ...data,
        }),
      };
    },
  },
});

const evaluationColumns = ({ operationRecordsModal }) => [
  {
    name: 'evalStatus',
    width: 120,
    renderer: renderStatus,
  },
  {
    name: 'option',
    width: 80,
    renderer: ({ record }) => {
      const { data: { evalHeaderId } = {} } = record;
      const params = {
        documentType: 'KPI_EVAL',
        headerId: evalHeaderId,
        evalHeaderId,
        documentId: evalHeaderId,
      };
      return (
        <Button funcType="link" onClick={() => operationRecordsModal(params)}>
          {intl.get('hzero.common.button.operating').d('操作记录')}
        </Button>
      );
    },
  },
  {
    name: 'evalNum',
    width: 140,
    renderer: ({ value, record }) => {
      const { data: { evalTplId, evalHeaderId, evalGranularity, createPage } = {} } = record;
      const newPage = createPage === 'ASSESS'; // 新菜单
      const pathname = newPage
        ? `/sslm/appraisal-purchaser/detail/${evalTplId}/${evalHeaderId}/${evalGranularity}/read`
        : `/sslm/evaluation-query/detail/${evalHeaderId}?evalGranularity=${evalGranularity}`;
      return <Link to={pathname}>{value}</Link>;
    },
  },
  {
    name: 'reEvalNum',
    width: 140,
    renderer: ({ record }) => (
      <a onClick={() => jumpDetail({ record })}> {record.get('evalNum')}</a>
    ),
  },
  {
    name: 'evalName',
    width: 150,
  },
  {
    name: 'lineScore',
    width: 100,
  },
  {
    name: 'checkCollectScore',
    width: 100,
  },
  {
    name: 'evalCycle',
    width: 80,
    renderer: ({ record }) => record.get('evalCycleMeaning'),
  },
  {
    name: 'evalDate',
    width: 180,
    renderer: ({ record }) => {
      const { evalDateFrom, evalDateTo } = record.get(['evalDateFrom', 'evalDateTo']);
      return rangeDateRender(evalDateFrom, evalDateTo, DEFAULT_DATE_FORMAT);
    },
  },
];

export { evaluationDS, evaluationColumns };
