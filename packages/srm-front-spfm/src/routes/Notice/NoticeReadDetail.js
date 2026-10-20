import React, { Component } from 'react';
import { Modal, Tabs, Table, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

@connect(({ loading, notice }) => ({
  notice,
  fetchReadSupplierLoading: loading.effects['notice/fetchNoticeReadSupplierList'],
  fetchUnReadSupplierLoading: loading.effects['notice/fetchNoticeUnReadSupplierList'],
  fetchReadPurechaseLoading: loading.effects['notice/fetchNoticeReadPurchaseList'],
  fetchUnReadPurechaseLoading: loading.effects['notice/fetchNoticeUnReadPurchaseList'],
  fetchReadUserLoading: loading.effects['notice/fetchNoticeReadUserList'],
  fetchUnReadUserLoading: loading.effects['notice/fetchNoticeUnReadUserList'],
}))
export default class NoticeReadDetail extends Component {
  componentDidMount() {
    this.fetchList();
  }

  @Bind()
  fetchList() {
    const { record: { noticeId, noticeCategoryCode, totalReadCount } = {} } = this.props;
    if (noticeCategoryCode === 'OGYS') {
      this.props.dispatch({
        type: 'notice/fetchNoticeReadSupplierList',
        payload: { noticeId },
      });
      if (totalReadCount) {
        this.props.dispatch({
          type: 'notice/fetchNoticeUnReadSupplierList',
          payload: { noticeId },
        });
      }
    } else if (noticeCategoryCode === 'OBUYER') {
      this.props.dispatch({
        type: 'notice/fetchNoticeReadPurchaseList',
        payload: { noticeId },
      });
      if (totalReadCount) {
        this.props.dispatch({
          type: 'notice/fetchNoticeUnReadPurchaseList',
          payload: { noticeId },
        });
      }
    } else if (noticeCategoryCode === 'OCGF') {
      this.props.dispatch({
        type: 'notice/fetchNoticeReadUserList',
        payload: { noticeId },
      });
      if (totalReadCount) {
        this.props.dispatch({
          type: 'notice/fetchNoticeUnReadUserList',
          payload: { noticeId },
        });
      }
    }else if (noticeCategoryCode === 'OROLES') {
      this.props.dispatch({
        type: 'notice/fetchReadRolesList',
        payload: { noticeId, readFlag: 1 },
      });
      if (totalReadCount) {
        this.props.dispatch({
          type: 'notice/fetchUnReadRolesList',
          payload: { noticeId, readFlag: 0 },
        });
      }
    }
  }

  @Bind()
  handleReadPagination(pagination) {
    const { record: { noticeId, noticeCategoryCode } = {} } = this.props;
    if (noticeCategoryCode === 'OGYS') {
      this.props.dispatch({
        type: 'notice/fetchNoticeReadSupplierList',
        payload: { noticeId, page: pagination },
      });
    } else if (noticeCategoryCode === 'OBUYER') {
      this.props.dispatch({
        type: 'notice/fetchNoticeReadPurchaseList',
        payload: { noticeId, page: pagination },
      });
    } else if (noticeCategoryCode === 'OCGF') {
      this.props.dispatch({
        type: 'notice/fetchNoticeReadUserList',
        payload: { noticeId, page: pagination },
      });
    }
  }

  @Bind()
  handleUnReadPagination(pagination) {
    const { record: { noticeId, noticeCategoryCode } = {} } = this.props;
    if (noticeCategoryCode === 'OGYS') {
      this.props.dispatch({
        type: 'notice/fetchNoticeUnReadSupplierList',
        payload: { noticeId, page: pagination },
      });
    } else if (noticeCategoryCode === 'OBUYER') {
      this.props.dispatch({
        type: 'notice/fetchNoticeUnReadPurchaseList',
        payload: { noticeId, page: pagination },
      });
    } else if (noticeCategoryCode === 'OCGF') {
      this.props.dispatch({
        type: 'notice/fetchNoticeUnReadUserList',
        payload: { noticeId, page: pagination },
      });
    }
  }

  render() {
    const {
      record: { noticeCategoryCode, totalReadCount } = {},
      onClose,
      fetchReadSupplierLoading = false,
      fetchUnReadSupplierLoading = false,
      fetchReadPurechaseLoading = false,
      fetchUnReadPurechaseLoading = false,
      fetchReadUserLoading = false,
      fetchUnReadUserLoading = false,
    } = this.props;
    const {
      notice: {
        noticeReadPurchaseList = [],
        noticeReadPurchasePagination = {},
        noticeUnReadPurchaseList = [],
        noticeUnReadPurchasePagination = {},
        noticeReadSupplierList = [],
        noticeReadSupplierPagination = {},
        noticeUnReadSupplierList = [],
        noticeUnReadSupplierPagination = {},
        noticeReadUserList = [],
        noticeReadUserPagination = {},
        noticeUnReadUserList = [],
        noticeUnReadUserPagination = {},
        readRolesList= [],
        readRolesPagination= {},
        unReadRolesList= [],
        unReadRolesPagination= {},
      } = {},
    } = this.props;
    const isSupplier = noticeCategoryCode === 'OGYS';
    const readListObj = {
      OGYS: noticeReadSupplierList,
      OBUYER: noticeReadPurchaseList,
      OCGF: noticeReadUserList,
      OROLES: readRolesList,
    };
    const readListPaginationObj = {
      OGYS: noticeReadSupplierPagination,
      OBUYER: noticeReadPurchasePagination,
      OCGF: noticeReadUserPagination,
      OROLES: readRolesPagination,
    };
    const unReadListObj = {
      OGYS: noticeUnReadSupplierList,
      OBUYER: noticeUnReadPurchaseList,
      OCGF: noticeUnReadUserList,
      OROLES: unReadRolesList,
    };
    const unReadListPaginationObj = {
      OGYS: noticeUnReadSupplierPagination,
      OBUYER: noticeUnReadPurchasePagination,
      OCGF: noticeUnReadUserPagination,
      OROLES: unReadRolesPagination,
    };
    const readList = readListObj[noticeCategoryCode];
    const readListPagination = readListPaginationObj[noticeCategoryCode];
    const unReadList = unReadListObj[noticeCategoryCode];
    const unReadListPagination = unReadListPaginationObj[noticeCategoryCode];
    const columns = [
      {
        width: 100,
        dataIndex: 'readTargetName',
        title: isSupplier
          ? intl.get('spfm.notice.view.message.title.supplierName').d('供应商名称')
          : noticeCategoryCode === 'OBUYER'
          ? intl.get('spfm.notice.view.message.title.purchaserName').d('采购员名称')
          : noticeCategoryCode === 'OROLES'
          ? intl.get(`spfm.configServer.model.purchaser.roleName`).d('角色名称')
          : intl.get(`spfm.customerConfiguration.view.message.realName`).d('子账户名称'),
      },
      {
        width: 100,
        dataIndex: 'readTargetCode',
        title: isSupplier
          ? intl.get('spfm.notice.view.message.title.supplierCode').d('供应商编码')
          : noticeCategoryCode === 'OBUYER'
          ? intl.get('spfm.notice.view.message.title.purchaseCode').d('采购员编码')
          : noticeCategoryCode === 'OROLES'
          ? intl.get(`spfm.configServer.model.purchaser.roleCode`).d('角色编码')
          : intl.get('spfm.registerEnterprise.model.view.loginName').d('子账户账号'),
      },
    ];

    return (
      <Modal
        visible
        width={600}
        destroyOnClose
        onCancel={onClose}
        title={intl.get('spfm.notice.view.message.title.noticeReadRecord').d('阅读记录')}
      >
        {totalReadCount ? (
          <Tabs>
            <Tabs.TabPane
              key="read"
              tab={intl.get('spfm.notice.view.message.title.read').d('已读')}
            >
              <Spin
                spinning={
                  fetchReadSupplierLoading || fetchReadPurechaseLoading || fetchReadUserLoading
                }
              >
                <Table
                  columns={columns}
                  dataSource={readList}
                  pagination={readListPagination}
                  onChange={this.handleReadPagination}
                />
              </Spin>
            </Tabs.TabPane>
            <Tabs.TabPane
              key="unRead"
              tab={intl.get('spfm.notice.view.message.title.unRead').d('未读')}
            >
              <Spin
                spinning={
                  fetchUnReadPurechaseLoading ||
                  fetchUnReadSupplierLoading ||
                  fetchUnReadUserLoading
                }
              >
                <Table
                  columns={columns}
                  dataSource={unReadList}
                  pagination={unReadListPagination}
                  onChange={this.handleUnReadPagination}
                />
              </Spin>
            </Tabs.TabPane>
          </Tabs>
        ) : (
          <Spin
            spinning={fetchReadSupplierLoading || fetchReadPurechaseLoading || fetchReadUserLoading}
          >
            <Table
              columns={columns}
              dataSource={readList}
              pagination={readListPagination}
              onChange={this.handleReadPagination}
            />
          </Spin>
        )}
      </Modal>
    );
  }
}
