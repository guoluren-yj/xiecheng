import React from 'react';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { renderStatus } from '@/routes/components/utils';

import { approveExecutiveRender } from '../Components/utils';

const organizationId = getCurrentOrganizationId();

const viewDetail = ({ record }) => {
  const { rfxStatus, progresses } =
    record.get(['rfxStatus', 'evaluateLeaderFlag', 'evaluateExperts', 'progresses']) || {};
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
    case 'RELEASE_REJECTED': // 	发布审批拒绝
    case 'CHECK_REJECTED': // 核价审批拒绝
    case 'PRE_EVALUATION_PENDING_REJECT': // 中标候选人拒绝
      mean = approveExecutiveRender({ record });
      break;
    case 'NEW': // 新建
    case 'ROUNDED': // 再次询价
    case 'CLOSED': // 关闭
    case 'CANCELED': // 取消
      mean = '';
      break;
    default:
      break;
  }
  return mean;
};

const bidDS = () => ({
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
      label: intl.get('ssrc.bidHall.model.bidHall.bidNum').d('BID单号'),
    },
    {
      name: 'rfxTitle',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.Title').d('标题'),
    },
    {
      name: 'viewDetail',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.implementation').d('执行情况'),
    },
    {
      name: 'approvalMessage',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.approvalMessage').d('拒绝理由'),
    },
    {
      name: 'quotationStartDate',
      type: 'dateTime',
      label: intl.get(`ssrc.bidHall.model.bidHall.quotationStartTime`).d('投标开始时间'),
    },
    {
      name: 'quotationEndDate',
      type: 'dateTime',
      label: intl.get(`ssrc.bidHall.model.bidHall.quotationEndDate`).d('投标截止时间'),
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
      name: 'prequalEndDate',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.applicationDeadTime').d('预审截止'),
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
      name: 'creationDate',
      type: 'date',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const {
        params: { companyId, supplierCompanyId, customizeUnitCode, secondarySourceCategory } = {},
        ...other
      } = data;
      return {
        url: `${SRM_SSRC}/v2/${organizationId}/rfx/list/all`,
        method: 'GET',
        data: filterNullValueObject({
          secondarySourceCategory,
          companyIdForSupplierService: companyId,
          supplierCompanyId,
          customizeUnitCode,
          ...other,
        }),
      };
    },
  },
});

const bidColumns = ({ bidDetail, isPub }) => [
  {
    name: 'rfxStatusMeaning',
    width: 120,
    renderer: renderStatus,
  },
  {
    name: 'rfxNum',
    width: 150,
    renderer: ({ value, record }) =>
      isPub ? value : <a onClick={() => bidDetail(record)}>{value}</a>,
  },
  {
    name: 'rfxTitle',
    width: 160,
  },
  {
    name: 'viewDetail',
    width: 200,
    renderer: viewDetail,
  },
  {
    name: 'approvalMessage',
    width: 160,
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
    name: 'companyName',
    width: 160,
  },
  {
    name: 'purOrganizationName',
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
    name: 'createdByName',
    width: 100,
  },
  {
    name: 'createdUnitName',
    width: 156,
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
    name: 'creationDate',
    width: 176,
  },
];

export { bidDS, bidColumns };
