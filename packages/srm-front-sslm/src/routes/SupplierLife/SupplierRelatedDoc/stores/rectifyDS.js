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
import { dateRender } from 'utils/renderer';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import yanqiImg from '@/assets/yanqi.svg';
import rejectImg from '@/assets/problem_approve_reject.svg';
import { renderStatus } from '@/routes/components/utils';
import styles from '../index.less';

const prefix = `sqam.common.model.qualityRectification`;
const rejProblemStatus = ['NEW', 'ICA_SUBMITTED', 'PCA_SUBMITTED'];
const rejApprovalProblemStatus = ['PUBULISH APPROVAE REJECT', 'CANCEL FINISH APPROVAL REJECT'];
const tenantId = getCurrentOrganizationId();

const rectifyDS = () => ({
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
      label: intl.get(`${prefix}.rectifyTypeCodeMeaning`).d('整改单类型'),
      name: 'rectifyTypeCodeMeaning',
    },
    {
      label: intl.get(`sqam.common.view.common.relatedRectification`).d('关联整改报告'),
      name: 'associateProblemNums',
    },
    {
      label: intl.get(`${prefix}.validateResults`).d('验证结果'),
      name: 'validateResultFlagMeaning',
    },
    {
      label: intl.get(`${prefix}.issue`).d('问题类型'),
      name: 'problemTypeCodeMeaning',
    },
    {
      label: intl.get('entity.supplier.code').d('供应商编码'),
      name: 'supplierNum',
    },
    {
      label: intl.get('entity.supplier.name').d('供应商名称'),
      name: 'supplierName',
    },
    {
      label: intl.get('entity.company.tag').d('公司'),
      name: 'companyName',
    },
    {
      label: intl.get('entity.organization.class.inventory').d('库存组织'),
      name: 'invOrganizationName',
    },
    {
      label: intl.get('entity.item.code').d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get('entity.item.name').d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get(`${prefix}.significance`).d('重视度'),
      name: 'problemImportanceCodeMeaning',
    },
    {
      label: intl.get(`${prefix}.urgency`).d('紧急度'),
      name: 'problemUrgencyCodeMeaning',
    },
    {
      label: intl.get(`${prefix}.dataSource`).d('创建方式'),
      name: 'sourceCodeMeaning',
    },
    {
      label: intl.get(`${prefix}.sourceNum`).d('来源单据编号'),
      name: 'sourceNum',
    },
    {
      label: intl.get(`${prefix}.claimFormNum`).d('关联索赔单号'),
      name: 'claimFormNum',
    },
    {
      label: intl.get(`entity.roles.creator`).d('创建人'),
      name: 'createdName',
    },
    {
      label: intl.get('hzero.common.date.creation').d('创建日期'),
      name: 'creationDate',
      type: 'date',
    },
    {
      label: intl.get('hzero.common.date.release').d('发布日期'),
      name: 'publishedDate',
      type: 'date',
    },
    {
      label: intl.get(`${prefix}.publishedName`).d('发布人'),
      name: 'publishedName',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params = {}, ...other } = data;
      return {
        url: `${SRM_SQAM}/v1/${tenantId}/problem-headers`,
        method: 'GET',
        data: filterNullValueObject({ ...params, ...other }),
      };
    },
  },
});

// 关联整改报告DS
const rectifyReportDS = () => ({
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      label: intl.get('sqam.common.model.qualityRectification.code').d('整改报告编号'),
      name: 'problemNum',
    },
    {
      label: intl.get('sqam.common.model.qualityRectification.title').d('整改报告标题'),
      name: 'problemTitle',
    },
    {
      label: intl.get('entity.roles.creator').d('创建人'),
      name: 'createdName',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      return {
        url: `${SRM_SQAM}/v1/${tenantId}/header-associates/${dataSet.getQueryParameter(
          'problemHeaderId'
        )}/assocaite/Deliver`,
        method: 'GET',
      };
    },
  },
});

const rectifyColumns = ({ rectifyReport, isPub }) => [
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
    width: 150,
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
          {isPub ? value : <Link to={`/sqam/initiated8D/detail/${problemHeaderId}`}>{value}</Link>}
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
    width: 180,
  },
  {
    name: 'rectifyTypeCodeMeaning',
    width: 100,
  },
  {
    name: 'associateProblemNums',
    width: 120,
    renderer: ({ record }) =>
      record?.data?.associateNum ? (
        <a onClick={() => rectifyReport(record?.data?.problemHeaderId)}>
          {intl.get('sslm.common.view.message.view').d('查看')}
        </a>
      ) : (
        '-'
      ),
  },
  {
    name: 'validateResultFlagMeaning',
    width: 100,
    renderer: ({ value, record }) => {
      const { data: { problemStatus, validateResultFlag, validateFailCount } = {} } = record;
      return problemStatus === 'VALIDATED' ? (
        <div>
          {value}
          {validateResultFlag === 0 && validateFailCount > 1 && (
            <span className={styles['triangle-up-validateResult']}>
              <i className={styles.triangle} />
              <span className={styles.validateFailCount}>{validateFailCount}</span>
            </span>
          )}
        </div>
      ) : null;
    },
  },
  {
    name: 'problemTypeCodeMeaning',
    width: 100,
  },
  {
    name: 'supplierNum',
    width: 150,
  },
  {
    name: 'supplierName',
    width: 150,
  },
  {
    name: 'companyName',
    width: 150,
  },
  {
    name: 'invOrganizationName',
    width: 150,
  },
  {
    name: 'itemCode',
    width: 150,
  },
  {
    name: 'itemName',
    width: 150,
  },
  {
    name: 'problemImportanceCodeMeaning',
    width: 100,
  },
  {
    name: 'problemUrgencyCodeMeaning',
    width: 100,
  },
  {
    name: 'sourceCodeMeaning',
    width: 150,
  },
  {
    name: 'sourceNum',
    width: 150,
  },
  {
    name: 'claimFormNum',
    width: 150,
  },
  {
    name: 'createdName',
    width: 100,
  },
  {
    name: 'creationDate',
    width: 130,
    renderer: ({ value }) => dateRender(value),
  },
  {
    name: 'publishedDate',
    width: 130,
    renderer: ({ value }) => dateRender(value),
  },
  {
    name: 'publishedName',
    width: 130,
  },
];

const rectifyReportColumns = ({ isPub }) => [
  {
    name: 'problemNum',
    width: 150,
    renderer: ({ value, record }) =>
      isPub ? (
        { value }
      ) : (
        <Link to={`/sqam/initiated8D/detail/${record?.data?.associateProblemHeaderId}`}>
          {value}
        </Link>
      ),
  },
  {
    name: 'problemTitle',
  },
  {
    name: 'createdName',
    width: 150,
  },
];

export { rectifyDS, rectifyReportDS, rectifyColumns, rectifyReportColumns };
