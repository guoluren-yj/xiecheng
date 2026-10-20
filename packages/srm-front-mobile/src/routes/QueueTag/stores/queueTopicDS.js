import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';

function queueTopicDS() {
  return {
    primaryKey: 'applicationId',
    autoQuery: true,
    selection: false,
    autoQueryAfterSubmit: true,
    pageSize: 6,

    // table表单显示的字段
    fields: [
      {
        name: 'topicName',
        type: 'intl',
        required: true,
        label: intl.get('smbl.queue.model.Queue.topicName').d('队列topic名称'),
      },
      {
        name: 'topicCode',
        type: 'string',
        required: true,
        label: intl.get('smbl.queue.model.Queue.topicCode').d('队列topic编码'),
      },
      {
        name: 'enableFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enabled').d('启用标识'),
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'operationAction',
        type: 'string',
        label: intl.get('hzero.common.table.column.option').d('操作'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hzero.common.model.remark').d('备注'),
      },
    ],
    // 查询表单字段
    queryFields: [
      {
        name: 'topicCode',
        type: 'string',
        label: intl.get('smbl.queue.model.Queue.topicCode').d('队列topic编码'),
      },
      {
        name: 'topicName',
        type: 'string',
        label: intl.get('smbl.queue.model.Queue.tagName').d('队列topic名称'),
      },
    ],

    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
      submitSuccess: ({ dataSet }) => dataSet.query(1),
    },
    transport: {
      read: {
        url: `${SRM_SMBL}/v1/queue-topics/list`,
        method: 'get',
      },
      create: ({ data }) => {
        return {
          data: data[0],
          url: `${SRM_SMBL}/v1/queue-topics/save`,
          method: 'post',
          autoQuery: true,
        };
      },
      update: ({ data }) => {
        return {
          data: data[0],
          url: `${SRM_SMBL}/v1/queue-topics/save`,
          method: 'post',
          autoQuery: true,
        };
      },
    },
  };
}
export { queueTopicDS };
