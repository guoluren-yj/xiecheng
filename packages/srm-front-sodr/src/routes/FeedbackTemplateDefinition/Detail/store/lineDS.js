/*
 * @Description:
 * @Date: 2020-09-06 10:38:14
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SIEC } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { NOT_SPECIAL } from '@/utils/regExp';

const organizationId = getCurrentOrganizationId();

const lineDS = () => ({
  primaryKey: 'fieldId',
  // autoQuery: true,
  selection: false,
  fields: [
    {
      name: 'fieldType',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.fieldType').d('类型'),
    },
    {
      name: 'fieldCode',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.fieldCode').d('字段编码'),
    },
    {
      name: 'fieldName',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.fieldName').d('字段名称'),
    },
    {
      name: 'displayFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.displayFlag').d('是否显示'),
    },
    {
      name: 'requiredFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.requiredFlag').d('是否必输'),
    },
    {
      name: 'editorFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.exec.editorFlag').d('是否可编辑'),
    },
    {
      name: 'splitDisplayFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.splitDisplayFlag').d('拆行是否允许显示'),
    },
    {
      name: 'splitEditorFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.splitEditorFlag').d('拆行是否允许编辑'),
    },
    {
      name: 'searchFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.searchFlag').d('是否作为查询条件'),
    },
    // {
    //   name: 'componentFlag',
    //   label: intl.get('sodr.feedback.model.feedback.componentFlag').d('组件级展示'),
    // },
    {
      name: 'fieldLocation',
      label: intl.get('sodr.feedback.model.feedback.fieldLocation').d('位置'),
    },
    {
      name: 'fieldWidth',
      label: intl.get('sodr.feedback.model.feedback.fieldWidth').d('宽度'),
    },
    {
      name: 'componentTypeName',
      label: intl.get('sodr.feedback.model.feedback.componentTypeName').d('组件类型'),
    },
    {
      name: 'valueSet',
      label: intl.get('sodr.feedback.model.feedback.valueSet').d('值集编码'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.enabledFlagStatus').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('sodr.feedback.model.feedback.operator').d('操作'),
    },
  ],
  queryFields: [
    {
      name: 'fieldName',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.fieldName').d('字段名称'),
    },
    {
      name: 'enabledFlag',
      label: intl.get('sodr.feedback.model.feedback.enabledFlagStatus').d('状态'),
      lookupCode: 'HPFM.ENABLED_FLAG',
    },
  ],
  transport: {
    read: ({ data }) => {
      const queryUrl = isTenantRoleLevel() ? 'list' : 'platform-list';
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/feed-back-field/${queryUrl}`,
        method: 'GET',
        data,
      };
    },
  },
});

// 基础维度值集参数ds
const basicDrawerLovParamDS = (enabledEdit) => ({
  primaryKey: 'lovParamId',
  selection: enabledEdit ? 'multiple' : false,
  // table表单显示的字段
  fields: [
    {
      name: 'paramName',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.paramName').d('参数名'),
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('paramName'))) {
          return intl
            .get('ssrc.priceLibDimension.paramName.validation.notChinese')
            .d('参数不能为中文');
        }
        if (NOT_SPECIAL.test(record.get('paramName'))) {
          return intl.get('hzero.common.validation.notSpecial').d('参数不能为特殊字符');
        }
        return true;
      },
      transformRequest: (value) => value && value.replace(/\s/g, ''),
    },
    {
      name: 'paramType',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.paramType').d('参数类型'),
      lookupCode: 'SFBK.FEEDBACK_LOV_PARAM_TYPE',
      defaultValue: 'FIXED_VALUE',
    },
    {
      name: 'paramValueLOV',
      type: 'object',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimension').d('维度'),
      lovCode: 'SFBK.FEEDBACK_FIELD',
      valueField: 'fieldCode',
      textField: 'fieldName',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ dataSet }) => ({
          templateId: dataSet.queryParameter.templateId,
          tenantId: organizationId,
          fieldId: dataSet.queryParameter.fieldId,
        }),
        required: ({ record }) => record && record.get('paramType') === 'DIMENSION',
      },
    },
    {
      name: 'paramValueMeaning',
      type: 'string',
      bind: 'paramValueLOV.fieldName',
    },
    {
      name: 'paramValue',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.paramValue').d('参数值'),
      dynamicProps: {
        bind: ({ record }) =>
          record && record.get('paramType') === 'DIMENSION' ? 'paramValueLOV.fieldCode' : null,
      },
    },
    {
      name: 'applyQueryFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.applyQueryFlag').d('适用查询条件'),
      // dynamicProps: {
      //   disabled: ({ record }) => {
      //     return record.get('paramType') !== 'FIXED_VALUE'; // 不为固定值时禁用
      //   },
      // },
    },
  ],

  events: {
    update: ({ record, name, value }) => {
      // 参数类型
      if (name === 'paramType') {
        record.set('paramValue', undefined);
        record.set('paramValueLOV', undefined);
        record.set('paramValueMeaning', undefined);
        record.set('applyQueryFlag', 0);
      }
      // 维度
      if (name === 'paramValueLOV') {
        if (value) {
          record.set('paramName', value.fieldCode);
        }
      }
    },
  },

  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { fieldId } = {} } = dataSet;
      const queryUrl = isTenantRoleLevel() ? 'tenant' : 'site';
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/feedback-template-field-lov-params/${queryUrl}`,
        method: 'GET',
        data: {
          fieldId,
        },
      };
    },
    destroy: ({ data }) => {
      const deleteUrl = isTenantRoleLevel() ? 'tenant/batch-delete' : 'platform/batch-delete';
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/feedback-template-field-lov-params/${deleteUrl}`,
        data,
        method: 'DELETE',
      };
    },
  },
});

// 基础维度值集映射ds
const basicDrawerLovMapDS = (enabledEdit) => ({
  // autoQuery: true,
  primaryKey: 'lovMapId',
  selection: enabledEdit ? 'multiple' : false,

  // table表单显示的字段
  fields: [
    {
      name: 'sourceFromField',
      type: 'string',
      //   required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.paramName').d('参数名'),
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('sourceFromField'))) {
          return intl
            .get('ssrc.priceLibDimension.paramName.validation.notChinese')
            .d('参数不能为中文');
        }
        if (NOT_SPECIAL.test(record.get('sourceFromField'))) {
          return intl.get('hzero.common.validation.notSpecial').d('参数不能为特殊字符');
        }
        return true;
      },
      transformRequest: (value) => value && value.replace(/\s/g, ''),
      //  bind: 'paramValueLOV.fieldCode',
    },
    {
      name: 'paramValueLOV',
      type: 'object',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimension').d('维度'),
      // lovCode: 'HPFM.CUST.RELATE.FIELD.LIST',
      valueField: 'fieldCode',
      textField: 'fieldName',
      ignore: 'always',
      required: true,
      //  lovDefineUrl:`hpfm/v1/${organizationId}/unit-config/lov/table-field`,
      //  lovQueryUrl:`hpfm/v1/${organizationId}/unit-config/lov/table-field`,
      // lovQueryAxiosConfig: (lovCode) => {
      //   return {
      //     url: `/hpfm/v1/${organizationId}/unit-config/lov/table-field`,
      //     method: 'GET',
      //     params: {
      //       tenantId: organizationId,
      //       viewCode: lovCode,
      //     },
      //   };
      // },
      // dynamicProps: {
      //   lovPara: ({ dataSet }) => {
      //     return { tenantId: organizationId,templateId: dataSet.queryParameter.templateId}
      //   },
      // lovQueryUrl: () => {
      //   return `/hpfm/v1/${organizationId}/unit-config/lov/table-field`
      // },
      // lovCode: ({ dataSet }) => {
      //   return dataSet.queryParameter.lovCode
      // },
      // required: ({ record }) => record && record.get('paramType') === 'DIMENSION',
      // },
    },
    {
      name: 'sourceFromFieldName',
      type: 'string',
      bind: 'paramValueLOV.fieldName',
      label: intl.get('ssrc.priceLibDimension.model.dimension.paramValue').d('参数值'),
    },
    // {
    //   name: 'paramValue',
    //   type: 'string',
    //   label: intl.get('ssrc.priceLibDimension.model.dimension.paramValue').d('参数值'),
    //   bind: 'paramValueLOV.fieldCode',
    // },
    {
      name: 'targetValueLOV',
      type: 'object',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimension').d('维度'),
      lovCode: 'SFBK.FEEDBACK_FIELD',
      valueField: 'fieldCode',
      textField: 'fieldName',
      ignore: 'always',
      required: true,
      dynamicProps: {
        lovPara: ({ dataSet }) => ({
          templateId: dataSet.queryParameter.templateId,
          tenantId: organizationId,
          lovMapFlag: 1,
        }),
        // required: ({ record }) => record && record.get('paramType') === 'DIMENSION',
      },
    },
    {
      name: 'targetFieldName',
      type: 'string',
      bind: 'targetValueLOV.fieldName',
    },
    {
      name: 'targetFieldCode',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.targetFieldCode').d('映射目标字段'),
      bind: 'targetValueLOV.fieldCode',
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      // 维度
      if (name === 'paramValueLOV') {
        if (value) {
          record.set('sourceFromField', value.fieldCode);
        }
      }
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { fieldId } = {} } = dataSet;
      const queryUrl = isTenantRoleLevel() ? 'tenant' : 'site';
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/feedback-template-field-lov-maps/${queryUrl}`,
        method: 'GET',
        data: {
          fieldId,
        },
      };
    },
    destroy: ({ data }) => {
      const deleteUrl = isTenantRoleLevel() ? 'tenant/batch-delete' : 'platform/batch-delete';
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/feedback-template-field-lov-maps/${deleteUrl}`,
        data,
        method: 'DELETE',
      };
    },
  },
});

const drawerFieldsDisabled = (record) =>
  record.get('fieldCode') === 'createdBy' ||
  record.get('fieldCode') === 'creationDate' ||
  record.get('fieldCode') === 'feedbackNum' ||
  record.get('fieldCode') === 'feedbackStatusCode' ||
  record.get('fieldCode') === 'feedbackLineNum';

const basicDrawerFormDS = (editAble) => ({
  fields: [
    {
      name: 'fieldCode',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.fieldCode').d('字段编码'),
      required: true,
      validator: (value) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(value)) {
          return intl.get('sodr.feedback.model.feedback.notChinese').d('字段编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'fieldName',
      type: 'intl',
      label: intl.get('sodr.feedback.model.feedback.fieldName').d('字段名称'),
      required: true,
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.enabledFlag').d('是否启用'),
    },
    {
      name: 'displayFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.displayFlag').d('是否显示'),
    },
    {
      name: 'requiredFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.requiredFlag').d('是否必输'),
      dynamicProps: ({ record }) => {
        return {
          disabled: drawerFieldsDisabled(record),
        };
      },
    },
    {
      name: 'editorFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.editorFlag').d('是否可编辑'),
      dynamicProps: ({ record }) => {
        return {
          disabled: drawerFieldsDisabled(record),
        };
      },
    },
    {
      name: 'splitDisplayFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.splitDisplayFlag').d('拆行是否显示'),
      // dynamicProps: ({ record }) => {
      //   return {
      //     disabled: record.get('fieldCode') === 'feedbackNum',
      //   };
      // },
    },
    {
      name: 'splitEditorFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.splitEditorFlag').d('拆行是否编辑'),
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('splitDisplayFlag') === 0 || drawerFieldsDisabled(record),
        };
      },
    },
    {
      name: 'searchFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.searchFlag').d('是否作为查询条件'),
      // dynamicProps: {
      //   disabled: ({ record }) => {
      //     if (
      //       record.get('componentType') === 'UPLOAD' ||
      //       record.get('componentType') === 'LINK' ||
      //       record.get('fieldCode') === 'feedbackNum'
      //     ) {
      //       return true;
      //     } else {
      //       return false;
      //     }
      //   },
      // },
    },
    {
      name: 'importFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.importFlag').d('是否批量导入'),
      dynamicProps: ({ record }) => {
        return {
          disabled: drawerFieldsDisabled(record),
        };
      },
    },
    {
      name: 'displayCamp',
      label: intl.get('sodr.feedback.model.feedback.displayCamp').d('显示阵营'),
      lookupCode: 'SFBK.FEEDBACK_SPLIT_CAMP',
      required: editAble,
    },
    {
      name: 'editCamp',
      label: intl.get('sodr.feedback.model.feedback.editCamp').d('编辑阵营'),
      lookupCode: 'SFBK.FEEDBACK_SPLIT_CAMP',
      required: editAble,
      dynamicProps: {
        required({ record }) {
          return (
            editAble && (record.get('editorFlag') === 1 || record.get('splitEditorFlag') === 1)
          );
        },
        disabled({ record }) {
          return !(
            editAble &&
            (record.get('editorFlag') === 1 || record.get('splitEditorFlag') === 1)
          );
        },
      },
    },
    {
      name: 'editAuthorityId',
      label: intl.get('sodr.feedback.model.feedback.editAuthorityId').d('编辑权限'),
      type: 'object',
      lovCode: 'SFBK.FEEDBACK_CAMP_ROLE',
      multiple: true,
      transformResponse: (value, object) => object?.editAuthorityNameList,
      transformRequest: (value) => {
        return String((value || []).map((i) => i.id));
      },
      dynamicProps: {
        disabled({ record }) {
          return !record.get('editCamp') || !record.get('editCamp').includes('COMPANY');
        },
      },
    },
    {
      name: 'fieldWidth',
      type: 'number',
      step: 1,
      required: true,
      min: 1,
      defaultValue: 100,
      label: intl.get('sodr.feedback.model.feedback.fieldWidth').d('字段宽度'),
    },
    {
      name: 'fieldLocation',
      type: 'number',
      step: 1,
      min: 0,
      label: intl.get('sodr.feedback.model.feedback.fieldLocation').d('字段位置'),
      required: true,
    },
    {
      name: 'componentType',
      label: intl.get('sodr.feedback.model.feedback.componentType').d('字段组件类型'),
      lookupCode: 'SPUC.FEED_BACK_COMPONENT',
      required: true,
    },
    {
      name: 'valueSetLov',
      type: 'object',
      label: intl.get('sodr.feedback.model.feedback.valueSet').d('值集编码'),
      dynamicProps: {
        required: ({ record }) =>
          record.get('componentType') === 'SELECT' || record.get('componentType') === 'LOV',
        textField: ({ record }) => {
          if (record.get('componentType') === 'LOV') {
            return 'viewCode';
          } else if (record.get('componentType') === 'SELECT') {
            return 'lovCode';
          }
        },
      },
    },
    {
      name: 'valueSet',
      type: 'string',
      dynamicProps: {
        bind: ({ record }) => {
          if (record.get('componentType') === 'LOV') {
            return 'valueSetLov.viewCode';
          } else if (record.get('componentType') === 'SELECT') {
            return 'valueSetLov.lovCode';
          }
        },
      },
    },
    {
      name: 'displayField', // 用于`默认值`为lov情况下, 取值
      type: 'string',
      bind: 'valueSetLov.displayField',
    },
    {
      name: 'valueField', // 用于`默认值`为lov情况下, 取值
      type: 'string',
      bind: 'valueSetLov.valueField',
    },
    {
      name: 'defaultValueLov',
      label: intl.get('sodr.feedback.model.feedback.defaultValue').d('默认值'),
      dynamicProps: {
        textField: ({ record }) => record.get('displayField'),
        lovCode: ({ record }) => record.get('valueSet') || '',
      },
    },
    {
      name: 'defaultValue',
      label: intl.get('sodr.feedback.model.feedback.defaultValue').d('默认值'),
      transformResponse: (val, data) => (data.componentType === 'SWITCH' ? Number(val) : val),
    },
    {
      name: 'defaultValueMeaning',
      type: 'string',
      dynamicProps: {
        bind: ({ record }) =>
          record.get('displayField') ? `defaultValueLov.${record.get('displayField')}` : '',
      },
    },
    {
      name: 'defaultValueCode',
      type: 'string',
      dynamicProps: {
        bind: ({ record }) =>
          record.get('valueField') ? `defaultValueLov.${record.get('valueField')}` : '',
      },
    },
    {
      name: 'multipleFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.multipleFlag').d('是否多选'),
    },
    {
      name: 'bucketName',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.bucketName').d('桶名'),
    },
    {
      name: 'directoryName',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.bucketDirectory').d('目录名'),
    },
    {
      name: 'dateFormat',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.dateFormat').d('日期格式'),
      lookupCode: 'SSRC.PRICE_LIB_DATE_FORMAT',
    },
    {
      name: 'linkTitle',
      type: 'intl',
      label: intl.get('sodr.feedback.model.feedback.linkTitle').d('标题'),
      dynamicProps: {
        required: ({ record }) => record.get('componentType') === 'LINK',
      },
    },
    {
      name: 'linkUrl',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.linkHref').d('URL'),
      dynamicProps: {
        required: ({ record }) => record.get('componentType') === 'LINK',
      },
    },
    {
      name: 'linkType',
      label: intl.get('sodr.feedback.model.feedback.linkType').d('链接类型'),
      lookupCode: 'SFBK.FEEDBACK_LINK_TYPE',
      dynamicProps: {
        required: ({ record }) => record.get('componentType') === 'LINK',
      },
    },
    // {
    //   name: 'isNewWindow',
    //   label: intl.get('sodr.feedback.model.feedback.isNewWindow').d('是否新窗口打开'),
    //   type: 'boolean',
    //   trueValue: 1,
    //   falseValue: 0,
    //   dynamicProps: {
    //     disabled: ({ record }) => record.get('linkType') !== 'OUTSIDE',
    //   },
    // },
    // {
    //   name: 'templateCode',
    //   type: 'string',
    //   bind: 'valueSet.templateCode',
    // },
    // {
    //   name: 'templateName',
    //   type: 'string',
    //   bind: 'valueSet.templateName',
    // },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'splitDisplayFlag' && value === 0) {
        record.set('splitEditorFlag', 0);
      }
      if (name === 'editorFlag') {
        record.set({ editCamp: null, editAuthorityId: null });
      }
      if (name === 'linkType') {
        record.set({ isNewWindow: 0 });
      }
    },
  },
  // transport: {
  //   read: ({ data }) => {
  //     const { rcvTrxHeaderId, ...other } = data.params || {};
  //     return {
  //       url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/${rcvTrxHeaderId}/detail`,
  //       method: 'GET',
  //       data: other,
  //     };
  //   },
  // },
});

const mapDS = () => ({
  primaryKey: 'mappingId',
  selection: false,

  fields: [
    {
      name: 'sourceFrom',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.sourceFrom').d('来源单据'),
    },
    {
      name: 'sourceField',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.sourceField').d('来源单据字段'),
    },
    {
      name: 'sourceName',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.sourceName').d('来源单据字段名'),
    },
  ],
  transport: {
    read: ({ data: { params = {} } }) => {
      const queryUrl = isTenantRoleLevel() ? 'mapping/list' : 'mapping/list-platform';
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/${queryUrl}`,
        method: 'GET',
        data: params,
      };
    },
    destroy: ({ data }) => {
      const deleteUrl = isTenantRoleLevel() ? 'mapping' : 'mapping/platform';
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/${deleteUrl}`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const specialDS = (editAble) => ({
  primaryKey: 'specialId',
  selection: editAble ? 'multiple' : false,
  fields: [
    {
      name: 'priorityNumber',
      type: 'number',
      step: 1,
      min: 1,
      label: intl.get('sodr.feedback.model.feedback.priorityNumber').d('优先级'),
      required: true,
    },
    {
      name: 'triggerConditions',
      label: intl.get('sodr.feedback.model.feedback.triggerConditions').d('触发计算条件'),
      lookupCode: 'SFBK.TIGGER_CONDITIONS',
      required: true,
    },
    {
      name: 'funcitonName',
      label: intl.get('sodr.feedback.model.feedback.funcitonName').d('函数名/任务名'),
      dynamicProps: {
        required: ({ record }) =>
          ['SYNCHRONOUS', 'TIMING'].includes(record.get('triggerConditions')),
      },
    },
    {
      name: 'funcitonDesc',
      label: intl.get('sodr.feedback.model.feedback.funcitonDesc').d('自定义sql'),
    },
    {
      name: 'action',
      label: intl.get('sodr.feedback.model.feedback.action').d('操作'),
    },
  ],
  transport: {
    read: ({ data: { params = {} } }) => {
      const queryUrl = isTenantRoleLevel() ? 'special/list' : 'special/list-platform';
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/${queryUrl}`,
        method: 'GET',
        data: params,
      };
    },
    destroy: ({ data }) => {
      const deleteUrl = isTenantRoleLevel() ? 'special' : 'special/platform';
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/${deleteUrl}`,
        method: 'DELETE',
        data,
      };
    },
  },
  events: {
    update: ({ record, name }) => {
      if (name === 'triggerConditions') {
        record.set({ funcitonName: null, funcitonDesc: null });
      }
    },
  },
});

export { lineDS, basicDrawerLovMapDS, basicDrawerLovParamDS, basicDrawerFormDS, mapDS, specialDS };
