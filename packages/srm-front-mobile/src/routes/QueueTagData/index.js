/**
 * index.js -队列标签数据查询
 * @date: 2020-06-08
 * @author: yuyu.chang@hand-china.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Table, Modal, Button, CodeArea } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { statusRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
// 引入格式化器
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import { queueTagDataDS } from './stores/queueTagDataDS';
// 引入 json lint
import 'choerodon-ui/pro/lib/code-area/lint/json';

const { Column } = Table;
// json格式化
const jsonStyle = { height: 500 };
const options = { mode: { name: 'javascript', json: true } };

// 模态框
const keyContext = Modal.key();
let modal;
function closeModal() {
  modal.close();
}
function openModal(record, index) {
  modal = Modal.open({
    key: keyContext,
    title: record.dataSet.getField(index).get('label'),
    children: (
      <CodeArea
        dataSet={record.dataSet}
        name={index}
        style={jsonStyle}
        formatter={JSONFormatter}
        options={options}
      />
    ),
    style: {
      top: 10,
      width: 1000,
    },
    footer: (
      <Button onClick={closeModal}>{intl.get('hzero.common.model.button.close').d('关闭')}</Button>
    ),
  });
}

// 状态渲染
function statusRenders(field) {
  return statusRender(
    field.value === 1 ? 'SUCCESS' : field.value === -1 ? 'FAILED' : 'UNEXECUTE',
    field.text
  );
}

@formatterCollections({ code: ['smbl.queueData', 'smbl.commmon', 'smbl.queue'] })
export default class QueueTagData extends Component {
  tableDs = new DataSet(queueTagDataDS());

  // 数据操作栏
  cntCommands = ({ record }) => {
    const btns = [];
    btns.push(
      <a onClick={() => openModal(record, 'context')}>
        {intl.get('smbl.queueData.model.QueueData.context').d('内容')}
      </a>
    );
    return [<span className="action-link">{btns}</span>];
  };

  // 执行信息操作栏
  msgCommands = ({ record }) => {
    const btns = [];
    btns.push(
      <a onClick={() => openModal(record, 'message')}>
        {intl.get('smbl.common.view.button.view').d('查看')}
      </a>
    );
    return [<span className="action-link">{btns}</span>];
  };

  render() {
    return (
      <>
        <Header title={intl.get('smbl.queueData.view.queueDataQuery').d('队列数据查询')} />
        <Content name="talbe">
          <Table
            dataSet={this.tableDs}
            queryFieldsLimit={3}
            data={[]}
            selectionMode="none"
            autoMaxWidth
          >
            <Column name="sourceKey" width={200} minWidth={150} />
            <Column name="topicCode" width={200} minWidth={150} />
            <Column name="tagCode" width={200} minWidth={150} />
            <Column name="tagName" width={200} />
            <Column name="status" width={100} renderer={statusRenders} />
            <Column name="message" width={200} command={this.msgCommands} />
            <Column name="context" width={200} command={this.cntCommands} />
            <Column name="creationDate" width={200} />
            <Column name="lastUpdateDate" width={200} />
          </Table>
        </Content>
      </>
    );
  }
}
