import intl from 'utils/intl';
import { isString } from 'lodash';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import { flagNames } from './utils';

const organizationId = getCurrentOrganizationId();
const SRM_MALLCART = '/smct';

const dimensionList = {};

const importCheckValidator = value => {
  if (value?.[flagNames.importCheckFlag] === 1) {
    return intl.get('small.cartTemplate.view.invalidValueMsg').d('字段值无效，请重新选择。');
  }
};

export const baseInfoDS = () => ({
  autoQuery: false,
  selection: false,
  forceValidate: true,
  fields: [
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.handle`).d('模板编码'),
      name: 'templateCode',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.templateName`).d('模板名称'),
      type: 'intl',
      name: 'templateName',
      required: true,
      validator: (val) => {
        if (val.length > 4) {
          return intl.get('small.common.cartTemplateDefinition.maxLength').d('名称最大长度为4');
        }
      },
    },
    {
      name: 'status',
      label: intl.get(`small.common.cartTemplateDefinition.model.status`).d('状态'),
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.version`).d('版本'),
      name: 'version',
    },
    {
      label: intl.get('small.common.table.column.remark').d('备注'),
      name: 'remark',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url:
          organizationId === 0
            ? `${SRM_MALLCART}/v1/dimensiontemplates`
            : `${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates/list`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode:
            organizationId === 0
              ? 'CART-TEMPLATE_DEFINITION.SEARCH_BAR'
              : 'SMALL_TEMPLATE-LIST.SEARCH_BAR',
        },
      };
    },
    submit: ({data}) => {
      return {
        url:
          organizationId === 0
            ? `${SRM_MALLCART}/v1/dimensiontemplates`
            : `${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates`,
        method: 'PUT',
        data: data[0],
      };
    },
  },
});

/* 表格 */
export const createDS = () => ({
  autoQuery: false,
  selection: false,
  pageSize: 20,
  fields: [
    {
      label: intl.get('small.common.model.status').d('状态'),
      name: 'enabledFlag',
    },
    {
      label: intl.get(`small.common.table.dimension.type`).d('维度类型'),
      type: 'string',
      name: 'dimensionTypeMeaning',
    },
    {
      label: intl.get(`small.common.detail.if.split.order`).d('是否拆单'),
      name: 'splitFlagMeaning',
    },
    {
      label: intl.get(`small.common.detail.if.budget.dimension`).d('是否预算维度'),
      name: 'budgetFlagMeaning',
    },
    {
      label: intl.get(`small.common.table.dimension.code`).d('维度编码'),
      name: 'dimensionCode',
      type: 'string',
    },
    {
      label: intl.get(`small.common.table.dimension.name`).d('维度名称'),
      type: 'intl',
      name: 'dimensionName',
    },
    {
      label: intl.get(`small.common.table.if.show`).d('是否显示'),
      name: 'displayFlagMeaning',
      type: 'string',
    },
    {
      label: intl.get(`small.common.table.isMust.write`).d('是否必输'),
      name: 'necessaryFlagMeaning',
      type: 'string',
    },
    {
      label: intl.get(`small.common.table.enable.write`).d('是否启用'),
      name: 'enabledFlagMeaning',
      type: 'string',
    },
    {
      label: intl.get(`small.common.table.field.code`).d('值集编码'),
      name: 'fieldCode',
    },
    {
      label: intl.get(`small.common.table.is.Edit`).d('是否可编辑'),
      type: 'string',
      name: 'editFlagMeaning',
      align: 'left',
    },
    {
      label: intl.get(`small.common.table.model.isOpen`).d('是否启用'),
      type: 'string',
      name: 'enabledFlagMeaning',
    },
    {
      label: intl.get(`small.common.table.component.type`).d('组件类型'),
      type: 'string',
      name: 'componentTypeName',
    },
    {
      label: intl.get(`small.common.table.params.delete`).d('操作'),
      name: 'edit',
      type: 'string',
    },
    {
      label: intl.get(`small.common.table.columns.col`).d('列'),
      type: 'number',
      name: 'colSeq',
    },
    {
      label: intl.get(`small.common.table.columns.row`).d('行'),
      type: 'number',
      name: 'rowSeq',
    },
    {
      label: intl.get('small.common.detail.field.merge').d('合并维度'),
      name: 'mergeFlagMeaning',
    },
    {
      name: 'encryptFlagMeaning',
      label: intl.get('small.common.detail.field.encryptFlag').d('是否加密'),
    },
    {
      name: 'productDimensionFlagMeaning',
      label: intl.get('small.cartTemplate.field.productCustDim').d('是否价格权限维度'),
    },
    {
      label: intl.get(`small.common.detail.model.batchFlag`).d('是否批量'),
      name: 'batchFlagMeaning',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url:
          organizationId === 0
            ? `${SRM_MALLCART}/v1/dimensions`
            : `${SRM_MALLCART}/v1/${organizationId}/dimensions`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode:
            organizationId === 0
              ? 'TEMPLATE_DETAIL.FILTER_BAR'
              : 'SMALL_TEMPLATE_DISTRIBUTE.SEARCH_BAR',
        },
      };
    },
  },
});

/* 编辑购物车分配模板 */
export const detailDS = () => ({
  autoQuery: false,
  selection: false,
  forceValidate: true,
  fields: [
    {
      label: intl.get(`small.common.detail.dimension.code`).d('维度编码'),
      name: 'dimensionCode',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`small.common.detail.dimension.name`).d('维度名称'),
      type: 'intl',
      required: true,
      name: 'dimensionName',
    },
    {
      label: intl.get(`small.common.detail.if.show`).d('是否显示'),
      name: 'displayFlag',
      type: 'number',
      required: true,
      lookupCode: 'HPFM.FLAG',
    },
    {
      label: intl.get(`small.common.detail.if.split.order`).d('是否拆单'),
      name: 'splitFlag',
      type: 'number',
      required: true,
      lookupCode: 'HPFM.FLAG',
    },
    {
      label: intl.get(`small.common.detail.if.budget.dimension`).d('是否预算维度'),
      name: 'budgetFlag',
      type: 'number',
      required: true,
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'displayFlagMeaning',
      type: 'string',
    },
    {
      label: intl.get(`small.common.detail.isMust.write`).d('是否必输'),
      name: 'necessaryFlag',
      type: 'number',
      required: true,
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'necessaryFlagMeaning',
      type: 'string',
    },
    {
      label: intl.get(`small.common.detail.is.Edit`).d('是否可编辑'),
      type: 'number',
      name: 'editFlag',
      required: true,
      align: 'left',
      lookupCode: 'HPFM.FLAG',
    },
    {
      type: 'string',
      name: 'editFlagMeaning',
    },
    {
      label: intl.get(`small.common.detail.model.isOpen`).d('是否启用'),
      type: 'number',
      name: 'enabledFlag',
      required: true,
      lookupCode: 'HPFM.FLAG',
    },
    {
      type: 'string',
      name: 'enabledFlagMEAning',
    },
    {
      label: intl.get(`small.common.detail.component.type`).d('组件类型'),
      type: 'string',
      name: 'componentType',
      required: true,
      lookupCode: 'SMCT.FIELD_COMPONENT',
    },
    {
      type: 'string',
      name: 'componentTypeMeaning',
    },
    {
      name: 'fieldLengthObj',
      label: intl.get('small.common.detail.field.length').d('字段长度'),
      type: 'number',
      range: ['minLength', 'maxLength'],
      step: 1,
      min: 1,
    },
    {
      name: 'proDefaultFlag',
      label: intl.get('small.common.detail.field.proDefaultFlag').d('默认值类型'),
      lookupCode: 'SMCT.DEFAULT_VALUE_TYPE',
      type: 'string',
      transformResponse: (value, record) => {
        const { defaultType } = record || {};
        return ['COMMON', 'FORMULA'].includes(defaultType) ? defaultType : 'COMMON';
      },
    },
    {
      label: intl.get(`small.common.detail.field.code`).d('值集编码'),
      name: 'lovCode',
    },
    {
      label: intl.get(`small.common.detail.field.code`).d('值集编码'),
      name: 'lovCodeLov',
      type: 'object',
      lovPara: { tenantId: organizationId },
      computedProps: {
        lovCode: ({ record }) =>
          record?.get('componentType') === 'LOV'
            ? isTenantRoleLevel()
              ? 'HPFM.LOV.VIEW.ORG'
              : 'HPFM.LOV_VIEW'
            : isTenantRoleLevel()
            ? 'HPFM.LOV.LOV_DETAIL.ORG'
            : 'HPFM.LOV.LOV_DETAIL',
        required: ({ record }) => ['LOV', 'SELECT'].includes(record?.get('componentType')),
        textField: ({ record }) => {
          return record?.get('componentType') === 'LOV' ? 'viewCode' : 'lovCode';
        },
      },
    },
    {
      label: intl.get(`small.common.detail.params.name`).d('参数名'),
      name: 'parameterKey',
      type: 'string',
    },
    {
      label: intl.get(`small.common.detail.params.type`).d('参数类型'),
      name: 'parameterType',
      type: 'string',
      lookupCode: 'SMCT.PARAM_TYPE',
    },
    {
      label: intl.get(`small.common.detail.params.value`).d('参数值'),
      name: 'parameterValue',
      type: 'string',
    },
    {
      label: intl.get(`small.common.detail.params.delete`).d('操作'),
      name: 'delete',
      type: 'string',
    },
    {
      label: intl.get('small.common.detail.field.binding').d('字段绑定'),
      type: 'string',
      name: 'fieldBinding',
    },
    {
      label: intl.get('small.common.detail.field.merge').d('合并维度'),
      type: 'string',
      name: 'mergeFlag',
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'defaultValue',
      type: 'string',
      label: intl.get('small.common.detail.field.defaultValue').d('默认值'),
      transformResponse: (value, record) => record.defaultValueMeaning || value,
    },
    {
      name: 'defaultValue_component',
      trueValue: '1',
      falseValue: '0',
      computedProps: {
        lookupCode: ({ record }) => {
          return record.get('lovCode');
        },
        type: ({ record }) => {
          const componentType = record.get('componentType');
          let type;
          switch (componentType) {
            case 'SWITCH':
              type = 'boolean';
              break;
            case 'DATE_PICKER':
              type = 'dateTime';
              break;
            default:
              type = 'string';
              break;
          }
          return type;
        },
      },
      label: intl.get('small.common.detail.field.defaultValue').d('默认值'),
    },
    {
      name: 'defaultValue_LOV',
      type: 'object',
      lovPara: { tenantId: organizationId },
      computedProps: {
        lovCode: ({ record }) => record.get('lovCode'),
      },
      validator: importCheckValidator,
      label: intl.get('small.common.detail.field.defaultValue').d('默认值'),
    },
    {
      name: 'defaultType',
      type: 'number',
      required: true,
      lookupCode: 'HPFM.FLAG',
      label: intl.get('small.common.detail.field.defaultType').d('特殊默认'),
      transformResponse: (value) => {
        return value === 'SPECIAL' ? 1 : 0;
      },
      transformRequest: (value, record) => {
        const { proDefaultFlag, componentType } = record.get(['proDefaultFlag', 'componentType']);
        return value === 1 ? 'SPECIAL' : componentType === 'DATE_PICKER' ? proDefaultFlag : null;
      },
    },
    {
      name: 'specialDefaultValue',
      label: intl.get('small.common.detail.field.adaptor').d('适配器'),
      lookupCode: 'SMCT.COMMON_ADAPTOR',
    },
    {
      name: 'encryptFlag',
      type: 'number',
      required: true,
      lookupCode: 'HPFM.FLAG',
      label: intl.get('small.common.detail.field.encryptFlag').d('是否加密'),
    },
    {
      name: 'encryptFlagMeaning',
    },
    {
      name: 'productDimensionFlag',
      type: 'number',
      lookupCode: 'HPFM.FLAG',
      label: intl.get('small.cartTemplate.field.productCustDim').d('是否价格权限维度'),
    },
    {
      name: 'treeSelectFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'translateFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'annotation',
      type: 'intl',
      maxLength: 100,
      label: intl.get('small.cartTemplate.field.fieldTips').d('气泡提示'),
    },
    {
      label: intl.get(`small.common.detail.model.batchFlag`).d('是否批量'),
      type: 'number',
      name: 'batchFlag',
      required: true,
      lookupCode: 'HPFM.FLAG',
    },
  ],
  transport: {
    destroy: ({ data }) => ({
      url:
        organizationId === 0
          ? `${SRM_MALLCART}/v1/dimensions/delete-parameter`
          : `${SRM_MALLCART}/v1/dimensions/delete-parameter`,
      method: 'DELETE',
      data,
    }),
  },
  events: {
    update({ record, name, value }) {
      const flagList = ['necessaryFlag', 'enabledFlag', 'displayFlag', 'editFlag', 'encryptFlag'];
      if (flagList.includes(name)) {
        record.set(`${name}Meaning`, record.getField(name).getText(value));
      } else if (name === ' componentType') {
        record.set('componentTypeMeaning', record.getField('componentType').getText(value));
        // 清除错误校验
        if (!['INPUT', 'TEXT_AREA'].includes(value)) {
          record.set('fieldLengthObj', {});
        }
        record.set('proDefaultFlag', 'COMMON');
      } else if (name === 'lovCodeLov') {
        if (record?.get('componentType') === 'LOV') {
          record.set('lovCode', value?.viewCode);
        } else {
          record.set('lovCode', value?.lovCode);
        }
      } else if (name === 'defaultValue_component' && record.get('componentType') === 'SELECT') {
        record.set(
          'defaultValue_componentMeaning',
          record.getField('defaultValue_component').getText(value)
        );
      }
      if (name === 'defaultType') {
        if (value) {
          record.set('defaultValue_component', null);
          record.set('defaultValue_componentMeaning', null);
          record.set('defaultValue_LOV', null);
        } else {
          record.set('specialDefaultValue', null);
        }
      }
      // 公式清空固定默认值
      if(name === 'proDefaultFlag' && value === 'FORMULA') {
        record.set('defaultValue_component', null);
        record.set('defaultValue_componentMeaning', null);
      }
    },
  },
});

/* 值集参数配置  */
export const fieldDS = templateId => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get(`small.common.detail.params.name`).d('参数名'),
      name: 'parameterKey',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`small.common.detail.params.type`).d('参数类型'),
      name: 'parameterType',
      type: 'string',
      required: true,
      lookupCode: 'SMCT.PARAM_TYPE',
    },
    {
      label: intl.get(`small.common.detail.params.value`).d('参数值'),
      name: 'parameterValue',
      required: true,
      computedProps: {
        lookupCode: ({ record }) => {
          return record.get('parameterType') === 'PRODUCT' && 'SMCT_PRODUCT_INFO';
        },
        valueField: ({ record }) =>
          record.get('parameterType') === 'PRODUCT' ? 'value' : 'dimensionId',
        textField: ({ record }) =>
          record.get('parameterType') === 'PRODUCT' ? 'meaning' : 'dimensionName',
        lookupAxiosConfig: ({ dataSet, record }) => {
          return (
            record.get('parameterType') === 'DIMENSION' && {
              url:
                organizationId === 0
                  ? `${SRM_MALLCART}/v1/dimensions/condition-select`
                  : `${SRM_MALLCART}/v1/${organizationId}/dimensions/condition-select`,
              params: {
                dimensionType: dataSet.getState('dimensionType'),
                templateId,
              },
              method: 'GET',
              transformResponse: res => {
                // eslint-disable-next-line no-param-reassign
                res = isString(res) ? JSON.parse(res) : res;
                if (res.failed) {
                  notification.error({ message: res.message });
                  return [];
                } else {
                  return (
                    res?.map(p => {
                      if (p.dimension && p.dimensionComponent) {
                        return { ...p.dimension, ...p.dimensionComponent };
                      } else {
                        return p;
                      }
                    }) || []
                  );
                }
              },
            }
          );
        },
      },
      transformResponse: (value, record) => {
        const { parameterDimensionId, parameterType } = record || {};
        if (parameterType === 'DIMENSION') {
          return parameterDimensionId;
        }
        return value;
      },
    },
    {
      label: intl.get(`small.common.table.params.delete`).d('操作'),
      name: 'edit',
    },
  ],
  events: {
    update: ({ name, record, value }) => {
      if (name === 'parameterValue' && record.get('parameterType') === 'DIMENSION') {
        record.set(
          'parameterDimensionId',
          record.getField('parameterValue').getLookupData(value).dimensionId
        );
      }
    },
  },
});

// 关联字段配置
export const associatDS = (templateId, dimensionType, ds) => ({
  autoQuery: false,
  selection: false,
  paging: false,
  fields: [
    {
      name: 'currentField',
      label: intl.get('small.common.model.associat.fieldCode').d('当前字段'),
      required: true,
      type: 'object',
      valueField: 'code',
      textField: 'name',
      computedProps: {
        lookupAxiosConfig: () => {
          const { lovCode, componentType } = ds.current?.data || {};
          return lovCode
            ? {
                url: `${SRM_MALLCART}/v1${
                  organizationId === 0 ? '/' : `/${organizationId}`
                }/dimensions/lov-info`,
                method: 'GET',
                params: {
                  lovCode,
                },
                transformResponse: res => {
                  const newRes = isString(res) ? JSON.parse(res) : res;
                  if (newRes.failed) {
                    if(componentType !== 'SELECT'){
                      notification.error({ message: newRes.message });
                    }
                    return [];
                  } else {
                    return newRes;
                  }
                },
              }
            : false;
        },
      },
    },
    {
      name: 'fieldCode',
      bind: 'currentField.code',
    },
    {
      name: 'fieldName',
      bind: 'currentField.name',
    },
    {
      name: 'targetDimension',
      label: intl.get('small.common.model.associat.targetDimension').d('目标维度'),
      required: true,
      type: 'object',
      noCache: true,
      valueField: 'dimensionId',
      textField: 'dimensionName',
      computedProps: {
        lookupAxiosConfig: () => {
          return {
            url:
              organizationId === 0
                ? `${SRM_MALLCART}/v1/dimensions/condition-select`
                : `${SRM_MALLCART}/v1/${organizationId}/dimensions/condition-select`,
            params: {
              dimensionType: dimensionType.includes('LINE')
                ? 'FIELD_RELATION_LINE'
                : 'FIELD_RELATION_HEADER',
              templateId,
            },
            method: 'GET',
            transformResponse: res => {
              const newRes = isString(res) ? JSON.parse(res) : res;
              if (newRes.failed) {
                notification.error({ message: newRes.message });
                return [];
              } else {
                return (
                  newRes?.map(p => {
                    if (p.dimension && p.dimensionComponent) {
                      return { ...p.dimension, ...p.dimensionComponent };
                    } else {
                      return p;
                    }
                  }) || []
                );
              }
            },
          };
        },
      },
    },
    {
      name: 'targetDimensionId',
      bind: 'targetDimension.dimensionId',
    },
    {
      name: 'targetDimensionCode',
      bind: 'targetDimension.dimensionCode',
    },
    {
      name: 'targetDimensionName',
      bind: 'targetDimension.dimensionName',
    },
    {
      name: 'targetComponentType',
      bind: 'targetDimension.componentType',
    },
    {
      name: 'targetField',
      label: intl.get('small.common.model.associat.targetFieldCode').d('目标字段'),
      required: true,
      type: 'object',
      valueField: 'code',
      textField: 'name',
      computedProps: {
        disabled: ({ record }) => {
          return record.get('targetComponentType') !== 'LOV';
        },
        lookupAxiosConfig: ({ record }) => {
          const { lovCode } = record.get('targetDimension') || {};
          return {
            url: `${SRM_MALLCART}/v1${
              organizationId === 0 ? '/' : `/${organizationId}`
            }/dimensions/lov-info`,
            method: 'GET',
            params: {
              lovCode: lovCode || record.get('lovCode'),
            },
            transformResponse: res => {
              const newRes = isString(res) ? JSON.parse(res) : res;
              if (newRes.failed) {
                if (record.get('targetComponentType') === 'LOV') {
                  notification.error({ message: newRes.message });
                }
                return [];
              } else {
                return newRes;
              }
            },
          };
        },
      },
    },
    {
      name: 'targetFieldCode',
      bind: 'targetField.code',
    },
    {
      name: 'targetFieldName',
      bind: 'targetField.name',
    },
    {
      label: intl.get(`small.common.table.params.delete`).d('操作'),
      name: 'edit',
    },
  ],
  events: {
    update: ({ record, name }) => {
      // 不是lov就赋值当前维度code
      if (name === 'targetDimension') {
        record.set(
          'targetField',
          record.get('targetComponentType') === 'LOV'
            ? null
            : {
                code: record.get('targetDimensionCode'),
                name: record.get('targetDimensionName'),
              }
        );
      }
    },
  },
});

/* fx配置列表 */
export const fxDS = templateId => ({
  autoQuery: false,
  selection: false,
  autoCreate: true,
  paging: false,
  forceValidate: true,
  fields: [
    {
      label: intl.get(`small.common.model.modal.dimension`).d('维度'),
      name: 'dimensionId',
      required: true,
      type: 'string',
      valueField: 'dimensionId',
      textField: 'dimensionName',
      noCache: true,
      computedProps: {
        lookupAxiosConfig: ({ dataSet }) => {
          const dimensionType = dataSet.getState('dimensionType');
          const conditionType = dataSet.getState('conditionType');
          return {
            url:
              organizationId === 0
                ? `${SRM_MALLCART}/v1/dimensions/condition-select`
                : `${SRM_MALLCART}/v1/${organizationId}/dimensions/condition-select`,
            params: {
              dimensionType: dataSet.getState('dimensionType'),
              templateId,
            },
            method: 'GET',
            transformResponse: response => {
              let r = {};
              try {
                r = JSON.parse(response);
              } catch {
                r = response;
              }
              if (r.failed) {
                notification.error({ message: r.message });
                return [];
              }
              if (dimensionType?.includes('LINE')) {
                if (!dimensionList[`${templateId}`]) {
                  dimensionList[`${templateId}`] = JSON.parse(JSON.stringify(r));
                }
                const res = dimensionList[`${templateId}`];
                if (
                  // 表格不能配置当前维度的隐藏
                  conditionType === 'DISPLAY'
                ) {
                  return (
                    res?.map(p => {
                      if (p.dimension && p.dimensionComponent) {
                        return { ...p.dimension, ...p.dimensionComponent };
                      } else {
                        return p;
                      }
                    }) || []
                  ).filter(p => !p.dimensionType?.includes('LINE'));
                } else {
                  return (
                    res?.map(p => {
                      if (p.dimension && p.dimensionComponent) {
                        return { ...p.dimension, ...p.dimensionComponent };
                      } else {
                        return p;
                      }
                    }) || []
                  );
                }
              } else {
                return (
                  r?.map(p => {
                    if (p.dimension && p.dimensionComponent) {
                      return { ...p.dimension, ...p.dimensionComponent };
                    } else {
                      return p;
                    }
                  }) || []
                );
              }
            },
          };
        },
      },
    },
    {
      label: intl.get(`small.common.model.view.condition`).d('条件'),
      // type: 'string',
      name: 'conditionExpression',
      lookupCode: 'SMCT.DIMENSION_CONDITION_RELATION',
      required: true,
    },
    {
      label: intl.get(`small.common.model.type.field`).d('字段类型'),
      // type: 'string',
      name: 'targetType',
      lookupCode: 'SMCT.DIMENSION_CONDITION_TYPE',
      computedProps: {
        required: ({ record }) =>
          record?.get('conditionExpression') !== 'ISNULL' &&
          record?.get('conditionExpression') !== 'NOTNULL',
      },
    },
    {
      label: intl.get(`small.common.model.value.field`).d('字段值'),
      type: 'string',
      name: 'targetValue',
      valueField: 'dimensionName',
      textField: 'dimensionName',
      noCache: true,
      computedProps: {
        required: ({ record }) =>
          record?.get('conditionExpression') !== 'ISNULL' &&
          record?.get('conditionExpression') !== 'NOTNULL' &&
          record?.get('componentType') &&
          record?.get('componentType') !== 'LOV',
        lookupAxiosConfig: ({ dataSet }) => {
          return {
            url:
              organizationId === 0
                ? `${SRM_MALLCART}/v1/dimensions/condition-select`
                : `${SRM_MALLCART}/v1/${organizationId}/dimensions/condition-select`,
            params: {
              dimensionType: dataSet.getState('dimensionType'),
              templateId,
            },
            method: 'GET',
            transformResponse: res => {
              let newRes = {};
              try {
                newRes = JSON.parse(res);
              } catch {
                newRes = res;
              }
              if (newRes.failed) {
                notification.error({ message: newRes.message });
                return [];
              } else {
                return (
                  newRes?.map(p => {
                    if (p.dimension && p.dimensionComponent) {
                      return { ...p.dimension, ...p.dimensionComponent };
                    } else {
                      return p;
                    }
                  }) || []
                );
              }
            },
          };
        },
      },
    },
    {
      label: intl.get(`small.common.model.value.field`).d('字段值'),
      name: 'targetValueSelect',
      computedProps: {
        required: ({ record }) =>
          record?.get('conditionExpression') !== 'ISNULL' &&
          record?.get('conditionExpression') !== 'NOTNULL' &&
          record?.get('componentType') === 'SELECT' &&
          record?.get('targetType') === 'FIXED',
        lookupCode: ({ record }) => {
          return record.get('lovCode');
        },
      },
    },
    {
      label: intl.get(`small.common.model.value.field`).d('字段值'),
      type: 'object',
      name: 'targetValueLov',
      computedProps: {
        required: ({ record }) =>
          record?.get('conditionExpression') !== 'ISNULL' &&
          record?.get('conditionExpression') !== 'NOTNULL' &&
          record?.get('componentType') === 'LOV' &&
          record?.get('targetType') === 'FIXED',
        lovCode: ({ record }) => {
          return record.get('lovCode');
        },
      },
      validator: importCheckValidator,
    },
  ],
  events: {
    update({ record, name, value }) {
      if (name === 'dimensionId') {
        record.set('dimensionName', record.getField('dimensionId').getText(value));
        record.set(
          'componentType',
          record.getField('dimensionId').getLookupData(value)?.componentType
        );
        record.set('lovView', record.getField('dimensionId').getLookupData(value)?.lovView);
        record.set('lovCode', record.getField('dimensionId').getLookupData(value)?.lovCode);
        record.set(
          'dimensionCode',
          record.getField('dimensionId').getLookupData(value)?.dimensionCode
        );
      }
      if (name === 'targetValue') {
        record.set(
          'targetDimensionId',
          record.getField('targetValue').getLookupData(value)?.dimensionId
        );
        record.set('targetValueMeaning', null);
      }
      if (name === 'targetValueSelect') {
        record.set('targetValue', record.getField('targetValueSelect').getLookupData(value)?.value);
        record.set(
          'targetValueMeaning',
          record.getField('targetValueSelect').getLookupData(value)?.meaning
        );
      }
    },
  },
});

/* 自定义表达式 */
export const expressionDS = (fxds) => ({
  autoQuery: false,
  selection: false,
  forceValidate: true,
  paging: false,
  fields: [
    {
      label: intl.get(`small.common.model.custom.expression`).d('自定义表达式'),
      type: 'string',
      name: 'conditionExpression',
      required: true,
      validator: value => {
        const list = value.split(/\s|AND|OR/);
        const validFlag = list.some(n => {
          return /[^0-9|(|)]/g.test(n) && !/AND|OR/g.test(n);
        });
        if (validFlag) {
          return intl
            .get('small.common.detail.field.errorExpression')
            .d('不允许输入字母及 ( ) OR AND 以外的字符');
        }
        const indexList = value.split(/AND|OR/).map(n => Number(n));
        const index = indexList.find(n => n > fxds.length);
        if(index) {
          return intl.get('small.common.detail.inexistenceExpression', {
            value: index,
          }).d(`条件${index}不存在`);
        }
        return undefined;
      },
    },
    {
      name: 'defaultValue_component',
      trueValue: '1',
      falseValue: '0',
      computedProps: {
        lookupCode: ({ record }) => {
          return record.get('lovCode');
        },
      },
      label: intl.get('small.common.detail.field.defaultValue').d('默认值'),
    },
    {
      name: 'defaultValue_LOV',
      type: 'object',
      lovCode: '',
      computedProps: {
        lovCode: ({ record }) => {
          return record.get('lovCode');
        },
      },
      label: intl.get('small.common.detail.field.defaultValue').d('默认值'),
      validator: importCheckValidator,
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'defaultValue_component') {
        record.set(
          'defaultValue_componentMeaning',
          record.getField('defaultValue_component').getLookupData(value).meaning
        );
      }
    },
  },
});

// 映射关系
export function mappingDs() {
  return {
    paging: false,
    selection: false,
    fields: [
      {
        label: intl.get(`small.common.detail.mapping.sourceFrom`).d('映射来源'),
        name: 'targetSystem',
        type: 'string',
        required: true,
        lookupCode: 'SMCT.DIMENSION_SYSTEM',
      },
      {
        label: intl.get(`small.common.detail.mapping.targetType`).d('映射区域'),
        name: 'targetType',
        type: 'string',
        lookupCode: 'SMCT_MAPPING_AREA',
        computedProps: {
          disabled: ({ record, dataSet }) => {
            const dimensionType = dataSet.getState('dimensionType') || '';
            return record.get('targetSystem') !== 'OMS' || dimensionType.includes('LINE');
          },
        },
        transformResponse: (value, record) => {
          return record.targetSystem !== 'OMS' ? null : value;
        },
      },
      {
        label: intl.get(`small.common.detail.source.field`).d('来源字段'),
        name: 'targetFieldCodeLov',
        type: 'object',
        required: true,
        textField: 'fieldName',
        valueField: 'fieldName',
        computedProps: {
          lovCode: ({ record }) => {
            switch(record.get('targetSystem')){
              case "OMS": return 'HPFM.DIMENSION.NOT.USED';
              case "PRICE": return 'HPFM.DIMENSION.PRICE.NOT.USED';
              case "PRODUCT": return 'HPFM.DIMENSION.PRODUCT.NOT.USED';
              default: return 'HPFM.DIMENSION.ALLOT.NOT.USED';
            }
          },
          disabled: ({ record }) => !record.get('targetSystem'),
          lovPara: ({ dataSet, record }) => {
            return {
              templateId: dataSet.getState('templateId'),
              targetType: record.get('targetType'),
            };
          },
        },
      },
      {
        name: 'targetFieldCode',
        type: 'string',
        required: true,
        bind: 'targetFieldCodeLov.fieldName',
      },
      {
        label: intl.get(`small.common.detail.source.field.name`).d('来源字段名'),
        name: 'targetFieldName',
        type: 'string',
        required: true,
        bind: 'targetFieldCodeLov.displayName',
        disabled: true,
      },
      {
        name: 'operate',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    events: {
      update: ({ record, name, dataSet }) => {
        if (name === 'targetSystem') {
          record.set('targetFieldCodeLov', null);
          record.set(
            'targetType',
            record.get('targetSystem') === 'OMS' &&
              dataSet.getState('dimensionType').includes('LINE')
              ? 'LINE'
              : null
          );
        }
      },
    },
  };
}

// 方法树
export function funTreeDs() {
  return {
      selection: 'single',
      primaryKey: 'id',
      idField: 'id',
      parentField: 'parentId',
      childrenField: 'children',
      expandField: 'expand',
      data: [
        {
          id: '1',
          text: intl.get('hpfm.customize.common.dateFunction').d('日期函数'),
          expand: true,
          children: [
            {
              id: '1-1',
              parentId: '1',
              text: 'OFFSET_DATE',
              isLeaf: true,
            },
          ],
        },
      ],
      fields: [
        {
          name: 'id',
          type: 'string',
        },
        { name: 'expand', type: 'boolean' },
        {
          name: 'parentId',
          type: 'string',
        },
        {
          name: 'text',
        },
      ],
      events: {
        select: ({record, dataSet}) => {
          const text = record.get('text');
          dataSet.setState('fun', text);
        },
        unSelect: ({dataSet}) => {
          dataSet.setState('fun', null);
        },
      },
    };
}

// 参数列表设置
export function expreConfigDs({ dimensionType, templateId, fxRecord, outDs, resultDataSet }) {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'conditionCode',
        transformRequest: (value, record) => record.index + 1,
      },
      {
        name: 'paramCode',
        transformRequest: (value, record) => {
          return String.fromCharCode(97 + record.index);
        },
      },
      {
        name: 'conditionExpression',
        defaultValue: '=',
      },
      {
        name: 'targetType',
        lookupCode: 'SMCT.DIMENSION_CONDITION_TYPE',
        defaultValue: 'FIXED',
      },
      {
        name: 'targetValue',
        required: true,
        noCache: true,
        dynamicProps: {
          lookupCode: ({ record })=>{
            return record.get('targetType') === 'FIXED' ? 'SMCT.DATE' : null;
          },
          textField: ({ record })=>{
            return record.get('targetType') === 'FIXED' ? 'meaning' : 'dimensionName';
          },
          valueField: ({ record })=>{
            return record.get('targetType') === 'FIXED' ? 'value' : 'dimensionName';
          },
          lookupAxiosConfig: ({ record }) => {
            return record.get('targetType') === 'FIXED' ? '' : {
              url:
                organizationId === 0
                  ? `${SRM_MALLCART}/v1/dimensions/condition-select`
                  : `${SRM_MALLCART}/v1/${organizationId}/dimensions/condition-select`,
              params: {
                dimensionType,
                templateId,
              },
              method: 'GET',
              transformResponse: res => {
                let newRes = {};
                try {
                  newRes = JSON.parse(res);
                } catch {
                  newRes = res;
                }
                if (newRes.failed) {
                  notification.error({ message: newRes.message });
                  return [];
                } else {
                  return (
                    newRes?.map(p => {
                      if (p.dimension && p.dimensionComponent) {
                        return { ...p.dimension, ...p.dimensionComponent };
                      } else {
                        return p;
                      }
                    }) || []
                  );
                }
              },
            };
          },
        },
      },
    ],
    events: {
      update({ record, name, value }) {
        if (name === 'targetType') {
          record.set('targetValue', null);
        }
        if (name === 'targetValue') {
          record.set(
            'targetDimensionId',
            record.getField('targetValue').getLookupData(value)?.dimensionId
          );
        }
      },
    },
    transport: {
      destroy: ({ data=[] }) => ({
        url:
        organizationId === 0
          ? `${SRM_MALLCART}/v1/dimensions/delete-condition`
          : `${SRM_MALLCART}/v1/${organizationId}/dimensions/delete-condition`,
        method: 'DELETE',
        data: {
          templateId,
          conditionLineId: data[0]?.conditionLineId,
        },
        transformResponse: (res) => {
          const newRes = JSON.parse(res);
          if (newRes) {
            if(fxRecord){
              const formulaCondition = newRes.formulaConditionFx?.dimFormulaConditionList?.[fxRecord.index]?.formulaCondition || {};
              fxRecord.set('formulaCondition', formulaCondition);
              outDs.set('formulaConditionFx', newRes.formulaConditionFx || {});
              resultDataSet.loadData([formulaCondition?.conditionHeader || {}]);
            } else {
              outDs.set('formulaCondition', newRes.formulaCondition || {});
              resultDataSet.loadData([newRes.formulaCondition?.conditionHeader || {}]);
            }
          }
        },
      }),
    },
  };
}

// 公式配置默认值表达式
export function resultDs() {
  return {
    fields: [
      {
        name: 'conditionExpression',
        label: intl.get('hpfm.customize.common.defaultExpression').d('默认值表达式'),
        // eslint-disable-next-line no-useless-escape
        pattern: /^OFFSET_DATE[\(]([a](\,){0,1})(\s*((["'][\+\-]{0,1})\d+[YMWDhms]["'](\,){0,1}\s*)+){0,1}(\))$/,
      },
    ],
  };
}
