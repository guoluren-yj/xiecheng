/**
 * index - 我发出的订单明细页面
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Spin, Collapse, Icon, Modal } from 'hzero-ui';
import { connect } from 'dva';
import querystring from 'querystring';
import { isNumber, isFunction } from 'lodash';
import { Bind, Debounce, Throttle } from 'lodash-decorators';
import classnames from 'classnames';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import DynamicButtons from '_components/DynamicButtons';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  getAccessToken,
  getEditTableData,
  getResponse,
} from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import remotes from 'utils/remote';

import {
  formatAumont,
  queryCalcRuleConfig,
  queryCommonDoubleUomConfig,
} from '@/routes/components/utils';
import { Button } from 'components/Permission';
import Attachment from './Attachment';
import OrderHeaderForm from './OrderHeaderForm';
import OperationRecord from './OperationRecord';
import DeliveryInformationHeader from './DeliveryInformationHeader';
import PreviewModal from '@/routes/components/PreviewModal/PreviewModal';
import { getFileList } from '@/services/orderReleaseService';
import Message from './Message';
import WrapperBOMModal from './BOMModal';
import List from './List';
import { BUCKET_NAME, THROTTLE_TIME } from '@/routes/components/utils/constant';
import styles from './index.less';
import AssociatedInvoice from './AssociatedInvoice';
import remoteConfig from './remote';
import arrow from '@/assets/connect.svg';
import MessageBoard from './MessageBoard';

// 折叠面板组件初始化
const { Panel } = Collapse;
const DEBOUNCE_TIME = 500;

/**
 * 业务组件 - 我收到的订单
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [sendOrder={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {!boolean} saveDetailLoading - 保存明细
 * @reactProps {!boolean} queryPoItemBOMLoading - 查询BOM
 * @reactProps {!boolean} queryDetailHeaderLoading - 查询头明细
 * @reactProps {!boolean} Loading - 发送留言
 * @reactProps {!boolean} queryMessageLoading - 查询留言
 * @reactProps {!boolean} queryPartnersLoading - 查询合作伙伴
 * @reactProps {!boolean} queryDetailListLoading - 查询行明细
 * @reactProps {!boolean} fetchOperationRecordListLoading -查询操作记录
 * @reactProps {!boolean} queryFileListOrgLoading - 查询附件相关
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, receivedOrder }) => ({
  saveDetailLoading: loading.effects['receivedOrder/saveDetail'],
  queryPoItemBOMLoading: loading.effects['receivedOrder/newQueryPoItemBOM'],
  queryDetailHeaderLoading: loading.effects['receivedOrder/queryDetailHeader'],
  sendMessageLoading: loading.effects['receivedOrder/sendMessage'],
  queryMessageLoading: loading.effects['receivedOrder/queryMessage'],
  queryPartnersLoading: loading.effects['receivedOrder/queryPartners'],
  queryDetailListLoading: loading.effects['receivedOrder/queryDetailList'],
  fetchOperationRecordListLoading: loading.effects['receivedOrder/fetchOperationRecordList'],
  queryFileListOrgLoading: loading.effects['receivedOrder/queryFileListOrg'],
  dscLinesLoading: loading.effects['sendOrder/fetchDeliveryLines'],
  asnLinesLoading: loading.effects['receivedOrder/fetchAsnLines'],
  rcvRecordsLoading: loading.effects['receivedOrder/fetchRcvRecords'],
  billLinesLoading: loading.effects['receivedOrder/fetchBillLines'],
  oldBillLinesLoading: loading.effects['receivedOrder/fetchOldBillLines'],
  invoiceLinesLoading: loading.effects['receivedOrder/fetchInvoiceLines'],
  oldInvoiceLinesLoading: loading.effects['receivedOrder/fetchOldInvoiceLines'],
  printLoading: loading.effects['receivedOrder/print'],
  submitAfterConfirmrLoading: loading.effects['receivedOrder/submitAfterConfirmr'],
  calculateDoubleUomLoading: loading.effects['quotePurchaseRequisition/calculateDoubleUom'],
  confirmOrderLoading: loading.effects['receivedOrder/confirmOrder'],
  queryOrderEvaluationLoading: loading.effects['receivedOrder/queryOrderEvaluation'],
  receivedOrder,
}))
@formatterCollections({
  code: [
    'sodr.receivedOrder',
    'sodr.common',
    'entity.company',
    'entity.attachment',
    'entity.order',
    'item.order',
    'entity.item',
    'sprm.common',
    'spcm.common',
    'sodr.quotePurchase',
    'sodr.quotePurchaseRequisition',
    'sodr.confirmOrder',
    'sodr.orderChange',
    'sprm.purchaseReqCreation',
  ],
})
@remotes(...remoteConfig)
@withCustomize({
  unitCode: [
    'SODR.RECEIVED_ORDER_DETAIL.BASIC',
    'SODR.RECEIVED_ORDER_DETAIL.HEADER',
    'SODR.RECEIVED_ORDER_DETAIL.OTHER',
    'SODR.RECEIVED_ORDER_DETAIL.DELIVERY_CATA',
    'SODR.RECEIVED_ORDER_DETAIL.TAB',
    'SODR.RECEIVED_ORDER_DETAIL.BUTTONS',
    'SODR.RECEIVED_ORDER_DETAIL.BASIC_INFO',
  ],
})
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: { path },
      history: {
        location: { search },
      },
    } = this.props;
    const { sourceFlag, openFrom, isBackFlag = 1 } = querystring.parse(search.substr(1));
    this.state = {
      isBackFlag,
      isSettleLink: openFrom === 'settle',
      sourceFromPub: path.includes('pub'),
      sourceFlag,
      orderHeaderFormDataSource: {},
      operationRecordModalVisible: false, // 操作记录模态框
      listCommonDataSource: [], // 基本信息/其他信息数据源
      listCommonPagination: {}, // 基本信息/其他信息分页
      listPartnersDataSource: [], // 合作伙伴数据源
      listPartnersPagination: {}, // 合作伙伴分页
      messageBoardVisible: false,
      wrapperBOMModalVisible: false, // BOM状态
      actionListRowData: {},
      organizationId: getCurrentOrganizationId(),
      supplierAttachmentUuid: '',
      collapseKeys: ['orderHeaderInfo'],
      radioGroupValue: 'basic',
      actionListCommonRow: {},
      evaluationDataSource: {},
      unreadCount: 0,
      requiredFlag: 0,
      associatedConfigFlag: true, // 新旧结算判断flag
      fileList: [],
      isSearchHeaderDone: false,
      // lineDisplay: 0,
      changeFlag: false,
      basicFormData: {
        lineDisplay: 0,
      },
      doubleUnitEnabled: 0,
      amountCalcRule: 'Amount', // 金额计算配置
    };

    // 方法注册
    [
      'fetchDetailHeader',
      'fetchDetailList',
      'fetchPartners',
      'fetchDeliveryLines',
      'fetchAsnLines',
      'fetchRcvRecords',
      'fetchBillLines',
      'fetchOldBillLines',
      'fetchInvoiceLines',
      'fetchOldInvoiceLines',
      'onRadioGroupChange',
      'setActionListCommonRow',
      'attchmentAendMessage',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  // 查询金额计算配置
  @Bind()
  async fetchCalcRuleConfig() {
    const result = await queryCalcRuleConfig();
    this.setState({
      amountCalcRule: result,
    });
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { match = {} } = this.props;
    const { params } = match;
    this.fetchSettings();
    this.fetchEnum();
    this.fetchCalcRuleConfig();
    this.queryDoubleUomConfig();
    if (isNumber(Number(params.id))) {
      this.fetchDetailHeader();
      this.fetchDetailList();
      this.fetchPartners();
      this.fetchAssociatedConfigFlag();
      // this.fetchConfirmRuleSetting();
    }
    addEventListener('message', this.handleEvent);
  }

  componentWillUnmount() {
    removeEventListener('message', this.handleEvent);
  }

  @Bind()
  handleEvent(e) {
    if (e.data === 'sodr/received-order') {
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
    dispatch({ type: 'receivedOrder/init' });
  }
  // 查询配置中心-订单-订单确认、反馈审核及回传ERP规则
  // @Bind()
  // fetchConfirmRuleSetting() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'receivedOrder/fetchConfirmRuleSetting',
  //   }).then(res => {
  //     if (res) {
  //       const deliveryDateItem = res.find(item =>
  //         ['COMMITTED_DELIVERY_DATE'].includes(item.fieldName)
  //       );
  //       this.setState({ requiredFlag: deliveryDateItem.requiredFlag });
  //     }
  //   });
  // }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  fetchDetailHeader() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'receivedOrder/queryDetailHeader',
      poHeaderId: params.id,
      customizeUnitCode:
        'SODR.RECEIVED_ORDER_DETAIL.HEADER,SODR.RECEIVED_ORDER_DETAIL.DELIVERY_CATA',
    }).then((res) => {
      if (res) {
        this.queryOrderEvaluation(res.supplierCompanyId);
        this.setState({
          orderHeaderFormDataSource: res,
          supplierAttachmentUuid: res.supplierAttachmentUuid,
          unreadCount: res.unreadCount,
          isSearchHeaderDone: true,
        });
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
  @Debounce(DEBOUNCE_TIME)
  fetchDetailList(queryParams = {}) {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    const { basicFormData } = this.state;
    const { lineDisplay } = basicFormData;
    this.setState({ listCommonDataSource: [] });
    dispatch({
      type: 'receivedOrder/queryDetailList',
      payload: {
        ...basicFormData,
        lineDisplay: lineDisplay ? 0 : 1,
        poHeaderId: params.id,
        ...queryParams,
        poEntryPoint: 'RECEIVED_PO_DETAIL',
        customizeUnitCode:
          'SODR.RECEIVED_ORDER_DETAIL.BASIC,SODR.RECEIVED_ORDER_DETAIL.OTHER,SODR.RECEIVED_ORDER_DETAIL.BASIC_INFO',
      },
    }).then((res) => {
      if (res) {
        const { dataSource = [], pagination } = res;
        const listCommonDataSource = dataSource.map((n) => ({
          ...n,
          _status: 'update',
          key: `poHeaderId-${n.poHeaderId}-poLineId-${n.poLineId}-poLineLocationId-${n.poLineLocationId}`,
        }));
        this.setState(
          {
            listCommonDataSource,
            listCommonPagination: pagination,
            actionListCommonRow: listCommonDataSource[0] || {},
          },
          () => {
            this.state.listCommonDataSource.forEach((i) => {
              if (i.$form) i.$form.resetFields();
            });
            setTimeout(() => {
              this.forceUpdate();
            }, 0);
          }
        );
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
      type: 'receivedOrder/queryPartners',
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
      type: 'receivedOrder/newQueryPoItemBOM',
      params: {
        poHeaderId: match.params.id,
        poLineId,
        page: 0,
        size: 10,
        ...params,
        customizeUnitCode: 'SODR.SEND_ORDER_DETAIL.BOM_MODAL',
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
      type: 'receivedOrder/fetchSettings',
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
      type: 'receivedOrder/queryOrderEvaluation',
      payload: {
        supplierCompanyId,
        poHeaderId: match.params.id,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          evaluationDataSource: res,
        });
      }
    });
  }

  fetchUUID() {
    // 获取uuid  并将获得的uuid存入数据库
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'receivedOrder/getAttachmentuuid',
    }).then((res) => {
      if (res && params.id && res.content) {
        dispatch({
          type: 'receivedOrder/saveAttachmentUUID',
          payload: { poHeaderId: params.id, uuid: res.content, uuidType: 2 },
        }).then((result) => {
          const { orderHeaderFormDataSource } = this.state;
          this.setState({
            supplierAttachmentUuid: res.content,
            orderHeaderFormDataSource: {
              ...orderHeaderFormDataSource,
              objectVersionNumber: result || orderHeaderFormDataSource.objectVersionNumber,
              supplierAttachmentUuid: res.content,
            },
          });
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
      type: 'receivedOrder/queryMessage',
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

  /**
   * sendMessage - 发送留言
   * @param {string} message - 留言数据
   * @param {function} success - 操作成功回调函数
   */
  sendMessage(message, success = (e) => e) {
    const { dispatch = (e) => e, match = {} } = this.props;
    dispatch({
      type: 'receivedOrder/sendMessage',
      data: {
        poHeaderId: match.params.id,
        message,
        userCampCode: 'SUPPLIER',
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
      type: 'receivedOrder/sendMessage',
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
   * 跳转至计划排程确认
   */
  @Bind()
  handleToDetail({ lineNum, displayPoNum }) {
    this.props.history.push({
      pathname: `/sodr/schedule-sheet-confirm/list`,
      search: `lineNum=${lineNum}&displayPoNum=${displayPoNum}`,
    });
  }

  /**
   * fetchDeliveryLines - 查询交货计划数据
   */
  fetchDeliveryLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return actionListCommonRow.poLineLocationId
      ? dispatch({
          // 交货计划
          type: 'receivedOrder/fetchDeliveryLines',
          poLineLocationId: actionListCommonRow.poLineLocationId,
        })
      : Promise.reject();
  }

  /**
   * fetchAsnLines - 查询送货单数据
   */
  fetchAsnLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      // 送货单
      type: 'receivedOrder/fetchAsnLines',
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
      type: 'receivedOrder/fetchRcvRecords',
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
      type: 'receivedOrder/fetchBillLines',
      payload: {
        size: 0,
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
      type: 'receivedOrder/fetchOldBillLines',
      poLineLocationId: actionListCommonRow.poLineLocationId,
      params: { size: 0 },
    });
  }

  /**
   * fetchInvoiceLines - 查询网上发票数据
   */
  fetchInvoiceLines() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'receivedOrder/fetchInvoiceLines',
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
      type: 'receivedOrder/fetchOldInvoiceLines',
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * submitAfterConfirmr - 提交
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  submitAfterConfirmr() {
    const { listCommonDataSource, orderHeaderFormDataSource, backPath, changeFlag } = this.state;
    const { dispatch } = this.props;
    // 校验是否有数据变更
    if (
      !this.basicTableChangeFlag &&
      // Object.keys(cacheFields).length === 0 &&
      !this.orderHeaderForm?.isModifiedFields() &&
      !changeFlag
    ) {
      notification.warning({
        message: intl.get(`sodr.orderChange.view.message.noModifyData`).d('未修改任何数据'),
      });
      return;
    }
    this.orderHeaderForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const lines = getEditTableData(listCommonDataSource);
        if (listCommonDataSource.length === 0 || lines.length !== 0) {
          const data = {
            poHeaderDetailDTO: { ...orderHeaderFormDataSource, ...values },
            poLineDetailDTOs: lines.map((item) => ({
              ...item,
              objectVersionNumber: item.locationVersionNumber,
              promiseDeliveryDate: moment(item.promiseDeliveryDate).format(DATETIME_MIN),
            })),
          };
          dispatch({
            type: 'receivedOrder/submitAfterConfirmr',
            payload: {
              data,
              customizeUnitCode:
                'SODR.RECEIVED_ORDER_DETAIL.HEADER,SODR.RECEIVED_ORDER_DETAIL.BASIC',
            },
          }).then((res) => {
            if (res) {
              dispatch(
                routerRedux.push({
                  pathname: backPath || this.handleBackParentPath(),
                })
              );
            }
          });
        }
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
    if (radioGroupValue) {
      this.setState({
        radioGroupValue,
      });
    }
  }

  // onSearchInvoiceInfo(item) {
  //   const { dispatch } = this.props;
  //   const { organizationId } = this.state;
  //   // debugger;
  //   dispatch({
  //     // 送货单
  //     type: 'receivedOrder/fetchAsnLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 收货记录
  //     type: 'receivedOrder/fetchRcvRecords',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 对账单
  //     type: 'receivedOrder/fetchBillLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 网上发票
  //     type: 'receivedOrder/fetchInvoiceLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  // }

  /**
   * fetchUuidBindHeader - 首次加载附件组件时判断该头是否有Uuid，没有就去请求一个并绑定
   */
  @Bind()
  fetchUuidBindHeader() {
    const { supplierAttachmentUuid = undefined, isSearchHeaderDone } = this.state;
    if (!supplierAttachmentUuid && isSearchHeaderDone) {
      // 后台传过来的attachmentUuid不存在 则 新获取 uuid
      this.fetchUUID();
      this.handleSetChangeFlag();
    }
  }

  @Bind()
  handleSetChangeFlag() {
    const { changeFlag } = this.state;
    if (!changeFlag) {
      this.setState({ changeFlag: true });
    }
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
      type: 'receivedOrder/queryFileListOrg',
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
      type: 'receivedOrder/queryFileListOrg',
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
    this.handleSetChangeFlag();
    return dispatch({
      type: 'receivedOrder/removeFile',
      payload,
    });
  }

  /**
   * 打印功能
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handlePrint() {
    const { dispatch, match = {} } = this.props;
    const { params = {} } = match;
    dispatch({
      type: 'receivedOrder/print',
      poHeaderId: params.id,
    }).then((res) => {
      if (res) {
        if (res.type.includes('application/json') && isFunction(res?.text)) {
          res.text().then((result) => {
            const jsonInfo = JSON.parse(result);
            if (jsonInfo.failed) {
              notification.warning({
                message: jsonInfo.message,
              });
            }
          });
          return;
        }
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow?.print) {
          printWindow.print();
        }
      }
    });
  }

  @Bind()
  handleConfirm() {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.submit`).d('是否确认提交'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        const { orderHeaderFormDataSource } = this.state;
        const { dispatch } = this.props;
        this.orderHeaderForm.validateFieldsAndScroll((err, values) => {
          if (!err) {
            dispatch({
              type: 'receivedOrder/confirmOrder',
              payload: {
                ...orderHeaderFormDataSource,
                ...values,
                customizeUnitCode: 'SODR.RECEIVED_ORDER_DETAIL.HEADER',
              },
            }).then((res) => {
              if (res) {
                this.orderHeaderForm.resetFields();
                this.fetchDetailHeader();
                this.fetchDetailList();
                this.fetchPartners();
                this.fetchAssociatedConfigFlag();
                notification.success();
              }
            });
          }
        });
      },
    });
  }

  // 改变行中的数量时，改变头上的含税价格和不含税价格
  handleChangeLineState = (lineObj = {}, callBack) => {
    const { listCommonDataSource = [] } = this.state;
    const { key, lineAmount, taxIncludedLineAmount, quantity } = lineObj;
    const listData = listCommonDataSource.map((item) => {
      if (item.key === key) {
        return {
          ...item,
          quantity,
          lineAmount,
          taxIncludedLineAmount,
        };
      }
      return item;
    });
    this.setState(
      {
        listCommonDataSource: listData,
      },
      callBack
    );
  };

  handleChangeHeaderState = (data) => {
    const { orderHeaderFormDataSource } = this.state;
    const headerData = {
      ...orderHeaderFormDataSource,
      ...data,
    };
    this.setState({
      orderHeaderFormDataSource: headerData,
    });
  };

  /**
   * 返回父页面
   */
  handleBackParentPath() {
    let routePath;
    const { sourceFlag } = this.state;
    switch (sourceFlag) {
      case 'supplier-confirm-query': // 返回供应商确认页面
        routePath = '/sfin/supplier-confirm-query/list';
        break;
      case 'my-received-deduction': // 返回我收到的扣款单
        routePath = '/sfin/my-received-deduction/list';
        break;
      default:
        routePath = '/sodr/received-order/list';
        break;
    }
    return routePath;
  }

  @Bind()
  onBasicTableChange() {
    this.basicTableChangeFlag = true;
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

  /**
   * 获取业务规则定义-【是否启用新结算平台】设置值
   */
  @Bind()
  fetchAssociatedConfigFlag() {
    const { dispatch } = this.props;
    dispatch({
      type: 'receivedOrder/fetchAssociatedConfigFlag',
    }).then((res) => {
      if (res === 1) {
        this.setState({ associatedConfigFlag: true });
      } else {
        this.setState({ associatedConfigFlag: false });
      }
    });
  }

  @Bind()
  handleChangeLineDisplay(basicFormData) {
    this.setState({ basicFormData }, () => {
      this.fetchDetailList();
    });
  }

  render() {
    const {
      receivedOrder,
      dispatch,
      match,
      customizeForm,
      customizeTable,
      customizeTabPane,
      fetchOperationRecordListLoading,
      queryFileListOrgLoading,
      queryDetailListLoading,
      queryPartnersLoading,
      sendMessageLoading,
      queryMessageLoading,
      queryPoItemBOMLoading,
      queryDetailHeaderLoading,
      saveDetailLoading,
      dscLinesLoading,
      asnLinesLoading,
      rcvRecordsLoading,
      billLinesLoading,
      oldBillLinesLoading,
      invoiceLinesLoading,
      oldInvoiceLinesLoading,
      printLoading,
      calculateDoubleUomLoading,
      submitAfterConfirmrLoading,
      confirmOrderLoading,
      location: { state = {} },
      customizeBtnGroup,
      queryOrderEvaluationLoading,
      remote,
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
      supplierAttachmentUuid,
      collapseKeys = [],
      radioGroupValue,
      actionListCommonRow,
      evaluationDataSource = {},
      settings,
      unreadCount,
      requiredFlag,
      amountCalcRule,
      doubleUnitEnabled,
      associatedConfigFlag,
      fileList,
      basicFormData,
      isSettleLink,
      isBackFlag,
      sourceFromPub,
    } = this.state;
    const {
      poSourcePlatform,
      statusCode,
      submitButtonFlag,
      displayVirtualButtonFlag,
      virtualButtonName,
      electricSignFlag,
    } = orderHeaderFormDataSource;
    const {
      operationRecordPagination,
      operationRecordList,
      detailOperationQuery,
      enumMap,
    } = receivedOrder;
    const { itemCode, itemName, key, poHeaderId, poLineId } = actionListRowData;

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
      enumMap,
      // form,
      dispatch,
      basicFormData,
      customizeForm,
      settings,
      requiredFlag,
      customizeTable,
      amountCalcRule,
      customizeTabPane,
      doubleUnitEnabled,
      evaluationDataSource,
      processing: { queryDetailListLoading, queryPartnersLoading, calculateDoubleUomLoading },
      dataSource: { common: listCommonDataSource, partners: listPartnersDataSource },
      pagination: { common: listCommonPagination, partners: listPartnersPagination },
      openBOMModal: this.openBOMModal.bind(this),
      onChange: this.onListChange.bind(this),
      // onSearch: this.onSearchInvoiceInfo.bind(this),
      onRadioGroupChange: this.onRadioGroupChange,
      radioGroupValue,
      actionListCommonRow,
      onBasicTableChange: this.onBasicTableChange,
      setActionListCommonRow: this.setActionListCommonRow,
      onHeaderSetState: this.handleChangeHeaderState,
      onLineSetState: this.handleChangeLineState,
      amountFinancialPrecision: this.amountFinancialPrecision,
      headerInfo: orderHeaderFormDataSource,
      fetchDetailList: this.fetchDetailList,
      handleChangeLineDisplay: this.handleChangeLineDisplay,
    };

    const messageProps = {
      visible: messageBoardVisible,
      attchmentAendMessage: this.attchmentAendMessage.bind(this),
      onCancel: this.closeMessageBoard.bind(this),
      fetchMessage: this.fetchMessage.bind(this),
      sendMessage: this.sendMessage.bind(this),
      onRef: (node) => {
        this.updateMessage = node;
      },
      processing: { queryMessageLoading, sendMessageLoading },
    };

    const wrapperBOMModalProps = {
      visible: wrapperBOMModalVisible,
      onCancel: this.closeBOMModal.bind(this),
      fetchBOM: this.fetchBOM.bind(this),
      actionkey: key,
      processing: queryPoItemBOMLoading,
      itemCode,
      itemName,
      poHeaderId,
      poLineId,
    };

    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const { attachmentUuid } = orderHeaderFormDataSource;
    const headerBtnLoading =
      queryDetailHeaderLoading ||
      queryDetailListLoading ||
      submitAfterConfirmrLoading ||
      printLoading ||
      confirmOrderLoading ||
      queryOrderEvaluationLoading;
    const attachmentProps = {
      supplierAttachmentUuid, // 供应商uuid
      attachmentUUID: attachmentUuid, // 采购方uuid
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      onRemoveAttachment: this.removeAttachment,
      bucketName: BUCKET_NAME,
      // bucketDirectory: 'sodr-order',
      showFilesNumber: true,
      loading: queryFileListOrgLoading, // 加载状态
      onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
      btnProps: {
        style: { color: '#000' },
        icon: 'paper-clip',
        loading: headerBtnLoading,
      },
    };

    const associatedInvoiceProps = {
      fetchDeliveryLines: this.fetchDeliveryLines,
      fetchAsnLines: this.fetchAsnLines,
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
      actionListCommonRow,
      associatedConfigFlag,
    };
    const deliveryAndBillProps = {
      customizeForm,
      dataSource: orderHeaderFormDataSource,
    };

    const previewModalProps = {
      fileList,
      btnText: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      title: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      btnProps: {
        icon: 'paper-clip',
      },
    };
    const getHeaderButtons = () => {
      if (isSettleLink) {
        const buttons = [
          {
            name: 'operationRecord',
            child: intl.get(`sodr.common.view.button.operationRecord`).d('操作记录'),
            btnType: 'h0',
            btnComp: Button,
            btnProps: {
              icon: 'clock-circle-o',
              onClick: this.openOperationRecord.bind(this),
            },
          },
          {
            name: 'attachment',
            btnComp: Attachment,
            btnProps: {
              ...attachmentProps,
            },
          },
        ];
        return <DynamicButtons buttons={buttons} />;
      }
      const buttons = [
        {
          name: 'print',
          btnType: 'h0',
          child: intl.get(`sodr.receivedOrder.view.button.print`).d('打印'),
          btnComp: Button,
          btnProps: {
            style: { marginRight: 8 },
            icon: 'printer',
            onClick: this.handlePrint,
            loading: headerBtnLoading,
            permissionList: [
              {
                code: `srm.po-admin.so.received-order.ps.button.receivedorderprint`,
                type: 'button',
                meaning: '我收到的订单-订单详情打印',
              },
            ],
          },
        },
        {
          name: 'messageBoard',
          child: intl.get(`sodr.common.view.button.messageBoard`).d('留言板'),
          btnComp: MessageBoard,
          btnProps: {
            unreadCount,
            openMessageBoard: this.openMessageBoard.bind(this),
          },
        },
        {
          name: 'operationRecord',
          child: intl.get(`sodr.common.view.button.operationRecord`).d('操作记录'),
          btnType: 'h0',
          btnComp: Button,
          btnProps: {
            icon: 'clock-circle-o',
            onClick: this.openOperationRecord.bind(this),
          },
        },
        {
          name: 'attachment',
          btnComp: Attachment,
          btnProps: {
            ...attachmentProps,
          },
        },
      ];
      return customizeBtnGroup(
        { code: 'SODR.RECEIVED_ORDER_DETAIL.BUTTONS', pro: true },
        <DynamicButtons
          buttons={remote.process('processHeaderButtons', buttons, {
            orderHeaderFormDataSource,
            current: this,
          })}
        />
      );
    };
    const backPath =
      (sourceFromPub && !isSettleLink) || Number(isBackFlag) !== 1
        ? false
        : state.backPath || this.handleBackParentPath();
    return (
      <div>
        <Header
          title={intl.get(`sodr.common.view.message.title.detail`).d('订单明细')}
          backPath={backPath}
        >
          {statusCode === 'CONFIRMED' && submitButtonFlag === 1 && !isSettleLink && (
            <Button type="primary" onClick={this.submitAfterConfirmr} loading={headerBtnLoading}>
              {intl.get(`hzero.common.button.submit`).d('提交')}
            </Button>
          )}
          {getHeaderButtons()}
          {/* <Attachment {...attachmentProps} />
          <Button icon="clock-circle-o" onClick={this.openOperationRecord.bind(this)}>
            {intl.get(`sodr.common.view.button.operationRecord`).d('操作记录')}
          </Button>
          <Badge count={unreadCount || 0} overflowCount={99}>
            <Button icon="message" onClick={this.openMessageBoard.bind(this)}>
              {intl.get(`sodr.common.view.button.messageBoard`).d('留言板')}
            </Button>
          </Badge>
          <Button
            style={{ marginRight: 8 }}
            icon="printer"
            onClick={this.handlePrint}
            loading={printLoading}
            permissionList={[
              {
                code: `srm.po-admin.so.received-order.ps.button.receivedorderprint`,
                type: 'button',
                meaning: '我收到的订单-订单详情打印',
              },
            ]}
          >
            {intl.get(`sodr.receivedOrder.view.button.print`).d('打印')}
          </Button> */}
          {displayVirtualButtonFlag === 1 && (
            <Button
              onClick={this.handleConfirm}
              permissionList={[
                {
                  code: `srm.po-admin.so.received-order.ps.button.confirmorder`,
                  type: 'button',
                  meaning: '我收到的订单-订单确认',
                },
              ]}
            >
              {virtualButtonName}
            </Button>
          )}
          {!queryDetailHeaderLoading && electricSignFlag === 1 && (
            <PreviewModal {...previewModalProps} />
          )}
        </Header>
        <Content>
          <Spin
            spinning={queryDetailHeaderLoading || saveDetailLoading || false}
            wrapperClassName={classnames(
              DETAIL_DEFAULT_CLASSNAME,
              styles['received-send-order-detail']
            )}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={['orderHeaderInfo']}
              onChange={this.onCollapseChange.bind(this)}
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
              {poSourcePlatform === 'CATALOGUE' && (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl.get(`sodr.common.view.message.title.deliveryInfo`).d('收货/收单信息')}
                      </h3>
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
        <br />
        <Message {...messageProps} />
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        <WrapperBOMModal {...wrapperBOMModalProps} />
      </div>
    );
  }
}
