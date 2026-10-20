/**
 * ProductSearch - 产品查询
 * @date: 2018-12-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import CacheComponent from 'components/CacheComponent';
import { filterNullValueObject } from 'utils/utils';
import QueryForm from './QueryForm';

/**
 * 产品使用详情
 * @extends {Component} - React.Component
 * @reactProps {Object} productSearch - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({ code: ['seci.productSearch'] })
@connect(({ productSearch, loading }) => ({
  productSearch,
  fetchLoading: loading.effects['productSearch/fetchProductSearch'],
}))
@withRouter
@CacheComponent({ cacheKey: '/seci/product-search' })
export default class ProductSearch extends PureComponent {
  form;

  componentDidMount() {
    this.fetchProductSearch();
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchProductSearch(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'productSearch/fetchProductSearch',
      payload: {
        page: pageData,
        ...filterValues,
      },
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.fetchProductSearch();
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryProductSearch(queryData = {}) {
    this.fetchProductSearch(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchProductSearch(pagination);
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
   * 渲染方法
   * @returns
   */
  render() {
    const {
      productSearch: { data = [], pagination = {} },
      fetchLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get(`seci.productSearch.model.productSearch.productCode`).d('产品代码'),
        dataIndex: 'productCode',
        width: 150,
      },
      {
        title: intl.get(`seci.productSearch.model.productSearch.productName`).d('产品名称'),
        dataIndex: 'productName',
      },
      {
        title: intl.get(`seci.productSearch.model.productSearch.consumeTimes`).d('使用次数'),
        dataIndex: 'consumeTimes',
        width: 100,
        align: 'right',
      },
    ];

    return (
      <React.Fragment>
        <Header title={intl.get(`seci.productSearch.view.message.title`).d('产品使用明细')} />
        <Content>
          <QueryForm onQueryProductSearch={this.onQueryProductSearch} onRef={this.handleBindRef} />
          <Table
            bordered
            loading={fetchLoading}
            rowKey="productId"
            dataSource={data}
            columns={columns}
            pagination={pagination}
            onChange={this.handleStandardTableChange}
          />
        </Content>
      </React.Fragment>
    );
  }
}
