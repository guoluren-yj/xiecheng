import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from 'hzero-front/lib/utils/intl';
import { HZERO_IMP } from 'hzero-front/lib/utils/config';

export const listDS = () => {
  return {
    paging: false,
    selection: false,
    queryFields: [
      {
        name: 'objectType',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.type').d('类型'),
        lookupCode: 'HPFM.TRANSLATE.OBJECT.TYPE',
        display: true,
      },
      {
        name: 'objectName',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.object').d('对象'),
        display: true,
      },
      {
        name: 'tableName',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.tableName').d('表名'),
        display: true,
      },
      {
        name: 'primaryKey',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.primaryKey').d('主键'),
        display: true,
      },
      {
        name: 'dataRangeType',
        label: intl.get('hpfm.translateWorkbenchConfig.view.title.dataRange').d('数据范围'),
        lookupCode: 'HPFM.TRANSLATE.OBJECT.DATA_RANGE_TYPE',
        display: true,
      },
      {
        name: 'tenantEnabledFlag',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.tenantEnabledFlag').d('租户级是否启用'),
        lookupCode: 'HPFM.FLAG',
        display: true,
      },
    ],
    fields: [
      {
        name: 'objectTypeMeaning',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.type').d('类型'),
      },
      {
        name: 'objectName',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.object').d('对象'),
      },
      {
        name: 'tableName',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.tableName').d('表名'),
      },
      {
        name: 'primaryKey',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.primaryKey').d('主键'),
      },
      {
        name: 'dataRangeTypeMeaning',
        label: intl.get('hpfm.translateWorkbenchConfig.view.title.dataRange').d('数据范围'),
      },
      {
        name: 'tenantEnabledFlag',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.tenantEnabledFlag').d('租户级是否启用'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_IMP}/v1/translate/object/query`,
          method: 'POST',
        };
      },
    },
  } as any;
};

export const headerFormDS = () => {
  return {
    forceValidate: true,
    fields: [
      {
        name: 'objectType',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.type').d('类型'),
        required: true,
        lookupCode: 'HPFM.TRANSLATE.OBJECT.TYPE',
      },
      {
        name: 'objectName',
        type: 'intl',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.object').d('对象'),
        required: true,
      },
      {
        name: 'tableName',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.tableName').d('表名'),
        required: true,
      },
      {
        name: 'primaryKey',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.primaryKey').d('主键'),
        required: true,
      },
      {
        name: 'dataRangeType',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.dataRange').d('数据范围'),
        required: true,
        defaultValue: 'P',
        lookupCode: 'HPFM.TRANSLATE.OBJECT.DATA_RANGE_TYPE',
      },
      {
        name: 'countAllSql',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.countAllSql').d('统计总数sql'),
        required: true,
      },
      {
        name: 'countLangSql',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.countLanguageSql').d('语言统计总数sql'),
        required: true,
      },
      {
        name: 'exportSql',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.exportSql').d('导出sql'),
        required: true,
      },
      {
        name: 'tableSchema',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.schema').d('schema'),
        required: true,
      },
      {
        name: 'tenantEnabledFlag',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.tenantEnabledFlag').d('租户级是否启用'),
        required: true,
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        help: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.tenantEnabledFlag.help').d('租户级是否启用'),
      },
    ],
  }as DataSetProps;
};

export const lineListDS = () => {
  return {
    paging: false,
    forceValidate: true,
    fields: [
      {
        name: 'fieldCode',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.fieldCode').d('字段编码'),
        required: true,
      },
      {
        name: 'fieldName',
        type: 'intl',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.fieldName').d('字段名称'),
        required: true,
      },
      {
        name: 'fieldType',
        label: intl.get('hpfm.translateWorkbenchConfig.model.dataConfig.fieldType').d('字段类型'),
        lookupCode: 'HPFM_TRANSLATE_FIELD_TYPE',
      },
      {
        name: 'translateField',
        label: intl.get('hpfm.translateWorkbenchConfig.view.title.translateField').d('翻译字段'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'indexField',
        label: intl.get('hpfm.translateWorkbenchConfig.view.title.indexField').d('索引字段'),
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled: ({ record }) => record && (record.get('translateField') === 1 || record.get('masterUniqueField') === 1),
        },
      },
      {
        name: 'masterUniqueField',
        label: intl.get('hpfm.translateWorkbenchConfig.view.title.masterUniqueField').d('主索引字段'),
        trueValue: 1,
        falseValue: 0,
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach(record => {
          const fieldType = record.get('fieldType');
          if (fieldType === 'TRANSLATE') {
            record.set('translateField', 1);
            record.set('indexField', 1);
          } else if (fieldType === 'EXPORT') {
            record.set('translateField', 0);
            record.set('indexField', 0);
          } else if (fieldType === 'UNIQUE') {
            record.set('translateField', 0);
            record.set('indexField', 1);
          } else if (fieldType === 'MASTER_UNIQUE') {
            record.set('masterUniqueField', 1);
            record.set('indexField', 1);
          }
        });
      },
      update: ({ record, name, value}) => {
        if (name === 'translateField') {
          record.set('fieldType', 'TRANSLATE');
          record.set('indexField', value === 1 ? 1 : 0);
        } else if (name === 'masterUniqueField' && value === 1) {
          record.set('fieldType', 'MASTER_UNIQUE');
          record.set('indexField', 1);
        }
      },
    },
  } as DataSetProps;
};
