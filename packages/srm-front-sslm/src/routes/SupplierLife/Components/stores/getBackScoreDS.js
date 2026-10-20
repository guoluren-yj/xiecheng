import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getBackScoreDS = (params) => ({
  autoQuery: true,
  cacheSelection: true,
  autoLocateFirst: false,
  dataToJSON: 'selected',
  primaryKey: 'scorerLineId',
  queryFields: [
    {
      name: 'indicateId',
      type: 'object',
      lovCode: 'SSLM.TEMPLATE_INDICATOR',
      lovPara: {
        tenantId: organizationId,
        evalTplId: params.templateId,
      },
      label: intl.get(`sslm.commonApplication.model.commonApplication.description`).d('评价项目'),
      transformRequest: (value) => value && value.indicatorId,
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
      transformRequest: (value) => value && value.userId,
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
      name: 'processStatusMeaning',
      label: intl.get(`sslm.commonApplication.model.commonApplication.procStatus`).d('评分状态'),
    },
    {
      name: 'respUserName',
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
  ],
  transport: {
    read: ({ data }) => {
      const { stageCode, requisitionId } = params;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/life-cycle/score/${requisitionId}/query`,
        method: 'GET',
        data: filterNullValueObject({ ...data, stageCode, requisitionId }),
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
    name: 'processStatusMeaning',
    width: 80,
  },
  {
    name: 'respUserName',
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
];

export { getBackScoreDS, backScoreColumns };
