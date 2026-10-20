import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { renderFieldType } from '@/routes/spc/BomViewWorkbench/utils';
import intl from 'utils/intl';
import { BusinessObject } from '@/routes/spc/BomDimConfig/enum';
import { BomDimensionWidgetCode } from '@/routes/spc/BomViewWorkbench/enum';
import { isEmpty, isNil } from 'lodash';

const organizationId = getCurrentOrganizationId();

const HeaderDS = ({ bomDimensionConfigId, conType, bomDimensionCode }) => ({
  primaryKey: 'conHeaderId',
  autoQuery: false,
  autoCreate: true,
  paging: false,
  selection: false,
  fields: [
    {
      name: 'bomDimensionCode',
      defaultValue: bomDimensionCode?.businessObjectFieldCode || bomDimensionCode,
    },
    {
      name: 'bomDimensionConfigId',
      defaultValue: bomDimensionConfigId,
    },
    {
      name: 'conType',
      defaultValue: conType,
    },
    {
      name: 'conExpression',
      defaultValue: 1,
    },
  ],
  queryParameter: {
    bomDimensionConfigId,
    conType,
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet.length === 0) {
        dataSet.create({});
      }
    },
  },
  transport: {
    read({ params }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/bom-dimension-condition/${bomDimensionConfigId}`,
        method: 'GET',
        params,
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/bom-dimension-condition`,
        method: 'POST',
        data: !isEmpty(data) ? data[0] : data,
      };
    },
  },
});

const TableDS = ({ bomDimensionConfigId, conType, bomTemplateId, isEdit }) => ({
  primaryKey: 'conLineId',
  autoQuery: false,
  paging: false,
  selection: isEdit ? 'multiple' : false,
  fields: [
    {
      name: 'bomDimensionConfigId',
      defaultValue: bomDimensionConfigId,
    },
    {
      name: 'conType',
      defaultValue: conType,
    },
    {
      name: 'conCode',
      defaultValue: 1,
    },
    {
      name: 'businessObject',
      label: intl.get(`spc.bomDimConfig.model.businessObject`).d('业务对象'),
      lookupCode: '',
      defaultValue: BusinessObject.LINE,
    },
    {
      name: 'sourceFieldId',
      type: 'object',
      label: intl.get(`spc.bomDimConfig.model.targetUnitField`).d('字段'),
      lovCode: 'SPC.PRICE.BOM_DIM',
      required: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            bomTemplateId,
            shieldBomDimensionConfigId: bomDimensionConfigId,
            bomDimensionWidget: BomDimensionWidgetCode.LOV,
            businessObject: record.get('businessObject'),
          };
        },
      },
      transformRequest: (value) => {
        return value && value.bomDimensionConfigId;
      },
      transformResponse: (value, obj) => {
        return (
          value && {
            bomDimensionName: obj.sourceFieldName,
            bomDimensionConfigId: obj.sourceFieldId,
          }
        );
      },
    },
    {
      name: 'relation',
      label: intl.get(`spc.bomDimConfig.model.relation`).d('关系'),
      required: true,
      lookupCode: 'HPFM.CUST.FIELD_COND_REALTION',
      defaultValue: '=',
    },
    {
      name: 'targetType',
      label: intl.get(`spc.bomDimConfig.model.targetType`).d('取值来源'),
      required: true,
      //   <Option value="formNow">
      //   {intl.get('hpfm.individual.model.config.formNow').d('本单元字段')}
      // </Option>
      // <Option value="fixed">
      //   {intl.get('hpfm.individual.model.config.fixed').d('手工录入')}
      // </Option>
      lookupCode: '',
      defaultValue: 'fixed', // 固定值
    },
    {
      name: 'targetValue',
      label: intl.get(`spc.bomDimConfig.model.targetValue`).d('字段值'),
      required: true,
      transformResponse: (value, record) => {
        const { displayField, valueField } = record;
        return value
          ? {
              [displayField]: record[displayField] || record.targetValueMeaning,
              [valueField]: isNil(record[valueField]) ? value : record[valueField], // 处理字段与valueField匹配不上的问题,默认值为翻译字段
            }
          : null;
      },
      transformRequest: (value, record) => {
        const { valueField } = record;
        return value?.[valueField];
      },
    },
  ],
  queryParameter: {
    bomDimensionConfigId,
    conType,
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        const value = record.get('sourceFieldId');
        if (value) {
          const targetValueField = dataSet.getField('targetValue', record);
          targetValueField.reset();
          const fieldProps = renderFieldType(record.toData());
          Object.keys(fieldProps).forEach((item) => {
            targetValueField.set(item, fieldProps[item]);
          });
        }
      });
    },
    update: ({ name, value, dataSet, record }) => {
      if (name === 'sourceFieldId' && value) {
        const targetValueField = dataSet.getField('targetValue', record);
        targetValueField.reset();
        const fieldProps = renderFieldType(value);
        const { displayField } = value;
        if (displayField) {
          record.set('displayField', displayField);
        }
        Object.keys(fieldProps).forEach((item) => {
          targetValueField.set(item, fieldProps[item]);
        });
      }

      if (name === 'targetValue' && value) {
        const displayField = record.get('displayField');
        if (displayField) {
          record.set('targetValueMeaning', value[displayField]);
        }
      }
    },
  },
  transport: {
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/bom-dimension-condition`,
        method: 'DELETE',
        data,
      };
    },
  },
});

export { HeaderDS, TableDS };
