/*
 * getTransferDS - 评分人转交ds
 * @Date: 2023-12-05 14:29:22
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { renderStatus } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

// 评分人转交ds
export const getTransferDs = evalHeaderId => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  primaryKey: 'evalDtlRespId',
  pageSize: 20,
  fields: [
    {
      name: 'completeFlagMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'indicatorCode',
      label: intl.get('sslm.supplierDocManage.modal.graderTransfer.projectNum').d('评价项目编号'),
    },
    {
      name: 'indicatorName',
      label: intl.get('sslm.supplierDocManage.modal.graderTransfer.project').d('评价项目'),
    },
    {
      name: 'supplierNum',
      label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
    },
    {
      name: 'supplierName',
      label: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
    },
    {
      name: 'categoryName',
      label: intl.get(`sslm.supplierDocManage.view.docManage.categoryName`).d('参评品类'),
    },
    {
      name: 'itemName',
      label: intl.get(`sslm.supplierDocManage.view.docManage.itemName`).d('参评物料'),
    },
    {
      name: 'userName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.evaluationPerson`).d('评分人'),
    },
    {
      name: 'respWeight',
      label: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeightPrec`).d('权重%'),
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/${evalHeaderId}/batch-query-transform`,
        method: 'POST',
        params: { ...params, customizeUnitCode: 'SSLM.APPRAISAL_PURCHASER_DETAIL.TRANSFER_SEARCH' },
      };
    },
  },
});

// 评分人转交columns
export const getTransferColumns = granularity =>
  [
    {
      name: 'completeFlagMeaning',
      width: 100,
      renderer: renderStatus,
    },
    {
      name: 'indicatorCode',
      width: 150,
    },
    {
      name: 'indicatorName',
      width: 150,
    },
    {
      name: 'supplierNum',
      width: 140,
    },
    {
      name: 'supplierName',
      width: 200,
    },
    granularity === 'SU+CA' && {
      name: 'categoryName',
      width: 150,
    },
    granularity === 'SU+IT' && {
      name: 'itemName',
      width: 150,
    },
    {
      name: 'userName',
      width: 100,
    },
    {
      name: 'respWeight',
      width: 100,
    },
  ].filter(Boolean);

// 分配评分人ds
export const getScorerDS = ({ weightSameFlag, averageFlag }) => ({
  paging: false,
  fields: [
    {
      name: 'userLov',
      type: 'object',
      required: true,
      ignore: 'always',
      lovCode: 'SSLM.KPI_CHOOSE_USER',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.supplierDocManage.model.docManage.scoreUser').d('评分用户'),
    },
    {
      name: 'respUserId',
      bind: 'userLov.userId',
    },
    {
      name: 'userName',
      bind: 'userLov.userName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.userName`).d('评分用户描述'),
    },
    {
      name: 'respWeight',
      type: 'number',
      required: !averageFlag && weightSameFlag,
      label: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeight`).d('权重'),
    },
  ],
});

// 分配评分人columns
export const getScorerColumns = ({ weightSameFlag, averageFlag }) => [
  {
    name: 'userLov',
    editor: true,
  },
  {
    name: 'userName',
  },
  {
    name: 'respWeight',
    editor: !averageFlag && weightSameFlag,
  },
];
