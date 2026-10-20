import React from 'react';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

const evaluationDS = () => ({
  pageSize: 20,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      label: intl.get(`sslm.evaluationQuery.model.archive.status`).d('档案状态'),
      name: 'evalStatus',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.archive.num`).d('档案编码'),
      name: 'evalNum',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.archive.num`).d('档案编码'),
      name: 'evalNumRe',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.archive.describe`).d('档案描述'),
      name: 'evalName',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.evaluation.template`).d('考评模板'),
      name: 'evalTplName',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.exam.method`).d('考评方式'),
      name: 'kpiMethod',
      lookupCode: 'SSLM.KPI_EVAL_METHOD',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.evaluation.cycle`).d('考评周期'),
      name: 'evalCycle',
    },
    {
      name: 'evalDate',
      type: 'date',
      ignore: 'always',
      range: ['evalDateFrom', 'evalDateTo'],
      label: intl.get('sslm.common.model.evaluation.evalDate').d('考评日期'),
      transformResponse: (value, data) => {
        if (data.evalDateFrom) {
          return {
            evalDateFrom: data.evalDateFrom,
            evalDateTo: data.evalDateTo,
          };
        } else {
          return null;
        }
      },
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.evaluation.dimension`).d('考评维度'),
      name: 'evalDimension',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.dimension.value`).d('维度值'),
      name: 'evalDimensionValue',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.evaluation.level`).d('评分等级'),
      name: 'levelCodes',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.calibration.level`).d('校准等级'),
      name: 'checkLevelDesc',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.evaluation.charger`).d('考评负责人'),
      name: 'processUserName',
    },
    {
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.evaluationDepart`)
        .d('考评负责人部门'),
      name: 'processUnitName',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.archive.create.time`).d('建档时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.archive.lineScore`).d('得分'),
      name: 'lineScore',
    },
    {
      label: intl.get(`sslm.evaluationQuery.model.archive.checkCollectScore`).d('校准得分'),
      name: 'checkCollectScore',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params = {}, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-headers/result/life/purchase`,
        method: 'GET',
        data: filterNullValueObject({ ...params, ...other }),
      };
    },
  },
});

const evaluationColumns = ({ jumpEvaluation }) => [
  {
    name: 'evalStatus',
    width: 100,
    renderer: renderStatus,
  },
  {
    name: 'evalNum',
    width: 140,
    renderer: ({ value, record }) => {
      return <a onClick={() => jumpEvaluation(record)}>{value}</a>;
    },
  },
  {
    name: 'evalNumRe',
    width: 140,
    renderer: ({ record }) => {
      return <a onClick={() => jumpEvaluation(record, true)}>{record.get('evalNum')}</a>;
    },
  },
  {
    name: 'evalName',
    width: 200,
  },
  {
    name: 'evalTplName',
    width: 200,
  },
  {
    name: 'kpiMethod',
    width: 100,
  },
  {
    name: 'evalCycle',
    width: 100,
    renderer: ({ record }) => record.get('evalCycleMeaning'),
  },
  {
    name: 'evalDate',
    width: 180,
  },
  {
    name: 'evalDimension',
    width: 100,
    renderer: ({ record }) => record.get('evalDimensionMeaning'),
  },
  {
    name: 'evalDimensionValue',
    width: 200,
    renderer: ({ record }) => record.get('evalDimensionValueMeaning'),
  },
  {
    name: 'levelCodes',
    width: 120,
  },
  {
    name: 'checkLevelDesc',
    width: 120,
  },
  {
    name: 'lineScore',
    width: 100,
  },
  {
    name: 'checkCollectScore',
    width: 100,
  },
  {
    name: 'processUserName',
    width: 150,
  },
  {
    name: 'processUnitName',
    width: 150,
  },
  {
    name: 'creationDate',
    width: 150,
    renderer: ({ value }) => dateTimeRender(value),
  },
];

export { evaluationDS, evaluationColumns };
