import { HZERO_SRDM } from '@/common/config';

export default function getConfigCompareDS(env, data) {
  return {
    autoQuery: true,
    paging: false,
    fields: [
      {
        type: 'string',
        name: 'tableName',
        label: '表名',
      },
      {
        type: 'string',
        name: 'uniqueCode',
        label: '唯一标识',
      },
      {
        type: 'string',
        name: 'fieldName',
        label: '字段',
      },
      {
        type: 'string',
        name: 'curValue',
        label: '来源环境值',
      },
      {
        type: 'string',
        name: 'targetEnv',
      },
      {
        type: 'string',
        name: 'targetValue',
        label: `${env === 'test' ? '测试' : '正式'}环境值`,
      },
      {
        type: 'string',
        name: 'type',
        label: '类型',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_SRDM}/v1/data-migrate-recs/source/compare/${env}`,
          method: 'POST',
          data,
        };
      },
    },
  };
}
