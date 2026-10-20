/**
 * index.js -APP版本管理
 * @date: 2021-04-20
 * @author: longhui.zou@going-link.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import {
  Button,
  DataSet,
  Form,
  Select,
  Modal,
  Switch,
  Table,
  TextField,
  TextArea,
} from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import 'choerodon-ui/pro/lib/code-area/lint/javascript';
import formatterCollections from 'utils/intl/formatterCollections';
import { appVersionDS } from './stores/appVersionDS';

// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
if (typeof window !== 'undefined') {
  // 提供对应语言的语法高亮
  require('codemirror/mode/javascript/javascript');
}

const { Column } = Table;

@formatterCollections({ code: ['smbl.appVersion'] })
export default class ThirdParty extends Component {
  // 字段不可编辑标识
  fieldEditFlag = true;

  tableDs = new DataSet(appVersionDS());

  // 提交
  handleSubmit = async () => {
    try {
      await this.tableDs.submit();
    } catch (e) {
      this.tableDs.reset();
    }
  };

  handleParam(record) {
    const { history } = this.props;
    const appVersionId = record.get('appVersionId');
    history.push(`/smbl/appVersion/def/param/${appVersionId}`);
  }

  // 行操作栏
  operationActionCommands = ({ record }) => {
    const btns = [];
    btns.push(
      <a onClick={() => this.handleEdit(record)}>{intl.get('hzero.common.edit').d('编辑')}</a>,
      <a onClick={() => this.handleParam(record)}>
        {intl.get('smbl.appVersion.model.AppVersionSet').d('版本设置')}
      </a>
    );
    return [<span className="action-link">{btns}</span>];
  };

  // 打开侧滑框
  openModal = (record) => {
    Modal.open({
      drawer: true,
      title: intl.get('smbl.appVersion.view.AppVersion.AppVersionControl').d('APP版本控制'),
      children: (
        <Form dataSet={this.tableDs} id="formOne" useColon>
          <TextField name="appCode" disabled={this.fieldEditFlag} clearButton />
          <TextField name="appName" clearButton />
          <Select name="platform" />
          <Switch name="enableFlag" />
          <TextArea name="releaseInfo" />
        </Form>
      ),
      onOk: this.handleSubmit,
      afterClose: () => {
        this.handleCancel(record);
      },
    });
  };

  // 新增
  handleAdd = () => {
    const record = this.tableDs.create({ enableFlag: 1 }, 0);
    this.fieldEditFlag = false;
    this.openModal(record);
  };

  // 编辑
  handleEdit = (record) => {
    this.fieldEditFlag = true;
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

  // 表格操作项
  tableButtons = [
    <Button icon="playlist_add" onClick={this.handleAdd} key="add">
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
  ];

  render() {
    return (
      <>
        <Header
          title={intl.get('smbl.appVersion.view.AppVersion.AppVersionControl').d('APP版本控制')}
        />
        <Content>
          <Table
            dataSet={this.tableDs}
            queryFieldsLimit={4}
            data={[]}
            buttons={this.tableButtons}
            autoMaxWidth
          >
            <Column name="appCode" width={200} />
            <Column name="appName" width={200} />
            <Column
              name="enableFlag"
              width={100}
              defaultChecked
              renderer={({ value }) => enableRender(value)}
            />
            <Column name="platform" width={100} />
            <Column name="operationAction" width={150} command={this.operationActionCommands} />
          </Table>
        </Content>
      </>
    );
  }
}
