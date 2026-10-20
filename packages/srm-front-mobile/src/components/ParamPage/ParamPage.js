/**
 * index.js -队列定义
 * @date: 2020-06-08
 * @author: yuyu.chang@hand-china.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { Content } from 'components/Page';
import intl from 'utils/intl';

const { Column } = Table;

export default class RobotExtPlatParam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldCode: props.fieldCode,
      fieldValue: props.fieldValue,
      tableDs: props.dataSet,
    };
  }

  // 生命周期函数，第一个执行
  componentDidMount() {
    this.state.tableDs.setQueryParameter(this.state.fieldCode, this.state.fieldValue);
    this.state.tableDs.query();
  }

  // 新增
  handleAdd = () => {
    const data = {};
    data[this.state.fieldCode] = this.state.fieldValue;
    this.state.tableDs.create(data, 0);
  };

  // 表格操作项
  tableButtons = [
    <Button icon="playlist_add" onClick={this.handleAdd} key="add">
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
    'delete',
    'save',
    'query',
  ];

  render() {
    return (
      <>
        <Content>
          <Table
            dataSet={this.state.tableDs}
            queryFieldsLimit={4}
            data={[]}
            buttons={this.tableButtons}
            autoMaxWidth
          >
            <Column name="paramKey" editor width={200} />
            <Column name="paramValue" editor width={300} />
            <Column name="paramDesc" editor />
          </Table>
        </Content>
      </>
    );
  }
}
