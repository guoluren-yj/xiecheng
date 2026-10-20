/*
 * index - 送货单取消详情页
 * @date: 2018/11/12 16:45:50
 * @author: LZH <zhaohuiLiu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Tabs, Collapse, Icon, Spin, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';

import { createPagination } from 'utils/utils';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
// import UploadModal from 'components/Upload/index';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import HeaderInfo from './HeaderInfo';
// import LogisticsInfoList from './LogisticsInfoList';
import LogisticsDetail from '../../components/LogisticsDetail';
import LeadType from '../../components/LeadType';
import DetailList from './DetailList';
import styles from './index.less';
import UploadModal from './UploadModal';
import LineItemModal from './LineItemModal';
import BomModal from './BOMModal';
import ShipHeaderInfo from './ShipHeaderInfo';

// import { query } from 'src/services/error';

const { TabPane } = Tabs;

// 折叠面板组件初始化
const { Panel } = Collapse;

const commonViewPrompt = 'sinv.common.view.message.title';

/**
 * index - 送货单关闭
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [sendOrder={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {!boolean} resyncDeliveryOrderLoading - 重新同步
 * @reactProps {!boolean} cancelDeliveryOrderLoading - 取消送货单
 * @reactProps {!boolean} queryDetailHeaderLoading - 查询头明细
 * @reactProps {!boolean} queryDetailListLoading - 查询行明细
 * @reactProps {!boolean} queryFileListOrgLoading - 查询附件相关
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SODR.DELIVERY_CANCELLED_DETAIL.BASIC',
    'SODR.DELIVERY_CANCELLED_DETAIL.OTEHR',
    'SODR.DELIVERY_CANCELLED_DETAIL.DETAIL.HEADER',
    'SODR.DELIVERY_CANCELLED_DETAIL.HEADERSHIP',
    'SODR.DELIVERY_CANCELLED_DETAIL.BTN',
  ],
})
@connect(({ loading, deliveryCancelled }) => ({
  queryDetailHeaderLoading: loading.effects['deliveryCancelled/queryDetailHeader'],
  queryDetailListLoading: loading.effects['deliveryCancelled/queryDetailList'],
  resyncDeliveryOrderLoading: loading.effects['deliveryCancelled/resyncDeliveryOrder'],
  cancelDeliveryOrderLoading: loading.effects['deliveryCancelled/cancelDeliveryOrder'],
  queryPoItemBOMLoading: loading.effects['deliveryCancelled/fetchBOM'],

  deliveryCancelled,
}))
@formatterCollections({
  code: [
    'sinv.deliveryCanceled',
    'sinv.deliveryCancelled',
    'sinv.common',
    'entity.supplier',
    'entity.attachment',
    'entity.customer',
    'entity.item',
    'sodr.common',
    'sodr.sendOrder',
    'sinv.purchaseReception',
    'sinv.purchaserDelivery',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
    } = this.props;
    const detailId = params.id;
    if (isNumber(Number(detailId))) {
      this.setState({
        detailId,
      });
    }
    this.state = {
      detailId,
      collapseKeys: ['orderHeaderInfo', 'orderHeaderInfos'],
      currentTabKey: 'basicInfo',
      detailListDataSource: [],
      detailHeaderInfo: {},
      pagination: {},
      actionListRowData: {},
      visible: false, // 附件查看的显示
      objectVersionNumber: null,
      otherAttachmentUuid: null,
      reviewAttachmentUuid: null,
      approveAttachmentUuid: null,
      lineVisible: false,
      selectedRowKeys: [],
      selectedRows: [],
      // setting: '0',
      wrapperBOMModalVisible: false,
      recordList: [],
      leadTypeVisible: false,
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    this.fetchDetailHeader();
    this.fetchDetailList();
    // this.fetchSettings();
  }

  /**
   * fetchSettings - 查询配置中心
   */
  // @Bind()
  // fetchSettings() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'deliveryCancelled/fetchSettings',
  //   }).then((res) => {
  //     if (res) {
  //       this.setState({
  //         setting: res['010310'],
  //       });
  //     }
  //   });
  // }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader() {
    const { dispatch } = this.props;
    const { detailId } = this.state;
    dispatch({
      type: 'deliveryCancelled/queryDetailHeader',
      payload: {
        asnHeaderId: detailId,
        customizeUnitCode:
          'SODR.DELIVERY_CANCELLED_DETAIL.DETAIL.HEADER,SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS,SODR.DELIVERY_CANCELLED_DETAIL.HEADERSHIP',
      },
    }).then((res) => {
      if (res) {
        this.setState({ detailHeaderInfo: { ...res, custToken: res._token } });
      }
    });
  }

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ visible: false });
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
      type: 'deliveryCancelled/queryDetailList',
      payload: {
        asnHeaderId: detailId,
        page,
        quaryType: 'Cancel',
        sort: sorter,
        customizeUnitCode:
          'SODR.DELIVERY_CANCELLED_DETAIL.BASIC,SODR.DELIVERY_CANCELLED_DETAIL.OTEHR',
      },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            detailListDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
            pagination: createPagination(res),
            selectedRowKeys: [],
            selectedRows: [],
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
   * onCollapseChange - 折叠面板onChange
   * @param {string} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * detailTabChange - 详情tab页切换
   * @param {string} key - Panels key
   */
  @Bind()
  detailTabChange(key) {
    this.setState({
      currentTabKey: key,
    });
  }

  /**
   * 重新同步
   * @memberof Detail
   */
  @Bind()
  resyncDeliveryOrder() {
    const { detailHeaderInfo } = this.state;
    const { dispatch } = this.props;
    const {
      objectVersionNumber,
      _token,
      asnHeaderId,
      receiveStatus,
      asnStatus,
      submitSyncStatus,
      asnNum,
    } = detailHeaderInfo;
    dispatch({
      type: 'deliveryCancelled/resyncDeliveryOrder',
      payload: [
        {
          objectVersionNumber,
          _token,
          asnHeaderId,
          receiveStatus,
          asnStatus,
          submitSyncStatus,
          asnNum,
        },
      ],
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/sinv/delivery-cancelled/list`,
          })
        );
      }
    });
  }

  /**
   * 送货单取消
   * @memberof Detail
   */
  @Bind()
  cancelDeliveryOrder() {
    const { detailHeaderInfo, selectedRowKeys, selectedRows, pagination } = this.state;
    const { dispatch } = this.props;
    const isLineCancel = selectedRowKeys.length > 0;
    const {
      objectVersionNumber,
      _token,
      asnHeaderId,
      receiveStatus,
      asnStatus,
      submitSyncStatus,
      asnNum,
    } = detailHeaderInfo;
    if (isNil(_token)) return false;
    let lineMap = [];
    lineMap = selectedRows.reduce((init, item) => {
      init.push(`【${item.asnLineNum || null}】`);
      return init;
    }, []);
    const cancelOrders = isLineCancel
      ? selectedRows.map((i) => ({ ...i, asnHeaderId }))
      : [
          {
            objectVersionNumber,
            _token,
            asnHeaderId,
            receiveStatus,
            asnStatus,
            submitSyncStatus,
            asnNum,
          },
        ];
    Modal.confirm({
      title: isLineCancel
        ? `${intl.get(`sinv.common.model.common.cancelLineBy`).d(`将取消行号为`)} ${lineMap.join(
            ''
          )} ${intl.get(`sinv.common.model.common.lines`).d(`的发货，是否确认？`)}`
        : intl
            .get(`sinv.common.model.common.confirmCancelAll`)
            .d('您未勾选任何数据，将整单取消发货，是否确认？'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'deliveryCancelled/cancelDeliveryOrder',
          payload: {
            isLineCancel,
            cancelOrders,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            if (isLineCancel) {
              this.fetchDetailHeader();
              this.fetchDetailList(pagination);
            } else {
              dispatch(
                routerRedux.push({
                  pathname: `/sinv/delivery-cancelled/list`,
                })
              );
            }
          }
        });
      },
    });
  }

  @Bind()
  handleSelectRows(selectedRowKeys, selectedRows) {
    const { dispatch, deliveryCancelled } = this.props;
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
    const cuzAsnList = deliveryCancelled.detailListDataSource.map((i) => {
      i.cuz_selected = selectedRowKeys.includes(i.asnLineId); // eslint-disable-line
      return i;
    });
    if (cuzAsnList.length) {
      dispatch({
        type: 'deliveryCancelled/updateState',
        payload: {
          cancelSelectDetailList: cuzAsnList,
        },
      });
    }
  }

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

  @Bind()
  openUploadModal() {
    this.setState({ visible: true });
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
      type: 'deliveryCancelled/queryFileListOrg',
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
      type: 'deliveryCancelled/queryFileListOrg',
      payload,
    });
  }

  @Bind()
  attachmentUuidList(val, record) {
    this.setState({
      lineVisible: true,
      // _token: record._token,
      asnLineId: record.asnLineId,
      objectVersionNumber: record.objectVersionNumber,
      otherAttachmentUuid: record.otherAttachmentUuid, // 采购方uuid
      reviewAttachmentUuid: record.reviewAttachmentUuid, // 采购方uuid
      approveAttachmentUuid: record.approveAttachmentUuid, // 采购方uuid
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
      type: 'deliveryCancelled/removeFile',
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
    const { actionListRowData = {}, detailId } = this.state;
    const { asnLineId } = actionListRowData;
    dispatch({
      type: 'deliveryCancelled/fetchBOM',
      payload: {
        functionCode: null,
        poHeaderId: detailId, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
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
   *
   * 修改操作记录可见
   * @memberof deliveryApproved
   * @param {Boolean} flag
   */
  @Bind()
  handleleadTypeVisible(flag, record) {
    this.setState({
      recordList: record,
      leadTypeVisible: !!flag,
    });
  }

  render() {
    const {
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      basicInfoLoading,
      resyncDeliveryOrderLoading,
      cancelDeliveryOrderLoading,
      queryDetailHeaderLoading,
      queryDetailListLoading,
      queryPoItemBOMLoading,
    } = this.props;
    const {
      collapseKeys,
      currentTabKey,
      detailListDataSource,
      pagination,
      detailHeaderInfo = {},
      visible,
      lineVisible,
      leadTypeVisible,
      otherAttachmentUuid, // 采购方uuid查询
      reviewAttachmentUuid, // 采购方uuid复审
      approveAttachmentUuid, // 采购方uuid审批
      selectedRowKeys = [],
      // setting,
      wrapperBOMModalVisible,
      actionListRowData,
      recordList = [],
    } = this.state;
    // const { supplierAttachmentUuid } = detailHeaderInfo;
    const headerInfoProps = {
      customizeForm,
      detailHeaderInfo,
      loading: queryDetailHeaderLoading,
    };
    // const logisticsInfoListProps = {
    //   detailHeaderInfo,
    // };
    const LogisticsDetailProps = {
      headerInfo: detailHeaderInfo,
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
      onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
    };
    const detailListProps = {
      currentTabKey,
      pagination,
      customizeTable,
      dataSource: detailListDataSource,
      loading: queryDetailListLoading,
      onViewLineAttachment: this.openAttachment,
      onSearch: this.fetchDetailList,
      openBOMModal: this.openBOMModal,
      handleleadType: this.handleleadTypeVisible,
      attachmentUuidList: this.attachmentUuidList,
      onGetPicNums: this.fetchDetailList,
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleSelectRows,
        getCheckboxProps: (record) => ({
          disabled:
            record.canCancelByLineFlag === 0 ||
            record.closedFlag === 1 ||
            detailHeaderInfo.cancelSyncStatus === 'FAIL' ||
            record.cancelSyncStatus === 'SUCCESS' ||
            record.cancelSyncStatus === 'IMPORTING',
        }),
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

    const LeadTypePops = {
      recordList,
      visible: leadTypeVisible,
      asnNum: detailHeaderInfo.asnNum,
      importType: 'ASN_CANCEL_SYN_ERP', // 来源送货单取消
      hideModal: () => this.handleleadTypeVisible(false),
      // searchOperationRecord: this.searchOperationRecord,
    };

    return (
      <div className={styles['order-detail']}>
        <Header
          title={intl.get(`${commonViewPrompt}.detailInfo`).d('送货单详情')}
          backPath="/sinv/delivery-cancelled/list"
        >
          {customizeBtnGroup({ code: `SODR.DELIVERY_CANCELLED_DETAIL.BTN` }, [
            <Button
              type="primary"
              icon="close"
              data-name="cancel"
              onClick={this.cancelDeliveryOrder}
              loading={cancelDeliveryOrderLoading || queryDetailHeaderLoading}
            >
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>,
            <Button
              onClick={this.openUploadModal}
              icon="paper-clip"
              data-name="attrment"
              loading={cancelDeliveryOrderLoading || queryDetailHeaderLoading}
            >
              {intl.get('hzero.common.upload.view').d('查看附件')}
            </Button>,
            <Button
              loading={resyncDeliveryOrderLoading || basicInfoLoading || queryDetailHeaderLoading}
              icon="sync"
              data-name="resync"
              disabled={detailHeaderInfo.cancelSyncStatus !== 'FAIL'}
              onClick={this.resyncDeliveryOrder}
            >
              {intl.get(`sinv.common.view.button.resync`).d('重新同步')}
            </Button>,
          ])}
          {/* <UploadModal {...uploadProps} /> */}
        </Header>
        <Content>
          <Spin
            spinning={queryDetailHeaderLoading || false}
            wrapperClassName={classnames(
              styles['purchase-requisition-creation-detail'],
              DETAIL_DEFAULT_CLASSNAME
            )}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`sinv.purchaserDelivery.view.message.title.orderHeaderShip`)
                        .d('发货信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('orderHeaderInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="orderHeaderInfo"
              >
                <HeaderInfo {...headerInfoProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`sinv.purchaserDelivery.view.message.title.headerDispatched`)
                        .d('收货信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('orderHeaderInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderHeaderInfos') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="orderHeaderInfos"
              >
                <ShipHeaderInfo {...headerInfoProps} />
              </Panel>
            </Collapse>
          </Spin>
          <Tabs onTabClick={this.detailTabChange} defaultActiveKey="basicInfo" animated={false}>
            <TabPane
              tab={intl.get(`sinv.common.view.message.title.basicInfo`).d('基本信息')}
              key="basicInfo"
            >
              <DetailList {...detailListProps} />
              {/* <BasicInfoList {...basicInfoListProps} /> */}
            </TabPane>
            <TabPane
              tab={intl.get(`sinv.common.view.message.title.otherInfo`).d('其它信息')}
              key="otherInfo"
            >
              <DetailList {...detailListProps} />
              {/* <OtherInfoList {...otherInfoListProps} /> */}
            </TabPane>
            <TabPane
              tab={intl.get(`sinv.common.view.message.title.logisticsInfo`).d('物流信息')}
              key="logisticsInfo"
            >
              {/* <LogisticsInfoList {...logisticsInfoListProps} /> */}
              <LogisticsDetail {...LogisticsDetailProps} />
            </TabPane>
          </Tabs>
          {visible && <UploadModal {...attachmentProps} />}
          {lineVisible && <LineItemModal {...lineAttachmentProps} />}
          {wrapperBOMModalVisible && <BomModal {...BomModalPops} />}
          {leadTypeVisible && <LeadType {...LeadTypePops} />}
        </Content>
      </div>
    );
  }
}
