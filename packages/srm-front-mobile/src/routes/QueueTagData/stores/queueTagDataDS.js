import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';

function queueTagDataDS() {
  return {
    primaryKey: 'applicationId',
    autoQuery: false,
    selection: 'multiple',
    autoQueryAfterSubmit: true,
    pageSize: 10,

    // table表单显示的字段
    fields: [
      {
        name: 'sourceKey',
        type: 'string',
        label: intl.get('smbl.queueData.model.QueueData.sourceKey').d('队列数据唯一标识'),
      },
      {
        name: 'topicCode',
        type: 'string',
        label: intl.get('smbl.queue.model.Queue.topicCode').d('订阅主题'),
      },
      {
        name: 'tagCode',
        type: 'string',
        label: intl.get('smbl.queue.model.Queue.tagCode').d('队列标签编码'),
      },
      {
        name: 'tagName',
        type: 'string',
        label: intl.get('smbl.queue.model.Queue.tagName').d('队列标签名称'),
      },
      {
        name: 'status',
        type: 'int',
        label: intl.get('hzero.common.status').d('状态'),
        lookupCode: 'SMBL.DATA_EXECUTE_SATUS',
      },
      {
        name: 'message',
        type: 'string',
        label: intl.get('smbl.queueData.model.QueueData.message').d('执行结果'),
      },
      {
        name: 'context',
        type: 'string',
        label: intl.get('smbl.queueData.model.QueueData.context').d('内容'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('smbl.commmon.model.creationDate').d('创建时间'),
      },
      {
        name: 'lastUpdateDate',
        type: 'dateTime',
        label: intl.get('smbl.commmon.model.lastUpdateDate').d('更新时间'),
      },
    ],
    // 查询表单字段
    queryFields: [
      {
        name: 'sourceKey',
        type: 'string',
        label: intl.get('smbl.queueData.model.QueueData.sourceKey').d('数据唯一标识'),
      },
      // {
      //   name: 'tagId',
      //   type: 'LOV',
      //   label: intl.get('smbl.queue.model.Queue.tagCode').d('队列标签编码'),
      // },
      {
        name: 'tag',
        type: 'object',
        label: intl.get('smbl.queue.model.Queue.tagCode').d('队列标签编码'),
        lovCode: 'SMBL.TOPIC_TAG_VIEW',
        ignore: 'always',
        required: true,
      },
      {
        name: 'tagId',
        bind: 'tag.tagId',
      },
      // {
      //   name: 'tagName',
      //   type: 'string',
      //   label: intl.get('smbl.queue.model.Queue.tagName').d('队列标签名称'),
      // },
      {
        name: 'status',
        type: 'int',
        label: intl.get('hzero.common.status').d('状态'),
        lookupCode: 'SMBL.DATA_EXECUTE_SATUS',
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('smbl.commmon.model.creationDate').d('创建时间'),
        range: ['creationDateFrom', 'creationDateTo'],
        format: 'YYYY-MM-DD HH:mm:ss',
        required: true,
      },
    ],

    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
      submitSuccess: ({ dataSet }) => dataSet.query(1),
    },

    transport: {
      read: ({ data }) => {
        const { creationDateFrom, creationDateTo } = data.creationDate || {};
        const newData = {
          ...data,
          creationDateFrom,
          creationDateTo,
        };
        delete newData.creationDate;
        return {
          data: {
            ...newData,
          },
          url: `${SRM_SMBL}/v1/queue-datas`,
          method: 'get',
        };
      },
    },
  };
}
export { queueTagDataDS };
