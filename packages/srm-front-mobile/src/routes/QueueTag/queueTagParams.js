/**
 * index.js -队列标签配置
 * @date: 2021-06-24
 * @author: longhui.zou@going-link.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import {
  DataSet,
  Table,
  Button,
  Modal,
  Form,
  TextField,
  Switch,
  TextArea,
  Select,
} from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import { Tag } from 'choerodon-ui';
import { queueTagParamsDS } from './stores/queueTagParamsDS';
import './index.less';

const { Column } = Table;

@formatterCollections({ code: ['smbl.common', 'smbl.queue'] })
export default class ThirdPartyParam extends Component {
  tableDs = new DataSet(queueTagParamsDS());

  // 打开侧滑框
  openModal = (record) => {
    console.info('sfdsf', record);
    Modal.open({
      drawer: true,
      title: intl.get('smbl.common.title.tagParamsfoDefine').d('标签信息配置'),
      children: (
        <Form dataSet={this.tableDs} id="formOne" useColon>
          <TextField name="tagCode" disabled={record.data.tagCode} clearButton />
          <TextField name="tagName" clearButton />
          <TextField name="method" width={200} />
          <Switch name="enableFlag" />
          <Select name="syncFlag" clearButton={false} />
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

  // 渲染栏
  // 行操作栏
  operationActionCommands = ({ record }) => {
    const btns = [];
    btns.push(
      <a onClick={() => this.handleEdit(record)}>{intl.get('hzero.common.edit').d('编辑')}</a>
    );
    return [<span className="action-link">{btns}</span>];
  };

  // 修改
  handleEdit = (record) => {
    this.openModal(record);
  };

  // 提交
  handleSubmit = async () => {
    try {
      await this.tableDs.submit();
    } catch (e) {
      this.tableDs.reset();
    }
  };

  // 取消
  handleCancel = (record) => {
    if (record.status === 'add') {
      this.tableDs.remove(record);
    } else {
      record.reset();
    }
  };

  // 生命周期函数，第一个执行
  componentDidMount() {
    this.tableDs.setQueryParameter('topicId', this.props.match.params.topicId);
    this.tableDs.query();
  }

  // 新增
  handleAdd = () => {
    const record = this.tableDs.create(
      { topicId: this.props.match.params.topicId, enableFlag: 1 },
      0
    );
    this.openModal(record);
  };

  // 表格操作项
  tableButtons = [
    <Button icon="playlist_add" onClick={this.handleAdd} key="add">
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
    'query',
  ];

  render() {
    return (
      <>
        <Header
          backPath="/smbl/queue/definition"
          title={intl.get('smbl.common.title.tagParamsfoDefine').d('标签信息配置')}
        />
        <Content>
          <Table
            dataSet={this.tableDs}
            queryFieldsLimit={4}
            data={[]}
            buttons={this.tableButtons}
            autoMaxWidth
          >
            <Column name="tagCode" width={200} />
            <Column name="tagName" width={200} />
            <Column name="method" width={200} />
            <Column
              name="enableFlag"
              width={100}
              renderer={(val) => {
                return enableRender(val.value);
              }}
            />
            {/* <Column name="syncFlag" editor={record => record.getState('editing')} width={100} /> */}
            <Column
              name="syncFlag"
              align="center"
              width={150}
              renderer={({ value }) => {
                // eslint-disable-next-line prefer-destructuring
                const flag = value === 1;
                const desc = flag
                  ? intl.get('hzero.common.status.sync').d('同步')
                  : intl.get('hzero.common.status.async').d('异步');
                let color = 'green';
                switch (flag) {
                  case true:
                    color = 'green';
                    break;
                  case false:
                    color = 'orange';
                    break;
                  default:
                    color = 'green';
                    break;
                }
                return (
                  <Tag className="skill-tag-frameless" color={color}>
                    {desc}
                  </Tag>
                );
              }}
            />
            <Column name="operationAction" width={150} command={this.operationActionCommands} />
            <Column name="remark" width={200} />
          </Table>
        </Content>
      </>
    );
  }
}
