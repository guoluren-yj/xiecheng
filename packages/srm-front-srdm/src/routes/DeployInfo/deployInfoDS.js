import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel, getResponse } from 'utils/utils';
import { labelTooltipRender } from '@/common/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getDeployInfoDSProps() {
  return {
    autoQuery: true,
    fields: [
      {
        type: 'string',
        name: 'deployNum',
        label: intl.get('hpdm.deploy-info.model.deployNum').d('发版批次号'),
        required: true,
      },
      {
        type: 'string',
        name: 'issueNum',
        label: intl.get('srdm.deploy.model.issueNum').d('需求号'),
      },
      {
        type: 'dateTime',
        name: 'creationDate',
        label: intl.get('hpdm.data-distribute.model.creationDate').d('创建日期'),
      },
      {
        type: 'string',
        name: 'deployDesc',
        label: intl.get('hpdm.deploy-info.model.deployDesc').d('发版描述'),
      },
      {
        type: 'string',
        name: 'comments',
        label: intl.get('hpdm.deploy-info.model.comments').d('备注'),
      },
      {
        type: 'string',
        name: 'cloudType',
        label: intl.get('srdm.deploy.model.cloudType').d('云类型'),
        lookupCode: 'SRM.CLOUD_TYPE',
      },
      {
        type: 'string',
        name: 'enabledFlag',
        label: intl.get('hpdm.deploy-info.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
        required: true,
      },
      {
        type: 'string',
        name: 'iterationNum',
        label: intl.get('srdm.deploy.model.iterationNum').d('迭代编码'),
      },
      {
        type: 'string',
        name: 'applicant',
        label: intl.get('srdm.deploy.model.applicant').d('申请人'),
      },
      {
        type: 'string',
        name: 'approveStatus',
        lookupCode: 'SRM.DEPLOY_APPROVE_STATUS',
        label: intl.get('srdm.deploy.model.approveStatus').d('审批状态'),
      },
      {
        type: 'string',
        name: 'approverName',
        label: intl.get('hzero.common.model.apply.approver').d('审批人'),
      },
      {
        type: 'boolean',
        name: 'blacklistFlag',
        label: intl.get('srdm.deploy.modal.sync.prod.blacklist').d('迭代同步生产黑名单'),
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
      },
    ],
    queryFields: [
      {
        type: 'string',
        name: 'deployNum',
        label: intl.get('hpdm.deploy-info.model.deployNum').d('发版批次号'),
      },
      {
        type: 'string',
        name: 'iterationNum',
        label: intl.get('srdm.deploy.model.iterationNum').d('迭代编码'),
      },
      {
        type: 'string',
        name: 'issueNum',
        label: intl.get('srdm.deploy.model.issueNum').d('需求号'),
      },
      {
        type: 'string',
        name: 'enabledFlag',
        label: intl.get('hpdm.deploy-info.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
      },
      {
        type: 'string',
        name: 'deployDesc',
        label: intl.get('hpdm.deploy-info.model.deployDesc').d('发版描述'),
      },
      {
        type: 'string',
        name: 'applicant',
        label: intl.get('srdm.deploy.model.applicant').d('申请人'),
      },
      {
        type: 'string',
        name: 'blacklistFlag',
        label: intl.get('srdm.deploy.modal.sync.prod.blacklist').d('迭代同步生产黑名单'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'string',
        name: 'approveStatus',
        lookupCode: 'SRM.DEPLOY_APPROVE_STATUS',
        label: intl.get('srdm.deploy.model.approveStatus').d('审批状态'),
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-infos/query`
          : `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/query`;
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
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-infos/createAndUpdate`
            : `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/createAndUpdate`,
          method: 'POST',
        };
      },
    },
    events: {},
  };
}

export function getConfigDataDSProps({ deployInfoId }) {
  return {
    autoQuery: true,
    fields: [
      {
        type: 'string',
        name: 'objectCode',
        label: intl.get('hpdm.data-distribute.model.objectCode').d('配置对象编码'),
      },
      {
        type: 'string',
        name: 'objectName',
        label: intl.get('hpdm.data-distribute.model.objectName').d('对象名称'),
      },
      {
        type: 'string',
        name: 'tableName',
        label: intl.get('hpdm.data-distribute.model.tableName').d('表名'),
      },
      {
        type: 'string',
        name: 'displayFieldValue',
        label: intl.get('hpdm.data-distribute.model.displayFieldValue').d('显示字段值'),
      },
      {
        type: 'string',
        name: 'displayFieldDesc',
        label: intl.get('hpdm.data-distribute.model.displayFieldDesc').d('显示字段说明'),
      },
      {
        type: 'string',
        name: 'field1',
        label: intl.get('hpdm.data-distribute.model.field1').d('字段1'),
      },
      {
        type: 'string',
        name: 'field2',
        label: intl.get('hpdm.data-distribute.model.field2').d('字段2'),
      },
      {
        type: 'string',
        name: 'field3',
        label: intl.get('hpdm.data-distribute.model.field3').d('字段3'),
      },
      {
        type: 'string',
        name: 'field4',
        label: intl.get('hpdm.data-distribute.model.field4').d('字段4'),
      },
      {
        type: 'string',
        name: 'field5',
        label: intl.get('hpdm.data-distribute.model.field5').d('字段5'),
      },
      {
        type: 'string',
        name: 'field6',
        label: intl.get('hpdm.data-distribute.model.field6').d('字段6'),
      },
      {
        type: 'string',
        name: 'field7',
        label: intl.get('hpdm.data-distribute.model.field7').d('字段7'),
      },
      {
        type: 'string',
        name: 'field8',
        label: intl.get('hpdm.data-distribute.model.field8').d('字段8'),
      },
      {
        type: 'string',
        name: 'field9',
        label: intl.get('hpdm.data-distribute.model.field9').d('字段9'),
      },
      {
        type: 'string',
        name: 'field10',
        label: intl.get('hpdm.data-distribute.model.field10').d('字段10'),
      },
      {
        type: 'string',
        name: 'deployInfos',
        label: intl.get('hpdm.data-distribute.model.deployInfos').d('发版批次编码'),
      },
      {
        type: 'string',
        name: 'recType',
        label: intl.get('hpdm.data-distribute.model.recType').d('记录类型'),
        lookupCode: 'HPDM.REC_TYPE',
      },
      {
        type: 'string',
        name: 'groupId',
        label: intl.get('hpdm.data-distribute.model.groupId').d('组标识'),
      },
      {
        type: 'string',
        name: 'environmentCode',
        label: intl.get('hpdm.data-distribute.model.environmentCode').d('环境名称'),
        valueField: `environmentCode`,
        textField: `environmentName`,
        lookupAxiosConfig: () => ({
          method: 'GET',
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/application-envs?page=0&size=2000`
            : `${HZERO_SRDM}/v1/application-envs?page=0&size=2000`,
        }),
      },
      {
        type: 'string',
        name: 'idValue',
        label: intl.get('hpdm.data-distribute.model.idValue').d('ID值'),
      },
      {
        type: 'string',
        name: 'sourceTenantNum',
        label: intl.get('hpdm.data-distribute.model.sourceTenantNum').d('来源租户编码'),
      },
      {
        type: 'string',
        name: 'cacheFlag',
        label: intl.get('hpdm.data-distribute.model.cacheFlag').d('是否刷新缓存'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'string',
        name: 'processStatus',
        label: intl.get('hpdm.data-distribute.model.processStatus').d('导入状态'),
        lookupCode: 'HPDM.PROCESS_STATUS',
      },
      {
        type: 'string',
        name: 'processMessage',
        label: intl.get('hpdm.data-distribute.model.processMessage').d('导入信息'),
      },
      {
        type: 'string',
        name: 'processDate',
        label: intl.get('hpdm.data-distribute.model.processDate').d('处理日期'),
      },
      {
        type: 'dateTime',
        name: 'updateDateValue',
        label: intl.get('hpdm.data-distribute.model.updateDateValue').d('配置更新日期'),
      },
      {
        type: 'string',
        name: 'uniqueValue',
        label: intl.get('hpdm.data-distribute.model.uniqueValue').d('唯一性组合'),
      },
      {
        type: '处理类型',
        name: 'migrateType',
        label: '处理类型',
        lookupCode: 'SRDM.REC_MIGRATE_TYPE',
      },
      {
        type: 'string',
        name: 'testMigrateBehaviour',
        label: '测试环境处理类型',
        lookupCode: 'SRDM.MIGRATE_TYPE',
      },
      {
        type: 'string',
        name: 'prodMigrateBehaviour',
        label: '生产环境处理类型',
        lookupCode: 'SRDM.MIGRATE_TYPE',
      },
    ],
    queryFields: [
      {
        type: 'string',
        name: 'groupId',
        label: intl.get('hpdm.data-distribute.model.groupId').d('组标识'),
      },
      {
        type: 'string',
        name: 'objectName',
        label: intl.get('hpdm.data-distribute.model.objectName').d('配置对象'),
        ignore: 'always',
      },
      {
        type: 'string',
        name: 'tableName',
        label: intl.get('hpdm.data-distribute.model.tableName').d('表名'),
      },
      {
        type: 'dateTime',
        name: 'creationDateFrom',
        label: intl.get('hpdm.data-distribute.model.creationDateFrom').d('收集日期从'),
        max: 'creationDateTo',
      },
      {
        type: 'dateTime',
        name: 'creationDateTo',
        label: intl.get('hpdm.data-distribute.model.creationDateTo').d('收集日期至'),
        min: 'creationDateFrom',
      },
      {
        type: 'string',
        name: 'displayFieldValue',
        label: labelTooltipRender(
          intl.get('hpdm.data-distribute.model.displayFieldValue').d('显示字段值'),
          intl
            .get('hpdm.data-distribute.help.displayFieldValue')
            .d(
              '在定义配置对象时，可定义配置数据中显示当前配置数据的主要信息字段，比如"值集"对象定义显示"值集编码"'
            )
        ),
      },
      {
        type: 'string',
        name: 'displayFieldDesc',
        label: labelTooltipRender(
          intl.get('hpdm.data-distribute.model.displayFieldDesc').d('显示字段说明'),
          intl
            .get('hpdm.data-distribute.help.displayFieldDesc')
            .d(
              '在定义配置对象时，可定义配置数据中显示当前配置数据的主要说明信息，比如"值集"对象定义显示"值集名称"'
            )
        ),
      },
      {
        type: 'string',
        name: 'idValue',
        label: labelTooltipRender(
          intl.get('hpdm.data-distribute.model.idValue').d('ID值'),
          intl.get('hpdm.data-distribute.help.idValue').d('配置数据的记录主标识')
        ),
      },
      {
        type: 'string',
        name: 'uniqueValue',
        label: intl.get('hpdm.data-distribute.model.uniqueValue').d('唯一性组合'),
      },
      {
        type: 'string',
        name: 'sourceTenantNum',
        label: intl.get('hpdm.data-distribute.model.sourceTenantNum').d('来源租户编码'),
      },
      {
        type: 'dateTime',
        name: 'updateDateValueFrom',
        label: intl.get('hpdm.data-distribute.model.updateDateValueFrom').d('配置更新日期从'),
      },
      {
        type: 'dateTime',
        name: 'updateDateValueTo',
        label: intl.get('hpdm.data-distribute.model.updateDateValueTo').d('配置更新日期至'),
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-recs/dist/${deployInfoId}`
          : `${HZERO_SRDM}/v1/data-migrate-recs/dist/${deployInfoId}`;
        return {
          data,
          params,
          url,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-dists`
            : `${HZERO_SRDM}/v1/hpdm-config-deploy-dists`,
          method: 'DELETE',
        };
      },
    },
    events: {},
  };
}

export function getExportAndImportDs(isExport = true) {
  return {
    fields: [
      {
        type: 'string',
        name: 'deployNum',
        label: intl.get('srdm.deploy.model.deployNum').d('多云发版批次号'),
        required: true,
      },
      {
        type: 'string',
        name: 'checkoutFlag',
        label: intl.get('srdm.deploy.model.checkoutFlag').d('是否期初'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
        required: isExport,
      },
      {
        type: 'string',
        name: 'skipStages',
        label: '跳过Stage',
      },
      {
        type: 'object',
        name: 'iterationNumObject',
        label: intl.get('srdm.deploy.model.iterationNum').d('迭代编号'),
        lookupCode: 'SRDM_ENABLED_ITERATION',
        valueField: 'iterationNum',
        textField: 'iterationNum',
        required: isExport,
        ignore: 'always',
      },
      {
        type: 'string',
        name: 'iterationNum',
        bind: 'iterationNumObject.iterationNum',
      },
      {
        type: 'string',
        name: 'comments',
        label: intl.get('srdm.deploy.model.comments').d('备注'),
      },
      {
        type: 'string',
        name: 'tenantNum',
        label: intl.get('srdm.deploy.model.tenantNum').d('租户编码'),
        required: isExport,
        valueField: 'name',
        textField: 'name',
        lookupAxiosConfig: () => {
          if (isExport) {
            return {
              method: 'GET',
              url: `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/multi-cloud-tenants`,
              transformResponse(data) {
                if (data && getResponse(JSON.parse(data))) {
                  return JSON.parse(data).map((item) => ({ name: item }));
                }
                return [];
              },
            };
          }
          return {};
        },
      },
    ],
  };
}

export function getExportAndImportDsNew() {
  return {
    fields: [
      {
        type: 'string',
        name: 'scanStartDate',
        label: intl.get('srdm.deploy.model.scanStartDate').d('扫描起始时间(默认使用迭代开启时间)'),
        required: false,
      },
      {
        type: 'string',
        name: 'deployNum',
        label: intl.get('srdm.deploy.model.deployNum').d('多云发版批次号'),
        required: true,
      },
      {
        type: 'string',
        name: 'skipStages',
        label: '跳过Stage',
      },
      {
        type: 'object',
        name: 'iterationNumObject',
        label: intl.get('srdm.deploy.model.iterationNum').d('迭代编号'),
        lookupCode: 'SRDM_ENABLED_ITERATION',
        valueField: 'iterationNum',
        textField: 'iterationNum',
        required: true,
        ignore: 'always',
      },
      {
        type: 'string',
        name: 'iterationNum',
        bind: 'iterationNumObject.iterationNum',
      },
      {
        type: 'string',
        name: 'comments',
        label: intl.get('srdm.deploy.model.comments').d('备注'),
      },
      {
        type: 'string',
        name: 'tenantNum',
        label: intl.get('srdm.deploy.model.tenantNum').d('租户编码'),
        required: true,
        multiple: ',',
        valueField: 'name',
        textField: 'name',
        lookupAxiosConfig: () => {
          return {
            method: 'GET',
            url: `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/jp-aws-tenants`,
            transformResponse(data) {
              if (data && getResponse(JSON.parse(data))) {
                return JSON.parse(data).map((item) => ({ name: item }));
              }
              return [];
            },
          };
        },
      },
    ],
  };
}

export function getExportByIssueNum() {
  return {
    fields: [
      {
        type: 'string',
        name: 'deployNum',
        label: intl.get('srdm.deploy.model.deployNum').d('多云发版批次号'),
        required: true,
      },
      {
        type: 'string',
        name: 'issueNum',
        label: intl.get('srdm.deploy.model.issueNum').d('需求号'),
        required: true,
      },
      {
        type: 'string',
        name: 'comments',
        label: intl.get('srdm.deploy.model.comments').d('备注'),
      },
      {
        type: 'string',
        name: 'tenantNum',
        label: intl.get('srdm.deploy.model.tenantNum').d('租户编码'),
        required: true,
        valueField: 'name',
        textField: 'name',
        lookupAxiosConfig: () => {
          if (true) {
            return {
              method: 'GET',
              url: `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/multi-cloud-tenants`,
              transformResponse(data) {
                if (data && getResponse(JSON.parse(data))) {
                  return JSON.parse(data).map((item) => ({ name: item }));
                }
                return [];
              },
            };
          }
          return {};
        },
      },
    ],
  };
}

export default getDeployInfoDSProps;
