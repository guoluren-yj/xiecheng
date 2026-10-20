/**
 * index - 订单发布明细页面
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Spin, Collapse, Icon, Modal, Form } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty, throttle } from 'lodash';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { formatAumont, queryCommonDoubleUomConfig } from '@/routes/components/utils';
import OrderHeaderForm from './OrderHeaderForm';
import OperationRecord from './OperationRecord';
import WrapperBOMModal from './BOMModal';
import List from './List';
import DeliveryInformationHeader from './DeliveryInformationHeader';
import BillingInformation from './BillingInformation';
import AssociatedInvoice from './AssociatedInvoice';
import {
  BUCKET_NAME,
  THROTTLE_TIME,
  PURCHASER_EXTERNAL_DIRECTORY,
} from '@/routes/components/utils/constant';
import styles from './index.less';
import arrow from '@/assets/connect.svg';

// 折叠面板组件初始化
const { Panel } = Collapse;
/**
 * Detail - 业务组件 - 订单发布
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [sendOrder={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {!boolean} queryPoItemBOMLoading - 查询BOM
 * @reactProps {!boolean} queryDetailHeaderLoading - 查询头明细
 * @reactProps {!boolean} sendMessageLoading - 发送留言
 * @reactProps {!boolean} queryMessageLoading - 查询留言
 * @reactProps {!boolean} queryPartnersLoading - 查询合作伙伴
 * @reactProps {!boolean} queryDetailListLoading - 查询行明细
 * @reactProps {!boolean} fetchOperationRecordListLoading -查询操作记录
 * @reactProps {!boolean} queryFileListOrgLoading - 查询附件相关
 * @reactProps {!boolean} asnLinesLoading - 关联单据-送货单行查询
 * @reactProps {!boolean} rcvRecordsLoading - 关联单据-收货记录查询
 * @reactProps {!boolean} billLinesLoading - 关联单据-对账单查询
 * @reactProps {!boolean} invoiceLinesLoading - 关联单据-网上发票查询
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@connect(({ loading, orderRelease }) => ({
  queryPoItemBOMLoading: loading.effects['orderRelease/newQueryPoItemBOM'],
  queryDetailHeaderLoading: loading.effects['orderRelease/queryDetailHeader'],
  detailPublishLoading: loading.effects['orderRelease/detailPublish'],
  queryPartnersLoading: loading.effects['orderRelease/queryPartners'],
  queryDetailListLoading: loading.effects['orderRelease/queryDetailList'],
  fetchOperationRecordListLoading: loading.effects['orderRelease/fetchOperationRecordList'],
  asnLinesLoading: loading.effects['orderRelease/fetchAsnLines'],
  rcvRecordsLoading: loading.effects['orderRelease/fetchRcvRecords'],
  billLinesLoading: loading.effects['orderRelease/fetchBillLines'],
  oldBillLinesLoading: loading.effects['orderRelease/fetchOldBillLines'],
  invoiceLinesLoading: loading.effects['orderRelease/fetchInvoiceLines'],
  oldInvoiceLinesLoading: loading.effects['orderRelease/fetchOldInvoiceLines'],
  queryFileListOrgLoading: loading.effects['orderRelease/queryFileListOrg'],
  orderRelease,
}))
@formatterCollections({
  code: [
    'sodr.orderRelease',
    'sodr.common',
    'sodr.sendOrder',
    'entity.company',
    'entity.item',
    'entity.attachment',
    'entity.order',
    'item.order',
    'sodr.quotePurchase',
    'sprm.common',
    'sodr.quotePurchaseRequisition',
    'sprm.purchaseReqCreation',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.ORDER_PUBLISH_LINE_LIST.PUBLISH_LINE',
    'SODR.ORDER_PUBLISH_LINE_LIST.HEADER',
    'SODR.ORDER_PUBLISH_LINE_LIST.OTHER',
    'SODR.ORDER_PUBLISH_LINE_LIST.DELIVERY_CATA',
    'SODR.ORDER_PUBLISH_LINE_LIST.TAB',
    'SODR.ORDER_PUBLISH_LINE_LIST.BUTTONS',
  ],
})
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(this.props.location.search.substr(1));
    const { libFlag = '' } = routerParams;

    this.state = {
      orderHeaderFormDataSource: {},
      operationRecordModalVisible: false, // 操作记录模态框
      listCommonDataSource: [],
      listCommonPagination: {},
      listPartnersDataSource: [],
      listPartnersPagination: {},
      wrapperBOMModalVisible: false,
      actionListRowData: {},

      organizationId: getCurrentOrganizationId(),
      collapseKeys: ['orderHeaderInfo'],
      radioGroupValue: 'basic',
      actionListCommonRow: {},
      libFlag, // 页面跳转标识
      associatedConfigFlag: true, // 新旧结算判断flag
    };

    // 方法注册
    [
      'afterOpenHeaderUploadModal',
      'getHeaderAttachmentUuid',
      'fetchDetailHeader',
      'fetchDetailList',
      'fetchPartners',
      'fetchAsnLines',
      'fetchRcvRecords',
      'fetchBillLines',
      'fetchOldBillLines',
      'fetchInvoiceLines',
      'fetchOldInvoiceLines',
      'onRadioGroupChange',
      'setActionListCommonRow',
      'onCollapseChange',
      'amountFinancialPrecision',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { match = {} } = this.props;
    const { params } = match;
    if (isNumber(Number(params.id))) {
      this.fetchDetailHeader();
      this.fetchDetailList();
      this.fetchPartners();
      this.queryDoubleUomConfig();
      this.fetchAssociatedConfigFlag();
      this.fetchEnum();
    }
  }

  /**
   * 查询列表值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({ type: 'orderRelease/init' });
  }

  /**
   * 查询双单位配置
   */
  @Bind()
  async queryDoubleUomConfig() {
    const result = await queryCommonDoubleUomConfig();
    this.setState({
      doubleUnitEnabled: result || 0,
    });
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  fetchDetailHeader() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'orderRelease/queryDetailHeader',
      payload: {
        customizeUnitCode:
          'SODR.ORDER_PUBLISH_LINE_LIST.HEADER,SODR.ORDER_PUBLISH_LINE_LIST.DELIVERY_CATA',
        poHeaderId: params.id,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          orderHeaderFormDataSource: res,
          // attachmentUUID: res.supplierAttachmentUuid,
        });
      }
    });
  }

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} params - 查询条件
   */
  fetchDetailList(queryParams = {}) {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'orderRelease/queryDetailList',
      payload: {
        poHeaderId: params.id,
        ...queryParams,
        customizeUnitCode:
          'SODR.ORDER_PUBLISH_LINE_LIST.PUBLISH_LINE,SODR.ORDER_PUBLISH_LINE_LIST.OTHER',
      },
    }).then((res) => {
      if (res) {
        const { dataSource = [], pagination } = res;
        const listCommonDataSource = dataSource.map((n) => ({
          ...n,
          key: `poHeaderId-${n.poHeaderId}-poLineId-${n.poLineId}-poLineLocationId-${n.poLineLocationId}`,
          _status: 'update',
        }));
        this.setState({
          listCommonDataSource,
          listCommonPagination: pagination,
          actionListCommonRow: listCommonDataSource[0] || {},
        });
      }
    });
  }

  /**
   * fetchPartners - 查询合作伙伴数据
   * @param {object} params - 查询条件
   */
  fetchPartners(queryParams = {}) {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'orderRelease/queryPartners',
      poHeaderId: params.id,
      params: queryParams,
    }).then((res) => {
      if (res) {
        const { dataSource = [], pagination } = res;
        this.setState({
          listPartnersDataSource: dataSource.map((n) => ({
            ...n,
            key: `poHeaderId-${n.poHeaderId}-poLineId-${n.poLineId}-poLineLocationId-${n.poLineLocationId}`,
          })),
          listPartnersPagination: pagination,
        });
      }
    });
  }

  /**
   * fetchMessage - 查询BOM数据
   * @param {object} params - 查询条件
   * @param {function} success - 操作成功回调函数
   */
  fetchBOM(params, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    const { actionListRowData = {} } = this.state;
    const { poLineId } = actionListRowData;
    dispatch({
      type: 'orderRelease/newQueryPoItemBOM',
      params: {
        poHeaderId: match.params.id,
        poLineId,
        page: 0,
        size: 10,
        ...params,
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  openOperationRecord() {
    this.setState({ operationRecordModalVisible: true });
  }

  /**
   * release - 订单发布
   */
  release() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, listCommonDataSource = [] } = this.state;
    const { getFieldValue = (e) => e, getFieldsValue = (e) => e } = this.orderHeaderForm;
    const params = filterNullValueObject(getFieldsValue());
    const data = {
      poHeaderDetailDTO: {
        ...orderHeaderFormDataSource,
        ...params,
        remark: getFieldValue('remark'),
      },
      poLineDetailDTOs: listCommonDataSource
        .filter((n) => n.editedRow)
        .map((n) => {
          const {
            _token,
            poHeaderId,
            poLineId,
            poLineLocationId,
            objectVersionNumber,
            lineVersionNumber,
            locationVersionNumber,
            remark,
          } = n;
          return {
            _token,
            poHeaderId,
            poLineId,
            poLineLocationId,
            objectVersionNumber,
            lineVersionNumber,
            locationVersionNumber,
            remark,
          };
        }),
    };
    Modal.confirm({
      title: intl.get(`sodr.orderRelease.view.message.confirmRelease`).d('是否确认发布订单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: throttle(
        () => {
          dispatch({
            type: 'orderRelease/detailPublish',
            data: [data],
          }).then((res) => {
            if (res) {
              const list = Object.keys(res);
              if (list.length === 0) {
                notification.success();
                dispatch(
                  routerRedux.push({
                    pathname: '/sodr/order-release/list',
                  })
                );
              } else {
                notification.warning({
                  message: `${JSON.stringify(list)}${res[list[0]].desc}`,
                });
              }
            }
          });
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  }

  /**
   * fetchAsnLines - 查询送货单数据
   */
  fetchAsnLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      // 送货单
      type: 'orderRelease/fetchAsnLines',
      deliveryStrategyId: actionListCommonRow.deliveryStrategyId,
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * fetchAsnLines - 查询收货记录数据
   */
  fetchRcvRecords() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      // 收货记录
      type: 'orderRelease/fetchRcvRecords',
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * fetchBillLines - 查询对账单数据
   */
  fetchBillLines() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'orderRelease/fetchBillLines',
      payload: {
        poNumEquals: orderHeaderFormDataSource.displayPoNum,
        poLineNum: actionListCommonRow.displayLineNum,
      },
    });
  }

  /**
   * fetchOldBillLines - 查询老对账单数据
   */
  fetchOldBillLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'orderRelease/fetchOldBillLines',
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * fetchInvoiceLines - 查询网上发票数据
   */
  fetchInvoiceLines() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'orderRelease/fetchInvoiceLines',
      payload: {
        poNumEquals: orderHeaderFormDataSource.displayPoNum,
        poLineNum: actionListCommonRow.displayLineNum,
      },
    });
  }

  /**
   * fetchOldInvoiceLines - 查询网上发票数据
   */
  fetchOldInvoiceLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'orderRelease/fetchOldInvoiceLines',
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  hideOperationRecord() {
    this.setState({ operationRecordModalVisible: false });
  }

  /**
   * assignListDataSource - 合并行数据至数据集合
   * @param {Array} [listCommonDataSource = []] - 数据集合
   */
  assignListDataSource(listCommonDataSource) {
    this.setState({
      listCommonDataSource,
    });
  }

  /**
   * openBOMModal - 打开BOM Modal
   * @param {object} [actionListRowData = {}] - 当前操作行数据
   */
  openBOMModal(actionListRowData) {
    this.setState({
      wrapperBOMModalVisible: true,
      actionListRowData,
    });
  }

  /**
   * closeBOMModal - 关闭BOM Modal 清空当前操作行数据
   */
  closeBOMModal() {
    this.setState({
      wrapperBOMModalVisible: false,
      actionListRowData: {},
    });
  }

  /**
   * onListChange - 列表分页切换
   * @param {string} actionType - tab切换标记
   * @param {object} page - 分页信息
   */
  onListChange(actionType, page) {
    const actionMap = new Map([
      ['common', () => this.fetchDetailList({ page })],
      ['partners', () => this.fetchPartners({ page })],
    ]);
    actionMap.get(actionType)();
  }

  // /**
  //  * onCollapseChange - 折叠面板onChange
  //  * @param {string} collapseKeys - Panels key
  //  */
  // onCollapseChange(collapseKeys) {
  //   this.setState({
  //     collapseKeys,
  //   });
  // }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  setActionListCommonRow(actionListCommonRow) {
    this.setState({
      actionListCommonRow,
    });
  }

  onRadioGroupChange(radioGroupValue) {
    this.setState({
      radioGroupValue,
    });
  }

  // onSearchInvoiceInfo(item) {
  //   const { dispatch } = this.props;
  //   const { organizationId } = this.state;
  //   // debugger;
  //   dispatch({
  //     // 送货单
  //     type: 'orderRelease/fetchAsnLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 收货记录
  //     type: 'orderRelease/fetchRcvRecords',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 对账单
  //     type: 'orderRelease/fetchBillLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 网上发票
  //     type: 'orderRelease/fetchInvoiceLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  // }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  afterOpenHeaderUploadModal(attachmentUuid) {
    const { orderHeaderFormDataSource = {} } = this.state;
    if (isEmpty(orderHeaderFormDataSource.attachmentUuid)) {
      this.getHeaderAttachmentUuid(attachmentUuid);
    }
  }

  /**
   * getHeaderAttachmentUuid - 获取头附件uuid
   * @param {!string} uuid - 附件uuid返回值
   */
  getHeaderAttachmentUuid(attachmentUuid) {
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource: { poHeaderId },
    } = this.state;
    dispatch({
      type: 'orderRelease/saveAttachmentUUID',
      payload: { poHeaderId, uuid: attachmentUuid, uuidType: 1 },
    }).then((res) => {
      if (res) {
        this.fetchDetailHeader();
      }
    });
  }

  /**
   * 调整金额精度
   * @param {string} priceShieldFlag
   * @param {number} amount
   * @param {number} financialPrecision
   */
  amountFinancialPrecision(
    priceShieldFlag,
    amount,
    financialPrecision,
    poSourcePlatform,
    sourceOfTransferOrder
  ) {
    if (priceShieldFlag === 1) {
      return '******';
    } else if (
      poSourcePlatform === 'ERP' ||
      ((poSourcePlatform === 'CATALOGUE' || poSourcePlatform === 'E-COMMERCE') &&
        sourceOfTransferOrder === 'AUTOTRANSFER')
    ) {
      return formatAumont(amount);
    } else {
      return formatAumont(amount, financialPrecision, true);
    }
  }

  /**
   * 获取业务规则定义-【是否启用新结算平台】设置值
   */
  fetchAssociatedConfigFlag() {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderRelease/fetchAssociatedConfigFlag',
    }).then((res) => {
      if (res === 1) {
        this.setState({ associatedConfigFlag: true });
      } else {
        this.setState({ associatedConfigFlag: false });
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
      type: 'orderRelease/queryFileListOrg',
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
      type: 'orderRelease/queryFileListOrg',
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
      type: 'orderRelease/removeFile',
      payload,
    });
  }

  render() {
    const {
      form,
      dispatch,
      match,
      orderRelease,
      customizeForm,
      customizeTable,
      customizeTabPane,
      fetchOperationRecordListLoading,
      queryDetailListLoading,
      queryPartnersLoading,
      detailPublishLoading,
      queryPoItemBOMLoading,
      queryDetailHeaderLoading,
      asnLinesLoading,
      rcvRecordsLoading,
      billLinesLoading,
      oldBillLinesLoading,
      invoiceLinesLoading,
      oldInvoiceLinesLoading,
      queryFileListOrgLoading,
      customizeBtnGroup,
    } = this.props;
    const {
      orderHeaderFormDataSource = {},
      operationRecordModalVisible,
      listCommonDataSource,
      listCommonPagination,
      listPartnersDataSource,
      listPartnersPagination,
      // messageBoardVisible,
      wrapperBOMModalVisible,
      actionListRowData,
      organizationId,
      collapseKeys,
      radioGroupValue,
      actionListCommonRow,
      libFlag,
      doubleUnitEnabled,
      associatedConfigFlag,
    } = this.state;
    const { poSourcePlatform } = orderHeaderFormDataSource;
    const {
      operationRecordPagination,
      operationRecordList,
      detailOperationQuery,
      enumMap,
    } = orderRelease;
    // console.log(enumMap);
    const { itemCode, itemName, key } = actionListRowData;
    const deliveryAndBillProps = {
      customizeForm,
      dataSource: orderHeaderFormDataSource,
    };
    const orderHeaderFormProps = {
      customizeForm,
      ref: (node) => {
        this.orderHeaderForm = node;
      },
      dataSource: orderHeaderFormDataSource,
      amountFinancialPrecision: this.amountFinancialPrecision,
    };

    const operationRecordProps = {
      dispatch,
      match,
      organizationId,
      detailOperationQuery,
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      hideModal: this.hideOperationRecord.bind(this),
    };
    const listProps = {
      onRef: (ref) => {
        this.list = ref;
      },
      form,
      enumMap,
      doubleUnitEnabled,
      headerInfo: orderHeaderFormDataSource,
      customizeTable,
      customizeTabPane,
      processing: { queryDetailListLoading, queryPartnersLoading, detailPublishLoading },
      dataSource: { common: listCommonDataSource, partners: listPartnersDataSource },
      pagination: { common: listCommonPagination, partners: listPartnersPagination },
      assignDataSource: this.assignListDataSource.bind(this),
      openBOMModal: this.openBOMModal.bind(this),
      onChange: this.onListChange.bind(this),
      // onSearch: this.onSearchInvoiceInfo.bind(this),
      onRadioGroupChange: this.onRadioGroupChange,
      radioGroupValue,
      actionListCommonRow,
      poSourcePlatform,
      setActionListCommonRow: this.setActionListCommonRow,
      amountFinancialPrecision: this.amountFinancialPrecision,
    };

    // const messageProps = {
    //   visible: messageBoardVisible,
    //   onCancel: this.closeMessageBoard.bind(this),
    // };

    const wrapperBOMModalProps = {
      visible: wrapperBOMModalVisible,
      onCancel: this.closeBOMModal.bind(this),
      fetchBOM: this.fetchBOM.bind(this),
      actionkey: key,
      processing: queryPoItemBOMLoading,
      itemCode,
      itemName,
    };

    const associatedInvoiceProps = {
      fetchAsnLines: this.fetchAsnLines,
      fetchRcvRecords: this.fetchRcvRecords,
      fetchInvoiceLines: associatedConfigFlag ? this.fetchInvoiceLines : this.fetchOldInvoiceLines,
      fetchBillLines: associatedConfigFlag ? this.fetchBillLines : this.fetchOldBillLines,
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      onRemoveAttachment: this.removeAttachment,
      loading: queryFileListOrgLoading, // 加载状态
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sodr-order',
      // onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
      processing: {
        asnLinesLoading,
        rcvRecordsLoading,
        billLinesLoading: associatedConfigFlag ? billLinesLoading : oldBillLinesLoading,
        invoiceLinesLoading: associatedConfigFlag ? invoiceLinesLoading : oldInvoiceLinesLoading,
      },
      actionListCommonRow,
      associatedConfigFlag,
    };
    const { attachmentUuid } = orderHeaderFormDataSource;
    const { params } = match;
    const poHeaderId = params.id;
    const uploadModalProps = {
      btnText: intl.get(`entity.attachment.upload`).d('附件上传'),
      btnProps: {
        icon: 'upload',
        disabled: !poHeaderId,
      },
      showFilesNumber: true,
      attachmentUUID: attachmentUuid,
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
      afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    };

    return (
      <div className={styles['sodr-order-release-detail']}>
        <Header
          title={intl.get(`sodr.common.view.message.title.detail`).d('订单明细')}
          backPath={libFlag === 'priceLib' ? '' : '/sodr/order-release/list'}
        >
          {customizeBtnGroup({ code: 'SODR.ORDER_PUBLISH_LINE_LIST.BUTTONS' }, [
            libFlag !== 'priceLib' && (
              <Button
                loading={detailPublishLoading || queryDetailHeaderLoading || queryDetailListLoading}
                icon="rocket"
                type="primary"
                onClick={this.release.bind(this)}
                data-name="release"
              >
                {intl.get(`hzero.common.button.release`).d('发布')}
              </Button>
            ),
            libFlag !== 'priceLib' && <UploadModal data-name="upload" {...uploadModalProps} />,

            libFlag !== 'priceLib' && (
              <Button
                data-name="operate"
                icon="clock-circle-o"
                onClick={this.openOperationRecord.bind(this)}
              >
                {intl.get(`sodr.common.view.button.operationRecord`).d('操作记录')}
              </Button>
            ),
          ])}
        </Header>
        <Content>
          <Spin
            spinning={queryDetailHeaderLoading || detailPublishLoading || false}
            wrapperClassName={classnames(DETAIL_DEFAULT_CLASSNAME, styles['association-list'])}
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
                      {intl.get(`sodr.common.view.message.title.orderHeaderInfo`).d('订单头信息')}
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
                <OrderHeaderForm {...orderHeaderFormProps} />
              </Panel>
              {(poSourcePlatform === 'E-COMMERCE' || poSourcePlatform === 'CATALOGUE') && (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl.get(`sodr.common.view.message.title.deliveryInfo`).d('收货/收单信息')}
                      </h3>
                      <a>
                        {collapseKeys.includes('deliveryInformationHeader')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon
                        type={collapseKeys.includes('deliveryInformationHeader') ? 'up' : 'down'}
                      />
                    </Fragment>
                  }
                  key="deliveryInformationHeader"
                >
                  <DeliveryInformationHeader {...deliveryAndBillProps} />
                </Panel>
              )}
              {poSourcePlatform === 'E-COMMERCE' && (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl.get(`sodr.common.view.message.billingInformation`).d('开票信息')}
                      </h3>
                      <a>
                        {collapseKeys.includes('billingInformation')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('billingInformation') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="billingInformation"
                >
                  <BillingInformation {...deliveryAndBillProps} />
                </Panel>
              )}
            </Collapse>
            <div style={{ display: 'flex' }}>
              <div style={{ width: radioGroupValue === 'invoice' ? '41.66%' : '100%' }}>
                <List {...listProps} />
              </div>
              {radioGroupValue === 'invoice' && (
                <div className="right-table">
                  <img src={arrow} alt="" className="arrow" />
                  <div>
                    <AssociatedInvoice {...associatedInvoiceProps} />
                  </div>
                </div>
              )}
            </div>
          </Spin>
        </Content>
        {/* {changedHistoryModalVisible && <ChangedHistory {...changedHistoryProps} />} */}
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        <WrapperBOMModal {...wrapperBOMModalProps} />
      </div>
    );
  }
}
