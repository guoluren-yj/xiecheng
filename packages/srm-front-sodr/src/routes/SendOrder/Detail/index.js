/* eslint-disable react/jsx-indent */
/**
 * index - 我发出的订单明细页面
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Spin, Collapse, Icon, Modal, Badge, Tag } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, isNumber, isFunction, throttle } from 'lodash';
import classnames from 'classnames';
import querystring from 'querystring';
import { Bind, Throttle } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import remotes from 'utils/remote';
import DynamicButtons from '_components/DynamicButtons';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import {
  getCurrentOrganizationId,
  getEditTableData,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Button } from 'components/Permission';
// import WebChatIframe from '../../components/WebChatIframe';
// import WebChatDraggable from '../../components/WebChatIframe/Draggable';
// import { postMessage, getMobileFormUrl, Events } from '../../components/Message/message-handler';
import { formatAumont, queryCommonDoubleUomConfig } from '@/routes/components/utils';
import IMChatDraggable from '_components/IMChatDraggable';
import OrderHeaderForm from './OrderHeaderForm';
import Attachment from './Attachment';
import OperationRecord from './OperationRecord';
import Message from './Message';
import WrapperBOMModal from './BOMModal';
import List from './List';
import AssociatedInvoice from './AssociatedInvoice';
import DeliveryInformationHeader from './DeliveryInformationHeader';
import PreviewModal from '@/routes/components/PreviewModal/PreviewModal';
import { getFileList } from '@/services/orderReleaseService';
import BillingInformation from './BillingInformation';
import {
  BUCKET_NAME,
  THROTTLE_TIME,
  PURCHASER_INTERNAL_DIRECTORY,
} from '@/routes/components/utils/constant';
import remoteConfig from './remote';
import styles from './index.less';
import arrow from '@/assets/connect.svg';
import { getJsonBlob } from '../../components/utils';
import CancelModal from '../../OrderCancel/CancelCloseModal';

// 折叠面板组件初始化
const { Panel } = Collapse;

// 设置sodr国际化前缀 - button
const buttonPrompt = 'sodr.sendOrder.view.button';
// 设置sodr国际化前缀 - message
const titlePrompt = 'sodr.sendOrder.view.title';

/**
 * Detail - 业务组件 - 我发送的订单
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [sendOrder={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {!boolean} saveDetailLoading - 保存明细
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
@connect(({ loading, sendOrder }) => ({
  saveDetailLoading: loading.effects['sendOrder/saveDetail'],
  queryPoItemBOMLoading: loading.effects['sendOrder/newQueryPoItemBOM'],
  queryDetailHeaderLoading: loading.effects['sendOrder/queryDetailHeader'],
  sendMessageLoading: loading.effects['sendOrder/sendMessage'],
  queryMessageLoading: loading.effects['sendOrder/queryMessage'],
  queryPartnersLoading: loading.effects['sendOrder/queryPartners'],
  queryDetailListLoading: loading.effects['sendOrder/queryDetailList'],
  fetchOperationRecordListLoading: loading.effects['sendOrder/fetchOperationRecordList'],
  fetchApproveListLoading: loading.effects['sendOrder/fetchApproveRecordList'],
  queryFileListOrgLoading: loading.effects['sendOrder/queryFileListOrg'],
  asnLinesLoading: loading.effects['sendOrder/fetchAsnLines'],
  dscLinesLoading: loading.effects['sendOrder/fetchDeliveryLines'],
  rcvRecordsLoading: loading.effects['sendOrder/fetchRcvRecords'],
  billLinesLoading: loading.effects['sendOrder/fetchBillLines'],
  oldBillLinesLoading: loading.effects['sendOrder/fetchOldBillLines'],
  invoiceLinesLoading: loading.effects['sendOrder/fetchInvoiceLines'],
  oldInvoiceLinesLoading: loading.effects['sendOrder/fetchOldInvoiceLines'],
  printing: loading.effects['sendOrder/print'],
  closing: loading.effects['orderCancel/closeOrder'],
  cancelling: loading.effects['orderCancel/cancelOrder'],
  exportToErpLoading: loading.effects['sendOrder/exportToErp'],
  exportErpLoading: loading.effects['sendOrder/exportErp'],
  exportToErpAgainLoading: loading.effects['sendOrder/exportToErpAgain'],
  exportToChangeErpLoading: loading.effects['sendOrder/exportToChangeErp'],
  addNewSubmitDetailLoading: loading.effects['sendOrder/addNewSubmitDetail'],
  handleRevokeLoading: loading.effects['orderCancel/handleRevoke'],
  sendOrder,
}))
@remotes(...remoteConfig)
@formatterCollections({
  code: [
    'component.docFlow',
    'sodr.sendOrder',
    'sodr.common',
    'sodr.confirmOrder',
    'sprm.common',
    'sodr.confirmOrder',
    'entity.item',
    'entity.company',
    'entity.attachment',
    'entity.order',
    'item.order',
    'entity.roles',
    'entity.item',
    'sodr.quotePurchase',
    'sodr.quotePurchaseRequisition',
    'hpfm.employee',
    'entity.business',
    'sodr.orderEvaluation',
    'sprm.purchaseReqCreation',
    'sodr.orderMaintenanceEntry',
    'sodr.packingData',
    'spcm.common',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.SEND_ORDER_DETAIL.BASIC',
    'SODR.SEND_ORDER_DETAIL.HEADER',
    'SODR.SEND_ORDER_DETAIL.OTHER',
    'SODR.SEND_ORDER_DETAIL.INVOICE',
    'SODR.SEND_ORDER_DETAIL.DELIVERY_CATA',
    'SODR.ORDER_PROCESS_CONTROL_DETAIL.HEADER',
    'SODR.ORDER_PROCESS_CONTROL_DETAIL.LINE',
    'SODR.ORDER_PROCESS_CONTROL_DETAIL.OTHER',
    'SODR.ORDER_PROCESS_CONTROL_DETAIL.INVOICE',
    'SODR.ORDER_PROCESS_CONTROL_DETAIL.DELIVERY_CATA',
    'SODR.SEND_ORDER_DETAIL.TAB',
    'SODR.ORDER_PROCESS_CONTROL_DETAIL.TAB',
    'SODR.ORDER_PROCESS_CONTROL_DETAIL.CANCEL_MODEL',
    'SODR.SEND_ORDER_DETAIL.HEADER_BUTTONS',
    'SODR.SEND_ORDER_DETAIL.EVALUATE',
    'SODR.ORDER_PROCESS_CONTROL_DETAIL.BUTTONS',
    'SODR.SEND_ORDER_DETAIL.DOCRELATE_DSC',
    'SODR.SEND_ORDER_DETAIL.DOCRELATE_BILL',
    'SODR.SEND_ORDER_DETAIL.DOCRELATE_BILL_NEW',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params, path },
      location: { search },
    } = this.props;
    const { poSourcePlatform, source, sourceFlag, openFrom, isBackFlag = 1 } = querystring.parse(
      search.substr(1)
    );
    this.state = {
      visible: false,
      // fileVisible: false,
      source,
      isBackFlag,
      sourceFromModal: openFrom === 'modal',
      isDocFlowLink: openFrom === 'docFlow',
      isSettleLink: openFrom === 'settle',
      sourceFlag,
      poSourcePlatform,
      poHeaderId: params.id,
      orderHeaderFormDataSource: {},
      operationRecordModalVisible: false, // 操作记录模态框
      listCommonDataSource: [], // 基本信息/其他信息数据源
      listCommonPagination: {}, // 基本信息/其他信息分页
      listPartnersDataSource: [], // 合作伙伴数据源
      listPartnersPagination: {}, // 合作伙伴分页
      messageBoardVisible: false, // 留言板状态
      organizationId: getCurrentOrganizationId(),

      attachmentUUID: undefined, // 打开模态框新建的uuid
      purchaserInnerAttachmentUuid: undefined,
      wrapperBOMModalVisible: false, // BOM状态
      actionListRowData: {},
      collapseKeys: ['orderHeaderInfo'],
      radioGroupValue: 'basic',
      actionListCommonRow: {},
      sourceFromCancel: path.includes('order-cancel'),
      sourceFromPub: path.includes('pub'),
      evaluationDataSource: {},
      settings: {},
      unreadCount: 0,
      headerDataSourceKey: true,
      associatedConfigFlag: true, // 新旧结算判断flag
      cancelCloseModalVisible: false,
      buttonType: '',
      personalizedCoding: '',
      fileList: [],
      doubleUnitEnabled: 0,
    };

    // 方法注册
    // [
    //   'fetchDetailHeader',
    //   'fetchDetailList',
    //   'fetchPartners',
    //   'hideOperationRecord',
    //   'assignListDataSource',
    //   'openBOMModal',
    //   'onListChange',
    //   'closeMessageBoard',
    //   'fetchMessage',
    //   'sendMessage',
    //   'closeBOMModal',
    //   'fetchBOM',
    //   'save',
    //   'fetchUUID',
    //   'openOperationRecord',
    //   'openMessageBoard',
    //   'onCollapseChange',
    //   'fetchUuidBindHeader',
    //   'fetchPurchaserAttachmentList',
    //   'fetchSupplierAttachmentList',
    //   'removeAttachment',
    //   'fetchAsnLines',
    //   'fetchDeliveryLines',
    //   'fetchRcvRecords',
    //   'fetchBillLines',
    //   'fetchInvoiceLines',
    //   'onRadioGroupChange',
    //   'setActionListCommonRow',
    //   'attchmentAendMessage',
    // ].forEach(method => {
    //   this[method] = this[method].bind(this);
    // });
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { match = {} } = this.props;
    const { params } = match;
    this.fetchSettings();
    this.queryDoubleUomConfig();
    if (isNumber(Number(params.id))) {
      this.fetchDetailHeader();
      this.fetchDetailList();
      this.fetchPartners();
      this.queryOrderEvaluation();
      this.fetchAssociatedConfigFlag();
      this.fetchEnum();
    }
    addEventListener('message', this.handleEvent);
  }

  componentWillUnmount() {
    removeEventListener('message', this.handleEvent);
  }

  componentDidUpdate(prevProps) {
    const { match = {} } = this.props;
    const { params = {} } = match;
    if (prevProps.match.params.id !== params.id) {
      if (isNumber(Number(params.id))) {
        this.fetchDetailHeader();
        this.fetchDetailList();
        this.fetchPartners();
        this.queryOrderEvaluation();
        this.fetchAssociatedConfigFlag();
        this.fetchEnum();
      }
    }
  }

  @Bind()
  handleEvent(e) {
    if (e.data?.type === 'QUERY_SEND_ORDER') {
      this.fetchDetailHeader();
      this.fetchDetailList();
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

  /**
   * 查询列表值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({ type: 'sendOrder/init' });
  }
  /**
   * 处理拖拽事件
   */
  // @Bind
  // handleDropItem() {
  //   const { match = {} } = this.props;
  //   const { orderHeaderFormDataSource } = this.state;
  //   console.log(orderHeaderFormDataSource);
  //   this.setState({ getMobileFormUrlLoading: true });
  //   getMobileFormUrl('SODR.CONFIRM_ORDER', { poHeaderIdEncrypt: match.params.id }).then((res) => {
  //     this.setState({ getMobileFormUrlLoading: false });
  //     postMessage(Events.sendLinkMessage, {
  //       vcTitle: intl.get('sodr.confirmOrder.view.message.headerTitle').d('订单确认'),
  //       vcDesc: intl
  //         .get('sodr.sendOrder.view.message.nowConfirmOrder', {
  //           value1: orderHeaderFormDataSource.companyName,
  //           value2: orderHeaderFormDataSource.displayPoNum,
  //         })
  //         .d('您收到{value1}发布的采购订单{value2}，请及时确认！'),
  //       vcHref: res,
  //       msgContent:
  //         'https://isrm-dev-public-bucket.obs.cn-east-2.myhuaweicloud.com/hpfm05/30/e25a50aff9df44efa5d528025e6a494c@going-link.png',
  //     });
  //   });
  // }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader() {
    const { dispatch, match = {} } = this.props;
    const { sourceFromCancel, headerDataSourceKey } = this.state;
    const { params } = match;
    dispatch({
      type: 'sendOrder/queryDetailHeader',
      poHeaderId: params.id,
      customizeUnitCode: sourceFromCancel
        ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.HEADER,SODR.ORDER_PROCESS_CONTROL_DETAIL.DELIVERY_CATA'
        : 'SODR.SEND_ORDER_DETAIL.HEADER,SODR.SEND_ORDER_DETAIL.DELIVERY_CATA',
    }).then((res) => {
      if (res) {
        this.setState({
          orderHeaderFormDataSource: res,
          attachmentUUID: res.attachmentUuid,
          purchaserInnerAttachmentUuid: res.purchaserInnerAttachmentUuid,
          unreadCount: res.unreadCount,
          headerDataSourceKey: !headerDataSourceKey,
        });
        this.queryOrderEvaluation(res.supplierCompanyId);
        if (res.electricSignUrl) {
          getFileList([res.electricSignUrl]).then((v) => {
            if (getResponse(v)) {
              this.setState({
                fileList: v,
              });
            }
          });
        }
      }
    });
  }

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchDetailList(params = {}) {
    const { dispatch, match = {} } = this.props;
    const { sourceFromCancel } = this.state;
    dispatch({
      type: 'sendOrder/queryDetailList',
      payload: {
        poHeaderId: match.params.id,
        ...params,
        customizeUnitCode: sourceFromCancel
          ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.LINE,SODR.ORDER_PROCESS_CONTROL_DETAIL.OTHER,SODR.ORDER_PROCESS_CONTROL_DETAIL.INVOICE'
          : 'SODR.SEND_ORDER_DETAIL.BASIC,SODR.SEND_ORDER_DETAIL.OTHER,SODR.SEND_ORDER_DETAIL.INVOICE',
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
  @Bind()
  fetchPartners(params = {}) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'sendOrder/queryPartners',
      poHeaderId: (match.params || {}).id,
      params,
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
  @Bind()
  fetchBOM(params, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    const { actionListRowData = {} } = this.state;
    const { poLineId } = actionListRowData;
    dispatch({
      type: 'sendOrder/newQueryPoItemBOM',
      params: {
        poHeaderId: match.params.id,
        poLineId,
        ...params,
        customizeUnitCode: 'SODR.SEND_ORDER_DETAIL.BOM_MODAL',
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * fetchMessage - 查询留言板数据
   * @param {object} params - 查询条件
   * @param {function} success - 操作成功回调函数
   */
  @Bind()
  fetchMessage(params, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'sendOrder/queryMessage',
      params: {
        poHeaderId: match.params.id,
        ...params,
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  // 查询配置中心配置
  @Bind()
  fetchSettings() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sendOrder/fetchSettings',
    }).then((res) => {
      if (res) {
        this.setState({
          settings: res,
        });
      }
    });
  }

  // 查询订单评价数据
  @Bind()
  queryOrderEvaluation(supplierCompanyId) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'sendOrder/queryOrderEvaluation',
      payload: {
        supplierCompanyId,
        poHeaderId: match.params.id,
        ustomizeUnitCode: 'SODR.SEND_ORDER_DETAIL.EVALUATE',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          evaluationDataSource: res,
        });
      }
    });
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  @Bind()
  save() {
    const { dispatch } = this.props;
    const { validateFields = (e) => e } = this.orderHeaderForm;
    const { orderHeaderFormDataSource, listCommonDataSource = [], attachmentUUID } = this.state;
    const lines = getEditTableData(listCommonDataSource, ['_status']);
    validateFields((err, values) => {
      if (isEmpty(err)) {
        const { remark } = values;
        const data = {
          poHeaderDetailDTO: {
            ...orderHeaderFormDataSource,
            ...values,
            remark,
            attachmentUuid: attachmentUUID,
          },
          poLineDetailDTOs: lines,
        };
        dispatch({
          type: 'sendOrder/addNewSubmitDetail',
          payload: data,
        }).then((ras) => {
          if (ras) {
            if (ras.value) {
              Modal.confirm({
                title: ras.message,
                okText: intl.get('hzero.common.button.sure').d('确定'),
                cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                onOk: throttle(
                  () => {
                    this.saveAndRefresh(data);
                  },
                  THROTTLE_TIME,
                  { trailing: false }
                ),
              });
            } else {
              this.saveAndRefresh(data);
            }
          }
        });
      }
    });
  }

  @Bind()
  saveAndRefresh(data) {
    const { dispatch } = this.props;
    const { sourceFromCancel } = this.state;
    dispatch({
      type: 'sendOrder/saveDetail',
      payload: {
        data,
        customizeUnitCode: sourceFromCancel
          ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.HEADER,SODR.ORDER_PROCESS_CONTROL_DETAIL.LINE,SODR.ORDER_PROCESS_CONTROL_DETAIL.OTHER,SODR.ORDER_PROCESS_CONTROL_DETAIL.INVOICE'
          : 'SODR.SEND_ORDER_DETAIL.HEADER,SODR.SEND_ORDER_DETAIL.BASIC,SODR.SEND_ORDER_DETAIL.OTHER,SODR.SEND_ORDER_DETAIL.INVOICE',
      },
    }).then((res) => {
      if (res) {
        notification.success({
          message: intl.get(`hzero.common.notification.success.save`).d('保存成功'),
        });
        this.fetchDetailHeader();
        this.fetchDetailList();
      }
    });
  }

  /**
   * 订单取消
   */
  @Bind()
  cancel() {
    this.setState({
      cancelCloseModalVisible: true,
      buttonType: 'cancel',
      personalizedCoding: 'SODR.ORDER_PROCESS_CONTROL_DETAIL.CANCEL_MODEL',
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind()
  openUploadModal() {
    this.setState({ visible: true });
  }

  // @Bind()
  // openUploadModalFile() {
  //   this.setState({ fileVisible: true });
  // }

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ visible: false });
  }

  // /**
  //  * hideAttachment - 关闭附件弹窗
  //  */
  // @Bind()
  // hideAttachmentFile() {
  //   this.setState({ fileVisible: false });
  // }

  /**
   * 打印功能
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handlePrint() {
    const { poHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'sendOrder/print',
      poHeaderId,
    }).then((res) => {
      if (res && res.type !== 'application/json') {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow && printWindow.print) {
          printWindow.print();
        }

        // const a = document.createElement('a');
        // a.style.width = '0px';
        // a.style.height = '0px';
        // a.style.display = 'none';
        // a.setAttribute('href', fileURL);
        // a.setAttribute('target', '_blank');
        // a.setAttribute('id', '__yellow_open_new_window_preview_pdf');
        // if (!document.getElementById('__yellow_open_new_window_preview_pdf')) {
        //   document.body.appendChild(a);
        // }
        // a.click();

        // const w = window.open("about:blank");
        // w.document.write(file);
        // if (navigator.appName === 'Microsoft Internet Explorer') window.print();
        // else w.print();
      } else if (res) {
        getJsonBlob(res)
          .then((response) => {
            notification.error({ message: response.message });
          })
          .catch((error) => {
            console.error('Error print:', error);
          });
      }
    });
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
      if (res && params.id && res.content) {
        dispatch({
          type: 'sendOrder/saveAttachmentUUID',
          payload: { poHeaderId: params.id, uuid: res.content, uuidType: 1 },
        }).then((result) => {
          const { orderHeaderFormDataSource } = this.state;
          this.setState({
            attachmentUUID: res.content,
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

  // /**
  //  * 获取UUID  并将获得的uuid存入数据库
  //  */
  // fetchUUIDFILE() {
  //   debugger;
  //   const { dispatch, match = {} } = this.props;
  //   const { params } = match;
  //   debugger;
  //   dispatch({
  //     type: 'sendOrder/getAttachmentuuid',
  //   }).then(res => {
  //     if (res) {
  //       dispatch({
  //         type: 'sendOrder/saveAttachmentUUID',
  //         payload: { poHeaderId: params.id, uuid: res.content, uuidType: 3 },
  //       }).then(result => {
  //         const { orderHeaderFormDataSource } = this.state;
  //         this.setState({
  //           purchaserInnerAttachmentUuid: res.content,
  //           orderHeaderFormDataSource: {
  //             ...orderHeaderFormDataSource,
  //             objectVersionNumber: result || orderHeaderFormDataSource.objectVersionNumber,
  //             purchaserInnerAttachmentUuid: res.content,
  //           },
  //         });
  //       });
  //     }
  //   });
  // }

  /**
   * sendMessage - 发送留言
   * @param {string} message - 留言数据
   * @param {function} success - 操作成功回调函数
   */
  @Bind()
  sendMessage(message, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'sendOrder/sendMessage',
      data: {
        poHeaderId: match.params.id,
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
   * fetchUuidBindHeader - 首次加载附件组件时判断该头是否有Uuid，没有就去请求一个并绑定
   */
  @Bind()
  fetchUuidBindHeader() {
    const {
      orderHeaderFormDataSource: { poHeaderId, attachmentUuid = undefined },
    } = this.state;
    if (poHeaderId && !attachmentUuid) {
      // 后台传过来的attachmentUuid不存在 则 新获取 uuid
      this.fetchUUID();
    }
  }

  // /**
  //  * fetchUuidBindHeader - 首次加载附件组件时判断该头是否有Uuid，没有就去请求一个并绑定
  //  */
  // fetchUuidBindHeaderFile() {
  //   debugger;
  //   const {
  //     orderHeaderFormDataSource: { purchaserInnerAttachmentUuid = undefined },
  //     // purchaserInnerAttachmentUuid,
  //   } = this.state;
  //   if (!purchaserInnerAttachmentUuid) {
  //     // 后台传过来的attachmentUuid不存在 则 新获取 uuid
  //     this.fetchUUIDFILE(purchaserInnerAttachmentUuid);
  //   }
  // }

  /**
   * 跳转至计划排程确认
   */
  @Bind()
  handleToDetail({ lineNum, displayPoNum }) {
    this.props.history.push({
      pathname: `/sodr/purchase-schedule-sheet-confirm/list`,
      search: `lineNum=${lineNum}&displayPoNum=${displayPoNum}`,
    });
  }

  /**
   * fetchDeliveryLines - 查询交货计划数据
   */
  @Bind()
  fetchDeliveryLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return actionListCommonRow.poLineLocationId
      ? dispatch({
          // 交货计划
          type: 'sendOrder/fetchDeliveryLines',
          payload: {
            poLineLocationId: actionListCommonRow.poLineLocationId,
            customizeUnitCode: 'SODR.SEND_ORDER_DETAIL.DOCRELATE_DSC',
          },
        })
      : Promise.reject();
  }

  /**
   * fetchAsnLines - 查询送货单数据
   */
  @Bind()
  fetchAsnLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return actionListCommonRow.poLineLocationId
      ? dispatch({
          // 送货单
          type: 'sendOrder/fetchAsnLines',
          deliveryStrategyId: actionListCommonRow.deliveryStrategyId,
          poLineLocationId: actionListCommonRow.poLineLocationId,
        })
      : Promise.reject();
  }

  /**
   * fetchAsnLines - 查询收货记录数据
   */
  @Bind()
  fetchRcvRecords() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return actionListCommonRow.poLineLocationId
      ? dispatch({
          // 收货记录
          type: 'sendOrder/fetchRcvRecords',
          poLineLocationId: actionListCommonRow.poLineLocationId,
        })
      : Promise.reject();
  }

  /**
   * fetchBillLines - 查询对账单数据
   */
  @Bind()
  fetchBillLines() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, actionListCommonRow = {} } = this.state;
    return actionListCommonRow.poLineLocationId
      ? dispatch({
          type: 'sendOrder/fetchBillLines',
          payload: {
            size: 0,
            poNumEquals: orderHeaderFormDataSource.displayPoNum,
            poLineNum: actionListCommonRow.displayLineNum,
            formSource: 2,
          },
        })
      : Promise.reject();
  }

  /**
   * fetchOldBillLines - 查询老对账单数据
   */
  @Bind()
  fetchOldBillLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return actionListCommonRow.poLineLocationId
      ? dispatch({
          type: 'sendOrder/fetchOldBillLines',
          poLineLocationId: actionListCommonRow.poLineLocationId,
          params: { size: 0 },
        })
      : Promise.reject();
  }

  /**
   * fetchInvoiceLines - 查询网上发票数据
   */
  @Bind()
  fetchInvoiceLines() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, actionListCommonRow = {} } = this.state;
    return actionListCommonRow.poLineLocationId
      ? dispatch({
          type: 'sendOrder/fetchInvoiceLines',
          payload: {
            size: 0,
            poNumEquals: orderHeaderFormDataSource.displayPoNum,
            poLineNum: actionListCommonRow.displayLineNum,
            formSource: 2,
          },
        })
      : Promise.reject();
  }

  /**
   * fetchOldInvoiceLines - 查询网上发票数据
   */
  @Bind()
  fetchOldInvoiceLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return actionListCommonRow.poLineLocationId
      ? dispatch({
          type: 'sendOrder/fetchOldInvoiceLines',
          poLineLocationId: actionListCommonRow.poLineLocationId,
        })
      : Promise.reject();
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord() {
    this.setState({ operationRecordModalVisible: true });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState({ operationRecordModalVisible: false });
  }

  /**
   * openMessageBoard - 打开留言板 并获取数据
   */
  @Bind()
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
  @Bind()
  closeMessageBoard() {
    this.setState({
      messageBoardVisible: false,
    });
  }

  /**
   * assignListDataSource - 合并行数据至数据集合
   * @param {Array} [listCommonDataSource = []] - 数据集合
   */
  @Bind()
  assignListDataSource(listCommonDataSource = []) {
    this.setState({
      listCommonDataSource,
    });
  }

  /**
   * openBOMModal - 打开BOM Modal
   * @param {object} [actionListRowData = {}] - 当前操作行数据
   */
  @Bind()
  openBOMModal(actionListRowData = {}) {
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
   * onListChange - 列表分页切换
   * @param {string} actionType - tab切换标记
   * @param {object} page - 分页信息
   */
  @Bind()
  onListChange(actionType, page) {
    const actionMap = new Map([
      ['common', () => this.fetchDetailList({ page })],
      ['partners', () => this.fetchPartners({ page })],
    ]);
    actionMap.get(actionType)();
  }

  @Bind()
  setActionListCommonRow(actionListCommonRow) {
    this.setState({
      actionListCommonRow,
    });
  }

  @Bind()
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
  //     type: 'sendOrder/fetchAsnLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 收货记录
  //     type: 'sendOrder/fetchRcvRecords',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 对账单
  //     type: 'sendOrder/fetchBillLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 网上发票
  //     type: 'sendOrder/fetchInvoiceLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  // }
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
      type: 'sendOrder/queryFileListOrg',
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
      type: 'sendOrder/queryFileListOrg',
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
      type: 'sendOrder/removeFile',
      payload,
    });
  }

  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  reImportERP() {
    const { dispatch = (e) => e } = this.props;
    const { validateFields = (e) => e } = this.orderHeaderForm;
    const {
      orderHeaderFormDataSource = {},
      listCommonDataSource = [],
      attachmentUUID,
    } = this.state;
    const {
      poHeaderId,
      versionNum,
      _token,
      createSyncFlag,
      changeSyncStatus,
      deliverySyncStatus,
    } = orderHeaderFormDataSource;
    const lines = getEditTableData(listCommonDataSource, ['_status']);
    // 标识优先级 createSyncFlag 、changeSyncStatus、deliverySyncStatus 分别对应【创建重新同步】【变更同步】【交期同步】//  2022/08/27 逻辑梳理
    // 有createSyncFlag 调用sendOrder/exportErp
    // 有变更changeSyncStatus && changeSyncStatus === 'FAIL' 调用sendOrder/exportToChangeErp
    // 有deliverySyncStatus !== 'FAIL' && deliverySyncStatus !== 'SYNCHRONIZING'调用sendOrder/exportToErp，否则调用 exportToErpAgain
    // ps：changeSyncStatus 和 deliverySyncStatus需要对应前后依次调用。
    const successCallback = (messageType) => {
      const message =
        messageType === 'save'
          ? intl.get(`hzero.common.notification.success.save`).d('保存成功')
          : intl.get(`${titlePrompt}.synchronousSuccess`).d('同步成功');
      notification.success({
        message,
      });
      this.fetchDetailHeader();
      this.fetchDetailList();
    };
    const deliveryCallback = (data) => {
      if (!createSyncFlag) {
        dispatch({
          type:
            deliverySyncStatus !== 'FAIL' && deliverySyncStatus !== 'SYNCHRONIZING'
              ? 'sendOrder/exportToErp'
              : 'sendOrder/exportToErpAgain',
          data: deliverySyncStatus !== 'FAIL' ? [data] : data,
        }).then((ras) => {
          if (ras) {
            successCallback();
          }
        });
      }
    };
    const changeCallback = (data) => {
      if (changeSyncStatus && changeSyncStatus === 'FAIL') {
        dispatch({
          type: 'sendOrder/exportToChangeErp',
          payload: { poHeaderId },
        }).then((res) => {
          if (res === 'SUCCESS') {
            // successCallback();
            deliveryCallback(data);
          }
        });
      } else {
        deliveryCallback(data);
      }
    };
    if (createSyncFlag) {
      // 同步
      validateFields((err, values) => {
        if (isEmpty(err)) {
          const { remark } = values;
          const data = {
            poHeaderDetailDTO: {
              ...orderHeaderFormDataSource,
              ...values,
              remark,
              attachmentUuid: attachmentUUID,
            },
            poLineDetailDTOs: lines,
          };
          dispatch({
            type: 'sendOrder/exportErp',
            data,
          }).then((res) => {
            if (res) {
              successCallback('save');
            }
          });
          const deliveryData =
            deliverySyncStatus !== 'FAIL' ? data : { poHeaderId, versionNum, _token };
          changeCallback(deliveryData);
        }
      });
    } else {
      validateFields((err, values) => {
        if (isEmpty(err)) {
          const { remark } = values;
          const data =
            deliverySyncStatus !== 'FAIL'
              ? {
                  poHeaderDetailDTO: {
                    ...orderHeaderFormDataSource,
                    ...values,
                    remark,
                    attachmentUuid: attachmentUUID,
                  },
                  poLineDetailDTOs: lines,
                }
              : { poHeaderId, versionNum, _token };
          changeCallback(data);
        }
      });
    }
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModalLoad(getHeaderAttachmentUuidLoad) {
    const { orderHeaderFormDataSource = {} } = this.state;
    if (
      orderHeaderFormDataSource.poHeaderId &&
      !orderHeaderFormDataSource.purchaserInnerAttachmentUuid
    ) {
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
      type: 'sendOrder/saveAttachmentUUID',
      payload: { poHeaderId, uuid: getHeaderAttachmentUuidLoad, uuidType: 3 },
    }).then((res) => {
      if (res) {
        this.fetchDetailHeader(true);
      }
    });
  }

  /**
   * 返回父页面
   */
  @Bind()
  handleBackParentPath() {
    const {
      match: { path },
    } = this.props;
    let routePath;
    const { sourceFlag } = this.state;
    switch (sourceFlag) {
      case 'supplier-deduction-query': // 返回供应商查询页面
        routePath = '/sfin/supplier-deduction-query/list';
        break;
      case 'supplier-deduction-approval': // 返回供应商审批页面
        routePath = '/sfin/supplier-deduction-approval/list';
        break;
      default:
        routePath =
          path.indexOf('/sodr/order-cancel/detail') === 0
            ? '/sodr/order-cancel/list'
            : '/sodr/send-order/list';
        break;
    }
    return routePath;
  }

  /**
   * attchmentAendMessage - 发送附件
   * @param {string} message - 附件名
   * @param {string} url - 附件url
   * @param {function} success - 操作成功回调函数
   */
  @Bind()
  attchmentAendMessage(message, url, uuid, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'sendOrder/sendMessage',
      data: {
        message,
        poHeaderId: match.params.id,
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

  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleReasonConfirm(buttonType) {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource } = this.state;
    this.cancelModalForm.validateFields((err) => {
      if (!err) {
        const params = filterNullValueObject(this.cancelModalForm.getFieldsValue());
        const headerParams = this.orderHeaderForm.getFieldsValue();
        // const { closeCancelRemark } = params;
        // 整单取消/关闭
        dispatch({
          type: buttonType === 'cancel' ? 'orderCancel/cancelOrder' : 'orderCancel/closeOrder',
          payload: [
            {
              ...orderHeaderFormDataSource,
              ...headerParams,
              ...params,
              customizeUnitCode: 'SODR.ORDER_PROCESS_CONTROL_DETAIL.CANCEL_MODEL',
            },
          ],
        }).then((res) => {
          if (res) {
            const { successNum } = res;
            if (successNum === 1) {
              notification.success();
              this.props.history.push('/sodr/order-cancel/list');
            } else {
              Modal.confirm({
                title:
                  buttonType === 'cancel'
                    ? intl.get(`sodr.sendOrder.view.message.cannotCancel`).d('该送货单不可以取消')
                    : intl.get(`sodr.sendOrder.view.message.cannotClose`).d('该送货单不可以关闭'),
              });
            }
          }
        });
      }
    });
  }

  @Bind()
  handleReasonCancel() {
    this.setState({ cancelCloseModalVisible: false });
  }

  /**
   * 绑定取消弹出框
   * @param {*} node -  查询组件
   */
  @Bind()
  bindCancelModal(node) {
    this.cancelModalForm = node.props.form;
  }

  /**
   * 获取业务规则定义-【是否启用新结算平台】设置值
   */
  @Bind()
  fetchAssociatedConfigFlag() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sendOrder/fetchAssociatedConfigFlag',
    }).then((res) => {
      if (res === 1) {
        this.setState({ associatedConfigFlag: true });
      } else {
        this.setState({ associatedConfigFlag: false });
      }
    });
  }

  /**
   * 整单/按行关闭弹框
   */
  @Bind()
  handleClose() {
    this.setState({ cancelCloseModalVisible: true, buttonType: 'close' });
  }

  @Bind()
  confirmHandleRevoke(backPath) {
    Modal.confirm({
      title: intl.get('sodr.common.model.common.confirmRevoke').d('是否确认撤销变更'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: throttle(
        () => {
          const { dispatch, match = {}, history } = this.props;
          // debugger;
          dispatch({
            type: 'orderCancel/handleRevoke',
            payload: {
              poHeaderId: match.params.id,
            },
          }).then((res) => {
            if (getResponse(res)) {
              history.push({
                pathname: backPath,
              });
            }
          });
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  }

  render() {
    const {
      sendOrder,
      dispatch,
      match,
      history,
      customizeForm,
      customizeTable,
      customizeTabPane,
      fetchOperationRecordListLoading,
      fetchApproveListLoading,
      queryFileListOrgLoading = false,
      queryPartnersLoading,
      queryMessageLoading,
      queryDetailListLoading,
      sendMessageLoading,
      saveDetailLoading,
      queryPoItemBOMLoading,
      queryDetailHeaderLoading,
      dscLinesLoading,
      asnLinesLoading,
      rcvRecordsLoading,
      billLinesLoading,
      oldBillLinesLoading,
      invoiceLinesLoading,
      oldInvoiceLinesLoading,
      exportToErpLoading,
      exportErpLoading,
      exportToErpAgainLoading,
      exportToChangeErpLoading,
      addNewSubmitDetailLoading,
      printing,
      closing,
      cancelling,
      handleRevokeLoading,
      location: { state = {} },
      customizeBtnGroup,
      form,
      remote,
    } = this.props;
    const {
      visible,
      isBackFlag,
      // fileVisible,
      sourceFromModal,
      isSettleLink,
      isDocFlowLink,
      operationRecordModalVisible,
      listCommonDataSource,
      listCommonPagination,
      listPartnersDataSource,
      listPartnersPagination,
      messageBoardVisible,
      organizationId,
      wrapperBOMModalVisible,
      actionListRowData,
      attachmentUUID,
      purchaserInnerAttachmentUuid,
      radioGroupValue,
      actionListCommonRow,
      sourceFromCancel,
      collapseKeys = [],
      orderHeaderFormDataSource = {},
      evaluationDataSource = {},
      settings,
      source,
      sourceFromPub,
      unreadCount,
      getMobileFormUrlLoading,
      cancelCloseModalVisible,
      buttonType,
      headerDataSourceKey,
      associatedConfigFlag,
      personalizedCoding,
      doubleUnitEnabled,
      fileList,
    } = this.state;
    const {
      poSourcePlatform,
      statusCode,
      approvedSyncStatus,
      createSyncFlag,
      displaySyncFlag,
      deliverySyncStatus,
      changeSyncStatus,
    } = orderHeaderFormDataSource;
    const {
      operationRecordList,
      operationRecordPagination,
      detailOperationQuery,
      enumMap,
    } = sendOrder;
    const { itemCode, itemName, key, poHeaderId, poLineId } = actionListRowData;
    const orderHeaderFormProps = {
      remote,
      history,
      customizeForm,
      sourceFromCancel,
      amountFinancialPrecision: this.amountFinancialPrecision,
      ref: (node) => {
        this.orderHeaderForm = node;
      },
      dataSource: orderHeaderFormDataSource,
      headerDataSourceKey,
    };
    const deliveryAndBillProps = {
      customizeForm,
      sourceFromCancel,
      dataSource: orderHeaderFormDataSource,
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
      approveLoading: fetchApproveListLoading,
      hideModal: this.hideOperationRecord,
    };
    const listProps = {
      enumMap,
      customizeForm,
      form,
      settings,
      isDocFlowLink,
      customizeTable,
      customizeTabPane,
      sourceFromCancel,
      doubleUnitEnabled,
      evaluationDataSource,
      viewOnly: sourceFromModal,
      processing: { queryDetailListLoading, queryPartnersLoading },
      dataSource: { common: listCommonDataSource, partners: listPartnersDataSource },
      pagination: { common: listCommonPagination, partners: listPartnersPagination },
      assignDataSource: this.assignListDataSource,
      openBOMModal: this.openBOMModal,
      onChange: this.onListChange,
      // onSearch: this.onSearchInvoiceInfo.bind(this),
      onRadioGroupChange: this.onRadioGroupChange,
      radioGroupValue,
      poSourcePlatform: this.state.poSourcePlatform,
      actionListCommonRow,
      setActionListCommonRow: this.setActionListCommonRow,
      amountFinancialPrecision: this.amountFinancialPrecision,
      headerInfo: orderHeaderFormDataSource,
    };

    const messageProps = {
      visible: messageBoardVisible,
      onCancel: this.closeMessageBoard,
      fetchMessage: this.fetchMessage,
      sendMessage: this.sendMessage,
      attchmentAendMessage: this.attchmentAendMessage,
      onRef: (node) => {
        this.updateMessage = node;
      },
      processing: { queryMessageLoading, sendMessageLoading },
    };
    const { supplierAttachmentUuid, filesNumber, electricSignFlag } = orderHeaderFormDataSource;
    const attachmentProps = {
      name: 'outUuids',
      hideAttachment: this.hideAttachment,
      attachmentUUID, // 采购方uuid
      supplierAttachmentId: supplierAttachmentUuid, // 供应商uuid
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      onRemoveAttachment: this.removeAttachment,
      loading: queryFileListOrgLoading, // 加载状态
      bucketName: BUCKET_NAME,
      // bucketDirectory: 'sodr-order',
      onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
    };
    const uploadModalPropsLoad = {
      name: 'upload',
      btnText: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
      btnProps: {
        icon: 'paper-clip',
        // disabled: !poHeaderId,
      },
      // viewOnly: true,
      showFilesNumber: true,
      attachmentUUID: purchaserInnerAttachmentUuid,
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
      afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
    };
    const wrapperBOMModalProps = {
      visible: wrapperBOMModalVisible,
      onCancel: this.closeBOMModal,
      fetchBOM: this.fetchBOM,
      actionkey: key,
      processing: queryPoItemBOMLoading,
      itemCode,
      itemName,
      poHeaderId,
      poLineId,
    };

    const associatedInvoiceProps = {
      remote,
      fetchAsnLines: this.fetchAsnLines,
      fetchDeliveryLines: this.fetchDeliveryLines,
      fetchRcvRecords: this.fetchRcvRecords,
      fetchInvoiceLines: associatedConfigFlag ? this.fetchInvoiceLines : this.fetchOldInvoiceLines,
      fetchBillLines: associatedConfigFlag ? this.fetchBillLines : this.fetchOldBillLines,
      handleToDetail: this.handleToDetail,
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      onRemoveAttachment: this.removeAttachment,
      loading: queryFileListOrgLoading, // 加载状态
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sodr-order',
      onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
      processing: {
        dscLinesLoading,
        asnLinesLoading,
        rcvRecordsLoading,
        billLinesLoading: associatedConfigFlag ? billLinesLoading : oldBillLinesLoading,
        invoiceLinesLoading: associatedConfigFlag ? invoiceLinesLoading : oldInvoiceLinesLoading,
      },
      viewOnly: sourceFromModal,
      actionListCommonRow,
      sourceFromCancel,
      associatedConfigFlag,
      customizeTable,
    };
    const backPath =
      (sourceFromPub && !isSettleLink) || Number(isBackFlag) !== 1
        ? false
        : state.backPath || this.handleBackParentPath();
    const cancelModalProps = {
      cancelCloseModalVisible,
      buttonType,
      hideCancelModal: this.handleReasonCancel,
      handleReasonConfirm: this.handleReasonConfirm,
      handleReasonCancel: this.handleReasonCancel,
      onRef: this.bindCancelModal,
      closeOrderLoading: closing,
      cancelOrderLoading: cancelling,
      customizeForm,
      personalizedCoding,
    };
    const previewModalProps = {
      fileList,
      btnText: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      title: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      btnProps: {
        icon: 'paper-clip',
      },
    };

    const getIMRequestBody = () => ({
      ...orderHeaderFormProps.dataSource,
      unreadCount:
        orderHeaderFormProps?.dataSource?.unreadCount === undefined
          ? 0
          : orderHeaderFormProps?.dataSource?.unreadCount,
    });

    const viewOnlyHeader = <Header title={intl.get(`${titlePrompt}.orderDetail`).d('订单明细')} />;

    const fileNumButton = React.memo(({ children, ...btnProps }) => {
      return (
        <Button {...btnProps}>
          {children}
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
      );
    });
    const cancelButtons = [
      {
        name: 'revoke',
        btnComp: Button,
        child: intl.get(`sodr.common.model.common.revoke`).d('撤销变更'),
        btnProps: {
          icon: 'close',
          type: 'primary',
          onClick: () => this.confirmHandleRevoke(backPath),
          loading: handleRevokeLoading || queryDetailHeaderLoading,
          permissionList: [
            {
              code: `srm.po-admin.po.cancel-order.ps.button.revoke`,
              type: 'button',
              meaning: '订单过程控制撤销变更按钮',
            },
          ],
          hidden: !(
            sourceFromCancel &&
            statusCode === 'REJECTED' &&
            changeSyncStatus === 'SUCCESS'
          ),
        },
      },
      {
        name: 'close',
        btnComp: Button,
        child: intl.get(`hzero.common.button.close`).d('关闭'),
        btnProps: {
          icon: 'close',
          type: 'primary',
          onClick: this.handleClose,
          loading: closing || queryDetailHeaderLoading,
          permissionList: [
            {
              code: `srm.po-admin.po.cancel-order.ps.button.close`,
              type: 'button',
              meaning: '订单过程控制关闭按钮',
            },
          ],
          hidden: !sourceFromCancel,
        },
      },
      {
        name: 'cancel',
        child: intl.get(`hzero.common.button.cancel`).d('取消'),
        btnProps: {
          icon: 'return',
          type: 'primary',
          onClick: this.cancel,
          disabled: statusCode === 'CANCELED',
          loading: cancelling || queryDetailHeaderLoading,
          hidden: !sourceFromCancel,
        },
      },
      {
        name: 'reSync',
        btnComp: Button,
        child: intl.get(`${buttonPrompt}.resync`).d('重新同步'),
        btnProps: {
          icon: 'sync',
          onClick: this.reImportERP,
          hidden: !(
            displaySyncFlag ||
            deliverySyncStatus === 'FAIL' ||
            deliverySyncStatus === 'SYNCHRONIZING'
          ),
          disabled: !(
            approvedSyncStatus === 'SYNCHRONIZING' ||
            approvedSyncStatus === 'FAIL' ||
            deliverySyncStatus === 'FAIL' ||
            deliverySyncStatus === 'SYNCHRONIZING' ||
            changeSyncStatus === 'FAIL' ||
            createSyncFlag === 1
          ),
          loading:
            exportToErpLoading ||
            exportErpLoading ||
            exportToErpAgainLoading ||
            exportToChangeErpLoading ||
            queryDetailHeaderLoading,
        },
      },
      {
        name: 'openOperationRecord',
        btnComp: Button,
        child: intl.get(`sodr.common.view.button.operationRecord`).d('操作记录'),
        btnProps: {
          icon: 'clock-circle-o',
          onClick: this.openOperationRecord,
        },
      },
      {
        name: 'outUuid',
        btnComp: fileNumButton,
        child:
          source !== 'maintain'
            ? intl.get('sodr.quotePurchase.view.message.outUuid').d('外部附件')
            : intl.get('entity.attachment.view').d('附件查看'),
        btnProps: {
          icon: 'paper-clip',
          onClick: this.openUploadModal,
        },
      },
    ];

    const getHeaderButtons = () => {
      if (isDocFlowLink || isSettleLink) {
        return (
          <>
            <Button
              data-name="openOperationRecord"
              icon="clock-circle-o"
              onClick={this.openOperationRecord}
            >
              {intl.get(`sodr.common.view.button.operationRecord`).d('操作记录')}
            </Button>
            <Button data-name="outUuid" onClick={this.openUploadModal} icon="paper-clip">
              {source !== 'maintain'
                ? intl.get('sodr.quotePurchase.view.message.outUuid').d('外部附件')
                : intl.get('entity.attachment.view').d('附件查看')}
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
            {source !== 'maintain' && <UploadModal viewOnly {...uploadModalPropsLoad} />}
          </>
        );
      }
      if (sourceFromCancel) {
        return (
          <>
            {customizeBtnGroup(
              { code: 'SODR.ORDER_PROCESS_CONTROL_DETAIL.BUTTONS', pro: true },
              <DynamicButtons buttons={cancelButtons} />
            )}
            {source !== 'maintain' && <UploadModal {...uploadModalPropsLoad} />}
          </>
        );
      }
      if (!sourceFromCancel) {
        const preButtons = [
          !sourceFromPub && (
            <Button
              data-name="save"
              loading={
                saveDetailLoading ||
                queryDetailHeaderLoading ||
                addNewSubmitDetailLoading ||
                queryDetailListLoading
              }
              icon="save"
              type="primary"
              onClick={this.save}
            >
              {intl.get(`hzero.common.button.save`).d('保存')}
            </Button>
          ),
          <Button
            data-name="outUuid"
            onClick={this.openUploadModal}
            icon="paper-clip"
            loading={
              saveDetailLoading ||
              queryDetailHeaderLoading ||
              addNewSubmitDetailLoading ||
              queryDetailListLoading
            }
          >
            {source !== 'maintain'
              ? intl.get('sodr.quotePurchase.view.message.outUuid').d('外部附件')
              : intl.get('entity.attachment.view').d('附件查看')}
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
          </Button>,
          source !== 'maintain' && <UploadModal {...uploadModalPropsLoad} />,
          <Button
            data-name="openOperationRecord"
            icon="clock-circle-o"
            onClick={this.openOperationRecord}
          >
            {intl.get(`sodr.common.view.button.operationRecord`).d('操作记录')}
          </Button>,
          <Badge data-name="messageBoard" count={unreadCount || 0} overflowCount={99}>
            <Button icon="message" onClick={this.openMessageBoard}>
              {intl.get(`${buttonPrompt}.messageBoard`).d('留言板')}
            </Button>
          </Badge>,
          <Button
            data-name="print"
            style={{ marginRight: 8 }}
            icon="printer"
            onClick={this.handlePrint}
            loading={printing}
            permissionList={[
              {
                code: `srm.po-admin.po.sended-order.ps.button.sendorderprint`,
                type: 'button',
                meaning: '我发出的订单-订单详情打印',
              },
            ]}
          >
            {intl.get(`${buttonPrompt}.print`).d('打印')}
          </Button>,
          displaySyncFlag ||
          deliverySyncStatus === 'FAIL' ||
          deliverySyncStatus === 'SYNCHRONIZING' ? (
            <Button
              data-name="reSync"
              disabled={
                !(
                  approvedSyncStatus === 'SYNCHRONIZING' ||
                  approvedSyncStatus === 'FAIL' ||
                  deliverySyncStatus === 'FAIL' ||
                  deliverySyncStatus === 'SYNCHRONIZING' ||
                  changeSyncStatus === 'FAIL' ||
                  createSyncFlag === 1
                )
              }
              icon="sync"
              onClick={this.reImportERP}
              loading={
                exportToErpLoading ||
                exportErpLoading ||
                exportToErpAgainLoading ||
                exportToChangeErpLoading ||
                queryDetailHeaderLoading
              }
            >
              {intl.get(`${buttonPrompt}.resync`).d('重新同步')}
            </Button>
          ) : null,
        ];
        const buttons = remote
          ? remote.process('SODR.SENDORDER_DETAIL_PROCESS_HEADER_BUTTON', preButtons, {
              that: this,
            })
          : preButtons;
        return customizeBtnGroup({ code: 'SODR.SEND_ORDER_DETAIL.HEADER_BUTTONS' }, buttons);
      }
    };
    return (
      <Fragment>
        {sourceFromModal && viewOnlyHeader}
        {!sourceFromModal && (
          <Header
            title={
              [
                'PUBLISHED',
                'PART_FEED_BACK',
                // 'DELIVERY_DATE_REVIEW',
                'DELIVERY_DATE_REJECT',
                'CANCELTOBECOMFIRMED',
                'CLOSETOBECOMFIRMED',
              ].includes(orderHeaderFormProps.dataSource.statusCode) ? (
                // 已发布、部分反馈、订单反馈审核拒绝、取消待确认、关闭待确认的订单发送“订单确认卡片”
                <IMChatDraggable
                  showDetail
                  cardCode="PO_CONFIRM_DETAIL"
                  icon="baseline-drag_indicator"
                  tooltip=""
                  requestBody={getIMRequestBody}
                  dragText={`${intl.get('sodr.sendOrder.view.order').d('订单')}${
                    orderHeaderFormProps.dataSource.displayPoNum
                  }`}
                >
                  {intl.get(`${titlePrompt}.orderDetail`).d('订单明细')}
                </IMChatDraggable>
              ) : (
                <IMChatDraggable
                  showDetail
                  cardCode="PO_RECEIVE_DETAIL"
                  icon="baseline-drag_indicator"
                  tooltip=""
                  requestBody={getIMRequestBody}
                  dragText={`${intl.get('sodr.sendOrder.view.order').d('订单')}${
                    orderHeaderFormProps.dataSource.displayPoNum
                  }`}
                >
                  {intl.get(`${titlePrompt}.orderDetail`).d('订单明细')}
                </IMChatDraggable>
              )
            }
            backPath={backPath}
          >
            {getHeaderButtons()}
            {!queryDetailHeaderLoading && electricSignFlag === 1 && (
              <PreviewModal {...previewModalProps} />
            )}
          </Header>
        )}
        <Content className={styles['sodr-send-order-detail']}>
          {/* <WebChatIframe */}
          {/*  src="https://mobile.dev.isrm.going-link.com/web-chat" */}
          {/*  onDropItem={this.handleDropItem} */}
          {/* /> */}
          <Spin
            spinning={
              queryDetailHeaderLoading || saveDetailLoading || getMobileFormUrlLoading || false
            }
            wrapperClassName={classnames(DETAIL_DEFAULT_CLASSNAME)}
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
                    <h3>{intl.get(`${titlePrompt}.orderHeaderInfo`).d('订单头信息')}</h3>
                    <a>
                      {collapseKeys.includes('orderHeaderInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
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
                      <h3>{intl.get(`${titlePrompt}.deliveryInfo`).d('收货/收单信息')}</h3>
                      <a>
                        {collapseKeys.includes('deliveryInformationHeader')
                          ? intl.get('hzero.common.button.up').d('收起')
                          : intl.get('hzero.common.button.expand').d('展开')}
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
                      <h3>{intl.get(`${titlePrompt}.billingInformation`).d('开票信息')}</h3>
                      <a>
                        {collapseKeys.includes('billingInformation')
                          ? intl.get('hzero.common.button.up').d('收起')
                          : intl.get('hzero.common.button.expand').d('展开')}
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
        {cancelCloseModalVisible && <CancelModal {...cancelModalProps} />}
        {remote.process('externalAttachments', visible && <Attachment {...attachmentProps} />, {
          visible,
          Comp: Attachment,
          props: { ...attachmentProps },
          orderHeaderFormDataSource,
        })}
      </Fragment>
    );
  }
}
