/*
 * @Date: 2023-12-20 10:40:53
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isNil } from 'lodash';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { SRM_SSLM, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { bucketDirectory } from '@/routes/utils/utils';

const tenantId = getCurrentOrganizationId();

// 评分完成情况ds
export const getScoreStatusDs = ({ evalDtlId }) => ({
  selection: false,
  paging: false,
  autoQuery: true,
  fields: [
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.loginName`).d('评分人账户'),
      name: 'loginName',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.graderDesc`).d('评分人描述'),
      name: 'userName',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeightPrec`).d('权重%'),
      name: 'respWeight',
      type: 'number',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.defaultScore`).d('缺省分值'),
      name: 'defaultScore',
      type: 'number',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.isStandard`).d('符合评分标准'),
      name: 'isStandard',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.isVeto`).d('否决该项'),
      name: 'isVeto',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.archiveFilled.indOptName').d('评分选项'),
      name: 'indOptName',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.score`).d('得分'),
      name: 'score',
      type: 'number',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.respWeightScore`).d('评分人权重得分'),
      name: 'respWeightScore',
      type: 'number',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.feedbackDescription`).d('反馈备注'),
      name: 'feedback',
    },
    {
      name: 'scorerAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.appraisal,
      label: intl.get('hzero.common.upload.modal.title').d('附件'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-dtl-resps/${evalDtlId}`,
      method: 'GET',
    },
  },
});

// 评分完成情况columns
export const getScoreStatusColumns = () => [
  {
    name: 'loginName',
    width: 120,
  },
  {
    name: 'userName',
    width: 120,
  },
  {
    name: 'respWeight',
    width: 100,
  },
  {
    name: 'defaultScore',
    width: 100,
  },
  {
    name: 'isStandard',
    width: 120,
    renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
  },
  {
    name: 'isVeto',
    width: 100,
    renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
  },
  {
    name: 'indOptName',
    width: 100,
  },
  {
    name: 'score',
    width: 80,
  },
  {
    name: 'respWeightScore',
    width: 130,
  },
  {
    name: 'feedback',
    width: 100,
  },
  {
    width: 120,
    name: 'scorerAttachmentUuid',
  },
];

// 系统计算评分情况ds
export const getSystemStatusDs = ({ evalDtlId }) => ({
  autoQuery: true,
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'paramDescription',
      label: intl.get('sslm.common.model.evalDocManage.paramName').d('参数名称'),
    },
    {
      name: 'paramValue',
      label: intl.get('sslm.common.model.evalDocManage.calculatedValue').d('计算值'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/kpi-eval-processs/${evalDtlId}`,
      method: 'GET',
    },
  },
});

// 系统计算评分情况columns
export const getSystemStatusColumns = () => [
  {
    name: 'paramDescription',
  },
  {
    name: 'paramValue',
  },
];
