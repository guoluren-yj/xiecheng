/*
 * @Description:
 * @Date: 2020-07-06 10:28:34
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import PropTypes from 'prop-types';
import qs from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';
import Search from './Search';
import ListTable from './ListTable';

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sodr.receivedOrder',
    'entity.company',
    'entity.customer',
    'entity.business',
    'entity.order',
    'entity.item',
    'entity.roles',
  ],
})
@withRouter
export default class DetailSearch extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: (e) => e,
  };

  componentDidUpdate(prevProps) {
    const { custLoading } = this.props;
    const { displayPoNum } = qs.parse(this.props.location.search.substr(1));
    if (!custLoading && prevProps.custLoading !== custLoading) {
      if (displayPoNum) {
        const { setFieldsValue } = this.searchForm.props.form;
        setFieldsValue({ poNum: displayPoNum });
      }
      this.handleSearch();
    }
  }

  /**
   * 查询
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields, flag = 1, params = {}, isChangePage) {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch(fields, flag, params, isChangePage);
    }
  }

  render() {
    const {
      form,
      handleReset,
      dataSource,
      loading,
      tenantId,
      dispatch,
      pagination,
      rowSelection,
      enumMap = {},
      onJumpDetail,
      handleOperating,
      updateSupplierNumFlag,
      customizeFilterForm,
      customizeTable,
      handleToAsnNums,
    } = this.props;
    const filterProps = {
      form,
      enumMap,
      tenantId,
      handleReset,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.searchForm = node;
      },
      customizeFilterForm,
    };
    const listProps = {
      updateSupplierNumFlag,
      onJumpDetail,
      dispatch,
      loading,
      dataSource,
      pagination,
      rowSelection,
      handleOperating,
      rowKey: 'planId',
      onSearch: this.handleSearch,
      customizeTable,
      handleToAsnNums,
    };
    return (
      <React.Fragment>
        <Search {...filterProps} />
        <ListTable {...listProps} />
      </React.Fragment>
    );
  }
}
