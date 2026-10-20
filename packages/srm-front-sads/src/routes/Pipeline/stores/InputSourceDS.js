/* eslint-disable no-template-curly-in-string */
import intl from 'utils/intl';
import { CODE } from 'utils/regExp';

/**
 * 管道输入源列表
 * @returns
 */

const InputSourceDS = () => ({
  selection: false,
  fields: [
    {
      // label: '输入源Id',
      name: 'inputSourceId',
      type: 'number',
    },
    {
      label: intl.get('sads.pipel.model.preferenceIndex').d('队列下标'),
      name: 'preferenceIndex',
      type: 'number',
      step: 1,
      defaultValue: 1,
      dynamicProps: {
        disabled: ({ record }) => !['ALL', 'PUSH'].includes(record.get('inputType')),
      },
    },
    {
      label: intl.get('sads.pipel.model.pullProcessUrl').d('数据处理接口'),
      name: 'pullProcessUrl',
    },
    {
      label: intl.get('sads.pipel.model.pullProcessUrlMethod').d('数据处理类型'),
      name: 'pullProcessUrlMethod',
    },
    {
      label: intl.get('sads.pipel.model.processBatchSize').d('单次调用量'),
      name: 'processBatchSize',
      type: 'number',
    },
    {
      label: intl.get('sads.pipel.model.inputSourceCode').d('输入源编码'),
      name: 'inputSourceCode',
      type: 'string',
      required: true,
      maxLength: 30,
      pattern: CODE,
      defaultValidationMessages: {
        patternMismatch: intl
          .get('hzero.common.validation.code')
          .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
      },
      dynamicProps: {
        disabled: ({ record }) => record.get('inputSourceId'),
      },
    },
    {
      label: intl.get('sads.pipel.model.inputSourceName').d('输入源名称'),
      name: 'inputSourceName',
      type: 'string',
      required: true,
      maxLength: 30,
    },
    {
      label: intl.get('sads.dataSchedule.model.remark').d('描述'),
      name: 'remark',
      type: 'string',
      maxLength: 300,
    },
    {
      label: intl.get('sads.pipel.model.pipelineConfig').d('关联管道'),
      name: 'pipelineConfig',
      type: 'object',
      lovCode: 'SDAP.PIPELINE_CONFIG',
      required: true,
    },
    {
      label: intl.get('sads.pipel.model.tenant').d('租户'),
      name: 'tenant',
      type: 'object',
      lovCode: 'HPFM.TENANT',
      textField: 'tenantName',
      valueField: 'tenantId',
      required: true,
      ignore: 'always',
    },
    {
      name: 'tenantId',
      bind: 'tenant.tenantId',
    },
    {
      label: intl.get('sads.pipel.model.tenant').d('租户'),
      name: 'tenantName',
      bind: 'tenant.tenantName',
      ignore: 'always',
    },
    {
      name: 'syncMultiCloud',
      label: intl.get('sads.pipel.model.syncMultiCloud').d('是否同步多云'),
      type: 'number',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      lookupCode: 'HPFM.FLAG',
    },
    {
      label: intl.get('sads.indexcongig.model.enabledFlag').d('状态'),
      name: 'enabledFlag',
      lookupCode: 'SDAP.PIPELINE_CONFIG_ENABLED',
    },
    {
      label: intl.get('sads.pipel.model.objectVersionNumberWildcard').d('版本号字段名'),
      name: 'objectVersionNumberWildcard',
      type: 'string',
      maxLength: 200,
    },
    {
      label: intl.get('sads.pipel.model.dataTemplate').d('数据模板'),
      name: 'dataTemplate',
      type: 'string',
      maxLength: 2000,
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
      label: intl.get('sads.pipel.model.inputType').d('数据来源'),
      name: 'inputType',
      type: 'string',
      lookupCode: 'SDAP.INPUT_TYPE',
      required: true,
      defaultValue: 'PUSH',
    },
    // {
    //   label: 'jdbcURL',
    //   name: 'jdbcUrl',
    //   type: 'string',
    //   maxLength: 500,
    // },
    // {
    //   label: intl.get('sads.pipel.model.dbUsername').d('数据库用户名'),
    //   name: 'dbUsername',
    //   type: 'string',
    //   maxLength: 200,
    // },
    // {
    //   label: intl.get('sads.pipel.model.dbPassword').d('数据库密码'),
    //   name: 'dbPassword',
    //   type: 'string',
    //   maxLength: 200,
    // },
    {
      label: intl.get('sads.pipel.model.dataSourceCode').d('数据源'),
      name: 'dataSourceCode',
      lookupCode: 'SDAP.DATA_SOURCE',
    },
    {
      label: 'SQL ',
      name: 'sourceStatement',
      type: 'string',
      maxLength: 5000,
      dynamicProps: {
        required: ({ record }) => record.get('inputType') !== 'PUSH',
      },
    },
  ],
  queryFields: [
    {
      label: intl.get('sads.pipel.model.inputSourceCode').d('输入源编码'),
      name: 'inputSourceCode',
    },
    {
      label: intl.get('sads.pipel.model.inputSourceName').d('输入源名称'),
      name: 'inputSourceName',
    },
    {
      label: intl.get('sads.indexcongig.model.enabledFlag').d('状态'),
      name: 'enabledFlag',
      lookupCode: 'SDAP.PIPELINE_CONFIG_ENABLED',
    },
  ],
  transport: {
    read: {
      url: `/sdap/v1/input-source/query`,
      method: 'GET',
    },
    create: ({ data }) => {
      return {
        url: `/sdap/v1/input-source`,
        data: data[0],
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `/sdap/v1/input-source`,
        data: data[0],
        method: 'POST',
      };
    },
  },
});

export { InputSourceDS };
