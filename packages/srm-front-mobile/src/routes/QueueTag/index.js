/**
 * index.js -队列定义
 * @date: 2020-06-08
 * @author: yuyu.chang@hand-china.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Table, Button, Modal, Form, Switch, TextField, TextArea } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import { queueTopicDS } from './stores/queueTopicDS';

const { Column } = Table;

@formatterCollections({ code: ['smbl.queue', 'smbl.common'] })
export default class QueueTagDefinition extends Component {
  tableDs = new DataSet(queueTopicDS());

  // 打开侧滑框
  openModal = (record) => {
    Modal.open({
      drawer: true,
      title: intl.get('smbl.queue.view.queueDef').d('队列定义'),
      children: (
        <Form dataSet={this.tableDs} id="formOne" useColon>
          <TextField name="topicCode" disabled={record.data.topicCode} clearButton />
          <TextField name="topicName" clearButton />
          <Switch name="enableFlag" />
          <TextArea name="remark" autoSize={{ minRows: 2, maxRows: 6 }} clearButton />
        </Form>
      ),
      onOk: () => {
        return this.handleSubmit(record);
      },
      afterClose: () => {
        this.handleCancel(record);
      },
    });
  };

  // 新增
  handleAdd = () => {
    const record = this.tableDs.create({ enableFlag: 1 }, 0);
    this.openModal(record);
  };

  // 编辑
  handleEdit = (record) => {
    // record.set('tenant', record.get('tenantName'));
    this.openModal(record);
  };

  // 取消
  handleCancel = (record) => {
    if (record.status === 'add') {
      this.tableDs.remove(record);
    } else {
      record.reset();
    }
  };

  // 提交
  handleSubmit = async (record) => {
    const flag = await record.validate();
    if (flag) {
      try {
        await this.tableDs.submit();
      } catch (e) {
        this.tableDs.reset();
      }
    }
    return flag;
  };

  handleTagParam(record) {
    const { history } = this.props;
    const topicId = record.get('topicId');
    history.push(`/smbl/queue/definition/queueTagParams/${topicId}`);
  }

  // 行操作栏
  operationActionCommands = ({ record }) => {
    const btns = [];
    btns.push(
      <a onClick={() => this.handleEdit(record)}>{intl.get('hzero.common.edit').d('编辑')}</a>,
      <a onClick={() => this.handleTagParam(record)}>
        {intl.get('smbl.common.title.tagParamsfoDefine').d('标签信息配置')}
      </a>
    );
    return [<span className="action-link">{btns}</span>];
  };

  // 表格操作项
  tableButtons = [
    <Button icon="playlist_add" onClick={this.handleAdd} key="add">
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
  ];

  render() {
    return (
      <>
        <Header title={intl.get('smbl.queue.view.queueDef').d('队列定义')} />
        <Content>
          <Table
            dataSet={this.tableDs}
            queryFieldsLimit={4}
            data={[]}
            buttons={this.tableButtons}
            autoMaxWidth
          >
            <Column name="topicCode" width={200} />
            <Column name="topicName" width={200} />
            <Column
              name="enableFlag"
              renderer={(val) => {
                return enableRender(val.value);
              }}
              width={100}
            />
            <Column name="operationAction" width={250} command={this.operationActionCommands} />
            <Column name="remark" />
          </Table>
        </Content>
      </>
    );
  }
}
