/**
 * ScriptLogSearch.js
 * 适配器日志搜索
 * @date: 2022-02-11
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { DataSet, Table, Modal, Button, TextArea } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { getScriptLogSearchDs, getScriptLogDetailDs } from '../store/ScriptLogSearchDs';

@formatterCollections({
  code: ['spfm.scriptLogSearch'],
})
@withProps(
  () => {
    const scriptLogSearchDs = new DataSet(getScriptLogSearchDs());
    const scriptLogDetailDs = new DataSet(getScriptLogDetailDs());
    return {
      scriptLogSearchDs,
      scriptLogDetailDs,
    };
  },
  { cacheState: true }
)
export default class ScriptLogSearch extends React.Component {
  constructor(props) {
    super(props);
    this.scriptLogSearchDs = this.props.scriptLogSearchDs;
    this.scriptLogDetailDs = this.props.scriptLogDetailDs;
  }

  expandedRowRenderer({ record }) {
    const content = record.get('content') || '';
    return (
      <TextArea
        style={{ height: '400px', width: '50vw', wordBreak: 'break-all' }}
        value={content}
      />
    );
  }

  openScriptLog = (record) => {
    const { traceId, tenantNum, taskCode, scriptType } = record.get([
      'traceId',
      'tenantNum',
      'taskCode',
      'scriptType',
    ]);
    this.scriptLogDetailDs.setQueryParameter('traceId', traceId);
    this.scriptLogDetailDs.setQueryParameter('tenantNum', tenantNum);
    this.scriptLogDetailDs.setQueryParameter('taskCode', taskCode);
    this.scriptLogDetailDs.setQueryParameter('scriptType', scriptType);
    this.scriptLogDetailDs.query().then((res) => {
      if (res) {
        const modal = Modal.open({
          title: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.content').d('日志内容'),
          drawer: true,
          style: { width: '60vw' },
          children: (
            <Table dataSet={this.scriptLogDetailDs} expandedRowRenderer={this.expandedRowRenderer}>
              <Table.Column name="actualExecutionTime" width={200} />
              <Table.Column name="content" />
            </Table>
          ),
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
        name: 'tenantName',
        width: 240,
      },
      {
        name: 'taskCode',
        minWidth: 280,
      },
      {
        name: 'traceId',
        width: 120,
      },
      {
        name: 'actualExecutionDate',
        width: 180,
      },
      {
        name: 'scriptType',
        width: 120,
      },
      {
        name: 'content',
        width: 120,
        lock: 'right',
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <a onClick={() => this.openScriptLog(record)}>
                {intl.get('spfm.scriptLogSearch.model.scriptLogSearch.content').d('日志内容')}
              </a>
            </span>
          );
        },
      },
    ];
    return (
      <>
        <Header title={intl.get('spfm.scriptLogSearch.view.title.scriptLogSearch').d('脚本日志')} />
        <Content>
          <Table
            dataSet={this.scriptLogSearchDs}
            columns={columns}
            queryBarProps={{ defaultShowMore: true }}
          />
        </Content>
      </>
    );
  }
}
