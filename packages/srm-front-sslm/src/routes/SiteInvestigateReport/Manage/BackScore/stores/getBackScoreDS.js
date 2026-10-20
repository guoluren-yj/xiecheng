import React from 'react';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getBackScoreDS = params => ({
  autoQuery: true,
  cacheSelection: true,
  autoLocateFirst: false,
  dataToJSON: 'selected',
  primaryKey: 'evalLineRespId',
  queryFields: [
    {
      name: 'indicatorId',
      type: 'object',
      lovCode: 'SSLM.SITE_EVAL_INDICATOR',
      lovPara: {
        tenantId: organizationId,
        evalHeaderId: params.headerId,
      },
      label: intl.get(`sslm.commonApplication.model.commonApplication.description`).d('评价项目'),
      transformRequest: value => value && value.indicatorId,
    },
    {
      name: 'userId',
      type: 'object',
      lovCode: 'SSLM.KPI_USER',
      textField: 'userName',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get(`sslm.common.view.scorer`).d('评分人'),
      transformRequest: value => value && value.userId,
    },
  ],
  fields: [
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
      name: 'completeFlag',
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
    read: ({ data }) => {
      const { headerId } = params;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/${headerId}/batch-query`,
        method: 'GET',
        data: filterNullValueObject({ ...data }),
      };
    },
  },
});

const backScoreColumns = () => [
  {
    name: 'indicatorCode',
    width: 150,
  },
  {
    name: 'indicatorName',
    width: 150,
  },
  {
    name: 'completeFlag',
    width: 80,
    renderer: ({ value }) => (
      <span>
        {+value === 1
          ? intl.get('sslm.common.model.status.submitted').d('已提交')
          : value === 4
          ? intl.get('sslm.common.model.status.giveUp').d('已放弃')
          : value}
      </span>
    ),
  },
  {
    name: 'userName',
    width: 120,
  },
  {
    name: 'respWeight',
    width: 110,
  },
  {
    name: 'score',
    width: 70,
  },
  {
    name: 'backReason',
    width: 120,
    editor: true,
  },
];

export { getBackScoreDS, backScoreColumns };
