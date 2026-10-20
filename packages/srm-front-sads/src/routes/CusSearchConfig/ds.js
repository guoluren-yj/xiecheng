import intl from 'utils/intl';
import { CODE } from 'utils/regExp';

// 判断是否为json格式
function isJson(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
  return false;
}

// 配置
const configDs = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      name: 'searchConfigCode',
      pattern: CODE,
      required: true,
      defaultValidationMessages: {
        patternMismatch: intl
          .get('hzero.common.validation.code')
          .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
      },
      label: intl.get('sads.searchConfig.view.configCode').d('配置编码'),
      dynamicProps: { disabled: ({ record }) => record.get('searchConfigId') },
    },
    {
      name: 'searchConfigName',
      required: true,
      label: intl.get('sads.searchConfig.view.configName').d('配置名称'),
    },
    {
      name: 'tenantName',
      bind: 'tenantLov.tenantName',
      label: intl.get('sads.searchConfig.view.tenantName').d('租户名称'),
    },
    {
      name: 'tenantId',
      bind: 'tenantLov.tenantId',
    },
    {
      name: 'tenantLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'HPFM.TENANT_ALL',
      required: true,
      label: intl.get('sads.searchConfig.view.tenantName').d('租户名称'),
    },
    {
      label: intl.get('sads.searchConfig.model.indexName').d('索引名称'),
      name: 'indexLov',
      type: 'object',
      required: true,
      valueField: 'indexId',
      textField: 'indexName',
      lovCode: 'SDAP.ESINDEX.INDEXNAME.VIEW',
      ignore: 'always',
    },
    {
      name: 'indexId',
      bind: 'indexLov.indexId',
    },
    {
      label: intl.get('sads.searchConfig.model.indexName').d('索引名称'),
      name: 'indexName',
      bind: 'indexLov.indexName',
    },
    {
      name: 'remark',
      label: intl.get('sads.searchConfig.view.remark').d('描述'),
    },
    {
      name: 'searchTemplate',
      required: true,
      label: intl.get('sads.searchConfig.model.searchTemplate').d('搜索模板'),
    },
    {
      name: 'enabledFlag',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  queryFields: [
    {
      name: 'searchConfigCode',
      label: intl.get('sads.searchConfig.view.configCode').d('配置编码'),
    },
    {
      name: 'tenantId',
      bind: 'tenantLov.tenantId',
    },
    {
      name: 'tenantLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'HPFM.TENANT_ALL',
      label: intl.get('sads.searchConfig.view.tenantName').d('租户名称'),
    },
    {
      name: 'enabledFlag',
      lookupCode: 'HPFM.ENABLED_FLAG',
      label: intl.get('hzero.common.status').d('状态'),
    },
  ],
  transport: {
    read: {
      url: '/sads/v1/search-configs',
      method: 'GET',
    },
  },
});

// 配置
const configFormDs = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      name: 'searchConfigCode',
      pattern: CODE,
      required: true,
      defaultValidationMessages: {
        patternMismatch: intl
          .get('hzero.common.validation.code')
          .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
      },
      label: intl.get('sads.searchConfig.view.configCode').d('配置编码'),
      dynamicProps: { disabled: ({ record }) => record.get('searchConfigId') },
    },
    {
      name: 'searchConfigName',
      required: true,
      label: intl.get('sads.searchConfig.view.configName').d('配置名称'),
    },
    {
      name: 'tenantName',
      bind: 'tenantLov.tenantName',
      label: intl.get('sads.searchConfig.view.tenantName').d('租户名称'),
    },
    {
      name: 'tenantId',
      bind: 'tenantLov.tenantId',
    },
    {
      name: 'tenantLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'HPFM.TENANT_ALL',
      required: true,
      label: intl.get('sads.searchConfig.view.tenantName').d('租户名称'),
    },
    {
      label: intl.get('sads.searchConfig.model.indexName').d('索引名称'),
      name: 'indexLov',
      type: 'object',
      required: true,
      valueField: 'indexId',
      textField: 'indexName',
      lovCode: 'SDAP.ESINDEX.INDEXNAME.VIEW',
      ignore: 'always',
    },
    {
      name: 'indexId',
      bind: 'indexLov.indexId',
    },
    {
      label: intl.get('sads.searchConfig.model.indexName').d('索引名称'),
      name: 'indexName',
      bind: 'indexLov.indexName',
    },
    {
      name: 'remark',
      label: intl.get('sads.searchConfig.view.remark').d('描述'),
    },
    {
      name: 'searchTemplate',
      required: true,
      label: intl.get('sads.searchConfig.model.searchTemplate').d('搜索模板'),
    },
    {
      name: 'enabledFlag',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
});

// 前置条件
const conditionDs = () => ({
  fields: [
    {
      name: 'conditionCode',
      pattern: CODE,
      required: true,
      maxLength: 20,
      defaultValidationMessages: {
        patternMismatch: intl
          .get('hzero.common.validation.code')
          .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
      },
      label: intl.get('sads.searchConfig.model.conditionCode').d('条件编码'),
      dynamicProps: { disabled: ({ record }) => record.get('conditionId') },
    },
    {
      name: 'orderSeq',
      type: 'number',
      // required: true,
      label: intl.get('sads.searchConfig.model.orderSeq').d('排序号'),
    },
    {
      name: 'conditionType',
      required: true,
      lookupCode: 'SDAP_SEARCH_TYPE',
      label: intl.get('sads.searchConfig.model.conditionType').d('条件类型'),
    },
    {
      name: 'conditionApiType',
      label: intl.get('sads.searchConfig.model.apiType').d('接口类型'),
      dynamicProps: {
        required: ({ record }) => record.get('conditionType') === 'API',
        disabled: ({ record }) => record.get('conditionType') !== 'API',
      },
    },
    {
      name: 'conditionApiMeth',
      label: intl.get('sads.searchConfig.model.reqMethod').d('请求方式'),
      dynamicProps: {
        required: ({ record }) => record.get('conditionType') === 'API',
        disabled: ({ record }) => record.get('conditionType') !== 'API',
      },
    },
    {
      name: 'conditionSql',
      label: intl.get('sads.searchConfig.model.conditionPre').d('前置条件'),
      dynamicProps: { disabled: ({ record }) => record.get('conditionType') !== 'SQL' },
    },
    {
      name: 'conditionUrl',
      label: intl.get('sads.searchConfig.model.conditionPre').d('前置条件'),
      dynamicProps: { disabled: ({ record }) => record.get('conditionType') !== 'API' },
    },
    {
      name: 'conditionParams',
      required: true,
      label: intl.get('sads.searchConfig.model.paramsPre').d('前置参数'),
      validator: (value) => {
        if (value) {
          const regExp = /\$\{[^}]+\}/g;
          const newValue = value.replace(regExp, 1);
          const jsonFlag = isJson(newValue);
          if (!jsonFlag) {
            return intl.get('sads.searchConfig.model.paramJsonValidate').d('请输入合法的前置参数');
          }
        }
      },
    },
  ],
  // events: {
  //   update: ({ record, name }) => {
  //     if (name === 'conditionType') {
  //       record.init('conditionApiType', null);
  //       record.init('conditionApiMeth', null);
  //     }
  //   },
  // },
});

export { configDs, conditionDs, configFormDs };
