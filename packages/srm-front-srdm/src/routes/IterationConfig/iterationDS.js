import intl from 'utils/intl';
import { getPlatformVersionApi } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

function getIterationDS() {
  return {
    autoQuery: true,
    fields: [
      {
        type: 'string',
        name: 'iterationNum',
        label: intl.get('srdm.iteration.model.iterationNum').d('迭代编号'),
        required: true,
      },
      {
        type: 'string',
        name: 'iterationName',
        label: intl.get('srdm.iteration.model.iterationName').d('迭代名称'),
        required: true,
      },
      {
        type: 'string',
        name: 'iterationDesc',
        label: intl.get('srdm.iteration.model.iterationDesc').d('迭代备注'),
      },
      {
        type: 'string',
        name: 'openDate',
        label: intl.get('srdm.iteration.model.openDateFrom').d('迭代开启时间'),
      },
      {
        type: 'string',
        name: 'sealingDate',
        label: intl.get('srdm.iteration.model.sealingDateFrom').d('迭代封版时间'),
      },
      {
        type: 'string',
        name: 'publishDate',
        label: intl.get('srdm.iteration.model.publishDateFrom').d('迭代发布时间'),
      },
      {
        type: 'number',
        name: 'enabledFlag',
        label: intl.get('hzero.common.status.isEnable').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        required: true,
        defaultValue: 1,
      },
      {
        type: 'string',
        name: 'iterationStatus',
        label: intl.get('hzero.common.status').d('状态'),
        lookupCode: 'SRDM.ITERATION_STATUS',
      },
      {
        type: 'date',
        name: 'directSyncEndDate',
        label: '直接同步截止时间',
        format: 'YYYY-MM-DD HH:mm:ss',
      },
      {
        type: 'number',
        name: 'iterationId',
      },
      {
        type: 'object',
        name: 'nextIterationObject',
        label: intl.get('srdm.iteration.model.nextIterationId').d('选择后继版本'),
        lookupCode: 'SRDM.ITERATION_NEW',
        textField: 'iterationNum',
        valueField: 'iterationId',
        ignore: 'always',
      },
      {
        type: 'number',
        name: 'nextIterationId',
        bind: 'nextIterationObject.iterationId',
      },
      {
        type: 'string',
        name: 'sealingDesc',
        label: intl.get('srdm.iteration.model.sealingDesc').d('封版备注'),
      },
      {
        type: 'string',
        name: 'environmentCode',
        label: intl.get('hpdm.data-distribute.model.environmentCode').d('环境名称'),
        valueField: `environmentCode`,
        textField: `environmentName`,
        lookupAxiosConfig: () => ({
          method: 'GET',
          url: `${HZERO_SRDM}/v1/application-envs?page=0&size=2000&prodFlag=0`,
        }),
      },
    ],
    queryFields: [
      {
        type: 'string',
        name: 'iterationNum',
        label: intl.get('srdm.iteration.model.iterationNum').d('迭代编号'),
      },
      {
        type: 'string',
        name: 'iterationName',
        label: intl.get('srdm.iteration.model.iterationName').d('迭代名称'),
      },
      {
        type: 'string',
        name: 'iterationStatus',
        label: intl.get('hzero.common.status').d('状态'),
        lookupCode: 'SRDM.ITERATION_STATUS',
      },
      {
        type: 'dateTime',
        range: ['start', 'end'],
        name: 'openDate',
        label: intl.get('srdm.iteration.model.openDateFrom').d('迭代开启时间'),
        ignore: 'always',
      },
      {
        type: 'string',
        name: 'openDateFrom',
        bind: 'openDate.start',
      },
      {
        type: 'string',
        name: 'openDateTo',
        bind: 'openDate.end',
      },
      {
        type: 'dateTime',
        range: ['start', 'end'],
        name: 'sealingDate',
        label: intl.get('srdm.iteration.model.sealingDateFrom').d('迭代封版时间'),
        ignore: 'always',
      },
      {
        type: 'string',
        name: 'sealingDateFrom',
        bind: 'sealingDate.start',
      },
      {
        type: 'string',
        name: 'sealingDateTo',
        bind: 'sealingDate.end',
      },
      {
        type: 'dateTime',
        range: ['start', 'end'],
        name: 'publishDate',
        label: intl.get('srdm.iteration.model.publishDateFrom').d('迭代发布时间'),
        ignore: 'always',
      },
      {
        type: 'string',
        name: 'publishDateFrom',
        bind: 'publishDate.start',
      },
      {
        type: 'string',
        name: 'publishDateTo',
        bind: 'publishDate.end',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_SRDM}/v1/${getPlatformVersionApi('iteration')}`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          data,
          url: `${HZERO_SRDM}/v1/${getPlatformVersionApi('iteration')}`,
          method: 'POST',
        };
      },
      update: ({ data }) => {
        return {
          data,
          url: `${HZERO_SRDM}/v1/${getPlatformVersionApi('iteration')}`,
          method: 'POST',
        };
      },
    },
  };
}

export { getIterationDS };
