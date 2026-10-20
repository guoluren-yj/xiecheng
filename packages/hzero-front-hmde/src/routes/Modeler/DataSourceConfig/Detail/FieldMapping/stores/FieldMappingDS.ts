import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { isTenantRoleLevel } from 'utils/utils';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export const formDS = () => {
  return {
    fields: [
      {
        name: 'originDataObject',
        label: '来源模型数据对象',
        type: FieldType.object,
        lovCode: isTenantRoleLevel() ? 'HMDE.DATA_OBJECT' : 'HMDE.DATA_OBJECT.SITE',
        lovPara: {
          dataObjectOwnerTypeList: 'TENANT',
        },
        ignore: 'always',
      },
      {
        name: 'originDataObjectCode',
        bind: 'originDataObject.dataObjectCode',
      },
      {
        name: 'remark',
        label: '场景描述',
        type: FieldType.string,
      },
    ],
  } as DataSetProps;
};

export const tableDS = () => {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'originDataObjectName',
        label: '来源模型数据对象',
      },
      {
        name: 'remark',
        label: '场景描述',
      },
      {
        name: 'dataRelationCode',
        label: '场景编码',
      },
      {
        name: 'enabledFlag',
        label: '启用',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: ({ data }) => {
        const { dataObjectCode } = data;
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/data-relations/${dataObjectCode}/page`,
          method: 'get',
          params: data,
        };
      },
    },
  } as DataSetProps;
};

export const fieldSourceFormDS = () => {
  return {
    autoCreate: false,
    fields: [
      {
        name: 'dataRelationCode',
        label: '场景编码',
        maxLength: 32,
        required: true,
        validator: (value) => {
          if (!/^[A-Za-z0-9-_.]+$/.test(value)) {
            return '大小写及数字，可包含“-”、“_”、“.”';
          }
          return true;
        },
      },
      {
        name: 'targetDataObjectName',
        label: '目标对象',
        disabled: true,
        required: true,
      },
      {
        name: 'originDataObject',
        label: '来源对象',
        type: FieldType.object,
        required: true,
        lovCode: isTenantRoleLevel() ? 'HMDE.DATA_OBJECT' : 'HMDE.DATA_OBJECT.SITE',
        lovPara: {
          dataObjectOwnerTypeList: 'TENANT',
        },
      },
      {
        name: 'remark',
        label: '场景描述',
        required: true,
      },
      {
        name: 'enabledFlag',
        label: '是否启用',
        defaultValue: 1,
      },
    ],
  } as DataSetProps;
};

export const fieldSourceTableDS = () => {
  return {
    selection: false as any,
    paging: false,
    fields: [
      {
        name: 'targetModel',
        label: '目标模型',
        required: true,
        disabled: true,
      },
      {
        name: 'targetDataField',
        label: '目标模型字段',
        required: true,
        type: FieldType.object,
        lovCode: isTenantRoleLevel() ? 'HMDE.DATA_RELATION.FIELD' : 'HMDE.DATA_RELATION.FIELD.SITE',
        dynamicProps: {
          lovPara: ({ record }) => {
            return { dataObjectId: record.get('targetDataObjectId') };
          },
        },
      },
      {
        name: 'targetDataFieldCode',
        type: FieldType.string,
        bind: 'targetDataField.fieldCode',
      },
      {
        name: 'targetDataFieldId',
        type: FieldType.string,
        bind: 'targetDataField.dataFieldId',
      },
      {
        name: 'originValueTypeMeaning',
        label: '来源类型',
        required: true,
      },
      {
        name: 'originValueType',
        required: true,
      },
      {
        name: 'originModel',
        label: '来源模型',
        disabled: true,
        dynamicProps: {
          required: ({ record }) => {
            return record.get('originValueType') === 'DATA_OBJECT';
          },
        },
      },
      {
        name: 'originDataField',
        label: '来源模型字段',
        type: FieldType.object,
        lovCode: isTenantRoleLevel() ? 'HMDE.DATA_RELATION.FIELD' : 'HMDE.DATA_RELATION.FIELD.SITE',
        dynamicProps: {
          lovPara: ({ record }) => {
            return { dataObjectId: record.get('originDataObjectId') };
          },
          disabled: ({ record }) => {
            return !record.get('originValueType');
          },
          required: ({ record }) => {
            return record.get('originValueType') === 'DATA_OBJECT';
          },
        },
      },
      {
        name: 'originDataFieldCode',
        type: FieldType.string,
        bind: 'originDataField.fieldCode',
      },
      {
        name: 'originDataFieldId',
        type: FieldType.string,
        bind: 'originDataField.dataFieldId',
      },
      {
        name: 'originValue',
        label: '来源模型字段',
        dynamicProps: {
          disabled: ({ record }) => {
            return !record.get('originValueType');
          },
          required: ({ record }) => {
            return record.get('originValueType') !== 'DATA_OBJECT';
          },
          type: ({ record }) => {
            return record.get('originValueType') === 'CONTEXT'
              ? FieldType.object
              : FieldType.string;
          },
          lovCode: ({ record }) => {
            if (record.get('originValueType') === 'CONTEXT') {
              return 'HMDE.DATA_REL.ORIGIN_VALUE_CONTEXT';
            } else {
              return null;
            }
          },
        },
      },
    ],
  } as DataSetProps;
};

export const fieldBatchEditFormDS = () => {
  return {
    fields: [
      {
        name: 'originModel',
        label: '来源模型',
      },
      {
        name: 'targetModel',
        label: '目标模型',
      },
    ],
  } as DataSetProps;
};

export const fieldBatchEditTableDS = () => {
  return {
    paging: false,
    fields: [
      {
        name: 'originModelName',
        label: '来源模型',
      },
      {
        name: 'originDisplayName',
        label: '来源模型字段',
      },
      {
        name: 'targetModelName',
        label: '目标模型',
      },
      {
        name: 'targetDisplayName',
        label: '目标模型字段',
      },
    ],
  } as DataSetProps;
};
