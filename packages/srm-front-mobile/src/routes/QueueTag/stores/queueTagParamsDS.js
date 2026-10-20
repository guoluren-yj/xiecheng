import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';

function queueTagParamsDS() {
  return {
    primaryKey: 'tagParamsId',
    autoQuery: true,
    selection: false,
    autoQueryAfterSubmit: true,
    pageSize: 10,

    // table表单显示的字段
    fields: [
      {
        name: 'tagCode',
        type: 'string',
        required: true,
        unique: true,
        label: intl.get('smbl.queue.model.Queue.tagCode').d('队列标签编码'),
      },
      {
        name: 'tagName',
        type: 'string',
        required: true,
        label: intl.get('smbl.queue.model.Queue.tagName').d('队列标签名称'),
      },
      {
        name: 'method',
        type: 'string',
        required: true,
        label: intl.get('smbl.queue.model.Queue.method').d('Bean名称'),
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
        name: 'syncFlag',
        type: 'number',
        label: intl.get('smbl.queue.model.Queue.syncFlag').d('执行方式'),
        lookupCode: 'SMBL.EXECUTE_METHOD',
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('smbl.queue.model.Queue.remark').d('备注'),
      },
      {
        name: 'operationAction',
        type: 'string',
        label: intl.get('hzero.common.table.column.option').d('操作'),
      },
    ],

    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
      submitSuccess: ({ dataSet }) => dataSet.query(1),
    },

    transport: {
      read: ({ data }) => {
        if (data.topicId) {
          const { topicId } = data;
          // delete data.topicId;
          return {
            url: `${SRM_SMBL}/v1/queue-tagss/list/${topicId}`,
            method: 'get',
          };
        } else {
          return null;
        }
      },
      create: ({ data }) => {
        const { topicId } = data[0];
        return {
          url: `${SRM_SMBL}/v1/queue-tagss/save/${topicId}`,
          method: 'post',
          autoQuery: true,
        };
      },
      update: ({ data }) => {
        const { topicId } = data[0];
        return {
          url: `${SRM_SMBL}/v1/queue-tagss/save/${topicId}`,
          method: 'post',
        };
      },
    },
  };
}
export { queueTagParamsDS };
