import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { BomDimensionWidgetCode } from '@/routes/spc/BomViewWorkbench/enum';

const organizationId = getCurrentOrganizationId();

const DimConfigDS = (bomTemplateId) => ({
  primaryKey: 'bomDimensionConfigId',
  fields: [
    {
      name: 'bomTemplateId',
      defaultValue: bomTemplateId,
    },
    {
      name: 'bomDimensionEnabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`hzero.common.status.isEnable`).d('是否启用'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'businessObjectName',
      label: intl.get(`spc.bomDimConfig.model.businessObject`).d('业务对象'),
    },
    {
      name: 'bomDimensionCode',
      type: 'string',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionCode`).d('维度编码'),
    },
    {
      name: 'bomDimensionName',
      type: 'string',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionName`).d('维度名称'),
    },
    {
      name: 'bomDimensionType',
      type: 'string',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionType`).d('类型'),
      lookupCode: 'SSRC.PRICE_BOM_DIM_TYPE',
    },
    {
      name: 'bomDimensionRequired',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get(`spc.bomDimConfig.model.bomDimensionRequired`).d('是否必输'),
    },
    {
      name: 'bomDimensionEditable',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`spc.bomDimConfig.model.bomDimensionEditable`).d('是否可编辑'),
    },
    {
      name: 'bomDimensionVisible',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`spc.bomDimConfig.model.bomDimensionVisible`).d('是否展示'),
    },
    {
      name: 'bomDimensionSeq',
      type: 'number',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionPosition`).d('位置'),
    },
    {
      name: 'bomDimensionWidget',
      type: 'string',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionWidget`).d('组件类型'),
    },
    {
      name: 'bomDimensionWidgetCode',
      type: 'string',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionWidgetCode`).d('值集编码'),
    },
    {
      name: 'isFormula',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`spc.bomDimConfig.model.isFormula`).d('是否公式计算参数'),
    },
  ],
  queryFields: [
    {
      name: 'bomDimensionCode',
      type: 'string',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionCode`).d('维度编码'),
      merge: true,
    },
    {
      name: 'bomDimensionName',
      type: 'string',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionName`).d('维度名称'),
      merge: true,
    },
    {
      name: 'bomDimensionType',
      type: 'string',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionType`).d('类型'),
      lookupCode: 'SSRC.PRICE_BOM_DIM_TYPE',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-bom-dim/list`,
        method: 'GET',
        data,
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-bom-dim`,
        method: 'POST',
        data,
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-bom-dim`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const updateField = (value, dataSet, record) => {
  // 清空组件值集对应内容
  record.set({
    bomDimensionWidgetCode: undefined,
    bomDimensionWidgetMeaning: undefined,
    displayField: undefined,
    valueField: undefined,
  });
  switch (value) {
    case BomDimensionWidgetCode.SELECT:
      dataSet.getField('bomDimensionWidgetCodeLov').set('lovCode', 'HPFM.LOV.LOV_DETAIL_CODE.ORG');
      dataSet.getField('bomDimensionWidgetCodeLov').set('lovQueryAxiosConfig', {
        url: `/hpfm/v1/${getCurrentOrganizationId()}/lov-headers`,
        method: 'GET',
      });
      break;
    case BomDimensionWidgetCode.LOV:
      dataSet.getField('bomDimensionWidgetCodeLov').set('lovCode', 'HPFM.LOV.VIEW.ORG');
      dataSet.getField('bomDimensionWidgetCodeLov').set('lovQueryAxiosConfig', {
        url: `/hpfm/v1/${getCurrentOrganizationId()}/lov-view-headers`,
        method: 'GET',
      });
      break;
    case BomDimensionWidgetCode.LINK:
      record.set('bomDimensionRequired', 0);
      break;
    default:
      // 切换组件，清空是否公式计价参数
      record.set('isFormula', 0);
  }
};

const DimConfigFormDS = (bomTemplateId, isEdit) => ({
  primaryKey: 'bomDimensionConfigId',
  fields: [
    {
      name: 'bomTemplateId',
      defaultValue: bomTemplateId,
    },
    {
      name: 'bomDimensionEnabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`hzero.common.status.isEnable`).d('是否启用'),
    },
    {
      name: 'businessObjectLov',
      type: 'object',
      required: isEdit,
      label: intl.get(`spc.bomDimConfig.model.businessObject`).d('业务对象'),
      lovCode: 'SSRC_PRICE_BASE_BUSINESS_OBJECT',
      lovPara: {
        businessObjectCode: 'SRM_C_SSRC_BOM_VIEW_HEADE',
        tenantId: getCurrentOrganizationId(),
      },
      optionsProps: {
        paging: 'false',
        childrenField: 'businessObjectRelationList',
      },
      dynamicProps: {
        disabled: ({ record }) => record.get('bomDimensionConfigId'),
      },
    },
    {
      name: 'businessObject',
      bind: 'businessObjectLov.relateBusinessObjectCode',
    },
    {
      name: 'businessObjectId',
      bind: 'businessObjectLov.relBusinessObjectId',
    },
    {
      name: 'businessObjectName',
      bind: 'businessObjectLov.relBusinessObjectName',
    },
    {
      name: 'bomDimensionCode',
      type: 'object',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionCode`).d('维度编码'),
      required: isEdit,
      lovCode: 'SSRC_PRICE_BASE_DOCUMENT_COLUMN',
      dynamicProps: {
        disabled: ({ record }) =>
          record.get('bomDimensionConfigId') || !record.get('businessObjectId'),
        lovPara: ({ record }) => {
          return {
            businessObjectId: record.get('businessObjectId'),
          };
        },
      },
      transformRequest: (value) => value && value?.businessObjectFieldCode,
      transformResponse: (value) => {
        return value ? { businessObjectFieldCode: value } : null;
      },
    },
    {
      name: 'bomDimensionName',
      type: 'intl',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionName`).d('维度名称'),
      required: isEdit,
    },
    {
      name: 'bomDimensionType',
      type: 'string',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionType`).d('类型'),
      lookupCode: 'SSRC.PRICE_BOM_DIM_TYPE',
      defaultValue: 'EXPANSION',
      required: isEdit,
    },
    {
      name: 'bomDimensionRequired',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get(`spc.bomDimConfig.model.bomDimensionRequired`).d('是否必输'),
      dynamicProps: {
        disabled: ({ record }) =>
          record?.get('bomDimensionCode')?.businessObjectFieldCode !== 'unitPrice' &&
          record.get('bomDimensionWidget') === BomDimensionWidgetCode.LINK,
      },
    },
    {
      name: 'bomDimensionEditable',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`spc.bomDimConfig.model.bomDimensionEditable`).d('是否可编辑'),
    },
    {
      name: 'bomDimensionVisible',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`spc.bomDimConfig.model.bomDimensionVisible`).d('是否展示'),
    },
    {
      name: 'bomDimensionSeq',
      type: 'number',
      step: 1,
      label: intl.get(`spc.bomDimConfig.model.bomDimensionPosition`).d('位置'),
      required: isEdit,
    },
    {
      name: 'bomDimensionWidth',
      type: 'number',
      step: 1,
      label: intl.get(`spc.bomDimConfig.model.bomDimensionWidth`).d('宽度'),
      defaultValue: 120,
    },
    {
      name: 'bomDimensionWidget',
      type: 'string',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionWidget`).d('组件类型'),
      required: isEdit,
      defaultValue: 'INPUT',
      lookupCode: 'SPC.BOM_DIM_CONFIG_COMPONENT',
    },
    {
      name: 'bomDimensionWidgetCodeLov',
      type: 'object',
      label: intl.get(`spc.bomDimConfig.model.bomDimensionWidgetCode`).d('值集编码'),
      dynamicProps: {
        required: ({ record }) =>
          ['SELECT', 'LOV'].includes(record.get('bomDimensionWidget')) && isEdit,
        disabled: ({ record }) => !['SELECT', 'LOV'].includes(record.get('bomDimensionWidget')),
        textField: ({ record }) => {
          if (record.get('bomDimensionWidget') === BomDimensionWidgetCode.LOV) {
            return 'viewCode';
          } else if (record.get('bomDimensionWidget') === BomDimensionWidgetCode.SELECT) {
            return 'lovCode';
          }
        },
      },
      ignore: 'always',
    },
    {
      name: 'bomDimensionWidgetCode',
      type: 'string',
      dynamicProps: {
        bind: ({ record }) => {
          if (record.get('bomDimensionWidget') === BomDimensionWidgetCode.LOV) {
            return 'bomDimensionWidgetCodeLov.viewCode';
          } else if (record.get('bomDimensionWidget') === BomDimensionWidgetCode.SELECT) {
            return 'bomDimensionWidgetCodeLov.lovCode';
          }
        },
      },
    },
    {
      name: 'displayField', // 用于`默认值`为lov情况下, 取值
      type: 'string',
      bind: 'bomDimensionWidgetCodeLov.displayField',
    },
    {
      name: 'valueField', // 用于`默认值`为lov情况下, 取值
      type: 'string',
      bind: 'bomDimensionWidgetCodeLov.valueField',
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`hzero.common.status.isEnable`).d('是否启用'),
    },
    {
      name: 'isFormula',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get(`spc.bomDimConfig.model.isFormula`).d('是否公式计算参数'),
      dynamicProps: {
        disabled: ({ record }) =>
          record.get('bomDimensionWidget') !== BomDimensionWidgetCode.INPUT_NUMBER,
      },
    },
    {
      name: 'relatedField',
      label: intl.get('hpfm.individual.model.config.fieldMapping').d('关联字段设置'),
    },
    {
      name: 'groupListFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get(`spc.bomDimConfig.model.groupList`).d('组件清单'),
    },
  ],
  events: {
    update: ({ name, value, dataSet, record }) => {
      if (name === 'bomDimensionWidget') {
        updateField(value, dataSet, record);
      }
      if (name === 'businessObjectLov') {
        record.set({
          bomDimensionCode: null,
          bomDimensionName: null,
        });
      }
      if (name === 'bomDimensionCode') {
        record.set({
          bomDimensionName: value?.businessObjectFieldName,
        });
      }
    },
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        const bomDimensionWidget = record.get('bomDimensionWidget');
        switch (bomDimensionWidget) {
          case BomDimensionWidgetCode.SELECT:
            dataSet
              .getField('bomDimensionWidgetCodeLov')
              .set('lovCode', 'HPFM.LOV.LOV_DETAIL_CODE.ORG');
            dataSet.getField('bomDimensionWidgetCodeLov').set('lovQueryAxiosConfig', {
              url: `/hpfm/v1/${getCurrentOrganizationId()}/lov-headers`,
              method: 'GET',
            });
            break;
          case BomDimensionWidgetCode.LOV:
            dataSet.getField('bomDimensionWidgetCodeLov').set('lovCode', 'HPFM.LOV.VIEW.ORG');
            dataSet.getField('bomDimensionWidgetCodeLov').set('lovQueryAxiosConfig', {
              url: `/hpfm/v1/${getCurrentOrganizationId()}/lov-view-headers`,
              method: 'GET',
            });
            break;
          default:
            break;
        }
      });
    },
  },
  transport: {
    // read({ data }) {
    //   return {
    //     url: `${SRM_SPC}/v1/${organizationId}/price-bom-dim/list`,
    //     method: 'GET',
    //     data,
    //   };
    // },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-bom-dim/save`,
        method: 'POST',
        data,
      };
    },
  },
});

export { DimConfigDS, DimConfigFormDS };
