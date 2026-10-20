import intl from 'utils/intl';
import { CODE } from 'utils/regExp';

/**
 * 管道配置列表
 * @returns
 */
const ConfigurationListDS = () => ({
  selection: false,
  fields: [
    {
      label: intl.get('sads.pipel.model.pipelineCode').d('管道编码'),
      name: 'pipelineCode',
      type: 'string',
      required: true,
      maxLength: 30,
    },
    {
      label: intl.get('sads.pipel.model.pipelineName').d('管道名称'),
      name: 'pipelineName',
      type: 'string',
      required: true,
      maxLength: 30,
    },
    {
      label: intl.get('sads.dataSchedule.model.remark').d('描述'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get('sads.pipel.model.inputSourceList').d('关联输入源'),
      name: 'inputSourceList',
      type: 'object',
    },
    {
      label: intl.get('sads.pipel.model.outputSourceList').d('关联输处源'),
      name: 'outputSourceList',
      type: 'object',
    },
    {
      label: intl.get('sads.indexcongig.model.enabledFlag').d('状态'),
      name: 'enabledFlag',
      lookupCode: 'SDAP.PIPELINE_CONFIG_ENABLED',
    },
  ],
  queryFields: [
    {
      label: intl.get('sads.pipel.model.pipelineCode').d('管道编码'),
      name: 'pipelineCode',
      type: 'string',
    },
    {
      label: intl.get('sads.pipel.model.pipelineName').d('管道名称'),
      name: 'pipelineName',
      type: 'string',
    },
    {
      label: intl.get('sads.indexcongig.model.enabledFlag').d('状态'),
      name: 'enabledFlag',
      lookupCode: 'SDAP.PIPELINE_CONFIG_ENABLED',
    },
  ],
  transport: {
    read: {
      url: `/sdap/v1/data-pipeline/query`,
      method: 'GET',
    },
  },
});

const ConfigurationFormDS = () => ({
  fields: [
    {
      label: intl.get('sads.pipel.model.pipelineCode').d('管道编码'),
      name: 'pipelineCode',
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
        disabled: ({ record }) => record.get('pipelineId'),
      },
    },
    {
      label: intl.get('sads.pipel.model.pipelineName').d('管道名称'),
      name: 'pipelineName',
      type: 'string',
      required: true,
      maxLength: 30,
    },
    {
      label: intl.get('sads.dataSchedule.model.remark').d('描述'),
      name: 'remark',
      type: 'string',
    },
  ],
  transport: {
    create: ({ data }) => {
      return {
        url: `/sdap/v1/data-pipeline`,
        data,
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `/sdap/v1/data-pipeline`,
        data,
        method: 'POST',
      };
    },
  },
});

/**
 * 管道配置-关联输入源DS
 * @returns
 */
const RelaInputSourceListDS = () => ({
  selection: false,
  fields: [
    {
      label: intl.get('sads.pipel.model.inputSourceCode').d('输入源编码'),
      name: 'inputSourceCode',
      type: 'string',
      required: true,
      maxLength: 30,
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
  ],
  queryFields: [
    {
      label: intl.get('sads.pipel.model.code').d('编码'),
      name: 'inputSourceCode',
    },
    {
      label: intl.get('sads.pipel.model.name').d('名称'),
      name: 'inputSourceName',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `/sdap/v1/input-source/query`,
        method: 'GET',
      };
    },
  },
});

/**
 * 管道配置-关联输出源DS
 * @returns
 */
const RelaOutputSourceListDS = () => ({
  selection: false,
  fields: [
    {
      label: intl.get('sads.pipel.model.outputSourceCode').d('输出源编码'),
      name: 'outputSourceCode',
      type: 'string',
      required: true,
      maxLength: 30,
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
  ],
  transport: {
    read: () => {
      return {
        url: `/sdap/v1/output-source/query`,
        method: 'GET',
      };
    },
  },
});

export { ConfigurationListDS, ConfigurationFormDS, RelaInputSourceListDS, RelaOutputSourceListDS };
