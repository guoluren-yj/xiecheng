/**
 * InterfaceListDetail - 接口查询 - 接口表 - 表格组件
 * @date: 2018-9-18
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { Content } from 'components/Page';
import { createPagination, filterNullValueObject } from 'utils/utils';
import QueryForm from './QueryForm';

/**
 * 接口查询 - 接口表 - 表格组件
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class DataTable extends PureComponent {
  Form;

  /**
   *查询数据
   *
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchData(pageData = {}) {
    const { queryData, childLevelPath, patentParams = {} } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    if (queryData) {
      queryData(
        {
          page: isEmpty(pageData) ? {} : pageData,
          ...filterValues,
        },
        childLevelPath,
        '',
        patentParams
      );
    }
  }

  /**
   *点击查询按钮事件
   *
   * @param {Object} pageData 查询条件
   */
  @Bind()
  queryValue(queryData = {}) {
    this.fetchData(queryData);
  }

  /**
   *分页change事件
   *
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchData(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   *渲染方法
   */
  render() {
    const {
      loading,
      dataSource = {},
      columns = [],
      orderQuery,
      rowKey,
      scroll,
      codes = [],
      configData = {},
      fetchId,
    } = this.props;
    const { content = [] } = dataSource;
    return (
      <React.Fragment>
        <Content>
          {orderQuery && (
            <QueryForm
              codes={codes}
              fetchId={fetchId}
              queryValue={this.queryValue}
              configData={configData}
              onRef={this.handleBindRef}
            />
          )}
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
