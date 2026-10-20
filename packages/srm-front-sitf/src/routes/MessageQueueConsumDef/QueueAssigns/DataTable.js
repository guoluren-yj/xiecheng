/**
 * DataTable  - 消息队列消费组定义页面 - 待分配数据
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
export default class DataTable extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectedRows: [],
    };
  }

  /**
   * 查询待分配队列数据
   * @param {Object} params 查询参数
   * @memberof DataTable
   */
  @Bind()
  fetchQueueData(params = {}) {
    const { form, onQueryUnassignDate } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onQueryUnassignDate({
          ...params,
          ...values.option,
        });
      }
    });
  }
  /**
   * 勾选框
   * @param {null} _ 占位符
   * @param {object} rows 行数据
   * @memberof DataTable
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
          <Button type="primary" onClick={() => this.fetchQueueData()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const {
      unassignQueueList = {},
      unAssignPagination = {},
      dataColumns = [],
      unAssignloading,
    } = this.props;
    const { selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.queueId),
      onChange: this.handleSelectRows,
    };
    return (
      <Row>
        <div className="assign-table-title">
          {intl
            .get('sitf.messageQueueConsumDef.view.messageQueueConsumDef.queueDataTitle')
            .d('队列定义未分配数据')}
        </div>
        <div className="table-list-search">{this.renderForm()}</div>
        <Table
          bordered
          loading={unAssignloading}
          rowKey="queueId"
          dataSource={unassignQueueList.content || []}
          columns={dataColumns}
          rowSelection={rowSelection}
          pagination={unAssignPagination}
          onChange={page => this.fetchQueueData(page)}
        />
      </Row>
    );
  }
}
