/**
 * index - 订单审批明细页面
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Spin, Collapse, Icon, Form, Badge, Tag } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isFunction } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import Upload from 'components/Upload';

import { formatAumont, queryCommonDoubleUomConfig } from '@/routes/components/utils';
import Attachment from './Attachment';
import OrderHeaderForm from './OrderHeaderForm';
import OperationRecord from './OperationRecord';
import Message from './Message';
import WrapperBOMModal from './BOMModal';
import List from './List';
import DeliveryInformationHeader from './DeliveryInformationHeader';
import BillingInformation from './BillingInformation';
import AssociatedInvoice from './AssociatedInvoice';
import { BUCKET_NAME, THROTTLE_TIME } from '@/routes/components/utils/constant';
import styles from './index.less';
import arrow from '@/assets/connect.svg';

// 折叠面板组件初始化
const { Panel } = Collapse;

// 设置sodr国际化前缀 - button
const viewButtonPrompt = 'sodr.orderApproval.view.button';
// 设置sodr国际化前缀 - message
const viewMessagePrompt = 'sodr.orderApproval.view.message';

/**
 * 业务组件 - 订单审批
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [sendOrder={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {!boolean} detailApproveLoading - 订单审批通过,
 * @reactProps {!boolean} detailRejectLoading - 订单审批拒绝,
 * @reactProps {!boolean} queryPoItemBOMLoading - 查询BOM
 * @reactProps {!boolean} queryDetailHeaderLoading - 查询头明细
 * @reactProps {!boolean} sendMessageLoading - 发送留言
 * @reactProps {!boolean} queryMessageLoading - 查询留言
 * @reactProps {!boolean} queryPartnersLoading - 查询合作伙伴
 * @reactProps {!boolean} queryDetailListLoading - 查询行明细
 * @reactProps {!boolean} fetchOperationRecordListLoading -查询操作记录
 * @reactProps {!boolean} queryFileListOrgLoading - 查询附件相关
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, orderEvaluation }) => ({
  detailApproveLoading: loading.effects['orderEvaluation/detailApprove'],
  detailRejectLoading: loading.effects['orderEvaluation/detailReject'],
  queryPoItemBOMLoading: loading.effects['orderEvaluation/newQueryPoItemBOM'],
  queryDetailHeaderLoading: loading.effects['orderEvaluation/queryDetailHeader'],
  queryPartnersLoading: loading.effects['orderEvaluation/queryPartners'],
  queryDetailListLoading: loading.effects['orderEvaluation/queryDetailList'],
  queryFileListOrgLoading: loading.effects['orderEvaluation/queryFileListOrg'],
  fetchOperationRecordListLoading: loading.effects['orderEvaluation/fetchOperationRecordList'],
  asnLinesLoading: loading.effects['orderEvaluation/fetchAsnLines'],
  rcvRecordsLoading: loading.effects['orderEvaluation/fetchRcvRecords'],
  billLinesLoading: loading.effects['orderEvaluation/fetchBillLines'],
  oldBillLinesLoading: loading.effects['orderEvaluation/fetchOldBillLines'],
  invoiceLinesLoading: loading.effects['orderEvaluation/fetchInvoiceLines'],
  oldInvoiceLinesLoading: loading.effects['orderEvaluation/fetchOldInvoiceLines'],
  submitEvaluationLoading: loading.effects['orderEvaluation/submitEvaluation'],
  queryMessageLoading: loading.effects['orderEvaluation/queryMessage'],
  sendMessageLoading: loading.effects['orderEvaluation/sendMessage'],
  orderEvaluation,
}))
@formatterCollections({
  code: [
    'sodr.orderApproval',
    'sodr.sendOrder',
    'sodr.common',
    'entity.company',
    'entity.order',
    'item.order',
    'entity.item',
    'entity.attachment',
    'sodr.orderEvaluation',
    'sodr.quotePurchase',
  ],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SODR.ORDER_EVALUATE_DETAIL.LINE_BASIC',
    'SODR.ORDER_EVALUATE_DETAIL.LINE_OTHER',
    'SODR.ORDER_EVALUATE_DETAIL.HEADER',
    'SODR.ORDER_EVALUATE_DETAIL.DELIVERY_CATA',
    'SODR.ORDER_EVALUATE_DETAIL.TAB',
    'SODR.ORDER_EVALUATE_DETAIL.PARTNERS',
    'SODR.ORDER_EVALUATE_DETAIL.EVALUATE',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderHeaderFormDataSource: {},
      operationRecordModalVisible: false, // 操作记录模态框
      listCommonDataSource: [], // 基本信息/其他信息数据源
      listCommonPagination: {}, // 基本信息/其他信息分页
      listPartnersDataSource: [], // 合作伙伴数据源
      listPartnersPagination: {}, // 合作伙伴分页
      messageBoardVisible: false, // 留言板状态
      wrapperBOMModalVisible: false, // BOM状态
      actionListRowData: {},
      flag: false, // 头查询状态
      unreadCount: 0,
      organizationId: getCurrentOrganizationId(),
      collapseKeys: ['orderHeaderInfo'],
      radioGroupValue: 'basic',
      actionListCommonRow: {},
      associatedConfigFlag: true, // 新旧结算判断flag
      doubleUnitEnabled: 0,
    };

    // 方法注册
    [
      'fetchDetailHeader',
      'fetchDetailList',
      'fetchPartners',
      'fetchAsnLines',
      'fetchRcvRecords',
      'fetchBillLines',
      'fetchOldBillLines',
      'fetchMessage',
      'sendMessage',
      'fetchInvoiceLines',
      'fetchOldInvoiceLines',
      'onRadioGroupChange',
      'setActionListCommonRow',
      'attchmentAendMessage',
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
    }
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

  componentDidUpdate(prevProps) {
    const { match = {} } = this.props;
    const { params } = match;
    if (prevProps.match.params.id !== params.id) {
      if (isNumber(Number(params.id))) {
        this.fetchDetailHeader();
        this.fetchDetailList();
        this.fetchPartners();
      }
    }
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  fetchDetailHeader() {
    const { dispatch = (e) => e, match = {} } = this.props;
    const { params = {} } = match;
    dispatch({
      type: 'orderEvaluation/queryDetailHeader',
      payload: {
        poHeaderId: params.id,
        customizeUnitCode:
          'SODR.ORDER_EVALUATE_DETAIL.HEADER,SODR.ORDER_EVALUATE_DETAIL.DELIVERY_CATA',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          orderHeaderFormDataSource: res,
          unreadCount: res.unreadCount,
          flag: true,
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
      type: 'orderEvaluation/queryDetailList',
      payload: {
        poHeaderId: params.id,
        ...queryParams,
        customizeUnitCode:
          'SODR.ORDER_EVALUATE_DETAIL.LINE_BASIC,SODR.ORDER_EVALUATE_DETAIL.LINE_OTHER',
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
    const { params = {} } = match;
    dispatch({
      type: 'orderEvaluation/queryPartners',
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
  fetchBOM(params = {}, success = (e) => e) {
    const { dispatch = (e) => e, match = {} } = this.props;
    const { actionListRowData = {} } = this.state;
    const { poLineId } = actionListRowData;
    dispatch({
      type: 'orderEvaluation/newQueryPoItemBOM',
      params: {
        poHeaderId: match?.params?.id,
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
   * fetchAsnLines - 查询送货单数据
   */
  fetchAsnLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      // 送货单
      type: 'orderEvaluation/fetchAsnLines',
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
      type: 'orderEvaluation/fetchRcvRecords',
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
      type: 'orderEvaluation/fetchBillLines',
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
      type: 'orderEvaluation/fetchOldBillLines',
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
      type: 'orderEvaluation/fetchInvoiceLines',
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
      type: 'orderEvaluation/fetchOldInvoiceLines',
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
   * openMessageBoard - 打开留言板 并获取数据
   */
  openMessageBoard() {
    this.setState(
      {
        messageBoardVisible: true,
        unreadCount: 0,
      },
      () => {
        if (isFunction(this.updateMessage)) {
          this.updateMessage({}, true);
        }
      }
    );
  }

  /**
   * closeMessageBoard - 关闭留言板
   */
  closeMessageBoard() {
    this.setState({
      messageBoardVisible: false,
    });
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
  //     type: 'orderEvaluation/fetchAsnLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 收货记录
  //     type: 'orderEvaluation/fetchRcvRecords',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 对账单
  //     type: 'orderEvaluation/fetchBillLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 网上发票
  //     type: 'orderEvaluation/fetchInvoiceLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  // }

  // 提交评价
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleEvaluate() {
    const { form, dispatch } = this.props;
    const { radioGroupValue, orderHeaderFormDataSource = {} } = this.state;
    const { poHeaderId, supplierTenantId } = orderHeaderFormDataSource;
    const submitEvaluation = () => {
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          dispatch({
            type: 'orderEvaluation/submitEvaluation',
            payload: {
              poHeaderId,
              supplierTenantId,
              ...values,
              customizeUnitCode: 'SODR.ORDER_EVALUATE_DETAIL.EVALUATE',
            },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: '/sodr/order-evaluation/list',
                })
              );
            }
          });
        }
      });
    };
    if (!form.getFieldValue('poScore') && radioGroupValue !== 'evaluation') {
      this.setState({ radioGroupValue: 'evaluation' }, () => {
        submitEvaluation();
      });
    } else {
      submitEvaluation();
    }
  }

  @Bind()
  handleAttachment(flag) {
    this.setState({
      visible: flag,
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
      type: 'orderEvaluation/queryFileListOrg',
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
      type: 'orderEvaluation/queryFileListOrg',
      payload,
    });
  }

  /**
   * fetchUuidBindHeader - 首次加载附件组件时判断该头是否有Uuid，没有就去请求一个并绑定
   */
  @Bind()
  fetchUuidBindHeader() {
    const {
      orderHeaderFormDataSource: { attachmentUuid = undefined },
    } = this.state;
    if (!attachmentUuid) {
      // 后台传过来的attachmentUuid不存在 则 新获取 uuid
      this.fetchUUID();
    }
  }

  /**
   * 获取UUID  并将获得的uuid存入数据库
   */
  @Bind()
  fetchUUID() {
    const { dispatch, match = {} } = this.props;
    const { params = {} } = match;
    dispatch({
      type: 'orderEvaluation/getAttachmentuuid',
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'orderEvaluation/saveAttachmentUUID',
          payload: { poHeaderId: params.id, uuid: res.content, uuidType: 1 },
        }).then((result) => {
          if (result) {
            this.fetchDetailHeader();
          }
        });
      }
    });
  }

  /**
   * fetchMessage - 查询留言板数据
   * @param {object} params - 查询条件
   * @param {function} success - 操作成功回调函数
   */
  fetchMessage(params, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'orderEvaluation/queryMessage',
      params: {
        poHeaderId: match?.params?.id,
        ...params,
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * sendMessage - 发送留言
   * @param {string} message - 留言数据
   * @param {function} success - 操作成功回调函数
   */
  sendMessage(message, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'orderEvaluation/sendMessage',
      data: {
        poHeaderId: match?.params?.id,
        message,
        userCampCode: 'PURCHASE',
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * attchmentAendMessage - 发送附件
   * @param {string} message - 附件名
   * @param {string} url - 附件url
   * @param {function} success - 操作成功回调函数
   */
  attchmentAendMessage(message, url, uuid, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'orderEvaluation/sendMessage',
      data: {
        message,
        poHeaderId: match?.params?.id,
        attachmentName: message,
        attachmentUrl: url,
        attachmentUuid: uuid,
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * 调整金额精度
   * @param {string} priceShieldFlag
   * @param {number} amount
   * @param {number} financialPrecision
   */
  @Bind()
  amountFinancialPrecision(priceShieldFlag, amount, financialPrecision, poSourcePlatform) {
    if (priceShieldFlag === 1) {
      return '******';
    } else if (poSourcePlatform === 'ERP') {
      return formatAumont(amount);
    } else {
      return formatAumont(amount, financialPrecision, true);
    }
  }

  /**
   * 获取业务规则定义-【是否启用新结算平台】设置值
   */
  @Bind()
  fetchAssociatedConfigFlag() {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderEvaluation/fetchAssociatedConfigFlag',
    }).then((res) => {
      if (res === 1) {
        this.setState({ associatedConfigFlag: true });
      } else {
        this.setState({ associatedConfigFlag: false });
      }
    });
  }

  render() {
    const {
      form,
      dispatch,
      match,
      customizeForm,
      customizeTable,
      customizeTabPane,
      orderEvaluation,
      queryFileListOrgLoading,
      fetchOperationRecordListLoading,
      queryDetailListLoading,
      queryPartnersLoading,
      queryPoItemBOMLoading,
      queryDetailHeaderLoading,
      queryMessageLoading,
      sendMessageLoading,
      asnLinesLoading,
      rcvRecordsLoading,
      billLinesLoading,
      oldBillLinesLoading,
      invoiceLinesLoading,
      oldInvoiceLinesLoading,
      submitEvaluationLoading,
    } = this.props;
    const {
      flag,
      visible,
      orderHeaderFormDataSource = {},
      operationRecordModalVisible,
      listCommonDataSource,
      listCommonPagination,
      listPartnersDataSource,
      listPartnersPagination,
      messageBoardVisible,
      wrapperBOMModalVisible,
      actionListRowData,
      organizationId,
      collapseKeys = [],
      radioGroupValue,
      actionListCommonRow,
      unreadCount,
      doubleUnitEnabled,
      associatedConfigFlag,
    } = this.state;
    const {
      poSourcePlatform,
      attachmentUuid,
      supplierAttachmentUuid,
      filesNumber,
    } = orderHeaderFormDataSource;
    const {
      operationRecordPagination,
      operationRecordList,
      detailOperationQuery,
    } = orderEvaluation;
    const { itemCode, itemName, key } = actionListRowData;

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
      form,
      customizeTable,
      customizeTabPane,
      customizeForm,
      processing: { queryDetailListLoading, queryPartnersLoading },
      dataSource: { common: listCommonDataSource, partners: listPartnersDataSource },
      pagination: { common: listCommonPagination, partners: listPartnersPagination },
      assignDataSource: this.assignListDataSource.bind(this),
      openBOMModal: this.openBOMModal.bind(this),
      onChange: this.onListChange.bind(this),
      // onSearch: this.onSearchInvoiceInfo.bind(this),
      onRadioGroupChange: this.onRadioGroupChange,
      radioGroupValue,
      doubleUnitEnabled,
      actionListCommonRow,
      setActionListCommonRow: this.setActionListCommonRow,
      path: match.path,
      amountFinancialPrecision: this.amountFinancialPrecision,
      headerInfo: orderHeaderFormDataSource,
    };

    const messageProps = {
      visible: messageBoardVisible,
      attchmentAendMessage: this.attchmentAendMessage.bind(this),
      onCancel: this.closeMessageBoard.bind(this),
      fetchMessage: this.fetchMessage,
      sendMessage: this.sendMessage,
      onRef: (node) => {
        this.updateMessage = node;
      },
      processing: { queryMessageLoading, sendMessageLoading },
    };

    const deliveryAndBillProps = {
      customizeForm,
      dataSource: orderHeaderFormDataSource,
    };
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
      processing: {
        asnLinesLoading,
        rcvRecordsLoading,
        billLinesLoading: associatedConfigFlag ? billLinesLoading : oldBillLinesLoading,
        invoiceLinesLoading: associatedConfigFlag ? invoiceLinesLoading : oldInvoiceLinesLoading,
      },
      actionListCommonRow,
      associatedConfigFlag,
    };

    const uploadProps = {
      viewOnly: true,
      hideAttachment: () => this.handleAttachment(false),
      attachmentUUID: attachmentUuid, // 采购方uuid
      supplierAttachmentId: supplierAttachmentUuid, // 供应商uuid
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      // onRemoveAttachment: this.removeAttachment,
      loading: queryFileListOrgLoading, // 加载状态
      bucketName: BUCKET_NAME,
      // bucketDirectory: 'sodr-order',
      showFilesNumber: true,
      onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
    };

    return (
      <div className={styles['sodr-order-approval-detail']}>
        <Header
          title={intl.get(`${viewMessagePrompt}.titleDetail`).d('订单明细')}
          backPath="/sodr/order-evaluation/list"
        >
          <Button
            loading={submitEvaluationLoading || queryDetailListLoading || queryDetailHeaderLoading}
            onClick={this.handleEvaluate}
            type="primary"
          >
            {intl.get(`sodr.common.view.button.submitEvaluation`).d('提交评价')}
          </Button>
          <Button onClick={() => this.handleAttachment(true)} disabled={!flag} icon="paper-clip">
            {intl.get('entity.attachment.tag').d('附件')}
            {!!filesNumber && parseInt(filesNumber, 10) !== 0 && (
              <Tag
                color="#108ee9"
                style={{
                  height: 'auto',
                  lineHeight: '15px',
                  marginLeft: '4px',
                }}
              >
                {filesNumber}
              </Tag>
            )}
          </Button>
          {visible && <Attachment {...uploadProps} />}
          <Button icon="clock-circle-o" onClick={this.openOperationRecord.bind(this)}>
            {intl.get(`${viewButtonPrompt}.operationRecord`).d('操作记录')}
          </Button>
          <Badge count={unreadCount || 0} overflowCount={99}>
            <Button icon="message" onClick={this.openMessageBoard.bind(this)}>
              {intl.get(`${viewButtonPrompt}.messageBoard`).d('留言板')}
            </Button>
          </Badge>
        </Header>
        <Content>
          <Spin
            spinning={queryDetailHeaderLoading || false}
            wrapperClassName={DETAIL_DEFAULT_CLASSNAME}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={['orderHeaderInfo']}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`${viewMessagePrompt}.orderHeaderInfo`).d('订单头信息')}</h3>
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
                        {intl.get(`${viewMessagePrompt}.receivingInformation`).d('收货/收单信息')}
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
                      <h3>{intl.get(`${viewMessagePrompt}.billingInformation`).d('开票信息')}</h3>
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
        <Message {...messageProps} />
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        <WrapperBOMModal {...wrapperBOMModalProps} />
      </div>
    );
  }
}
