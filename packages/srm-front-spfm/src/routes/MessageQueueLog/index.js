import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import request from 'utils/request';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_PLATFORM } from '_utils/config';
import { Header, Content } from 'components/Page';

// 重试请求
function retryService(params) {
  return request(`${SRM_PLATFORM}/v1/mq-message-log/resend`, {
    method: 'POST',
    body: params,
  });
}

function MessageQueueLog() {
  const isSuccessOptions = new DataSet({
    data: [
      { value: 1, meaning: intl.get('hzero.common.status.success').d('成功') },
      { value: 0, meaning: intl.get('hzero.common.status.failure').d('失败') },
    ],
  });
  const dataSet = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        selection: false,
        fields: [
          {
            name: 'isSuccess',
            options: isSuccessOptions,
          },
          {
            name: 'sendOrderly',
            lookupCode: 'HPFM.FLAG',
          },
        ],
        queryFields: [
          {
            name: 'buKey',
            label: intl.get('spfm.messageQueueLog.view.buKey').d('buKey'),
          },
          {
            name: 'handleMessage',
            label: intl.get('spfm.messageQueueLog.view.errMessage').d('失败原因'),
            transformRequest(val) {
              return val ? val.replace(/"/g, `'`) : val;
            },
          },
          {
            name: 'isSuccess',
            label: intl.get('spfm.messageQueueLog.view.sendStatus').d('发送状态'),
            options: isSuccessOptions,
          },
          {
            name: 'message',
            label: intl.get('spfm.messageQueueLog.view.messageBody').d('消息体'),
            transformRequest(val) {
              return val ? val.replace(/"/g, `'`) : val;
            },
          },
          {
            name: 'messageCode',
            label: intl.get('spfm.messageQueueLog.view.messageCode').d('消息编码'),
          },
          {
            name: 'messageTag',
            label: intl.get('spfm.messageQueueLog.view.messageTag').d('消息tag'),
          },
          {
            name: 'service',
            label: intl.get('spfm.messageQueueLog.view.sendService').d('发送服务'),
          },
          {
            name: 'topic',
            label: intl.get('spfm.messageQueueLog.view.topic').d('topic'),
          },
          {
            name: 'traceId',
            label: intl.get('spfm.messageQueueLog.view.traceId').d('traceId'),
          },
          {
            name: 'sendTime',
            type: 'dateTime',
            ignore: 'always',
            range: ['start', 'end'],
            label: intl.get('spfm.messageQueueLog.view.sendTime').d('发送时间'),
          },
          {
            name: 'sendTimeFrom',
            bind: 'sendTime.start',
          },
          {
            name: 'sendTimeTo',
            bind: 'sendTime.end',
          },
        ],
        transport: {
          read: ({ data }) => {
            return {
              method: 'POST',
              data,
              url: `${SRM_PLATFORM}/v1/mq-message-log`,
            };
          },
        },
      }),
    []
  );

  const columns = useMemo(
    () => [
      {
        name: 'service',
        width: 100,
        header: intl.get('spfm.messageQueueLog.view.sendService').d('发送服务'),
      },
      {
        name: 'isSuccess',
        width: 100,
        header: intl.get('spfm.messageQueueLog.view.sendStatus').d('发送状态'),
      },
      {
        name: 'handleMessage',
        width: 200,
        header: intl.get('spfm.messageQueueLog.view.errMessage').d('失败原因'),
      },
      {
        name: 'buKey',
        width: 240,
        header: intl.get('spfm.messageQueueLog.view.buKey').d('buKey'),
      },
      {
        name: 'messageCode',
        width: 160,
        header: intl.get('spfm.messageQueueLog.view.messageCode').d('消息编码'),
      },
      {
        name: 'messageTag',
        width: 160,
        header: intl.get('spfm.messageQueueLog.view.messageTag').d('消息tag'),
      },
      {
        name: 'message',
        width: 200,
        header: intl.get('spfm.messageQueueLog.view.messageBody').d('消息体'),
      },
      {
        name: 'sendOrderly',
        width: 130,
        header: intl.get('spfm.messageQueueLog.view.isOrderConsume').d('是否顺序消费'),
      },
      {
        name: 'sendTime',
        width: 180,
        header: intl.get('spfm.messageQueueLog.view.sendTime').d('发送时间'),
      },
      {
        name: 'topic',
        width: 240,
        header: intl.get('spfm.messageQueueLog.view.topic').d('topic'),
      },
      {
        name: 'traceId',
        width: 140,
        header: intl.get('spfm.messageQueueLog.view.traceId').d('traceId'),
        help: intl
          .get('spfm.messageQueueLog.view.traceIdHelp')
          .d('发送线程有取发送线程，发送线程没有自动生成，格式：mq-traceId'),
      },
      {
        name: 'action',
        width: 80,
        lock: 'right',
        header: intl.get('hzero.common.action').d('操作'),
        renderer: ({ record }) => (
          <a onClick={() => handleRetry(record)}>
            {intl.get('spfm.messageQueueLog.view.retry').d('重试')}
          </a>
        ),
      },
    ],
    []
  );

  // 重试
  async function handleRetry(record) {
    dataSet.status = 'loading';
    try {
      const params = { ...record.toData() };
      const res = getResponse(await retryService(params));
      if (res) {
        notification.success();
        dataSet.query(dataSet.currentPage);
      }
    } finally {
      dataSet.status = 'ready';
    }
  }

  return (
    <>
      <Header
        title={intl
          .get('spfm.messageQueueLog.view.title')
          .d('消息队列事务性消息和延迟消息日志查询')}
      />
      <Content>
        <Table dataSet={dataSet} columns={columns} />
      </Content>
    </>
  );
}

export default formatterCollections({ code: ['spfm.messageQueueLog'] })(MessageQueueLog);
