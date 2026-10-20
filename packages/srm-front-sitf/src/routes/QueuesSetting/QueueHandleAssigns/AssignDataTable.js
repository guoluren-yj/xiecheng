/**
 * AssignDataTable - 消息队列定义 - 消息队列处理分配定义 - 已分配数据
 * @date: 2018-9-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Table, Row } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import OptionInput from 'components/OptionInput';
import { createPagination } from 'utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 消息队列处理分配定义 - 已分配数据
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class AssignDataTable extends PureComponent {
  state = {
    selectedRows: [],
    pageCache: {
      page: 0,
      size: 10,
    },
  };

  /**
   * 组件挂载后方法
   */
  componentDidMount() {
    const { getAssignDataTableRef } = this.props;
    if (lodash.isFunction(getAssignDataTableRef)) {
      getAssignDataTableRef(this);
    }
  }

  /**
   * 查询已分配数据
   * @param {object} pageData
   */
  @Bind()
  fetchAssiginData(pageData) {
    const { form, onFetchAssignData } = this.props;
    const { pageCache } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (onFetchAssignData) {
          onFetchAssignData({
            ...fieldsValue.option,
            ...pageCache,
            ...pageData,
          });
        }
      }
    });
  }

  /**
   *按条件查询已分配数据
   */
  @Bind()
  fetchAssignByCondition() {
    const data = {
      page: 0,
    };
    this.setState({
      pageCache: {
        ...this.state.pageCache,
        page: 0,
      },
    });
    this.fetchAssiginData(data);
  }

  /**
   * 获得勾选数据
   * @param {null} _ 占位符
   * @param {Array} rows 当前行数据
   */
  @Bind()
  handleSelectRows(_, rows = []) {
    this.setState({
      selectedRows: rows,
    });
  }

  /**
   * 分页改变事件
   * @param {object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    const params = {
      page: pagination.current - 1, // 服务器接口从 0 开始分页
      size: pagination.pageSize,
    };
    this.setState({
      pageCache: {
        page: pagination.current - 1,
        size: pagination.pageSize,
      },
    });
    this.fetchAssiginData(params);
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const queryArray = [
      {
        queryLabel: intl.get('sitf.common.queueHandler.code').d('队列处理代码'),
        queryName: 'queueHandlerCode',
        inputProps: {
          typeCase: 'upper',
          trim: true,
          inputChinese: false,
        },
      },
      {
        queryLabel: intl.get('sitf.common.queueHandler.name').d('队列处理名称'),
        queryName: 'queueHandlerName',
      },
    ];
    return (
      <Form layout="inline">
        <FormItem>{getFieldDecorator('option')(<OptionInput queryArray={queryArray} />)}</FormItem>
        <FormItem>
          <Button type="primary" onClick={() => this.fetchAssignByCondition()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const { assignData = {}, assignDataColumns, loading } = this.props;
    const { selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.handlerAssignId),
      onChange: this.handleSelectRows,
    };
    return (
      <Row>
        <div className="assign-table-title">
          {intl.get('sitf.queuesSetting.view.message.title.assignData').d('消息队列处理分配数据')}
        </div>
        <div className="table-list-search">{this.renderForm()}</div>
        <Table
          bordered
          loading={loading}
          rowKey="handlerAssignId"
          dataSource={assignData.list}
          columns={assignDataColumns}
          rowSelection={rowSelection}
          pagination={createPagination(assignData)}
          onChange={this.handleStandardTableChange}
        />
      </Row>
    );
  }
}
