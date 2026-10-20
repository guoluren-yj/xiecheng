/**
 * 自定义行内编辑，动态渲染行内属性
 * index.js -个性化页面配置
 * @date: 2020-09-13
 * @author: yuyu.chang@hand-china.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { pageCustomizeDS } from './stores/PageCustomizeDS';

const { Column } = Table;

@formatterCollections({ code: ['smbl.pageCustomize', 'smbl.common', 'hzero.common'] })
export default class PageCustomizeDefinition extends Component {
  tableDs = new DataSet(pageCustomizeDS());

  // 修改
  handleEdit = record => {
    record.setState('editing', true);
  };

  // 新增
  handleAdd = () => {
    const record = this.tableDs.create({}, 0);
    record.setState('editing', true);
  };

  // 取消
  handleCancel = record => {
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
        <Header title={intl.get('smbl.pageCustomize.view.pageCustomizeDef').d('个性化界面定义')} />
        <Content>
          <Table
            dataSet={this.tableDs}
            queryFieldsLimit={3}
            buttons={this.tableButtons}
            autoMaxWidth
          >
            <Column
              name="standardPagePath"
              editor={record => record.getState('editing')}
              width={200}
            />
              <Column
              name="customizePagePath"
              editor={record => record.getState('editing')}
              width={200}
            />
            <Column
              name="tenant"
              editor={record => record.getState('editing')}
              width={200}
            />
            <Column
              name="application"
              editor={record => record.getState('editing')}
              width={200}
            />
             <Column
              name="description"
              editor={record => record.getState('editing')}
              width={200}
            />
            <Column name="enableFlag" editor={record => record.getState('editing')} width={100} />
            <Column
              name="operationAction"
              align="center"
              width={150}
              renderer={this.operationActionCommands}
            />
          </Table>
        </Content>
      </>
    );
  }
}