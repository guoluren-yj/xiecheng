import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 字段匹配
const FieldMatchConfigDs = (props) => {
  const { editable, pcTypeId } = props;
  return {
    selection: editable && 'multiple',
    primaryKey: 'lineId',
    // table显示的字段
    queryFields: [
      {
        name: 'fieldName',
        label: intl.get('spcm.common.model.common.fieldName').d('字段名称'),
        type: 'string',
      },
      {
        name: 'fieldDesc',
        type: 'string',
        label: intl.get('spcm.common.model.common.fieldDesc').d('文本匹配描述'),
      },
      {
        name: 'tempName',
        type: 'string',
        label: intl.get('spcm.common.model.common.tempName').d('字段类型'),
        lookupCode: 'SPCM.TEMPLATE_LIST_FORMAT',
      },
      {
        name: 'enabledFlag',
        label: intl.get('spcm.common.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'fieldType',
        type: 'string',
        label: intl.get('spcm.common.model.common.fieldType').d('组件类型'),
        lookupCode: 'SPCM.TEMPLATE_FIELD_TYPE',
      },
    ],
    fields: [
      {
        name: 'fieldName',
        label: intl.get('spcm.common.model.common.fieldName').d('字段名称'),
        type: 'string',
        required: true,
      },
      {
        name: 'tempName',
        type: 'string',
        label: intl.get('spcm.common.model.common.tempName').d('字段类型'),
        lookupCode: 'SPCM.TEMPLATE_LIST_FORMAT',
        required: true,
      },
      {
        name: 'fieldType',
        type: 'string',
        label: intl.get('spcm.common.model.common.fieldType').d('组件类型'),
        lookupCode: 'SPCM.TEMPLATE_FIELD_TYPE',
        required: true,
      },
      {
        name: 'flexCode',
        type: 'string',
        label: intl.get('spcm.common.model.common.flexCode').d('值集编码'),
        dynamicProps: {
          required: ({ record }) => ['flex', 'lov'].includes(record.get('fieldType')),
        },
      },
      {
        name: 'flexDesc',
        type: 'string',
        label: intl.get('spcm.common.model.common.flexDesc').d('值集描述'),
        dynamicProps: {
          required: ({ record }) => ['flex', 'lov'].includes(record.get('fieldType')),
        },
      },
      {
        name: 'fieldTypeFormat',
        type: 'string',
        label: intl.get('spcm.common.model.common.fieldTypeFormat').d('日期格式'),
        lookupCode: 'SPCM.TEMPLATE_DATE_FORMAT',
      },
      {
        name: 'decimalPrecision',
        type: 'number',
        label: intl.get('spcm.common.model.common.dataPrecision').d('数据精度'),
        min: 0,
        max: 6,
        precision: 0,
        step: 1,
      },
      {
        name: 'fieldDesc',
        type: 'string',
        label: intl.get('spcm.common.model.common.fieldDesc').d('文本匹配描述'),
        required: true,
      },
      {
        name: 'multipleFlag',
        type: 'string',
        label: intl.get('spcm.common.model.multipleFlag').d('启用多选'),
        lookupCode: 'HPFM.ENABLED_FLAG',
        required: true,
        transformResponse: (val) => val || 0,
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('spcm.common.model.enabledFlag').d('是否启用'),
        required: true,
        transformRequest: (value) => (value ? 1 : 0),
        transformResponse: (_, record) => !!record.enabledFlag,
      },
      {
        name: 'operator',
        type: 'string',
        label: intl.get('hzero.common.button.operator').d('操作'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-template-detailes/${pcTypeId}`,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-template-detailes`,
          method: 'DELETE',
          data,
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-template-detailes`,
          method: 'POST',
          data,
        };
      },
    },
  };
};

export default FieldMatchConfigDs;
