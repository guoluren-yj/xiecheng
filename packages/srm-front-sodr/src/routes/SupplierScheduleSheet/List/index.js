import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';

import Search from './Search';
import List from './List';
import OperationRecord from '@/routes/components/NewPlantOperationRecord/OperationRecord';
@Form.create({ fieldNameProp: null })
export default class Order extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      operatingVisible: false, // 操作记录模态框
      planId: null, // 计划单主键id
    };
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: (e) => e,
  };

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询创建计划单
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields, flag = 1, isChangePage) {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch(fields, flag, isChangePage);
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
      handleTranslate,
      handleOperating,
      dispatch,
      handleToAsnNums,
    } = this.props;
    const { operatingVisible, planId } = this.state;
    const filterProps = {
      form,
      handleReset,
      enumMap,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.searchForm = node;
      },
    };
    const listProps = {
      form,
      loading,
      dataSource,
      pagination,
      rowSelection,
      handleTranslate,
      handleOperating,
      handleToAsnNums,
      onSearch: this.handleSearch,
    };

    const operationRecordProps = {
      dispatch,
      id: planId,
      visible: operatingVisible,
      hideModal: handleOperating,
    };
    return (
      <React.Fragment>
        <Search {...filterProps} />
        <List {...listProps} />
        {operatingVisible && <OperationRecord {...operationRecordProps} />}
      </React.Fragment>
    );
  }
}
