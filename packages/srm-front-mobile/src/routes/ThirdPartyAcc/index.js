/**
 * index.js -三方平台账号
 * @date: 2020-06-08
 * @author: yuyu.chang@hand-china.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import {
  Button,
  DataSet,
  Form,
  IntlField,
  Lov,
  Modal,
  Password,
  Switch,
  Table,
  TextArea,
  TextField,
  CodeArea,
  Select,
} from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
import formatterCollections from 'utils/intl/formatterCollections';
import { isTenantRoleLevel, getCurrentUser, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Modal as ModalPro } from 'choerodon-ui/pro/lib';
import ParamPageOpen from '@/components/ParamPage/ParamPageOpen';
import { clearQuota } from '@/services/thirdPartyAccService';
import { thirdPartyAccDS } from './stores/thirdPartyAccDS';
import { thirdPartyAccParamDS } from './stores/thirdPartyAccParamDS';

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

@formatterCollections({ code: ['smbl.thirdPartyAcc', 'smbl.common'] })
@observer
export default class ThirdParty extends Component {
  tableDs = new DataSet(thirdPartyAccDS());

  // 字段不可编辑标识
  fieldEditFlag = true;

  // 提交
  handleSubmit = async record => {
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

  openParam(record) {
    const thirdPartyAccountId = record.get('thirdPartyAccountId');
    ParamPageOpen.open({
      fieldCode: 'thirdPartyAccountId',
      fieldValue: thirdPartyAccountId,
      dataSet: new DataSet(thirdPartyAccParamDS()),
    });
  }

  // handleParam(record) {
  //   const { history } = this.props;
  //   const thirdPartyAccountId = record.get('thirdPartyAccountId');
  //   history.push(`/smbl/thirdplatform/account/def/param/${thirdPartyAccountId}`);
  // }

  // 打开侧滑框
  openHomeUrl({ data }) {
    ModalPro.open({
      title: intl.get('smbl.thirdPartyAcc.model.homeUrl').d('首页链接'),
      children: (
        <div>
          <p>{data.homeUrl}</p>
        </div>
      ),
    });
  }

  reset = async record => {
    record.setState('loading', true);
    const res = await clearQuota({ thirdPartyAccountId: record.get('thirdPartyAccountId') });
    record.setState('loading', false);
    if (getResponse(res)) {
      notification.success();
    }
  };

  // 行操作栏
  operationActionCommands = ({ record }) => {
    const btns = [];
    btns.push(
      <Button funcType="link" onClick={() => this.handleEdit(record)}>
        {intl.get('hzero.common.edit').d('编辑')}
      </Button>,
      <Button funcType="link" onClick={() => this.openParam(record)}>
        {intl.get('smbl.common.model.paramDef').d('参数定义')}
      </Button>
    );
    if (record.data && record.data.homeUrl) {
      btns.push(
        <Button funcType="link" onClick={() => this.openHomeUrl(record)}>
          {intl.get('smbl.thirdPartyAcc.model.homeUrl').d('首页链接')}
        </Button>
      );
    }
    if (!isTenantRoleLevel() && getCurrentUser().loginName === 'admin') {
      btns.push(
        <Popconfirm
          title={intl.get('smbl.thirdPartyAcc.model.confirmReset').d('确定重置吗？')}
          onConfirm={() => this.reset(record)}
        >
          <Button funcType="link" loading={record.getState('loading')}>
            {intl.get('smbl.thirdPartyAcc.model.reset').d('重置请求次数')}
          </Button>
        </Popconfirm>
      );
    }
    return [<span className="action-link">{btns}</span>];
  };

  // 打开侧滑框
  openModal = record => {
    Modal.open({
      drawer: true,
      title: intl.get('smbl.thirdPartyAcc.view.thirdPartyAccDef').d('三方运营账号维护'),
      children: (
        <Form dataSet={this.tableDs} id="formOne" useColon>
          <TextField name="srmAccount" disabled={this.fieldEditFlag} clearButton />
          <Lov name="tenant" />
          <Lov name="thirdParty" />
          <Lov name="application" />
          <TextField name="thirdPartyAccount" clearButton />
          <Password name="thirdPartySecret" clearButton />
          <Select name="integrateMethod" />
          <IntlField name="thirdPartyAccountDesc" clearButton />
          <Switch name="siteFlag" />
          <Switch name="autoBindFlag" />
          <TextArea name="remark" />
          <Switch name="enableFlag" />
          <Switch name="msgBorbidFlag" />
          <Switch name="todoForbidFlag" />
          <Switch name="thirdPartyExecuteFlag" />
          <TextField
            name="thirdPartyExecuteCode"
            onClick={() => openModal(record, 'thirdPartyExecuteCode')}
          />
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
    this.fieldEditFlag = false;
    this.openModal(record);
  };

  // 编辑
  handleEdit = record => {
    this.fieldEditFlag = true;
    record.set('tenant', record.get('tenantName'));
    record.set('thirdParty', record.get('thirdPartyDesc'));
    this.openModal(record);
  };

  // 取消
  handleCancel = record => {
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
          title={intl.get('smbl.thirdPartyAcc.view.thirdPartyAccDef').d('三方运营账号维护')}
        />
        <Content>
          <Table
            dataSet={this.tableDs}
            queryFieldsLimit={3}
            data={[]}
            buttons={this.tableButtons}
            autoMaxWidth
          >
            <Column name="srmAccount" width={150} />
            <Column name="tenantName" width={200} />
            <Column name="applicationName" width={150} />
            <Column name="thirdPartyDesc" width={200} />
            <Column name="thirdPartyAccount" width={200} />
            <Column name="integrateMethod" width={100} />
            <Column name="thirdPartyAccountDesc" width={200} />
            <Column
              name="enableFlag"
              width={60}
              defaultChecked
              renderer={({ value }) => enableRender(value)}
            />
            <Column
              name="operationAction"
              align="left"
              lock="right"
              width={280}
              renderer={this.operationActionCommands}
            />
          </Table>
        </Content>
      </>
    );
  }
}
