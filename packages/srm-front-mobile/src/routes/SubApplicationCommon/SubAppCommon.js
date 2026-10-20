/**
 * index.js -常用子应用
 * @date: 2020-09-06
 * @author: yuyu.chang@hand-china.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { observer } from "mobx-react";
import { Button, DataSet, Form, Modal, Table, NumberField, Lov } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import 'choerodon-ui/pro/lib/code-area/lint/javascript';
import { message } from 'choerodon-ui';
import { subApplicationCommon } from './stores/subApplicationCommon';

const { Column } = Table;

@observer
export default class SubApplicationCommon extends Component {
  tableDs = new DataSet(subApplicationCommon());

  // 生命周期函数，第一个执行
  componentDidMount() {
    if (this.checkRole()) {
      this.tableDs.setQueryParameter('roleId', this.props.id);
      this.tableDs.query();
    }
  }

  // 检验角色传参是否异常，解决prod-bug-24020
  checkRole = () => {
    if (this.props.id === 'undefined') {
      message.config({
        placement: 'bottomRight',
        duration: 2,
      });
      message.error(
        intl.get('smbl.subAppCommon.view.roleId.undefined').d('角色异常，无法执行数据')
      );
      return false;
    }
    return true;
  };

  // 提交
  handleSubmit = async () => {
    if (!this.checkRole()) {
      return false;
    }
    let result;
    await this.tableDs.submit().then((res) => {
      result = res;
      if (res) this.props.needRefresh();
    });
    return !!result;
  };

  // 行操作栏
  operationActionCommands = ({ record }) => {
    const btns = [];
    btns.push(
      <a onClick={() => this.handleEdit(record)}>{intl.get('hzero.common.edit').d('编辑')}</a>
    );
    return [<span className="action-link">{btns}</span>];
  };

  // 打开侧滑框
  openModal = (record) => {
    Modal.open({
      drawer: true,
      title: intl.get('smbl.subAppCommon.view.title').d('常用子应用管理'),
      children: (
        <Form dataSet={this.tableDs} id="formOne" labelLayout="float">
          <Lov name="role" disabled />
          <Lov name="subApp" />
          <NumberField min={1} step={1} name="sequence" />
        </Form>
      ),
      okText: intl.get('hzero.common.button.save').d('保存'),
      onOk: this.handleSubmit,
      afterClose: () => {
        this.handleCancel(record);
      },
    });
  };

  // 新增
  handleAdd = () => {
    const record = this.tableDs.create(
      {
        level: 'ROLE',
        roleId: this.props.id,
        roleName: this.props.name,
      },
      0
    );
    this.openModal(record);
  };

  // 编辑
  handleEdit = (record) => {
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

  render() {
    return (
      <Table
        dataSet={this.tableDs}
        buttons={[
          <Button icon="playlist_add" onClick={this.handleAdd} key="add">
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>,
          <Button
            icon="remove_circle"
            disabled={!this.tableDs.selected.length}
            onClick={() => {
              return this.tableDs.delete(this.tableDs.selected, {
                title: intl.get("hzero.common.message.confirm").d("提示"),
                children: intl.get("hzero.c7nProUI.DataSet.delete_selected_row_confirm").d("确认删除选中行？"),
                onOK: () => {
                  this.props.needRefresh();
                },
              });
            }}
          >
            {intl.get("hzero.common.button.batchdelete")}
          </Button>,
        ]}
        autoMaxWidth
      >
        <Column name="subAppName" />
        <Column name="sequence" command={this.msgCommands} />
      </Table>
    );
  }
}
