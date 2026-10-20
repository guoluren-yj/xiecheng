/*
 * index - 送货单取消详情页
 * @date: 2018/11/12 16:45:50
 * @author: LZH <zhaohuiLiu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Tabs, Collapse, Icon, Spin, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
// import UploadModal from 'components/Upload/index';
import notification from 'utils/notification';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import { createPagination, getEditTableData, getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz';
import styles from './index.less';
import HeaderInfo from './HeaderInfo';
// import LogisticsInfoList from './LogisticsInfoList';
import LogisticsDetail from '../../components/LogisticsDetail';
import LeadType from '../../components/LeadType';
import DetailList from './DetailList';
import UploadModal from './UploadModal';
import LineItemModal from './LineItemModal';
import BomModal from './BOMModal';
import ShipHeaderInfo from './ShipHeaderInfo';

const { TabPane } = Tabs;

// 折叠面板组件初始化
const { Panel } = Collapse;

/**
 * index - 送货单关闭
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [sendOrder={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {!boolean} resyncDeliveryOrderLoading - 重新同步
 * @reactProps {!boolean} closeDeliveryOrderLoading - 关闭送货单
 * @reactProps {!boolean} queryDetailHeaderLoading - 查询头明细
 * @reactProps {!boolean} queryDetailListLoading - 查询行明细
 * @reactProps {!boolean} queryFileListOrgLoading - 查询附件相关
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SODR.DELIVERY_CLOSED_DETAIL.HEADER',
    'SODR.DELIVERY_CLOSED_DETAIL.BASIC',
    'SODR.DELIVERY_CLOSED_DETAIL.OTHER',
    'SODR.DELIVERY_CLOSED_DETAIL.HEADERSHIP',
  ],
})
@connect(({ loading, deliveryClosed }) => ({
  queryDetailHeaderLoading: loading.effects['deliveryClosed/queryDetailHeader'],
  queryDetailListLoading: loading.effects['deliveryClosed/queryDetailList'],
  resyncDeliveryOrderLoading: loading.effects['deliveryClosed/resyncDeliveryOrder'],
  closeDeliveryOrderLoading: loading.effects['deliveryClosed/closeDeliveryOrder'],
  queryFileListOrgLoading: loading.effects['deliveryClosed/queryFileListOrg'],
  queryPoItemBOMLoading: loading.effects['deliveryClosed/fetchBOM'],
  deliveryClosed,
}))
@formatterCollections({
  code: [
    'sinv.common',
    'sinv.deliveryClosed',
    'entity.supplier',
    'entity.item',
    'entity.attachment',
    'entity.customer',
    'sinv.purchaseReception',
  ],
})
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
    } = this.props;
    const detailId = params.id;
    this.state = {
      detailId,
      collapseKeys: ['headerInfo', 'headerInfos'],
      currentTabKey: 'basicInfo',
      actionListRowData: {},
      detailHeaderInfo: {},
      detailListDataSource: [], // 基础信息
      detailOtherListDataSource: [], // 其他信息
      detailListPagination: {},
      visible: false,
      objectVersionNumber: null,
      otherAttachmentUuid: null,
      reviewAttachmentUuid: null,
      approveAttachmentUuid: null,
      wrapperBOMModalVisible: false,
      lineVisible: false,
      selectedRows: [],
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
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader() {
    const { dispatch } = this.props;
    const { detailId } = this.state;
    dispatch({
      type: 'deliveryClosed/queryDetailHeader',
      asnHeaderId: detailId,
      customizeUnitCode:
        'SODR.DELIVERY_CLOSED_DETAIL.HEADER,SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS,SODR.DELIVERY_CLOSED_DETAIL.HEADERSHIP',
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({ detailHeaderInfo: res });
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
      type: 'deliveryClosed/queryDetailList',
      payload: {
        page,
        sort: sorter,
        asnHeaderId: detailId,
        customizeUnitCode: 'SODR.DELIVERY_CLOSED_DETAIL.BASIC,SODR.DELIVERY_CLOSED_DETAIL.OTHER',
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.setState(
          {
            detailListDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
            detailOtherListDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
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
   * onCollapseChange - 折叠面板onChange
   * @param {string} collapseKeys - Panels key
   */
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * detailTabChange - 详情tab页切换
   * @param {string} collapseKeys - Panels key
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
      type: 'deliveryClosed/resyncDeliveryOrder',
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
      if (getResponse(res)) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/sinv/delivery-closed/list`,
          })
        );
      }
    });
  }

  /**
   * 送货单关闭
   * @memberof Detail
   */
  @Bind()
  closeDeliveryOrder() {
    const { validateFields: headerInfoFormValidate = (e) => e } = this.headerInfoForm || {};
    const { validateFields: ShipHeaderInfoFormValidate = (e) => e } = this.ShipHeaderInfoForm || {};
    const {
      detailHeaderInfo,
      selectedRows,
      detailListDataSource,
      detailOtherListDataSource,
      currentTabKey,
    } = this.state;
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
    const originalData = [
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
    const selectedRowKeysList = selectedRows.map((n) => ({ ...n, asnHeaderId }));
    const deliveryList = selectedRows.length > 0;
    const deliveryData = deliveryList ? [...selectedRowKeysList] : originalData;
    const checkLineData = deliveryList ? [...selectedRowKeysList] : detailListDataSource;
    if (isNil(_token)) return;
    headerInfoFormValidate((err, headerValues) => {
      if (!err) {
        ShipHeaderInfoFormValidate((err2, shipHeaderValues) => {
          if (!err2) {
            const arr =
              currentTabKey === 'basicInfo'
                ? getEditTableData(checkLineData)
                : getEditTableData(detailOtherListDataSource);
            if (Array.isArray(arr) && arr.length !== 0) {
              Modal.confirm({
                title: intl.get('sinv.common.model.common.confirmClose').d('是否确认关闭送货单'),
                okText: intl.get('hzero.common.button.sure').d('确定'),
                cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                onOk: () => {
                  const data = {
                    deliveryList, // 老的判断标识
                    ...detailHeaderInfo,
                    ...headerValues,
                    ...shipHeaderValues,
                    ...deliveryData[0],
                    asnLineList: arr,
                  };
                  dispatch({
                    type: 'deliveryClosed/closeDeliveryOrder',
                    payload: {
                      customizeUnitCode:
                        'SODR.DELIVERY_CLOSED_DETAIL.HEADER,SODR.DELIVERY_CLOSED_DETAIL.BASIC,SODR.DELIVERY_CLOSED_DETAIL.OTHER,SODR.DELIVERY_CLOSED_DETAIL.HEADERSHIP',
                      data,
                    },
                  }).then((res) => {
                    if (getResponse(res)) {
                      notification.success();
                      dispatch(
                        routerRedux.push({
                          pathname: `/sinv/delivery-closed/list`,
                        })
                      );
                    }
                  });
                },
              });
            }
          }
        });
      }
    });
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

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ visible: false });
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
      type: 'deliveryClosed/queryFileListOrg',
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
      type: 'deliveryClosed/queryFileListOrg',
      payload,
    });
  }

  @Bind()
  attachmentUuidList(val, record) {
    this.setState({
      lineVisible: true,
      _token: record._token,
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
      type: 'deliveryClosed/removeFile',
      payload,
    });
  }

  @Bind()
  handleSelectRows(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
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
      type: 'deliveryClosed/fetchBOM',
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
    const { detailHeaderInfo } = this.state;
    const {
      customizeForm,
      customizeTable,
      resyncDeliveryOrderLoading,
      closeDeliveryOrderLoading,
      queryDetailListLoading,
      queryDetailHeaderLoading,
      headerInfoLoading,
      queryPoItemBOMLoading,
    } = this.props;
    const {
      collapseKeys,
      currentTabKey,
      detailListDataSource,
      detailOtherListDataSource,
      detailListPagination,
      visible,
      lineVisible,
      leadTypeVisible,
      otherAttachmentUuid, // 采购方uuid查询
      reviewAttachmentUuid, // 采购方uuid复审
      approveAttachmentUuid, // 采购方uuid审批
      wrapperBOMModalVisible,
      actionListRowData,
      selectedRows = [],
      recordList = [],
    } = this.state;
    const selectedRowKeys = selectedRows.map((n) => n.asnLineId);
    const headerInfoProps = {
      customizeForm,
      detailHeaderInfo,
      loading: headerInfoLoading,
      ref: (node) => {
        this.headerInfoForm = node;
      },
    };
    const ShipHeaderInfoProps = {
      customizeForm,
      detailHeaderInfo,
      loading: headerInfoLoading,
      ref: (node) => {
        this.ShipHeaderInfoForm = node;
      },
    };
    const LogisticsDetailProps = {
      headerInfo: detailHeaderInfo,
    };
    const detailListProps = {
      currentTabKey,
      customizeTable,
      dataSource: detailListDataSource,
      pagination: detailListPagination,
      loading: queryDetailListLoading,
      onViewLineAttachment: this.openAttachment,
      onSearch: this.fetchDetailList,
      openBOMModal: this.openBOMModal,
      attachmentUuidList: this.attachmentUuidList,
      onGetPicNums: this.fetchDetailList,
      handleleadType: this.handleleadTypeVisible,
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleSelectRows,
        getCheckboxProps: (record) => ({
          disabled:
            record.canCloseByLineFlag === 0 ||
            record.closedFlag === 1 ||
            record.closeByLineFlag === 0,
        }),
      },
    };

    const detailOtherListProps = {
      currentTabKey,
      customizeTable,
      dataSource: detailOtherListDataSource,
      pagination: detailListPagination,
      loading: queryDetailListLoading,
      onViewLineAttachment: this.openAttachment,
      onSearch: this.fetchDetailList,
      openBOMModal: this.openBOMModal,
      attachmentUuidList: this.attachmentUuidList,
      onGetPicNums: this.fetchDetailList,
      handleleadType: this.handleleadTypeVisible,
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleSelectRows,
        getCheckboxProps: (record) => ({
          disabled:
            record.canCloseByLineFlag === 0 ||
            record.closedFlag === 1 ||
            record.closeByLineFlag === 0,
        }),
      },
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
      importType: 'ASN_CLOSE_SYN_ERP', // 来源送货单关闭
      hideModal: () => this.handleleadTypeVisible(false),
      // searchOperationRecord: this.searchOperationRecord,
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`sinv.common.model.common.deliveryDetail`).d('送货单明细')}
          backPath="/sinv/delivery-closed/list"
        >
          <Button
            icon="close"
            type="primary"
            onClick={this.closeDeliveryOrder}
            loading={
              queryDetailHeaderLoading || closeDeliveryOrderLoading || resyncDeliveryOrderLoading
            }
          >
            {intl.get(`sinv.deliveryClosed.view.button.close`).d('关闭')}
          </Button>
          <Button
            onClick={this.openUploadModal}
            icon="paper-clip"
            loading={
              queryDetailHeaderLoading || closeDeliveryOrderLoading || resyncDeliveryOrderLoading
            }
          >
            {intl.get('hzero.common.upload.view').d('查看附件')}
          </Button>
          <Button
            icon="sync"
            disabled={!(detailHeaderInfo.closeSyncStatus === 'FAIL')}
            loading={
              queryDetailHeaderLoading || closeDeliveryOrderLoading || resyncDeliveryOrderLoading
            }
            onClick={this.resyncDeliveryOrder}
          >
            {intl.get(`sinv.common.view.button.resync`).d('重新同步')}
          </Button>
        </Header>
        <Content className={styles.content}>
          <Spin
            spinning={queryDetailHeaderLoading || resyncDeliveryOrderLoading || false}
            wrapperClassName={DETAIL_DEFAULT_CLASSNAME}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange.bind(this)}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`sinv.common.view.message.title.orderHeaderShipInfo`).d('发货信息')}
                    </h3>
                    <a className="expand-button">
                      {collapseKeys.includes('headerInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                      {<Icon type={collapseKeys.includes('headerInfo') ? 'up' : 'down'} />}
                    </a>
                  </Fragment>
                }
                key="headerInfo"
              >
                <HeaderInfo {...headerInfoProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`sinv.common.view.message.title.orderHeaderDispatchedInfo`)
                        .d('收货信息')}
                    </h3>
                    <a className="expand-button">
                      {collapseKeys.includes('headerInfos')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                      {<Icon type={collapseKeys.includes('headerInfos') ? 'up' : 'down'} />}
                    </a>
                  </Fragment>
                }
                key="headerInfos"
              >
                <ShipHeaderInfo {...ShipHeaderInfoProps} />
              </Panel>
            </Collapse>
            <Tabs onTabClick={this.detailTabChange} defaultActiveKey="basicInfo" animated={false}>
              <TabPane
                tab={intl.get(`sinv.common.view.message.title.basicInfo`).d('基本信息')}
                key="basicInfo"
              >
                <DetailList {...detailListProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`sinv.common.view.message.title.otherInfo`).d('其它信息')}
                key="otherInfo"
                forceRender
              >
                <DetailList {...detailOtherListProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`sinv.common.view.message.title.logisticsInfo`).d('物流信息')}
                key="logisticsInfo"
              >
                {/* <LogisticsInfoList {...logisticsInfoListProps} /> */}
                <LogisticsDetail {...LogisticsDetailProps} />
              </TabPane>
            </Tabs>
          </Spin>
          {visible && <UploadModal {...attachmentProps} />}
          {lineVisible && <LineItemModal {...lineAttachmentProps} />}
          {wrapperBOMModalVisible && <BomModal {...BomModalPops} />}
          {leadTypeVisible && <LeadType {...LeadTypePops} />}
        </Content>
      </Fragment>
    );
  }
}
