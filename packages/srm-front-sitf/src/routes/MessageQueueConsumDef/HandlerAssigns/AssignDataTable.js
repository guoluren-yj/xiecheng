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
import formatterCollections from 'utils/intl/formatterCollections';

import OptionInput from 'components/OptionInput';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
@formatterCollections({ code: 'sitf.messageQueueConsumDef' })
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
   * 查询队列处理已分配数据(待条件)
   * @param {object} pageData  查询参数
   */
  @Bind()
  fetchAssignList(pageData = {}) {
    const { form, onQueryAssignDate } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onQueryAssignDate({
          ...fieldsValue.option,
          ...pageData,
        });
      }
    });
  }

  /**
   * 勾选框勾选方法
   * @param {object} rows  勾选数据
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
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.handlerCode')
          .d('队列处理代码'),
        queryName: 'queueHandlerCode',
        inputProps: {
          typeCase: 'upper',
          trim: true,
          inputChinese: false,
        },
      },
      {
        queryLabel: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.handlerName')
          .d('队列处理名称'),
        queryName: 'queueHandlerName',
      },
    ];
    return (
      <Form layout="inline">
        <FormItem>{getFieldDecorator('option')(<OptionInput queryArray={queryArray} />)}</FormItem>
        <FormItem>
          <Button type="primary" onClick={() => this.fetchAssignList()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const {
      assginHandlerList = {},
      assignDataColumns,
      assignloading,
      handlerPagination = {},
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
            .get('sitf.messageQueueConsumDef.view.messageQueueConsumDef.handlerDataTitle')
            .d('队列处理已分配数据')}
        </div>
        <div className="table-list-search">{this.renderForm()}</div>
        <Table
          bordered
          loading={assignloading}
          rowKey="assignId"
          dataSource={assginHandlerList.content || []}
          columns={assignDataColumns}
          rowSelection={rowSelection}
          pagination={handlerPagination}
          onChange={page => this.fetchAssignList(page)}
        />
      </Row>
    );
  }
}
