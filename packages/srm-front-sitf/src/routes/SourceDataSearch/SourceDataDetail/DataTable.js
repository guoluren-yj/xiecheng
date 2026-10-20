/**
 * DataTable - 表格组件
 * @date: 2018-10-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import { createPagination } from 'utils/utils';

/**
 * 表格组件
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class DataTable extends PureComponent {
  /**
   * 查询数据
   * @param {object} pageData 页面信息数据
   */
  @Bind()
  fetchData(pageData = {}) {
    const { queryData, url, tableName } = this.props;
    if (queryData) {
      queryData(pageData, url, tableName);
    }
  }

  /**
   * 分页change事件
   * @param {object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchData(pagination);
  }

  /**
   * 渲染方法
   */
  render() {
    const { loading, dataSource = {}, columns = [], rowKey, scroll } = this.props;
    const { content = [] } = dataSource;
    return (
      <React.Fragment>
        <Content style={{ marginTop: '-8px' }}>
          <Table
            bordered
            scroll={{ x: scroll }}
            loading={loading}
            rowKey={rowKey || ''}
            dataSource={content}
            columns={columns}
            pagination={createPagination(dataSource)}
            onChange={this.handleStandardTableChange}
          />
        </Content>
      </React.Fragment>
    );
  }
}
