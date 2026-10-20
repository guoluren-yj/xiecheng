import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { labelTooltipRender } from '@/common/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getDistributeDSProps() {
  return {
    fields: [
      {
        type: 'number',
        name: 'recId',
      },
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
        label: labelTooltipRender(
          intl.get('hpdm.data-distribute.model.idValue').d('ID值'),
          intl.get('hpdm.data-distribute.help.idValue').d('配置数据的记录主标识')
        ),
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
        type: 'dateTime',
        name: 'creationDate',
        label: intl.get('hpdm.data-distribute.model.creationDate').d('收集日期'),
      },
      {
        type: 'dateTime',
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
    ],
    queryFields: [
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
        type: 'number',
        name: 'distFlag',
        label: intl.get('hpdm.data-distribute.model.distFlag').d('是否已分配'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'string',
        name: 'objectName',
        label: intl.get('hpdm.data-distribute.model.objectCode').d('配置对象'),
        ignore: 'always',
      },
      {
        type: 'string',
        name: 'tableName',
        label: intl.get('hpdm.data-distribute.model.tableName').d('表名'),
      },
      {
        type: 'string',
        name: 'deployInfos',
        label: intl.get('hpdm.data-distribute.model.deployInfos').d('发版批次编码'),
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
    autoQuery: true,
    cacheSelection: true,
    primaryKey: 'recId',
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-recs/test`
          : `${HZERO_SRDM}/v1/data-migrate-recs/test`;
        return {
          data,
          params,
          url,
          method: 'get',
        };
      },
    },
    events: {},
  };
}

export default getDistributeDSProps;
