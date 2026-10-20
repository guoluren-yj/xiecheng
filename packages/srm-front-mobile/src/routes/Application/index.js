/**
 * 自定义行内编辑，动态渲染行内属性
 * index.js -应用定义
 * @date: 2020-06-08
 * @author: yuyu.chang@hand-china.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { listApplicationDS } from './stores/applicationDS';

const { Column } = Table;

@formatterCollections({ code: ['smbl.application', 'hzero.common'] })
export default class ApplicationDefinition extends Component {
  tableDs = new DataSet(listApplicationDS());

  // 修改
  handleEdit = (record) => {
    record.setState('editing', true);
  };

  // 新增
  handleAdd = () => {
    const record = this.tableDs.create({}, 0);
    record.setState('editing', true);
  };

  // 取消
  handleCancel = (record) => {
    if (record.status === 'add') {
      this.tableDs.remove(record);
    } else {
      record.reset();
      record.setState('editing', false);
    }
  };

  // 提交
  handleSubmit = async () => {
    const res = await this.tableDs.submit();
    // 对应抛出处理
    console.log(res);
  };

  // 渲染栏
  operationActionCommands = ({ record }) => {
    const btns = [];
    if (record.getState('editing')) {
      btns.push(
        <a onClick={this.handleSubmit}>{intl.get('hzero.common.button.confirm').d('确认')}</a>,
        <a onClick={() => this.handleCancel(record)}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </a>
      );
    } else {
      btns.push(
        <a onClick={() => this.handleEdit(record)} disabled={record.status === 'delete'}>
          {intl.get('hzero.common.edit').d('编辑')}
        </a>
      );
    }
    return [<span className="action-link">{btns}</span>];
  };

  // 表格操作项
  tableButtons = [
    <Button icon="playlist_add" onClick={this.handleAdd} key="add">
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
    'save',
    'reset',
  ];

  render() {
    return (
      <>
        <Header title={intl.get('smbl.application.view.applicationDef').d('应用定义')} />
        <Content>
          <Table
            dataSet={this.tableDs}
            queryFieldsLimit={4}
            buttons={this.tableButtons}
            autoMaxWidth
          >
            <Column
              name="applicationCode"
              editor={(record) => record.getState('editing')}
              width={200}
            />
            <Column
              name="applicationName"
              editor={(record) => record.getState('editing')}
              width={200}
            />
            <Column name="enableFlag" editor={(record) => record.getState('editing')} width={200} />
            <Column
              name="operationAction"
              align="center"
              width={150}
              renderer={this.operationActionCommands}
            />
            {/* <Column name="remark" editor={record => record.getState('editing')} width={200} /> */}
          </Table>
        </Content>
      </>
    );
  }
}
