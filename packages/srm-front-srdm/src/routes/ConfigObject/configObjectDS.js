import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { HZERO_SRDM } from '@/common/config';
import { labelTooltipRender } from '@/common/utils';

const organizationId = getCurrentOrganizationId();

function getConfigObjectDSProps() {
  return {
    autoQuery: true,
    fields: [
      {
        type: 'string',
        name: 'objectCode',
        label: intl.get('hpdm.config-object.model.objectCode').d('配置对象编码'),
      },
      {
        type: 'string',
        name: 'objectName',
        required: true,
        label: intl.get('hpdm.config-object.model.objectName').d('配置对象名称'),
      },
      {
        type: 'string',
        name: 'objectDesc',
        label: intl.get('hpdm.config-object.model.objectDesc').d('配置对象说明'),
      },
      {
        type: 'string',
        name: 'objectPriority',
        label: labelTooltipRender(
          intl.get('hpdm.config-object.model.objectPriority').d('迁移优先级'),
          intl
            .get('hpdm.config-object.help.objectPriority')
            .d(
              '多个对象迁移时，优先级值越小优先级别越高,如果无优先级请设置为 NULL,设置为空可以提高迁移性能'
            )
        ),
      },
      {
        type: 'number',
        name: 'enabledFlag',
        required: true,
        label: intl.get('hpdm.config-object.model.enabledFlag').d('启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
      },
      {
        type: 'string',
        name: 'userName',
        label: intl.get('hpdm.config-object.model.userName').d('创建人'),
      },
      {
        type: 'string',
        name: 'creationDate',
        label: intl.get('hpdm.config-object.model.creationDate').d('创建时间'),
      },
      {
        type: 'string',
        name: 'lastUpdateByName',
        label: intl.get('hpdm.config-object.model.lastUpdateByName').d('最后更新人'),
      },
      {
        type: 'string',
        name: 'lastUpdateDate',
        label: intl.get('hpdm.config-object.model.lastUpdateDate').d('最后更新时间'),
      },
      {
        type: 'object',
        name: 'mainTable',
        label: intl.get('srdm.config-object.model.mainTable').d('主展示表'),
        lovCode: 'SRDM.CONFIG_OBJECT_TBL',
        textField: 'tableName',
        valueField: 'objectTblId',
        ignore: 'always',
        dynamicProps: ({ record }) => {
          const objectId = record.get('objectId');
          if (objectId) {
            return {
              lovPara: {
                objectId,
              },
            };
          }
        },
      },
      {
        type: 'string',
        name: 'mainTableName',
        bind: 'mainTable.tableName',
        label: intl.get('srdm.config-object.model.mainTableName').d('主展示表'),
      },
      {
        type: 'string',
        name: 'mainTableId',
        bind: 'mainTable.objectTblId',
      },
      {
        type: 'string',
        name: 'showGroup',
        label: intl.get('srdm.config-object.model.showGroup').d('展示组名称'),
        valueField: 'name',
        textField: 'name',
        lookupAxiosConfig: () => ({
          method: 'GET',
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-objects/showGroup?showGroupOnlyFlag=1&showAllGroupFlag=1&page=0&size=2000`
            : `${HZERO_SRDM}/v1/hpdm-config-objects/showGroup?showGroupOnlyFlag=1&showAllGroupFlag=1&page=0&size=2000`,
          transformResponse(data) {
            if (data && getResponse(JSON.parse(data))) {
              return JSON.parse(data).map((item) => ({ name: item }));
            }
            return [];
          },
        }),
      },
      {
        type: 'number',
        name: 'showObjectFldNameFlag',
        label: '展示中文字段名称',
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'string',
        name: 'debugMode',
        label: '是否开启debug模式(开启后只有配置人员角色才可以使用)',
        defaultValue: '1',
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'string',
        name: 'associateMainTableSql',
        label: '关联数据sql(查询与选中数据一起迁移的数据的id)',
      },
      {
        type: 'string',
        name: 'publicCloudFlag',
        label: intl.get('srdm.config-object.model.publicCloudFlag').d('公有云是否迁移'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'string',
        name: 'multiCloudFlag',
        label: intl.get('srdm.config-object.model.multiCloudFlag').d('多云是否迁移'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'string',
        name: 'checkoutFlag',
        label: intl.get('srdm.config-object.model.checkoutFlag').d('期初是否迁移'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'string',
        name: 'newObjectCode',
        label: intl.get('srdm.config-object.model.copied.code').d('复制后的编码'),
      },
      {
        type: 'string',
        name: 'pcMigrateMode',
        label: '公有云迁移模式',
        lookupCode: 'SRDM.PC_MIGRATE_MODE',
        defaultValue: 0,
        dynamicProps: ({ record }) => ({
          disabled: record.get('publicCloudFlag') === '0',
        }),
      },
    ],
    queryFields: [
      {
        type: 'string',
        name: 'objectCode',
        label: intl.get('hpdm.config-object.model.objectCode').d('配置对象编码'),
      },
      {
        type: 'string',
        name: 'objectName',
        label: intl.get('hpdm.config-object.model.objectName').d('配置对象名称'),
      },
      {
        type: 'string',
        name: 'enabledFlag',
        label: intl.get('hpdm.config-object.model.enabledFlag').d('启用'),
        defaultValue: '1',
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'string',
        name: 'publicCloudFlag',
        label: intl.get('hpdm.config-object.model.publicCloudFlag').d('公有云是否迁移'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'string',
        name: 'multiCloudFlag',
        label: intl.get('hpdm.config-object.model.multiCloudFlag').d('多云是否迁移'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'string',
        name: 'checkoutFlag',
        label: intl.get('hpdm.config-object.model.checkoutFlag').d('期初是否迁移'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
    ],
    record: {
      dynamicProps: {
        selectable: (record) => record.get('checkoutFlag'),
      },
    },
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-objects/query`
          : `${HZERO_SRDM}/v1/hpdm-config-objects/query`;
        return {
          data,
          params,
          url,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-objects/createAndUpdate`
            : `${HZERO_SRDM}/v1/hpdm-config-objects/createAndUpdate`,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-objects/deleteObject`
            : `${HZERO_SRDM}/v1/hpdm-config-objects/deleteObject`,
          method: 'POST',
        };
      },
    },
    events: {},
  };
}

export function getSyncProductionDs() {
  return {
    autoCreate: true,
    fields: [
      {
        type: 'object',
        name: 'objectCodes',
      },
      {
        type: 'string',
        name: 'description',
        label: intl.get('hzero.common.view.description').d('描述'),
      },
      {
        type: 'object',
        name: 'approverLoginName',
        label: intl.get('hzero.common.model.apply.approver').d('审批人'),
        required: true,
        ignore: 'always',
        defaultValue: '直接上级',
      },
      {
        type: 'string',
        name: 'approver',
        defaultValue: '直接上级',
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          data: data[0],
          url: `${HZERO_SRDM}/v1/hpdm-config-objects/sync-submit`,
          method: 'POST',
        };
      },
    },
    feedback: {
      submitSuccess: ({ content }) => {
        notification.success({
          message: content && content[0] && content[0].message,
        });
      },
    },
  };
}

export default getConfigObjectDSProps;
