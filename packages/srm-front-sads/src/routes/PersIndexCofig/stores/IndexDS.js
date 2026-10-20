import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
/**
 * 管道输入源列表
 * @returns
 */
const IndexDS = () => ({
  selection: false,
  fields: [
    {
      label: intl.get('sads.indexcongig.model.indexName').d('索引名称'),
      name: 'indexName',
      type: 'string',
    },
    {
      label: intl.get('sads.indexcongig.model.tenantName').d('租户名称'),
      name: 'tenantObject',
      type: 'object',
      lovCode: 'HPFM.TENANT_ALL',
      textField: 'tenantName',
      valueField: 'tenantId',
      required: true,
      ignore: 'always',
    },
    {
      label: intl.get('sads.indexcongig.model.tenantId').d('租户Id'),
      name: 'tenantId',
      type: 'number',
      bind: 'tenantObject.tenantId',
    },
    {
      label: intl.get('sads.indexcongig.model.tenantName').d('租户名称'),
      name: 'tenantName',
      type: 'string',
      bind: 'tenantObject.tenantName',
    },
    {
      label: intl.get('sads.indexcongig.model.companyName').d('公司名称'),
      name: 'companyObject',
      type: 'object',
      lovCode: 'HPFM.COMPANY.NOTENCRYPT',
      textField: 'companyName',
      valueField: 'companyId',
      ignore: 'always',
      cascadeMap: { tenantObject: 'tenantObject' },
      dynamicProps: ({ record }) => {
        const tenantId = record.get('tenantId');
        if (tenantId) {
          return {
            lovPara: {
              tenantId,
            },
          };
        }
      },
    },
    {
      label: intl.get('sads.indexcongig.model.companyId').d('公司Id'),
      name: 'companyId',
      type: 'number',
      bind: 'companyObject.companyId',
    },
    {
      label: intl.get('sads.indexcongig.model.companyName').d('公司名称'),
      name: 'companyName',
      type: 'string',
      bind: 'companyObject.companyName',
    },
    {
      label: intl.get('sads.indexcongig.model.indexNamePrefix').d('索引前缀'),
      name: 'indexNamePrefix',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('sads.indexcongig.model.indexNameSuffix').d('索引后缀'),
      name: 'indexNameSuffix',
      type: 'string',
    },
    {
      label: intl.get('sads.indexcongig.model.enabledFlag').d('状态'),
      name: 'enabledFlag',
      lookupCode: 'SDAP.PIPELINE_CONFIG_ENABLED',
      required: true,
    },
    {
      name: 'parentIndex',
      label: intl.get('sads.indexcongig.model.parentIndexId').d('父索引'),
      type: 'object',
      lovCode: 'SDAP.PARENT_INDEX',
      valueField: 'indexId',
      textField: 'indexName',
      ignore: 'always',
    },
    {
      name: 'parentIndexId',
      type: 'number',
      bind: 'parentIndex.indexId',
    },
    {
      name: 'parentIndexName',
      label: intl.get('sads.indexcongig.model.parentIndexId').d('父索引'),
      type: 'string',
      bind: 'parentIndex.indexName',
      ignore: 'always',
    },
    {
      label: 'setting',
      name: 'setting',
      type: 'string',
      // validator: (value) => {
      //   const regExp = /\$\{[^}]+\}/g;
      //   if (!value) return true;
      //   const newValue = value.replace(regExp, 1);
      //   if (/^\d+$/g.test(newValue)) {
      //     return intl.get('sads.indexcongig.view.warning.json').d('请输入正确的JSON表达式');
      //   } else {
      //     try {
      //       JSON.parse(newValue);
      //     } catch (e) {
      //       return intl.get('sads.indexcongig.view.warning.json').d('请输入正确的JSON表达式');
      //     }
      //   }
      // },
    },
    {
      label: 'mapping',
      name: 'mapping',
      type: 'string',
      // validator: (value) => {
      //   const regExp = /\$\{[^}]+\}/g;
      //   if (!value) return true;
      //   const newValue = value.replace(regExp, 1);
      //   if (/^\d+$/g.test(newValue)) {
      //     return intl.get('sads.indexcongig.view.warning.json').d('请输入正确的JSON表达式');
      //   } else {
      //     try {
      //       JSON.parse(newValue);
      //     } catch (e) {
      //       return intl.get('sads.indexcongig.view.warning.json').d('请输入正确的JSON表达式');
      //     }
      //   }
      // },
    },
    {
      label: intl.get('sads.indexcongig.model.remark').d('备注'),
      name: 'remark',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get('sads.indexcongig.model.indexName').d('索引名称'),
      name: 'indexName',
    },
    {
      label: intl.get('sads.indexcongig.model.tenantName').d('租户名称'),
      name: 'tenantName',
    },
    {
      label: intl.get('sads.indexcongig.model.companyName').d('公司名称'),
      name: 'companyName',
    },
    {
      label: intl.get('sads.indexcongig.model.enabledFlag').d('状态'),
      name: 'enabledFlag',
      lookupCode: 'SDAP.PIPELINE_CONFIG_ENABLED',
    },
  ],
  transport: {
    read: {
      url: `/sdap/v1/es-indexs`,
      method: 'GET',
    },
    create: ({ data }) => {
      return {
        url: `/sdap/v1/es-indexs`,
        data: data[0],
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `/sdap/v1/es-indexs`,
        data: data[0],
        method: 'POST',
      };
    },
  },
  events: {
    update: ({ record, name }) => {
      if (name === 'indexNamePrefix' || name === 'indexNameSuffix') {
        const prefix = record.get('indexNamePrefix') || '';
        const suffix = record.get('indexNameSuffix') || '';
        record.set('indexName', `${prefix}${suffix}`);
      }
    },
  },
});

// 子对象表
const subObjectDS = (readOnly = false, headerRecord) => {
  return {
    // autoCreate: true,
    selection: readOnly ? false : 'multiple',
    paging: false,
    fields: [
      {
        label: intl.get('sads.indexcongig.model.subindexId').d('索引id'),
        name: 'indexId',
      },
      {
        label: intl.get('sads.indexcongig.model.objName').d('子对象名称'),
        name: 'objName',
        required: true,
        dynamicProps: {
          disabled: ({ record }) =>
            record.get('indexId') && record.get('tenantId') !== headerRecord.get('tenantId'),
        },
      },
      {
        label: intl.get('sads.indexcongig.model.ovnField').d('版本号字段'),
        name: 'ovnField',
        type: 'string',
        options: new DataSet({ pageSize: 500 }),
        dynamicProps: {
          // 子表数据租户id于列表行上id相同， 才可删除
          disabled: ({ record }) =>
            record.get('indexId') && record.get('tenantId') !== headerRecord.get('tenantId'),
        },
      },
      {
        label: intl.get('sads.indexcongig.model.nestedFlag').d('是否nested结构'),
        name: 'nestedFlag',
        type: 'number',
        lookupCode: 'HPFM.FLAG',
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled: ({ record }) =>
            record.get('indexId') && record.get('tenantId') !== headerRecord.get('tenantId'),
        },
      },
      {
        name: 'nestedOverrideFlag',
        label: intl.get('sads.indexcongig.model.nestedOverrideFlag').d('是否覆盖nested'),
        type: 'number',
        lookupCode: 'HPFM.FLAG',
        defaultValue: 0,
        dynamicProps: {
          disabled: ({ record }) =>
            !record.get('nestedFlag') ||
            (record.get('indexId') && record.get('tenantId') !== headerRecord.get('tenantId')),
        },
      },
      {
        label: intl.get('sads.indexcongig.model.nestedFieldName').d('nested结构字段'),
        name: 'nestedFieldName',
        options: new DataSet({ pageSize: 500 }),
        dynamicProps: {
          required: ({ record }) => record.get('nestedFlag'),
          disabled: ({ record }) =>
            !record.get('nestedFlag') ||
            (record.get('indexId') && record.get('tenantId') !== headerRecord.get('tenantId')),
        },
      },
      {
        name: 'objCode',
        label: intl.get('sads.indexcongig.model.objCode').d('子对象编码'),
        required: true,
        dynamicProps: {
          disabled: ({ record }) =>
            record.get('indexId') && record.get('tenantId') !== headerRecord.get('tenantId'),
        },
      },
      {
        label: intl.get('sads.indexcongig.model.subObjLineList').d('子对象表字段'),
        name: 'subObjLineList',
        options: new DataSet({ pageSize: 500 }),
        multiple: true,
        transformResponse: (_, res = {}) => {
          const data = res.subObjLineList || [];
          return data.length > 0
            ? data.map((m) => ({ ...m, meaning: m.objFieldName, value: m.objFieldName }))
            : null;
        },
      },
    ],
    record: {
      dynamicProps: {
        selectable: (record) =>
          record.status === 'add' || record.get('tenantId') === headerRecord.get('tenantId'),
      },
    },
    events: {
      update: ({ record, name, value }) => {
        // 非 nested 结构
        if (name === 'nestedFlag' && !value) {
          record.set('nestedFieldName', null);
        }
        if (['nestedFlag', 'nestedFieldName'].includes(name)) {
          record.set('ovnField', null);
          record.set('subObjLineList', null);
        }
        if (name === 'nestedOverrideFlag') {
          record.set('ovnField', null);
        }
      },
    },
  };
};

export { IndexDS, subObjectDS };
