import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';

/**
 * 数据调度列表
 * @returns
 */
const DataSchedulingDS = () => ({
  selection: false,
  fields: [
    {
      label: intl.get('sads.dataSchedule.model.inputSourceCode').d('输入源编码'),
      name: 'inputSourceCode',
      type: 'string',
      required: true,
      maxLength: 30,
    },
    {
      label: intl.get('sads.dataSchedule.model.inputSourceName').d('输入源名称'),
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
      label: intl.get('sads.indexcongig.model.enabledFlag').d('状态'),
      name: 'enabledFlag',
      lookupCode: 'SDAP.PIPELINE_CONFIG_ENABLED',
    },
    {
      label: intl.get('sads.indexcongig.model.pipelineName').d('关联管道'),
      name: 'pipelineName',
      type: 'string',
    },
    {
      label: intl.get('sads.dataSchedule.model.threadTotal').d('线程数'),
      name: 'threadTotal',
      type: 'number',
    },
    {
      label: intl.get('sads.dataSchedule.model.cron').d('cron表达式'),
      name: 'cron',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get('sads.dataSchedule.model.inputSourceCode').d('输入源编码'),
      name: 'inputSourceCode',
    },
    {
      label: intl.get('sads.dataSchedule.model.inputSourceName').d('输入源名称'),
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
      url: `/sdap/v1/jobs`,
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

const DataSchedulingFormDS = () => ({
  selection: false,
  fields: [
    {
      // label: '输入源Id',
      name: 'inputSourceId',
      bind: 'inputSourceCodeObject.inputSourceId',
    },
    {
      label: intl.get('sads.dataSchedule.model.inputSourceCode').d('输入源编码'),
      name: 'inputSourceCodeObject',
      type: 'object',
      lovCode: 'SDAP.INPUT_SOURCE_LIST',
      required: true,
      valueField: 'inputSourceId',
      textField: 'inputSourceCode',
      ignore: 'always',
    },
    {
      label: intl.get('sads.dataSchedule.model.inputSourceCode').d('输入源编码'),
      name: 'inputSourceCode',
      bind: 'inputSourceCodeObject.inputSourceCode',
    },
    {
      label: intl.get('sads.dataSchedule.model.inputSourceName').d('输入源名称'),
      name: 'inputSourceName',
      type: 'string',
      required: true,
      maxLength: 30,
      bind: 'inputSourceCodeObject.inputSourceName',
    },
    {
      label: intl.get('sads.indexcongig.model.enabledFlag').d('状态'),
      name: 'enabledFlag',
      lookupCode: 'SDAP.PIPELINE_CONFIG_ENABLED',
    },
    {
      label: intl.get('sads.indexcongig.model.pipelineName').d('关联管道'),
      name: 'pipelineName',
      type: 'string',
      bind: 'inputSourceCodeObject.pipelineConfig.pipelineName',
      required: true,
    },
    {
      label: intl.get('sads.dataSchedule.model.threadTotal').d('线程数'),
      name: 'threadTotal',
      type: 'number',
      required: true,
      min: 1,
      step: 1,
    },
    {
      label: intl.get('sads.dataSchedule.model.cron').d('cron表达式'),
      name: 'cron',
      type: 'string',
      required: true,
      maxLength: 200,
    },
    {
      label: intl.get('sads.dataSchedule.model.taskParameters').d('查询参数'),
      name: 'taskParameters',
      type: 'string',
      validator: (value) => {
        const regExp = /\$\{[^}]+\}/g;
        if (!value) return true;
        const newValue = value.replace(regExp, 1);
        if (/^\d+$/g.test(newValue)) {
          return intl.get('sads.indexcongig.view.warning.json').d('请输入正确的JSON表达式');
        } else {
          try {
            JSON.parse(newValue);
          } catch (e) {
            return intl.get('sads.indexcongig.view.warning.json').d('请输入正确的JSON表达式');
          }
        }
      },
    },
    {
      label: intl.get('sads.dataSchedule.model.remark').d('描述'),
      name: 'remark',
      type: 'string',
      maxLength: 300,
    },
    {
      label: intl.get('sads.dataSchedule.model.loopFlag').d('是否循环'),
      name: 'loopFlag',
      lookupCode: 'HPFM.FLAG',
      type: 'number',
      defaultValue: 0,
      required: true,
    },
    {
      label: intl.get('sads.dataSchedule.model.loopType').d('循环类型'),
      name: 'loopType',
      options: new DataSet({
        data: [
          {
            value: 0,
            meaning: intl.get('sads.dataSchedule.view.loopType.numberRange').d('数字范围'),
          },
          { value: 1, meaning: intl.get('sads.dataSchedule.view.loopType.SQL').d('SQL') },
        ],
      }),
      dynamicProps: {
        required: ({ record }) => record.get('loopFlag'),
      },
    },
    {
      label: intl.get('sads.dataSchedule.model.loopFrom').d('循环起始'),
      name: 'loopFrom',
      type: 'number',
      dynamicProps: {
        required: ({ record }) => Number(record.get('loopType')) === 0 && record.get('loopFlag'),
      },
    },
    {
      label: intl.get('sads.dataSchedule.model.loopTo').d('循环结束'),
      name: 'loopTo',
      type: 'number',
      dynamicProps: {
        required: ({ record }) => Number(record.get('loopType')) === 0 && record.get('loopFlag'),
      },
    },
    {
      label: intl.get('sads.dataSchedule.model.loopSql').d('循环数据来源SQL'),
      name: 'loopSql',
      maxLength: 500,
      dynamicProps: {
        required: ({ record }) => Number(record.get('loopType')) === 1 && record.get('loopFlag'),
      },
    },
    {
      label: intl.get('sads.dataSchedule.model.loopPlaceholder').d('循环占位符'),
      name: 'loopPlaceholder',
      maxLength: 50,
      dynamicProps: {
        required: ({ record }) => record.get('loopFlag'),
      },
    },
  ],
  queryFields: [
    {
      label: intl.get('sads.dataSchedule.model.inputSourceCode').d('输入源编码'),
      name: 'inputSourceCode',
    },
    {
      label: intl.get('sads.dataSchedule.model.inputSourceName').d('输入源名称'),
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
      url: `/sdap/v1/jobs`,
      method: 'GET',
    },
    create: ({ data }) => {
      return {
        url: `/sdap/v1/jobs`,
        data: data[0],
        method: 'PUT',
      };
    },
    update: ({ data }) => {
      return {
        url: `/sdap/v1/jobs`,
        data: data[0],
        method: 'PUT',
      };
    },
  },
});
export { DataSchedulingDS, DataSchedulingFormDS };
