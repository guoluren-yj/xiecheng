import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { renderStatus } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

const getBackScoreDS = params => ({
  cacheSelection: true,
  autoLocateFirst: false,
  dataToJSON: 'selected',
  primaryKey: 'evalLineRespId',
  pageSize: 20,
  // queryFields: [
  //   {
  //     name: 'indicatorId',
  //     type: 'object',
  //     lovCode: 'SSLM.SITE_EVAL_INDICATOR',
  //     lovPara: {
  //       tenantId: organizationId,
  //       evalHeaderId: params.headerId,
  //     },
  //     label: intl.get(`sslm.commonApplication.model.commonApplication.description`).d('评价项目'),
  //     transformRequest: value => value && value.indicatorId,
  //   },
  //   {
  //     name: 'userId',
  //     type: 'object',
  //     lovCode: 'SSLM.KPI_USER',
  //     textField: 'userName',
  //     lovPara: {
  //       tenantId: organizationId,
  //     },
  //     label: intl.get(`sslm.common.view.scorer`).d('评分人'),
  //     transformRequest: value => value && value.userId,
  //   },
  // ],
  fields: [
    {
      name: 'indicatorCode',
      label: intl
        .get(`sslm.purchaserEvaluationDetail.table.column.label.indicatorCode`)
        .d('评估项目代码'),
    },
    {
      name: 'indicatorName',
      label: intl
        .get(`sslm.purchaserEvaluationDetail.table.column.label.indicatorName`)
        .d('评估项目名称'),
    },
    {
      name: 'completeFlag',
      lookupCode: 'SSLM.EVAL_COMPLETE_STATUS',
      label: intl.get(`sslm.commonApplication.model.commonApplication.procStatus`).d('评分状态'),
    },
    {
      name: 'userName',
      label: intl.get(`sslm.common.view.scorer`).d('评分人'),
    },
    {
      name: 'respWeight',
      label: intl.get(`sslm.common.view.weight`).d('权重（%）'),
    },
    {
      name: 'score',
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
    read: ({ data, params: dsParams }) => {
      const { headerId, searchCode = '' } = params;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/${headerId}/batch-query`,
        method: 'GET',
        params: {
          ...dsParams,
          customizeUnitCode: searchCode,
        },
        data: filterNullValueObject({ ...data }),
      };
    },
  },
});

const backScoreColumns = () => [
  {
    name: 'completeFlag',
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
    name: 'userName',
    width: 120,
  },
  {
    name: 'respWeight',
    width: 110,
    align: 'right',
  },
  {
    name: 'score',
    width: 70,
    align: 'right',
  },
  {
    name: 'backReason',
    width: 120,
    editor: true,
  },
];

export { getBackScoreDS, backScoreColumns };
