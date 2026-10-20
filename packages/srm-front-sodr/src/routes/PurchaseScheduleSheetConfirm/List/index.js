import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';

import Search from './Search';
import ListTable from './ListTable';

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sinv.common',
    'ssrc.inquiryHall',
    'sodr.common',
    'sodr.orderMaintain',
    'sodr.receivedOrder',
    'entity.company',
    'entity.customer',
    'entity.business',
    'entity.order',
    'entity.organization',
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

  componentDidMount() {
    const { displayPoNum } = qs.parse(this.props.location.search.substr(1));
    if (displayPoNum) {
      const { setFieldsValue } = this.searchForm.props.form;
      setFieldsValue({ poNum: displayPoNum });
    }
    this.handleSearch();
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
      handleToAsnNums,
      onSearch: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Search {...filterProps} />
        <ListTable {...listProps} />
      </React.Fragment>
    );
  }
}
