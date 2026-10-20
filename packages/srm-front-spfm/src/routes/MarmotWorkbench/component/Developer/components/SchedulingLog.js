import React from 'react';
import { DataSet, Table, Modal, Button, TextArea } from 'choerodon-ui/pro';
import { Tag } from 'hzero-ui';
import { isString } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { querySchedulingLogDetail } from '@/services/marmotWorkbenchService';
import { getSchedulingLogDs } from '../store/SchedulingLogDs';

@formatterCollections({
  code: ['spfm.schedulingLog'],
})
@withProps(
  () => {
    const schedulingLogDs = new DataSet(getSchedulingLogDs());
    return {
      schedulingLogDs,
    };
  },
  { cacheState: true }
)
export default class SchedulingLog extends React.Component {
  constructor(props) {
    super(props);
    this.schedulingLogDs = this.props.schedulingLogDs;
  }

  openScriptLog = (record) => {
    const logId = record.get('logId') || '';
    querySchedulingLogDetail(logId).then((res) => {
      if (res && isString(res)) {
        const modal = Modal.open({
          title: intl.get('spfm.schedulingLog.model.schedulingLog.errorDetail').d('错误详情'),
          drawer: true,
          style: { width: 600 },
          children: <TextArea style={{ height: '80vh', width: 540 }} value={res} />,
          footer: (
            <Button
              onClick={() => {
                modal.close();
              }}
              type="primary"
            >
              {intl.get(`hzero.common.status.closed`).d('关闭')}
            </Button>
          ),
        });
      }
    });
  };

  render() {
    const columns = [
      {
        name: 'jobId',
        width: 120,
      },
      {
        name: 'tenantName',
        width: 240,
      },
      {
        name: 'jobResultMeaning',
        width: 120,
        renderer: ({ value, record }) => {
          const tagColor = record.get('jobResult') === 'FAILURE' ? 'red' : 'green';
          return <Tag color={tagColor}>{value || '-'}</Tag>;
        },
      },
      {
        name: 'clientResultMeaning',
        width: 120,
        renderer: ({ value, record }) => {
          const clientResult = record.get('clientResult');
          const tagColor =
            clientResult === 'DOING'
              ? 'blue'
              : clientResult === 'WARNING'
              ? 'orange'
              : clientResult === 'SUCCESS'
              ? 'green'
              : 'red';
          return <Tag color={tagColor}>{value || '-'}</Tag>;
        },
      },
      {
        name: 'startTime',
        width: 200,
      },
      {
        name: 'endTime',
        width: 200,
      },
      {
        name: 'messageHeader',
        minWidth: 200,
      },
      {
        name: 'action',
        width: 120,
        lock: 'right',
        renderer: ({ record }) => {
          const messageHeader = record.get('messageHeader');
          return (
            <span className="action-link">
              {messageHeader && (
                <a onClick={() => this.openScriptLog(record)}>
                  {intl.get('spfm.schedulingLog.model.schedulingLog.errorDetail').d('错误详情')}
                </a>
              )}
            </span>
          );
        },
      },
    ];
    return (
      <>
        <Header title={intl.get('spfm.schedulingLog.view.title.schedulingLog').d('调度日志')} />
        <Content>
          <Table
            dataSet={this.schedulingLogDs}
            columns={columns}
            queryBarProps={{ defaultShowMore: true }}
          />
        </Content>
      </>
    );
  }
}
