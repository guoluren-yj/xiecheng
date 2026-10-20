import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';

import Search from './Search';
import List from './List';
@Form.create({ fieldNameProp: null })
export default class Order extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询创建计划单
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields) {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch(fields);
    }
  }

  /**
   * 跳转详情
   * @param {Number} poHeaderId
   */
  @Bind()
  redirectToDetail(poHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/plan-sheet/detail/${poHeaderId}`,
      })
    );
  }

  render() {
    const {
      form,
      enumMap,
      loading,
      dataSource,
      pagination,
      rowSelection,
      handleReset,
    } = this.props;
    const filterProps = {
      form,
      handleReset,
      enumMap,
      onSearch: this.handleSearch,
      onRef: node => {
        this.searchForm = node;
      },
    };
    const listProps = {
      loading,
      dataSource,
      pagination,
      rowSelection,
      onSearch: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Search {...filterProps} />
        <List {...listProps} />
      </React.Fragment>
    );
  }
}
