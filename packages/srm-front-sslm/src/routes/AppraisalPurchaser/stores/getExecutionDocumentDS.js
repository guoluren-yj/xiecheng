/*
 * @Date: 2023-12-19 10:14:47
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import qs from 'querystring';
import { Link } from 'dva/router';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';

const tenantId = getCurrentOrganizationId();

// 升降级ds
export const getRelegationDs = ({ evalLineId }) => ({
  selection: false,
  autoQuery: true,
  pageSize: 20,
  fields: [
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'processStatusMeaning',
    },
    {
      label: intl.get('sslm.siteInvestigateReport.modal.mange.orderNum').d('单据编号'),
      name: 'documentNumber',
    },
    {
      name: 'fromStageDescription',
      label: intl.get('sslm.common.view.sourceStage').d('起始阶段'),
    },
    {
      name: 'toStageDescription',
      label: intl.get('sslm.common.view.targetStage').d('目标阶段'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/life-cycle-reqss/eval-manage/query/${evalLineId}`,
      method: 'GET',
    },
  },
});
// 升降级columns
export const getRelegationColumns = () => [
  {
    name: 'processStatusMeaning',
    renderer: renderStatus,
  },
  {
    name: 'documentNumber',
    renderer: ({ record, value }) => {
      const { readPath, requisitionId, documentType, lifeCycleId, supplierCompanyId } =
        record?.get([
          'readPath',
          'requisitionId',
          'documentType',
          'lifeCycleId',
          'supplierCompanyId',
        ]) || {};
      const params = documentType
        ? { requisitionId, documentType }
        : { lifeCycleId, supplierCompanyId };
      const path = documentType
        ? `/sslm/life-cycle-manage/read?${qs.stringify(params)}`
        : `${readPath}?${qs.stringify(params)}`;
      return <Link to={path}>{value}</Link>;
    },
  },
  {
    name: 'fromStageDescription',
  },
  {
    name: 'toStageDescription',
  },
];

// 质量整改ds
export const getRectificationDs = ({ supplierId, evalHeaderId }) => ({
  selection: false,
  autoQuery: true,
  pageSize: 20,
  fields: [
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'problemStatusMeaning',
    },
    {
      label: intl.get('sslm.siteInvestigateReport.modal.mange.orderNum').d('单据编号'),
      name: 'problemNum',
    },
    {
      label: intl.get('sslm.siteInvestigateReport.modal.mange.problemTitle').d('整改报告标题'),
      name: 'problemTitle',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/site_eval_external_orders/eval-manage/${evalHeaderId}/${supplierId}`,
      method: 'GET',
    },
  },
});
// 质量整改columns
export const getRectificationColumns = () => [
  {
    name: 'problemStatusMeaning',
    renderer: renderStatus,
  },
  {
    name: 'problemNum',
    renderer: ({ value, record }) => {
      const { problemHeaderId } = record?.get(['problemHeaderId']) || {};
      return <Link to={`/sqam/initiated8D/detail/${problemHeaderId}`}>{value}</Link>;
    },
  },
  {
    name: 'problemTitle',
  },
];
