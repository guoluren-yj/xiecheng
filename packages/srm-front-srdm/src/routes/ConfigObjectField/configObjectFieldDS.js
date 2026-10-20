import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';
import { labelTooltipRender } from '@/common/utils';

const organizationId = getCurrentOrganizationId();

function getConfigObjectFieldDSProps({ objectTblId }) {
  return {
    fields: [
      {
        type: 'string',
        name: 'fieldName',
        label: intl.get('hpdm.config-object-field.model.fieldName').d('字段'),
        required: true,
      },
      {
        type: 'string',
        name: 'objectFldName',
        label: intl.get('hpdm.config-object-field.model.objectFldName').d('字段名称'),
        required: true,
      },
      {
        type: 'string',
        name: 'objectFldDesc',
        label: intl.get('hpdm.config-object-field.model.objectFldDesc').d('字段描述'),
      },
      {
        type: 'number',
        name: 'fieldSeq',
        label: intl.get('hpdm.config-object-field.model.fieldSeq').d('字段序号'),
        required: true,
      },
      {
        type: 'string',
        name: 'fieldType',
        label: intl.get('hpdm.config-object-field.model.fieldType').d('字段类型'),
        lookupCode: 'HPDM.FIELD_TYPE',
        required: true,
      },
      {
        type: 'number',
        name: 'uniqueFlag',
        label: intl.get('hpdm.config-object-field.model.uniqueFlag').d('是否唯一性组合字段'),
        lookupCode: 'HPDM.Y_N_FLAG',
        required: true,
        defaultValue: 0,
      },
      {
        type: 'number',
        name: 'differCompareFlag',
        label: '差异对比',
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'number',
        name: 'codeCompareFlag',
        label: '代码对比字段',
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'string',
        name: 'encodeMode',
        label: '是否编码',
        lookupCode: 'SRDM.CODE_ENCODE_MODE',
      },
      {
        type: 'string',
        name: 'defaultValue',
        label: intl.get('hpdm.config-object-field.model.defaultValue').d('默认值'),
      },
      {
        type: 'number',
        name: 'updateFlag',
        label: intl.get('hpdm.config-object-field.model.updateFlag').d('是否更新'),
        lookupCode: 'HPDM.Y_N_FLAG',
        required: true,
        defaultValue: 1,
      },
      {
        type: 'number',
        name: 'multiCloudUpdateFlag',
        label: '多云更新行为',
        lookupCode: 'SRDM.MULTI_CLOUD_UPDATE_FLAG',
        required: false,
        defaultValue: 1,
      },
      {
        type: 'number',
        name: 'primaryFlag',
        label: intl.get('hpdm.config-object-field.model.primaryFlag').d('是否主键'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'number',
        name: 'idFlag',
        label: intl.get('hpdm.config-object-field.model.idFlag').d('是否id字段'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'number',
        name: 'parentFlag',
        label: intl.get('hpdm.config-object-field.model.parentFlag').d('是否父字段'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'string',
        name: 'idTranferSql',
        label: labelTooltipRender(
          intl.get('hpdm.config-object-field.model.idTranferSql').d('ID字段转换SQL'),
          intl.get('hpdm.config-object-field.help.idTranferSql').d(`设置ID的关联标识
          SQL规范：
          1、SQL都需要指定表别名，例如：iam_user iu；
          2、SQL都需要指定schema，例如：#<hzero_platform>.；
          3、SQL都需要关联主SQL，固定使用<pri>.。
          例如：
          SELECT hl.login_name
            FROM #<hzero_platform>.iam_user hl
           WHERE hl.lov_id = <pri>.lov_id
          `)
        ),
        dynamicProps: {
          required: ({ record }) => {
            if (Number(record.get('idFlag')) === 1) {
              return true;
            } else {
              return false;
            }
          },
        },
      },
      {
        type: 'string',
        name: 'idTranferSoucre',
        label: intl.get('hpdm.config-object-field.model.idTranferSoucre').d('ID字段来源字段'),
      },
      {
        type: 'number',
        name: 'enabledFlag',
        label: intl.get('hpdm.config-object-field.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        required: true,
        defaultValue: 1,
      },
      {
        type: 'number',
        name: 'tenantId',
        label: intl.get('hpdm.config-object-field.model.tenantId').d('租户ID'),
      },
      {
        type: 'number',
        name: 'idTenantFlag',
        label: intl.get('srdm.config-object.model.idTenantFlag').d('是否是多云租户字段'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
        required: true,
      },
      {
        type: 'number',
        name: 'fileFlag',
        label: intl.get('srdm.config-object.model.fileFlag').d('是否是文件类型'),
        lookupCode: 'HPDM.Y_N_FLAG',
        required: true,
        defaultValue: 0,
      },
      {
        type: 'string',
        name: 'bucketName',
        label: intl.get('srdm.config-object.model.bucketName').d('bucketName(默认private-bucket)'),
        required: false,
      },
      {
        type: 'string',
        name: 'directory',
        label: intl.get('srdm.config-object.model.storageCode').d('directory'),
        required: false,
      },
      {
        type: 'number',
        name: 'showFlag',
        label: intl.get('srdm.config-object.model.showFlag').d('是否展示'),
        lookupCode: 'HPDM.Y_N_FLAG',
        required: true,
        defaultValue: 1,
      },
      {
        type: 'number',
        name: 'searchFlag',
        label: intl.get('srdm.config-object.model.searchFlag').d('搜索字段'),
        lookupCode: 'HPDM.Y_N_FLAG',
        required: true,
        defaultValue: 1,
      },
      {
        type: 'string',
        name: 'searchDefaultValue',
        label: intl.get('srdm.config-object.model.searchDefaultValue').d('搜索字段默认值'),
        required: false,
      },
      {
        type: 'string',
        name: 'fixValue',
        label: intl.get('hpdm.config-object-field.model.fixValue').d('固定值'),
      },
    ],
    queryFields: [
      {
        type: 'string',
        name: 'fieldName',
        label: intl.get('hpdm.config-object-field.model.fieldName').d('字段'),
      },
      {
        type: 'number',
        name: 'uniqueFlag',
        label: intl.get('hpdm.config-object-field.model.uniqueFlag').d('是否唯一性组合字段'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'number',
        name: 'updateFlag',
        label: intl.get('hpdm.config-object-field.model.updateFlag').d('是否更新'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'number',
        name: 'primaryFlag',
        label: intl.get('hpdm.config-object-field.model.primaryFlag').d('是否主键'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'number',
        name: 'idFlag',
        label: intl.get('hpdm.config-object-field.model.idFlag').d('是否id字段'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'number',
        name: 'parentFlag',
        label: intl.get('hpdm.config-object-field.model.parentFlag').d('是否父字段'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
    ],
    autoQuery: true,
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-object-fields/query?objectTblId=${objectTblId}`
          : `${HZERO_SRDM}/v1/hpdm-config-object-fields/query?objectTblId=${objectTblId}`;
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
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-object-fields/createAndUpdate`
            : `${HZERO_SRDM}/v1/hpdm-config-object-fields/createAndUpdate`,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-object-fields/delete`
            : `${HZERO_SRDM}/v1/hpdm-config-object-fields/delete`,
          method: 'POST',
        };
      },
    },
    events: {},
  };
}

export default getConfigObjectFieldDSProps;
