/*
 * DetailSearch - 供应商送货单行明细查询
 * @date: 2018/08/08 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';
import { isFunction } from 'lodash';
import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Search from './Search';
import List from './List';
import LineItemModal from './LineItemModal';
import BomModal from '../Detail/BOMModal';

/**
 * 供应商送货单行明细查询页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@withRouter
@connect(({ loading, supplierDelivery }) => ({
  queryPoItemBOMLoading: loading.effects['supplierDelivery/fetchBOM'],
  supplierDelivery,
}))
export default class DetailSearch extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      actionListRowData: {},
      asnLineId: null,
      objectVersionNumber: null,
      otherAttachmentUuid: null,
      reviewAttachmentUuid: null,
      approveAttachmentUuid: null,
      lineVisible: false,
      wrapperBOMModalVisible: false,
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      pagination,
      custLoading,
    } = this.props;
    if (_back !== -1) {
      this.handleSearch();
    } else if (!custLoading) {
      this.handleSearch(pagination);
    }
  }

  componentDidUpdate(prevProps) {
    const { custLoading } = this.props;

    const custLoadingChange = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingChange) {
      this.handleSearch();
    }
  }

  /**
   * 获取采购方附件
   */
  queryPurchaserAttachmentList = (val) => {
    return this.fetchPurchaserAttachmentList({
      attachmentUUID: val,
      bucketName: 'private-bucket',
    }).then((num) => num.length);
  };

  // 获取附件数量
  handleGetPicNums = (record = {}) => {
    let num1 = 0;
    let num2 = 0;
    let num3 = 0;
    if (record.approveAttachmentUuid) {
      num1 = this.queryPurchaserAttachmentList(record.approveAttachmentUuid);
    }
    if (record.reviewAttachmentUuid) {
      num2 = this.queryPurchaserAttachmentList(record.reviewAttachmentUuid);
    }
    if (record.otherAttachmentUuid) {
      num3 = this.queryPurchaserAttachmentList(record.otherAttachmentUuid);
    }
    return [num1, num2, num3];
  };

  /**
   * 查询送货单行列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields) {
    const { onSearch, dispatch } = this.props;
    if (isFunction(onSearch)) {
      onSearch(fields, (deliveryDetailListCallBack) => {
        deliveryDetailListCallBack.forEach((i) => {
          Promise.all(this.handleGetPicNums(i)).then((r) => {
            if (r.reduce((prev, cur) => prev + cur) === 0) {
              return;
            }
            // eslint-disable-next-line no-param-reassign
            deliveryDetailListCallBack.filter(
              (item) => i.asnLineId === item.asnLineId
            )[0].picNums = r.reduce((prev, cur) => prev + cur);
            dispatch({
              type: 'supplierDelivery/updateState',
              payload: {
                deliveryDetailList: deliveryDetailListCallBack,
              },
            });
          });
        });
      });
    }
  }

  @Bind()
  attachmentUuidList(val, record) {
    this.setState(
      {
        lineVisible: true,
        // _token: record._token,
        asnLineId: record.asnLineId,
        objectVersionNumber: record.objectVersionNumber,
        otherAttachmentUuid: record.otherAttachmentUuid, // 采购方uuid
        reviewAttachmentUuid: record.reviewAttachmentUuid, // 采购方uuid
        approveAttachmentUuid: record.approveAttachmentUuid, // 采购方uuid
      }
      // () => {
      //   const { approveAttachmentUuid } = this.state;
      //   if (!approveAttachmentUuid) {
      //     this.getLineAttachmentUuid();
      //   }
      // }
    );
  }

  /**
   * getLineAttachmentUuid - 获取行附件uuid
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  getLineAttachmentUuid() {
    const { dispatch } = this.props;
    const {
      asnLineId,
      objectVersionNumber,
      // _token,
      approveAttachmentUuid,
      reviewAttachmentUuid,
    } = this.state;
    const otherAttachmentUuid = uuidv4();
    dispatch({
      type: 'supplierDelivery/getLineAttachmentUuid',
      data: {
        asnLineId,
        objectVersionNumber,
        // _token,
        approveAttachmentUuid,
        otherAttachmentUuid,
        reviewAttachmentUuid,
      },
    }).then((res) => {
      if (res) {
        this.setState({ otherAttachmentUuid });
        this.handleSearch();
      }
    });
  }

  /**
   * 查询采购方附件列表
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  @Bind()
  fetchPurchaserAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierDelivery/queryFileListOrg',
      payload,
    });
  }

  @Bind()
  lineHideAttachment() {
    this.setState({ lineVisible: false });
  }

  @Bind()
  removeAttachment(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierDelivery/removeFile',
      payload,
    });
  }

  /**
   * openBOMModal - 打开BOM Modal
   * @param {object} [actionListRowData = {}] - 当前操作行数据
   */
  @Bind()
  openBOMModal(_, actionListRowData = {}) {
    this.setState({
      wrapperBOMModalVisible: true,
      actionListRowData,
    });
  }

  /**
   * closeBOMModal - 关闭BOM Modal 清空当前操作行数据
   */
  @Bind()
  closeBOMModal() {
    this.setState({
      wrapperBOMModalVisible: false,
      actionListRowData: {},
    });
  }

  /**
   * fetchBOM - 查询BOM数据
   * @param {object} params - 查询条件
   * @param {function} success - 操作成功回调函数
   */
  @Bind()
  fetchBOM(params, success = (e) => e) {
    const { dispatch } = this.props;
    const { actionListRowData = {} } = this.state;
    const { asnLineId, asnHeaderId } = actionListRowData;
    dispatch({
      type: 'supplierDelivery/fetchBOM',
      payload: {
        functionCode: null,
        poHeaderId: asnHeaderId, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
        poLineId: asnLineId, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
        ...params,
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * 跳转详情
   * @param {*} asnHeaderId //送货单头id
   */
  @Bind()
  handleToDetail(asnHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sinv/supplier-delivery/detail/${asnHeaderId}`,
        search: `?origin=detailSearch`,
      })
    );
  }

  render() {
    const {
      loading,
      dataSource,
      pagination,
      rowSelection,
      handleReset,
      enumMap,
      customizeFilterForm,
      customizeTable,
      queryPoItemBOMLoading,
    } = this.props;
    const {
      lineVisible,
      otherAttachmentUuid, // 采购方uuid查询
      reviewAttachmentUuid, // 采购方uuid复审
      approveAttachmentUuid,
      wrapperBOMModalVisible,
      actionListRowData,
    } = this.state;
    const filterProps = {
      enumMap,
      handleReset,
      customizeFilterForm,
      onFilterChange: this.handleSearch,
      onRef: (node) => {
        this.searchForm = node.props.form;
      },
    };
    const listProps = {
      loading,
      dataSource,
      pagination,
      rowSelection,
      customizeTable,
      editLine: this.editLine,
      searchPaging: this.handleSearch,
      openBOMModal: this.openBOMModal,
      attachmentUuidList: this.attachmentUuidList,
      onToDetail: this.handleToDetail,
    };

    const lineAttachmentProps = {
      lineVisible,
      hideAttachment: this.lineHideAttachment,
      otherAttachmentUuid, // 采购方uuid查询
      reviewAttachmentUuid, // 采购方uuid复审
      approveAttachmentUuid, // 采购方uuid审批
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList, // 查询采购方附件
      bucketName: 'private-bucket',
      bucketDirectory: 'sodr-order',
      onRemoveAttachment: this.removeAttachment,
    };
    const { itemCode, itemName, key, poHeaderId, poLineId } = actionListRowData;
    const BomModalPops = {
      visible: wrapperBOMModalVisible,
      onCancel: this.closeBOMModal,
      fetchBOM: this.fetchBOM,
      actionkey: key,
      loading: queryPoItemBOMLoading,
      itemCode,
      itemName,
      poHeaderId,
      poLineId,
    };
    return (
      <React.Fragment>
        <Search {...filterProps} />
        <List {...listProps} />
        {lineVisible && <LineItemModal {...lineAttachmentProps} />}
        {wrapperBOMModalVisible && <BomModal {...BomModalPops} />}
      </React.Fragment>
    );
  }
}
