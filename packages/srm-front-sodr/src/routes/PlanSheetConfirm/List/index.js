import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import PropTypes from 'prop-types';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import Search from './Search';
import ListTable from './ListTable';

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sodr.common',
    'sodr.orderApproval',
    'sodr.receivedOrder',
    'entity.company',
    'entity.customer',
    'entity.business',
    'entity.order',
    'entity.organization',
    'entity.item',
    'entity.roles',
    'entity.supplier',
  ],
})
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
    this.handleSearch();
  }

  /**
   * 查询
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields) {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch(fields);
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
      onJumpDetail,
      dispatch,
      loading,
      dataSource,
      pagination,
      rowSelection,
      handleOperating,
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
