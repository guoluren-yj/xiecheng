/**
 * PurchaseFinance - 供应商联系人
 * @date: 2019-01-09
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';

@connect(({ importErp, loading }) => ({
  importErp,
  loading: loading.effects['importErp/querySupplierContact'],
}))
@formatterCollections({ code: 'spfm.importErp' })
export default class SupplierContact extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.handleSearch();
  }

  componentWillUnmount() {
    this.closeSearch();
  }

  /**
   * 供应商联系人查询
   * @param {object} page - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const {
      dispatch,
      modalRecord: { supplierSyncId },
    } = this.props;
    dispatch({
      type: 'importErp/querySupplierContact',
      payload: {
        page,
        supplierSyncId,
      },
    });
  }

  @Bind()
  closeSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'importErp/updateState',
      payload: {
        supplierContactPagination: {},
        supplierContactList: {}, // 缓存的数据要清空
      },
    });
  }

  /**
   * render查询表单
   */
  render() {
    const {
      loading,
      importErp: { supplierContactList = {}, supplierContactPagination = {} },
    } = this.props;
    const columns = [
      {
        title: intl.get(`spfm.importErp.model.importErp.name`).d('姓名'),
        dataIndex: 'name',
        width: 100,
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.mobilephone`).d('电话号码'),
        dataIndex: 'mobilephone',
        width: 100,
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.mail`).d('邮箱'),
        dataIndex: 'mail',
        width: 100,
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.defaultContact`).d('默认联系人'),
        dataIndex: 'defaultFlag',
        width: 100,
        render: yesOrNoRender,
      },
    ];
    return (
      <React.Fragment>
        <div
          style={{
            marginTop: -8,
            paddingBottom: 16,
            marginBottom: 16,
            fontSize: 16,
            color: '#333',
            fontWeight: 500,
            borderBottom: 'solid 1px #e5e5e5',
          }}
        >
          {intl.get(`spfm.importErp.model.importErp.supplierContact`).d('供应商联系人')}
        </div>
        <Table
          loading={loading}
          dataSource={supplierContactList.content}
          pagination={supplierContactPagination}
          rowKey="supplierSyncContactId"
          onChange={this.handleSearch}
          columns={columns}
          bordered
        />
      </React.Fragment>
    );
  }
}
