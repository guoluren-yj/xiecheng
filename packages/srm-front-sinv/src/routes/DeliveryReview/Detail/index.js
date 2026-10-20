/*
 * index - 送货单详情
 * @date: 2018-12-05 10:37:11
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Spin, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isNumber, isNil } from 'lodash';
import { routerRedux } from 'dva/router';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  createPagination,
  getEditTableData,
  getResponse,
} from 'utils/utils';
import notification from 'utils/notification';
import uuid from 'uuid/v4';
import withCustomize from 'srm-front-cuz';
import styles from './index.less';
// import UploadModal from 'components/Upload';

import MaterialInfoList from './MaterialInfoList';
import HeaderInfo from './HeaderInfo';
// import LogisticInfoList from './LogisticInfoList';
import LogisticsDetail from '../../components/ApproveLogisticsDetail';
import OperationRecord from '../../components/OperationRecord';
import UploadModal from './UploadModal';
import LineItemModal from './LineItemModal';
import BomModal from './BOMModal';
import HsipHeaderInfo from './ShipHeaderInfo';

const { TabPane } = Tabs;

/**
 * Detail - 业务组件 - 送货单复审
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [deliveryOrder={}] - model中的数据源
 * @reactProps {!Object} [loading={}] - 送货单明细加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 送货单明细加载是否完成
 * @reactProps {!boolean} queryDetailHeaderLoading - 查询头明细
 * @reactProps {!boolean} queryDetailListLoading - 查询行明细
 * @reactProps {!boolean} fetchOperationRecordListLoading -查询操作记录
 * @reactProps {!boolean} rejectDeliveryOrderLoading - 送货单审批拒绝
 * @reactProps {!boolean} approveDeliveryOrderLoading - 送货单审批通过
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SINV.DELIVERY_APPROVED_DETAIL.BASIC',
    'SINV.DELIVERY_APPROVED_DETAIL.HEADER',
    'SINV.DELIVERY_APPROVED_DETAIL.HEADERSHIP',
    'SINV.DELIVERY_APPROVED_DETAIL.LOGISTICS',
  ],
})
@formatterCollections({
  code: [
    'sinv.deliveryReview',
    'entity.attachment',
    'sinv.purchaseReception',
    'sinv.common',
    'entity.item',
    'entity.supplier',
    'entity.customer',
  ],
})
@connect(({ loading, deliveryReview }) => ({
  queryDetailHeaderLoading: loading.effects['deliveryReview/queryDetailHeader'],
  queryDetailListLoading: loading.effects['deliveryReview/queryDetailList'],
  approveDeliveryOrderLoading: loading.effects['deliveryReview/approveDeliveryOrder'],
  rejectDeliveryOrderLoading: loading.effects['deliveryReview/rejectDeliveryOrder'],
  queryPoItemBOMLoading: loading.effects['deliveryReview/fetchBOM'],
  deliveryReview,
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
    } = this.props;
    const detailId = params.id;
    this.state = {
      detailId,
      detailHeaderInfo: {},
      actionListRowData: {},
      detailListDataSource: [],
      detailListPagination: {},
      operationRecordModalVisible: false, // 修改记录模态框
      organizationId: getCurrentOrganizationId(),
      approvedRemarkRequired: false,
      visible: false,
      _token: '',
      asnLineId: null,
      attachmentUuid: null,
      objectVersionNumber: null,
      otherAttachmentUuid: null,
      reviewAttachmentUuid: null,
      approveAttachmentUuid: null,
      lineVisible: false,
      wrapperBOMModalVisible: false,
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    this.fetchDetailHeader();
    this.fetchDetailList();
  }

  componentDidUpdate(prevProps) {
    const { match = {} } = this.props;
    const { params } = match;
    if (prevProps.match.params.id !== params.id) {
      if (isNumber(Number(params.id))) {
        this.fetchDetailHeader();
        this.fetchDetailList();
      }
    }
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader() {
    const { dispatch } = this.props;
    const { detailId } = this.state;
    dispatch({
      type: 'deliveryReview/queryDetailHeader',
      asnHeaderId: detailId,
      customizeUnitCode:
        'SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS,SINV.DELIVERY_APPROVED_DETAIL.HEADER,SINV.DELIVERY_APPROVED_DETAIL.HEADERSHIP,SINV.DELIVERY_APPROVED_DETAIL.LOGISTICS',
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({
          detailHeaderInfo: res,
        });
      }
    });
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

  /**
   * fetchDetailList - 查询行明细数据
   */
  @Bind()
  fetchDetailList(page = {}, _, sorter) {
    const { dispatch } = this.props;
    const { detailId } = this.state;
    dispatch({
      type: 'deliveryReview/queryDetailList',
      payload: {
        asnHeaderId: detailId,
        page,
        sort: sorter,
        customizeUnitCode: 'SINV.DELIVERY_APPROVED_DETAIL.BASIC',
        quaryType: 'Review',
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.setState(
          {
            detailListDataSource:
              Array.isArray(res?.content) &&
              res.content.length &&
              res.content.map((n) => ({ ...n, _status: 'update' })),
            detailListPagination: createPagination(res),
          },
          () => {
            // eslint-disable-next-line no-unused-expressions
            this?.state?.detailListDataSource?.forEach((i) => {
              Promise.all(this.handleGetPicNums(i)).then((r) => {
                if (r.reduce((prev, cur) => prev + cur) === 0) {
                  return;
                }
                this.setState({
                  detailListDataSource: this.state.detailListDataSource.map((item) => {
                    if (item.asnLineId === i.asnLineId) {
                      return {
                        ...item,
                        picNums: r.reduce((prev, cur) => prev + cur),
                      };
                    }
                    return { ...item };
                  }),
                });
              });
            });
          }
        );
      }
    });
  }

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
   * 控制弹窗的显示和隐藏
   * @param {String} modalVisible
   * @param {Boolean} flag
   * @memberof Detail
   */
  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  /**
   * 审批通过
   * @memberof Detail
   */
  @Bind()
  approveDeliveryOrder() {
    const { detailHeaderInfo, detailListDataSource } = this.state;
    const { dispatch } = this.props;
    const { validateFields = (e) => e } = this.headerInfoForm;

    this.setState({ approvedRemarkRequired: false }, () => {
      validateFields({ force: true }, (err1, values1) => {
        this.headerShipForm.validateFields({ force: true }, (err2, values2) => {
          this.logisticsForm.validateFields({ force: true }, (err3, values3) => {
            if (
              !isNil(detailHeaderInfo?.asnHeaderId) &&
              isEmpty(err1) &&
              isEmpty(err2) &&
              isEmpty(err3)
            ) {
              Modal.confirm({
                title: intl
                  .get(`sinv.common.model.common.confirmApprove`)
                  .d('是否确认审批通过送货单'),
                okText: intl.get('hzero.common.button.sure').d('确定'),
                cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                onOk: () => {
                  if (
                    getEditTableData(detailListDataSource).length !== 0 &&
                    Array.isArray(getEditTableData(detailListDataSource))
                  ) {
                    dispatch({
                      type: 'deliveryReview/approveDeliveryOrder',
                      payload: [
                        {
                          ...detailHeaderInfo,
                          ...values1,
                          ...values2,
                          ...values3,
                          asnLineList: getEditTableData(detailListDataSource),
                          customizeUnitCode: `SINV.DELIVERY_APPROVED_DETAIL.HEADER,SINV.DELIVERY_APPROVED_DETAIL.HEADERSHIP,SINV.DELIVERY_APPROVED_DETAIL.BASIC,SINV.DELIVERY_APPROVED_DETAIL.LOGISTICS`,
                        },
                      ],
                    }).then((res) => {
                      if (getResponse(res)) {
                        notification.success();
                        dispatch(
                          routerRedux.push({
                            pathname: `/sinv/delivery-review/list`,
                          })
                        );
                      }
                    });
                  }
                },
              });
            }
          });
        });
      });
    });
  }

  /**
   * 审批拒绝
   * @memberof Detail
   */
  @Bind()
  rejectDeliveryOrder() {
    const { detailHeaderInfo, detailListDataSource } = this.state;
    const { dispatch } = this.props;
    const { validateFields = (e) => e } = this.headerInfoForm;
    this.setState({ approvedRemarkRequired: true });
    validateFields({ force: true }, (err1, values1) => {
      this.headerShipForm.validateFields({ force: true }, (err2, values2) => {
        this.logisticsForm.validateFields({ force: true }, (err3, values3) => {
          if (
            !isNil(detailHeaderInfo?.asnHeaderId) &&
            isEmpty(err1) &&
            isEmpty(err2) &&
            isEmpty(err3) &&
            values1.reviewRemark
          ) {
            Modal.confirm({
              title: intl.get(`sinv.common.model.common.confirmReject`).d('是否确认审批拒绝送货单'),
              okText: intl.get('hzero.common.button.sure').d('确定'),
              cancelText: intl.get('hzero.common.button.cancel').d('取消'),
              onOk: () => {
                if (
                  getEditTableData(detailListDataSource).length !== 0 &&
                  Array.isArray(getEditTableData(detailListDataSource))
                ) {
                  dispatch({
                    type: 'deliveryReview/rejectDeliveryOrder',
                    payload: [
                      {
                        ...detailHeaderInfo,
                        ...values1,
                        ...values2,
                        ...values3,
                        asnLineList: getEditTableData(detailListDataSource),
                        customizeUnitCode: `SINV.DELIVERY_APPROVED_DETAIL.HEADER,SINV.DELIVERY_APPROVED_DETAIL.HEADERSHIP,SINV.DELIVERY_APPROVED_DETAIL.BASIC,SINV.DELIVERY_APPROVED_DETAIL.LOGISTICS`,
                      },
                    ],
                  }).then((res) => {
                    if (getResponse(res)) {
                      notification.success();
                      dispatch(
                        routerRedux.push({
                          pathname: `/sinv/delivery-review/list`,
                        })
                      );
                    }
                  });
                }
              },
              onCancel: () => {
                this.setState({ approvedRemarkRequired: false }, () =>
                  validateFields({ force: true })
                );
              },
            });
          }
        });
      });
    });
  }

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ visible: false });
  }

  @Bind()
  openUploadModal() {
    this.setState({ visible: true }, () => {
      const {
        detailHeaderInfo: { reviewAttachmentUuid },
      } = this.state;
      if (!reviewAttachmentUuid) {
        this.getHeaderAttachmentUuid();
      }
    });
  }

  /**
   * getHeaderAttachmentUuid - 获取头附件uuid
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  getHeaderAttachmentUuid() {
    const { dispatch } = this.props;
    const { detailHeaderInfo = {} } = this.state;
    const {
      asnHeaderId,
      objectVersionNumber,
      _token,
      otherAttachmentUuid,
      approveAttachmentUuid,
      supplierAttachmentUuid,
      supplierAttaUuid,
    } = detailHeaderInfo;
    const reviewAttachmentUuid = uuid();
    dispatch({
      type: 'deliveryReview/getHeaderAttachmentUuid',
      data: {
        asnHeaderId,
        objectVersionNumber,
        _token,
        otherAttachmentUuid,
        approveAttachmentUuid,
        supplierAttachmentUuid,
        reviewAttachmentUuid,
        supplierAttaUuid,
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.fetchDetailHeader();
      }
    });
  }

  /**
   * 删除附件
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @param {string} payload.urls 要删除附件的url
   * @returns Promise
   */
  @Bind()
  removeAttachment(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'deliveryReview/removeFile',
      payload,
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
      type: 'deliveryReview/queryFileListOrg',
      payload,
    });
  }

  /**
   * 查询供应商附件列表
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  @Bind()
  fetchSupplierAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'deliveryReview/queryFileListOrg',
      payload,
    });
  }

  @Bind()
  attachmentUuidList(val, record) {
    this.setState(
      {
        lineVisible: true,
        _token: record._token,
        asnLineId: record.asnLineId,
        attachmentUuid: record.attachmentUuid,
        objectVersionNumber: record.objectVersionNumber,
        otherAttachmentUuid: record.otherAttachmentUuid, // 采购方uuid
        reviewAttachmentUuid: record.reviewAttachmentUuid, // 采购方uuid
        approveAttachmentUuid: record.approveAttachmentUuid, // 采购方uuid
      },
      () => {
        const { reviewAttachmentUuid } = this.state;
        if (!reviewAttachmentUuid) {
          this.getLineAttachmentUuid();
        }
      }
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
      _token,
      attachmentUuid,
      otherAttachmentUuid,
      approveAttachmentUuid,
    } = this.state;
    const reviewAttachmentUuid = uuid();
    dispatch({
      type: 'deliveryReview/getLineAttachmentUuid',
      data: {
        asnLineId,
        objectVersionNumber,
        _token,
        attachmentUuid,
        approveAttachmentUuid,
        otherAttachmentUuid,
        reviewAttachmentUuid,
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({ reviewAttachmentUuid });
        this.fetchDetailList();
      }
    });
  }

  @Bind()
  lineHideAttachment() {
    this.setState({ lineVisible: false });
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
    const { actionListRowData = {}, detailId } = this.state;
    const { asnLineId } = actionListRowData;
    dispatch({
      type: 'deliveryReview/fetchBOM',
      payload: {
        functionCode: null,
        poHeaderId: detailId, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
        poLineId: asnLineId, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
        ...params,
      },
    }).then((res) => {
      if (getResponse(res)) {
        success(res);
      }
    });
  }

  render() {
    const {
      dispatch,
      match,
      customizeForm,
      customizeTable,
      queryDetailHeaderLoading,
      queryDetailListLoading,
      fetchOperationRecordListLoading,
      approveDeliveryOrderLoading,
      rejectDeliveryOrderLoading,
      queryPoItemBOMLoading,
      deliveryReview: { operationRecordPagination, operationRecordList },
    } = this.props;
    const {
      organizationId,
      operationRecordModalVisible,
      detailId,
      detailHeaderInfo,
      detailListDataSource,
      detailListPagination,
      visible,
      lineVisible,
      otherAttachmentUuid,
      reviewAttachmentUuid,
      approveAttachmentUuid,
      wrapperBOMModalVisible,
      actionListRowData,
    } = this.state;
    const materialInfoProps = {
      dispatch,
      customizeTable,
      dataSource: detailListDataSource,
      pagination: detailListPagination,
      onChange: this.fetchDetailList,
      openBOMModal: this.openBOMModal,
      loading: queryDetailListLoading,
      attachmentUuidList: this.attachmentUuidList,
    };
    const operationRecordProps = {
      dispatch,
      match,
      operationRecordId: detailId,
      organizationId,
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
      // onSearchOperationRecord: this.searchOperationRecord,
    };
    const { approvedRemarkRequired } = this.state;
    const headerInfoProps = {
      customizeForm,
      detailHeaderInfo,
      loading: queryDetailHeaderLoading,
      onRef: (node) => {
        this.headerInfoForm = node.props.form;
      },
      approvedRemarkRequired,
    };
    const headerShipProps = {
      customizeForm,
      detailHeaderInfo,
      loading: queryDetailHeaderLoading,
      onRef: (node) => {
        this.headerShipForm = node.props.form;
      },
      approvedRemarkRequired,
    };
    // const LogisticInfoProps = {
    //   dataSource: detailHeaderInfo,
    // };
    const LogisticsDetailProps = {
      headerInfo: detailHeaderInfo,
      customizeForm,
      onRef: (node) => {
        this.logisticsForm = node.props.form;
      },
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
      onGetPicNums: this.fetchDetailList,
    };

    const attachmentProps = {
      hideAttachment: this.hideAttachment,
      supplierAttachmentUuid: detailHeaderInfo.supplierAttachmentUuid, // 采购方uuid
      otherAttachmentUuid: detailHeaderInfo.otherAttachmentUuid, // 供应商uuid
      reviewAttachmentUuid: detailHeaderInfo.reviewAttachmentUuid, // 供应商uuid
      approveAttachmentUuid: detailHeaderInfo.approveAttachmentUuid, // 供应商uuid
      supplierAttaUuid: detailHeaderInfo.supplierAttaUuid, // 供应商uuid
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      // loading: queryFileListOrgLoading, // 加载状态
      bucketName: 'private-bucket',
      bucketDirectory: 'sinv-order',
      onRemoveAttachment: this.removeAttachment,
      // onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
    };
    const { itemCode, itemName, key, asnHeaderId, asnLineId } = actionListRowData;
    const BomModalPops = {
      visible: wrapperBOMModalVisible,
      onCancel: this.closeBOMModal,
      fetchBOM: this.fetchBOM,
      actionkey: key,
      loading: queryPoItemBOMLoading,
      itemCode,
      itemName,
      asnHeaderId,
      asnLineId,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`sinv.common.model.common.deliveryDetail`).d('送货单明细')}
          backPath="/sinv/delivery-review/list"
        >
          <Button
            loading={
              queryDetailHeaderLoading || approveDeliveryOrderLoading || rejectDeliveryOrderLoading
            }
            icon="check"
            type="primary"
            onClick={this.approveDeliveryOrder}
          >
            {intl.get(`sinv.deliveryReview.view.button.approval`).d('审批通过')}
          </Button>
          <Button
            icon="close"
            className="label-btn"
            onClick={this.rejectDeliveryOrder}
            loading={
              queryDetailHeaderLoading || approveDeliveryOrderLoading || rejectDeliveryOrderLoading
            }
          >
            {intl.get(`sinv.deliveryReview.view.button.reject`).d('审批拒绝')}
          </Button>
          <Button
            icon="clock-circle-o"
            className="label-btn"
            loading={
              queryDetailHeaderLoading || approveDeliveryOrderLoading || rejectDeliveryOrderLoading
            }
            onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
          >
            {intl.get(`sinv.common.view.button.operationRecord`).d('操作记录')}
          </Button>
          {/* <UploadModal {...uploadProps} /> */}
          <Button
            onClick={this.openUploadModal}
            icon="paper-clip"
            loading={
              queryDetailHeaderLoading || approveDeliveryOrderLoading || rejectDeliveryOrderLoading
            }
          >
            {intl.get('sinv.common.attachment.upload').d('附件管理')}
          </Button>
        </Header>
        <Content className={styles.content}>
          <Spin spinning={false}>
            <HeaderInfo {...headerInfoProps} />
            <HsipHeaderInfo {...headerShipProps} />
          </Spin>
          <Tabs defaultActiveKey="materialInfo" animated={false}>
            <TabPane
              tab={intl.get(`sinv.deliveryReview.view.message.title.materialInfo`).d('物料信息')}
              key="materialInfo"
            >
              <MaterialInfoList {...materialInfoProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`sinv.deliveryReview.view.message.title.logisticInfo`).d('物流信息')}
              key="logisticInfo"
              forceRender
            >
              {/* <LogisticInfoList {...LogisticInfoProps} /> */}
              <LogisticsDetail {...LogisticsDetailProps} />
            </TabPane>
          </Tabs>
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        {visible && <UploadModal {...attachmentProps} />}
        {lineVisible && <LineItemModal {...lineAttachmentProps} />}
        {wrapperBOMModalVisible && <BomModal {...BomModalPops} />}
      </Fragment>
    );
  }
}
