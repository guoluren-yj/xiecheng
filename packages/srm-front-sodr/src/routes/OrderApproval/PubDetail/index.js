/**
 * index - 订单审批明细页面
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Spin, Collapse, Icon, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';

import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import { formatAumont } from '@/routes/components/utils';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import OrderHeaderForm from './OrderHeaderForm';
import OperationRecord from './OperationRecord';
import Message from './Message';
import WrapperBOMModal from './BOMModal';
import List from './List';
import DeliveryInformationHeader from './DeliveryInformationHeader';
import BillingInformation from './BillingInformation';
import AssociatedInvoice from './AssociatedInvoice';
import {
  BUCKET_NAME,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
} from '@/routes/components/utils/constant';
import styles from './index.less';
import arrow from '@/assets/connect.svg';
// import Attachment from './Attachment';

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
@connect(({ loading, orderApproval }) => ({
  detailApproveLoading: loading.effects['orderApproval/detailApprove'],
  detailRejectLoading: loading.effects['orderApproval/detailReject'],
  queryPoItemBOMLoading: loading.effects['orderApproval/queryPoItemBOM'],
  queryDetailHeaderLoading: loading.effects['orderApproval/queryDetailHeader'],
  queryPartnersLoading: loading.effects['orderApproval/queryPartners'],
  queryDetailListLoading: loading.effects['orderApproval/queryDetailList'],
  fetchOperationRecordListLoading: loading.effects['orderApproval/fetchOperationRecordList'],
  asnLinesLoading: loading.effects['orderApproval/fetchAsnLines'],
  rcvRecordsLoading: loading.effects['orderApproval/fetchRcvRecords'],
  billLinesLoading: loading.effects['orderApproval/fetchBillLines'],
  oldBillLinesLoading: loading.effects['orderApproval/fetchOldBillLines'],
  invoiceLinesLoading: loading.effects['orderApproval/fetchInvoiceLines'],
  oldInvoiceLinesLoading: loading.effects['orderApproval/fetchOldInvoiceLines'],
  queryFileListOrgLoading: loading.effects['orderApproval/queryFileListOrg'],
  printing: loading.effects['orderApproval/print'],
  orderApproval,
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
    'sodr.quotePurchase',
    'sprm.common',
    'sodr.quotePurchaseRequisition',
    'entity.attachment',
    'sprm.purchaseReqCreation',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.ORDER_APPROVE_LINE_LIST.APPROVE',
    'SODR.ORDER_APPROVE_LINE_LIST.HEADER',
    'SODR.ORDER_APPROVE_LINE_LIST.OTHER',
    'SODR.ORDER_APPROVE_LINE_LIST.DELIVERY_CATA',
    'SODR.ORDER_APPROVE_LINE_LIST.TAB',
    'SODR.ORDER_APPROVE_LINE_LIST.BUTTONS',
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
      organizationId: getCurrentOrganizationId(),
      collapseKeys: ['orderHeaderInfo'],
      radioGroupValue: 'basic',
      actionListCommonRow: {},
      associatedConfigFlag: true, // 新旧结算判断flag
      validId: null,
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
      'fetchInvoiceLines',
      'fetchOldInvoiceLines',
      'onRadioGroupChange',
      'setActionListCommonRow',
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
    this.fetchEnum();
    if (isNumber(Number(params.poHeaderId))) {
      this.fetchDetailHeader();
      this.fetchDetailList();
      this.fetchPartners();
      this.fetchAssociatedConfigFlag();
    }
  }

  componentDidUpdate(prevProps) {
    const { match = {} } = this.props;
    const { params } = match;
    if (prevProps.match.params.poHeaderId !== params.poHeaderId) {
      if (isNumber(Number(params.poHeaderId))) {
        this.fetchDetailHeader();
        this.fetchDetailList();
        this.fetchPartners();
      }
    }
  }

  /**
   * 查询列表值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({ type: 'orderApproval/fetchEnum' });
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  fetchDetailHeader() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'orderApproval/queryDetailHeader',
      payload: {
        poEntryPoint: 'PURCHASE_APPROVAL_DETAIL',
        customizeUnitCode:
          'SODR.ORDER_APPROVE_LINE_LIST.HEADER,SODR.ORDER_APPROVE_LINE_LIST.DELIVERY_CATA',
        poHeaderId: params.poHeaderId,
      },
    }).then((res) => {
      if (res) {
        const { poHeaderId, statusCode } = res;
        const validId =
          poHeaderId &&
          statusCode &&
          ['SUBMITTED', 'CANCELING', 'CLOSEING', 'SUBMITTED_WFL'].includes(statusCode);
        this.setState({
          validId,
          orderHeaderFormDataSource: res,
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
    const changeParams = { poEntryPoint: 'PURCHASE_APPROVAL_DETAIL' };
    dispatch({
      type: 'orderApproval/queryDetailList',
      payload: {
        poHeaderId: params.poHeaderId,
        ...changeParams,
        ...queryParams,
        customizeUnitCode:
          'SODR.ORDER_APPROVE_LINE_LIST.APPROVE,SODR.ORDER_APPROVE_LINE_LIST.OTHER',
      },
    }).then((res) => {
      if (res) {
        const { dataSource = [], pagination } = res;
        const listCommonDataSource = dataSource.map((n) => ({
          ...n,
          key: `poHeaderId-${n.poHeaderId}-poLineId-${n.poLineId}-poLineLocationId-${n.poLineLocationId}`,
          _status: 'update',
          // unitPrice: this.numberInt(n.unitPrice),
          // enteredTaxIncludedPrice: this.numberInt(n.enteredTaxIncludedPrice),
        }));
        this.setState({
          listCommonDataSource,
          listCommonPagination: pagination,
          actionListCommonRow: listCommonDataSource[0] || {},
        });
      }
    });
  }

  // // 修改显示科学计数法的问题
  // @Bind()
  // numberInt(nums) {
  //   const m = nums.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  //   return nums.toFixed(Math.max(0, (m[1] || '').length - m[2]));
  // }

  /**
   * fetchPartners - 查询合作伙伴数据
   * @param {object} params - 查询条件
   */
  fetchPartners(queryParams = {}) {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'orderApproval/queryPartners',
      poHeaderId: params.poHeaderId,
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
    const { poLineId, poLineLocationId } = actionListRowData;
    dispatch({
      type: 'orderApproval/queryPoItemBOM',
      params: {
        poHeaderId: match.params.poHeaderId,
        poLineId,
        poLineLocationId,
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
   * reject - 审批拒绝
   */
  reject() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, listCommonDataSource = [] } = this.state;
    const { getFieldValue = (e) => e } = this.orderHeaderForm;
    const lines = getEditTableData(listCommonDataSource, ['_status']);
    const data = {
      poHeaderDetailDTO: {
        poHeaderId: orderHeaderFormDataSource.poHeaderId,
        objectVersionNumber: orderHeaderFormDataSource.objectVersionNumber,
        remark: getFieldValue('remark'),
        statusCode: orderHeaderFormDataSource.statusCode,
        versionNum: orderHeaderFormDataSource.versionNum,
        _token: orderHeaderFormDataSource._token,
      },
      poLineDetailDTOs: lines.map((n) => {
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
      title: intl.get(`sodr.orderApproval.view.message.confirmReject`).d('是否确认审批拒绝订单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'orderApproval/detailReject',
          data: [data],
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: '/sodr/order-approval/list',
              })
            );
          }
        });
      },
    });
  }

  /**
   * reject - 审批通过
   */
  approve() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, listCommonDataSource = [] } = this.state;
    const { getFieldValue = (e) => e } = this.orderHeaderForm;
    const lines = getEditTableData(listCommonDataSource, ['_status']);
    const { sourceCode, poSourcePlatform } = orderHeaderFormDataSource;
    const data = {
      poHeaderDetailDTO: {
        ...orderHeaderFormDataSource,
        sourceCode,
        poSourcePlatform,
        poHeaderId: orderHeaderFormDataSource.poHeaderId,
        objectVersionNumber: orderHeaderFormDataSource.objectVersionNumber,
        remark: getFieldValue('remark'),
        statusCode: orderHeaderFormDataSource.statusCode,
        versionNum: orderHeaderFormDataSource.versionNum,
        _token: orderHeaderFormDataSource._token,
      },
      poLineDetailDTOs: lines.map((n) => {
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
      title: intl.get(`sodr.orderApproval.view.message.confirmAgree`).d('是否确认审批通过订单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'orderApproval/detailApprove',
          data: [data],
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: '/sodr/order-approval/list',
              })
            );
          }
        });
      },
    });
  }

  /**
   * fetchAsnLines - 查询送货单数据
   */
  fetchAsnLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return actionListCommonRow.poLineLocationId
      ? dispatch({
          // 送货单
          type: 'orderApproval/fetchAsnLines',
          poLineLocationId: actionListCommonRow.poLineLocationId,
        })
      : Promise.reject();
  }

  /**
   * fetchAsnLines - 查询收货记录数据
   */
  fetchRcvRecords() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return actionListCommonRow.poLineLocationId
      ? dispatch({
          // 收货记录
          type: 'orderApproval/fetchRcvRecords',
          poLineLocationId: actionListCommonRow.poLineLocationId,
        })
      : Promise.reject();
  }

  /**
   * fetchBillLines - 查询对账单数据
   */
  fetchBillLines() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'orderApproval/fetchBillLines',
      payload: {
        poNum: orderHeaderFormDataSource.displayPoNum,
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
    return actionListCommonRow.poLineLocationId
      ? dispatch({
          type: 'orderApproval/fetchOldBillLines',
          poLineLocationId: actionListCommonRow.poLineLocationId,
        })
      : Promise.reject();
  }

  /**
   * fetchInvoiceLines - 查询网上发票数据f
   */
  fetchInvoiceLines() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'orderApproval/fetchInvoiceLines',
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
    return actionListCommonRow.poLineLocationId
      ? dispatch({
          type: 'orderApproval/fetchOldInvoiceLines',
          poLineLocationId: actionListCommonRow.poLineLocationId,
        })
      : Promise.reject();
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
    this.setState({
      messageBoardVisible: true,
    });
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
  //     type: 'orderApproval/fetchAsnLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 收货记录
  //     type: 'orderApproval/fetchRcvRecords',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 对账单
  //     type: 'orderApproval/fetchBillLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 网上发票
  //     type: 'orderApproval/fetchInvoiceLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  // }

  /**
   * 调整金额精度
   * @param {string} priceShieldFlag
   * @param {number} amount
   * @param {number} financialPrecision
   */
  @Bind()
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
      return amount;
    } else {
      return formatAumont(amount, financialPrecision, true);
    }
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
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
  @Bind()
  getHeaderAttachmentUuid(attachmentUuid) {
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource: { poHeaderId },
    } = this.state;
    dispatch({
      type: 'orderApproval/saveAttachmentUUID',
      payload: { poHeaderId, uuid: attachmentUuid, uuidType: 1 },
    }).then((res) => {
      if (res) {
        this.fetchDetailHeader(true);
      }
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModalLoad(getHeaderAttachmentUuidLoad) {
    const { orderHeaderFormDataSource = {} } = this.state;
    if (isEmpty(orderHeaderFormDataSource.getHeaderAttachmentUuidLoad)) {
      this.getHeaderAttachmentUuidLoad(getHeaderAttachmentUuidLoad);
    }
  }

  /**
   * getHeaderAttachmentUuidLoad - 获取头附件uuid
   * @param {!string} uuid - 附件uuid返回值
   */
  @Bind()
  getHeaderAttachmentUuidLoad(getHeaderAttachmentUuidLoad) {
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource: { poHeaderId },
    } = this.state;
    dispatch({
      type: 'orderApproval/saveAttachmentUUID',
      payload: { poHeaderId, uuid: getHeaderAttachmentUuidLoad, uuidType: 3 },
    }).then((res) => {
      if (res) {
        this.fetchDetailHeader(true);
      }
    });
  }

  // @Bind()
  // openUploadModal() {
  //   this.setState({ visible: true });
  // }

  /**
   * hideAttachment - 关闭附件弹窗
   */
  // @Bind()
  // hideAttachment() {
  //   this.setState({ visible: false });
  // }

  /**
   * 查询采购方附件列表
   * @param {Object} payload
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  @Bind()
  fetchPurchaserAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'orderApproval/queryFileListOrg',
      payload,
    });
  }

  /**
   * 查询供应商附件列表
   * @param {Object} payload
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  @Bind()
  fetchSupplierAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'orderApproval/queryFileListOrg',
      payload,
    });
  }

  /**
   * 删除附件
   * @param {Object} payload
   * @param {string} payload.bucketName 桶名
   * @param {string} payload.urls 要删除附件的url
   * @returns Promise
   */
  @Bind()
  removeAttachment(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'orderApproval/removeFile',
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
    const { params } = match;
    dispatch({
      type: 'sendOrder/getAttachmentuuid',
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'sendOrder/saveAttachmentUUID',
          payload: { poHeaderId: params.poHeaderId, uuid: res.content, uuidType: 1 },
        }).then((result) => {
          const { orderHeaderFormDataSource } = this.state;
          this.setState({
            orderHeaderFormDataSource: {
              ...orderHeaderFormDataSource,
              objectVersionNumber: result || orderHeaderFormDataSource.objectVersionNumber,
              attachmentUuid: res.content,
            },
          });
        });
      }
    });
  }

  /**
   * 获取业务规则定义-【是否启用新结算平台】设置值
   */
  @Bind()
  fetchAssociatedConfigFlag() {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderApproval/fetchAssociatedConfigFlag',
    }).then((res) => {
      if (res === 1) {
        this.setState({ associatedConfigFlag: true });
      } else {
        this.setState({ associatedConfigFlag: false });
      }
    });
  }

  /**
   * 打印功能
   */
  @Bind()
  handlePrint() {
    const { dispatch, match = {} } = this.props;
    const { params = {} } = match;
    dispatch({
      type: 'orderApproval/print',
      poHeaderId: params.poHeaderId,
    }).then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) {
          printWindow.print();
        }
      }
    });
  }

  /**
   * 按钮组
   * @returns
   */
  @Bind()
  headerBtnsRender() {
    const { printing, detailApproveLoading, detailRejectLoading } = this.props;
    const { orderHeaderFormDataSource = {}, validId } = this.state;
    const disabled = !validId;
    const btns = [
      {
        name: 'print',
        child: intl.get(`${viewButtonPrompt}.print`).d('打印'),
        btnProps: {
          style: { marginRight: 8 },
          icon: 'printer',
          onClick: this.handlePrint,
          loading: printing,
        },
      },
      {
        name: 'innerUuid',
        btnComp: UploadModal,
        btnProps: {
          btnProps: {
            icon: 'paper-clip',
          },
          btnText: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
          viewOnly: true,
          showFilesNumber: true,
          attachmentUUID: orderHeaderFormDataSource.purchaserInnerAttachmentUuid,
          bucketName: BUCKET_NAME,
          bucketDirectory: 'sodr-order',
          afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
        },
      },
      {
        name: 'outUuid',
        btnComp: UploadModal,
        btnProps: {
          btnProps: {
            icon: 'paper-clip',
          },
          btnText: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
          viewOnly: true,
          showFilesNumber: true,
          attachmentUUID: orderHeaderFormDataSource.attachmentUuid,
          bucketName: BUCKET_NAME,
          bucketDirectory: 'sodr-order',
          afterOpenUploadModal: this.afterOpenHeaderUploadModal,
        },
      },
      {
        name: 'record',
        child: intl.get(`${viewButtonPrompt}.operationRecord`).d('操作记录'),
        btnProps: {
          icon: 'clock-circle-o',
          onClick: this.openOperationRecord.bind(this),
        },
      },
      {
        name: 'reject',
        child: intl.get(`${viewButtonPrompt}.reject`).d('审批拒绝'),
        btnProps: {
          icon: 'close',
          onClick: this.reject.bind(this),
          disabled: detailApproveLoading || disabled,
          loading: detailRejectLoading,
        },
      },
      {
        name: 'approve',
        child: intl.get(`${viewButtonPrompt}.approve`).d('审批通过'),
        btnProps: {
          icon: 'check',
          type: 'primary',
          onClick: this.approve.bind(this),
          disabled: detailRejectLoading || disabled,
          loading: detailApproveLoading,
        },
      },
    ];

    return btns;
  }

  render() {
    const {
      dispatch,
      match,
      orderApproval,
      customizeForm,
      custLoading,
      customizeTable,
      customizeTabPane,
      fetchOperationRecordListLoading,
      queryDetailListLoading,
      queryPartnersLoading,
      queryPoItemBOMLoading,
      queryDetailHeaderLoading,
      asnLinesLoading,
      rcvRecordsLoading,
      billLinesLoading,
      oldBillLinesLoading,
      invoiceLinesLoading,
      oldInvoiceLinesLoading,
      queryFileListOrgLoading,
      printing,
      customizeBtnGroup,
    } = this.props;
    const {
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
      associatedConfigFlag,
    } = this.state;
    const { poSourcePlatform } = orderHeaderFormDataSource;
    const {
      operationRecordPagination,
      operationRecordList,
      detailOperationQuery,
      enumMap,
    } = orderApproval;
    const { itemCode, itemName, key } = actionListRowData;
    const orderHeaderFormProps = {
      customizeForm,
      custLoading,
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
      enumMap,
      customizeTable,
      customizeTabPane,
      fetchDetailList: this.fetchDetailList,
      processing: { queryDetailListLoading, queryPartnersLoading },
      dataSource: { common: listCommonDataSource, partners: listPartnersDataSource },
      pagination: { common: listCommonPagination, partners: listPartnersPagination },
      assignDataSource: this.assignListDataSource.bind(this),
      openBOMModal: this.openBOMModal.bind(this),
      onChange: this.onListChange.bind(this),
      // onSearch: this.onSearchInvoiceInfo.bind(this),
      onRadioGroupChange: this.onRadioGroupChange,
      radioGroupValue,
      actionListCommonRow,
      setActionListCommonRow: this.setActionListCommonRow,
      path: match.path,
      poSourcePlatform,
      amountFinancialPrecision: this.amountFinancialPrecision,
      headerInfo: orderHeaderFormDataSource,
    };

    const messageProps = {
      visible: messageBoardVisible,
      onCancel: this.closeMessageBoard.bind(this),
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
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      onRemoveAttachment: this.removeAttachment,
      loading: queryFileListOrgLoading, // 加载状态
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sodr-order',
      onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
      processing: {
        asnLinesLoading,
        rcvRecordsLoading,
        billLinesLoading: associatedConfigFlag ? billLinesLoading : oldBillLinesLoading,
        invoiceLinesLoading: associatedConfigFlag ? invoiceLinesLoading : oldInvoiceLinesLoading,
      },
      actionListCommonRow,
      associatedConfigFlag,
    };

    const uploadModalProps = {
      btnText: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
      btnProps: {
        icon: 'paper-clip',
      },
      viewOnly: true,
      showFilesNumber: true,
      attachmentUUID: orderHeaderFormDataSource.attachmentUuid,
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
      afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    };

    const uploadModalPropsLoad = {
      btnText: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
      btnProps: {
        icon: 'paper-clip',
      },
      viewOnly: true,
      showFilesNumber: true,
      attachmentUUID: orderHeaderFormDataSource.purchaserInnerAttachmentUuid,
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
      afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
    };

    // const attachmentProps = {
    //   hideAttachment: this.hideAttachment,
    //   attachmentUUID: orderHeaderFormDataSource.attachmentUuid, // 采购方uuid
    //   supplierAttachmentId: orderHeaderFormDataSource.supplierAttachmentUuid, // 供应商uuid
    //   onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
    //   onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
    //   onRemoveAttachment: this.removeAttachment,
    //   loading: queryFileListOrgLoading, // 加载状态
    //   bucketName: 'private-bucket',
    //   bucketDirectory: 'sodr-order',
    //   onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
    // };
    return (
      <div className={styles['sodr-order-approval-detail']}>
        {!match.path.includes('/pub/sodr/order-approval/detail') ? (
          <Header
            title={intl.get(`${viewMessagePrompt}.titleDetail`).d('订单明细')}
            backPath="/sodr/order-approval/list"
          >
            {customizeBtnGroup(
              { code: 'SODR.ORDER_APPROVE_LINE_LIST.BUTTONS', pro: true },
              <DynamicButtons buttons={this.headerBtnsRender()} />
            )}
          </Header>
        ) : (
          <Header title={intl.get(`${viewMessagePrompt}.titleDetail`).d('订单明细')}>
            <Button icon="clock-circle-o" onClick={this.openOperationRecord.bind(this)}>
              {intl.get(`${viewButtonPrompt}.operationRecord`).d('操作记录')}
            </Button>
            <UploadModal {...uploadModalProps} />
            <UploadModal {...uploadModalPropsLoad} />
            <Button
              style={{ marginRight: 8 }}
              icon="printer"
              onClick={this.handlePrint}
              loading={printing}
            >
              {intl.get(`${viewButtonPrompt}.print`).d('打印')}
            </Button>
          </Header>
        )}
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
