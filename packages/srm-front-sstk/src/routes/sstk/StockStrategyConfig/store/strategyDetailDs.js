import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const baseInfoDS = (strategyId) => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('sstk.stockConfig.model.strategyCode').d('批次编码'),
      name: 'strategyCode',
      required: true,
      disabled: strategyId,
      pattern: /^[\da-zA-Z]+$/ig,
      maxLength: 30,
      defaultValidationMessages: {
        patternMismatch: intl
          .get('sstk.stockConfig.validation.strategyCodeUpper')
          .d('编码只能包含字母、数字'),
      },
    },
    {
      label: intl.get('sstk.stockConfig.model.strategyName').d('批次名称'),
      name: 'strategyName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get('sstk.common.model.status').d('状态'),
      name: 'statusCode',
    },
    // 接口需要， 必填字段
    {
      name: 'batchFlag',
      type: 'number',
      defaultValue: 1,
    },
  ],
});

const batchLineDS = (readOnly) => ({
  autoCreate: false,
  paging: false,
  selection: readOnly ? false : 'multiple',
  fields: [
    {
      label: intl.get('sstk.stockConfig.model.dimensionCode').d('维度编码'),
      name: 'dimensionCode',
    },
    {
      label: intl.get('sstk.stockConfig.model.dimensionName').d('维度名称'),
      name: 'dimensionName',
    },
    {
      label: intl.get('sstk.stockConfig.model.oderSq').d('序号'),
      name: 'orderSeq',
      type: 'number',
    },
  ],
  transport: {
    destroy: {
      url: `/stck/v1/${organizationId}/stock-strategy-batchs/batch-delete `,
      method: 'DELETE',
    },
  },
});

const itemRangeDS = (strategyId) => ({
  autoCreate: false,
  autoQuery: false,
  fields: [
    {
      label: intl.get('sstk.stockConfig.model.itemCode').d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get('sstk.stockConfig.model.itemName').d('物料名称'),
      name: 'itemName',
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `/stck/v1/${organizationId}/stock-strategy-items/strategy-item/${strategyId}`,
      method: 'GET',
      data: { ...data, customizeUnitCode: 'STOCK.STRATEGY.ITEM_RANGE.SEARCHBAR' },
    }),
    destroy: {
      url: `/stck/v1/${organizationId}/stock-strategy-items/batch-delete`,
      method: 'DELETE',
    },
  },
});

const dimensionBaseDS = (dimensionId, readOnly = false) => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('sstk.stockConfig.model.dimensionCode').d('维度编码'),
      name: 'dimensionCode',
      pattern: /^[\da-zA-Z]+$/ig,
      defaultValidationMessages: {
        patternMismatch: intl
          .get('sstk.stockConfig.validation.strategyCodeUpper')
          .d('编码只能包含字母、数字'),
      },
      required: true,
      disabled: dimensionId,
    },
    {
      label: intl.get('sstk.stockConfig.model.dimensionName').d('维度名称'),
      name: 'dimensionName',
      type: 'intl',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('sourceType') === 'PREDEFINED',
      },
    },
    {
      label: intl.get('sstk.stockConfig.model.componentType').d('组件类型'),
      name: 'componentType',
      required: true,
      // 文本、日期、值集
      lookupCode: 'STCK.COMPONENT_TYPE',
      dynamicProps: {
        disabled: ({ record }) => record.get('sourceType') === 'PREDEFINED',
      },
    },
    {
      label: intl.get('sstk.stockConfig.model.valueSetCode').d('值集编码'),
      name: 'lovCodeObj',
      type: 'object',
      ignore: 'always',
      textField: 'lovCode',
      valueField: 'lovId',
      dynamicProps: {
        required: ({ record }) => record.get('componentType') === 'LOV',
        disabled: ({ record }) => record.get('sourceType') === 'PREDEFINED',
      },
    },
    {
      name: 'lovCode',
      bind: 'lovCodeObj.lovCode',
    },
    {
      label: intl.get('sstk.stockConfig.model.valueSetField').d('值集字段'),
      name: 'filedObj',
      type: 'object',
      ignore: 'always',
      textField: 'title',
      valueField: 'dataIndex',
      // noCache: true,
      help: readOnly ? null : intl.get('sstk.stockConfig.model.valueSetFieldHelp').d('选择值集中的编码字段用于拼接批次号'),
      dynamicProps: {
        required: ({ record }) => record.get('componentType') === 'LOV',
        disabled: ({ record }) => record.get('sourceType') === 'PREDEFINED' || !record.get('lovCode'),
      },
    },
    {
      name: 'filedName',
      bind: 'filedObj.title',
    },
    {
      name: 'filedCode',
      bind: 'filedObj.dataIndex',
    },
  ],
  events: {
    update: ({ record, name, value, oldValue }) => {
      if (name === 'lovCodeObj') {
        record.set('filedObj', null);
      }
      if (name === 'componentType' && value !== 'LOV' && value !== oldValue) {
        record.set('lovCodeObj', null);
        record.set('filedObj', null);
      }
    },
  },
});

const dimensionMappingDS = () => ({
  autoCreate: false,
  paging: false,
  // selection: false,
  fields: [
    {
      label: intl.get('sstk.stockConfig.model.targetSystem').d('映射来源'),
      name: 'targetSystem',
      required: true,
      lookupCode: 'STCK.DIMENSION_SOURCE_SYSTEM',
    },
    // 库存单只能映射单据行；物流单可映射头行
    {
      label: intl.get('sstk.stockConfig.model.targetType').d('映射区域'),
      name: 'targetType',
      required: true,
      lookupCode: 'STCK.DIMENSION_MAPPING_AREA',
      dynamicProps: {
        // 有头行结构
        // required: ({record}) => record.get('componentType') === 'lov',
        disabled: ({ record }) => !record.get('targetSystem'),
      },
    },
    {
      label: intl.get('sstk.stockConfig.model.targetFieldLov').d('来源字段'),
      name: 'targetFieldLov',
      type: 'object',
      required: true,
      ignore: 'always',
      lovCode: 'STCK.DIMENSION_MAPPING_FIELD',
      textField: 'fieldCode',
      // valueField: 'fieldId',
      dynamicProps: {
        disabled: ({ record }) => !record.get('targetType'),
        lovPara: ({ record }) => {
          const { targetSystem, targetType } = record.get(['targetSystem', 'targetType']);
          const isStock = targetSystem === 'IN_OUT_ORDER' && targetType === 'LINE';
          const code = isStock ? 'SRM_STCK_IN_OUT_ORDER_LINE' // 库存单，非生库存出入库单行
            : targetType === 'LINE'
              ? 'SRM_SINV_RCV_TRX_LINE' // 采购接收事务行表
              : 'SRM_SINV_RCV_TRX_HEADER'; // 采购接收事务头表
          return {
            boCode: code,
          };
        },
      },
      transformResponse: (_, record) => {
        return record
          ? {
            fieldCode: record.targetFieldCode,
            // fieldId: record.inCompanyId,
          }
          : null;
      },
    },
    {
      name: 'targetFieldCode',
      bind: 'targetFieldLov.fieldCode',
    },
    {
      label: intl.get('sstk.stockConfig.model.targetFieldName').d('来源字段名'),
      name: 'targetFieldName',
      bind: 'targetFieldLov.fieldName',
      disabled: true,
      required: true,
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'operation',
    },
  ],
  events: {
    update: ({ record, name }) => {
      if (name === 'targetSystem') {
        record.set('targetType', null);
        record.set('targetFieldLov', null);
      }
      if (name === 'targetType') {
        record.set('targetFieldLov', null);
      }
    },
  },
  transport: {
    destroy: {
      url: `/stck/v1/${organizationId}/batch-dimension-fields/batch-delete`,
      method: 'DELETE',
    },
  },
});


export {
  baseInfoDS,
  batchLineDS,
  itemRangeDS,
  dimensionBaseDS,
  dimensionMappingDS,
};