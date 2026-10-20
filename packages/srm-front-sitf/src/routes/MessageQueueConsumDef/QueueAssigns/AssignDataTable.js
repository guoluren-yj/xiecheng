/**
 * AssignDataTable - 消息队列消费组定义页面  - 已分配数据
 * @date: 2018-9-28
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Table, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import OptionInput from 'components/OptionInput';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class AssignDataTable extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectedRows: [],
    };
  }

  /**
   * 查询队列已分配数据(带条件查询)
   * @param {Object} params 查询条件
   * @memberof AssignDataTable
   */
  @Bind()
  fetchAssignData(params = {}) {
    const { form, onQueryAssignDate } = this.props;
    form.validateFields((err, value) => {
      if (!err) {
        onQueryAssignDate({
          ...params,
          ...value.option,
        });
      }
    });
  }

  /**
   * 勾选框勾选的行
   * @param {Object} rows 当前行
   * @memberof AssignDataTable
   */
  @Bind()
  handleSelectRows(_, rows) {
    this.setState({
      selectedRows: rows,
    });
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const queryArray = [
      {
        queryLabel: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.queueCode')
          .d('队列定义代码'),
        queryName: 'queueCode',
        inputProps: {
          typeCase: 'upper',
          trim: true,
          inputChinese: false,
        },
      },
      {
        queryLabel: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.queueName')
          .d('队列定义名称'),
        queryName: 'queueName',
      },
    ];
    return (
      <Form layout="inline">
        <FormItem>{getFieldDecorator('option')(<OptionInput queryArray={queryArray} />)}</FormItem>
        <FormItem>
          <Button type="primary" onClick={() => this.fetchAssignData()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const {
      assginQueueList = {},
      assignDataColumns,
      assignloading,
      assignPagination = {},
    } = this.props;
    const { selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.assignId),
      onChange: this.handleSelectRows,
    };
    return (
      <Row>
        <div className="assign-table-title">
          {intl
            .get('sitf.messageQueueConsumDef.view.messageQueueConsumDef.queueAssignTitle')
            .d('队列定义已分配数据')}
        </div>
        <div className="table-list-search">{this.renderForm()}</div>
        <Table
          bordered
          loading={assignloading}
          rowKey="assignId"
          dataSource={assginQueueList.content || []}
          columns={assignDataColumns}
          rowSelection={rowSelection}
          pagination={assignPagination}
          onChange={page => this.fetchAssignData(page)}
        />
      </Row>
    );
  }
}
