/**
 * index-执行单据详情
 * @date: 2020-03-19
 * @author JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Modal } from 'hzero-ui';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { createPagination } from 'utils/utils';

import ListTable from './ListTable';

const titlePrompt = 'sprm.purchaseRequisitionInquiry.view.message.title';

@withRouter
@connect(({ purchaseRequisitionInquiry, loading }) => ({
  purchaseRequisitionInquiry,
  loading: loading.effects['purchaseRequisitionInquiry/fetchLineHistory'],
}))
export default class BillDetailModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
    };
  }

  /**
   * componentDidMount 生命周期函数
   * 获取数据
   */
  componentDidMount() {
    this.fetchModalList();
  }

  /**
   * 查询弹窗数据
   * @param {Object} page - 分页
   */
  @Bind()
  fetchModalList(page = {}) {
    const { dispatch, prLineId, filterValues = {} } = this.props;
    // eslint-disable-next-line no-unused-expressions
    dispatch({
      type: 'purchaseRequisitionInquiry/fetchLineHistory',
      payload: {
        page,
        prLineId,
        customizeUnitCode: 'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.EXECUTIONBILL',
        ...filterValues,
      },
    }).then?.((res) => {
      if (res) {
        this.setState({
          dataSource: res.content,
          pagination: createPagination(res),
        });
      }
    });
  }

  /**
   *
   * 点击 查看，跳转至其他详情页
   * @memberof BillDetailModal
   */
  handleJumpToPage = (url = '') => {
    const { onClose } = this.props;
    if (isFunction(onClose)) {
      onClose('billDetailModalVisible', false);
      this.props.history.push(url);
    }
  };

  /**
   * 渲染函数
   */
  render() {
    const {
      onClose,
      visible,
      loading,
      customizeTable,
      pubPathFlag,
      currentRecord = {},
    } = this.props;
    const { dataSource, pagination } = this.state;
    const modalProps = {
      visible,
      width: 1000,
      footer: null,
      destroyOnClose: true,
      title: intl.get(`${titlePrompt}.executionBillDetail`).d('执行单据详情'),
      onCancel: () => onClose('billDetailModalVisible', false),
    };
    const listProps = {
      loading,
      dataSource,
      pagination,
      onJumpToOtherPage: this.handleJumpToPage,
      onSearch: this.fetchModalList,
      customizeTable,
      pubPathFlag,
      currentRecord,
    };
    return (
      <Modal {...modalProps}>
        <ListTable {...listProps} />
      </Modal>
    );
  }
}
