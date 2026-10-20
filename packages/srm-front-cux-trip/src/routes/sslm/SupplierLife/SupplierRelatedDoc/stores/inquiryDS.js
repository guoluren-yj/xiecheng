import React from 'react';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderStatus } from 'srm-front-sslm/lib/routes/components/utils';

const organizationId = getCurrentOrganizationId();

const viewDetail = ({ record }) => {
  const { data: { rfxStatus, progresses, approvalMessage, createFlag } = {} } = record;
  const currentProgress = progresses && progresses.find(item => item.isCurrentFlag === 1);
  let mean;

  switch (rfxStatus) {
    case 'SCORING':
      mean = <span>{currentProgress && currentProgress.progressNameMeaning}</span>;
      break;
    case 'PAUSED':
      mean = intl.get('ssrc.inquiryHall.model.inquiryHall.pause').d('暂停中');
      break;
    case 'RELEASE_APPROVING': // 发布审批中
    case 'PRE_EVALUATION_APPROVING': // 中标候选人审批中
    case 'CHECK_APPROVING': // 	核价审批中
      mean = intl.get('ssrc.inquiryHall.model.inquiryHall.approvaling').d('审批中');
      break;
    case 'NEW': // 新建
    case 'ROUNDED': // 再次询价
    case 'CLOSED': // 关闭
    case 'CANCELED': // 取消
      mean = '';
      break;
    case 'RELEASE_REJECTED': // 	发布审批拒绝
      mean = createFlag ? approvalMessage : '';
      break;
    default:
      break;
  }
  return mean;
};

const inquiryDS = () => ({
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'rfxStatusMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.view.status').d('状态'),
    },
    {
      name: 'rfxNum',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.RFXNo.').d('RFX单号'),
    },
    {
      name: 'rfxTitle',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.Title').d('标题'),
    },
    {
      name: 'templateName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingTemplate').d('寻源模板'),
    },
    {
      name: 'sourceCategoryMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingCategory').d('寻源类别'),
    },
    {
      name: 'sourceMethodMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingApproach').d('寻源方式'),
    },
    {
      name: 'sourceProjectName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourceProject').d('寻源项目'),
    },
    {
      name: 'sectionName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionName').d('标段名称'),
    },
    {
      name: 'viewDetail',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.implementation').d('执行情况'),
    },
    {
      name: 'quotationStartDate',
      type: 'date',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationStart`).d('报价开始'),
    },
    {
      name: 'quotationEndDate',
      type: 'date',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadTime`).d('报价截止'),
    },
    {
      name: 'prequalEndDate',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.applicationDeadTime').d('预审截止'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`sslm.common.view.company.name`).d('公司'),
    },
    {
      name: 'purOrganizationName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`sslm.common.view.creator.name`).d('创建人'),
    },
    {
      name: 'createdUnitName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.createdUnitName`).d('创建人部门'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params: { supplierCompanyId, customizeUnitCode } = {}, ...other } = data;
      return {
        url: `${SRM_SSRC}/v2/${organizationId}/rfx/list/all`,
        method: 'GET',
        data: filterNullValueObject({
          supplierCompanyId,
          customizeUnitCode,
          ...other,
        }),
      };
    },
  },
});

const inquiryColumns = ({ inquiryDetail, isPub }) => [
  {
    name: 'rfxStatusMeaning',
    width: 120,
    renderer: renderStatus,
  },
  {
    name: 'rfxNum',
    width: 150,
    renderer: ({ value, record }) =>
      isPub ? value : <a onClick={() => inquiryDetail(record)}>{value}</a>,
  },
  {
    name: 'rfxTitle',
    width: 160,
  },
  {
    name: 'templateName',
    width: 156,
  },
  {
    name: 'sourceCategoryMeaning',
    width: 116,
  },
  {
    name: 'sourceMethodMeaning',
    width: 136,
  },
  {
    name: 'sourceProjectName',
    width: 156,
    hiddenInAggregation: record => {
      return !record.get('sourceProjectName');
    },
  },
  {
    name: 'sectionName',
    width: 156,
    hiddenInAggregation: record => {
      return !record.get('sectionName');
    },
  },
  {
    name: 'viewDetail',
    width: 100,
    renderer: viewDetail,
  },
  {
    name: 'quotationStartDate',
    width: 160,
  },
  {
    name: 'quotationEndDate',
    width: 160,
  },
  {
    name: 'prequalEndDate',
    width: 160,
    hiddenInAggregation: record => {
      return !record.get('prequalEndDate');
    },
  },
  {
    name: 'companyName',
    width: 160,
  },
  {
    name: 'purOrganizationName',
    width: 160,
  },
  {
    name: 'createdByName',
    width: 100,
  },
  {
    name: 'createdUnitName',
    width: 156,
  },
  {
    name: 'creationDate',
    width: 176,
  },
];

export { inquiryDS, inquiryColumns };
