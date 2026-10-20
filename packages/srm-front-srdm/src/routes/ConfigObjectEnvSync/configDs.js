import { HZERO_SRDM } from '@/common/config';

export default function getConfigDS(groupId, env, autoQuery = true) {
  return {
    autoQuery,
    queryFields: [
      {
        type: 'string',
        name: 'objectCode',
        label: '配置对象编码',
      },
      {
        type: 'string',
        name: 'tableName',
        label: '表名',
      },
      {
        type: 'string',
        name: 'displayFieldValue',
        label: '数据别名',
      },
      {
        type: 'string',
        name: 'uniqueValue',
        label: '唯一性组合',
      },
      {
        type: 'number',
        name: 'enabledFlag',
        lookupCode: 'HPDM.Y_N_FLAG',
        label: '是否启用',
      },
      env !== 'dev' && {
        type: 'string',
        name: env === 'test' ? 'testMigrateBehaviour' : 'prodMigrateBehaviour',
        lookupCode: 'SRDM.MIGRATE_TYPE',
        label: '迁移行为',
      },
      {
        type: 'string',
        name: 'lastUpdatedUserRealName',
        label: '最后更新人(srm开头账号)',
      },
    ],
    fields: [
      {
        type: 'string',
        name: 'objectCode',
        label: '配置对象编码',
      },
      {
        type: 'string',
        name: 'tableName',
        label: '表名',
      },
      {
        type: 'string',
        name: 'displayFieldValue',
        label: '数据别名',
      },
      {
        type: 'string',
        name: 'uniqueValue',
        label: '唯一性组合',
      },
      {
        type: 'string',
        name: 'sourceTenantNum',
        label: '数据所属租户',
      },
      {
        type: 'number',
        name: 'enabledFlag',
        lookupCode: 'HPDM.Y_N_FLAG',
        label: '是否启用',
      },
      {
        type: 'string',
        name: env === 'test' ? 'testMigrateBehaviour' : 'prodMigrateBehaviour',
        lookupCode: 'SRDM.MIGRATE_TYPE',
        label: '迁移行为',
      },
      {
        type: 'string',
        name: 'lastUpdatedUserRealName',
        label: '更新人',
      },
      {
        type: 'string',
        name: 'updateDateValue',
        label: '更新时间',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_SRDM}/v1/data-migrate-recs/public-data/list?targetEnv=${env || 'dev'}`,
          method: 'POST',
          data: { ...data, groupId },
        };
      },
    },
  };
}
