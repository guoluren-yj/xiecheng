import intl from 'utils/intl';
import { CODE } from 'utils/regExp';
/**
 * 管道输出源列表
 * @returns
 */
const OutputSourceListDS = () => ({
  selection: false,
  fields: [
    {
      label: intl.get('sads.pipel.model.outputSourceCode').d('输出源编码'),
      name: 'outputSourceCode',
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
        disabled: ({ record }) => record.get('outputSourceId'),
      },
    },
    {
      label: intl.get('sads.pipel.model.outputSourceName').d('输出源名称'),
      name: 'outputSourceName',
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
      label: intl.get('sads.pipel.model.sourceIndexWildcard').d('索引名称'),
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
      label: intl.get('sads.pipel.model.sourceIndexWildcard').d('索引名称'),
      name: 'indexName',
      bind: 'indexLov.indexName',
    },
    {
      label: intl.get('sads.pipel.model.indexIdWildcard').d('索引id字段名'),
      name: 'indexIdWildcard',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('sads.indexcongig.model.enabledFlag').d('状态'),
      name: 'enabledFlag',
      lookupCode: 'SDAP.PIPELINE_CONFIG_ENABLED',
    },
  ],
  queryFields: [
    {
      label: intl.get('sads.pipel.model.outputSourceCode').d('输出源编码'),
      name: 'outputSourceCode',
    },
    {
      label: intl.get('sads.pipel.model.outputSourceName').d('输出源名称'),
      name: 'outputSourceName',
    },
    {
      label: intl.get('sads.indexcongig.model.enabledFlag').d('状态'),
      name: 'enabledFlag',
      lookupCode: 'SDAP.PIPELINE_CONFIG_ENABLED',
    },
  ],
  transport: {
    read: {
      url: `/sdap/v1/output-source/query`,
      method: 'GET',
    },
    create: ({ data }) => {
      return {
        url: `/sdap/v1/output-source`,
        data: data[0],
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `/sdap/v1/output-source`,
        data: data[0],
        method: 'POST',
      };
    },
  },
});

export { OutputSourceListDS };
