import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();
function getProcessDSProps() {
  return {
    fields: [
      {
        type: 'string',
        name: 'tenantId',
        label: intl.get('hpdm.process.model.tenantId').d('租户ID'),
      },
      {
        type: 'string',
        name: 'fileUrl',
        label: intl.get('hpdm.process.model.fileUrl').d('文件地址'),
      },
      {
        type: 'string',
        name: 'fileUuid',
        label: intl.get('hpdm.process.model.fileUuid').d('文件Uuid'),
      },
      {
        type: 'number',
        name: 'repushFlag',
        label: intl.get('hpdm.process.model.repushFlag').d('是否可重推'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'string',
        name: 'processParam',
        label: intl.get('hpdm.process.model.processParam').d('处理参数'),
      },
      {
        type: 'string',
        name: 'processUserName',
        label: intl.get('hpdm.process.model.processUserName').d('处理人名称'),
      },
      {
        type: 'string',
        name: 'processMessage',
        label: intl.get('hpdm.process.model.processMessage').d('处理消息'),
      },
      {
        type: 'string',
        name: 'processStatus',
        label: intl.get('hpdm.process.model.processStatus').d('处理状态'),
        lookupCode: 'HPDM.PROCESS_STATUS',
      },
      {
        type: 'string',
        name: 'processDesc',
        label: intl.get('hpdm.process.model.processDesc').d('处理描述'),
      },
      {
        type: 'string',
        name: 'processType',
        label: intl.get('hpdm.process.model.processType').d('处理类型'),
      },
      {
        type: 'string',
        name: 'groupId',
        label: intl.get('hpdm.process.model.groupId').d('组标识'),
      },
      {
        type: 'string',
        name: 'lastUpdateDate',
        label: intl.get('hpdm.process.model.lastUpdateDate').d('处理日期'),
      },
    ],
    autoQuery: true,
    selection: false,
    queryFields: [
      {
        type: 'string',
        name: 'groupId',
        label: intl.get('hpdm.process.model.groupId').d('组标识'),
      },
      {
        type: 'string',
        name: 'processDesc',
        label: intl.get('hpdm.process.model.processDesc').d('处理描述'),
      },
      {
        type: 'string',
        name: 'processStatus',
        label: intl.get('hpdm.process.model.processStatus').d('处理状态'),
        lookupCode: 'HPDM.PROCESS_STATUS',
      },
      {
        type: 'string',
        name: 'processType',
        label: intl.get('hpdm.process.model.processType').d('处理类型'),
      },
      {
        type: 'string',
        name: 'processParam',
        label: intl.get('hpdm.process.model.processParam').d('处理参数'),
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-processs`
          : `${HZERO_SRDM}/v1/data-migrate-processs`;
        return {
          data,
          params,
          url,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          dataMigrateProcesss: data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-processs`
            : `${HZERO_SRDM}/v1/data-migrate-processs`,
          method: 'DELETE',
        };
      },
    },
  };
}

export default getProcessDSProps;
