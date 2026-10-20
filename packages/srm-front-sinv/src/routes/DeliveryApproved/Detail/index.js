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
import { isNumber, isEmpty, isNil } from 'lodash';
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
import uuidv4 from 'uuid/v4';
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
import ShipHeaderInfo from './ShipHeaderInfo';

const { TabPane } = Tabs;

/**
 * Detail - 业务组件 - 送货单审批
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
    'SINV.DELIVERY_APPROVED_DETAIL.HEADER',
    'SINV.DELIVERY_APPROVED_DETAIL.BASIC',
    'SINV.DELIVERY_APPROVED_DETAIL.HEADERSHIP',
    'SINV.DELIVERY_APPROVED_DETAIL.LOGISTICS',
  ],
})
@formatterCollections({
  code: [
    'sinv.common',
    'sinv.deliveryApproved',
    'sinv.purchaseReception',
    'entity.attachment',
    'entity.supplier',
    'entity.company',
    'entity.customer',
    'entity.roles',
    'entity.item',
    'hzero.layout',
  ],
})
@connect(({ loading, deliveryApproved }) => ({
  queryDetailHeaderLoading: loading.effects['deliveryApproved/queryDetailHeader'],
  queryDetailListLoading: loading.effects['deliveryApproved/queryDetailList'],
  rejectDeliveryOrderLoading: loading.effects['deliveryAprroved/rejectDeliveryOrder'],
  approveDeliveryOrderLoading: loading.effects['deliveryApproved/approveDeliveryOrder'],
  queryPoItemBOMLoading: loading.effects['deliveryApproved/fetchBOM'],
  deliveryApproved,
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params = {}, path },
    } = this.props;
    const detailId = params.id;
    if (isNumber(Number(detailId))) {
      this.setState({
        detailId,
        detailHeaderInfo: {},
        detailListDataSource: [],
        detailListPagination: {},
      });
    }
    this.state = {
      operationRecordModalVisible: false, // 修改记录模态框
      detailId,
      _token: '',
      asnLineId: null,
      attachmentUuid: null,
      objectVersionNumber: null,
      otherAttachmentUuid: null,
      reviewAttachmentUuid: null,
      approveAttachmentUuid: null,
      detailHeaderInfo: {},
      actionListRowData: {},
      organizationId: getCurrentOrganizationId(),
      approvedRemarkRequired: false,
      visible: false,
      lineVisible: false,
      wrapperBOMModalVisible: false,
      sourceFromPub: path.includes('pub'),
      detailListDataSource: [],
      detailListPagination: {},
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
    if (!isNil(detailId)) {
      dispatch({
        type: 'deliveryApproved/queryDetailHeader',
        asnHeaderId: detailId,
        customizeUnitCode:
          'SINV.DELIVERY_APPROVED_DETAIL.HEADER,SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS,SINV.DELIVERY_APPROVED_DETAIL.HEADERSHIP,SINV.DELIVERY_APPROVED_DETAIL.LOGISTICS',
      }).then((detailHeaderInfo) => {
        if (detailHeaderInfo && !isNil(detailHeaderInfo.asnHeaderId)) {
          this.setState({ detailHeaderInfo });
        }
      });
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

  /**
   * fetchDetailList - 查询行明细数据
   */
  @Bind()
  fetchDetailList(page = {}, _, sorter) {
    const { dispatch } = this.props;
    const { detailId, detailListDataSource = [] } = this.state;
    dispatch({
      type: 'deliveryApproved/queryDetailList',
      payload: {
        page,
        sort: sorter,
        quaryType: 'Approve',
        asnHeaderId: detailId,
        customizeUnitCode: 'SINV.DELIVERY_APPROVED_DETAIL.BASIC',
      },
    }).then((res) => {
      if (getResponse(res)) {
        const { content } = res;
        this.setState(
          {
            detailListDataSource:
              Array.isArray(content) &&
              content.length &&
              content.map((n) => ({ ...n, _status: 'update' })),
            detailListPagination: createPagination(res),
          },
          () => {
            // eslint-disable-next-line no-unused-expressions
            detailListDataSource?.forEach((i) => {
              Promise.all(this.handleGetPicNums(i)).then((r) => {
                if (r.reduce((prev, cur) => prev + cur) === 0) {
                  return;
                }
                this.setState({
                  detailListDataSource: detailListDataSource?.map((item) => {
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
            if (isEmpty(err1) && isEmpty(err2) && isEmpty(err3)) {
              Modal.confirm({
                title: intl
                  .get(`sinv.common.model.common.confirmApprove`)
                  .d('是否确认审批通过送货单'),
                okText: intl.get('hzero.common.button.sure').d('确定'),
                cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                onOk: () => {
                  if (
                    !isNil(detailHeaderInfo?.asnHeaderId) &&
                    getEditTableData(detailListDataSource).length !== 0 &&
                    Array.isArray(getEditTableData(detailListDataSource))
                  ) {
                    dispatch({
                      type: 'deliveryApproved/approveDeliveryOrder',
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
                            pathname: `/sinv/delivery-approved/list`,
                          })
                        );
                        // if (res.length === 0) {
                        //   notification.success();
                        //   dispatch(
                        //     routerRedux.push({
                        //       pathname: `/sinv/delivery-approved/list`,
                        //     })
                        //   );
                        // } else {
                        //   const message = res.filter((item) => item.submitErrorMessage)[0]
                        //     .submitErrorMessage;
                        //   const list = res.filter((n) => !n.submitErrorMessage);
                        //   notification.warning({
                        //     message,
                        //   });
                        //   this.setState({
                        //     detailListDataSource: list.map((n) => ({ ...n, _status: 'update' })),
                        //     detailListPagination: createPagination(list),
                        //   });
                        // }
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
          if (isEmpty(err1) && isEmpty(err2) && isEmpty(err3) && values1.approvedRemark) {
            Modal.confirm({
              title: intl.get(`sinv.common.model.common.confirmReject`).d('是否确认审批拒绝送货单'),
              okText: intl.get('hzero.common.button.sure').d('确定'),
              cancelText: intl.get('hzero.common.button.cancel').d('取消'),
              onOk: () => {
                if (
                  !isNil(detailHeaderInfo?.asnHeaderId) &&
                  getEditTableData(detailListDataSource).length !== 0 &&
                  Array.isArray(getEditTableData(detailListDataSource))
                ) {
                  dispatch({
                    type: 'deliveryApproved/rejectDeliveryOrder',
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
                          pathname: `/sinv/delivery-approved/list`,
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
  lineHideAttachment() {
    this.setState({ lineVisible: false });
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
      supplierAttachmentUuid,
      reviewAttachmentUuid,
      supplierAttaUuid,
    } = detailHeaderInfo;
    const approveAttachmentUuid = uuidv4();
    dispatch({
      type: 'deliveryApproved/getHeaderAttachmentUuid',
      data: {
        asnHeaderId,
        objectVersionNumber,
        _token,
        approveAttachmentUuid,
        otherAttachmentUuid,
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

  @Bind()
  openUploadModal() {
    this.setState({ visible: true }, () => {
      const {
        detailHeaderInfo: { approveAttachmentUuid },
      } = this.state;
      if (!approveAttachmentUuid) {
        this.getHeaderAttachmentUuid();
      }
    });
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
      reviewAttachmentUuid,
    } = this.state;
    const approveAttachmentUuid = uuidv4();
    dispatch({
      type: 'deliveryApproved/getLineAttachmentUuid',
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
        this.setState({ approveAttachmentUuid });
        this.fetchDetailList();
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
      type: 'deliveryApproved/queryFileListOrg',
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
      type: 'deliveryApproved/queryFileListOrg',
      payload,
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
      type: 'deliveryApproved/removeFile',
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
        const { approveAttachmentUuid } = this.state;
        if (!approveAttachmentUuid) {
          this.getLineAttachmentUuid();
        }
      }
    );
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
      type: 'deliveryApproved/fetchBOM',
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
      deliveryApproved: { operationRecordPagination, operationRecordList },
    } = this.props;
    const {
      organizationId,
      operationRecordModalVisible,
      detailId,
      detailHeaderInfo,
      detailListDataSource,
      detailListPagination,
      approvedRemarkRequired,
      visible,
      lineVisible,
      otherAttachmentUuid,
      reviewAttachmentUuid,
      approveAttachmentUuid,
      wrapperBOMModalVisible,
      actionListRowData,
      sourceFromPub,
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
    const LogisticsDetailProps = {
      headerInfo: detailHeaderInfo,
      customizeForm,
      onRef: (node) => {
        this.logisticsForm = node.props.form;
      },
    };
    const attachmentProps = {
      hideAttachment: this.hideAttachment,
      supplierAttachmentUuid: detailHeaderInfo.supplierAttachmentUuid, // 采购方uuid
      otherAttachmentUuid: detailHeaderInfo.otherAttachmentUuid, // 供应商uuid
      reviewAttachmentUuid: detailHeaderInfo.reviewAttachmentUuid, // 供应商uuid
      approveAttachmentUuid: detailHeaderInfo.approveAttachmentUuid, // 供应商uuid
      supplierAttaUuid: detailHeaderInfo.supplierAttaUuid, // 供应商uuid
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList, // 查询采购方附件
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList, // 查询供应商附件
      // loading: queryFileListOrgLoading, // 加载状态
      bucketName: 'private-bucket',
      bucketDirectory: 'sinv-delivery',
      onRemoveAttachment: this.removeAttachment,
      // onBindUuidToHeader: this.getHeaderAttachmentUuid, // 绑定uuid到头
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
    const backPath = sourceFromPub ? false : '/sinv/delivery-approved/list';

    return (
      <Fragment>
        <Header
          title={intl.get(`sinv.common.model.common.deliveryDetail`).d('送货单明细')}
          backPath={backPath}
        >
          {!sourceFromPub && (
            <Button
              icon="check"
              type="primary"
              onClick={this.approveDeliveryOrder}
              loading={
                approveDeliveryOrderLoading ||
                rejectDeliveryOrderLoading ||
                queryDetailHeaderLoading ||
                queryDetailListLoading
              }
            >
              {intl.get(`sinv.deliveryApproved.view.button.approval`).d('审批通过')}
            </Button>
          )}
          {!sourceFromPub && (
            <Button
              icon="close"
              className="label-btn"
              onClick={this.rejectDeliveryOrder}
              loading={
                rejectDeliveryOrderLoading ||
                approveDeliveryOrderLoading ||
                queryDetailHeaderLoading ||
                queryDetailListLoading
              }
            >
              {intl.get(`sinv.deliveryApproved.view.button.reject`).d('审批拒绝')}
            </Button>
          )}
          <Button
            icon="clock-circle-o"
            className="label-btn"
            loading={
              approveDeliveryOrderLoading ||
              rejectDeliveryOrderLoading ||
              queryDetailHeaderLoading ||
              queryDetailListLoading
            }
            onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
          >
            {intl.get(`sinv.common.view.button.operationRecord`).d('操作记录')}
          </Button>
          {/* <UploadModal {...uploadProps} /> */}
          <Button
            loading={
              approveDeliveryOrderLoading ||
              rejectDeliveryOrderLoading ||
              queryDetailHeaderLoading ||
              queryDetailListLoading
            }
            onClick={this.openUploadModal}
            icon="paper-clip"
          >
            {intl.get('sinv.common.attachment.upload').d('附件管理')}
          </Button>
        </Header>
        <Content className={styles.content}>
          <Spin spinning={false}>
            <HeaderInfo {...headerInfoProps} />
            <ShipHeaderInfo {...headerShipProps} />
            <Tabs defaultActiveKey="materialInfo" animated={false}>
              <TabPane
                tab={intl
                  .get(`sinv.deliveryApproved.view.message.title.materialInfo`)
                  .d('物料信息')}
                key="materialInfo"
              >
                <MaterialInfoList {...materialInfoProps} />
              </TabPane>
              <TabPane
                tab={intl
                  .get(`sinv.deliveryApproved.view.message.title.logisticInfo`)
                  .d('物流信息')}
                key="logisticInfo"
                forceRender
              >
                {/* <LogisticInfoList {...LogisticInfoProps} /> */}
                <LogisticsDetail {...LogisticsDetailProps} />
              </TabPane>
            </Tabs>
          </Spin>
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        {visible && <UploadModal {...attachmentProps} />}
        {lineVisible && <LineItemModal {...lineAttachmentProps} />}
        {wrapperBOMModalVisible && <BomModal {...BomModalPops} />}
      </Fragment>
    );
  }
}
