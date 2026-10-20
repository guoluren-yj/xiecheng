/**
 * index.js -三方平台
 * @date: 2020-06-08
 * @author: yuyu.chang@hand-china.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import {
  Button,
  CodeArea,
  DataSet,
  Form,
  IntlField,
  Modal,
  Switch,
  Table,
  TextArea,
  TextField,
  UrlField,
} from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
import 'choerodon-ui/pro/lib/code-area/lint/javascript';
import formatterCollections from 'utils/intl/formatterCollections';
import ParamPageOpen from '@/components/ParamPage/ParamPageOpen';
import { thirdPartyDS } from './stores/thirdPartyDS';
import { thirdPartyParamDS } from './stores/thirdPartyParamDS';

// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
if (typeof window !== 'undefined') {
  // 提供对应语言的语法高亮
  require('codemirror/mode/javascript/javascript');
}

const { Column } = Table;

const options = { mode: 'javascript' };
const jsStyle = { height: 500 };

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
        style={jsStyle}
        formatter={JSFormatter}
        options={options}
      />
    ),
    style: {
      top: 10,
      width: 1000,
    },
    footer: (
      <Button onClick={closeModal}>{intl.get('hzero.common.button.confirm').d('确认')}</Button>
    ),
  });
}

@formatterCollections({ code: ['smbl.thirdParty', 'smbl.common'] })
export default class ThirdParty extends Component {
  // 字段不可编辑标识
  fieldEditFlag = true;

  tableDs = new DataSet(thirdPartyDS());

  // 提交
  handleSubmit = async () => {
    try {
      await this.tableDs.submit();
    } catch (e) {
      this.tableDs.reset();
    }
  };

  openParam = (record) => {
    const thirdPartyId = record.get('thirdPartyId');
    ParamPageOpen.open({
      fieldCode: 'thirdPartyId',
      fieldValue: thirdPartyId,
      dataSet: new DataSet(thirdPartyParamDS()),
    });
  };

  // handleParam(record) {
  //   const { history } = this.props;
  //   const thirdPartyId = record.get('thirdPartyId');
  //   history.push(`/smbl/thirdplatform/def/param/${thirdPartyId}`);
  // }

  // 行操作栏
  operationActionCommands = ({ record }) => {
    const btns = [];
    btns.push(
      <a onClick={() => this.handleEdit(record)}>{intl.get('hzero.common.edit').d('编辑')}</a>,
      <a onClick={() => this.openParam(record)}>
        {intl.get('smbl.common.model.paramDef').d('参数定义')}
      </a>
    );
    return [<span className="action-link">{btns}</span>];
  };

  // 打开侧滑框
  openModal = (record) => {
    Modal.open({
      drawer: true,
      title: intl.get('srm.thirdParty.view.thirdPartyDef').d('三方平台定义'),
      children: (
        <Form dataSet={this.tableDs} id="formOne" useColon>
          <TextField
            name="thirdPartyCode"
            disabled={this.fieldEditFlag}
            clearButton={!this.fieldEditFlag}
            restrict="A-Za-z0-9_"
          />
          <IntlField name="thirdPartyDesc" clearButton />
          <UrlField name="sendMessageUrl" addonBefore="Http://" clearButton />
          <UrlField name="getTokenUrl" addonBefore="Http://" clearButton />
          <TextField name="executeCode" onClick={() => openModal(record, 'executeCode')} />
          <TextArea name="remark" />
          <Switch name="enableFlag" />
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

  // 执行信息操作栏
  msgCommands = ({ record }) => {
    const btns = [];
    btns.push(
      <a onClick={() => openModal(record, 'executeCode')}>
        {intl.get('smbl.thirdParty.model.ThirdParty.executeCode').d('执行代码')}
      </a>
    );
    return [<span className="action-link">{btns}</span>];
  };

  render() {
    return (
      <>
        <Header title={intl.get('smbl.thirdParty.view.thirdPartyDef').d('三方平台定义')} />
        <Content>
          <Table
            dataSet={this.tableDs}
            queryFieldsLimit={4}
            data={[]}
            buttons={this.tableButtons}
            autoMaxWidth
          >
            <Column name="thirdPartyCode" width={200} />
            <Column name="thirdPartyDesc" width={200} />
            <Column
              name="enableFlag"
              width={100}
              defaultChecked
              renderer={({ value }) => enableRender(value)}
            />
            <Column name="executeCode" width={200} command={this.msgCommands} />
            <Column name="operationAction" width={150} command={this.operationActionCommands} />
            <Column name="remark" />
          </Table>
        </Content>
      </>
    );
  }
}
