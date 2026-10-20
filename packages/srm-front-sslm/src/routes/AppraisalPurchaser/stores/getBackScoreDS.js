/*
 * @Date: 2023-12-05 11:24:27
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { renderStatus } from '@/routes/components/utils';

const tenantId = getCurrentOrganizationId();

// 退回评分ds
export const getBackScoreDs = evalHeaderId => ({
  cacheSelection: true,
  autoLocateFirst: false,
  dataToJSON: 'selected',
  primaryKey: 'evalDtlRespId',
  pageSize: 20,
  fields: [
    {
      name: 'completeFlagMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'indicatorCode',
      label: intl
        .get(`sslm.commonApplication.model.commonApplication.indicateCode`)
        .d('评价项目编号'),
    },
    {
      name: 'indicatorName',
      label: intl.get(`sslm.commonApplication.model.commonApplication.description`).d('评价项目'),
    },
    {
      name: 'evalStandard',
      label: intl.get(`sslm.commonApplication.model.commonApplication.evalStandard`).d('评分标准'),
    },
    {
      name: 'supplierNum',
      label: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
    },
    {
      name: 'supplierName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
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
      label: intl.get(`sslm.common.view.scorer`).d('评分人'),
    },
    {
      name: 'respWeight',
      type: 'number',
      label: intl.get(`sslm.common.view.weight`).d('权重（%）'),
    },
    {
      name: 'score',
      type: 'number',
      label: intl.get('sslm.commonApplication.view.message.score').d('得分'),
    },
    {
      name: 'backReason',
      label: intl.get('sslm.commonApplication.model.message.backReason').d('退回原因'),
      dynamicProps: ({ dataSet }) => {
        if (dataSet.isAllPageSelection) {
          return {
            disabled: dataSet.isAllPageSelection,
          };
        }
      },
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/eval-dtl-resps/${evalHeaderId}/batch-query-post`,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode: 'SSLM.APPRAISAL_PURCHASER_DETAIL.BACK_SCORE_SEARCH',
        },
      };
    },
  },
});

// 退回评分Columns
export const getBackScoreColumns = granularity => [
  {
    name: 'completeFlagMeaning',
    width: 80,
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
    name: 'evalStandard',
    width: 150,
  },
  {
    name: 'supplierNum',
    width: 120,
  },
  {
    name: 'supplierName',
    width: 150,
  },
  ...(granularity === 'SU+CA'
    ? [
        {
          name: 'categoryName',
          width: 150,
        },
      ]
    : granularity === 'SU+IT'
    ? [
        {
          name: 'itemName',
          width: 150,
        },
      ]
    : []),
  {
    name: 'userName',
    width: 100,
  },
  {
    name: 'respWeight',
    width: 100,
  },
  {
    name: 'score',
    width: 70,
  },
  {
    name: 'backReason',
    width: 150,
    editor: true,
    lock: 'right',
  },
];
