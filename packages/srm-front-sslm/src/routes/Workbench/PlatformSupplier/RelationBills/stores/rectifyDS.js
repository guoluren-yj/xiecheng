/*
 * @Date: 2021-12-01 11:41:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Link } from 'dva/router';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import yanqiImg from '@/assets/yanqi.svg';
import rejectImg from '@/assets/problem_approve_reject.svg';
import { renderStatus } from '@/routes/components/utils';

const prefix = `sqam.common.model.qualityRectification`;
const rejProblemStatus = ['NEW', 'ICA_SUBMITTED', 'PCA_SUBMITTED'];
const rejApprovalProblemStatus = ['PUBULISH APPROVAE REJECT', 'CANCEL FINISH APPROVAL REJECT'];
const tenantId = getCurrentOrganizationId();

const rectifyDS = params => ({
  pageSize: 20,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      label: intl.get(`${prefix}.status`).d('状态'),
      name: 'problemStatusMeaning',
    },
    {
      label: intl.get(`${prefix}.code`).d('整改报告编号'),
      name: 'problemNum',
    },
    {
      label: intl.get(`${prefix}.label`).d('整改报告标题'),
      name: 'problemTitle',
    },
    {
      label: intl.get('entity.company.tag').d('公司'),
      name: 'companyName',
    },
    {
      label: intl.get(`${prefix}.rectifyTypeCodeMeaning`).d('整改单类型'),
      name: 'rectifyTypeCodeMeaning',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { companyId, supplierCompanyId } = params;
      return {
        url: `${SRM_SQAM}/v1/${tenantId}/problem-headers`,
        method: 'GET',
        data: filterNullValueObject({
          companyId,
          supplierCompanyId,
          pageEntryPoint: 'CUSTOMER_OWNED',
          customizeUnitCode:
            'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.RECTIFY_LIST,SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.RECTIFY_SEARCH_BAR',
          ...data,
        }),
      };
    },
  },
});

const rectifyColumns = () => [
  {
    name: 'problemStatusMeaning',
    width: 120,
    renderer: ({ value, name, record }) => {
      const {
        data: { problemStatus, approvalProblemStatus, approvalProblemStatusMeaning } = {},
      } = record;
      return (
        <div>
          {renderStatus({ value, name, record })}
          {rejProblemStatus.includes(problemStatus) &&
          rejApprovalProblemStatus.includes(approvalProblemStatus) ? (
            <Tooltip title={approvalProblemStatusMeaning}>
              <img style={{ marginLeft: 5 }} src={rejectImg} alt="img" />
            </Tooltip>
          ) : null}
        </div>
      );
    },
  },
  {
    name: 'problemNum',
    width: 140,
    renderer: ({ value, record }) => {
      const { data: { icaDelayDays, pcaDelayDays, problemHeaderId, problemStatus } = {} } = record;
      const newIcaDelayDays = `${intl.get(`${prefix}.icaDelayDays`).d('ICA累计延期')}/${intl
        .get(`hzero.common.date.unit.day`)
        .d('天')} : ${icaDelayDays}${intl.get(`hzero.common.date.unit.day`).d('天')}`;
      const newPcaDelayDays = `${intl.get(`${prefix}.pcaDelayDays`).d('PCA累计延期')}/${intl
        .get(`hzero.common.date.unit.day`)
        .d('天')} : ${pcaDelayDays}${intl.get(`hzero.common.date.unit.day`).d('天')}`;
      return (
        <div>
          <Link to={`/sqam/initiated8D/detail/${problemHeaderId}`}>{value}</Link>
          {['PUBLISHED', 'ICA_REJECTED', 'PCA_FEEDBACKING', 'PCA_REJECTED'].includes(
            problemStatus
          ) &&
          (icaDelayDays > 0 || pcaDelayDays > 0) ? (
            <Tooltip
              title={
                <div>
                  {icaDelayDays > 0 && <p style={{ margin: 0 }}>{newIcaDelayDays}</p>}
                  {pcaDelayDays > 0 && <p style={{ margin: 0 }}>{newPcaDelayDays}</p>}
                </div>
              }
            >
              <img src={yanqiImg} alt="img" style={{ marginLeft: '5px' }} />
            </Tooltip>
          ) : null}
        </div>
      );
    },
  },
  {
    name: 'problemTitle',
  },
  {
    name: 'companyName',
    width: 200,
  },
  {
    name: 'rectifyTypeCodeMeaning',
    width: 100,
  },
];

export { rectifyDS, rectifyColumns };
