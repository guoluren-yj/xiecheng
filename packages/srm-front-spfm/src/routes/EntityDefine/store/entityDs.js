/**
 * index.js
 * 结构定义ds
 * @date: 2020-08-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { SRM_ADAPTOR } from '_utils/config';
import intl from 'utils/intl';

function getEntityDs() {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'entityCode',
        type: 'string',
        label: intl.get('spfm.entityDefine.model.entityDefine.entityCode').d('结构编码'),
      },
      {
        name: 'entityName',
        type: 'intl',
        label: intl.get('spfm.entityDefine.model.entityDefine.entityName').d('结构名称'),
      },
      {
        name: 'description',
        type: 'intl',
        label: intl.get('spfm.entityDefine.model.entityDefine.description').d('描述'),
      },
      {
        name: 'definitionJson',
        type: 'string',
        label: intl.get('spfm.entityDefine.model.entityDefine.definitionJson').d('字段详情'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'entityCode',
        type: 'string',
        label: intl.get('spfm.entityDefine.model.entityDefine.entityCode').d('结构编码'),
      },
      {
        name: 'entityName',
        type: 'string',
        label: intl.get('spfm.entityDefine.model.entityDefine.entityName').d('结构名称'),
      },
    ],
    selection: false,
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/adaptor-entity-structures/list-new`,
        method: 'GET',
      },
    },
  };
}

function getEntityRecordDs() {
  return {
    fields: [
      {
        name: 'entityCode',
        type: 'string',
        label: intl.get('spfm.entityDefine.model.entityDefine.entityCode').d('结构编码'),
      },
      {
        name: 'entityName',
        type: 'intl',
        label: intl.get('spfm.entityDefine.model.entityDefine.entityName').d('结构名称'),
      },
      {
        name: 'description',
        type: 'intl',
        label: intl.get('spfm.entityDefine.model.entityDefine.description').d('描述'),
      },
      {
        name: 'fieldSource',
        label: intl.get('spfm.entityDefine.model.entityDefine.fieldSource').d('字段来源'),
        required: true,
        defaultValue: 'CONFIGURATION',
      },
    ],
  };
}

function getEntityFieldsDs() {
  return {
    fields: [
      {
        name: 'valueType',
        defaultValue: 'string',
        label: intl.get('spfm.entityDefine.model.entityDefine.valueType').d('数据类型'),
        lookupCode: 'SADA.ENTITY_DEFINE.VALUE_TYPE',
        required: true,
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get('spfm.configServer.model.order.fieldName').d('字段编码'),
        required: true,
        // eslint-disable-next-line no-useless-escape
        pattern: /^[a-z]+([A-Za-z0-9\.]+)$/,
      },
      {
        name: 'description',
        type: 'intl',
        label: intl.get('spfm.configServer.model.field.mallName').d('字段名称'),
        required: true,
      },
      {
        name: 'tableCode',
        type: 'string',
        label: intl.get('spfm.configServer.model.field.tableCode').d('关联表编码'),
        dynamicProps: {
          required: ({ record }) => {
            if (record.get('tableFieldCode')) {
              return true;
            } else return false;
          },
        },
      },
      {
        name: 'tableFieldCode',
        type: 'string',
        label: intl.get('spfm.configServer.model.field.tableFieldCode').d('关联表字段编码'),
        dynamicProps: {
          required: ({ record }) => {
            if (record.get('tableCode')) {
              return true;
            } else return false;
          },
        },
      },
      {
        name: 'componentType',
        type: 'string',
        label: intl.get('spfm.configServer.model.field.fieldWidget').d('组件类型'),
        // required: true,
        lookupCode: 'SADA.ENTITY.FIELD_COMPONENT',
      },
      {
        name: 'lov',
        type: 'object',
        label: intl.get('spfm.configServer.model.field.lovCode').d('值集视图Code'),
        textField: 'viewCode',
        ingore: 'always',
        lovCode: 'SPFM.REL_TABLE_LOV_VIEW_VIEW',
        dynamicProps: {
          disabled: ({ record }) => {
            if (record.get('componentType') !== 'lov') {
              return true;
            } else return false;
          },
          required: ({ record }) => {
            if (record.get('componentType') === 'lov') {
              return true;
            } else return false;
          },
        },
      },
      {
        name: 'viewCode',
        type: 'string',
        bind: 'lov.viewCode',
      },
      {
        name: 'lovCode',
        type: 'string',
        bind: 'lov.viewCode',
      },
      {
        name: 'lookup',
        type: 'object',
        label: intl.get('spfm.configServer.model.field.lookupCode').d('值集Code'),
        lovCode: 'SPFM.REL_TABLE_IDP_LOV_VIEW',
        dynamicProps: {
          disabled: ({ record }) => {
            if (record.get('componentType') !== 'lookup') {
              return true;
            } else return false;
          },
          required: ({ record }) => {
            if (record.get('componentType') === 'lookup') {
              return true;
            } else return false;
          },
        },
      },
      {
        name: 'lookupCode',
        type: 'string',
        bind: 'lookup.lovLovCode',
      },
      {
        name: 'textField',
        type: 'string',
        label: intl.get('spfm.configServer.model.field.displayField').d('显示字段'),
        disabled: true,
        // dynamicProps: {
        //   disabled: ({ record }) => {
        //     if (record.get('componentType') !== 'lov') {
        //       return true;
        //     } else return false;
        //   },
        //   required: ({ record }) => {
        //     if (record.get('componentType') === 'lov') {
        //       return true;
        //     } else return false;
        //   },
        // },
      },
      {
        name: 'valueField',
        type: 'string',
        label: intl.get('spfm.configServer.model.field.valueField').d('数据字段'),
        disabled: true,
        // dynamicProps: {
        //   disabled: ({ record }) => {
        //     if (record.get('componentType') !== 'lov') {
        //       return true;
        //     } else return false;
        //   },
        //   required: ({ record }) => {
        //     if (record.get('componentType') === 'lov') {
        //       return true;
        //     } else return false;
        //   },
        // },
      },
      {
        name: 'requiredFlag',
        type: 'boolean',
        label: intl.get('spfm.configServer.model.field.required').d('是否必输'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        required: true,
      },
      {
        name: '_encryption',
        type: 'string',
        label: intl.get('spfm.configServer.model.field.encryption').d('加密类型'),
      },
      {
        name: 'pattern',
        type: 'string',
        label: intl.get('spfm.entityDefine.model.entityDefine.pattern').d('正则校验'),
        dynamicProps: {
          disabled: ({ record }) => record.get('valueType') === 'number',
        },
      },
      {
        name: 'mockValue',
        label: intl.get('spfm.entityDefine.model.entityDefine.mockValue').d('示例值'),
        // dynamicProps: {
        //   type: ({ record }) => record.get('valueType') || 'intl',
        // },
        type: 'intl',
      },
    ],
    queryFields: [
      {
        name: 'name',
        type: 'string',
        label: intl.get('spfm.configServer.model.order.fieldName').d('字段编码'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.configServer.model.field.mallName').d('字段名称'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_ADAPTOR}/v1/adaptor-entity-fields/${data?.structureId ?? ''}`,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_ADAPTOR}/v1/adaptor-entity-fields`,
          method: 'DELETE',
          body: { ...data },
        };
      },
    },
  };
}

export { getEntityDs, getEntityRecordDs, getEntityFieldsDs };
